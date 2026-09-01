const base = process.argv[2] || 'http://localhost:8788';
const instructorCode = process.argv[3] || process.env.INSTRUCTOR_ACCESS_CODE;
if (!instructorCode) throw new Error('강사 접근 코드를 두 번째 인수 또는 INSTRUCTOR_ACCESS_CODE 환경 변수로 전달하세요.');

const unauthorizedCreate = await fetch(`${base}/api/rooms`, { method: 'POST' });
if (unauthorizedCreate.status !== 401) throw new Error(`인증 없는 수업 생성 차단 실패: ${unauthorizedCreate.status}`);

const unauthorizedList = await fetch(`${base}/api/instructor/rooms`);
if (unauthorizedList.status !== 401) throw new Error(`인증 없는 수업 목록 차단 실패: ${unauthorizedList.status}`);

const headers = { authorization: `Bearer ${instructorCode}`, 'content-type': 'application/json' };
const created = await fetch(`${base}/api/rooms`, { method: 'POST', headers });
if (!created.ok) throw new Error(`인증된 수업 생성 실패: ${created.status}`);
const room = await created.json();

const listed = await fetch(`${base}/api/instructor/rooms`, { headers });
if (!listed.ok) throw new Error(`진행 중 수업 목록 조회 실패: ${listed.status}`);
const listing = await listed.json();
const found = listing.rooms.find(item => item.roomId === room.roomId && item.teacherKey === room.teacherKey);
if (!found) throw new Error('새 수업이 진행 중 수업 목록에 없습니다.');

const registered = await fetch(`${base}/api/instructor/register`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ roomId: room.roomId, teacherKey: room.teacherKey }),
});
if (!registered.ok) throw new Error(`기존 수업 등록 실패: ${registered.status}`);

const instructorPage = await fetch(`${base}/instructor`);
if (!instructorPage.ok || !(await instructorPage.text()).includes('id="app"')) throw new Error('/instructor SPA 진입 실패');

console.log(JSON.stringify({
  rootCreateProtected: true,
  instructorListProtected: true,
  roomCreated: room.roomId,
  activeRoomListed: true,
  existingRoomRegistered: true,
  instructorPath: true,
}, null, 2));
