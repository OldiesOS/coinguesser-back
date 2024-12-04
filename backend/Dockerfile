# 베이스 이미지로 Node.js LTS 버전 사용
FROM node:18

# Python 및 pip 설치
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv --fix-missing

# 가상 환경 생성 및 패키지 설치
WORKDIR /app
RUN python3 -m venv /app/venv
RUN venv/bin/pip install --upgrade pip
COPY src/scripts/requirements.txt /src/scripts/requirements.txt
RUN venv/bin/pip install -r /src/scripts/requirements.txt

# 프로젝트 파일 복사 및 npm 종속성 설치
COPY package*.json ./
RUN npm install

# 전체 프로젝트 파일 복사
COPY . .

# 애플리케이션을 노출할 포트 설정
EXPOSE 3000

# wait-for-it.sh script 복사
COPY wait-for-it.sh /usr/local/bin/wait-for-it

# wait-for-it.sh 실행 가능하도록 설정
RUN chmod +x /usr/local/bin/wait-for-it

# 애플리케이션 시작 명령어
CMD ["npm", "start"]
