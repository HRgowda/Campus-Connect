import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

instance.interceptors.response.use(
  response => response,
  error => {
    return Promise.reject(error);
  }
);

export default instance;
