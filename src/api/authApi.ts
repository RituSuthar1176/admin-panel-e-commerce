import axios from 'axios';

// 1. Axios setup
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 60000, // Render free servers can take up to a minute to wake up
});

// Attach the token to every request (used after login, in Task 5)
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 2. Login API
export interface LoginPayload {
  email: string;
  password: string;
}

const adminRole = 'Admin'; // this is the admin panel, so the role is fixed

export const loginAdmin = (payload: LoginPayload) => {
  return axiosInstance.post('/auth-user/login', { ...payload, role: adminRole });
};