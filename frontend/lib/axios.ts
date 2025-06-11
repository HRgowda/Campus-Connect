import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true, // Important: sends cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Intercept responses to handle auth errors
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Not authenticated, redirect to respective signin page
      const role = localStorage.getItem('role');
      if (role === 'student') {
        window.location.href = '/student/signin';
      } else if (role === 'professor') {
        window.location.href = '/professor/signin';
      } else {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;