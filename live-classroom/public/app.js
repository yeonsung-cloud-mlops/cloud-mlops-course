const slides = [
  {kicker:'01주차 · 시작',title:'오늘 4시간 뒤, 무엇이 남아야 할까요?',copy:'AWS에 로그인하고, 팀이 함께 쓸 저장 공간을 만든 뒤, 프로젝트 후보를 세 개까지 좁힙니다.',callout:'오늘 결과물: 팀 초안 + 주제 후보표 + 개인 S3 버킷'},
  {kicker:'먼저 예상하기',title:'이 노트북, 중고로 얼마에 올릴까요?',copy:'새 제품 150만 원 · 3년 사용 · 배터리 78% · 외관 B등급',fields:['내 예상 가격','그렇게 생각한 이유'],reveal:'정답을 맞히는 시간이 아닙니다. 같은 정보를 보고도 판단이 얼마나 달라지는지 확인합니다.'},
  {kicker:'직접 실행',title:'값을 바꾸고, 예측 결과를 받아보세요',type:'demo'},
  {kicker:'실행한 뒤에만',title:'방금 실제로 서비스를 사용했습니다',copy:'입력값을 보냈고, 계산이 실행됐으며, 화면이 결과를 받았습니다.',items:['입력 화면','요청 데이터','계산 또는 모델','응답 결과'],reveal:'버튼을 누르기 전에는 서비스를 사용한 것이 아닙니다.'},
  {kicker:'15주 도착점',title:'마지막에는 파일이 아니라 주소를 보여줍니다',items:['팀원이 다시 실행할 수 있다','다른 사람이 브라우저에서 사용할 수 있다','문제가 생기면 로그와 지표로 찾을 수 있다','비용이 나는 리소스를 스스로 정리한다']},
  {kicker:'팀 구성 · 12분',title:'기술 수준보다 작업 방식이 맞는 사람을 찾으세요',items:['3~4명으로 구성','결석·연락 규칙을 먼저 합의','한 사람이 모든 코드를 맡지 않기','역할은 매 마일스톤마다 교체'],fields:['함께하고 싶은 팀원','내가 맡아보고 싶은 역할']},
  {kicker:'역할 협상 · 8분',title:'첫 마일스톤 역할을 정합니다',items:['데이터: 자료를 찾고 정리한다','모델: 기준 모델을 실행한다','서빙: 다른 사람이 쓰는 화면을 만든다','운영·문서: 재현 방법과 비용을 기록한다'],callout:'역할은 실력 등급이 아닙니다. 이번에 책임질 작업 구간입니다.'},
  {kicker:'주제 후보 · 15분',title:'팀마다 후보를 세 개 적으세요',fields:['후보 1','후보 2','후보 3','우리가 해결하려는 불편'],callout:'좋아 보이는 주제가 아니라, 공개 데이터로 15주 안에 끝낼 수 있는 주제를 찾습니다.'},
  {kicker:'주제 검증 · 15분',title:'각 후보를 네 질문으로 걸러냅니다',items:['데이터를 오늘 다운로드할 수 있는가?','예측할 값이 한 문장으로 설명되는가?','CPU로 10분 안에 학습 가능한가?','다른 팀원이 결과를 직접 눌러볼 수 있는가?'],reveal:'네 항목 중 두 개 이하라면 후보에서 제외합니다.'},
  {kicker:'AWS 실습 시작',title:'첫 화면에서 서울 리전부터 확인합니다',type:'image',image:'/assets/week01-console.png',copy:'오른쪽 위 리전이 서울(ap-northeast-2)인지 확인한 뒤 다음 단계로 이동합니다.',links:[['AWS 콘솔 열기','https://console.aws.amazon.com/console/home?region=ap-northeast-2','aws']]},
  {kicker:'개인 수행',title:'S3 버킷을 만들고 세 폴더를 준비합니다',items:['버킷 이름: mlops-2026-학번','raw/ · processed/ · models/ 폴더','퍼블릭 액세스 차단 유지','완료 화면을 캡처'],links:[['S3 콘솔 열기','https://console.aws.amazon.com/s3/home?region=ap-northeast-2','aws'],['AWS 공식 문서','https://docs.aws.amazon.com/AmazonS3/latest/userguide/create-bucket-overview.html','']]},
  {kicker:'오늘의 완료 조건',title:'세 가지가 보이면 1주차 성공입니다',items:['팀원 이름과 첫 역할','검증을 통과한 주제 후보 1~3개','서울 리전의 개인 S3 버킷'],callout:'완료 버튼을 누른 뒤 강사 화면의 완료 인원이 올라가는지 확인하세요.'}
];

