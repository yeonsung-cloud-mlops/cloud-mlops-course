# 장표 첨부파일 관리

학생에게 배포할 파일은 `public/downloads/<주차>/`에 둡니다. 그런 다음
`public/attachments.js`에서 주차와 장표 번호에 맞춰 파일 정보를 연결합니다.

```js
window.COURSE_ATTACHMENTS = {
  week01: {
    9: [
      {
        label: '학생 화면에 보일 이름',
        filename: '실제-파일명.zip',
        url: '/downloads/week01/실제-파일명.zip',
        meta: 'ZIP',
      },
    ],
  },
};
```

- 장표 번호는 1부터 시작합니다.
- 학생 화면에서는 현재 장표 아래에 `첨부파일`로 표시됩니다.
- 강사 제어 화면에서는 발표자 노트 아래에 같은 파일이 표시됩니다.
- 외부 웹 문서는 기존 `slide.links`를 사용하고, 내려받을 수업 파일은 첨부파일로 구분합니다.
