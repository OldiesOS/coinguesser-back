require('dotenv').config({ path: '../.env' });
const schedule = require('node-schedule');
const express = require('express');
const app = express();
const { updateDatabase } = require('./services/dbService');

// 다른 설정 및 미들웨어 추가 가능
// 예: app.use(express.json());
schedule.scheduleJob('*/5 * * * *', () => {
    console.log('Running scheduled database update...');
    updateDatabase();
  });

  console.log('Scheduled job initialized to run every 5 minutes.');
// 기본 라우트
app.get('/', (req, res) => {
    res.send('Hello, Express!');
});

// app 객체를 외부에서 사용할 수 있도록 내보내기
module.exports = app;
