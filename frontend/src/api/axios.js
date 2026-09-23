import axios from 'axios';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }

  // Smart Auto-detection for cloud deployment (Render/Netlify/Vercel)
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('onrender.com') || host.includes('netlify.app') || host.includes('vercel.app')) {
      return 'https://jansevax.onrender.com/api';
    }
  }

  return '/api';
};


const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json'
  }
});


API.interceptors.request.use((config) => {
  const token = localStorage.getItem('civic_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('civic_token');
      localStorage.removeItem('civic_user');
    }
    return Promise.reject(error);
  }
);

export default API;
