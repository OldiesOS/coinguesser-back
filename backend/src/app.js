require('dotenv').config({ path: '../.env' });
const schedule = require('node-schedule');
const express = require('express');
const app = express();
const { updateDatabase, getCoinValue } = require('./services/dbService');


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


app.get('/API/Data/stream/:coin_name', async (req, res) => {
  try {
    // 경로 매개변수에서 coin_name 추출
    const coin_name = req.params.coin_name;

    // getCoinValue 함수 호출
    const result = await getCoinValue(coin_name);

    const res_value = {
      "coin" : coin_name,
      "data" : result
    }
    // 결과 반환
    res.json(res_value);
  } catch (error) {
    console.error('Error in /API/Data/stream/:coin_name:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// app 객체를 외부에서 사용할 수 있도록 내보내기
module.exports = app;
