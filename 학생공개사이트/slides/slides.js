const weeks = [
  ['01','MLOps 개요와 클라우드 첫걸음'],['02','Linux와 EC2 개발 환경'],
  ['03','데이터 파이프라인과 문제 정의'],['04','베이스라인 모델 만들기'],
  ['05','MLflow 실험 관리'],['06','Docker와 Amazon ECR'],
  ['07','FastAPI 모델 서빙'],['08','EC2 배포와 데모 화면'],
  ['09','프로젝트 통합·보강'],['10','Amazon SageMaker AI'],
  ['11','Amazon Bedrock 보조 기능'],['12','GitHub Actions 배포 자동화'],
  ['13','CloudWatch 모니터링과 운영'],['14','다른 팀이 README로 재현'],
  ['15','최종 시연과 리소스 정리']
];

const state = { week:'01', slide:0, scenes:[], sourceUrl:'', links:[] };
const $ = selector => document.querySelector(selector);

function escapeHtml(value='') {
  return value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
}

function inlineMarkdown(text, baseUrl) {
  let value = escapeHtml(text);
  value = value.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_,alt,href) => `<img src="${new URL(href,baseUrl).href}" alt="${alt}">`);
  value = value.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_,label,href) => {
    const url = new URL(href,baseUrl).href;
    const external = /^https?:/.test(url);
    return `<a href="${url}"${external?' target="_blank" rel="noopener"':''}>${label}${external?' ↗':''}</a>`;
  });
  value = value.replace(/&lt;(https?:\/\/[^&]+)&gt;/g, '<a href="$1" target="_blank" rel="noopener">$1 ↗</a>');
  value = value.replace(/`([^`]+)`/g,'<code>$1</code>');
  value = value.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
  value = value.replace(/\*([^*]+)\*/g,'<em>$1</em>');
  return value;
}

function renderMarkdown(markdown, baseUrl) {
  const lines = markdown.split(/\r?\n/);
  let html='', list=null, quote=[], code=false, codeLines=[], table=[];
  const closeList=()=>{if(list){html+=`</${list}>`;list=null}};
  const flushQuote=()=>{if(quote.length){html+=`<blockquote><p>${inlineMarkdown(quote.join(' '),baseUrl)}</p></blockquote>`;quote=[]}};
  const flushTable=()=>{
    if(!table.length)return;
    const rows=table.map(line=>line.trim().replace(/^\||\|$/g,'').split('|').map(x=>x.trim()));
    if(rows.length>1 && rows[1].every(x=>/^:?-{3,}:?$/.test(x))){
      html+='<table><thead><tr>'+rows[0].map(x=>`<th>${inlineMarkdown(x,baseUrl)}</th>`).join('')+'</tr></thead><tbody>'+
        rows.slice(2).map(row=>'<tr>'+row.map(x=>`<td>${inlineMarkdown(x,baseUrl)}</td>`).join('')+'</tr>').join('')+'</tbody></table>';
    } else table.forEach(line=>html+=`<p>${inlineMarkdown(line,baseUrl)}</p>`);
    table=[];
  };
  for(const raw of lines){
    const line=raw.trimEnd();
    if(line.startsWith('```')){flushTable();closeList();flushQuote();if(code){html+=`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`;codeLines=[]}code=!code;continue}
    if(code){codeLines.push(raw);continue}
    if(/^\|.*\|$/.test(line.trim())){closeList();flushQuote();table.push(line);continue}else flushTable();
    if(line.startsWith('>')){closeList();quote.push(line.replace(/^>\s?/,''));continue}else flushQuote();
    if(!line.trim()){closeList();continue}
    if(/^---+$/.test(line.trim())){closeList();html+='<hr>';continue}
    const heading=line.match(/^(#{1,6})\s+(.+)$/);if(heading){closeList();const n=Math.min(3,heading[1].length);html+=`<h${n}>${inlineMarkdown(heading[2],baseUrl)}</h${n}>`;continue}
    const bullet=line.match(/^[-*]\s+(.+)$/);if(bullet){if(list!=='ul'){closeList();html+='<ul>';list='ul'}html+=`<li>${inlineMarkdown(bullet[1],baseUrl)}</li>`;continue}
    const numbered=line.match(/^\d+[.)]\s+(.+)$/);if(numbered){if(list!=='ol'){closeList();html+='<ol>';list='ol'}html+=`<li>${inlineMarkdown(numbered[1],baseUrl)}</li>`;continue}
    closeList();html+=`<p>${inlineMarkdown(line,baseUrl)}</p>`;
  }
  flushTable();closeList();flushQuote();
  return html;
}

