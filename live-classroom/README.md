# 클라우드 MLOps 라이브 클래스룸

강사용 단말에서 학생용 슬라이드를 실시간으로 제어하는 Cloudflare Workers 기반 수업도구다. 개정 PPTX 15개에 포함된 686장을 모두 웹용 슬라이드로 제공한다.

- 학생 접속 주소: `https://0060.kr`
- 보조 접속 주소: `https://www.0060.kr`
- 비상용 Workers 주소: `https://cloud-mlops-live-classroom.hexai.workers.dev`

## 화면

- 강사 제어용: 1~15주차 선택, 현재 주차/전체 686장 진행 위치와 현재 시각 확인, 이전/다음·번호 이동, 슬라이드 하단 발표자 노트와 원문 링크, 응답 공개, 타이머, 접속·입력·완료 인원 확인
- 강사 PT용: 프로젝터 전용 16:9 장표, 전체 화면, 제어 정보와 학생 입력란 숨김, 학생 응답·완료 현황 표시
- 학생용: 수업 코드 참여, 실시간 주차·장면 동기화, 모든 장표에서 답변·질문 입력, 관련 링크 열기, 장면 완료 표시
- 학생 입력은 익명으로 집계되며, 강사가 공개를 선택한 경우에만 PT 화면에 표시

## 전체 이관 현황

- 01주차 64장 · 02주차 37장 · 03주차 36장
- 04주차 36장 · 05주차 35장 · 06주차 37장
- 07주차 37장 · 08주차 72장 · 09주차 31장
- 10주차 68장 · 11주차 51장 · 12주차 46장
- 13주차 47장 · 14주차 42장 · 15주차 47장
- 합계 686장

`scripts/import-course.mjs`는 PPTX의 발표자 노트와 외부 링크를 `public/course-data.js`로 변환한다. `scripts/render-course.mjs`는 모든 장표를 웹용 WebP 이미지로 변환한다.

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
