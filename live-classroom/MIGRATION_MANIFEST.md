# 전체 슬라이드 이관 명세

현재 수업의 기준 원본은 `live-classroom/public`의 웹 콘텐츠입니다. 1주차는 웹 고유 콘텐츠이며, 2~15주차의 기존 렌더링 자산은 웹 콘텐츠로 순차 재작성하는 동안만 유지합니다.

| 주차 | 슬라이드 수 | 웹 자산 경로 |
|---|---:|---|
| 01주차 | 70 | `public/interactive-content.js`, `public/week01-opening.js`, `public/assets/week01/` |
| 02주차 | 37 | `public/assets/decks/week02/` |
| 03주차 | 36 | `public/assets/decks/week03/` |
| 04주차 | 36 | `public/assets/decks/week04/` |
| 05주차 | 35 | `public/assets/decks/week05/` |
| 06주차 | 37 | `public/assets/decks/week06/` |
| 07주차 | 37 | `public/assets/decks/week07/` |
| 08주차 | 72 | `public/assets/decks/week08/` |
| 09주차 | 31 | `public/assets/decks/week09/` |
| 10주차 | 68 | `public/assets/decks/week10/` |
| 11주차 | 51 | `public/assets/decks/week11/` |
| 12주차 | 46 | `public/assets/decks/week12/` |
| 13주차 | 47 | `public/assets/decks/week13/` |
| 14주차 | 42 | `public/assets/decks/week14/` |
| 15주차 | 47 | `public/assets/decks/week15/` |
| 합계 | **692** | `public/assets/decks/` |

1주차는 학생 입력 요소, 장표별 강사용 권장 시간, 첨부파일, AWS 콘솔 이동 경로와 공식 문서를 웹 콘텐츠에 직접 담았습니다. 학생 응답은 Durable Objects와 WebSocket으로 강사 제어·PT 화면에 전달됩니다. 2~15주차는 현재 `public/assets/decks`의 기존 렌더링 자산과 `public/course-data.js`를 사용하며, `CONTENT_AUTHORING_GUIDE.md`에 따라 웹 고유 콘텐츠로 교체합니다.
