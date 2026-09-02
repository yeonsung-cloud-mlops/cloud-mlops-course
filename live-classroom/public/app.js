window.COURSE_INTERACTIONS = {};
window.COURSE_ATTACHMENTS = {};
window.loadCourseWeek = async function loadCourseWeek(weekId) {
  const week = window.COURSE_WEEKS?.find((item) => item.id === weekId);
  if (!week) throw new Error(`알 수 없는 주차입니다: ${weekId}`);
  if (Array.isArray(week.slides)) return week;
  if (week.loading) return week.loading;
  week.loading = fetch(`/course-weeks/${weekId}.json`)
    .then((response) => {
      if (!response.ok) throw new Error(`${week.label} 자료를 받지 못했습니다.`);
      return response.json();
    })
    .then((data) => {
      week.slides = data.slides;
      window.COURSE_INTERACTIONS[weekId] = data.interactions || {};
      window.COURSE_ATTACHMENTS[weekId] = data.attachments || {};
      delete week.loading;
      return week;
    })
    .catch((error) => {
      delete week.loading;
      throw error;
    });
  return week.loading;
};

const weeks = window.COURSE_WEEKS || [];
const courseAttachments = window.COURSE_ATTACHMENTS || {};
const courseInteractions = window.COURSE_INTERACTIONS || {};
const totalCourseSlides = window.COURSE_TOTAL_SLIDES || weeks.reduce((sum, week) => sum + (week.slideCount || week.slides?.length || 0), 0);

const app = document.querySelector('#app');
const params = new URLSearchParams(location.search);
const instructorPath = location.pathname.replace(/\/+$/,'') === '/instructor';
const roomId = (params.get('room')||'').toUpperCase();
const requestedRole=params.get('role');
const role = instructorPath ? 'instructor' : requestedRole === 'teacher' && roomId ? 'teacher' : requestedRole === 'presenter' && roomId ? 'presenter' : roomId ? 'student' : 'landing';
const teacherKey = params.get('key') || '';
const studentNameKey=`student-name:${roomId}`;
const studentIdKey=`student-id:${roomId}`;
const studentTokenKey=`student-token:${roomId}`;
const studentClientKey=`student-client:${roomId}`;
let studentName=roomId?localStorage.getItem(studentNameKey)||'':'';
let studentId=roomId?localStorage.getItem(studentIdKey)||'':'';
let studentToken=roomId?localStorage.getItem(studentTokenKey)||'':'';
let studentClientId=roomId?localStorage.getItem(studentClientKey)||'':'';
if(roomId&&!studentClientId){studentClientId=crypto.randomUUID();localStorage.setItem(studentClientKey,studentClientId)}
let instructorCode=sessionStorage.getItem('instructor-access-code')||'';
let socket, connected=false, state={deck:'week01',slide:0,revealed:false,showResponses:false,timerEnd:null},studentHistorySlide=null,presence={students:0,completed:0,responded:0,presenters:0},activity={deck:'week01',slide:0,responses:[]},activitySummaries={},roster=[],enrollment=[],className='',questions=[],myQuestions=[],teams={locked:false,items:[]},teamPanelOpen=false,teamMessage='',completed=false,retry=0,timerHandle,clockHandle,activityTimer;
const weekSlideCount=week=>week?.slideCount||week?.slides?.length||0;
const ensureWeekLoaded=weekId=>window.loadCourseWeek(weekId);

function landing(){
  app.innerHTML=`<section class="landing student-entry"><div class="landing-inner"><p class="eyebrow">CLOUD MLOPS · LIVE CLASSROOM</p><h1>수업에 출석하고<br>바로 참여하세요.</h1><p class="lead">강사가 알려준 수업 코드와 본인의 학번·이름을 입력하세요. 사전 수강 명단과 일치해야 입장할 수 있습니다.</p><div class="entry-grid single"><form class="entry-card" id="joinForm"><h2>학생용 수업 참여</h2><label>학번<input id="studentId" inputmode="numeric" maxlength="12" autocomplete="username" placeholder="학번을 입력하세요" required></label><label>이름<input class="name-input" id="studentName" maxlength="24" autocomplete="name" placeholder="예: 홍길동" required></label><label>수업 코드<input id="roomInput" maxlength="6" autocomplete="off" placeholder="예: A1B2C3" required></label><button class="primary">출석하고 수업 참여</button><div id="joinMessage" class="portal-message error"></div><small class="privacy-note">학번·이름·팀·참여 기록은 출석과 수업 운영에만 사용되며 수업 생성 8주 후 삭제됩니다.</small></form></div></div></section>`;
  document.querySelector('#joinForm').onsubmit=event=>authorizeStudent(event,document.querySelector('#roomInput').value.trim().toUpperCase());
}

function studentIdentity(){
  app.innerHTML=`<section class="landing student-entry"><div class="landing-inner"><p class="eyebrow">수업 코드 ${safe(roomId)}</p><h1>학번과 이름을 입력하고<br>수업에 참여하세요.</h1><p class="lead">본인의 학번과 이름을 정확히 입력하세요.</p><div class="entry-grid single"><form class="entry-card" id="studentIdentity"><label>학번<input id="studentId" inputmode="numeric" maxlength="12" autocomplete="username" required></label><label>이름<input class="name-input" id="studentName" maxlength="24" autocomplete="name" required></label><button class="primary">출석하고 입장</button><div id="joinMessage" class="portal-message error"></div><small class="privacy-note">학번·이름·팀·참여 기록은 출석과 수업 운영에만 사용되며 수업 생성 8주 후 삭제됩니다.</small></form></div></div></section>`;
  document.querySelector('#studentIdentity').onsubmit=event=>authorizeStudent(event,roomId);
}

async function authorizeStudent(event,code){event.preventDefault();const form=event.currentTarget,button=form.querySelector('button'),id=form.querySelector('#studentId').value.trim(),name=form.querySelector('#studentName').value.trim(),message=form.querySelector('#joinMessage');if(!/^\d{8,12}$/.test(id)||!name||!/^[A-Z0-9]{6}$/.test(code)){message.textContent='학번, 이름, 여섯 자리 수업 코드를 확인해 주세요.';return}let clientId=localStorage.getItem(`student-client:${code}`);if(!clientId){clientId=crypto.randomUUID();localStorage.setItem(`student-client:${code}`,clientId)}button.disabled=true;button.textContent='수강 명단 확인 중…';try{const response=await fetch(`/api/rooms/${code}/join`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({studentId:id,name,clientId})});const result=await response.json();if(!response.ok)throw new Error(result.error||'입장할 수 없습니다.');localStorage.setItem(`student-id:${code}`,id);localStorage.setItem(`student-name:${code}`,result.name||name);localStorage.setItem(`student-token:${code}`,result.token);location.href=`/?room=${encodeURIComponent(code)}`}catch(error){message.textContent=error.message;button.disabled=false;button.textContent='다시 확인하고 입장'}}

