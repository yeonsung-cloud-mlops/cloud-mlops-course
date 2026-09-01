const base = process.argv[2] || 'http://localhost:8788';
const created = await fetch(`${base}/api/rooms`, { method: 'POST' });
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

teacher.ws.send(JSON.stringify({ type: 'control', deck: 'week15', slide: 46 }));
await until(student, message => message.type === 'state' && message.state.deck === 'week15' && message.state.slide === 46, '15주차 이동');
student.ws.send(JSON.stringify({ type: 'activity', deck: 'week15', slide: 46, fields: { '학생 응답·질문': '최종 발표 준비 완료' } }));
await until(presenter, message => message.type === 'activity' && message.deck === 'week15' && message.slide === 46 && message.responses.some(response => response['학생 응답·질문'] === '최종 발표 준비 완료'), '학생 응답 반영');
await until(teacher, message => message.type === 'presence' && message.responded === 1, '응답 인원 집계');
student.ws.send(JSON.stringify({ type: 'complete', completed: true }));
await until(teacher, message => message.type === 'presence' && message.completed === 1, '완료 인원 집계');
teacher.ws.send(JSON.stringify({ type: 'control', deck: 'week08', slide: 71 }));
await until(student, message => message.type === 'state' && message.state.deck === 'week08' && message.state.slide === 71, '08주차 마지막 장 이동');

for (const client of [teacher, presenter, student]) client.ws.close();
console.log(JSON.stringify({ roomId, roles: 3, week15LastSlide: 47, week08LastSlide: 72, activity: 'ok', completion: 'ok' }, null, 2));
