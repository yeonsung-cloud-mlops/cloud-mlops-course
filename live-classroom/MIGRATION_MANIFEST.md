# 전체 슬라이드 이관 명세

2~15주차의 기준 원본은 `개정본/PPT`의 주차별 개정 PPTX입니다. 1주차는 PPT 이미지를 사용하지 않고 64장 전체를 웹 고유 콘텐츠로 다시 구성했습니다.

| 주차 | 슬라이드 수 | 웹 자산 경로 |
|---|---:|---|
| 01주차 | 64 | `public/interactive-content.js`, `public/assets/week01/` |
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
| 합계 | **686** | `public/assets/decks/` |

1주차는 학생 입력 요소, 장표별 권장 시간, 첨부파일, AWS 콘솔 이동 경로와 공식 문서를 웹 콘텐츠에 직접 담았습니다. 학생 응답은 Durable Objects와 WebSocket으로 강사 제어·PT 화면에 전달됩니다. 2~15주차는 원본 PPTX의 렌더링 결과와 `public/course-data.js`의 발표자 노트·외부 링크를 사용합니다.
