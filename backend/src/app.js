require('dotenv').config({ path: '../.env' });
const schedule = require('node-schedule');
const EventEmitter = require('events');
const express = require('express');
const app = express();
const { updateDatabase, getCoinValue } = require('./services/dbService');


const eventEmitter = new EventEmitter();

// 다른 설정 및 미들웨어 추가 가능
// 예: app.use(express.json());
schedule.scheduleJob('*/5 * * * *', () => {
    console.log('Running scheduled database update...');
    // updateDatabase();
    eventEmitter.emit('dataUpdate', '데이터 베이스 변동'); // 이벤트 발생 
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
app.get('/API/stream/:coin_name', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const coin_name = req.params.coin_name;


  const sendData = async () => {
    try {
      const result = await getCoinValue(coin_name, false); // coin_name 기반 데이터 가져오기
      const res_value = result[0];
      res.write(`data: ${JSON.stringify(res_value)}\n\n`); // SSE 데이터 전송
    } catch (error) {
      console.error('Error during SSE:', error);
      res.write(`event: error\ndata: "Error fetching data"\n\n`);
    }
  };

  //지금은 인터벌로 하는데 이 부분은 스케줄링 구현 되면 지울 거임
  const interval = setInterval(sendData, 5000); 

  // 이벤트 리스너 등록
  const handleUpdate = (data) => {
    // console.log(`Received update for ${coin_name}:`, data);
    sendData(coin_name); // 이벤트가 발생하면 sendData 호출
  };

  eventEmitter.on('dataUpdate', handleUpdate);

  
  // 첫 데이터 전송
  sendData(coin_name);

  req.on('close', () => {
    console.log('SSE connection closed');
    clearInterval(interval);
    eventEmitter.removeListener('dataUpdate', handleUpdate); // 리스너 제거
    res.end(); // SSE 응답 종료
  });

});





// app 객체를 외부에서 사용할 수 있도록 내보내기
module.exports = app;
