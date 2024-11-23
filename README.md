# coinguesser-back

### 프로젝트 구조 
- server 파일과 model 파일 따로 나눠서 관리
- model에서 학습한 머신러닝 모델을 pkl파일로 패키징해서 fastapi를 이용해 서버와 통신

https://github.com/OldiesOS/coinguesser-back/projects
### 브랜치 관리
- `main` : 항상 배포 가능한 상태를 유지
- `develop` : 기능을 테스트하고 안정화 하는 브랜치
- `feature/*` : 개발자가 새로운 기능을 개발하는 브랜치
    - ex : `feature/data-api`, `feature/login`
    - 알아서 이름 지어서 만든 다음에 거기서 작업이용
- `chore` : 환경 변수, README.md 파일 수정 등 잡다한 일

### Git Action 관련
- 새로운 기능을 추가할 때 test/ 디렉토리에 자신이 개발한 기능에 대한 `feature*.test.js` 파일도 작성해야함
- git action으로 `feature` 브랜치에서 `main` 브랜치로 PR시 자동으로 테스트

