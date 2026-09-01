# 01주차 — MLOps 개요와 클라우드 첫걸음

수업 200분(50분 × 4교시), 교시 사이 휴식 10분. 실제 경과 시간은 230분이다.

## 수업이 끝나면 남아 있어야 할 것

- 압축을 푼 `team-start-kit` 폴더
- 팀의 `TEAM_REGISTRATION.md`, `TEAM_CHARTER.md`, `ROLE_ROTATION.csv`
- 프로젝트 후보 두 개와 `PROJECT_IDEA_CARD.md`
- 서울 리전의 비공개 S3 버킷과 `sample-bike.csv`
- 버킷 화면과 CloudShell `aws s3 ls` 결과

## 강사 사전 준비

- `0060.kr/instructor`에서 수업을 만들고 학생 코드와 PT 화면을 준비한다.
- IAM Identity Center의 학생 계정·권한·접속 포털을 확인한다.
- 학교망에서 AWS 콘솔, S3, CloudShell 접속을 시험한다.
- 학생이 퍼블릭 액세스 차단을 해제하지 못하도록 안내한다.
- 22·36·51·65·70번 장표의 첨부파일을 확인한다.

## 200분 운영표

| 교시 | 수업 내용 | 시간 |
|---|---|---:|
| 1교시 | 규칙 계산기 체험, MLOps가 필요한 이유, 수업 파일 받기 | 50분 |
| 휴식 |  | 10분 |
| 2교시 | 개인 역량 확인, 3~4명 팀 구성, 역할과 팀 규칙 결정 | 50분 |
| 휴식 |  | 10분 |
| 3교시 | 예시 주제 8개 비교, 후보 채점, 두 후보와 검토 의견 남기기 | 50분 |
| 휴식 |  | 10분 |
| 4교시 | AWS 로그인, 서울 리전 확인, S3 버킷과 CloudShell 실습 | 50분 |

## 1교시 — 수업 준비와 MLOps(50분)

| 구간 | 내용 | 분 |
|---|---|---:|
| 도입 | 중고 노트북 가격을 먼저 정하고 가격 계산 화면 실행 | 8 |
| 구분 | 현재 화면은 정해진 식을 쓰는 계산기이며 ML 모델이 아님을 확인 | 4 |
| 연결 | 화면 → API 요청 → 계산 → 요청 기록의 흐름 설명 | 4 |
| 안내 | 15주 결과물, 평가, AWS 비용·공개 설정 원칙 | 13 |
| 파일 | 팀 시작 파일 다운로드, 압축 해제, README 확인 | 13 |
| 개념 | 버전·재현·로그 문제를 짧은 활동으로 확인 | 6 |
| 확인 | 완료 버튼과 질문 확인 | 2 |
| 합계 |  | **50** |

첫 문장은 다음처럼 시작한다.

> 새 제품 가격은 150만 원입니다. 3년 썼고 배터리는 78%, 외관은 B등급입니다. 여러분이라면 얼마에 올리겠습니까?

계산 결과를 보여 준 뒤에는 다음을 분명히 말한다.

> 지금 쓴 화면은 입력값을 정해진 식에 넣는 가격 계산기입니다. 아직 머신러닝 모델은 아닙니다. 그래도 화면, 요청 주소, 계산 코드, 기록을 함께 관리해야 합니다. 7주차에는 같은 자리에 실제 모델을 연결합니다.

MLOps는 세 문제로 설명한다.

1. “내 컴퓨터에서는 됐는데요.” — 실행 환경을 함께 관리해야 한다.
2. “지난번 결과를 어떻게 만들었지?” — 데이터·코드·설정의 버전을 남겨야 한다.
3. “어제까지 됐는데 왜 안 되지?” — 로그와 상태를 확인해야 한다.

## 2교시 — 팀 만들기(50분)

| 구간 | 학생 활동 | 파일 | 분 |
|---|---|---|---:|
| 개인 확인 | 경험과 희망 역할 작성 | `SKILL_PASSPORT.md` | 6 |
| 소개 | 30초 소개 문장 작성·연습 | `SKILL_PASSPORT.md` | 4 |
| 구성판 | 이름·희망 역할·경험 공개 | `TEAM_FORMATION_BOARD.md` | 4 |
| 대화 | 서로 다른 역할의 학생 네 명과 대화 | 구성판 | 6 |
| 임시 팀 | 3~4명 팀 구성 | `TEAM_REGISTRATION.md` | 6 |
| 역할 확인 | 데이터·모델·배포·검증 역할 배치 | `ROLE_ROTATION.csv` | 5 |
| 방식 확인 | 연락·회의·마감·갈등 처리 질문 | `TEAM_CHARTER.md` | 5 |
| 규칙 결정 | 행동으로 판단할 수 있는 팀 규칙 작성 | `TEAM_CHARTER.md` | 5 |
| 역할 배정 | 1~4주 담당자 결정 | `ROLE_ROTATION.csv` | 4 |
| 등록 | 팀 등록과 완료 확인 | `TEAM_REGISTRATION.md` | 5 |
| 합계 |  |  | **50** |

학생이 역할과 일하는 방식을 확인한 뒤 팀을 만들게 한다. 마지막까지 팀을 찾지 못한 학생만 강사가 조정한다.

- 나쁜 규칙: “연락을 잘한다.”
- 좋은 규칙: “평일에는 메시지를 확인한 뒤 12시간 안에 확인 표시를 남긴다.”

## 3교시 — 주제 고르기(50분)

