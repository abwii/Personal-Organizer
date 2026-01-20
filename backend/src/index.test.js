const request = require('supertest');
const app = require('./index');

describe('Health Check', () => {
  it('should return 200 and OK status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });
});
