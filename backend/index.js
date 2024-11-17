const app = require('./src/app'); // app.js 파일 가져오기

const PORT = process.env.PORT || 3000;

// 서버 실행
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
