require("dotenv").config({ path: "../.env" });
const schedule = require("node-schedule");
const EventEmitter = require("events");
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const {
  initDatabase,
  updateDatabase,
  getCoinValue,
} = require("./services/dbService");

const eventEmitter = new EventEmitter();

// 다른 설정 및 미들웨어 추가 가능
// 예: app.use(express.json());

// schedule.scheduleJob('*/5 * * * *', () => {
//     console.log('Running scheduled database update...');
//     // updateDatabase();
//     eventEmitter.emit('dataUpdate', data); // 이벤트 발생
// eventEmitter.emit('dataUpdate', data) 인자로 데이터 안 줘도 되는데 주면 데베에서 또 조회할 필요가 없으니까 부담이 적음
// });

(async () => {
  try {
    // 서버 시작 시 데이터베이스 초기화
    console.log("Initializing database...");
    await initDatabase();
    console.log("Database initialization completed.");
  } catch (error) {
    console.error("Error during database initialization:", error);
  }
})();

//5분 단위 실행
schedule.scheduleJob("*/5 * * * *", () => {
  console.log("Running scheduled database update...");
  updateDatabase();
  eventEmitter.emit("dataUpdate"); // 이벤트 발생
});

// Flutter 웹 애플리케이션의 정적 파일 제공
const webAppPath = path.join(__dirname, "../build", "web");

app.use(cors()); // 모든 출처 허용
app.use(express.json());
// 정적 파일 제공 설정
app.use(express.static(webAppPath));

app.get("/", (req, res) => {
  console.log("실행");
  res.sendFile(path.join(webAppPath, "index.html"));
});

// 초기 데이터 응답
app.get("/API/:coin_name", async (req, res) => {
  try {
    // 경로 매개변수에서 coin_name 추출
    const coin_name = req.params.coin_name;

    // getCoinValue 함수 호출
    const result = await getCoinValue(coin_name, true);

    const res_value = {
      coin: coin_name,
      data: result,
    };
    // 결과 반환
    res.json(res_value);
  } catch (error) {
    console.error("Error in /API/:coin_name:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//SSE 연결
app.get("/API/stream/:coin_name", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const coin_name = req.params.coin_name;

  const sendData = async (coin_name) => {
    try {
      const result = await getCoinValue(coin_name, false); // coin_name 기반 데이터 가져오기
      const res_value = {
        coin: coin_name,
        ...result[0],
      };
      res.write(`data: ${JSON.stringify(res_value)}\n\n`); // SSE 데이터 전송
    } catch (error) {
      console.error("Error during SSE:", error);
      res.write(`event: error\ndata: "Error fetching data"\n\n`);
    }
  };

  // 이벤트 리스너 등록
  const handleUpdate = () => {
    // console.log(`Received update for ${coin_name}:`, data);
    sendData(coin_name); // 이벤트가 발생하면 sendData 호출
  };

  eventEmitter.on("dataUpdate", handleUpdate);

  // 첫 데이터 전송
  sendData(coin_name);

  setInterval(() => {
    // console.log('~~~~pp');
    res.write(`data: ${JSON.stringify({ event: "ping" })}\n\n`);
  }, 10000); // 10초마다

  req.on("close", () => {
    console.log("SSE connection closed");
    eventEmitter.removeListener("dataUpdate", handleUpdate); // 리스너 제거
    res.end(); // SSE 응답 종료
  });
});

// app 객체를 외부에서 사용할 수 있도록 내보내기
module.exports = app;
