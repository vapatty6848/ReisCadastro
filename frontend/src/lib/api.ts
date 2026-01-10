import axios from 'axios';

export const getApiUrl = () => {
  // Se estivermos no navegador dentro do Codespace, ele ajusta o link sozinho
  if (typeof window !== 'undefined' && window.location.hostname.includes('github.dev')) {
    // Se o endereço da API no .env ainda for o local, a gente troca pelo da nuvem
    if (!process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL.includes('localhost')) {
      return `https://${window.location.hostname.replace('-3000', '-3001')}`;
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

const api = axios.create({
  baseURL: getApiUrl(),
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('@Corporacao:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