const speakerNotes = [
  '학생에게 과목 정의를 설명하기 전에 오늘 남길 결과물 세 가지를 먼저 읽게 한다. “4시간 뒤 실제로 무엇이 생기는가”에만 집중한다.',
  '2분 동안 개인 예상 가격과 이유를 작성시킨다. 정답을 요구하지 말고 서로 다른 판단 근거 두세 개만 받아 적는다.',
  '학생이 각자 예상 가격 보기를 누르게 한다. 결과가 나오기 전에는 서비스를 사용했다는 표현을 하지 않는다.',
  '입력·요청·계산·응답 네 단어만 짚는다. 모델 정확도 설명으로 넘어가지 말고 이번 학기 결과물의 형태를 강조한다.',
  '15주차에는 파일이 아니라 접속 주소를 보여준다는 문장으로 프로젝트 목표를 고정한다. 네 항목을 평가 기준과 연결한다.',
  '12분 타이머를 시작한다. 친분보다 연락 방식과 작업 시간을 먼저 비교하게 하고 미배정 학생을 확인한다.',
  '역할은 실력 등급이 아니라 이번 마일스톤의 책임 구간이라고 강조한다. 다음 마일스톤에서 교체됨을 알린다.',
  '15분 동안 후보 세 개를 작성시킨다. 학생 입력 수가 늘어나는지 제어 화면에서 확인하고, 공개 가능한 답만 PT에 띄운다.',
  '후보마다 네 질문을 빠르게 채점한다. 두 항목 이하인 후보는 미련 없이 제외하게 한다.',
  'PT 화면의 캡처와 학생 실제 콘솔을 번갈아 확인한다. 오른쪽 위 서울 리전 확인 전에는 다음 단계로 넘기지 않는다.',
  '버킷 이름 중복 오류가 나면 학번 뒤 임의 숫자를 붙인다. 퍼블릭 액세스 차단 해제는 허용하지 않는다.',
  '완료 인원과 실제 산출물을 함께 확인한다. 완료 버튼만 누르고 결과물이 없는 학생은 다시 점검한다.'
];

const app = document.querySelector('#app');
const params = new URLSearchParams(location.search);
const roomId = (params.get('room')||'').toUpperCase();
const requestedRole=params.get('role');
const role = requestedRole === 'teacher' ? 'teacher' : requestedRole === 'presenter' && roomId ? 'presenter' : roomId ? 'student' : 'landing';
const teacherKey = params.get('key') || '';
let socket, connected=false, state={slide:0,revealed:false,showResponses:false,timerEnd:null},presence={students:0,completed:0,responded:0,presenters:0},activity={slide:0,responses:[]},completed=false,retry=0,timerHandle,clockHandle,activityTimer;

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
  socket.onmessage=event=>{const message=JSON.parse(event.data);if(message.type==='state')state=message.state;if(message.type==='presence')presence=message;if(message.type==='activity')activity={slide:message.slide,responses:message.responses||[]};if(message.type==='expired'){app.innerHTML='<section class="error"><h1>수업이 종료되었습니다</h1><p>강사에게 새 수업 코드를 받아주세요.</p></section>';return}if(message.type!=='activity'||role!=='student')render()};
}

function send(payload){if(socket?.readyState===WebSocket.OPEN)socket.send(JSON.stringify(payload))}
function control(changes){state={...state,...changes};send({type:'control',...changes});render()}
function safe(text=''){return text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}

