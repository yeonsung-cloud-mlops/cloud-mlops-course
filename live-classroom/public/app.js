const weeks = window.COURSE_WEEKS || [];
const totalCourseSlides = window.COURSE_TOTAL_SLIDES || weeks.reduce((sum, week) => sum + week.slides.length, 0);

const app = document.querySelector('#app');
const params = new URLSearchParams(location.search);
const roomId = (params.get('room')||'').toUpperCase();
const requestedRole=params.get('role');
const role = requestedRole === 'teacher' ? 'teacher' : requestedRole === 'presenter' && roomId ? 'presenter' : roomId ? 'student' : 'landing';
const teacherKey = params.get('key') || '';
let socket, connected=false, state={deck:'week01',slide:0,revealed:false,showResponses:false,timerEnd:null},presence={students:0,completed:0,responded:0,presenters:0},activity={deck:'week01',slide:0,responses:[]},completed=false,retry=0,timerHandle,clockHandle,activityTimer;

function landing(){
  app.innerHTML=`<section class="landing"><div class="landing-inner"><p class="eyebrow">CLOUD MLOPS · LIVE CLASSROOM</p><h1>강사가 넘기면,<br>학생 화면도 함께 움직입니다.</h1><p class="lead">한 주소에서 장면 제어, 학생 활동, AWS 화면, 완료 현황을 이어갑니다.</p><div class="entry-grid"><article class="entry-card"><h2>강사용 화면</h2><p>새 수업 코드를 만들고 학생 화면을 실시간으로 제어합니다.</p><button class="primary" id="createRoom">새 수업 시작</button></article><form class="entry-card" id="joinForm"><h2>학생용 화면</h2><p>강사가 알려준 여섯 자리 수업 코드를 입력하세요.</p><input id="roomInput" maxlength="6" autocomplete="off" placeholder="수업 코드" required><button class="primary">수업 참여</button></form></div></div></section>`;
  document.querySelector('#createRoom').onclick=createRoom;
  document.querySelector('#joinForm').onsubmit=e=>{e.preventDefault();const code=document.querySelector('#roomInput').value.trim().toUpperCase();if(code.length===6)location.href=`/?room=${encodeURIComponent(code)}`};
}

async function createRoom(){
  const button=document.querySelector('#createRoom');button.disabled=true;button.textContent='수업 만드는 중…';
  try{const response=await fetch('/api/rooms',{method:'POST'});if(!response.ok)throw new Error();const room=await response.json();location.href=`/?room=${room.roomId}&role=teacher&key=${encodeURIComponent(room.teacherKey)}`}
  catch{button.disabled=false;button.textContent='다시 시도';}
}

function connect(){
  if(!roomId)return;
  const protocol=location.protocol==='https:'?'wss:':'ws:';
  socket=new WebSocket(`${protocol}//${location.host}/api/rooms/${roomId}/ws?role=${role}&key=${encodeURIComponent(teacherKey)}`);
  socket.onopen=()=>{connected=true;retry=0;render()};
  socket.onclose=()=>{connected=false;render();setTimeout(connect,Math.min(10000,800*2**retry++))};
  socket.onerror=()=>socket.close();
  socket.onmessage=event=>{const message=JSON.parse(event.data);if(message.type==='state'){const moved=state.deck!==message.state.deck||state.slide!==message.state.slide;state=message.state;if(moved)completed=false}if(message.type==='presence')presence=message;if(message.type==='activity')activity={deck:message.deck||state.deck,slide:message.slide,responses:message.responses||[]};if(message.type==='expired'){app.innerHTML='<section class="error"><h1>수업이 종료되었습니다</h1><p>강사에게 새 수업 코드를 받아주세요.</p></section>';return}if(message.type!=='activity'||role!=='student')render()};
}

