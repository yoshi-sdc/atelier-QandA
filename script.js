import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 1000,
      timeUnit: '1s',
      duration: '1m',
      preAllocatedVUs: 20,
      maxVUs: 10000
    }
  }
};

// Get questions: `http://localhost:3000/qa/questions?product_id=${Math.floor(Math.random() * 99999)}`
// Get answers: `http://localhost:3000/qa/questions/${Math.floor(Math.random() * 99999)}/answers`
// Post questions: export default function () {
//   const url = `http://localhost:3000/qa/questions`;
//   let data = {
//     body: 'Testing posting a question for stress testing',
//     name: 'Anomnomus',
//     email: 'test@gmail.com',
//     product_id: Math.floor(Math.random() * 99999)
//   };
//   let res = http.post(url, JSON.stringify(data), {
//     headers: {'Content-Type': 'application/json'}
//   });
//   check(res, {
//     'status was 201': (r) => r.status === 201
//   });
//   sleep(1);
// }


export default function () {
  const url = `http://localhost:3000/qa/answers/${Math.floor(Math.random() * 99999)}/helpful`;

  let res = http.put(url);
  check(res, {
    'status was 204': (r) => r.status === 204
  });
  sleep(1);
}