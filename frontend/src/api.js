import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Bearer token from localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('stockflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept 401 unauthorized to clear expired session
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('stockflow_token');
      localStorage.removeItem('stockflow_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.dispatchEvent(new Event('auth-expired'));
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  auth: {
    signup: (data) => apiClient.post('/auth/signup', data),
    login: (data) => apiClient.post('/auth/login', data),
    demoLogin: () => apiClient.post('/auth/demo-login'),
    getMe: () => apiClient.get('/auth/me'),
  },
  products: {
    list: (params) => apiClient.get('/products', { params }),
    get: (id) => apiClient.get(`/products/${id}`),
    create: (data) => apiClient.post('/products', data),
    update: (id, data) => apiClient.put(`/products/${id}`, data),
    delete: (id) => apiClient.delete(`/products/${id}`),
    adjustStock: (id, delta, note) => apiClient.post(`/products/${id}/adjust-stock`, { delta, note }),
    getAdjustments: (id) => apiClient.get(`/products/${id}/adjustments`),
  },
  dashboard: {
    get: () => apiClient.get('/dashboard'),
  },
  settings: {
    get: () => apiClient.get('/settings'),
    update: (data) => apiClient.put('/settings', data),
  },
};
