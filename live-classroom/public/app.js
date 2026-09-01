const weeks = window.COURSE_WEEKS || [];
const courseAttachments = window.COURSE_ATTACHMENTS || {};
const courseInteractions = window.COURSE_INTERACTIONS || {};
const totalCourseSlides = window.COURSE_TOTAL_SLIDES || weeks.reduce((sum, week) => sum + week.slides.length, 0);

const app = document.querySelector('#app');
const params = new URLSearchParams(location.search);
const instructorPath = location.pathname.replace(/\/+$/,'') === '/instructor';
const roomId = (params.get('room')||'').toUpperCase();
const requestedRole=params.get('role');
const role = instructorPath ? 'instructor' : requestedRole === 'teacher' && roomId ? 'teacher' : requestedRole === 'presenter' && roomId ? 'presenter' : roomId ? 'student' : 'landing';
const teacherKey = params.get('key') || '';
const studentNameKey=`student-name:${roomId}`;
const studentClientKey=`student-client:${roomId}`;
let studentName=roomId?sessionStorage.getItem(studentNameKey)||'':'';
let studentClientId=roomId?localStorage.getItem(studentClientKey)||'':'';
if(roomId&&!studentClientId){studentClientId=crypto.randomUUID();localStorage.setItem(studentClientKey,studentClientId)}
let instructorCode=sessionStorage.getItem('instructor-access-code')||'';
let socket, connected=false, state={deck:'week01',slide:0,revealed:false,showResponses:false,timerEnd:null},presence={students:0,completed:0,responded:0,presenters:0},activity={deck:'week01',slide:0,responses:[]},roster=[],questions=[],myQuestions=[],completed=false,retry=0,timerHandle,clockHandle,activityTimer;

function landing(){
  app.innerHTML=`<section class="landing student-entry"><div class="landing-inner"><p class="eyebrow">CLOUD MLOPS · LIVE CLASSROOM</p><h1>이름과 수업 코드를<br>입력하세요.</h1><p class="lead">출석부에서 확인할 이름과 강사가 알려준 여섯 자리 코드를 입력하면 현재 수업 화면으로 연결됩니다.</p><div class="entry-grid single"><form class="entry-card" id="joinForm"><h2>학생용 수업 참여</h2><label>이름<input class="name-input" id="studentName" maxlength="24" autocomplete="name" placeholder="예: 홍길동" required></label><label>수업 코드<input id="roomInput" maxlength="6" autocomplete="off" placeholder="예: A1B2C3" required></label><button class="primary">출석하고 수업 참여</button><small class="privacy-note">이름과 참여 기록은 해당 수업의 출석·질답 확인에만 사용되며 수업 세션 만료 시 삭제됩니다.</small></form></div></div></section>`;
  document.querySelector('#joinForm').onsubmit=e=>{e.preventDefault();const code=document.querySelector('#roomInput').value.trim().toUpperCase(),name=document.querySelector('#studentName').value.trim();if(code.length===6&&name){sessionStorage.setItem(`student-name:${code}`,name.slice(0,24));location.href=`/?room=${encodeURIComponent(code)}`}};
}

function studentIdentity(){
  app.innerHTML=`<section class="landing student-entry"><div class="landing-inner"><p class="eyebrow">수업 코드 ${safe(roomId)}</p><h1>출석할 이름을<br>입력하세요.</h1><p class="lead">강사 화면의 출석 명단과 참여 기록에 표시될 이름입니다.</p><div class="entry-grid single"><form class="entry-card" id="studentIdentity"><label>이름<input class="name-input" id="studentName" maxlength="24" autocomplete="name" placeholder="예: 홍길동" required></label><button class="primary">출석하고 입장</button><small class="privacy-note">이름과 참여 기록은 해당 수업의 출석·질답 확인에만 사용되며 수업 세션 만료 시 삭제됩니다.</small></form></div></div></section>`;
  document.querySelector('#studentIdentity').onsubmit=e=>{e.preventDefault();const name=document.querySelector('#studentName').value.trim();if(!name)return;sessionStorage.setItem(studentNameKey,name.slice(0,24));location.reload()};
}

async function createRoom(){
  const button=document.querySelector('#createRoom');button.disabled=true;button.textContent='수업 만드는 중…';
  try{const response=await instructorFetch('/api/rooms',{method:'POST'});if(!response.ok)throw new Error();const room=await response.json();location.href=`/?room=${room.roomId}&role=teacher&key=${encodeURIComponent(room.teacherKey)}`}
  catch{button.disabled=false;button.textContent='다시 시도';showPortalMessage('수업을 만들지 못했습니다. 접근 코드를 다시 확인해 주세요.','error');}
}

