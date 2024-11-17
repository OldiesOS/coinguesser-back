# 베이스 이미지로 Node.js LTS 버전 사용
FROM node:18

# 컨테이너 내의 작업 디렉토리 설정
WORKDIR /usr/src/app

# 프로젝트 파일 복사
COPY package.json .

# 종속성 설치
RUN npm install

# 전체 프로젝트 파일 복사
COPY src/ .

# 애플리케이션을 노출할 포트 설정
EXPOSE 3000

# 애플리케이션 시작 명령어
CMD ["npm", "start"]
