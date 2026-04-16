import axios from 'axios';

const api = axios.create({
  // baseURL: 'https://cortex-bb7r.onrender.com/api',
  baseURL: 'http://localhost:8080/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.message = "The request took too long. Please check your connection.";
    } else if (error.response && error.response.status >= 500) {
      error.message = "Server Error. Please try again later.";
    }
    return Promise.reject(error);
  }
);

export default api;