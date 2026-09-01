const activity = (kicker, title, copy, options = {}) => ({ kicker, title, copy, ...options });

window.COURSE_INTERACTIONS = {
  week01: {
    1: activity('1주차 · 200분', '오늘은 팀을 만들고, 주제를 고르고, AWS에 첫 파일을 올립니다', '설명을 듣고 끝나는 날이 아닙니다. 수업이 끝나면 다음 주에 이어 쓸 결과물이 실제로 남아 있어야 합니다.', {
      items: ['팀 등록표와 역할표', '프로젝트 후보 두 개', '서울 리전의 비공개 S3 버킷', 'sample-bike.csv와 CloudShell 확인 결과'],
      callout: '학생 접속: 0060.kr · 화면에 보이는 수업 코드를 입력하세요.',
    }),
    2: activity('1교시 · 먼저 예상하기', '이 노트북, 얼마에 올리겠습니까?', '새 제품 150만 원 · 3년 사용 · 배터리 78% · 외관 B등급', {
      fields: [
        { label: '내 예상 가격', placeholder: '예: 650000원' },
        { label: '그렇게 생각한 이유', placeholder: '한 문장으로 적으세요' },
      ],
      reveal: '정답을 맞히는 문제가 아닙니다. 같은 정보를 보고도 판단 기준이 얼마나 다른지 확인합니다.',
    }),
    3: activity('직접 실행', '값을 바꾸고 계산 결과를 받아보세요', '브라우저가 서버의 계산 API를 호출합니다. 이 계산 API는 실제로 동작하지만 머신러닝 모델은 아닙니다.', {
      type: 'demo',
    }),
    4: activity('계산 결과를 본 뒤', '방금 쓴 것은 ML 모델이 아니라 규칙 계산기입니다', '입력값을 정해진 식에 넣어 결과를 돌려주는 웹 화면입니다.', {
      choices: [{ label: '지금 화면에 반드시 필요한 것', options: ['입력 화면', '계산 주소(API)', '계산 규칙', '요청 기록'] }],
      reveal: '7주차에는 계산 규칙 자리에 실제 머신러닝 모델을 연결합니다.',
    }),
    5: activity('흐름 맞추기', '버튼을 누른 뒤 어떤 순서로 움직일까요?', '네 단계를 올바른 순서로 적어 보세요.', {
      fields: [
        { label: '1단계', placeholder: '입력·요청·계산·기록 중 선택' },
        { label: '2단계', placeholder: '다음 단계' },
        { label: '3단계', placeholder: '다음 단계' },
        { label: '4단계', placeholder: '마지막 단계' },
      ],
      reveal: '입력 확인 → API 요청 → 계산 결과 → 요청 기록',
    }),
    6: activity('왜 운영이 필요한가', '계산이 맞는 것과 계속 쓸 수 있는 것은 다릅니다', '같은 계산 코드라도 화면, 실행 환경, 데이터, 기록이 흩어지면 다음 사람이 이어서 쓸 수 없습니다.', {
      items: ['어떤 입력을 받았는가', '어떤 코드와 설정으로 계산했는가', '누가 언제 실행했는가', '문제가 생겼을 때 어디서 확인하는가'],
      choices: [{ label: '가장 먼저 무너질 것 같은 부분', options: ['파일 버전', '실행 환경', '입력 데이터', '오류 기록'] }],
    }),
    7: activity('오늘 수업의 연결', 'MLOps는 모델 주변의 작업을 이어 주는 방법입니다', '이번 학기에는 데이터 준비부터 서비스 화면과 운영 기록까지 하나의 흐름으로 만듭니다.', {
      items: ['데이터 준비', '학습과 평가', 'API 연결', '컨테이너 배포', '관찰과 개선'],
      fields: [{ label: '가장 궁금한 단계', placeholder: '한 단계를 골라 적으세요' }],
    }),
    8: activity('수업 운영', '네 번의 50분이 이렇게 이어집니다', '교시 사이에는 10분씩 쉽니다. 각 교시가 끝날 때 학생 화면의 완료 상태를 함께 확인합니다.', {
      items: ['1교시: 계산 화면 체험과 수업 파일 준비', '2교시: 3~4명 팀 구성과 역할 결정', '3교시: 프로젝트 후보 비교와 두 개 선정', '4교시: AWS 로그인, S3 버킷, CloudShell'],
      checklist: ['학생 화면 접속', '표시 이름 입력', '수업 파일 저장 위치 준비'],
    }),
    9: activity('파일 받기 · 5분', '이 장표에서 팀 시작 파일을 받으세요', '아래 첨부파일을 내려받은 뒤 브라우저 다운로드 목록에서 저장 위치를 확인합니다.', {
      checklist: ['팀 시작 ZIP 파일 다운로드', '저장 위치 확인'],
    }),
    10: activity('파일 준비 · 5분', 'ZIP을 풀고 작업 폴더를 여세요', '압축파일 안에서 바로 편집하지 않습니다.', {
      checklist: ['ZIP 압축 풀기', 'team-start-kit 폴더 열기', 'README.md와 verify.sh 확인'],
      fields: [{ label: '내 작업 폴더 위치', placeholder: '예: 다운로드/team-start-kit' }],
    }),
    11: activity('README 확인 · 3분', '오늘 작성할 파일을 직접 찾아보세요', 'README.md의 1주차 항목을 읽고 필요한 파일을 표시합니다.', {
      checklist: ['SKILL_PASSPORT.md', 'TEAM_REGISTRATION.md', 'TEAM_CHARTER.md', 'ROLE_ROTATION.csv', 'PROJECT_IDEA_CARD.md'],
      fields: [{ label: '처음 보는 파일', placeholder: '궁금한 파일 이름을 적으세요' }],
    }),
    12: activity('생각 고르기 · 4분', '우리 팀에서 가장 먼저 생길 것 같은 문제는?', '하나를 고르고 이유를 적으세요.', {
      choices: [{ label: '예상 문제', options: ['내 컴퓨터에서는 됐는데요', '지난 결과를 어떻게 만들었지', '어제까지 됐는데 왜 안 되지'] }],
      fields: [{ label: '고른 이유', placeholder: '한 문장으로 적으세요' }],
    }),
    13: activity('버전 규칙 · 2분', 'final2 대신 알아볼 수 있는 이름을 만드세요', '날짜와 수정 목적이 보이게 씁니다.', {
      fields: [{ label: '우리 팀 파일 이름 예시', placeholder: '예: 2026-03-03-topic-score-v1.csv' }],
    }),
    14: activity('재현 확인 · 2분', '옆 사람이 다시 실행하려면 무엇이 필요할까요?', '누가, 어디서, 무엇을 실행했는지 적습니다.', {
      fields: [
        { label: '실행한 사람', placeholder: '이름 또는 역할' },
        { label: '실행한 환경', placeholder: '예: CloudShell' },
        { label: '실행한 명령', placeholder: '명령 또는 파일 이름' },
      ],
    }),
    15: activity('로그 확인 · 2분', '오류가 나면 무엇을 남겨야 할까요?', '비밀번호나 키는 절대 기록하지 않습니다.', {
      checklist: ['오류가 난 시각', '실행한 명령', '오류 문장 전체', '비밀값이 없는지 확인'],
    }),
    16: activity('1교시 확인', '다음 세 항목이 끝났나요?', '완료하지 못한 항목이 있으면 질문을 남기세요.', {
      checklist: ['팀 시작 파일 다운로드', '압축 해제', 'README 확인'],
      fields: [{ label: '도움이 필요한 점', placeholder: '없으면 “없음”이라고 적으세요' }],
    }),
    17: activity('2교시 · 50분', '이번 교시에는 팀이 실제로 만들어져야 합니다', '친한 사람끼리 먼저 묶기보다 경험과 희망 역할을 확인한 뒤 3~4명으로 구성합니다.', {
      items: ['개인 경험 정리', '30초 소개', '여러 사람과 대화', '임시 팀 구성', '역할·규칙·연락 방식 확정'],
      callout: '역할은 실력 등급이 아니라 이번 작업에서 맡을 책임입니다.',
    }),
    18: activity('2교시 · 개인 확인 · 6분', '내가 할 수 있는 일부터 적습니다', '실력을 평가하는 시간이 아니라 팀에 줄 수 있는 경험을 찾는 시간입니다.', {
      fields: [
        { label: '해 본 일 한 가지', placeholder: '수업·프로젝트·아르바이트 경험도 좋습니다' },
        { label: '맡아 보고 싶은 역할 1순위', placeholder: '데이터·모델·배포·검증' },
        { label: '맡아 보고 싶은 역할 2순위', placeholder: '다른 역할 하나' },
      ],
    }),
    19: activity('30초 소개 · 4분', '한 문장으로 자신을 소개하세요', '해 본 일, 맡고 싶은 일, 도울 수 있는 일을 포함합니다.', {
      fields: [{ label: '30초 소개 문장', placeholder: '저는 …을 해 봤고, …을 맡고 싶으며, …을 도울 수 있습니다.' }],
      checklist: ['옆 사람에게 실제로 말해 보기'],
    }),
    20: activity('팀 구성판 · 4분', '이름과 희망 역할을 올리세요', '연락처나 민감한 개인정보는 적지 않습니다.', {
      fields: [
        { label: '표시할 이름', placeholder: '수업에서 사용할 이름' },
        { label: '희망 역할', placeholder: '데이터·모델·배포·검증' },
        { label: '해 본 일', placeholder: '짧게 적으세요' },
      ],
    }),
    21: activity('교실 이동 · 6분', '서로 다른 역할의 네 명과 이야기하세요', '같은 친구끼리 바로 팀을 만들지 말고 선택지를 넓힙니다.', {
      fields: [
        { label: '대화한 사람 1', placeholder: '이름 · 역할' },
        { label: '대화한 사람 2', placeholder: '이름 · 역할' },
        { label: '대화한 사람 3', placeholder: '이름 · 역할' },
        { label: '대화한 사람 4', placeholder: '이름 · 역할' },
      ],
    }),
    22: activity('임시 팀 · 6분', '3~4명으로 팀을 만드세요', '모든 팀원이 자신의 화면에 같은 팀 이름을 입력합니다.', {
      fields: [
        { label: '팀 이름', placeholder: '짧고 구분되는 이름' },
        { label: '팀원', placeholder: '쉼표로 구분해 적으세요' },
      ],
      choices: [{ label: '팀원 수', options: ['3명', '4명'] }],
    }),
    23: activity('역할 균형 · 5분', '네 역할에 이름을 놓아 보세요', '3명 팀은 겸임할 수 있지만 작성자와 검증자는 다르게 둡니다.', {
      fields: [
        { label: '데이터', placeholder: '담당자' },
        { label: '모델', placeholder: '담당자' },
        { label: '배포', placeholder: '담당자' },
        { label: '검증', placeholder: '담당자' },
      ],
    }),
    24: activity('일하는 방식 · 5분', '기술보다 먼저 네 가지를 합의하세요', '애매한 “가능해요” 대신 시간과 행동을 적습니다.', {
      fields: [
        { label: '연락 확인 시간', placeholder: '예: 평일 12시간 안' },
        { label: '정기 회의 시간', placeholder: '요일과 시간' },
        { label: '마감 기준', placeholder: '언제까지 초안을 공유할지' },
        { label: '갈등 처리', placeholder: '의견이 다를 때 순서' },
      ],
    }),
    25: activity('팀 규칙 · 5분', '행동으로 판단할 수 있는 규칙을 쓰세요', '“잘하자”, “열심히”는 규칙이 아닙니다.', {
      fields: [
        { label: '연락 규칙', placeholder: '측정 가능한 문장' },
        { label: '결정 규칙', placeholder: '누가 어떻게 결정하는가' },
        { label: '지각 규칙', placeholder: '언제 누구에게 알리는가' },
        { label: '갈등 규칙', placeholder: '합의가 안 될 때 다음 행동' },
      ],
    }),
    26: activity('역할 배정 · 4분', '1~4주 담당을 정하세요', '역할은 실력 등급이 아니라 이번 작업의 책임입니다.', {
      fields: [
        { label: '1주차 담당', placeholder: '이름 · 역할' },
        { label: '2주차 담당', placeholder: '이름 · 역할' },
        { label: '3주차 담당', placeholder: '이름 · 역할' },
        { label: '4주차 담당', placeholder: '이름 · 역할' },
      ],
    }),
    27: activity('팀 등록 · 3분', '강사 화면에 팀을 등록합니다', '팀원 모두 같은 내용을 입력했는지 확인하세요.', {
      fields: [
        { label: '팀 이름', placeholder: '팀 이름' },
        { label: '팀원 이름', placeholder: '쉼표로 구분' },
        { label: '주 연락 방법', placeholder: '사용할 도구와 확인 시간' },
      ],
      checklist: ['TEAM_REGISTRATION.md 저장'],
    }),
    28: activity('2교시 확인', '우리 팀이 실제로 구성됐나요?', '강사는 응답을 보고 미구성 학생을 바로 확인합니다.', {
      fields: [{ label: '팀 이름', placeholder: '팀 이름' }],
      choices: [{ label: '현재 상태', options: ['팀 구성 완료', '팀원 조정 필요', '아직 팀 없음'] }],
    }),
    29: activity('3교시 · 50분', '좋아 보이는 주제가 아니라 끝낼 수 있는 주제를 고릅니다', '지금 최종 확정하지 않습니다. 예시를 비교하고 근거가 있는 후보 두 개를 남깁니다.', {
      items: ['사용자가 분명한가', '데이터를 구할 수 있는가', '15주 안에 화면으로 시연할 수 있는가', '비용과 안전 문제를 설명할 수 있는가'],
      callout: '3주차에 실제 데이터를 열어 본 뒤 최종 주제를 확정합니다.',
    }),
    30: activity('3교시 · 선택 기준 · 4분', '끝낼 수 있는 주제를 고릅니다', '아래 여덟 기준 중 우리 팀이 가장 중요하게 볼 두 가지를 고르세요.', {
      items: ['데이터', '난이도', '사용자', '화면', '지표', '비용', '안전', '시연'],
      fields: [
        { label: '가장 중요한 기준', placeholder: '한 가지' },
        { label: '두 번째 기준', placeholder: '한 가지' },
      ],
    }),
    31: activity('예시 1·2', '자전거 수요와 에너지 효율', '두 주제의 입력과 예측값을 비교하세요.', {
      choices: [{ label: '더 관심 있는 주제', options: ['서울 자전거 수요', '건물 에너지 효율'] }],
      fields: [{ label: '선택 이유', placeholder: '사용자와 데이터를 포함해 적으세요' }],
    }),
    32: activity('예시 3·4', '설비 고장과 실내 재실', '잘못 예측했을 때 생길 문제를 비교하세요.', {
      choices: [{ label: '더 관심 있는 주제', options: ['설비 고장 가능성', '실내 재실 여부'] }],
      fields: [{ label: '가장 걱정되는 오류', placeholder: '오탐 또는 미탐 상황' }],
    }),
    33: activity('예시 5·6', '가전 에너지와 콩 품종', '숫자 예측과 범주 예측의 차이를 확인하세요.', {
      choices: [{ label: '더 관심 있는 주제', options: ['가전 에너지 사용량', '콩 품종'] }],
      fields: [{ label: '결과 화면에 보여 줄 값', placeholder: '숫자 또는 품종 이름' }],
    }),
    34: activity('예시 7·8', '콘크리트 강도와 구매 가능성', '실제 사용자가 누구인지 먼저 정하세요.', {
      choices: [{ label: '더 관심 있는 주제', options: ['콘크리트 압축 강도', '온라인 구매 가능성'] }],
      fields: [{ label: '이 결과를 쓸 사람', placeholder: '구체적인 사용자' }],
    }),
    35: activity('개인 선택 · 5분', '팀원마다 후보 세 개를 혼자 고릅니다', '다른 사람의 선택을 보기 전에 작성하세요.', {
      fields: [
        { label: '1순위', placeholder: '주제 이름' },
        { label: '2순위', placeholder: '주제 이름' },
        { label: '3순위', placeholder: '주제 이름' },
      ],
    }),
    36: activity('후보 채점 · 8분', '세 후보를 1~5점으로 비교하세요', '점수만 적지 말고 가장 낮은 점수의 이유를 남깁니다.', {
      fields: [
        { label: '후보 1 · 점수와 근거', placeholder: '예: 31점 · 데이터가 바로 열림' },
        { label: '후보 2 · 점수와 근거', placeholder: '점수 · 근거' },
        { label: '후보 3 · 점수와 근거', placeholder: '점수 · 근거' },
      ],
    }),
    37: activity('차이 토론 · 6분', '점수가 두 점 이상 다른 기준부터 말하세요', '불일치는 숨길 문제가 아니라 확인할 정보입니다.', {
      fields: [
        { label: '점수 차이가 큰 기준', placeholder: '기준 이름' },
        { label: '확인해야 할 사실', placeholder: '데이터·사용자·비용 중 무엇을 확인할지' },
      ],
    }),
    38: activity('두 후보 · 5분', '1순위와 2순위를 남기세요', '1순위가 막히면 2순위로 바로 바꿀 수 있어야 합니다.', {
      fields: [
        { label: '1순위 후보', placeholder: '주제 이름' },
        { label: '1순위 이유', placeholder: '두 문장 이내' },
        { label: '2순위 후보', placeholder: '주제 이름' },
        { label: '2순위 이유', placeholder: '두 문장 이내' },
      ],
    }),
    39: activity('아이디어 카드 · 5분', '사용 장면을 한 문장씩 적으세요', '모델 종류보다 사용자와 결과 화면이 먼저 보여야 합니다.', {
      fields: [
        { label: '사용자', placeholder: '누가 쓰는가' },
        { label: '입력', placeholder: '무엇을 넣는가' },
        { label: '예측 결과', placeholder: '무엇을 받는가' },
        { label: '결과 화면', placeholder: '어떻게 보여 주는가' },
      ],
    }),
    40: activity('옆 팀 점검 · 4분', '문서만 보고 고칠 점을 찾으세요', '작성 팀은 추가 설명을 하지 않습니다.', {
      fields: [
        { label: '꼭 고칠 점 1', placeholder: '구체적인 문제' },
        { label: '꼭 고칠 점 2', placeholder: '구체적인 문제' },
        { label: '유지할 점', placeholder: '잘 설명된 결정' },
      ],
    }),
    41: activity('3교시 확인', '두 후보가 남았나요?', '3주차에 실제 데이터를 연 뒤 최종 결정합니다.', {
      fields: [
        { label: '팀 이름', placeholder: '팀 이름' },
        { label: '1순위 후보', placeholder: '주제 이름' },
        { label: '2순위 후보', placeholder: '주제 이름' },
      ],
    }),
    42: activity('4교시 · 50분', 'AWS에 첫 파일을 올리고 명령으로 확인합니다', '콘솔 버튼을 외우는 실습이 아닙니다. 현재 계정·리전·공개 상태·결과를 스스로 확인하는 연습입니다.', {
      items: ['학교 AWS 포털 로그인', '서울 리전 확인', '비공개 S3 버킷 생성', '샘플 파일 업로드', 'CloudShell 명령 확인'],
      callout: '계정 번호, 비밀번호, 인증 코드, 액세스 키는 학생 응답이나 캡처에 남기지 않습니다.',
    }),
    43: activity('AWS 용어 네 가지', '이름보다 실제 화면과 연결해 기억하세요', '오늘 만드는 자원과 비용·권한의 관계를 먼저 확인합니다.', {
      items: ['IAM Identity Center: 학교 계정과 역할로 AWS에 들어가는 입구', '리전: 자원을 만드는 지역. 오늘은 서울(ap-northeast-2)', 'S3: 파일을 객체로 저장하는 서비스', '사용량 과금: 저장 용량과 요청 등에 따라 비용 발생'],
      links: [
        { label: 'Identity Center 안내', url: 'https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html' },
        { label: 'Amazon S3 안내', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html' },
        { label: 'S3 요금', url: 'https://aws.amazon.com/s3/pricing/' },
      ],
    }),
    44: activity('4-1 · 8분', '먼저 AWS 콘솔과 서울 리전까지 들어갑니다', '학교에서 받은 AWS access portal 주소를 사용합니다. 다른 사람의 계정이나 역할로 들어가지 않습니다.', {
      path: 'AWS access portal → 수업용 계정·역할 → Management console → 오른쪽 위 리전',
      checklist: ['포털 주소 열기', '내 수업용 계정·역할 선택', 'Management console 열기', '아시아 태평양(서울) 확인'],
    }),
    45: activity('4교시 · AWS 로그인', '현재 어디까지 들어왔나요?', '비밀번호나 인증 코드는 입력하지 않습니다.', {
      checklist: ['AWS access portal 열기', '수업용 계정·역할 선택', 'Management console 열기', '서울 리전 확인'],
      choices: [{ label: '로그인 상태', options: ['콘솔 진입 완료', '계정·역할이 안 보임', '인증에서 막힘', '포털이 안 열림'] }],
    }),
    46: activity('로그인 점검', '어느 단계에서 멈췄는지 알려주세요', '강사가 필요한 학생부터 확인합니다.', {
      fields: [
        { label: '멈춘 단계', placeholder: '포털·인증·계정 선택·콘솔·리전' },
        { label: '화면에 보이는 오류', placeholder: '비밀값을 빼고 오류 문장만 적으세요' },
      ],
    }),
    47: activity('4-2 · 37분', 'S3 버킷과 CloudShell을 직접 사용합니다', '버킷 이름은 전 세계에서 겹치지 않아야 합니다. 기본 보안 설정을 유지하고 수업용 파일 하나만 올립니다.', {
      items: ['버킷 이름 정하기', '객체 소유권 기본값 확인', '퍼블릭 액세스 차단 유지', 'sample-bike.csv 업로드', 'CloudShell에서 경로 확인'],
      callout: '오늘 만든 버킷은 다음 주에도 사용하므로 삭제하지 않습니다.',
    }),
    48: activity('S3 실습', '오늘 AWS에서 할 일 네 가지', '각 단계가 끝나면 체크하세요.', {
      checklist: ['비공개 S3 버킷 만들기', 'sample-bike.csv 올리기', 'CloudShell 열기', 'aws s3 ls 결과 확인'],
      fields: [{ label: '내 버킷 이름', placeholder: 'mlops-2026-…' }],
    }),
    49: activity('먼저 볼 명령', 'CloudShell에서는 이 네 줄을 한 줄씩 실행합니다', '지금은 명령의 버킷 이름과 파일 경로가 어디인지 눈으로 확인합니다.', {
      code: 'aws s3 ls\naws s3 ls s3://내-버킷-이름/\naws s3 cp s3://내-버킷-이름/sample-bike.csv s3://내-버킷-이름/raw/sample-bike.csv\naws s3 ls s3://내-버킷-이름/raw/',
      callout: '‘내-버킷-이름’을 실제 이름으로 바꾸세요. 꺾쇠나 예시 문자를 그대로 입력하지 않습니다.',
      links: [
        { label: 'AWS CLI s3 ls', url: 'https://docs.aws.amazon.com/cli/latest/reference/s3/ls.html' },
        { label: 'AWS CLI s3 cp', url: 'https://docs.aws.amazon.com/cli/latest/reference/s3/cp.html' },
      ],
    }),
    50: activity('완료 조건', '수업이 끝날 때 무엇을 제출할까요?', '세 항목을 실제로 가지고 있는지 확인하세요.', {
      checklist: ['버킷 이름', 'sample-bike.csv가 보이는 화면', 'aws s3 ls 결과 화면'],
    }),
    51: activity('콘솔 이동', 'S3 버킷 만들기 화면으로 이동하세요', '버튼 위치가 달라져도 검색어와 메뉴 이름으로 찾을 수 있어야 합니다.', {
      path: 'AWS 콘솔 검색 → S3 → Buckets → Create bucket',
      links: [
        { label: '서울 리전 S3 콘솔', url: 'https://ap-northeast-2.console.aws.amazon.com/s3/home?region=ap-northeast-2' },
        { label: 'S3 버킷 만들기 문서', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/creating-bucket.html' },
      ],
      checklist: ['현재 계정·역할 확인', '서울 리전 확인', 'Buckets 메뉴 확인'],
    }),
    52: activity('화면 01', '오른쪽 위에서 서울 리전을 확인하세요', '표시가 “아시아 태평양(서울)” 또는 “ap-northeast-2”인지 봅니다.', {
      visual: '/assets/week01/01-console-home-seoul.png',
      visualAlt: 'AWS 콘솔 오른쪽 위 서울 리전 화면',
      choices: [{ label: '현재 내 리전', options: ['서울(ap-northeast-2)', '다른 리전', '확인하지 못함'] }],
    }),
    53: activity('화면 02', 'S3의 Buckets 목록을 여세요', '콘솔 검색에서 S3를 찾고 왼쪽 메뉴의 Buckets를 선택합니다.', {
      path: 'AWS 콘솔 검색 → S3 → Buckets',
      visual: '/assets/week01/05-s3-bucket-list.png',
      visualAlt: 'Amazon S3 버킷 목록 화면',
      checklist: ['S3 서비스 열기', 'Buckets 목록 확인', 'Create bucket 버튼 찾기'],
    }),
    54: activity('화면 03', 'Create bucket 화면의 위쪽부터 확인하세요', '서울 리전과 General purpose 유형을 확인한 다음 버킷 이름을 입력합니다.', {
      path: 'S3 → Buckets → Create bucket',
      visual: '/assets/week01/06-s3-create-top.png',
      visualAlt: 'S3 버킷 만들기 상단 화면',
      checklist: ['AWS Region: ap-northeast-2', 'Bucket type: General purpose', 'Bucket name 입력란'],
    }),
    55: activity('버킷 이름', '겹치지 않는 이름을 직접 만드세요', '소문자·숫자·하이픈을 사용하고 마지막에 임의 문자 네 자리를 붙입니다.', {
      code: 'mlops-2026-학번-임의문자\n예: mlops-2026-20261234-a7k2',
      fields: [{ label: '내 버킷 이름', placeholder: '실제로 입력할 이름' }],
      links: [{ label: 'S3 버킷 이름 규칙', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html' }],
      callout: '학교 정책상 학번을 쓰지 않으면 강사가 지정한 별칭을 사용하세요.',
    }),
    56: activity('화면 04', '객체 소유권은 기본값을 유지하세요', 'ACLs disabled와 Bucket owner enforced가 선택되어 있는지 확인합니다.', {
      visual: '/assets/week01/07-s3-create-ownership.png',
      visualAlt: 'S3 객체 소유권 설정 화면',
      checklist: ['ACLs disabled', 'Bucket owner enforced'],
      links: [{ label: 'S3 객체 소유권 문서', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/about-object-ownership.html' }],
    }),
    57: activity('화면 05', '퍼블릭 액세스 차단을 그대로 두세요', 'Block all public access와 아래 네 항목이 모두 선택된 상태를 유지합니다.', {
      visual: '/assets/week01/08-s3-create-public-block.png',
      visualAlt: 'S3 퍼블릭 액세스 차단 설정 화면',
      checklist: ['Block all public access 선택', '아래 네 항목 모두 선택', '경고 문구 확인'],
      links: [{ label: '퍼블릭 액세스 차단 문서', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html' }],
      callout: '오늘 실습에서 공개 설정을 해제할 이유는 없습니다.',
    }),
    58: activity('버킷 생성', 'Create bucket을 누르고 목록에서 찾으세요', '오류가 나면 메시지를 읽습니다. 이름 중복이면 임의 문자만 바꿔 다시 시도합니다.', {
      path: 'Create bucket → Buckets 목록 → 방금 만든 버킷 이름 선택',
      visual: '/assets/week01/05-s3-bucket-list.png',
      visualAlt: '생성된 버킷을 찾는 S3 버킷 목록 화면',
      fields: [
        { label: '생성된 버킷 이름', placeholder: '정확한 버킷 이름' },
        { label: '오류가 있었다면 오류 문장', placeholder: '없으면 “없음”' },
      ],
    }),
    59: activity('파일 업로드 · 3분', 'sample-bike.csv를 받고 S3에 올리세요', '이 장표의 첨부파일에서 데이터를 받습니다.', {
      checklist: ['sample-bike.csv 다운로드', 'S3 버킷 열기', 'Upload → Add files', '업로드 성공 확인'],
      fields: [{ label: '업로드한 버킷 이름', placeholder: '내 버킷 이름' }],
    }),
    60: activity('화면 06', '상단 CloudShell 아이콘을 열어 명령 창을 준비하세요', '프롬프트가 나타날 때까지 기다리고 현재 리전이 서울인지 확인합니다.', {
      visual: '/assets/week01/10-cloudshell-home.png',
      visualAlt: 'AWS CloudShell 실행 화면',
      checklist: ['CloudShell 아이콘 선택', '프롬프트 표시', '서울 리전 확인'],
      links: [{ label: 'AWS CloudShell 문서', url: 'https://docs.aws.amazon.com/cloudshell/latest/userguide/welcome.html' }],
    }),
    61: activity('CloudShell · 5분', '명령을 한 줄씩 실행하세요', '오류가 나면 명령 전체와 오류 문장을 함께 확인합니다.', {
      code: 'aws s3 ls\naws s3 ls s3://내-버킷-이름/\naws s3 cp s3://내-버킷-이름/sample-bike.csv s3://내-버킷-이름/raw/sample-bike.csv\naws s3 ls s3://내-버킷-이름/raw/',
      checklist: ['aws s3 ls', '버킷 안 파일 확인', 'raw/로 파일 복사', 'raw/ 파일 확인'],
      fields: [{ label: '마지막 명령 결과', placeholder: '보인 파일 이름 또는 오류 문장' }],
      links: [
        { label: 'AWS CLI s3 ls', url: 'https://docs.aws.amazon.com/cli/latest/reference/s3/ls.html' },
        { label: 'AWS CLI s3 cp', url: 'https://docs.aws.amazon.com/cli/latest/reference/s3/cp.html' },
      ],
    }),
    62: activity('제출 확인 · 2분', '세 가지가 모두 있나요?', '계정 번호나 비밀값이 캡처에 보이지 않게 합니다.', {
      checklist: ['버킷 이름 입력', 'S3 파일 화면 캡처', 'CloudShell 결과 캡처'],
      fields: [{ label: '제출한 버킷 이름', placeholder: '정확한 이름' }],
    }),
    63: activity('정리 · 2분', '공개 설정과 비밀값을 마지막으로 확인하세요', '버킷은 다음 주에 쓰므로 삭제하지 않습니다.', {
      checklist: ['Block all public access 유지', '불필요한 파일 없음', '캡처에 계정 번호·키·비밀번호 없음', 'CloudShell 닫기'],
    }),
    64: activity('1주차 마무리', '오늘 실제로 남긴 결과를 확인합니다', '팀, 주제, AWS 결과가 모두 있어야 합니다.', {
      checklist: ['팀 등록표', '주제 후보 두 개', 'S3 버킷', 'sample-bike.csv', 'CloudShell 결과'],
      fields: [{ label: '다음 주에 꼭 가져올 것', placeholder: '내 버킷 이름 또는 기억할 점' }],
    }),
  },
};

const week01Onboarding = {
  1: activity('클라우드 MLOps · 첫 만남', '15주 뒤, 우리 팀의 예측 서비스 주소를 직접 엽니다', '이번 과목은 모델 파일 하나로 끝나지 않습니다. 데이터부터 배포·운영·발표까지 팀이 하나의 서비스를 완성합니다.', {
    items: ['브라우저에서 입력을 받는 화면', '예측 결과를 돌려주는 API', 'AWS에서 실행되는 서비스', '실험·배포·운영 기록'],
    callout: '오늘은 과목 전체 지도를 확인한 뒤 팀·주제·AWS 첫 자원을 준비합니다.',
  }),
  2: activity('먼저 참여하기 · 2분', '15주 뒤 무엇을 남기고 싶나요?', '지금의 실력보다 이번 학기에 얻고 싶은 결과를 먼저 정합니다.', {
    choices: [{ label: '가장 기대하는 결과', options: ['AWS 실습 경험', '포트폴리오 서비스', '팀 프로젝트 경험', '배포·운영 경험'] }],
    fields: [{ label: '개인 목표 한 문장', placeholder: '학기 말에 나는 …을 설명하고 싶다' }],
  }),
  3: activity('수업 소개', '클라우드 MLOps는 모델을 계속 쓸 수 있게 만드는 수업입니다', '좋은 모델을 만드는 일에 더해 데이터를 관리하고, 실행 환경을 맞추고, 다른 사람이 쓸 수 있게 배포하고, 문제가 생겼을 때 확인하는 과정까지 다룹니다.', {
    cards: [
      { title: '만들기', text: '데이터와 모델을 준비합니다.' },
      { title: '내보내기', text: 'API와 화면으로 연결합니다.' },
      { title: '살펴보기', text: '기록·비용·오류를 확인합니다.' },
    ],
  }),
  4: activity('학기 결과물', '팀마다 “주소가 있는 예측 서비스”를 완성합니다', '최종 결과는 발표 자료만이 아닙니다. 다른 사람이 열어 보고 입력하고 결과를 확인할 수 있어야 합니다.', {
    checklist: ['문제와 사용자가 설명된다', '데이터와 모델 선택 근거가 남는다', '서비스 주소에서 입력과 결과가 동작한다', '배포·관찰·비용 기록을 설명할 수 있다'],
    callout: '매주 만든 작은 결과를 이어 붙이면 15주차 최종 서비스가 됩니다.',
  }),
  5: activity('15주 로드맵', '준비 → 만들기 → 배포 → 운영 순서로 갑니다', '한 번에 완성하려 하지 않습니다. 네 구간마다 작동하는 결과를 남기고 다음 구간으로 넘어갑니다.', {
    roadmap: [
      { range: '1~4주', title: '기초와 문제 정의', text: 'AWS·리눅스·데이터·첫 모델' },
      { range: '5~8주', title: '재현과 서비스화', text: 'MLflow·Docker·API·중간 배포' },
      { range: '9~12주', title: '통합과 자동화', text: 'SageMaker·Bedrock·GitHub Actions' },
      { range: '13~15주', title: '운영과 발표', text: '모니터링·개선·최종 시연' },
    ],
  }),
  6: activity('1~4주 · 기초와 문제 정의', '무엇을 만들지 정하고 첫 모델까지 갑니다', '도구 이름을 외우기보다 팀이 같은 환경에서 같은 결과를 다시 만드는 데 집중합니다.', {
    items: ['1주: 과목 이해·팀 구성·주제 후보·S3', '2주: 리눅스와 EC2 개발 환경', '3주: 데이터 파이프라인과 문제 정의', '4주: 비교 기준이 되는 첫 모델'],
    fields: [{ label: '가장 낯선 말', placeholder: 'S3·EC2·파이프라인·첫 모델 중 하나' }],
  }),
  7: activity('5~8주 · 재현과 서비스화', '실험을 기록하고 다른 사람이 쓸 수 있게 만듭니다', '모델 파일을 실행 가능한 컨테이너와 API로 바꾸고 중간 시연에서 실제 동작을 확인합니다.', {
    items: ['5주: MLflow로 실험 기록', '6주: Docker와 ECR', '7주: 모델 서빙 API', '8주: 배포와 데모 화면 중간 점검'],
  }),
  8: activity('9~12주 · 통합과 자동화', '관리형 서비스와 자동 배포를 연결합니다', '팀 프로젝트를 보강한 뒤 SageMaker와 Bedrock을 경험하고 GitHub의 변경이 배포로 이어지게 만듭니다.', {
    items: ['9주: 프로젝트 통합 보강', '10주: SageMaker', '11주: 생성형 AI와 Bedrock', '12주: GitHub Actions 배포 자동화'],
  }),
  9: activity('13~15주 · 운영과 발표', '고장이 나도 확인할 수 있는 서비스로 마무리합니다', '관찰하고 고치고 설명하는 능력까지 결과물에 포함합니다.', {
    items: ['13주: 모니터링과 운영', '14주: 프로젝트 집중 워크숍', '15주: 최종 시연·회고·비용 자원 정리'],
    choices: [{ label: '마지막 발표에서 가장 보여 주고 싶은 것', options: ['동작하는 화면', '기술 구조', '문제 해결 과정', '운영 기록'] }],
  }),
  10: activity('수업 운영 · 200분', '50분 수업 네 번, 교시 사이에는 10분 쉽니다', '각 교시는 짧은 설명 뒤에 직접 실행하고, 결과를 확인하고, 팀과 공유하는 순서로 진행합니다.', {
    roadmap: [
      { range: '설명', title: '오늘 할 일 확인', text: '왜 하는지와 완료 조건' },
      { range: '실행', title: '개인·팀 실습', text: '화면에서 직접 만들기' },
      { range: '확인', title: '결과와 오류 점검', text: '완료 표시·응답·질문' },
      { range: '공유', title: '팀 기록 남기기', text: '다음 주에 이어 쓸 증거' },
    ],
    callout: '정답을 받아 적는 시간보다 직접 해 보고 막힌 지점을 설명하는 시간이 더 깁니다.',
  }),
  11: activity('학생 참여 방식', '이 화면이 수업의 출석부이자 실습 안내서입니다', '장표를 보기만 하지 말고 입력·선택·체크·질문을 남깁니다. 강사는 실시간 현황을 보고 필요한 팀부터 돕습니다.', {
    checklist: ['내 이름으로 출석했다', '현재 장표의 “지금 할 일”을 확인한다', '활동 뒤 “이 장표 완료”를 누른다', '막히면 아래 Q&A에 화면·오류·시도한 일을 적는다'],
  }),
  12: activity('팀 수업 방식', '개인 확인 → 팀 결정 → 옆 팀 검토로 진행합니다', '한 사람이 대신 끝내는 팀보다 모든 팀원이 결정 이유를 말할 수 있는 팀을 목표로 합니다.', {
    cards: [
      { title: '개인', text: '먼저 내 답과 결과를 남깁니다.' },
      { title: '팀', text: '근거를 비교해 하나를 결정합니다.' },
      { title: '검토', text: '다른 팀이 다시 해 보고 고칠 점을 찾습니다.' },
    ],
    fields: [{ label: '팀 활동에서 내가 지키고 싶은 태도', placeholder: '예: 막힌 과정을 숨기지 않고 공유한다' }],
  }),
  13: activity('평가 안내', '결과뿐 아니라 과정과 재현 가능성을 함께 봅니다', '세부 배점은 공식 강의계획서를 따릅니다. 수업에서는 매주 아래 증거를 남겨 진행 상황을 확인합니다.', {
    items: ['개인 참여: 입력·완료·질문·설명', '팀 산출물: 파일·코드·결정 기록', '실습 확인: 같은 절차를 다시 실행한 결과', '최종 시연: 서비스 동작·구조·운영 설명'],
    callout: '오류가 난 사실보다 오류를 숨기거나 기록하지 않는 것이 더 큰 문제입니다.',
  }),
  14: activity('강사 소개', '박주혁 · 서비스를 만들고 운영해 온 개발자', '웹·예약·ERP·SaaS·플랫폼을 기획하고 개발·운영해 왔으며, 현재 헥사아이 대표로 서비스 연구개발과 창업교육을 진행하고 있습니다.', {
    cards: [
      { title: '현업', text: '20년 이상 웹·플랫폼·기업 시스템 개발 및 운영' },
      { title: '기술', text: '서비스 기획부터 구축·운영까지 여러 산업 프로젝트 수행' },
      { title: '교육', text: '창업·IT·사업모델 멘토링과 코칭 활동' },
    ],
    links: [{ label: '강사 이메일 · j.park@yeonsung.ac.kr', url: 'mailto:j.park@yeonsung.ac.kr' }],
  }),
  15: activity('강사에게 물어볼 수 있는 것', '기술 선택이 실제 서비스와 팀 작업에서 어떻게 이어지는지 묻는 수업입니다', '컴퓨터공학 석사 과정과 다양한 서비스 개발·운영 경험을 바탕으로 코드뿐 아니라 사용자·비용·일정·운영 관점도 함께 다룹니다.', {
    items: ['왜 이 기술을 선택하는가', '팀에서 일을 어떻게 나누는가', '서비스가 멈추면 어디부터 확인하는가', '프로젝트 경험을 포트폴리오로 어떻게 설명하는가'],
    fields: [{ label: '강사에게 묻고 싶은 것', placeholder: '기술·프로젝트·진로 중 자유롭게 적으세요' }],
  }),
  16: activity('오늘의 약속', '작게 만들고, 바로 확인하고, 기록을 남깁니다', 'AWS 계정·비밀번호·인증 코드·액세스 키는 공유하거나 장표 응답에 입력하지 않습니다. 비용이 생길 수 있는 자원은 만들기 전 이름과 종료 시점을 확인합니다.', {
    checklist: ['모르면 질문한다', '팀원이 직접 해 볼 시간을 준다', '오류 문장을 지우지 않고 읽는다', '비밀값은 화면·응답·캡처에 남기지 않는다'],
    callout: '이제 첫 활동으로 넘어갑니다. 오늘 끝날 때 팀·주제 후보·S3 결과가 남아 있어야 합니다.',
  }),
};

const originalWeek01Interactions = window.COURSE_INTERACTIONS.week01;
const week01OnboardingCount = Object.keys(week01Onboarding).length;
window.COURSE_INTERACTIONS.week01 = { ...week01Onboarding };
Object.entries(originalWeek01Interactions).forEach(([slide, content]) => {
  window.COURSE_INTERACTIONS.week01[Number(slide) + week01OnboardingCount] = content;
});

const week01Deck = window.COURSE_WEEKS?.find((week) => week.id === 'week01');
if (week01Deck?.slides.length === 64) {
  const onboardingSlides = Object.entries(week01Onboarding).map(([number, content]) => ({
    number: Number(number),
    title: content.title,
    image: week01Deck.slides[0]?.image || '',
    notes: content.note || content.copy || '',
    links: content.links || [],
  }));
  const shiftedSlides = week01Deck.slides.map((slide, index) => ({ ...slide, number: index + week01OnboardingCount + 1 }));
  week01Deck.slides = [...onboardingSlides, ...shiftedSlides];
  window.COURSE_TOTAL_SLIDES = (window.COURSE_TOTAL_SLIDES || 686) + week01OnboardingCount;
}

// 50분 수업 네 번의 실제 활동 시간을 장표 단위로 나눕니다.
// 구분 장표는 전환 표지이므로 0분이며, 앞뒤 활동 시간에 포함됩니다.
const onboardingMinutes = [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 3];
const compactFirstPeriodMinutes = [1, 2, 2, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1];
const originalWeek01Minutes = [
  2, 4, 4, 2, 2, 3, 3, 5, 5, 5, 3, 4, 2, 2, 2, 2,
  0, 6, 4, 4, 6, 6, 5, 5, 5, 4, 3, 2,
  0, 4, 3, 3, 3, 3, 5, 8, 6, 5, 5, 4, 1,
  0, 5, 0, 5, 3, 0, 3, 2, 2, 4, 1, 1, 3, 3, 1, 1, 2, 3, 2, 5, 2, 2, 0,
];
const week01Minutes = [...onboardingMinutes, ...compactFirstPeriodMinutes, ...originalWeek01Minutes.slice(16)];

Object.entries(window.COURSE_INTERACTIONS.week01).forEach(([slide, content]) => {
  const number = Number(slide);
  content.minutes = week01Minutes[number - 1];
  content.period = number <= 32 ? 1 : number <= 44 ? 2 : number <= 57 ? 3 : 4;
});

// 1교시는 기존 활동 앞에 온보딩을 덧붙이지 않고, 과목 전체를 이해하는 하나의 흐름으로 대체합니다.
const professionalWeek01Opening = {
  1: activity('클라우드 MLOps · 1주차', '모델 개발 이후의 일을 다루는 15주 프로젝트', '데이터 준비, 실험 기록, API, 컨테이너, 클라우드 배포, 모니터링을 하나의 팀 프로젝트로 연결합니다.', { callout: '1주차 목표: 과목의 전체 구조를 이해하고 팀·주제 후보·AWS 실습 환경을 준비한다.' }),
  2: activity('과목의 출발점', '노트북에서 잘 돌아가는 모델은 아직 서비스가 아닙니다', '사용자가 접근할 주소, 동일한 실행 환경, 버전이 확인되는 데이터와 코드, 오류를 찾을 기록이 있어야 실제 운영이 가능합니다.', { table: { headers: ['모델 개발', '서비스 운영'], rows: [['정확도와 학습 결과 확인', '접근 주소와 API 제공'], ['개인 환경에서 실행', '동일한 환경을 반복 배포'], ['현재 결과 확인', '버전·로그·비용을 지속 확인']] } }),
  3: activity('수업 범위', '이 과목에서 연결할 여섯 영역', '각 영역을 따로 배우는 데서 끝내지 않고 한 변경이 다음 단계에 어떤 영향을 주는지 확인합니다.', { roadmap: [{ range: '01', title: '데이터', text: '수집·정리·검증' }, { range: '02', title: '실험', text: '학습·평가·기록' }, { range: '03', title: '패키징', text: '환경·의존성·컨테이너' }, { range: '04', title: '서빙', text: 'API·입력·응답' }, { range: '05', title: '배포', text: 'AWS·자동화·버전' }, { range: '06', title: '운영', text: '로그·지표·비용' }] }),
  4: activity('학기 말 시연', '사용자가 입력하고 결과를 받는 화면까지 완성합니다', '최종 발표에서는 슬라이드 설명보다 실제 서비스의 입력·응답·운영 상태를 먼저 보여 줍니다.', { roadmap: [{ range: '사용자', title: '웹 화면', text: '값 입력·결과 확인' }, { range: '요청', title: '예측 API', text: '검증·추론·응답' }, { range: '실행', title: 'AWS 환경', text: '컨테이너·엔드포인트' }, { range: '관리', title: '운영 기록', text: '로그·지표·비용' }] }),
  5: activity('목표 시스템', '이번 학기에 구축할 전체 흐름', '프로젝트 주제는 팀마다 달라도 시스템이 갖춰야 할 연결 구조는 같습니다.', { roadmap: [{ range: '1', title: '원천 데이터', text: 'S3 저장·버전 구분' }, { range: '2', title: '학습 실험', text: '기준 모델·MLflow' }, { range: '3', title: '모델 API', text: 'FastAPI·Docker' }, { range: '4', title: '배포', text: 'ECR·EC2·SageMaker' }, { range: '5', title: '관찰', text: '로그·지표·경보' }], callout: '한 주의 산출물은 다음 주 입력물입니다. 파일명·실행 명령·결정 근거를 매주 남깁니다.' }),
  6: activity('최종 제출물', '코드만 제출하지 않습니다', '다른 팀이 문서만 보고 실행해 볼 수 있는 수준을 완료 기준으로 삼습니다.', { table: { headers: ['구분', '필수 증거', '확인 기준'], rows: [['문제 정의', '사용자·입력·예측 결과·지표', '필요성을 설명할 수 있음'], ['실행 자산', '데이터·코드·환경·모델 버전', '같은 결과를 재현할 수 있음'], ['서비스', '접속 주소·API·컨테이너', '입력부터 응답까지 동작함'], ['운영', '로그·지표·비용·정리 기록', '오류와 비용 상태를 확인함']] } }),
  7: activity('15주 전체 계획', '매주 하나의 검증 가능한 결과를 남깁니다', '중간 점검과 최종 발표는 앞선 산출물을 통합하는 시점입니다.', { table: { headers: ['주차', '핵심 주제', '주요 산출물'], rows: [['1', '과목 이해·팀·주제 후보·S3', '팀 등록표·후보 2개·S3 객체'], ['2', '리눅스와 EC2', '공통 개발 환경·접속 기록'], ['3', '데이터 파이프라인과 문제 정의', '데이터 검증·문제 정의서'], ['4', '베이스라인 모델', '첫 성능 기준과 평가 결과'], ['5', 'MLflow 실험 관리', '실험 비교·모델 기록'], ['6', 'Docker와 ECR', '재현 가능한 이미지'], ['7', '모델 서빙 API', '입력 검증·예측 API'], ['8', '중간 배포 점검', '접속 가능한 데모'], ['9', '프로젝트 통합 보강', '통합 버전과 결함 목록'], ['10', 'SageMaker', '관리형 배포 비교 결과'], ['11', 'Bedrock과 생성형 AI', '적용 가능성 검증'], ['12', 'GitHub Actions', '자동 검사·배포 흐름'], ['13', '모니터링과 운영', '로그·지표·경보'], ['14', '집중 워크숍', '최종 후보와 리허설 결과'], ['15', '최종 시연과 정리', '서비스 시연·회고·자원 정리']] } }),
  8: activity('1~4주', '문제와 실행 환경을 고정합니다', '초기 구간에서는 성능 경쟁보다 팀원이 같은 데이터와 환경에서 같은 결과를 만드는 데 집중합니다.', { table: { headers: ['주차', '수업 중 결정', '완료 조건'], rows: [['1주', '팀·후보 주제·버킷 이름', '팀 등록과 S3 업로드'], ['2주', '공통 리눅스 환경', '모든 팀원 접속·명령 실행'], ['3주', '예측 문제와 데이터 기준', '입력·정답·지표 정의'], ['4주', '첫 비교 모델', '기준 성능과 한계 기록']] } }),
  9: activity('5~8주', '실험 결과를 실행 가능한 서비스로 바꿉니다', '실험 기록, 컨테이너, API가 연결되어야 중간 점검에서 다른 사람이 직접 사용할 수 있습니다.', { table: { headers: ['주차', '수업 중 결정', '완료 조건'], rows: [['5주', '실험명·파라미터·지표', 'MLflow에서 실행 비교'], ['6주', '이미지 구성과 태그', 'ECR에서 이미지 확인'], ['7주', '입력 규격과 오류 응답', 'API 요청·응답 확인'], ['8주', '배포 구조와 시연 동선', '외부에서 데모 접속']] } }),
  10: activity('9~12주', '통합하고 관리형 서비스와 자동화를 비교합니다', '모든 기술을 억지로 쓰는 것이 아니라 프로젝트에 필요한 선택과 제외 근거를 남깁니다.', { table: { headers: ['주차', '수업 중 결정', '완료 조건'], rows: [['9주', '통합 결함 우선순위', '핵심 흐름 다시 동작'], ['10주', 'SageMaker 적용 범위', '기존 방식과 비용·운영 비교'], ['11주', 'Bedrock 적용 여부', '필요성·안전성 검증'], ['12주', '자동화 범위와 조건', '변경 시 검사·배포 실행']] } }),
  11: activity('13~15주', '관찰 가능한 상태로 다듬고 실제로 시연합니다', '정상 화면만 준비하지 않고 오류·비용·정리 방법까지 발표 내용에 포함합니다.', { table: { headers: ['주차', '수업 중 결정', '완료 조건'], rows: [['13주', '관찰할 로그와 지표', '이상 상태를 찾아 설명'], ['14주', '최종 기능과 제외 기능', '리허설·동료 검토 통과'], ['15주', '시연·회고·자원 정리', '서비스 증거와 삭제 확인']] } }),
  12: activity('누적 구조', '앞 주차를 건너뛰면 다음 단계에서 바로 드러납니다', '데이터 규격이 불분명하면 API 입력을 정할 수 없고, 이미지 태그가 불명확하면 어느 모델이 배포됐는지 설명할 수 없습니다.', { roadmap: [{ range: '정의', title: '문제·데이터', text: '입력과 정답을 합의' }, { range: '검증', title: '실험·평가', text: '비교 근거를 기록' }, { range: '전달', title: 'API·배포', text: '사용 가능한 형태 제공' }, { range: '책임', title: '운영·비용', text: '상태와 영향을 설명' }] }),
  13: activity('수업 시간', '50분 수업 4회, 교시 사이 10분 휴식', '총 수업시간은 200분입니다. 교시 종료 시점마다 그 시간에 남겨야 할 결과를 확인합니다.', { table: { headers: ['교시', '기본 구성', '종료 시 확인'], rows: [['1교시', '개념·시연·준비', '개인 이해와 환경 확인'], ['2교시', '팀 의사결정', '팀 문서와 역할'], ['3교시', '프로젝트 작업', '선택 근거와 중간 결과'], ['4교시', 'AWS 실습·검증', '화면·명령·운영 증거']] } }),
  14: activity('한 교시의 진행 방식', '설명보다 실행과 검증에 더 많은 시간을 씁니다', '완성된 화면을 그대로 복제하는 방식이 아니라 완료 조건을 확인하고 팀이 구현 방법을 결정합니다.', { roadmap: [{ range: '문제', title: '완료 조건 제시', text: '무엇을 남겨야 하는가' }, { range: '판단', title: '개인·팀 선택', text: '방법과 근거를 결정' }, { range: '실행', title: '구축·실험', text: '직접 만들고 오류 확인' }, { range: '검증', title: '상호 점검', text: '다른 사람이 재현' }, { range: '기록', title: '증거 저장', text: '다음 주 입력물 확보' }] }),
  15: activity('수업 중 역할', '강사는 기준을 제시하고, 학생은 선택과 실행을 책임집니다', '막힌 경우 현재 화면, 오류 문장, 이미 시도한 방법을 확인한 뒤 다음 확인 지점을 함께 찾습니다.', { table: { headers: ['주체', '책임'], rows: [['개인', '자기 화면에서 실행하고 결과·오류를 설명'], ['팀', '역할을 나누고 결정 근거와 변경 내역을 기록'], ['강사', '완료 기준 제시·진행 확인·오류 진단 지원'], ['동료 팀', '문서만 보고 재현하고 구체적으로 검토']] } }),
  16: activity('수업 화면 사용법', '출석·활동·질문·첨부파일을 한 화면에서 처리합니다', '강사 화면과 학생 화면은 같은 장표 번호를 공유합니다. 활동 결과는 실시간으로 집계되며 이름은 강사 화면에만 표시됩니다.', { checklist: ['내 이름으로 출석', '현재 장표의 과업 확인', '입력·선택·체크 후 완료', '질문에는 화면·오류·시도한 일을 함께 작성'] }),
  17: activity('매주 남길 증거', '“했습니다” 대신 다시 확인할 수 있는 자료를 남깁니다', '민감정보는 제거하고 결과를 만든 조건이 보이도록 기록합니다.', { table: { headers: ['증거', '포함할 내용'], rows: [['코드·문서', '버전·수정 목적·담당자'], ['실행 결과', '명령·환경·결과·시각'], ['화면 캡처', '경로·상태·민감정보 제거'], ['팀 결정', '선택안·근거·제외한 대안'], ['오류 기록', '오류 전문·시도한 방법·다음 조치']] } }),
  18: activity('평가 원칙', '최종 결과와 함께 재현성·참여·설명을 확인합니다', '정확한 배점은 공식 강의계획서를 따릅니다. 수업 활동 기록은 개인 참여와 팀 진행 상황을 확인하는 근거로 사용합니다.', { items: ['동작: 요구한 입력과 결과가 실제로 연결되는가', '재현: 다른 사람이 같은 절차를 실행할 수 있는가', '근거: 기술과 프로젝트 결정을 설명할 수 있는가', '운영: 오류·보안·비용 상태를 확인할 수 있는가', '참여: 맡은 일을 수행하고 팀 결정에 기여했는가'] }),
  19: activity('팀 운영 원칙', '역할은 고정 직급이 아니라 주차별 책임입니다', '3~4명으로 팀을 구성하고 데이터·모델·배포·검증 책임을 순환합니다. 작성자와 검증자는 가능하면 다르게 둡니다.', { table: { headers: ['역할', '대표 책임'], rows: [['데이터', '원천·전처리·품질 확인'], ['모델', '실험·평가·모델 기록'], ['배포', '환경·API·컨테이너·AWS'], ['검증', '재현·오류·문서·비용 확인']] } }),
  20: activity('AWS 실습 원칙', '리전·이름·비용·삭제 시점을 먼저 확인합니다', '수업에서는 서울 리전(ap-northeast-2)을 기본으로 사용합니다. 비용 자원은 팀 규칙에 맞는 이름을 사용하고 사용 종료 조건을 기록합니다.', { checklist: ['현재 계정과 역할 확인', '서울 리전 확인', '자원 이름과 팀·주차 확인', '예상 비용과 종료 시점 확인', '수업 종료 전 잔여 자원 점검'] }),
  21: activity('보안 기준', '비밀값은 장표 응답·GitHub·캡처에 남기지 않습니다', 'AWS 계정 번호와 리소스 식별자도 공개 범위를 확인한 뒤 공유합니다.', { table: { headers: ['공유 금지', '공유 전 확인'], rows: [['비밀번호·인증 코드', '화면에서 완전히 제거'], ['액세스 키·비밀 키·세션 토큰', '코드·터미널·환경파일 검색'], ['개인정보', '이름 외 불필요한 정보 제거'], ['계정·리소스 식별자', '저장소 공개 범위와 수업 목적 확인']] } }),
  22: activity('강사 소개', '박주혁 · 서비스 개발과 운영을 함께 해 온 실무자', '2004년부터 웹 서비스, 예약 시스템, ERP, SaaS, 플랫폼을 개발·운영해 왔습니다. 현재 헥사아이 대표로 서비스 연구개발과 창업교육을 수행하고 있습니다.', { table: { headers: ['구분', '주요 경험'], rows: [['서비스 개발', '여행·예약·전자상거래·기업 시스템·플랫폼'], ['기술 리더십', 'CTO·연구소장·IT사업부 책임'], ['현재 업무', '헥사아이 대표·서비스 R&D·창업교육'], ['교육·멘토링', 'IT·사업모델 고도화 코칭과 창업 멘토링']] }, links: [{ label: '강사 이메일 · j.park@yeonsung.ac.kr', url: 'mailto:j.park@yeonsung.ac.kr' }] }),
  23: activity('강사 경력과 수업의 연결', '기술을 만드는 일과 운영하는 일을 분리하지 않습니다', '수업에서 사용자, 일정, 협업, 장애, 비용을 함께 다루는 이유는 실제 서비스가 이 조건 속에서 운영되기 때문입니다.', { table: { headers: ['경험', '수업에서 연결할 관점'], rows: [['예약·ERP·SaaS 구축', '데이터 흐름·API·운영 요구사항'], ['기술 조직 책임', '역할 분담·검토·장애 대응'], ['서비스 R&D와 창업', '문제 정의·사용자·비용·시연'], ['컴퓨터공학 석사', '시스템 구조와 구현 근거']] } }),
  24: activity('질문과 지원', '질문에는 현재 상태가 보이게 작성합니다', '수업 화면 Q&A에는 막힌 단계, 화면에 보이는 오류, 이미 시도한 일을 적습니다. 수업 밖 문의는 강사 이메일을 사용합니다.', { fields: [{ label: '강사에게 확인하고 싶은 과목 질문', placeholder: '예: 프로젝트 주제는 언제 최종 확정하나요?' }], links: [{ label: 'j.park@yeonsung.ac.kr', url: 'mailto:j.park@yeonsung.ac.kr' }] }),
  25: activity('시작 전 진단', '현재 경험을 확인합니다', '성적을 매기는 문제가 아닙니다. 강사가 설명 속도와 실습 지원 순서를 정하는 데 사용합니다.', { choices: [{ label: 'AWS 사용 경험', options: ['처음', '로그인·콘솔 사용', 'EC2·S3 사용', '배포 경험'] }, { label: 'Git·GitHub 경험', options: ['처음', 'clone·commit', 'branch·merge', '협업 프로젝트'] }], fields: [{ label: '가장 걱정되는 부분', placeholder: '환경 설정·코드·팀 활동·발표 등' }] }),
  26: activity('1주차 진행 계획', '1교시 온보딩 이후 팀·주제·AWS 실습으로 이어집니다', '지금 팀 시작 파일과 학생 안내서를 내려받습니다. 2교시에는 팀을 구성하고, 3교시에는 후보 주제를 비교하며, 4교시에는 S3와 CloudShell을 사용합니다.', { table: { headers: ['교시', '오늘 할 일', '남길 결과'], rows: [['1교시', '과목 이해·환경 진단·파일 준비', '개인 응답·시작 파일'], ['2교시', '3~4명 팀 구성·역할·규칙', '팀 등록표·역할표'], ['3교시', '프로젝트 후보 비교', '후보 2개·선택 근거'], ['4교시', 'AWS 로그인·S3·CloudShell', '버킷·샘플 파일·명령 결과']] }, checklist: ['팀 시작 파일 다운로드', '학생 안내서 다운로드', '저장 위치 확인'], callout: '다음 장부터 팀 구성 활동을 시작합니다.' }),
};

const professionalOpeningMinutes = [1, 2, 2, 2, 2, 3, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 1, 1];
const retainedWeek01Interactions = {};
Object.entries(originalWeek01Interactions).forEach(([slide, content]) => {
  const originalNumber = Number(slide);
  if (originalNumber > 16) retainedWeek01Interactions[originalNumber + 10] = content;
});
window.COURSE_INTERACTIONS.week01 = { ...professionalWeek01Opening, ...retainedWeek01Interactions };

const originalDeckSlides = week01Deck.slides.slice(week01OnboardingCount);
const professionalOpeningSlides = Object.entries(professionalWeek01Opening).map(([number, content]) => ({ number: Number(number), title: content.title, image: originalDeckSlides[0]?.image || '', notes: content.copy || '', links: content.links || [] }));
const retainedDeckSlides = originalDeckSlides.slice(16).map((slide, index) => ({ ...slide, number: index + 27 }));
week01Deck.slides = [...professionalOpeningSlides, ...retainedDeckSlides];
window.COURSE_TOTAL_SLIDES = 696;

const professionalWeek01Minutes = [...professionalOpeningMinutes, ...originalWeek01Minutes.slice(16)];
Object.entries(window.COURSE_INTERACTIONS.week01).forEach(([slide, content]) => {
  const number = Number(slide);
  content.minutes = professionalWeek01Minutes[number - 1];
  content.period = number <= 26 ? 1 : number <= 38 ? 2 : number <= 51 ? 3 : 4;
});

const professionalOpeningScripts = {
  1: `[말하기] 오늘부터 15주 동안 클라우드 MLOps 프로젝트를 진행합니다. 이 과목의 목표는 모델을 한 번 만들어 보는 것이 아니라, 데이터부터 배포와 운영까지 연결된 서비스를 팀으로 완성하는 것입니다.\n\n[진행] 화면의 네 가지 1주차 결과를 짚어 주세요. 오늘 수업이 끝났을 때 팀 등록표, 프로젝트 후보 두 개, S3 객체와 CloudShell 확인 결과가 남아야 한다고 안내합니다.\n\n[전환] 먼저 왜 모델 개발만으로는 부족한지 살펴보겠습니다.`,
  2: `[말하기] 노트북에서 예측값이 잘 나왔다고 해도 사용자는 그 노트북을 직접 실행할 수 없습니다. 서비스가 되려면 입력을 받을 주소, 같은 환경을 다시 만드는 방법, 어떤 버전이 실행 중인지 확인할 기록이 필요합니다.\n\n[진행] 표의 왼쪽과 오른쪽을 한 행씩 비교해 주세요. 학생들에게 지금까지 경험한 프로젝트가 어느 쪽에서 끝났는지 잠깐 생각하게 합니다.\n\n[전환] 이번 학기에는 이 차이를 메우기 위해 여섯 영역을 연결합니다.`,
  3: `[말하기] 이 과목은 데이터, 실험, 패키징, 서빙, 배포, 운영을 순서대로 다룹니다. 중요한 점은 여섯 과목을 따로 배우는 것이 아니라 앞 단계의 결정이 다음 단계에 어떻게 이어지는지 확인한다는 것입니다.\n\n[진행] 왼쪽부터 각 영역을 읽고, 데이터 형식이 바뀌면 API와 운영까지 영향을 받을 수 있다는 예를 들어 주세요.\n\n[전환] 이 연결이 학기 말에는 어떤 화면으로 보이는지 확인하겠습니다.`,
  4: `[말하기] 최종 발표에서는 발표 자료를 먼저 넘기지 않습니다. 사용자가 웹 화면에 값을 입력하고 예측 결과를 받는 장면부터 보여 줍니다. 그 요청이 API와 AWS 실행 환경을 지나고, 강사는 운영 기록까지 확인합니다.\n\n[진행] 네 단계를 왼쪽부터 가리키며 최종 시연 순서를 설명합니다. 화면만 있고 API가 없거나, API는 있지만 접속 주소가 없는 상태는 완료가 아니라고 분명히 말합니다.\n\n[전환] 이제 이 시연을 가능하게 하는 전체 시스템을 보겠습니다.`,
  5: `[말하기] 팀별 주제는 달라도 원천 데이터에서 운영 관찰까지 이어지는 구조는 같습니다. S3의 데이터가 학습 실험으로 들어가고, 선택된 모델은 API와 컨테이너를 거쳐 배포됩니다. 배포 뒤에는 로그와 지표를 통해 상태를 확인합니다.\n\n[진행] 각 단계에서 이번 학기에 사용할 대표 도구를 연결해 설명해 주세요. 한 주의 산출물이 다음 주의 입력물이라는 문장을 강조합니다.\n\n[전환] 그렇다면 최종적으로 무엇을 제출해야 하는지 구체적으로 보겠습니다.`,
  6: `[말하기] 최종 제출물은 코드 저장소 하나가 아닙니다. 문제 정의, 실행 자산, 서비스, 운영 기록 네 부분이 모두 있어야 합니다. 다른 팀이 설명을 듣지 않고 문서만 보고 실행할 수 있는지가 재현성의 기준입니다.\n\n[진행] 표의 확인 기준을 한 행씩 읽고, 학생들에게 각 항목이 왜 필요한지 질문합니다. 특히 접속 주소와 비용·정리 기록도 제출물이라는 점을 확인합니다.\n\n[전환] 이 결과를 15주 동안 어떻게 나누어 만드는지 보겠습니다.`,
  7: `[말하기] 이 표가 이번 학기의 전체 지도입니다. 매주 핵심 주제 하나와 검증 가능한 산출물 하나가 대응합니다. 8주차 중간 점검은 새 과제를 시작하는 날이 아니라 1주차부터 만든 결과를 처음 통합하는 날입니다.\n\n[진행] 표를 빠르게 훑되 1주, 4주, 8주, 12주, 15주의 주요 이정표에서 멈춰 설명합니다. 학생들에게 지금 가장 낯선 주차 하나를 기억해 두라고 말합니다.\n\n[전환] 다음 네 장에서는 구간별로 결정 사항과 완료 조건을 더 자세히 보겠습니다.`,
  8: `[말하기] 1주부터 4주까지는 프로젝트의 토대를 고정합니다. 팀, 실행 환경, 데이터 기준, 첫 비교 모델이 정해져야 이후 실험과 배포가 흔들리지 않습니다. 이 구간에서는 높은 정확도보다 같은 결과를 다시 만드는 것이 우선입니다.\n\n[진행] 각 주차의 완료 조건을 읽고, 4주차 첫 모델은 최종 모델이 아니라 이후 개선을 비교할 기준이라고 설명합니다.\n\n[전환] 토대가 만들어지면 5주차부터 실행 가능한 서비스 형태로 바꿉니다.`,
  9: `[말하기] 5주부터 8주까지는 실험 결과를 다른 사람이 실행할 수 있는 형태로 바꾸는 구간입니다. MLflow에 실험을 기록하고, Docker 이미지로 환경을 묶고, API로 입력과 응답을 정의합니다. 8주차에는 외부에서 접속 가능한 중간 데모를 확인합니다.\n\n[진행] 표의 산출물이 서로 어떻게 연결되는지 설명합니다. 모델 파일만 제출해서는 중간 데모가 성립하지 않는다는 점을 짚습니다.\n\n[전환] 중간 데모 이후에는 통합 품질과 자동화를 다룹니다.`,
  10: `[말하기] 9주부터 12주까지는 현재 시스템을 보강하고 관리형 서비스와 자동화를 비교합니다. SageMaker나 Bedrock을 사용했다는 사실보다 프로젝트에 왜 필요했고 무엇을 제외했는지가 중요합니다. 12주차에는 GitHub의 변경이 검사와 배포로 이어지는 흐름을 만듭니다.\n\n[진행] 각 기술을 반드시 모두 넣는 수업은 아니라고 설명합니다. 비용과 복잡도를 포함해 선택 근거를 남기는 것이 과제입니다.\n\n[전환] 마지막 구간에서는 운영 상태와 발표 품질을 완성합니다.`,
  11: `[말하기] 13주부터 15주까지는 정상 동작만 확인하지 않습니다. 어떤 로그와 지표로 이상을 찾는지, 최종 시연에서 무엇을 보여 줄지, 수업이 끝난 뒤 비용 자원을 어떻게 정리할지까지 확인합니다.\n\n[진행] 14주차는 기능을 더 넣는 날이 아니라 최종 범위를 고정하고 리허설 결함을 고치는 날이라고 안내합니다.\n\n[전환] 여기까지의 주차가 왜 누적 구조인지 한 번 더 연결하겠습니다.`,
  12: `[말하기] 앞 주차의 결정은 다음 주차의 입력입니다. 데이터 규격이 불분명하면 API 입력을 정할 수 없고, 이미지 태그가 불명확하면 어떤 모델이 배포됐는지 설명할 수 없습니다. 따라서 결석이나 미완료 산출물은 다음 주에 바로 보완해야 합니다.\n\n[진행] 정의, 검증, 전달, 책임의 네 단계를 연결해 읽습니다. 학생들에게 어느 단계에서 기록이 가장 자주 빠질 것 같은지 물어봅니다.\n\n[전환] 이제 실제 한 번의 수업이 어떻게 운영되는지 설명하겠습니다.`,
  13: `[말하기] 매주 수업은 50분씩 네 교시이며 교시 사이에는 10분 휴식이 있습니다. 총 수업시간은 200분이고, 각 교시가 끝날 때 그 시간의 산출물을 확인합니다. 단순히 화면을 넘긴 수가 아니라 결과가 남았는지를 기준으로 진행합니다.\n\n[진행] 오늘의 네 교시 예시를 표에서 읽고, 휴식 시작과 재개 시각은 강사 제어 화면의 타이머로 안내한다고 설명합니다.\n\n[전환] 한 교시 안에서는 다섯 단계로 움직입니다.`,
  14: `[말하기] 한 교시는 완료 조건을 확인하고, 방법을 판단하고, 직접 실행하고, 다른 사람이 검증하고, 증거를 저장하는 순서로 진행합니다. 강사의 화면을 똑같이 복제하는 것이 목표가 아닙니다. 팀이 선택한 방법을 설명할 수 있어야 합니다.\n\n[진행] 다섯 단계를 왼쪽부터 읽고, 오류가 생겼을 때 실행 단계에서 멈추지 말고 검증과 기록까지 이어 가야 한다고 말합니다.\n\n[전환] 이 흐름에서 개인, 팀, 강사의 책임을 구분하겠습니다.`,
  15: `[말하기] 강사는 문제와 완료 기준을 제시하고 진행 상태를 확인합니다. 학생은 자기 화면에서 직접 실행하고 결과와 오류를 설명해야 합니다. 팀은 역할을 나누고 결정 근거를 기록하며, 동료 팀은 문서만 보고 재현합니다.\n\n[진행] 질문이 들어오면 정답 명령부터 주지 않고 현재 화면, 오류 문장, 이미 시도한 방법을 먼저 확인한다고 안내합니다.\n\n[전환] 이 역할 분담을 지원하기 위해 수업 화면을 사용합니다.`,
  16: `[말하기] 지금 보고 있는 화면은 출석부이면서 활동지, 질문 창구, 첨부파일 배포 도구입니다. 학생과 강사는 같은 장표 번호를 보며, 입력과 완료 상태는 강사 화면에 실시간으로 집계됩니다. 학생 이름은 강사 화면에서만 확인합니다.\n\n[진행] 학생들에게 네 항목을 실제로 확인하게 하고 완료 버튼을 누르게 합니다. 오른쪽 참여 현황에서 미완료 학생이 있는지 확인한 뒤 필요한 경우 접속을 돕습니다.\n\n[전환] 앞으로 매주 이 화면과 저장소에 어떤 증거를 남길지 보겠습니다.`,
  17: `[말하기] 수업에서 “했습니다”라는 말만으로는 결과를 확인할 수 없습니다. 코드와 문서에는 버전과 수정 목적을, 실행 결과에는 명령과 환경을, 오류 기록에는 오류 전문과 시도한 방법을 남깁니다. 화면 캡처에서는 민감정보를 반드시 제거합니다.\n\n[진행] 표의 각 증거를 실제 제출 예와 연결해 설명합니다. 좋은 캡처는 버튼 위치만 보이는 화면이 아니라 경로와 결과 상태를 함께 보여 준다고 안내합니다.\n\n[전환] 이 증거들이 평가에서 어떻게 사용되는지 설명하겠습니다.`,
  18: `[말하기] 평가는 최종 화면만 보는 것이 아닙니다. 기능이 실제로 동작하는지, 다른 사람이 재현할 수 있는지, 선택 근거를 설명하는지, 운영 상태를 확인하는지, 개인이 팀에 기여했는지를 함께 봅니다. 정확한 배점은 공식 강의계획서를 따릅니다.\n\n[진행] 다섯 기준을 읽고 활동 기록이 개인 참여와 팀 진행 상황을 확인하는 자료라고 안내합니다. 오류 자체보다 오류를 숨기거나 기록하지 않는 것이 더 큰 문제라고 설명합니다.\n\n[전환] 팀 안에서는 책임을 어떻게 나눌지 보겠습니다.`,
  19: `[말하기] 데이터, 모델, 배포, 검증은 직급이 아니라 그 주차의 책임입니다. 역할은 순환하고, 세 명인 팀은 일부 역할을 겸임할 수 있습니다. 다만 작성자와 검증자는 가능하면 다르게 두어야 합니다.\n\n[진행] 네 역할의 대표 책임을 읽고 학생들에게 가장 해 보고 싶은 역할과 가장 부담되는 역할을 생각하게 합니다. 실제 팀 구성은 2교시에 진행한다고 예고합니다.\n\n[전환] 프로젝트를 AWS에서 진행할 때 지켜야 할 기준을 먼저 확인하겠습니다.`,
  20: `[말하기] AWS에서는 자원을 만들기 전에 현재 계정과 역할, 리전, 자원 이름, 예상 비용, 종료 시점을 확인합니다. 수업의 기본 리전은 서울, ap-northeast-2입니다. 만든 자원의 이름만 보고도 팀과 주차를 구분할 수 있어야 합니다.\n\n[진행] 학생에게 체크 항목을 하나씩 확인하게 합니다. 아직 AWS에 로그인하지 못한 학생은 완료하지 말고 Q&A에 현재 상태를 남기게 합니다.\n\n[전환] 비용 기준과 함께 반드시 지켜야 할 보안 기준도 확인하겠습니다.`,
  21: `[말하기] 비밀번호, 인증 코드, 액세스 키, 비밀 키, 세션 토큰은 장표 응답과 GitHub, 화면 캡처 어디에도 남기지 않습니다. 계정 번호와 리소스 식별자도 공개 저장소에 올리기 전에 공개 범위를 확인해야 합니다.\n\n[진행] 표의 왼쪽 항목을 읽고, 오른쪽의 공유 전 확인 절차를 설명합니다. 실습 중 비밀값이 보이면 캡처보다 먼저 화면을 닫고 강사에게 알리도록 안내합니다.\n\n[전환] 이어서 이 수업을 진행할 강사의 실무 배경을 소개하겠습니다.`,
  22: `[말하기] 강사 박주혁입니다. 2004년부터 웹 서비스, 여행·예약 시스템, ERP, SaaS와 여러 플랫폼을 개발하고 운영해 왔습니다. 현재는 헥사아이 대표로 서비스 연구개발과 창업교육을 진행하고 있습니다.\n\n[진행] 경력 전체를 나열하기보다 표의 네 구분을 중심으로 소개합니다. 수업 밖 과목 문의에는 j.park@yeonsung.ac.kr을 사용해 달라고 안내합니다.\n\n[전환] 이 경력이 이번 수업 방식과 어떻게 연결되는지 말씀드리겠습니다.`,
  23: `[말하기] 실제 서비스에서는 코드만 맞는다고 일이 끝나지 않습니다. 사용자의 요구, 팀 일정, 장애 대응, 운영 비용을 함께 판단해야 합니다. 그래서 이 수업에서도 기술 구현과 프로젝트 운영을 분리하지 않습니다.\n\n[진행] 표의 경험과 수업 관점을 한 행씩 연결합니다. 학생들이 기술 선택 이유와 서비스 운영 질문을 자유롭게 해도 된다고 말합니다.\n\n[전환] 질문을 빠르게 해결하기 위해 질문 작성 방법을 정하겠습니다.`,
  24: `[말하기] 질문할 때는 “안 돼요”라고만 적지 말고 멈춘 단계, 화면에 보이는 오류 문장, 이미 시도한 일을 함께 적어 주세요. 이 세 가지가 있으면 강사와 팀원이 훨씬 빨리 원인을 찾을 수 있습니다. 수업 밖 문의는 화면의 강사 이메일을 사용합니다.\n\n[진행] 학생에게 과목 운영에 관해 궁금한 점을 한 가지 입력하게 합니다. 오른쪽 강사 화면에서 질문을 몇 개 골라 바로 답하고, 나머지는 수업 중 연결해서 설명합니다.\n\n[전환] 마지막으로 현재 실습 경험을 확인하겠습니다.`,
  25: `[말하기] 지금부터 받는 응답은 성적을 매기는 시험이 아닙니다. AWS와 Git·GitHub 경험을 확인해 설명 속도와 실습 지원 순서를 정하려는 진단입니다. 경험이 없다고 불이익이 없으니 현재 상태대로 선택해 주세요.\n\n[진행] 학생이 두 항목을 선택하고 가장 걱정되는 부분을 적게 합니다. 강사 화면에서 응답 분포를 확인하고 “처음” 응답이 많으면 2주차 환경 설명 시간을 늘리겠다고 안내합니다.\n\n[전환] 이제 오늘 남은 세 교시의 작업과 파일을 확인하겠습니다.`,
  26: `[말하기] 1교시에는 과목 구조와 운영 방식을 확인했습니다. 2교시는 팀 구성과 역할·규칙 결정, 3교시는 프로젝트 후보 비교, 4교시는 AWS 로그인과 S3·CloudShell 실습으로 진행합니다. 오늘 끝날 때 네 가지 결과가 실제 파일과 AWS 화면으로 남아야 합니다.\n\n[진행] 첨부파일에서 팀 시작 파일과 학생 안내서를 내려받게 합니다. 다운로드 위치를 확인한 학생은 체크하고 완료를 누르게 한 뒤, 미완료 학생을 확인해 파일 저장을 돕습니다.\n\n[전환] 휴식 후 바로 팀 구성 활동을 시작하겠습니다.`,
};

Object.entries(professionalOpeningScripts).forEach(([slide, script]) => {
  window.COURSE_INTERACTIONS.week01[Number(slide)].note = script;
});
