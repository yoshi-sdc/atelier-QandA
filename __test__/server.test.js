import request from 'supertest';
import express from 'express';
const app = require('../app.js');


describe('Get questions route', function() {
  test('responds to /qa/question given a product id', async () => {
    const res = await request(app).get('/qa/questions?product_id=12345')
      expect(res.statusCode).toBe(200)
  })
})

describe('Get answers route', function() {
  test('responds to /qa/question/q_id/answers given a question id', async () => {
    const res = await request(app)
      .get('/qa/questions/9000/answers')
      expect(res.statusCode).toBe(200)
      expect(res.body).toBeDefined()
      expect(res.body.question).toBe('9000')
      expect(res.body.page).toBeTruthy()
      expect(res.body.count).toBeTruthy()
      expect(res.body.results).toBeTruthy()
  })
})

describe('Post question route', function() {
  test('responds to posting a question', async () => {
    const res = await request(app)
      .post('/qa/questions')
      .send({
        "body": "Testing posting a question",
        "name": "Anomnomus",
        "email": "test@gmail.com",
        "product_id": 8
    })
      expect(res.statusCode).toBe(201)
  })
})

describe('Put question route for helpfulness', function() {
  test('responds to a put request to mark a question helpful', async () => {
    const res = await request(app)
      .put('/qa/questions/5/helpful')
      expect(res.statusCode).toBe(204)
  })
})

describe('Put question route for reported', function() {
  test('responds to a put request report a question', async () => {
    const res = await request(app)
      .put('/qa/questions/103/report')
      expect(res.statusCode).toBe(204)
  })
})

describe('Post answer route', function() {
  test('responds to posting an answer', async () => {
    const res = await request(app)
      .post('/qa/questions/8/answers')
      .send({
        "body": "Testing posting an answer",
        "name": "Anomnomus",
        "email": "test@gmail.com",
        "photos": ["https://images.unsplash.com/photo-1530519729491-aea5b51d1ee1?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1651&q=80",
          "https://images.unsplash.com/photo-1511127088257-53ccfcc769fa?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80",
          "https://images.unsplash.com/photo-1500603720222-eb7a1f997356?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1653&q=80"
        ]
      })
      expect(res.statusCode).toBe(201)
  })
})

describe('Put answer route for helpfulness', function() {
  test('responds to a put request to mark an answer helpful', async () => {
    const res = await request(app)
      .put('/qa/answers/7/helpful')
      expect(res.statusCode).toBe(204)
  })
})

describe('Put answer route for reported', function() {
  test('responds to a put request report an answer', async () => {
    const res = await request(app)
      .put('/qa/answers/54/report')
      expect(res.statusCode).toBe(204)
  })
})
