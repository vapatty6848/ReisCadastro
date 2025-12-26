import http from 'k6/http';
import { check, sleep } from 'k6';


export const options = {
  stages: [
    { duration: '5s', target: 10 },  // Ramp-up: de 0 a 10 usuários em 5s
    { duration: '20s', target: 10 }, // Patamar: mantém 10 usuários por 20s
    { duration: '5s', target: 0 },   // Ramp-down: volta a 0 usuários em 5s
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = 'http://localhost:3001/api';

export default function () {

  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: 'admin@corporacao.com',
    password: 'admin123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginRes, {
    'login com sucesso': (r) => r.status === 200,
    'token recebido': (r) => r.json().token !== undefined,
  });

  const token = loginRes.json().token;
  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };



  const listRes = http.get(`${BASE_URL}/integrantes`, authHeaders);
  check(listRes, {
    'listagem retornou 200': (r) => r.status === 200,
  });

  sleep(1);
}