function send(payload){if(socket?.readyState===WebSocket.OPEN)socket.send(JSON.stringify(payload))}
function control(changes){state={...state,...changes};send({type:'control',...changes});render()}
function safe(text=''){return text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}
function currentWeek(){return weeks.find(week=>week.id===state.deck)||weeks[0]}
function currentSlide(){const week=currentWeek();return week?.slides[state.slide]||week?.slides[0]}
function globalPosition(){const week=currentWeek();return weeks.slice(0,weeks.indexOf(week)).reduce((sum,item)=>sum+item.slides.length,0)+state.slide+1}
function resourceLinks(slide){if(!slide?.links?.length)return '';return `<div class="resource-links">${slide.links.map(link=>`<a href="${safe(link.url)}" target="_blank" rel="noopener">${safe(link.label)} ↗</a>`).join('')}</div>`}

function slideContent(slide){return `<img class="deck-slide-image" src="${safe(slide.image)}" alt="${safe(slide.title)}" draggable="false">`}
function studentDock(slide){const key=`field-${state.deck}-${state.slide}`;return `<div class="student-response"><label for="studentResponse">학생 응답·질문</label><input id="studentResponse" data-field="${state.deck}-${state.slide}" value="${safe(localStorage.getItem(key)||'')}" placeholder="이 장표의 질문에 답하거나 궁금한 점을 입력하세요"></div>${resourceLinks(slide)}`}

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
  const slideView=`<main class="slide-area"><article class="slide deck-slide"><div class="slide-inner">${slideContent(slide)}</div></article></main>`;
  const stage=teacher?`<div class="teacher-stage">${slideView}${speakerNote(slide,week)}</div>`:slideView;
  const footer=role==='student'?studentDock(slide):'';
  app.innerHTML=`<div class="shell ${shellClass}"><header class="bar"><span class="brand">클라우드 MLOps</span><span class="room">${roomId}</span><span>${week.label} · ${roleLabel}</span><span class="status"><i class="dot ${connected?'live':''}"></i>${connected?'실시간 연결':'다시 연결 중'}</span>${presenter?'<button class="presenter-fullscreen" id="presenterFullscreen">전체 화면</button>':''}</header><div class="workspace">${teacher?teacherPanel(studentUrl,presenterUrl,week):''}${stage}</div><div class="foot-controls">${footer}</div>${state.timerEnd?'<div class="timer" id="timer"></div>':''}${presenter?presenterSummary():''}${presenter&&state.showResponses?activityBoard():''}${role==='student'?`<button class="complete-button ${completed?'done':''}" id="complete">${completed?'완료 취소':'이 장면 완료'}</button>`:''}</div>`;
  bindCommon();if(teacher)bindTeacher();else{if(role==='student')bindStudent();else bindPresenter();fitViewerSlide()}startTimer();startClock();
}

function teacherPanel(studentUrl,presenterUrl,week){const percent=Math.round((state.slide+1)/week.slides.length*100);const global=globalPosition();return `<aside class="teacher-panel"><h2>수업 제어</h2><label class="week-picker-label" for="weekPicker">수업 주차</label><select class="week-picker" id="weekPicker">${weeks.map(item=>`<option value="${item.id}" ${item.id===week.id?'selected':''}>${item.label} · ${safe(item.title)} (${item.slides.length}장)</option>`).join('')}</select><section class="lesson-position" aria-label="수업 진행 위치"><div><span>현재 주차 슬라이드</span><strong>${state.slide+1} <small>/ ${week.slides.length}</small></strong></div><div class="lesson-clock"><span>현재 시각</span><time id="currentTime">--:--</time></div><div class="lesson-progress" aria-label="현재 주차 ${percent}% 진행"><span style="width:${percent}%"></span></div><p>전체 과정 ${global} / ${totalCourseSlides}</p></section><div class="metric-row"><div class="metric"><strong>${presence.students}</strong><span>접속 학생</span></div><div class="metric"><strong>${presence.responded||0}</strong><span>입력 학생</span></div><div class="metric"><strong>${presence.completed}</strong><span>장면 완료</span></div><div class="metric"><strong>${presence.presenters||0}</strong><span>PT 화면</span></div></div><div class="control-group"><button id="prev" ${state.slide===0?'disabled':''}>← 이전</button><button id="next" ${state.slide===week.slides.length-1?'disabled':''}>다음 →</button><button id="showResponses">${state.showResponses?'응답 PT 감추기':'응답 PT 공개'}</button><button id="clearTimer">타이머 종료</button><button data-minutes="5">5분 타이머</button><button data-minutes="10">10분 타이머</button><div class="slide-jump wide"><input id="slideJump" type="number" min="1" max="${week.slides.length}" value="${state.slide+1}" aria-label="이동할 슬라이드 번호"><button id="jump">이동</button></div><button class="wide" id="first">첫 장면으로</button></div><div class="share-box"><strong>화면 접속 정보</strong><label>강사 PT 주소</label><div class="share-line"><input id="presenterUrl" readonly value="${presenterUrl}"><button id="copyPresenterUrl">복사</button></div><label>학생 접속 주소</label><div class="share-line"><input id="studentUrl" readonly value="${studentUrl}"><button id="copyUrl">복사</button></div><label>수업 코드</label><div class="share-line"><input readonly value="${roomId}"><button id="copyCode">복사</button></div></div></aside>`}

