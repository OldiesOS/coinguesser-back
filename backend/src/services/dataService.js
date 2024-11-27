const path = require("path");
const { exec } = require("child_process");

async function fetchinitData() {
  return new Promise((resolve, reject) => {
    // Python 스크립트의 경로를 절대 경로로 지정
    const venvPythonPath = path.join(__dirname, "../../venv/bin/python3"); // 가상 환경 경로 맞춤 설정
    const scriptPath = path.join(__dirname, "../scripts/fetch_data.py");

    exec(
      `${venvPythonPath} ${scriptPath} --count 13`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("Error executing Python script:", error);
          return reject(error);
        }
        if (stderr) {
          console.error("Python script stderr:", stderr);
          return reject(new Error(stderr));
        }
        try {
          // Python 스크립트의 출력(JSON 형식)을 파싱
          const data = JSON.parse(stdout);
          resolve(data);
        } catch (parseError) {
          console.error("Error parsing JSON:", parseError);
          reject(parseError);
        }
      }
    );
  });
}

async function fetchData() {
  return new Promise((resolve, reject) => {
    // Python 스크립트의 경로를 절대 경로로 지정
    const venvPythonPath = path.join(__dirname, "../../venv/bin/python3"); // 가상 환경 경로 맞춤 설정
    const scriptPath = path.join(__dirname, "../scripts/fetch_data.py");

    exec(
      `${venvPythonPath} ${scriptPath} --count 1`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("Error executing Python script:", error);
          return reject(error);
        }
        if (stderr) {
          console.error("Python script stderr:", stderr);
          return reject(new Error(stderr));
        }
        try {
          // Python 스크립트의 출력(JSON 형식)을 파싱
          const data = JSON.parse(stdout);
          resolve(data);
        } catch (parseError) {
          console.error("Error parsing JSON:", parseError);
          reject(parseError);
        }
      }
    );
  });
}

module.exports = {
  fetchData,
  fetchinitData,
};