function slideContent(slide,index,viewerRole=role){
  let body=`<p class="kicker">${safe(slide.kicker)}</p><h1>${safe(slide.title)}</h1>`;
  if(slide.copy)body+=`<p class="copy">${safe(slide.copy)}</p>`;
  if(slide.items)body+=`<ul>${slide.items.map(item=>`<li>${safe(item)}</li>`).join('')}</ul>`;
  if(slide.fields&&viewerRole==='presenter')body+=`<div class="callout">학생은 각자 화면에 ${safe(slide.fields.join(' · '))}을 작성합니다.</div>`;
  else if(slide.fields)body+=`<div class="fields">${slide.fields.map((label,i)=>`<div class="field"><label>${safe(label)}</label><input data-field="${index}-${i}" value="${safe(localStorage.getItem(`field-${index}-${i}`)||'')}"></div>`).join('')}</div>`;
  if(slide.type==='image')body+=`<img src="${slide.image}" alt="${safe(slide.title)}">`;
  if(slide.type==='demo')body+=demoContent();
  if(slide.callout)body+=`<div class="callout">${safe(slide.callout)}</div>`;
  if(state.revealed&&slide.reveal)body+=`<div class="reveal">${safe(slide.reveal)}</div>`;
  if(slide.links)body+=`<div class="actions">${slide.links.map(([label,url,kind])=>`<a class="${kind}" href="${url}" target="_blank" rel="noopener">${safe(label)} ↗</a>`).join('')}</div>`;
  return body;
}

function demoContent(){return `<div class="demo-grid"><div class="demo-card"><label>새 제품 가격</label><input id="original" type="number" value="1500000"><label>사용 기간</label><select id="years"><option value="1">1년</option><option value="3" selected>3년</option><option value="5">5년</option></select><label>배터리 성능</label><input id="battery" type="number" value="78"><button class="primary" id="predict">예상 가격 보기</button></div><div class="demo-card"><h2>서비스 응답</h2><div class="price" id="price">—</div><p id="explain">버튼을 누르기 전에는 아직 서비스를 사용하지 않았습니다.</p><pre id="json">POST /predict\n\n요청 전</pre></div></div>`}

function render(){
  if(role==='landing')return landing();
  const slide=slides[state.slide]||slides[0];
  const teacher=role==='teacher';
  const presenter=role==='presenter';
  const studentUrl=`${location.origin}/?room=${roomId}`;
  const presenterUrl=`${location.origin}/?room=${roomId}&role=presenter`;
  const shellClass=teacher?'teacher-shell':presenter?'viewer-shell presenter-shell':'viewer-shell student-shell';
  const roleLabel=teacher?'강사 제어용':presenter?'강사 PT용':'학생용';
  const slideView=`<main class="slide-area"><article class="slide"><div class="slide-inner">${slideContent(slide,state.slide,role)}</div></article></main>`;
  const stage=teacher?`<div class="teacher-stage">${slideView}${speakerNote()}</div>`:slideView;
  app.innerHTML=`<div class="shell ${shellClass}"><header class="bar"><span class="brand">클라우드 MLOps</span><span class="room">${roomId}</span><span>${roleLabel} 화면</span><span class="status"><i class="dot ${connected?'live':''}"></i>${connected?'실시간 연결':'다시 연결 중'}</span>${presenter?'<button class="presenter-fullscreen" id="presenterFullscreen">전체 화면</button>':''}</header><div class="workspace">${teacher?teacherPanel(studentUrl,presenterUrl):''}${stage}</div><div class="foot-controls"></div>${state.timerEnd?'<div class="timer" id="timer"></div>':''}${presenter?presenterSummary():''}${presenter&&state.showResponses?activityBoard():''}${role==='student'?`<button class="complete-button ${completed?'done':''}" id="complete">${completed?'완료 취소':'이 장면 완료'}</button>`:''}</div>`;
  bindCommon();if(teacher)bindTeacher();else{if(role==='student')bindStudent();else bindPresenter();fitViewerSlide()}startTimer();startClock();
}