async function createRoom(){
  const button=document.querySelector('#createRoom');button.disabled=true;button.textContent='수업 만드는 중…';
  const cohortId=document.querySelector('#cohortPicker')?.value||'';
  try{const response=await instructorFetch('/api/rooms',{method:'POST',body:JSON.stringify({cohortId})});const room=await response.json();if(!response.ok)throw new Error(room.error);location.href=`/?room=${room.roomId}&role=teacher&week=week01&key=${encodeURIComponent(room.teacherKey)}`}
  catch(error){button.disabled=false;button.textContent='선택한 반 수업 시작';showPortalMessage(error.message||'수업을 만들지 못했습니다. 접근 코드를 다시 확인해 주세요.','error');}
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
  const cohortResponse=await instructorFetch('/api/instructor/cohorts');
  const {cohorts=[]}=cohortResponse.ok?await cohortResponse.json():{cohorts:[]};
  app.innerHTML=`<section class="instructor-portal"><header class="portal-header"><div><p class="eyebrow">INSTRUCTOR PORTAL</p><h1>강사 수업 관리</h1><p>수업할 반을 선택해 수강 명단을 불러오거나, 진행 중인 수업에 다시 참여하세요.</p></div><div class="portal-header-actions"><button class="secondary" id="refreshRooms">목록 새로고침</button><button class="secondary" id="lockPortal">강사 화면 잠금</button></div></header><div id="portalMessage" class="portal-message"></div><div class="portal-grid"><main><div class="section-heading"><h2>진행 중인 수업</h2><span>${rooms.length}개</span></div><div class="room-list">${rooms.length?rooms.map(roomCard).join(''):'<div class="empty-room"><strong>진행 중인 수업이 없습니다.</strong><p>오른쪽에서 반을 선택해 새 수업을 시작하세요.</p></div>'}</div></main><aside><section class="register-card"><h2>새 수업 시작</h2><p>반을 선택하면 사전 수강 명단 전체를 출석 대상으로 불러옵니다.</p><label>수업할 반<select id="cohortPicker">${cohorts.map(cohort=>`<option value="${attr(cohort.id)}">${safe(cohort.label)} · ${cohort.count}명</option>`).join('')}</select></label><button class="primary" id="createRoom" ${cohorts.length?'':'disabled'}>${cohorts.length?'선택한 반 수업 시작':'등록된 명단 없음'}</button></section><section class="register-card"><h2>기존 수업 등록</h2><p>목록에 없는 기존 수업은 강사용 URL에 들어 있던 수업 코드와 강사용 키로 다시 등록할 수 있습니다.</p><form id="registerRoom"><label>수업 코드<input id="existingRoom" maxlength="6" placeholder="예: A1B2C3" required></label><label>강사용 키<input id="existingKey" placeholder="강사용 URL의 key 값" required></label><button class="primary">확인하고 등록</button></form><details><summary>강사용 키는 어디에 있나요?</summary><p>기존 강사용 주소에서 <code>key=</code> 뒤에 있는 값을 복사하세요.</p></details></section></aside></div></section>`;
  document.querySelector('#createRoom').onclick=createRoom;
  document.querySelector('#refreshRooms').onclick=loadInstructorPortal;
  document.querySelector('#lockPortal').onclick=()=>{sessionStorage.removeItem('instructor-access-code');instructorCode='';instructorLogin()};
  document.querySelector('#registerRoom').onsubmit=registerExistingRoom;
}
function roomCard(room){const week=weeks.find(item=>item.id===room.state?.deck);const slide=(room.state?.slide||0)+1;const teacherUrl=`/?room=${encodeURIComponent(room.roomId)}&role=teacher&week=${encodeURIComponent(week?.id||'week01')}&key=${encodeURIComponent(room.teacherKey)}`;return `<article class="room-card"><div class="room-code"><span>${safe(room.className||'수업 코드')}</span><strong>${safe(room.roomId)}</strong></div><div class="room-details"><h3>${safe(week?.label||'수업')} · ${safe(week?.title||'진행 중')}</h3><p>${formatTime(room.createdAt)} 시작 · ${slide}/${weekSlideCount(week)||'-'}장 · ${formatTime(room.expiresAt)}까지 유지</p><div class="room-presence"><span>출석 ${room.attendance||0}/${room.rosterCount||0}명</span><span>현재 접속 ${room.students||0}명</span><span>PT 화면 ${room.presenters||0}개</span></div></div><a class="primary rejoin" href="${teacherUrl}">강사로 재참여</a></article>`}
async function registerExistingRoom(event){event.preventDefault();const button=event.currentTarget.querySelector('button');button.disabled=true;button.textContent='확인 중…';const roomId=document.querySelector('#existingRoom').value.trim().toUpperCase();const teacherKey=document.querySelector('#existingKey').value.trim();const response=await instructorFetch('/api/instructor/register',{method:'POST',body:JSON.stringify({roomId,teacherKey})});if(response.ok){await loadInstructorPortal();showPortalMessage(`${roomId} 수업을 목록에 등록했습니다.`,'success');return}const result=await response.json().catch(()=>({}));button.disabled=false;button.textContent='확인하고 등록';showPortalMessage(result.error||'기존 수업을 등록하지 못했습니다.','error')}

function connect(){
  if(!roomId)return;
  const protocol=location.protocol==='https:'?'wss:':'ws:';
  socket=new WebSocket(`${protocol}//${location.host}/api/rooms/${roomId}/ws?role=${role}&key=${encodeURIComponent(teacherKey)}&token=${encodeURIComponent(studentToken)}`);
  socket.onopen=()=>{connected=true;retry=0;if(currentWeek()?.slides)render()};
  socket.onclose=()=>{connected=false;if(currentWeek()?.slides)render();setTimeout(connect,Math.min(10000,800*2**retry++))};
  socket.onerror=()=>socket.close();
  socket.onmessage=async event=>{const message=JSON.parse(event.data);if(message.type==='state'){const previousDeck=state.deck,moved=state.deck!==message.state.deck||state.slide!==message.state.slide;state=message.state;if(previousDeck!==state.deck)studentHistorySlide=null;if(roomId)localStorage.setItem(`room-week:${roomId}`,state.deck);if(moved)completed=false;if(!currentWeek()?.slides){app.innerHTML='<div class="boot">해당 주차 수업 자료를 불러오고 있습니다.</div>';try{await ensureWeekLoaded(state.deck)}catch{app.innerHTML='<section class="error"><h1>수업 자료를 불러오지 못했습니다</h1><p>네트워크 연결을 확인한 뒤 새로고침해 주세요.</p></section>';return}}}if(message.type==='presence')presence=message;if(message.type==='activity')activity={deck:message.deck||state.deck,slide:message.slide,responses:message.responses||[]};if(message.type==='activity-summary')activitySummaries[`${message.deck}:${message.slide}`]=message;if(message.type==='dashboard'){roster=message.students||[];enrollment=message.enrollment||[];className=message.className||'';questions=message.questions||[];if(message.teams)teams={...teams,items:message.teams}}if(message.type==='teams'){teams={locked:Boolean(message.locked),items:message.items||[]};teamMessage=''}if(message.type==='team-error'){teamMessage=message.message||'팀 구성을 처리하지 못했습니다.'}if(message.type==='my-questions')myQuestions=message.questions||[];if(message.type==='expired'){app.innerHTML='<section class="error"><h1>수업이 종료되었습니다</h1><p>강사에게 새 수업 코드를 받아주세요.</p></section>';return}if((message.type!=='activity'||role!=='student')&&currentWeek()?.slides)render()};
}

function send(payload){if(socket?.readyState===WebSocket.OPEN)socket.send(JSON.stringify(payload))}
function control(changes){state={...state,...changes};send({type:'control',...changes});render()}
function safe(text=''){return text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}
function attr(text=''){return safe(String(text)).replaceAll('"','&quot;')}
function currentWeek(){return weeks.find(week=>week.id===state.deck)||weeks[0]}
function viewedSlideIndex(){return role==='student'&&studentHistorySlide!==null?studentHistorySlide:state.slide}
function viewingHistory(){return role==='student'&&studentHistorySlide!==null&&studentHistorySlide!==state.slide}
function currentSlide(){const week=currentWeek();return week?.slides[viewedSlideIndex()]||week?.slides[0]}
function globalPosition(){const week=currentWeek();return weeks.slice(0,weeks.indexOf(week)).reduce((sum,item)=>sum+weekSlideCount(item),0)+state.slide+1}
function resourceLinks(slide){if(!slide?.links?.length)return '';return `<div class="resource-links">${slide.links.map(link=>`<a href="${safe(link.url)}" target="_blank" rel="noopener">${safe(link.label)} ↗</a>`).join('')}</div>`}
function slideAttachments(){return courseAttachments[state.deck]?.[viewedSlideIndex()+1]||[]}
function attachmentLinks(){const files=slideAttachments();if(!files.length)return '';return `<div class="attachment-links"><strong>첨부파일</strong>${files.map(file=>`<a href="${safe(file.url)}" download="${safe(file.filename)}"><span>${safe(file.label)}</span><small>${safe(file.meta||file.filename)}</small></a>`).join('')}</div>`}
function currentInteraction(){return courseInteractions[state.deck]?.[viewedSlideIndex()+1]||null}

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

