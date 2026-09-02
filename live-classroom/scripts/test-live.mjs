const base = process.argv[2] || 'http://localhost:8788';
const instructorCode = process.argv[3] || process.env.INSTRUCTOR_ACCESS_CODE;
if (!instructorCode) throw new Error('강사 접근 코드를 두 번째 인수 또는 INSTRUCTOR_ACCESS_CODE 환경 변수로 전달하세요.');
const created = await fetch(`${base}/api/rooms`, { method: 'POST', headers: { authorization: `Bearer ${instructorCode}`, 'content-type': 'application/json' }, body: JSON.stringify({ cohortId: 'test' }) });
if (!created.ok) throw new Error(`수업 생성 실패: ${created.status}`);
const { roomId, teacherKey } = await created.json();
const wsBase = base.replace(/^http/, 'ws');
const week01 = await fetch(`${base}/course-weeks/week01.json`).then(response => response.json());
const diagnostic = week01.interactions['11'];

async function authorize(studentId, name, clientId) {
  const response = await fetch(`${base}/api/rooms/${roomId}/join`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ studentId, name, clientId }) });
  if (!response.ok) throw new Error(`학생 인증 실패: ${response.status}`);
  return (await response.json()).token;
}

async function connect(role, key = '', token = '') {
  const messages = [];
  const ws = new WebSocket(`${wsBase}/api/rooms/${roomId}/ws?role=${role}&key=${encodeURIComponent(key)}&token=${encodeURIComponent(token)}`);
  ws.addEventListener('message', event => messages.push(JSON.parse(event.data)));
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  return { ws, messages };
}

async function until(client, predicate, label) {
  const started = Date.now();
  while (Date.now() - started < 5000) {
    const found = client.messages.find(predicate);
    if (found) return found;
    await new Promise(resolve => setTimeout(resolve, 30));
  }
  throw new Error(`${label} 대기 시간 초과`);
}

const clientId = crypto.randomUUID(), clientId2 = crypto.randomUUID(), clientId3 = crypto.randomUUID();
const [token1, token2, token3] = await Promise.all([
  authorize('2099000001', '테스트학생', clientId),
  authorize('2099000002', '테스트학생2', clientId2),
  authorize('2099000003', '테스트학생3', clientId3),
]);
const [teacher, presenter, student] = await Promise.all([
  connect('teacher', teacherKey),
  connect('presenter'),
  connect('student', '', token1),
]);

await until(teacher, message => message.type === 'dashboard' && message.students.some(item => item.clientId === clientId && item.name === '테스트학생') && message.enrollment.length === 3, '명단 기반 출석');

const student2 = await connect('student', '', token2);
const student3 = await connect('student', '', token3);
await until(teacher, message => message.type === 'dashboard' && message.students.some(item => item.clientId === clientId3), '팀원 출석');
student.ws.send(JSON.stringify({ type: 'team', action: 'create', name: '테스트팀' }));
const createdTeam = await until(student, message => message.type === 'teams' && message.items.some(item => item.name === '테스트팀'), '팀 생성');
const team = createdTeam.items.find(item => item.name === '테스트팀');
student2.ws.send(JSON.stringify({ type: 'team', action: 'join', code: team.code }));
student3.ws.send(JSON.stringify({ type: 'team', action: 'join', code: team.code }));
await until(teacher, message => message.type === 'teams' && message.items.some(item => item.id === team.id && item.members.length === 3), '팀 참여');
student.ws.send(JSON.stringify({ type: 'team', action: 'ready', ready: true }));
student2.ws.send(JSON.stringify({ type: 'team', action: 'ready', ready: true }));
student3.ws.send(JSON.stringify({ type: 'team', action: 'ready', ready: true }));
await until(teacher, message => message.type === 'teams' && message.items.some(item => item.id === team.id && item.confirmed), '팀 확정');

