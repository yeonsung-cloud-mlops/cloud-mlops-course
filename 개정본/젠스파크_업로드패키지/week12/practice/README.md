# 12주차 실습 파일 사용법

1. 자신의 GitHub 저장소에 `.github/workflows/deploy.yml`을 복사한다.
2. AWS IAM에서 GitHub OIDC 공급자를 만든다. 공급자 URL은 `https://token.actions.githubusercontent.com`, 대상은 `sts.amazonaws.com`이다.
3. IAM 역할의 신뢰 정책에서 `sub`를 `repo:내조직/내저장소:ref:refs/heads/main`으로 제한한다.
4. GitHub 저장소의 **Settings → Secrets and variables → Actions → Variables**에서 `AWS_ROLE_ARN`을 등록한다.
5. 저장소에 실제 Dockerfile과 애플리케이션 코드가 있는지 확인한 뒤 Actions에서 수동 실행한다.

장기 액세스 키를 GitHub Secret에 저장하지 않는다. 수업 계정과 저장소 이름이 정해지지 않은 상태에서는 OIDC 공급자나 역할을 먼저 만들지 않는다.

