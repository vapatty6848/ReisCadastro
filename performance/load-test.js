import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Configuração do Teste de Carga
 * - 10 usuários simultâneos (VUs)
 * - Duração de 30 segundos
 */
export const options = {
  stages: [
    { duration: '5s', target: 10 },  // Ramp-up: de 0 a 10 usuários em 5s
    { duration: '20s', target: 10 }, // Patamar: mantém 10 usuários por 20s
    { duration: '5s', target: 0 },   // Ramp-down: volta a 0 usuários em 5s
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% das requisições devem ser < 500ms
    http_req_failed: ['rate<0.01'],   // Menos de 1% de erro
  },
};

const BASE_URL = 'http://localhost:3001/api';

export default function () {
  // 1. Login para obter o Token
  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: 'admin@fanfarra.com',
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

  // 2. Listagem de Alunos
  const listRes = http.get(`${BASE_URL}/alunos`, authHeaders);
  check(listRes, {
    'listagem retornou 200': (r) => r.status === 200,
  });

  sleep(1); // Simula tempo de pensamento do usuário
}
