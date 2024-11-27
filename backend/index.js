const app = require('./src/app'); // app.js 파일 가져오기
const PORT = process.env.PORT || 3000;

// 서버 실행 - 모든 아이피 접속에 대해서 열었음
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