function teacherPanel(studentUrl,presenterUrl){const percent=Math.round((state.slide+1)/slides.length*100);return `<aside class="teacher-panel"><h2>수업 제어</h2><section class="lesson-position" aria-label="수업 진행 위치"><div><span>현재 슬라이드</span><strong>${state.slide+1} <small>/ ${slides.length}</small></strong></div><div class="lesson-clock"><span>현재 시각</span><time id="currentTime">--:--</time></div><div class="lesson-progress" aria-label="전체 슬라이드 중 ${percent}% 진행"><span style="width:${percent}%"></span></div></section><div class="metric-row"><div class="metric"><strong>${presence.students}</strong><span>접속 학생</span></div><div class="metric"><strong>${presence.responded||0}</strong><span>입력 학생</span></div><div class="metric"><strong>${presence.completed}</strong><span>장면 완료</span></div><div class="metric"><strong>${presence.presenters||0}</strong><span>PT 화면</span></div></div><div class="control-group"><button id="prev" ${state.slide===0?'disabled':''}>← 이전</button><button id="next" ${state.slide===slides.length-1?'disabled':''}>다음 →</button><button id="reveal">${state.revealed?'내용 감추기':'추가 내용 공개'}</button><button id="showResponses">${state.showResponses?'응답 PT 감추기':'응답 PT 공개'}</button><button id="clearTimer">타이머 종료</button><button data-minutes="5">5분 타이머</button><button data-minutes="10">10분 타이머</button><button class="wide" id="first">첫 장면으로</button></div><div class="share-box"><strong>화면 접속 정보</strong><label>강사 PT 주소</label><div class="share-line"><input id="presenterUrl" readonly value="${presenterUrl}"><button id="copyPresenterUrl">복사</button></div><label>학생 접속 주소</label><div class="share-line"><input id="studentUrl" readonly value="${studentUrl}"><button id="copyUrl">복사</button></div><label>수업 코드</label><div class="share-line"><input readonly value="${roomId}"><button id="copyCode">복사</button></div></div></aside>`}

function speakerNote(){return `<section class="speaker-note" aria-label="발표자 노트"><div class="speaker-note-label"><strong>발표자 노트</strong><span>${state.slide+1} / ${slides.length}</span></div><p>${safe(speakerNotes[state.slide]||'')}</p></section>`}

function presenterSummary(){const total=Math.max(1,presence.students),percent=Math.round(presence.completed/total*100);return `<div class="live-summary"><span>응답 ${presence.responded||0}명</span><span>완료 ${presence.completed}/${presence.students}</span><span class="live-progress"><span style="width:${percent}%"></span></span></div>`}
function activityBoard(){const rows=(activity.slide===state.slide?activity.responses:[]).flatMap((response,studentIndex)=>Object.entries(response).filter(([,value])=>value).map(([label,value])=>`<div class="response-card"><strong>익명 ${studentIndex+1} · ${safe(label)}</strong><span>${safe(value)}</span></div>`));return `<aside class="activity-board"><h2>학생 실시간 응답</h2>${rows.length?rows.join(''):'<p class="response-empty">아직 입력된 응답이 없습니다.</p>'}</aside>`}

function bindCommon(){
  document.querySelectorAll('[data-field]').forEach(input=>input.oninput=()=>{localStorage.setItem(`field-${input.dataset.field}`,input.value);clearTimeout(activityTimer);activityTimer=setTimeout(()=>{const fields=Object.fromEntries([...document.querySelectorAll('[data-field]')].map(field=>[field.previousElementSibling.textContent,field.value]));send({type:'activity',slide:state.slide,fields})},250)});
  const predict=document.querySelector('#predict');if(predict)predict.onclick=()=>{const original=Number(document.querySelector('#original').value),years=Number(document.querySelector('#years').value),battery=Number(document.querySelector('#battery').value);const price=Math.max(90000,Math.round(original*Math.pow(.78,years)*(.72+battery/350)*.88/10000)*10000);document.querySelector('#price').textContent=new Intl.NumberFormat('ko-KR').format(price)+'원';document.querySelector('#explain').textContent='입력을 보내고 계산 결과를 받았습니다. 지금 실제로 서비스를 사용했습니다.';document.querySelector('#json').textContent=JSON.stringify({request:{original_price:original,years_used:years,battery_health:battery},response:{predicted_price:price,model_version:'class-demo-v1'}},null,2)};
}

function bindTeacher(){
  document.querySelector('#prev').onclick=()=>control({slide:state.slide-1});document.querySelector('#next').onclick=()=>control({slide:state.slide+1});document.querySelector('#reveal').onclick=()=>control({revealed:!state.revealed});document.querySelector('#first').onclick=()=>control({slide:0});document.querySelector('#clearTimer').onclick=()=>control({timerEnd:null});
  document.querySelector('#showResponses').onclick=()=>control({showResponses:!state.showResponses});
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
document.addEventListener('keydown',e=>{if(role!=='teacher'||e.target.matches('input,select'))return;if(e.key==='ArrowRight')control({slide:state.slide+1});if(e.key==='ArrowLeft')control({slide:state.slide-1});if(e.key==='r')control({revealed:!state.revealed})});
role==='landing'?landing():(render(),connect());
