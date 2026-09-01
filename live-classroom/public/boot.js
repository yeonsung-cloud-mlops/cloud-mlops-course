const app = document.querySelector('#app');
window.COURSE_INTERACTIONS = {};

function showLoadError(message) {
  app.innerHTML = `<section class="error"><h1>수업 자료를 불러오지 못했습니다</h1><p>${message}</p><button onclick="location.reload()">다시 불러오기</button></section>`;
}

window.loadCourseWeek = async function loadCourseWeek(weekId) {
  const week = window.COURSE_WEEKS?.find((item) => item.id === weekId);
  if (!week) throw new Error(`알 수 없는 주차입니다: ${weekId}`);
  if (Array.isArray(week.slides)) return week;
  if (week.loading) return week.loading;

  week.loading = fetch(`/course-weeks/${weekId}.json`)
    .then((response) => {
      if (!response.ok) throw new Error(`${week.label} 자료를 받지 못했습니다.`);
      return response.json();
    })
    .then((data) => {
      week.slides = data.slides;
      window.COURSE_INTERACTIONS[weekId] = data.interactions || {};
      delete week.loading;
      return week;
    })
    .catch((error) => {
      delete week.loading;
      throw error;
    });

  return week.loading;
};

try {
  await import('/attachments.js');
  await import('/app.js');
} catch (error) {
  console.error(error);
  showLoadError('네트워크 연결을 확인한 뒤 다시 불러와 주세요.');
}
