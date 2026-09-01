const base = process.argv[2] || 'http://localhost:8788';
const instructorCode = process.argv[3] || process.env.INSTRUCTOR_ACCESS_CODE;
if (!instructorCode) throw new Error('강사 접근 코드를 두 번째 인수 또는 INSTRUCTOR_ACCESS_CODE 환경 변수로 전달하세요.');
const created = await fetch(`${base}/api/rooms`, { method: 'POST', headers: { authorization: `Bearer ${instructorCode}` } });
if (!created.ok) throw new Error(`수업 생성 실패: ${created.status}`);
const { roomId, teacherKey } = await created.json();
const wsBase = base.replace(/^http/, 'ws');

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

for (const client of [teacher, presenter, student]) client.ws.close();
console.log(JSON.stringify({ roomId, roles: 3, attendance: 'ok', namedAnswers: 'ok', completion: 'ok', qa: 'ok', week15LastSlide: 47, week08LastSlide: 72 }, null, 2));
