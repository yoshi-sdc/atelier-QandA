import request from 'supertest';
import express from 'express';
const app = require('../server.js');


// describe('Get questions route', function() {
//   test('responds to /qa/question given a product id', async () => {
//     const res = await request(app).get('/qa/questions?product_id=5')
//       expect(res.statusCode).toBe(200)
//   })
// })

describe('Get answers route', function() {
  test('responds to /qa/question/q_id/answers given a question id', async () => {
    const res = await request(app).get('/qa/questions/5/answers')
      expect(res.statusCode).toBe(200)
      expect(res.body.question).toBe('5')
  })
})
