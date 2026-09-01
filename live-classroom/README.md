# 클라우드 MLOps 라이브 클래스룸

강사용 단말에서 학생용 슬라이드를 실시간으로 제어하는 Cloudflare Workers 기반 수업도구다.

## 화면

- 강사용: 수업 생성, 이전/다음 장면, 추가 내용 공개, 타이머, 접속·완료 인원 확인
- 학생용: 수업 코드 참여, 실시간 장면 동기화, 개인 입력 저장, 장면 완료 표시

## 구조

- Cloudflare Workers Static Assets: 강사용·학생용 웹 화면
- Durable Objects: 수업 세션별 상태와 접속자 관리
- Hibernatable WebSockets: 실시간 장면 전환과 낮은 유휴 비용

## 실행

```bash
npm run dev
npm run check
npm run deploy
```

수업 세션은 생성 후 12시간 동안 유지된다. 강사용 URL의 `key` 값은 학생에게 공유하지 않는다.