function taskBanner(meta,viewerRole){const hasAction=meta.type==='demo'||meta.fields?.length||meta.choices?.length||meta.checklist?.length||meta.task;if(!hasAction)return '';const label=viewerRole==='student'?'지금 할 일':viewerRole==='teacher'?'학생 화면 안내':viewerRole==='history'?'지난 활동 내용':'학생이 하는 일';return `<section class="task-banner ${viewerRole}"><strong>${label}</strong><span>${safe(meta.task||taskInstruction(meta))}</span></section>`}

function interactionFields(meta,viewerRole){
  if(viewerRole!=='student'){
    if(meta.diagnostic)return `<section class="participation-preview diagnostic-preview"><header><strong>학생 입력 화면</strong><span>${meta.choices.length}문항 · 문항마다 ‘모르겠다’ 포함</span></header><div>${meta.choices.map(field=>`<span>${safe(field.label)}</span>`).join('')}</div></section>`;
    const fields=(meta.fields||[]).map(field=>`<div class="preview-field"><strong>${safe(field.label)}</strong><span>${safe(field.placeholder||'학생이 내용을 입력합니다')}</span></div>`).join('');
    const choices=(meta.choices||[]).map(field=>`<div class="preview-choice"><strong>${safe(field.label)}</strong><div>${field.options.map(option=>`<span>${safe(option)}</span>`).join('')}</div></div>`).join('');
    const checklist=meta.checklist?.length?`<div class="preview-checklist"><strong>학생 확인 항목</strong>${meta.checklist.map(item=>`<span>□ ${safe(item)}</span>`).join('')}</div>`:'';
    return fields||choices||checklist?`<section class="participation-preview"><header><strong>학생 입력 화면</strong><span>읽기 전용 미리보기</span></header>${fields}${choices}${checklist}</section>`:'';
  }
  let html='';
  if(meta.fields?.length)html+=`<div class="fields">${meta.fields.map((field,index)=>{const store=`field-${state.deck}-${state.slide}-text-${index}`,value=localStorage.getItem(store)||'';return `<label class="field"><span>${safe(field.label)}</span><input data-field data-label="${attr(field.label)}" data-store="${attr(store)}" value="${attr(value)}" placeholder="${attr(field.placeholder||'')}" autocomplete="off"></label>`}).join('')}</div>`;
  if(meta.choices?.length){const choices=meta.choices.map((field,index)=>{const store=`field-${state.deck}-${state.slide}-choice-${index}`,selected=localStorage.getItem(store)||'';return `<fieldset class="choice-field"><legend>${safe(field.label)}</legend><div>${field.options.map(option=>`<label><input type="radio" name="choice-${state.deck}-${state.slide}-${index}" data-field data-label="${attr(field.label)}" data-store="${attr(store)}" value="${attr(option)}" ${selected===option?'checked':''}><span>${safe(option)}</span></label>`).join('')}</div></fieldset>`}).join('');html+=meta.diagnostic?`<div class="diagnostic-grid">${choices}</div>`:choices}
  if(meta.checklist?.length)html+=`<fieldset class="checklist-field"><legend>직접 확인</legend><div>${meta.checklist.map((item,index)=>{const store=`field-${state.deck}-${state.slide}-check-${index}`,checked=localStorage.getItem(store)==='완료';return `<label><input type="checkbox" data-field data-label="${attr(item)}" data-store="${attr(store)}" value="완료" ${checked?'checked':''}><span>${safe(item)}</span></label>`}).join('')}</div></fieldset>`;
  return html;
}

function demoContent(viewerRole){
  if(viewerRole!=='student')return '<div class="participation-preview"><strong>학생 화면에서 실행</strong><div><span>새 제품 가격</span><span>사용 기간</span><span>배터리 성능</span><span>계산 API 응답</span></div></div>';
  return `<div class="demo-grid"><div class="demo-card"><label>새 제품 가격<input id="original" type="number" value="1500000"></label><label>사용 기간<select id="years"><option value="1">1년</option><option value="3" selected>3년</option><option value="5">5년</option></select></label><label>배터리 성능<input id="battery" type="number" value="78"></label><button class="primary" id="predict">계산 API 호출</button></div><div class="demo-card"><h2>서버 응답</h2><div class="price" id="price">—</div><p id="explain">버튼을 누르면 서버에 요청을 보냅니다.</p><pre id="json">POST /api/demo/predict\n\n요청 전</pre></div></div>`;
}

function teamSlideWidget(viewerRole){
  const confirmed=teams.items.filter(team=>team.confirmed).length;
  if(viewerRole==='student'){
    const mine=currentStudentTeam();
    return `<section class="team-slide-widget"><div><strong>${mine?safe(mine.name):'아직 팀이 없습니다'}</strong><span>${mine?`${teamMemberCount(mine)}/4명 · ${teamStatus(mine)}`:'팀을 만들거나 팀 코드로 참여하세요.'}</span></div><button data-open-team>${mine?'내 팀 확인':'팀 구성 시작'}</button></section>`;
  }
  return `<section class="team-slide-board"><header><strong>실시간 팀 구성</strong><span>${confirmed}/${teams.items.length}팀 확정</span></header><div>${teams.items.length?teams.items.map(team=>`<article class="${team.confirmed?'confirmed':''}"><strong>${safe(team.name)}</strong><span>${team.members.length?team.members.map(member=>safe(member.name)).join(' · '):`${teamMemberCount(team)}명 참여`}</span></article>`).join(''):'<p>학생이 팀을 만들면 이곳에 바로 표시됩니다.</p>'}</div></section>`;
}

function diagnosticReviewContent(meta){
  const sourceSlide=Number(meta.sourceSlide)-1,source=courseInteractions[state.deck]?.[sourceSlide+1],summary=activitySummaries[`${state.deck}:${sourceSlide}`];
  if(!source?.choices?.length)return '<div class="lesson-callout">진단 문항을 불러오지 못했습니다.</div>';
  if(!summary)return '<div class="diagnostic-review-wait"><strong>진단 결과를 기다리고 있습니다</strong><span>강사가 진단 장표에서 다음 장표로 이동하면 익명 집계가 표시됩니다.</span></div>';
  const total=summary.total||0,areas=['Cloud','ML','Ops'];
  return `<div class="diagnostic-review">${areas.map(area=>`<section><h2>${area}</h2>${source.choices.filter(question=>question.area===area).map(question=>{const counts=summary.counts?.[question.label]||{},answered=Object.values(counts).reduce((sum,count)=>sum+Number(count||0),0),missing=Math.max(0,total-answered);return `<article class="diagnostic-review-card"><header><strong>${safe(question.label)}</strong><span>${answered}/${total}명 응답</span></header><div class="diagnostic-option-bars">${question.options.map(option=>{const count=counts[option]||0,percent=total?Math.round(count/total*100):0;return `<div class="${option===question.correct?'correct':''}"><span>${option===question.correct?'정답 · ':''}${safe(option)}</span><i><b style="width:${percent}%"></b></i><em>${percent}%</em></div>`}).join('')}${missing?`<div class="missing"><span>미응답</span><i><b style="width:${total?Math.round(missing/total*100):0}%"></b></i><em>${total?Math.round(missing/total*100):0}%</em></div>`:''}</div><p><b>해설</b>${safe(question.explanation||`정답은 ‘${question.correct}’입니다.`)}</p></article>`}).join('')}</section>`).join('')}</div>`;
}

