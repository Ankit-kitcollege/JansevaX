import API from './axios';

export const authApi = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  getCurrentUser: () => API.get('/auth/me')
};
