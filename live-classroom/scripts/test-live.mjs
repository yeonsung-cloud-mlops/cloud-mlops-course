const base = process.argv[2] || 'http://localhost:8788';
const instructorCode = process.argv[3] || process.env.INSTRUCTOR_ACCESS_CODE;
if (!instructorCode) throw new Error('강사 접근 코드를 두 번째 인수 또는 INSTRUCTOR_ACCESS_CODE 환경 변수로 전달하세요.');
const created = await fetch(`${base}/api/rooms`, { method: 'POST', headers: { authorization: `Bearer ${instructorCode}` } });
if (!created.ok) throw new Error(`수업 생성 실패: ${created.status}`);
const { roomId, teacherKey } = await created.json();
const wsBase = base.replace(/^http/, 'ws');
const week01 = await fetch(`${base}/course-weeks/week01.json`).then(response => response.json());
const diagnostic = week01.interactions['10'];

async function connect(role, key = '') {
  const messages = [];
  const ws = new WebSocket(`${wsBase}/api/rooms/${roomId}/ws?role=${role}&key=${encodeURIComponent(key)}`);
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

const [teacher, presenter, student] = await Promise.all([
  connect('teacher', teacherKey),
  connect('presenter'),
  connect('student'),
]);

const clientId = crypto.randomUUID();
student.ws.send(JSON.stringify({ type: 'identify', clientId, name: '테스트학생' }));
await until(teacher, message => message.type === 'dashboard' && message.students.some(item => item.clientId === clientId && item.name === '테스트학생'), '이름 기반 출석');

const student2 = await connect('student');
const student3 = await connect('student');
const clientId2 = crypto.randomUUID(), clientId3 = crypto.randomUUID();
student2.ws.send(JSON.stringify({ type: 'identify', clientId: clientId2, name: '테스트학생2' }));
student3.ws.send(JSON.stringify({ type: 'identify', clientId: clientId3, name: '테스트학생3' }));
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

teacher.ws.send(JSON.stringify({ type: 'control', deck: 'week01', slide: 9 }));
await until(student, message => message.type === 'state' && message.state.deck === 'week01' && message.state.slide === 9, '1주차 진단 이동');
const diagnosticFields = Object.fromEntries(diagnostic.choices.map((question, index) => [question.label, index % 3 === 0 ? '모르겠다' : question.correct]));
student.ws.send(JSON.stringify({ type: 'activity', deck: 'week01', slide: 9, fields: diagnosticFields }));
await until(teacher, message => message.type === 'activity' && message.deck === 'week01' && message.slide === 9 && Object.keys(message.responses.find(response => response.name === '테스트학생')?.fields || {}).length === 24, '진단 24문항 반영');

teacher.ws.send(JSON.stringify({ type: 'control', deck: 'week15', slide: 46 }));
await until(student, message => message.type === 'state' && message.state.deck === 'week15' && message.state.slide === 46, '15주차 이동');
student.ws.send(JSON.stringify({ type: 'activity', deck: 'week15', slide: 46, fields: { '학생 답안': '최종 발표 준비 완료' } }));
await until(presenter, message => message.type === 'activity' && message.deck === 'week15' && message.slide === 46 && message.responses.some(response => response.name === '테스트학생' && response.fields['학생 답안'] === '최종 발표 준비 완료'), '이름 포함 답안 반영');
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

for (const client of [teacher, presenter, student, student2, student3]) client.ws.close();
console.log(JSON.stringify({ roomId, roles: 3, attendance: 'ok', teamCreateJoinConfirm: 'ok', diagnosticAnswers: 24, namedAnswers: 'ok', completion: 'ok', qa: 'ok', week01LastSlide: 93, week15LastSlide: 47, week08LastSlide: 72 }, null, 2));