예시 주제는 모두 공개 데이터로 시작할 수 있으며, 3주차에 데이터를 직접 열어 본 뒤 최종 확정한다.

1. 서울 자전거 수요 예측
2. 건물 에너지 효율 예측
3. 설비 고장 가능성 분류
4. 실내 재실 여부 분류
5. 가전 에너지 사용량 예측
6. 콩 품종 분류
7. 콘크리트 압축 강도 예측
8. 온라인 구매 가능성 분류

| 구간 | 활동 | 분 |
|---|---|---:|
| 기준 읽기 | 데이터·난이도·사용자·화면·지표·비용·안전·시연 | 4 |
| 예시 비교 | 두 주제씩 네 번 비교 | 12 |
| 개인 선택 | 팀원마다 후보 세 개 선택 | 5 |
| 채점 | 후보를 1~5점으로 평가하고 근거 작성 | 8 |
| 토론 | 두 점 이상 차이 나는 기준부터 이야기 | 6 |
| 두 후보 | 1순위와 2순위 결정 | 5 |
| 아이디어 카드 | 사용자·입력·결과·화면·성공 기준 작성 | 5 |
| 옆 팀 점검 | 고칠 점 두 개와 유지할 점 한 개 | 4 |
| 확인 | 후보 입력과 완료 버튼 | 1 |
| 합계 |  | **50** |

주제는 다음 문장으로 설명할 수 있어야 한다.

> `[사용자]`가 `[입력]`을 넣으면 `[예측 결과]`를 받고, `[화면]`에서 다음 행동을 결정한다.

## 4교시 — AWS에 첫 파일 올리기(50분)

### 실습 경로

1. 학교에서 받은 AWS access portal 주소로 로그인한다.
2. 수업용 계정·역할을 선택하고 Management console을 연다.
3. 오른쪽 위 리전을 `아시아 태평양(서울) ap-northeast-2`로 맞춘다.
4. `S3 → Buckets → Create bucket`으로 이동한다.
5. 버킷 이름을 `mlops-2026-<학번>-<임의문자>`로 정한다.
6. `ACLs disabled / Bucket owner enforced`를 유지한다.
7. `Block all public access`를 유지한다.
8. 59번 장표에서 `sample-bike.csv`를 받고 버킷에 올린다.
9. CloudShell을 열고 아래 명령을 실행한다.

```bash
aws s3 ls
aws s3 ls s3://내-버킷-이름/
aws s3 cp s3://내-버킷-이름/sample-bike.csv s3://내-버킷-이름/raw/sample-bike.csv
aws s3 ls s3://내-버킷-이름/raw/
```

| 구간 | 분 |
|---|---:|
| AWS 용어와 로그인 | 13 |
| S3 실습 설명·완료 조건 | 7 |
| S3 화면 이동과 버킷 만들기 | 16 |
| 파일 업로드 | 3 |
| CloudShell 명령 | 7 |
| 제출 확인·정리·마무리 | 4 |
| 합계 | **50** |

## 자주 막히는 지점

| 증상 | 먼저 확인할 것 | 조치 |
|---|---|---|
| access portal이 열리지 않음 | 주소 오타, 학교망 | 안내 주소를 다시 열고 다른 네트워크에서도 시험 |
| 인증 코드가 맞지 않음 | 휴대폰 자동 시간, 코드 만료 | 자동 시간 설정 후 새 코드 입력 |
| 수업 계정·역할이 안 보임 | 계정 배정 | 화면을 임의로 바꾸지 말고 강사에게 알림 |
| 버킷 이름 오류 | 전역 중복, 이름 규칙 | 임의문자 변경, 소문자·숫자 사용 |
| 만든 버킷이 안 보임 | 로그인 계정과 리전 | 계정·역할과 서울 리전 다시 확인 |
| CloudShell 명령 실패 | 버킷 이름, 경로, 꺾쇠 | 명령 전체와 오류 문장을 함께 읽기 |

## 공식 문서

- [IAM Identity Center 사용자 포털](https://docs.aws.amazon.com/singlesignon/latest/userguide/using-the-portal.html)
- [S3 버킷 만들기](https://docs.aws.amazon.com/AmazonS3/latest/userguide/create-bucket-overview.html)
- [S3 버킷 이름 규칙](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html)
- [S3 객체 소유권](https://docs.aws.amazon.com/AmazonS3/latest/userguide/about-object-ownership.html)
- [S3 퍼블릭 액세스 차단](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html)
- [S3 객체 업로드](https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html)
- [AWS CloudShell](https://docs.aws.amazon.com/cloudshell/latest/userguide/welcome.html)
- [AWS CLI `s3 ls`](https://docs.aws.amazon.com/cli/latest/reference/s3/ls.html)
- [AWS CLI `s3 cp`](https://docs.aws.amazon.com/cli/latest/reference/s3/cp.html)
- [Amazon S3 요금](https://aws.amazon.com/s3/pricing/)

## NCS 교차 확인

학생 화면에는 능력단위 코드를 반복해서 노출하지 않는다. 교육계획서와 평가 근거에는 다음을 남긴다.

- 인공지능 서비스 기술 환경 분석: 클라우드 계정·리전·저장소·권한 환경 확인
- 인공지능 플랫폼 구축 비용 계획: 사용량 과금, 공개 설정, 리소스 정리 원칙 확인
- 인공지능 플랫폼 동향 분석: 모델 파일에서 배포·운영 가능한 서비스로 이어지는 흐름 이해
