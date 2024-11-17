require('dotenv').config(); // .env 파일 로드

const express = require('express');
const app = express();

// 다른 설정 및 미들웨어 추가 가능
// 예: app.use(express.json());

// 기본 라우트
app.get('/', (req, res) => {
    res.send('Hello, Express!');
});

// app 객체를 외부에서 사용할 수 있도록 내보내기
module.exports = app;
