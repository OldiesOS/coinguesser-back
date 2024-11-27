const request = require('supertest'); //패키지 설치
const app = require('../../backend//src/app'); 

describe('API Endpoints', () => {
  it('should return Hello, Express! on GET /', async () => {
    const res = await request(app).get('/');
  });

  it('should return coin data on GET /API/:coin_name', async () => {
    const coinName = 'bitcoin'; 
    const res = await request(app).get(`/API/${coinName}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.coin).toBe(coinName);
    expect(res.body).toHaveProperty('data');
  });

  it('should connect SSE stream on GET /API/stream/:coin_name', async () => {
    const coinName = 'bitcoin';
    const res = await request(app).get(`/API/stream/${coinName}`);
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/event-stream');
  });
});