function interactiveSlideContent(meta,viewerRole){
  const teacherTiming=viewerRole==='teacher'&&Number.isFinite(meta.minutes)?` <span>권장 ${meta.minutes}분</span>`:'';
  let body=`<p class="kicker">${safe(meta.kicker||'학생 참여')}${teacherTiming}</p><h1>${safe(meta.title)}</h1>`;
  body+=taskBanner(meta,viewerRole);
  if(meta.copy)body+=`<p class="copy">${safe(meta.copy)}</p>`;
  if(meta.diagnosticReview)return body+diagnosticReviewContent(meta);
  if(meta.path)body+=`<div class="console-path"><strong>화면 이동</strong><span>${safe(meta.path)}</span></div>`;
  if(meta.visual)body+=`<figure class="lesson-visual"><img src="${safe(meta.visual)}" alt="${safe(meta.visualAlt||meta.title)}"><figcaption>${safe(meta.caption||'실제 화면에서 표시된 이름을 기준으로 찾으세요.')}</figcaption></figure>`;
  if(meta.roadmap?.length)body+=`<div class="course-roadmap">${meta.roadmap.map(step=>`<article><span>${safe(step.range)}</span><strong>${safe(step.title)}</strong><p>${safe(step.text)}</p></article>`).join('')}</div>`;
  if(meta.profileColumns?.length)body+=`<div class="instructor-profile-grid">${meta.profileColumns.map(column=>`<section><h2>${safe(column.title)}</h2>${column.entries.map(entry=>`<article><strong>${safe(entry.label)}</strong><span>${safe(entry.text)}</span></article>`).join('')}</section>`).join('')}</div>`;
  if(meta.table)body+=`<div class="lesson-table-wrap"><table class="lesson-table"><thead><tr>${meta.table.headers.map(header=>`<th>${safe(header)}</th>`).join('')}</tr></thead><tbody>${meta.table.rows.map(row=>`<tr>${row.map(cell=>`<td>${safe(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  if(meta.items)body+=`<ul>${meta.items.map(item=>`<li>${safe(item)}</li>`).join('')}</ul>`;
  if(meta.code)body+=`<pre class="lesson-code"><code>${safe(meta.code)}</code></pre>`;
  if(meta.callout)body+=`<div class="lesson-callout">${safe(meta.callout)}</div>`;
  if(meta.links?.length)body+=`<div class="lesson-links">${meta.links.map(link=>`<a href="${safe(link.url)}" target="_blank" rel="noopener">${safe(link.label)} ↗</a>`).join('')}</div>`;
  if(meta.type==='demo')body+=demoContent(viewerRole);
  if(meta.teamBuilder)body+=teamSlideWidget(viewerRole);
  body+=interactionFields(meta,viewerRole);
  if(state.revealed&&meta.reveal)body+=`<div class="reveal">${safe(meta.reveal)}</div>`;
  body+=attachmentLinks();
  return body;
}

function slideContent(slide){const interaction=currentInteraction(),viewer=viewingHistory()?'history':role;return interaction?interactiveSlideContent(interaction,viewer):`<img class="deck-slide-image" src="${safe(slide.image)}" alt="${safe(slide.title)}" draggable="false">`}
function studentQuestionHistory(){if(!myQuestions.length)return '';return `<details class="student-question-history"><summary>내 질문 ${myQuestions.length}개</summary><div>${myQuestions.slice(-5).reverse().map(question=>`<article><strong>${safe(question.text)}</strong><span>${question.answer?`답변: ${safe(question.answer)}`:'강사 확인 전'}</span></article>`).join('')}</div></details>`}
function studentHistoryControls(){const index=viewedSlideIndex();return `<nav class="student-history-controls" aria-label="지난 장표 보기"><button id="studentPrev" ${index<=0?'disabled':''}>← 지난 장표</button><span>${index+1} / 현재 ${state.slide+1}</span>${viewingHistory()?'<button class="live" id="studentLive">현재 수업으로</button>':`<button id="studentNext" disabled>현재 장표</button>`}</nav>`}
function studentDock(slide){if(viewingHistory())return `${studentHistoryControls()}<strong class="history-notice">지난 장표 · 읽기 전용</strong>${attachmentLinks()}${resourceLinks(slide)}`;return `${studentHistoryControls()}<form class="student-question-form" id="questionForm"><label for="studentQuestion">Q&amp;A</label><input id="studentQuestion" maxlength="300" placeholder="궁금한 점을 질문하세요" autocomplete="off"><button>질문 보내기</button></form>${studentQuestionHistory()}${attachmentLinks()}${resourceLinks(slide)}`}

function currentStudentTeam(){return teams.items.find(team=>team.members.some(member=>member.clientId===studentClientId))||null}
function teamMemberCount(team){return Number.isFinite(team.memberCount)?team.memberCount:team.members.length}
function teamStatus(team){const count=teamMemberCount(team);if(team.confirmed)return '확정';if(count<3)return `${count}명 · 팀원 모집 중`;return `${team.readyCount}/${count}명 동의`}
function studentTeamButton(){const team=currentStudentTeam();return `<button class="student-team-open" id="openTeamPanel">${team?`${safe(team.name)} · ${team.confirmed?'확정':'구성 중'}`:'팀 구성'}</button>`}
function studentTeamDialog(){
  if(!teamPanelOpen)return '';
  const mine=currentStudentTeam();
  const message=teamMessage?`<p class="team-message">${safe(teamMessage)}</p>`:'';
  const locked=teams.locked?'<p class="team-lock-notice">강사가 팀 구성을 마감했습니다. 변경이 필요하면 강사에게 알려주세요.</p>':'';
  let body='';
  if(mine){
    const me=mine.members.find(member=>member.clientId===studentClientId);
    body=`<section class="my-team-card ${mine.confirmed?'confirmed':''}"><header><div><span>내 팀</span><h3>${safe(mine.name)}</h3></div><strong>${safe(mine.code)}</strong></header><p class="team-state">${teamStatus(mine)}</p><ul>${mine.members.map(member=>`<li><span>${safe(member.name)}</span><b>${member.ready?'확정 동의':'확인 전'}</b></li>`).join('')}</ul><div class="team-dialog-actions"><button class="primary" id="toggleTeamReady" ${teams.locked?'disabled':''}>${me?.ready?'확정 동의 취소':'이 팀으로 확정 동의'}</button><button class="secondary" id="leaveTeam" ${teams.locked?'disabled':''}>팀 나가기</button></div><small>팀원이 바뀌면 확정 동의가 초기화됩니다. 3~4명 전원이 동의하면 자동으로 확정됩니다.</small></section>`;
  }else{
    const openTeams=teams.items.filter(team=>teamMemberCount(team)<4&&!team.confirmed);
    body=`<div class="team-start-grid"><form class="team-action-card" id="createTeam"><h3>새 팀 만들기</h3><p>팀 이름을 정하면 네 자리 참여 코드가 발급됩니다.</p><input id="newTeamName" maxlength="24" placeholder="팀 이름" ${teams.locked?'disabled':''} required><button class="primary" ${teams.locked?'disabled':''}>팀 만들기</button></form><form class="team-action-card" id="joinTeam"><h3>팀 코드로 참여</h3><p>팀원이 알려준 네 자리 코드를 입력하세요.</p><input id="joinTeamCode" maxlength="4" placeholder="예: A7K2" ${teams.locked?'disabled':''} required><button class="primary" ${teams.locked?'disabled':''}>참여하기</button></form></div><section class="open-team-list"><h3>참여 가능한 팀</h3>${openTeams.length?openTeams.map(team=>`<article><div><strong>${safe(team.name)}</strong><span>${teamMemberCount(team)}/4명 · 코드는 팀원에게 확인</span></div></article>`).join(''):'<p>아직 만들어진 팀이 없습니다.</p>'}</section>`;
  }
  return `<div class="team-dialog-backdrop"><section class="team-dialog" role="dialog" aria-modal="true" aria-label="팀 구성"><header class="team-dialog-header"><div><span>수업 코드 ${safe(roomId)}</span><h2>팀 구성</h2></div><button id="closeTeamPanel" aria-label="닫기">×</button></header>${locked}${message}${body}</section></div>`;
}

function teamManagementPanel(){
  const assigned=new Set(teams.items.flatMap(team=>team.members.map(member=>member.clientId)));
  const unassigned=roster.filter(student=>!assigned.has(student.clientId));
  const confirmed=teams.items.filter(team=>team.confirmed).length;
  const options=(selected='')=>`<option value="">미배정</option>${teams.items.map(team=>`<option value="${attr(team.id)}" ${selected===team.id?'selected':''}>${safe(team.name)} (${teamMemberCount(team)}/4)</option>`).join('')}`;
  const cards=teams.items.map(team=>`<article class="teacher-team-card ${team.confirmed?'confirmed':''}"><header><div><strong>${safe(team.name)}</strong><span>코드 ${safe(team.code)} · ${teamStatus(team)}</span></div><button data-team-confirm="${attr(team.id)}" data-confirmed="${team.confirmed?'false':'true'}">${team.confirmed?'확정 해제':'강사 확정'}</button></header><ul>${team.members.length?team.members.map(member=>`<li><span>${safe(member.name)}${member.ready?' ✓':''}</span><button data-remove-member="${attr(member.clientId)}">제외</button></li>`).join(''):'<li class="empty-member">팀원이 없습니다.</li>'}</ul><form class="team-rename" data-rename-team="${attr(team.id)}"><input maxlength="24" value="${attr(team.name)}" aria-label="팀 이름"><button>이름 변경</button></form><div class="teacher-team-actions"><label>다른 팀과 합치기<select data-merge-target="${attr(team.id)}">${teams.items.filter(item=>item.id!==team.id).map(item=>`<option value="${attr(item.id)}">${safe(item.name)}</option>`).join('')}</select></label><button data-merge-team="${attr(team.id)}" ${teams.items.length<2?'disabled':''}>합치기</button><button class="danger" data-dissolve-team="${attr(team.id)}">해산</button></div></article>`).join('');
  const waiting=unassigned.map(student=>`<article><span>${safe(student.name)}</span><select data-assign-student="${attr(student.clientId)}">${options()}</select></article>`).join('');
  return `<details class="team-management" open><summary><span>팀 구성 관리</span><b>${confirmed}/${teams.items.length}팀 확정 · 미배정 ${unassigned.length}명</b></summary><div class="team-management-tools"><button id="toggleTeamLock">${teams.locked?'구성 다시 열기':'팀 구성 잠금'}</button><button id="exportTeams">LMS용 CSV</button></div><form class="teacher-create-team" id="teacherCreateTeam"><input maxlength="24" id="teacherTeamName" placeholder="강사가 만들 팀 이름" required><button>팀 추가</button></form>${teamMessage?`<p class="team-message">${safe(teamMessage)}</p>`:''}<div class="teacher-team-list">${cards||'<p class="team-empty">아직 팀이 없습니다.</p>'}</div><section class="unassigned-students"><h3>미배정 학생</h3>${waiting||'<p>모든 출석 학생이 팀에 배정되었습니다.</p>'}</section></details>`;
}

function render(){
  if(role==='landing')return landing();
  const week=currentWeek();
  const slide=currentSlide();
  if(!week||!slide){app.innerHTML='<section class="error"><h1>수업 자료를 불러오지 못했습니다</h1><p>페이지를 새로고침해 주세요.</p></section>';return}
  const teacher=role==='teacher';
  const presenter=role==='presenter';
  const studentUrl=`${location.origin}/?room=${roomId}&week=${state.deck}`;
  const presenterUrl=`${location.origin}/?room=${roomId}&role=presenter&week=${state.deck}`;
  const shellClass=teacher?'teacher-shell':presenter?'viewer-shell presenter-shell':'viewer-shell student-shell';
  const roleLabel=teacher?'강사 제어용':presenter?'강사 PT용':'학생용';
  const participantLabel=role==='student'?` · ${safe(studentName)}`:'';
  const slideView=`<main class="slide-area"><article class="slide ${currentInteraction()?'interactive-slide':'deck-slide'} ${currentInteraction()?.diagnostic?'diagnostic-slide':''} ${currentInteraction()?.diagnosticReview?'diagnostic-review-slide':''} ${currentInteraction()?.profileColumns?'instructor-profile-slide':''}"><div class="slide-inner">${slideContent(slide)}</div></article></main>`;
  const stage=teacher?`<div class="teacher-stage">${slideView}${speakerNote(slide,week)}</div>`:slideView;
  const footer=role==='student'?studentDock(slide):'';
  const teacherLayout=teacher?`${teacherPanel(week,studentUrl,presenterUrl)}${stage}${participationPanel()}`:stage;
  app.innerHTML=`<div class="shell ${shellClass}"><header class="bar"><span class="brand">클라우드 MLOps</span><span class="room">${roomId}</span><span>${week.label} · ${roleLabel}${participantLabel}</span><span class="status"><i class="dot ${connected?'live':''}"></i>${connected?'실시간 연결':'다시 연결 중'}</span>${role==='student'?studentTeamButton():''}${presenter?'<button class="presenter-fullscreen" id="presenterFullscreen">전체 화면</button>':''}</header><div class="workspace">${teacherLayout}</div><div class="foot-controls">${footer}</div>${state.timerEnd?'<div class="timer" id="timer"></div>':''}${presenter?presenterSummary():''}${presenter&&state.showResponses?activityBoard():''}${role==='student'&&!viewingHistory()?`<button class="complete-button ${completed?'done':''}" id="complete">${completed?'완료 취소':'이 장표 완료'}</button>${studentTeamDialog()}`:''}</div>`;
  bindCommon();if(teacher)bindTeacher();else{if(role==='student')bindStudent();else bindPresenter();fitViewerSlide()}startTimer();startClock();
}

function connectionPanel(studentUrl,presenterUrl){return `<section class="connection-panel"><h3>접속 정보</h3><div class="student-entry-card"><span>학생 접속</span><strong>0060.kr</strong><em>수업 코드 ${roomId}</em></div><div class="share-box"><label>강사 PT 주소</label><div class="share-line"><input id="presenterUrl" readonly value="${presenterUrl}"><button id="copyPresenterUrl">복사</button></div><label>학생 접속 주소</label><div class="share-line"><input id="studentUrl" readonly value="${studentUrl}"><button id="copyUrl">복사</button></div><label>수업 코드</label><div class="share-line"><input readonly value="${roomId}"><button id="copyCode">복사</button></div></div></section>`}
function teacherPanel(week,studentUrl,presenterUrl){const percent=Math.round((state.slide+1)/week.slides.length*100);const global=globalPosition(),interaction=currentInteraction();return `<aside class="teacher-panel"><h2>수업 제어</h2><label class="week-picker-label" for="weekPicker">수업 주차</label><select class="week-picker" id="weekPicker">${weeks.map(item=>`<option value="${item.id}" ${item.id===week.id?'selected':''}>${item.label} · ${safe(item.title)} (${weekSlideCount(item)}장)</option>`).join('')}</select><section class="lesson-position" aria-label="수업 진행 위치"><div><span>현재 주차 슬라이드</span><strong>${state.slide+1} <small>/ ${week.slides.length}</small></strong></div><div class="lesson-clock"><span>현재 시각</span><time id="currentTime">--:--</time></div><div class="lesson-progress" aria-label="현재 주차 ${percent}% 진행"><span style="width:${percent}%"></span></div><p>전체 과정 ${global} / ${totalCourseSlides}${interaction?` · ${interaction.period}교시 · 권장 ${interaction.minutes}분`:''}</p></section><div class="control-group"><button id="prev" ${state.slide===0?'disabled':''}>← 이전</button><button id="next" ${state.slide===week.slides.length-1?'disabled':''}>다음 →</button>${interaction?.reveal?`<button class="wide" id="reveal">${state.revealed?'정답·예시 감추기':'정답·예시 공개'}</button>`:''}<button id="clearTimer">타이머 종료</button><button data-minutes="5">5분 타이머</button><button data-minutes="10">10분 타이머</button><div class="slide-jump wide"><input id="slideJump" type="number" min="1" max="${week.slides.length}" value="${state.slide+1}" aria-label="이동할 슬라이드 번호"><button id="jump">이동</button></div><button class="wide" id="first">첫 장면으로</button></div>${connectionPanel(studentUrl,presenterUrl)}</aside>`}

function responseData(response,index){return response?.fields?{name:response.name||`학생 ${index+1}`,fields:response.fields}:{name:`학생 ${index+1}`,fields:response||{}}}
function currentActivityResponses(){return activity.deck===state.deck&&activity.slide===state.slide?activity.responses:[]}
function diagnosticSummary(meta,{publicView=false}={}){const responses=currentActivityResponses().map(responseData),total=Math.max(roster.length,presence.students,responses.length),questions=meta.choices||[];const stats=questions.map(question=>{const values=responses.map(item=>item.fields[question.label]).filter(Boolean),correct=values.filter(value=>value===question.correct).length,unknown=values.filter(value=>value==='모르겠다').length,wrong=values.length-correct-unknown,missing=Math.max(0,total-values.length);return {question,correct,unknown,wrong,missing,rate:total?Math.round(correct/total*100):0}});const areas=['Cloud','ML','Ops'].map(area=>{const items=stats.filter(item=>item.question.area===area),possible=total*items.length,correct=items.reduce((sum,item)=>sum+item.correct,0),unknown=items.reduce((sum,item)=>sum+item.unknown,0);return `<article><strong>${area}</strong><b>${possible?Math.round(correct/possible*100):0}%</b><span>모름 ${unknown}</span></article>`}).join('');const rows=stats.map(({question,correct,unknown,wrong,missing,rate})=>`<article><div><strong>${safe(question.label)}</strong><span>정답 ${correct} · 오답 ${wrong} · 모름 ${unknown} · 미응답 ${missing}</span></div><b>${rate}%</b></article>`).join('');return `<section class="diagnostic-summary ${publicView?'public':''}"><header><strong>기초 진단 실시간 집계</strong><span>${questions.length}문항 · ${responses.length}/${total||0}명 응답 중</span></header><div class="diagnostic-area-grid">${areas}</div>${rows||'<p>학생이 답하면 문항별 분포가 표시됩니다.</p>'}</section>`}
function teacherResponsePreview(){const meta=currentInteraction();if(meta?.diagnostic)return diagnosticSummary(meta);const rows=currentActivityResponses().flatMap((response,index)=>{const item=responseData(response,index);return Object.entries(item.fields).filter(([,value])=>value).map(([label,value])=>`<div class="teacher-response"><strong>${safe(item.name)} · ${safe(label)}</strong><span>${safe(value)}</span></div>`)}).slice(0,8);return `<section class="teacher-response-list"><div><strong>현재 장표 답안</strong><span>${rows.length?`${rows.length}개 표시`:'대기 중'}</span></div>${rows.length?rows.join(''):'<p>학생이 입력하면 이름과 답안이 여기에 표시됩니다.</p>'}</section>`}
function enrolledStudents(){const attended=new Map(roster.filter(student=>student.studentId).map(student=>[student.studentId,student]));return enrollment.map(item=>({...item,student:attended.get(item.studentId)||null}))}
function attendanceRoster(){const students=enrolledStudents();return `<section class="attendance-roster"><header><strong>${safe(className||'수강생')} 출석·참여도</strong><button id="exportAttendance">전체 CSV</button></header>${students.length?students.map(item=>{const student=item.student;return `<article class="${student?'':'absent'}"><span class="presence-dot ${student?.online?'online':''}"></span><div><strong>${safe(item.name)} <small>${safe(item.studentId)}</small></strong><small>${student?`${student.online?'접속 중':'출석 · 현재 미접속'} · 완료 ${student.completedCount} · 답안 ${student.responseCount} · 질문 ${student.questionCount}`:'미출석 · 참여 기록 없음'}</small></div><b>${student?`${student.participationScore}%`:'—'}</b></article>`}).join(''):'<p>사전 수강 명단을 불러오는 중입니다.</p>'}</section>`}
function questionPanel(){return `<section class="teacher-questions"><header><strong>Q&amp;A</strong><span>${questions.filter(item=>!item.answer).length}개 답변 대기</span></header>${questions.length?questions.slice(-8).reverse().map(question=>`<article><div><strong>${safe(question.name)} · ${safe(question.weekLabel||question.deck)} ${Number(question.slide)+1}장</strong><p>${safe(question.text)}</p></div>${question.answer?`<div class="question-answer">답변: ${safe(question.answer)}</div>`:`<form data-question-id="${attr(question.id)}"><input maxlength="500" placeholder="답변을 입력하세요"><button>보내기</button></form>`}</article>`).join(''):'<p>학생 질문이 아직 없습니다.</p>'}</section>`}
function participationPanel(){return `<aside class="student-panel"><h2>${safe(className||'학생')} 참여</h2><div class="metric-row"><div class="metric"><strong>${presence.students}</strong><span>현재 접속</span></div><div class="metric"><strong>${roster.length}/${enrollment.length||0}</strong><span>출석</span></div><div class="metric"><strong>${presence.responded||0}</strong><span>현재 답안</span></div><div class="metric"><strong>${presence.completed}</strong><span>장표 완료</span></div></div>${teamManagementPanel()}<div class="participation-actions"><button id="showResponses">${state.showResponses?'학생 응답 감추기':'익명 응답 PT에 공개'}</button></div>${teacherResponsePreview()}${attendanceRoster()}${questionPanel()}</aside>`}

function generatedSpeakerScript(meta,slide){
  if(!meta)return slide.notes||'';
  const next=courseInteractions[state.deck]?.[state.slide+2];
  const lines=[`[말하기] 지금 장표의 주제는 “${meta.title}”입니다. ${meta.copy||''}`];
  if(meta.roadmap?.length)lines.push(`[화면을 설명하며 말하기] 화면의 흐름을 왼쪽부터 보겠습니다. ${meta.roadmap.map(step=>`“${step.title}”에서는 ${step.text}`).join(', ')} 순서로 이어집니다.`);
  else if(meta.table)lines.push(`[화면을 설명하며 말하기] 표의 기준은 ${meta.table.headers.map(header=>`“${header}”`).join(', ')}입니다. 첫 번째 행부터 읽으면서 각 값이 어떻게 연결되는지 비교해 보겠습니다.`);
  else if(meta.items?.length)lines.push(`[화면을 설명하며 말하기] 화면의 항목을 위에서부터 하나씩 읽겠습니다. ${meta.items.join(', ')}이 오늘 남길 결과와 어떻게 연결되는지 확인해 주세요.`);
  if(meta.fields?.length||meta.choices?.length||meta.checklist?.length){
    const prompts=[];
    if(meta.choices?.length)prompts.push(`${meta.choices.map(item=>`“${item.label}”`).join(', ')} 질문에 가장 알맞다고 생각하는 답을 선택해 주세요.`);
    if(meta.fields?.length)prompts.push(`${meta.fields.map(item=>`“${item.label}”`).join(', ')} 입력란에 누가 읽어도 뜻을 알 수 있는 문장으로 답을 적어 주세요.`);
    if(meta.checklist?.length)prompts.push('체크 항목을 위에서부터 직접 확인하고, 실제로 끝낸 항목만 선택해 주세요.');
    lines.push(`[학생에게 그대로 말하기] ${prompts.join(' ')} 입력과 확인을 마치면 오른쪽 아래 “이 장표 완료”를 눌러 주세요.`);
    lines.push('[응답 후 그대로 말하기] 강사 화면에 모인 답과 완료 수를 함께 보겠습니다. 서로 다른 답 두 가지를 읽고, 아직 끝내지 못한 사람은 어느 단계에서 막혔는지 확인하겠습니다.');
  }
  else if(meta.type==='demo'){
    lines.push('[학생에게 그대로 말하기] 화면의 값을 한 번 바꾸고 실행 버튼을 눌러 주세요. 실행 전 예상과 서버가 돌려준 결과가 어떻게 다른지 확인해 주세요.');
    lines.push('[응답 후 그대로 말하기] 서로 다른 값을 넣은 두 사람의 결과를 비교하겠습니다. 오류가 난 사람은 요청과 응답에 표시된 문장을 함께 읽어 보겠습니다.');
  }
  if(meta.teamBuilder)lines.push('[학생에게 그대로 말하기] 화면 오른쪽 위의 ‘팀 구성’을 열어 주세요. 팀을 만든 학생은 네 자리 코드를 팀원에게 알려 주고, 다른 학생은 그 코드로 참여하세요. 팀원 명단이 맞으면 각자 확정에 동의해 주세요.');
  if(meta.callout)lines.push(`[강조] ${meta.callout}`);
  lines.push(next?`[다음 장으로 연결하며 말하기] 이제 다음 장의 “${next.title}”로 넘어가겠습니다.`:'[마무리하며 말하기] 오늘 남긴 산출물을 다시 확인하겠습니다. 다음 주에도 같은 저장 위치에서 이어서 사용하겠습니다.');
  return lines.join('\n\n');
}
function speakerNote(slide,week){const meta=currentInteraction();const note=meta?.note||generatedSpeakerScript(meta,slide);return `<section class="speaker-note" aria-label="발표자 노트"><div class="speaker-note-label"><strong>발표자 노트</strong><span>${week.label} · ${state.slide+1} / ${week.slides.length}${meta?` · ${meta.period}교시 · ${meta.minutes}분`:''}</span></div><p>${safe(note||'')}</p>${attachmentLinks()}${meta?.links?.length?`<div class="resource-links">${meta.links.map(link=>`<a href="${safe(link.url)}" target="_blank" rel="noopener">${safe(link.label)} ↗</a>`).join('')}</div>`:resourceLinks(slide)}</section>`}

function presenterSummary(){const total=Math.max(1,presence.students),percent=Math.round(presence.completed/total*100),confirmed=teams.items.filter(team=>team.confirmed).length;return `<div class="live-summary"><span>응답 ${presence.responded||0}명</span><span>완료 ${presence.completed}/${presence.students}</span><span>팀 ${confirmed}/${teams.items.length} 확정</span><span class="live-progress"><span style="width:${percent}%"></span></span></div><div class="join-callout"><span>학생 접속</span><strong>0060.kr</strong><em>수업 코드 ${roomId}</em></div>`}
function activityBoard(){const meta=currentInteraction();if(meta?.diagnostic)return `<aside class="activity-board diagnostic-board">${diagnosticSummary(meta,{publicView:true})}</aside>`;const rows=currentActivityResponses().flatMap((response,index)=>{const item=responseData(response,index);return Object.entries(item.fields).filter(([,value])=>value).map(([label,value])=>`<div class="response-card"><strong>학생 ${index+1} · ${safe(label)}</strong><span>${safe(value)}</span></div>`)});return `<aside class="activity-board"><h2>학생 실시간 답안</h2>${rows.length?rows.join(''):'<p class="response-empty">아직 입력된 답안이 없습니다.</p>'}</aside>`}

function bindCommon(){
  const publish=()=>{const fields={};document.querySelectorAll('[data-field]').forEach(field=>{if(field.type==='radio'&&!field.checked)return;const value=field.type==='checkbox'?(field.checked?'완료':''):field.value;if(field.dataset.store)localStorage.setItem(field.dataset.store,value);if(value)fields[field.dataset.label||'학생 응답']=value});clearTimeout(activityTimer);activityTimer=setTimeout(()=>send({type:'activity',deck:state.deck,slide:state.slide,fields}),250)};
  document.querySelectorAll('[data-field]').forEach(input=>{input.oninput=publish;input.onchange=publish});
  const predict=document.querySelector('#predict');if(predict)predict.onclick=async()=>{predict.disabled=true;predict.textContent='계산 중…';const payload={originalPrice:Number(document.querySelector('#original').value),years:Number(document.querySelector('#years').value),battery:Number(document.querySelector('#battery').value)};try{const response=await fetch('/api/demo/predict',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});const result=await response.json();if(!response.ok)throw new Error(result.error||'계산 실패');document.querySelector('#price').textContent=new Intl.NumberFormat('ko-KR').format(result.calculatedPrice)+'원';document.querySelector('#explain').textContent='브라우저가 서버의 계산 API에서 결과를 받았습니다. 이 API는 규칙 계산기이며 ML 모델은 아닙니다.';document.querySelector('#json').textContent=JSON.stringify(result,null,2)}catch(error){document.querySelector('#explain').textContent=error.message}finally{predict.disabled=false;predict.textContent='다시 계산'}};
}

function bindTeacher(){
  document.querySelector('#weekPicker').onchange=async event=>{const weekId=event.target.value;event.target.disabled=true;try{await ensureWeekLoaded(weekId);control({deck:weekId,slide:0})}catch{event.target.disabled=false;alert('해당 주차 자료를 불러오지 못했습니다. 네트워크 연결을 확인해 주세요.')}};
  document.querySelector('#prev').onclick=()=>control({slide:state.slide-1});document.querySelector('#next').onclick=()=>control({slide:state.slide+1});document.querySelector('#first').onclick=()=>control({slide:0});document.querySelector('#clearTimer').onclick=()=>control({timerEnd:null});
  document.querySelector('#showResponses').onclick=()=>control({showResponses:!state.showResponses});
  const reveal=document.querySelector('#reveal');if(reveal)reveal.onclick=()=>control({revealed:!state.revealed});
  document.querySelector('#jump').onclick=()=>{const week=currentWeek(),number=Math.max(1,Math.min(week.slides.length,Number(document.querySelector('#slideJump').value)||1));control({slide:number-1})};
  document.querySelectorAll('[data-minutes]').forEach(button=>button.onclick=()=>control({timerEnd:Date.now()+Number(button.dataset.minutes)*60000}));
  document.querySelector('#copyPresenterUrl').onclick=()=>navigator.clipboard.writeText(document.querySelector('#presenterUrl').value);document.querySelector('#copyUrl').onclick=()=>navigator.clipboard.writeText(document.querySelector('#studentUrl').value);document.querySelector('#copyCode').onclick=()=>navigator.clipboard.writeText(roomId);
  document.querySelectorAll('.teacher-questions form').forEach(form=>form.onsubmit=event=>{event.preventDefault();const input=form.querySelector('input'),answer=input.value.trim();if(answer)send({type:'answer-question',questionId:form.dataset.questionId,answer})});
  const exportButton=document.querySelector('#exportAttendance');if(exportButton)exportButton.onclick=exportAttendance;
  document.querySelector('#toggleTeamLock').onclick=()=>send({type:'team-admin',action:'lock',locked:!teams.locked});
  document.querySelector('#exportTeams').onclick=exportTeams;
  document.querySelector('#teacherCreateTeam').onsubmit=event=>{event.preventDefault();const input=document.querySelector('#teacherTeamName'),name=input.value.trim();if(name)send({type:'team-admin',action:'create',name})};
  document.querySelectorAll('[data-team-confirm]').forEach(button=>button.onclick=()=>send({type:'team-admin',action:'confirm',teamId:button.dataset.teamConfirm,confirmed:button.dataset.confirmed==='true'}));
  document.querySelectorAll('[data-remove-member]').forEach(button=>button.onclick=()=>send({type:'team-admin',action:'assign',clientId:button.dataset.removeMember,teamId:''}));
  document.querySelectorAll('[data-assign-student]').forEach(select=>select.onchange=()=>{if(select.value)send({type:'team-admin',action:'assign',clientId:select.dataset.assignStudent,teamId:select.value})});
  document.querySelectorAll('[data-rename-team]').forEach(form=>form.onsubmit=event=>{event.preventDefault();const name=form.querySelector('input').value.trim();if(name)send({type:'team-admin',action:'rename',teamId:form.dataset.renameTeam,name})});
  document.querySelectorAll('[data-dissolve-team]').forEach(button=>button.onclick=()=>{if(confirm('이 팀을 해산하고 모든 팀원을 미배정 상태로 돌릴까요?'))send({type:'team-admin',action:'dissolve',teamId:button.dataset.dissolveTeam})});
  document.querySelectorAll('[data-merge-team]').forEach(button=>button.onclick=()=>{const sourceId=button.dataset.mergeTeam,targetId=document.querySelector(`[data-merge-target="${sourceId}"]`)?.value;if(targetId&&confirm('두 팀을 합칠까요? 팀원 전원의 확정 동의는 초기화됩니다.'))send({type:'team-admin',action:'merge',sourceId,targetId})});
}
function exportAttendance(){const cell=value=>{let text=String(value??'');if(/^[=+\-@]/.test(text))text=`'${text}`;return `"${text.replaceAll('"','""')}"`};const rows=[['반','학번','이름','출석 상태','현재 접속','최초 입장','마지막 활동','확인한 장표','완료 장표','답안 장표','질문','참여도'],...enrolledStudents().map(item=>{const student=item.student;return [className,item.studentId,item.name,student?'출석':'미출석',student?.online?'접속 중':'미접속',student?formatTime(student.firstJoinedAt):'',student?formatTime(student.lastActiveAt):'',student?.visitedCount||0,student?.completedCount||0,student?.responseCount||0,student?.questionCount||0,student?`${student.participationScore}%`:'']})];const blob=new Blob([`\ufeff${rows.map(row=>row.map(cell).join(',')).join('\n')}`],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`${className||roomId}-attendance.csv`;link.click();URL.revokeObjectURL(url)}
function exportTeams(){const cell=value=>{let text=String(value??'');if(/^[=+\-@]/.test(text))text=`'${text}`;return `"${text.replaceAll('"','""')}"`};const rows=[['팀번호','팀명','팀코드','학생명','구성 상태'],...teams.items.flatMap((team,index)=>team.members.length?team.members.map(member=>[index+1,team.name,team.code,member.name,team.confirmed?'확정':'구성 중']):[[index+1,team.name,team.code,'',team.confirmed?'확정':'구성 중']])];const blob=new Blob([`\ufeff${rows.map(row=>row.map(cell).join(',')).join('\n')}`],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`${roomId}-team-roster.csv`;link.click();URL.revokeObjectURL(url)}
function bindStudent(){
  const completeButton=document.querySelector('#complete');if(completeButton)completeButton.onclick=()=>{completed=!completed;send({type:'complete',completed});render()};
  const previous=document.querySelector('#studentPrev');if(previous)previous.onclick=()=>{studentHistorySlide=Math.max(0,viewedSlideIndex()-1);render()};
  const live=document.querySelector('#studentLive');if(live)live.onclick=()=>{studentHistorySlide=null;render()};
  const form=document.querySelector('#questionForm');if(form)form.onsubmit=event=>{event.preventDefault();const input=document.querySelector('#studentQuestion'),text=input.value.trim();if(!text)return;send({type:'question',text,deck:state.deck,slide:state.slide});input.value='';input.placeholder='질문을 보냈습니다.'};
  document.querySelectorAll('#openTeamPanel,[data-open-team]').forEach(button=>button.onclick=()=>{teamPanelOpen=true;teamMessage='';render()});
  const close=document.querySelector('#closeTeamPanel');if(close)close.onclick=()=>{teamPanelOpen=false;render()};
  const backdrop=document.querySelector('.team-dialog-backdrop');if(backdrop)backdrop.onclick=event=>{if(event.target===backdrop){teamPanelOpen=false;render()}};
  const create=document.querySelector('#createTeam');if(create)create.onsubmit=event=>{event.preventDefault();const name=document.querySelector('#newTeamName').value.trim();if(name)send({type:'team',action:'create',name})};
  const join=document.querySelector('#joinTeam');if(join)join.onsubmit=event=>{event.preventDefault();const code=document.querySelector('#joinTeamCode').value.trim().toUpperCase();if(code)send({type:'team',action:'join',code})};
  document.querySelectorAll('[data-join-team]').forEach(button=>button.onclick=()=>send({type:'team',action:'join',code:button.dataset.joinTeam}));
  const ready=document.querySelector('#toggleTeamReady');if(ready){const mine=currentStudentTeam(),me=mine?.members.find(member=>member.clientId===studentClientId);ready.onclick=()=>send({type:'team',action:'ready',ready:!me?.ready})}
  const leave=document.querySelector('#leaveTeam');if(leave)leave.onclick=()=>{if(confirm('현재 팀에서 나갈까요? 팀의 확정 동의가 초기화됩니다.'))send({type:'team',action:'leave'})};
}
function bindPresenter(){document.querySelector('#presenterFullscreen').onclick=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()}
function fitViewerSlide(){
  const slide=document.querySelector('.viewer-shell .slide'),inner=document.querySelector('.viewer-shell .slide-inner');if(!slide||!inner)return;
  inner.style.transform='none';
  if(role==='student'&&(slide.classList.contains('diagnostic-slide')||slide.classList.contains('diagnostic-review-slide')))return;
  const style=getComputedStyle(slide),available=slide.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom);
  const scale=Math.min(1,available/inner.scrollHeight);
  inner.style.transform=`scale(${scale})`;
}
function startTimer(){clearInterval(timerHandle);if(!state.timerEnd)return;const tick=()=>{const el=document.querySelector('#timer');if(!el)return;const left=Math.max(0,state.timerEnd-Date.now()),m=Math.floor(left/60000),s=Math.floor(left%60000/1000);el.textContent=`남은 시간 ${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;el.classList.toggle('urgent',left<60000);if(left===0)clearInterval(timerHandle)};tick();timerHandle=setInterval(tick,1000)}
function startClock(){clearInterval(clockHandle);const tick=()=>{const el=document.querySelector('#currentTime');if(el)el.textContent=new Intl.DateTimeFormat('ko-KR',{hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date())};tick();if(document.querySelector('#currentTime'))clockHandle=setInterval(tick,1000)}
window.addEventListener('resize',()=>{if(role==='student'||role==='presenter')fitViewerSlide()});
document.addEventListener('keydown',e=>{if(role!=='teacher'||e.target.matches('input,select'))return;const last=currentWeek().slides.length-1;if(e.key==='ArrowRight'&&state.slide<last)control({slide:state.slide+1});if(e.key==='ArrowLeft'&&state.slide>0)control({slide:state.slide-1})});
function enterClassroom(){
  app.innerHTML='<div class="boot">현재 수업 자료를 불러오고 있습니다.</div>';
  const hintedWeek=params.get('week')||localStorage.getItem(`room-week:${roomId}`)||'';
  if(weeks.some(week=>week.id===hintedWeek)){
    state.deck=hintedWeek;
    ensureWeekLoaded(hintedWeek).then(()=>{if(state.deck===hintedWeek)render()}).catch(()=>{});
  }
  connect();
}
role==='landing'?landing():role==='instructor'?loadInstructorPortal():role==='student'&&!studentToken?studentIdentity():enterClassroom();
