import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
});

api.interceptors.request.use((config) => {
  const sessionUser = sessionStorage.getItem('examforge_current_user');
  if (sessionUser) {
    const user = JSON.parse(sessionUser);
    if (user.token) {
      config.headers.Authorization = `Token ${user.token}`;
    }
  }
  return config;
});

export default api;