function instructorFetch(url,options={}){return fetch(url,{...options,headers:{...(options.headers||{}),authorization:`Bearer ${instructorCode}`,'content-type':'application/json'}})}
function showPortalMessage(message,type=''){const area=document.querySelector('#portalMessage');if(area){area.textContent=message;area.className=`portal-message ${type}`}}
function formatTime(value){return value?new Intl.DateTimeFormat('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(value)):'시간 정보 없음'}
function instructorLogin(message=''){
  app.innerHTML=`<section class="landing instructor-login"><div class="landing-inner"><p class="eyebrow">INSTRUCTOR PORTAL</p><h1>강사 수업 관리</h1><p class="lead">강사 전용 접근 코드를 입력해야 새 수업을 만들거나 진행 중인 수업에 다시 참여할 수 있습니다.</p><div class="entry-grid single"><form class="entry-card" id="instructorLogin"><h2>강사 인증</h2><p>관리자에게 전달받은 강사 접근 코드를 입력하세요.</p><input id="instructorCode" type="password" autocomplete="current-password" placeholder="강사 접근 코드" required><button class="primary">강사 화면 열기</button><div class="portal-message error">${safe(message)}</div></form></div></div></section>`;
  document.querySelector('#instructorLogin').onsubmit=e=>{e.preventDefault();instructorCode=document.querySelector('#instructorCode').value.trim();sessionStorage.setItem('instructor-access-code',instructorCode);loadInstructorPortal()};
}
async function loadInstructorPortal(){
  if(!instructorCode)return instructorLogin();
  app.innerHTML='<section class="portal-loading">진행 중인 수업을 불러오는 중…</section>';
  const response=await instructorFetch('/api/instructor/rooms');
  if(response.status===401||response.status===503){sessionStorage.removeItem('instructor-access-code');instructorCode='';return instructorLogin(response.status===503?'강사 접근 코드가 서버에 설정되지 않았습니다.':'강사 접근 코드가 올바르지 않습니다.')}
  if(!response.ok)return instructorLogin('수업 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
  const {rooms=[]}=await response.json();
  app.innerHTML=`<section class="instructor-portal"><header class="portal-header"><div><p class="eyebrow">INSTRUCTOR PORTAL</p><h1>강사 수업 관리</h1><p>새 수업을 시작하거나, 진행 중인 수업에 강사로 다시 참여하세요.</p></div><div class="portal-header-actions"><button class="secondary" id="refreshRooms">목록 새로고침</button><button class="secondary" id="lockPortal">강사 화면 잠금</button><button class="primary" id="createRoom">새 수업 시작</button></div></header><div id="portalMessage" class="portal-message"></div><div class="portal-grid"><main><div class="section-heading"><h2>진행 중인 수업</h2><span>${rooms.length}개</span></div><div class="room-list">${rooms.length?rooms.map(roomCard).join(''):'<div class="empty-room"><strong>진행 중인 수업이 없습니다.</strong><p>‘새 수업 시작’을 누르면 수업 코드가 생성됩니다.</p></div>'}</div></main><aside class="register-card"><h2>기존 수업 등록</h2><p>목록에 없는 기존 수업은 강사용 URL에 들어 있던 수업 코드와 강사용 키로 다시 등록할 수 있습니다.</p><form id="registerRoom"><label>수업 코드<input id="existingRoom" maxlength="6" placeholder="예: A1B2C3" required></label><label>강사용 키<input id="existingKey" placeholder="강사용 URL의 key 값" required></label><button class="primary">확인하고 등록</button></form><details><summary>강사용 키는 어디에 있나요?</summary><p>기존 강사용 주소에서 <code>key=</code> 뒤에 있는 값을 복사하세요. 예: <code>/?room=A1B2C3&amp;role=teacher&amp;key=…</code></p></details></aside></div></section>`;
  document.querySelector('#createRoom').onclick=createRoom;
  document.querySelector('#refreshRooms').onclick=loadInstructorPortal;
  document.querySelector('#lockPortal').onclick=()=>{sessionStorage.removeItem('instructor-access-code');instructorCode='';instructorLogin()};
  document.querySelector('#registerRoom').onsubmit=registerExistingRoom;
}
function roomCard(room){const week=weeks.find(item=>item.id===room.state?.deck);const slide=(room.state?.slide||0)+1;const teacherUrl=`/?room=${encodeURIComponent(room.roomId)}&role=teacher&key=${encodeURIComponent(room.teacherKey)}`;return `<article class="room-card"><div class="room-code"><span>수업 코드</span><strong>${safe(room.roomId)}</strong></div><div class="room-details"><h3>${safe(week?.label||'수업')} · ${safe(week?.title||'진행 중')}</h3><p>${formatTime(room.createdAt)} 시작 · ${slide}/${week?.slides.length||'-'}장</p><div class="room-presence"><span>학생 ${room.students||0}명</span><span>강사 화면 ${room.teachers||0}개</span><span>PT 화면 ${room.presenters||0}개</span></div></div><a class="primary rejoin" href="${teacherUrl}">강사로 재참여</a></article>`}
async function registerExistingRoom(event){event.preventDefault();const button=event.currentTarget.querySelector('button');button.disabled=true;button.textContent='확인 중…';const roomId=document.querySelector('#existingRoom').value.trim().toUpperCase();const teacherKey=document.querySelector('#existingKey').value.trim();const response=await instructorFetch('/api/instructor/register',{method:'POST',body:JSON.stringify({roomId,teacherKey})});if(response.ok){await loadInstructorPortal();showPortalMessage(`${roomId} 수업을 목록에 등록했습니다.`,'success');return}const result=await response.json().catch(()=>({}));button.disabled=false;button.textContent='확인하고 등록';showPortalMessage(result.error||'기존 수업을 등록하지 못했습니다.','error')}

function connect(){
  if(!roomId)return;
  const protocol=location.protocol==='https:'?'wss:':'ws:';
  socket=new WebSocket(`${protocol}//${location.host}/api/rooms/${roomId}/ws?role=${role}&key=${encodeURIComponent(teacherKey)}`);
  socket.onopen=()=>{connected=true;retry=0;if(role==='student')send({type:'identify',clientId:studentClientId,name:studentName});render()};
  socket.onclose=()=>{connected=false;render();setTimeout(connect,Math.min(10000,800*2**retry++))};
  socket.onerror=()=>socket.close();
  socket.onmessage=event=>{const message=JSON.parse(event.data);if(message.type==='state'){const moved=state.deck!==message.state.deck||state.slide!==message.state.slide;state=message.state;if(moved)completed=false}if(message.type==='presence')presence=message;if(message.type==='activity')activity={deck:message.deck||state.deck,slide:message.slide,responses:message.responses||[]};if(message.type==='dashboard'){roster=message.students||[];questions=message.questions||[]}if(message.type==='my-questions')myQuestions=message.questions||[];if(message.type==='expired'){app.innerHTML='<section class="error"><h1>수업이 종료되었습니다</h1><p>강사에게 새 수업 코드를 받아주세요.</p></section>';return}if(message.type!=='activity'||role!=='student')render()};
}

function send(payload){if(socket?.readyState===WebSocket.OPEN)socket.send(JSON.stringify(payload))}
function control(changes){state={...state,...changes};send({type:'control',...changes});render()}
function safe(text=''){return text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}
function attr(text=''){return safe(String(text)).replaceAll('"','&quot;')}
function currentWeek(){return weeks.find(week=>week.id===state.deck)||weeks[0]}
function currentSlide(){const week=currentWeek();return week?.slides[state.slide]||week?.slides[0]}
function globalPosition(){const week=currentWeek();return weeks.slice(0,weeks.indexOf(week)).reduce((sum,item)=>sum+item.slides.length,0)+state.slide+1}
function resourceLinks(slide){if(!slide?.links?.length)return '';return `<div class="resource-links">${slide.links.map(link=>`<a href="${safe(link.url)}" target="_blank" rel="noopener">${safe(link.label)} ↗</a>`).join('')}</div>`}
function slideAttachments(){return courseAttachments[state.deck]?.[state.slide+1]||[]}
function attachmentLinks(){const files=slideAttachments();if(!files.length)return '';return `<div class="attachment-links"><strong>첨부파일</strong>${files.map(file=>`<a href="${safe(file.url)}" download="${safe(file.filename)}"><span>${safe(file.label)}</span><small>${safe(file.meta||file.filename)}</small></a>`).join('')}</div>`}
function currentInteraction(){return courseInteractions[state.deck]?.[state.slide+1]||null}

function taskInstruction(meta){
  if(meta.type==='demo')return '값을 바꿔 계산 API를 실행하고 결과가 어떻게 달라지는지 확인하세요.';
  const actions=[];
  if(meta.choices?.length)actions.push('보기에 답하기');
  if(meta.fields?.length)actions.push('응답 입력하기');
  if(meta.checklist?.length)actions.push('끝낸 항목 확인하기');
  if(actions.length)return `${actions.join(' · ')} 후 오른쪽 아래 ‘이 장표 완료’를 누르세요.`;
  if(meta.links?.length)return '내용을 확인하고 필요하면 공식 문서나 AWS 콘솔 링크를 여세요.';
  return '핵심 내용을 확인하고, 궁금한 점은 화면 아래 질문란에 남기세요.';
}

function taskBanner(meta,viewerRole){const label=viewerRole==='student'?'지금 할 일':viewerRole==='teacher'?'학생 화면 안내':'학생이 하는 일';return `<section class="task-banner ${viewerRole}"><strong>${label}</strong><span>${safe(taskInstruction(meta))}</span></section>`}

function interactionFields(meta,viewerRole){
  if(viewerRole!=='student'){
    const fields=(meta.fields||[]).map(field=>`<div class="preview-field"><strong>${safe(field.label)}</strong><span>${safe(field.placeholder||'학생이 내용을 입력합니다')}</span></div>`).join('');
    const choices=(meta.choices||[]).map(field=>`<div class="preview-choice"><strong>${safe(field.label)}</strong><div>${field.options.map(option=>`<span>${safe(option)}</span>`).join('')}</div></div>`).join('');
    const checklist=meta.checklist?.length?`<div class="preview-checklist"><strong>학생 확인 항목</strong>${meta.checklist.map(item=>`<span>□ ${safe(item)}</span>`).join('')}</div>`:'';
    return fields||choices||checklist?`<section class="participation-preview"><header><strong>학생 입력 화면</strong><span>읽기 전용 미리보기</span></header>${fields}${choices}${checklist}</section>`:'';
  }
  let html='';
  if(meta.fields?.length)html+=`<div class="fields">${meta.fields.map((field,index)=>{const store=`field-${state.deck}-${state.slide}-text-${index}`,value=localStorage.getItem(store)||'';return `<label class="field"><span>${safe(field.label)}</span><input data-field data-label="${attr(field.label)}" data-store="${attr(store)}" value="${attr(value)}" placeholder="${attr(field.placeholder||'')}" autocomplete="off"></label>`}).join('')}</div>`;
  if(meta.choices?.length)html+=meta.choices.map((field,index)=>{const store=`field-${state.deck}-${state.slide}-choice-${index}`,selected=localStorage.getItem(store)||'';return `<fieldset class="choice-field"><legend>${safe(field.label)}</legend><div>${field.options.map(option=>`<label><input type="radio" name="choice-${state.deck}-${state.slide}-${index}" data-field data-label="${attr(field.label)}" data-store="${attr(store)}" value="${attr(option)}" ${selected===option?'checked':''}><span>${safe(option)}</span></label>`).join('')}</div></fieldset>`}).join('');
  if(meta.checklist?.length)html+=`<fieldset class="checklist-field"><legend>직접 확인</legend><div>${meta.checklist.map((item,index)=>{const store=`field-${state.deck}-${state.slide}-check-${index}`,checked=localStorage.getItem(store)==='완료';return `<label><input type="checkbox" data-field data-label="${attr(item)}" data-store="${attr(store)}" value="완료" ${checked?'checked':''}><span>${safe(item)}</span></label>`}).join('')}</div></fieldset>`;
  return html;
}

function demoContent(viewerRole){
  if(viewerRole!=='student')return '<div class="participation-preview"><strong>학생 화면에서 실행</strong><div><span>새 제품 가격</span><span>사용 기간</span><span>배터리 성능</span><span>계산 API 응답</span></div></div>';
  return `<div class="demo-grid"><div class="demo-card"><label>새 제품 가격<input id="original" type="number" value="1500000"></label><label>사용 기간<select id="years"><option value="1">1년</option><option value="3" selected>3년</option><option value="5">5년</option></select></label><label>배터리 성능<input id="battery" type="number" value="78"></label><button class="primary" id="predict">계산 API 호출</button></div><div class="demo-card"><h2>서버 응답</h2><div class="price" id="price">—</div><p id="explain">버튼을 누르면 서버에 요청을 보냅니다.</p><pre id="json">POST /api/demo/predict\n\n요청 전</pre></div></div>`;
}

function interactiveSlideContent(meta,viewerRole){
  let body=`<p class="kicker">${safe(meta.kicker||'학생 참여')}${Number.isFinite(meta.minutes)?` <span>권장 ${meta.minutes}분</span>`:''}</p><h1>${safe(meta.title)}</h1>`;
  body+=taskBanner(meta,viewerRole);
  if(meta.copy)body+=`<p class="copy">${safe(meta.copy)}</p>`;
  if(meta.path)body+=`<div class="console-path"><strong>화면 이동</strong><span>${safe(meta.path)}</span></div>`;
  if(meta.visual)body+=`<figure class="lesson-visual"><img src="${safe(meta.visual)}" alt="${safe(meta.visualAlt||meta.title)}"><figcaption>${safe(meta.caption||'실제 화면에서 표시된 이름을 기준으로 찾으세요.')}</figcaption></figure>`;
  if(meta.items)body+=`<ul>${meta.items.map(item=>`<li>${safe(item)}</li>`).join('')}</ul>`;
  if(meta.code)body+=`<pre class="lesson-code"><code>${safe(meta.code)}</code></pre>`;
  if(meta.callout)body+=`<div class="lesson-callout">${safe(meta.callout)}</div>`;
  if(meta.links?.length)body+=`<div class="lesson-links">${meta.links.map(link=>`<a href="${safe(link.url)}" target="_blank" rel="noopener">${safe(link.label)} ↗</a>`).join('')}</div>`;
  if(meta.type==='demo')body+=demoContent(viewerRole);
  body+=interactionFields(meta,viewerRole);
  if(state.revealed&&meta.reveal)body+=`<div class="reveal">${safe(meta.reveal)}</div>`;
  body+=attachmentLinks();
  return body;
}

function slideContent(slide){const interaction=currentInteraction();return interaction?interactiveSlideContent(interaction,role):`<img class="deck-slide-image" src="${safe(slide.image)}" alt="${safe(slide.title)}" draggable="false">`}
function studentQuestionHistory(){if(!myQuestions.length)return '';return `<details class="student-question-history"><summary>내 질문 ${myQuestions.length}개</summary><div>${myQuestions.slice(-5).reverse().map(question=>`<article><strong>${safe(question.text)}</strong><span>${question.answer?`답변: ${safe(question.answer)}`:'강사 확인 전'}</span></article>`).join('')}</div></details>`}
function studentDock(slide){return `<form class="student-question-form" id="questionForm"><label for="studentQuestion">Q&amp;A</label><input id="studentQuestion" maxlength="300" placeholder="궁금한 점을 질문하세요" autocomplete="off"><button>질문 보내기</button></form>${studentQuestionHistory()}${attachmentLinks()}${resourceLinks(slide)}`}

function render(){
  if(role==='landing')return landing();
  const week=currentWeek();
  const slide=currentSlide();
  if(!week||!slide){app.innerHTML='<section class="error"><h1>수업 자료를 불러오지 못했습니다</h1><p>페이지를 새로고침해 주세요.</p></section>';return}
  const teacher=role==='teacher';
  const presenter=role==='presenter';
  const studentUrl=`${location.origin}/?room=${roomId}`;
  const presenterUrl=`${location.origin}/?room=${roomId}&role=presenter`;
  const shellClass=teacher?'teacher-shell':presenter?'viewer-shell presenter-shell':'viewer-shell student-shell';
  const roleLabel=teacher?'강사 제어용':presenter?'강사 PT용':'학생용';
  const participantLabel=role==='student'?` · ${safe(studentName)}`:'';
  const slideView=`<main class="slide-area"><article class="slide ${currentInteraction()?'interactive-slide':'deck-slide'}"><div class="slide-inner">${slideContent(slide)}</div></article></main>`;
  const stage=teacher?`<div class="teacher-stage">${slideView}${speakerNote(slide,week)}</div>`:slideView;
  const footer=role==='student'?studentDock(slide):'';
  const teacherLayout=teacher?`${teacherPanel(week)}${stage}${participationPanel(studentUrl,presenterUrl)}`:stage;
  app.innerHTML=`<div class="shell ${shellClass}"><header class="bar"><span class="brand">클라우드 MLOps</span><span class="room">${roomId}</span><span>${week.label} · ${roleLabel}${participantLabel}</span><span class="status"><i class="dot ${connected?'live':''}"></i>${connected?'실시간 연결':'다시 연결 중'}</span>${presenter?'<button class="presenter-fullscreen" id="presenterFullscreen">전체 화면</button>':''}</header><div class="workspace">${teacherLayout}</div><div class="foot-controls">${footer}</div>${state.timerEnd?'<div class="timer" id="timer"></div>':''}${presenter?presenterSummary():''}${presenter&&state.showResponses?activityBoard():''}${role==='student'?`<button class="complete-button ${completed?'done':''}" id="complete">${completed?'완료 취소':'이 장표 완료'}</button>`:''}</div>`;
  bindCommon();if(teacher)bindTeacher();else{if(role==='student')bindStudent();else bindPresenter();fitViewerSlide()}startTimer();startClock();
}

function teacherPanel(week){const percent=Math.round((state.slide+1)/week.slides.length*100);const global=globalPosition(),interaction=currentInteraction();return `<aside class="teacher-panel"><h2>수업 제어</h2><label class="week-picker-label" for="weekPicker">수업 주차</label><select class="week-picker" id="weekPicker">${weeks.map(item=>`<option value="${item.id}" ${item.id===week.id?'selected':''}>${item.label} · ${safe(item.title)} (${item.slides.length}장)</option>`).join('')}</select><section class="lesson-position" aria-label="수업 진행 위치"><div><span>현재 주차 슬라이드</span><strong>${state.slide+1} <small>/ ${week.slides.length}</small></strong></div><div class="lesson-clock"><span>현재 시각</span><time id="currentTime">--:--</time></div><div class="lesson-progress" aria-label="현재 주차 ${percent}% 진행"><span style="width:${percent}%"></span></div><p>전체 과정 ${global} / ${totalCourseSlides}${interaction?` · ${interaction.period}교시 · 권장 ${interaction.minutes}분`:''}</p></section><div class="control-group"><button id="prev" ${state.slide===0?'disabled':''}>← 이전</button><button id="next" ${state.slide===week.slides.length-1?'disabled':''}>다음 →</button>${interaction?.reveal?`<button class="wide" id="reveal">${state.revealed?'정답·예시 감추기':'정답·예시 공개'}</button>`:''}<button id="clearTimer">타이머 종료</button><button data-minutes="5">5분 타이머</button><button data-minutes="10">10분 타이머</button><div class="slide-jump wide"><input id="slideJump" type="number" min="1" max="${week.slides.length}" value="${state.slide+1}" aria-label="이동할 슬라이드 번호"><button id="jump">이동</button></div><button class="wide" id="first">첫 장면으로</button></div></aside>`}

function responseData(response,index){return response?.fields?{name:response.name||`학생 ${index+1}`,fields:response.fields}:{name:`학생 ${index+1}`,fields:response||{}}}
function teacherResponsePreview(){const rows=(activity.deck===state.deck&&activity.slide===state.slide?activity.responses:[]).flatMap((response,index)=>{const item=responseData(response,index);return Object.entries(item.fields).filter(([,value])=>value).map(([label,value])=>`<div class="teacher-response"><strong>${safe(item.name)} · ${safe(label)}</strong><span>${safe(value)}</span></div>`)}).slice(0,8);return `<section class="teacher-response-list"><div><strong>현재 장표 답안</strong><span>${rows.length?`${rows.length}개 표시`:'대기 중'}</span></div>${rows.length?rows.join(''):'<p>학생이 입력하면 이름과 답안이 여기에 표시됩니다.</p>'}</section>`}
function attendanceRoster(){return `<section class="attendance-roster"><header><strong>출석·참여도</strong><button id="exportAttendance">CSV</button></header>${roster.length?roster.map(student=>`<article><span class="presence-dot ${student.online?'online':''}"></span><div><strong>${safe(student.name)}</strong><small>${student.online?'접속 중':'연결 끊김'} · 완료 ${student.completedCount} · 답안 ${student.responseCount} · 질문 ${student.questionCount}</small></div><b>${student.participationScore}%</b></article>`).join(''):'<p>이름을 입력하고 들어온 학생이 여기에 표시됩니다.</p>'}</section>`}
function questionPanel(){return `<section class="teacher-questions"><header><strong>Q&amp;A</strong><span>${questions.filter(item=>!item.answer).length}개 답변 대기</span></header>${questions.length?questions.slice(-8).reverse().map(question=>`<article><div><strong>${safe(question.name)} · ${safe(question.weekLabel||question.deck)} ${Number(question.slide)+1}장</strong><p>${safe(question.text)}</p></div>${question.answer?`<div class="question-answer">답변: ${safe(question.answer)}</div>`:`<form data-question-id="${attr(question.id)}"><input maxlength="500" placeholder="답변을 입력하세요"><button>보내기</button></form>`}</article>`).join(''):'<p>학생 질문이 아직 없습니다.</p>'}</section>`}
function participationPanel(studentUrl,presenterUrl){return `<aside class="student-panel"><h2>학생 참여</h2><div class="metric-row"><div class="metric"><strong>${presence.students}</strong><span>접속 학생</span></div><div class="metric"><strong>${roster.length}</strong><span>출석 학생</span></div><div class="metric"><strong>${presence.responded||0}</strong><span>현재 답안</span></div><div class="metric"><strong>${presence.completed}</strong><span>장표 완료</span></div></div><div class="participation-actions"><button id="showResponses">${state.showResponses?'학생 응답 감추기':'학생 응답 공개'}</button></div>${teacherResponsePreview()}${attendanceRoster()}${questionPanel()}<div class="student-entry-card"><span>학생 접속</span><strong>0060.kr</strong><em>수업 코드 ${roomId}</em></div><div class="share-box"><strong>화면 접속 정보</strong><label>강사 PT 주소</label><div class="share-line"><input id="presenterUrl" readonly value="${presenterUrl}"><button id="copyPresenterUrl">복사</button></div><label>학생 접속 주소</label><div class="share-line"><input id="studentUrl" readonly value="${studentUrl}"><button id="copyUrl">복사</button></div><label>수업 코드</label><div class="share-line"><input readonly value="${roomId}"><button id="copyCode">복사</button></div></div></aside>`}

function speakerNote(slide,week){const meta=currentInteraction();const participation=meta&&(meta.fields?.length||meta.choices?.length||meta.checklist?.length)?'학생이 직접 입력·선택한 뒤 완료를 누르게 하고, 오른쪽 응답 현황을 확인합니다.':'';const note=meta?.note||[meta?.copy,participation,meta?.callout].filter(Boolean).join('\n');return `<section class="speaker-note" aria-label="발표자 노트"><div class="speaker-note-label"><strong>발표자 노트</strong><span>${week.label} · ${state.slide+1} / ${week.slides.length}${meta?` · ${meta.period}교시 · ${meta.minutes}분`:''}</span></div><p>${safe(note||slide.notes||'')}</p>${attachmentLinks()}${meta?.links?.length?`<div class="resource-links">${meta.links.map(link=>`<a href="${safe(link.url)}" target="_blank" rel="noopener">${safe(link.label)} ↗</a>`).join('')}</div>`:resourceLinks(slide)}</section>`}

function presenterSummary(){const total=Math.max(1,presence.students),percent=Math.round(presence.completed/total*100);return `<div class="live-summary"><span>응답 ${presence.responded||0}명</span><span>완료 ${presence.completed}/${presence.students}</span><span class="live-progress"><span style="width:${percent}%"></span></span></div><div class="join-callout"><span>학생 접속</span><strong>0060.kr</strong><em>수업 코드 ${roomId}</em></div>`}
function activityBoard(){const rows=(activity.deck===state.deck&&activity.slide===state.slide?activity.responses:[]).flatMap((response,index)=>{const item=responseData(response,index);return Object.entries(item.fields).filter(([,value])=>value).map(([label,value])=>`<div class="response-card"><strong>학생 ${index+1} · ${safe(label)}</strong><span>${safe(value)}</span></div>`)});return `<aside class="activity-board"><h2>학생 실시간 답안</h2>${rows.length?rows.join(''):'<p class="response-empty">아직 입력된 답안이 없습니다.</p>'}</aside>`}

function bindCommon(){
  const publish=()=>{const fields={};document.querySelectorAll('[data-field]').forEach(field=>{if(field.type==='radio'&&!field.checked)return;const value=field.type==='checkbox'?(field.checked?'완료':''):field.value;if(field.dataset.store)localStorage.setItem(field.dataset.store,value);if(value)fields[field.dataset.label||'학생 응답']=value});clearTimeout(activityTimer);activityTimer=setTimeout(()=>send({type:'activity',deck:state.deck,slide:state.slide,fields}),250)};
  document.querySelectorAll('[data-field]').forEach(input=>{input.oninput=publish;input.onchange=publish});
  const predict=document.querySelector('#predict');if(predict)predict.onclick=async()=>{predict.disabled=true;predict.textContent='계산 중…';const payload={originalPrice:Number(document.querySelector('#original').value),years:Number(document.querySelector('#years').value),battery:Number(document.querySelector('#battery').value)};try{const response=await fetch('/api/demo/predict',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});const result=await response.json();if(!response.ok)throw new Error(result.error||'계산 실패');document.querySelector('#price').textContent=new Intl.NumberFormat('ko-KR').format(result.calculatedPrice)+'원';document.querySelector('#explain').textContent='브라우저가 서버의 계산 API에서 결과를 받았습니다. 이 API는 규칙 계산기이며 ML 모델은 아닙니다.';document.querySelector('#json').textContent=JSON.stringify(result,null,2)}catch(error){document.querySelector('#explain').textContent=error.message}finally{predict.disabled=false;predict.textContent='다시 계산'}};
}

function bindTeacher(){
  document.querySelector('#weekPicker').onchange=event=>control({deck:event.target.value,slide:0});
  document.querySelector('#prev').onclick=()=>control({slide:state.slide-1});document.querySelector('#next').onclick=()=>control({slide:state.slide+1});document.querySelector('#first').onclick=()=>control({slide:0});document.querySelector('#clearTimer').onclick=()=>control({timerEnd:null});
  document.querySelector('#showResponses').onclick=()=>control({showResponses:!state.showResponses});
  const reveal=document.querySelector('#reveal');if(reveal)reveal.onclick=()=>control({revealed:!state.revealed});
  document.querySelector('#jump').onclick=()=>{const week=currentWeek(),number=Math.max(1,Math.min(week.slides.length,Number(document.querySelector('#slideJump').value)||1));control({slide:number-1})};
  document.querySelectorAll('[data-minutes]').forEach(button=>button.onclick=()=>control({timerEnd:Date.now()+Number(button.dataset.minutes)*60000}));
  document.querySelector('#copyPresenterUrl').onclick=()=>navigator.clipboard.writeText(document.querySelector('#presenterUrl').value);document.querySelector('#copyUrl').onclick=()=>navigator.clipboard.writeText(document.querySelector('#studentUrl').value);document.querySelector('#copyCode').onclick=()=>navigator.clipboard.writeText(roomId);
  document.querySelectorAll('.teacher-questions form').forEach(form=>form.onsubmit=event=>{event.preventDefault();const input=form.querySelector('input'),answer=input.value.trim();if(answer)send({type:'answer-question',questionId:form.dataset.questionId,answer})});
  const exportButton=document.querySelector('#exportAttendance');if(exportButton)exportButton.onclick=exportAttendance;
}
function exportAttendance(){const cell=value=>{let text=String(value??'');if(/^[=+\-@]/.test(text))text=`'${text}`;return `"${text.replaceAll('"','""')}"`};const rows=[['이름','접속 상태','최초 입장','마지막 활동','확인한 장표','완료 장표','답안 장표','질문','참여도'],...roster.map(student=>[student.name,student.online?'접속 중':'연결 끊김',formatTime(student.firstJoinedAt),formatTime(student.lastActiveAt),student.visitedCount,student.completedCount,student.responseCount,student.questionCount,`${student.participationScore}%`])];const blob=new Blob([`\ufeff${rows.map(row=>row.map(cell).join(',')).join('\n')}`],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`${roomId}-attendance.csv`;link.click();URL.revokeObjectURL(url)}
function bindStudent(){document.querySelector('#complete').onclick=()=>{completed=!completed;send({type:'complete',completed});render()};const form=document.querySelector('#questionForm');if(form)form.onsubmit=event=>{event.preventDefault();const input=document.querySelector('#studentQuestion'),text=input.value.trim();if(!text)return;send({type:'question',text,deck:state.deck,slide:state.slide});input.value='';input.placeholder='질문을 보냈습니다.'}}
function bindPresenter(){document.querySelector('#presenterFullscreen').onclick=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()}
function fitViewerSlide(){
  const slide=document.querySelector('.viewer-shell .slide'),inner=document.querySelector('.viewer-shell .slide-inner');if(!slide||!inner)return;
  inner.style.transform='none';
  const style=getComputedStyle(slide),available=slide.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom);
  const scale=Math.min(1,available/inner.scrollHeight);
  inner.style.transform=`scale(${scale})`;
}
function startTimer(){clearInterval(timerHandle);if(!state.timerEnd)return;const tick=()=>{const el=document.querySelector('#timer');if(!el)return;const left=Math.max(0,state.timerEnd-Date.now()),m=Math.floor(left/60000),s=Math.floor(left%60000/1000);el.textContent=`남은 시간 ${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;el.classList.toggle('urgent',left<60000);if(left===0)clearInterval(timerHandle)};tick();timerHandle=setInterval(tick,1000)}
function startClock(){clearInterval(clockHandle);const tick=()=>{const el=document.querySelector('#currentTime');if(el)el.textContent=new Intl.DateTimeFormat('ko-KR',{hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date())};tick();if(document.querySelector('#currentTime'))clockHandle=setInterval(tick,1000)}
window.addEventListener('resize',()=>{if(role==='student'||role==='presenter')fitViewerSlide()});
document.addEventListener('keydown',e=>{if(role!=='teacher'||e.target.matches('input,select'))return;const last=currentWeek().slides.length-1;if(e.key==='ArrowRight'&&state.slide<last)control({slide:state.slide+1});if(e.key==='ArrowLeft'&&state.slide>0)control({slide:state.slide-1})});
role==='landing'?landing():role==='instructor'?loadInstructorPortal():role==='student'&&!studentName?studentIdentity():(render(),connect());