function speakerNote(slide,week){return `<section class="speaker-note" aria-label="발표자 노트"><div class="speaker-note-label"><strong>발표자 노트</strong><span>${week.label} · ${state.slide+1} / ${week.slides.length}</span></div><p>${safe(slide.notes||'')}</p>${resourceLinks(slide)}</section>`}

function presenterSummary(){const total=Math.max(1,presence.students),percent=Math.round(presence.completed/total*100);return `<div class="live-summary"><span>응답 ${presence.responded||0}명</span><span>완료 ${presence.completed}/${presence.students}</span><span class="live-progress"><span style="width:${percent}%"></span></span></div><div class="join-callout"><span>학생 접속</span><strong>0060.kr</strong><em>수업 코드 ${roomId}</em></div>`}
function activityBoard(){const rows=(activity.deck===state.deck&&activity.slide===state.slide?activity.responses:[]).flatMap((response,studentIndex)=>Object.entries(response).filter(([,value])=>value).map(([label,value])=>`<div class="response-card"><strong>익명 ${studentIndex+1} · ${safe(label)}</strong><span>${safe(value)}</span></div>`));return `<aside class="activity-board"><h2>학생 실시간 응답</h2>${rows.length?rows.join(''):'<p class="response-empty">아직 입력된 응답이 없습니다.</p>'}</aside>`}

function bindCommon(){
  document.querySelectorAll('[data-field]').forEach(input=>input.oninput=()=>{localStorage.setItem(`field-${input.dataset.field}`,input.value);clearTimeout(activityTimer);activityTimer=setTimeout(()=>{const fields=Object.fromEntries([...document.querySelectorAll('[data-field]')].map(field=>[field.previousElementSibling.textContent,field.value]));send({type:'activity',deck:state.deck,slide:state.slide,fields})},250)});
}

function bindTeacher(){
  document.querySelector('#weekPicker').onchange=event=>control({deck:event.target.value,slide:0});
  document.querySelector('#prev').onclick=()=>control({slide:state.slide-1});document.querySelector('#next').onclick=()=>control({slide:state.slide+1});document.querySelector('#first').onclick=()=>control({slide:0});document.querySelector('#clearTimer').onclick=()=>control({timerEnd:null});
  document.querySelector('#showResponses').onclick=()=>control({showResponses:!state.showResponses});
  document.querySelector('#jump').onclick=()=>{const week=currentWeek(),number=Math.max(1,Math.min(week.slides.length,Number(document.querySelector('#slideJump').value)||1));control({slide:number-1})};
  document.querySelectorAll('[data-minutes]').forEach(button=>button.onclick=()=>control({timerEnd:Date.now()+Number(button.dataset.minutes)*60000}));
  document.querySelector('#copyPresenterUrl').onclick=()=>navigator.clipboard.writeText(document.querySelector('#presenterUrl').value);document.querySelector('#copyUrl').onclick=()=>navigator.clipboard.writeText(document.querySelector('#studentUrl').value);document.querySelector('#copyCode').onclick=()=>navigator.clipboard.writeText(roomId);
}
function bindStudent(){document.querySelector('#complete').onclick=()=>{completed=!completed;send({type:'complete',completed});render()}}
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
role==='landing'?landing():(render(),connect());
