import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data)          => api.post('/auth/register', data),
  login:    (data)          => api.post('/auth/login', data),
  me:       ()              => api.get('/auth/me'),
  updatePassword: (data)    => api.put('/auth/update-password', data),
};

// ─── Projects ─────────────────────────────────────────────────────────────────
export const projectsAPI = {
  getAll:    ()             => api.get('/projects'),
  getOne:    (id)           => api.get(`/projects/${id}`),
  create:    (data)         => api.post('/projects', data),
  update:    (id, data)     => api.put(`/projects/${id}`, data),
  delete:    (id)           => api.delete(`/projects/${id}`),
  getStats:  (id)           => api.get(`/projects/${id}/stats`),
};

// ─── Tasks ────────────────────────────────────────────────────────────────────
export const tasksAPI = {
  getAll:          (params) => api.get('/tasks', { params }),
  getMy:           ()       => api.get('/tasks/my'),
  getDashStats:    ()       => api.get('/tasks/dashboard-stats'),
  getOne:          (id)     => api.get(`/tasks/${id}`),
  create:          (data)   => api.post('/tasks', data),
  update:          (id, d)  => api.put(`/tasks/${id}`, d),
  delete:          (id)     => api.delete(`/tasks/${id}`),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersAPI = {
  getAll:    ()             => api.get('/users'),
  getOne:    (id)           => api.get(`/users/${id}`),
  update:    (id, data)     => api.put(`/users/${id}`, data),
  delete:    (id)           => api.delete(`/users/${id}`),
};

export default api;