function splitScenes(markdown, baseUrl) {
  const title=(markdown.match(/^#\s+(.+)$/m)||[])[1]||`${state.week}주차`;
  const chunks=[];let current=null,inCode=false;
  for(const line of markdown.split(/\r?\n/)){
    if(line.trim().startsWith('```'))inCode=!inCode;
    const heading=!inCode?line.match(/^(#{2,3})\s+(.+)$/):null;
    if(heading){if(current)chunks.push(current);current={title:heading[2],lines:[]};continue}
    if(current)current.lines.push(line);
  }
  if(current)chunks.push(current);
  const scenes=chunks.map(chunk=>({title:chunk.title,html:renderMarkdown(chunk.lines.join('\n').trim(),baseUrl),kind:'content'}));
  if(state.week==='01') scenes.unshift({title:'중고 노트북 가격 예측 서비스',html:'',kind:'hook'});
  return {title,scenes};
}

function hookScene(){
  return `<section class="scene"><p class="scene-kicker">01주차 · 첫 8분</p><h1>이 노트북, 중고로 얼마에 올릴까요?</h1>
    <div class="hook-layout"><div class="hook-card"><h2>노트북 상태 입력</h2>
      <label for="original">새 제품 가격</label><input id="original" type="number" value="1500000" min="300000" step="100000">
      <label for="years">사용 기간</label><select id="years"><option value="1">1년</option><option value="2">2년</option><option value="3" selected>3년</option><option value="4">4년</option><option value="5">5년 이상</option></select>
      <label for="battery">배터리 성능</label><input id="battery" type="number" value="78" min="40" max="100">
      <label for="condition">외관 상태</label><select id="condition"><option value="1">A · 거의 새 제품</option><option value="0.88" selected>B · 생활 흠집</option><option value="0.72">C · 눈에 띄는 흠집</option></select>
      <button class="predict-button" id="predictButton" type="button">예상 가격 보기</button></div>
      <div class="hook-card" aria-live="polite"><h2>서비스 응답</h2><div class="prediction" id="prediction">—</div><p id="predictionExplain">왼쪽 값을 바꾸고 버튼을 누르세요. 입력과 결과가 한 화면에서 이어집니다.</p><pre id="predictionJson">POST /predict\n\n아직 요청하지 않았습니다.</pre></div></div>
    <p class="truth-note" id="truthNote">아직 버튼을 누르지 않았다면 서비스를 사용한 것이 아닙니다. 직접 입력하고 결과를 받은 뒤에 다음 장면으로 넘어갑니다.</p></section>`;
}

function attachHook(){
  const button=$('#predictButton');if(!button)return;
  button.addEventListener('click',()=>{
    const original=Number($('#original').value),years=Number($('#years').value),battery=Number($('#battery').value),condition=Number($('#condition').value);
    const price=Math.max(90000,Math.round(original*Math.pow(.78,years)*(.72+Math.max(0,Math.min(100,battery))/350)*condition/10000)*10000);
    $('#prediction').textContent=new Intl.NumberFormat('ko-KR').format(price)+'원';
    $('#predictionExplain').textContent='입력을 보내고 계산 결과를 받았습니다. 지금은 실제로 동작하는 수업용 서비스를 사용한 상태입니다.';
    $('#predictionJson').textContent=JSON.stringify({request:{original_price:original,years_used:years,battery_health:battery,condition:$('#condition').selectedOptions[0].text.slice(0,1)},response:{predicted_price:price,model_version:'class-demo-v1'}},null,2);
    $('#truthNote').textContent='지금 실제로 서비스를 사용했습니다: 입력 → 요청 → 계산 → 응답이 브라우저 안에서 끝까지 실행됐습니다.';
  });
}

function decorateLinks(){
  state.links=[...$('#stage').querySelectorAll('a[href]')];
  state.links.forEach(link=>{
    const href=link.href;
    link.classList.add('link-button');
    if(href.includes('console.aws.amazon.com')||href.includes('aws.amazon.com'))link.classList.add('aws');
    if(href.includes('/demos/'))link.classList.add('demo');
  });
}

function renderScene(){
  const scene=state.scenes[state.slide];if(!scene)return;
  $('#stage').innerHTML=scene.kind==='hook'?hookScene():`<section class="scene"><p class="scene-kicker">${state.week}주차 · 장면 ${state.slide+1}</p><h1>${escapeHtml(scene.title)}</h1>${scene.html}</section>`;
  $('#stage').scrollTop=0;attachHook();decorateLinks();
  $('#progressText').textContent=`${state.slide+1} / ${state.scenes.length}`;
  $('#progressBar').style.width=`${(state.slide+1)/state.scenes.length*100}%`;
  $('#previousButton').disabled=state.slide===0;
  $('#nextButton').disabled=state.slide===state.scenes.length-1;
  [...$('#chapterList').children].forEach((button,index)=>button.classList.toggle('active',index===state.slide));
  localStorage.setItem(`cloud-mlops-week-${state.week}`,String(state.slide));
  history.replaceState(null,'',`?week=${state.week}&slide=${state.slide+1}`);
}

function buildChapters(){
  $('#chapterList').innerHTML='';
  state.scenes.forEach((scene,index)=>{
    const button=document.createElement('button');button.type='button';
    button.innerHTML=`<span class="num">${String(index+1).padStart(2,'0')}</span><span class="title">${escapeHtml(scene.title)}</span>`;
    button.addEventListener('click',()=>{state.slide=index;renderScene();closeMenu()});
    $('#chapterList').append(button);
  });
}

async function loadWeek(week,requestedSlide){
  state.week=week;state.sourceUrl=new URL(`../downloads/lectures/week${week}.md`,location.href).href;
  $('#stage').innerHTML='<section class="loading-card"><p>수업자료를 불러오고 있습니다.</p></section>';
  try{
    const response=await fetch(state.sourceUrl);if(!response.ok)throw new Error('교안 파일을 찾지 못했습니다.');
    const parsed=splitScenes(await response.text(),state.sourceUrl);state.scenes=parsed.scenes;
    const saved=Number(localStorage.getItem(`cloud-mlops-week-${week}`)||0);
    state.slide=Math.max(0,Math.min(state.scenes.length-1,Number.isFinite(requestedSlide)?requestedSlide:saved));
    $('#weekLabel').textContent=`${week}주차`;$('#lessonTitle').textContent=parsed.title.replace(/^\d+주차\s*[—-]\s*/, '');$('#weekSelect').value=week;
    buildChapters();renderScene();
  }catch(error){$('#stage').innerHTML=`<section class="scene"><h1>수업자료를 열 수 없습니다</h1><p>${escapeHtml(error.message)}</p><p>파일을 직접 열지 말고 공개사이트 주소로 접속해 주세요.</p></section>`}
}

function openMenu(){$('#navigator').classList.add('open');$('#scrim').classList.add('show')}
function closeMenu(){$('#navigator').classList.remove('open');$('#scrim').classList.remove('show')}
function showResources(){
  const list=$('#resourceList');list.innerHTML='';
  if(!state.links.length)list.innerHTML='<p class="resource-empty">이 장면에서 따로 열 링크는 없습니다. 설명과 활동을 이 화면에서 계속합니다.</p>';
  state.links.forEach((link,index)=>{const a=document.createElement('a');a.href=link.href;a.target='_blank';a.rel='noopener';a.innerHTML=`<span>${escapeHtml(link.textContent.trim()||`링크 ${index+1}`)}</span><b>열기 ↗</b>`;list.append(a)});
  $('#resourcesDialog').showModal();
}

weeks.forEach(([number,title])=>{const option=document.createElement('option');option.value=number;option.textContent=`${number}주차 · ${title}`;$('#weekSelect').append(option)});
$('#menuButton').addEventListener('click',openMenu);$('#closeMenuButton').addEventListener('click',closeMenu);$('#scrim').addEventListener('click',closeMenu);
$('#weekSelect').addEventListener('change',event=>loadWeek(event.target.value,0));
$('#previousButton').addEventListener('click',()=>{if(state.slide>0){state.slide--;renderScene()}});
$('#nextButton').addEventListener('click',()=>{if(state.slide<state.scenes.length-1){state.slide++;renderScene()}});
$('#resourcesButton').addEventListener('click',showResources);
$('#fullscreenButton').addEventListener('click',()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen());
document.addEventListener('keydown',event=>{
  if(event.target.matches('input,select,button')||$('#resourcesDialog').open)return;
  if(['ArrowRight','PageDown',' '].includes(event.key)){$('#nextButton').click();event.preventDefault()}
  if(['ArrowLeft','PageUp'].includes(event.key)){$('#previousButton').click();event.preventDefault()}
  if(event.key==='m')openMenu();if(event.key==='r')showResources();
});
const params=new URLSearchParams(location.search);const initialWeek=weeks.some(([n])=>n===params.get('week'))?params.get('week'):'01';const initialSlide=Math.max(0,Number(params.get('slide')||1)-1);
loadWeek(initialWeek,initialSlide);