teacher.ws.send(JSON.stringify({ type: 'control', deck: 'week01', slide: 10 }));
await until(student, message => message.type === 'state' && message.state.deck === 'week01' && message.state.slide === 10, '1주차 진단 이동');
const diagnosticFields = Object.fromEntries(diagnostic.choices.map((question, index) => [question.label, index % 3 === 0 ? '모르겠다' : question.correct]));
student.ws.send(JSON.stringify({ type: 'activity', deck: 'week01', slide: 10, fields: diagnosticFields }));
await until(teacher, message => message.type === 'activity' && message.deck === 'week01' && message.slide === 10 && Object.keys(message.responses.find(response => response.name === '테스트학생')?.fields || {}).length === 24, '진단 24문항 반영');
teacher.ws.send(JSON.stringify({ type: 'control', deck: 'week01', slide: 11 }));
await until(student, message => message.type === 'state' && message.state.deck === 'week01' && message.state.slide === 11, '진단 해설 이동');
const publicSummary = await until(student, message => message.type === 'activity-summary' && message.deck === 'week01' && message.slide === 10, '익명 진단 집계 공개');
if (publicSummary.total !== 1 || JSON.stringify(publicSummary).includes('테스트학생')) throw new Error('공개 진단 집계에 인원 또는 개인정보 오류가 있습니다.');
const latePresenter = await connect('presenter');
await until(latePresenter, message => message.type === 'activity-summary' && message.deck === 'week01' && message.slide === 10 && message.total === 1, '재접속 진단 집계 복원');

teacher.ws.send(JSON.stringify({ type: 'control', deck: 'week15', slide: 46 }));
await until(student, message => message.type === 'state' && message.state.deck === 'week15' && message.state.slide === 46, '15주차 이동');
student.ws.send(JSON.stringify({ type: 'activity', deck: 'week15', slide: 46, fields: { '학생 답안': '최종 발표 준비 완료' } }));
await until(presenter, message => message.type === 'activity' && message.deck === 'week15' && message.slide === 46 && message.responses.some(response => response.name === '학생 1' && response.fields['학생 답안'] === '최종 발표 준비 완료') && !JSON.stringify(message).includes('테스트학생'), '익명 답안 반영');
await until(teacher, message => message.type === 'presence' && message.responded === 1, '응답 인원 집계');
student.ws.send(JSON.stringify({ type: 'complete', completed: true }));
await until(teacher, message => message.type === 'presence' && message.completed === 1, '완료 인원 집계');
student.ws.send(JSON.stringify({ type: 'question', deck: 'week15', slide: 46, text: '제출 파일 이름은 무엇인가요?' }));
const questionDashboard = await until(teacher, message => message.type === 'dashboard' && message.questions.some(item => item.clientId === clientId && item.text.includes('제출 파일')), '학생 질문 반영');
const question = questionDashboard.questions.find(item => item.clientId === clientId && item.text.includes('제출 파일'));
teacher.ws.send(JSON.stringify({ type: 'answer-question', questionId: question.id, answer: '팀 이름을 포함해 제출하세요.' }));
await until(student, message => message.type === 'my-questions' && message.questions.some(item => item.id === question.id && item.answer.includes('팀 이름')), '강사 답변 반영');
teacher.ws.send(JSON.stringify({ type: 'control', deck: 'week08', slide: 71 }));
await until(student, message => message.type === 'state' && message.state.deck === 'week08' && message.state.slide === 71, '08주차 마지막 장 이동');

for (const client of [teacher, presenter, latePresenter, student, student2, student3]) client.ws.close();
console.log(JSON.stringify({ roomId, roles: 3, attendance: 'ok', teamCreateJoinConfirm: 'ok', diagnosticAnswers: 24, anonymousReview: 'ok', reconnectReview: 'ok', anonymousPresenterAnswers: 'ok', completion: 'ok', qa: 'ok', week01LastSlide: 94, week15LastSlide: 47, week08LastSlide: 72 }, null, 2));
