require('dotenv').config({ path: '../.env' });
const schedule = require('node-schedule');
const express = require('express');
const app = express();
const { updateDatabase, getCoinValue } = require('./services/dbService');


// 다른 설정 및 미들웨어 추가 가능
// 예: app.use(express.json());
schedule.scheduleJob('*/5 * * * *', () => {
    console.log('Running scheduled database update...');
    // updateDatabase();
  });

  console.log('Scheduled job initialized to run every 5 minutes.');


// 기본 라우트
app.get('/', (req, res) => {
    res.send('Hello, Express!');
});



// 초기 데이터 응답
app.get('/API/:coin_name', async (req, res) => {
  try {
    // 경로 매개변수에서 coin_name 추출
    const coin_name = req.params.coin_name;

    // getCoinValue 함수 호출
    const result = await getCoinValue(coin_name, true);

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

//SSE 연결 
app.get('/API/stream/:coin_name', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const coin_name = req.params.coin_name;

    const sendData = async () => {
      try {
        const result = await getCoinValue(coin_name, false);
        res_value = result[0];
        res.write(`data: ${JSON.stringify(res_value)}\n\n`);
      } catch (error) {
        console.error('Error during SSE:', error);
        res.write(`event: error\ndata: "Error fetching data"\n\n`);
      }
    };

    // const interval = setInterval(sendData, 5000);
    const interval = setInterval(sendData, 300000); // 300,000 밀리초 = 5분

    req.on('close', () => {
      console.log('SSE connection closed');
      clearInterval(interval);
      res.end();
    });

    sendData(); // 첫 데이터 전송
  } catch (error) {
    console.error('Error in /API/Data/stream/:coin_name:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// app 객체를 외부에서 사용할 수 있도록 내보내기
module.exports = app;
