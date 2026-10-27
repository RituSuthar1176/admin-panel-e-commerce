import axios from 'axios';

// ---------- Axios setup ----------
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 60000, // Render free servers can take up to a minute to wake up
});

// ---------- Types ----------
export interface LoginPayload {
  email: string;
  password: string;
}

const adminRole = 'Admin'; // this is the admin panel, so the role is fixed

// ---------- API calls ----------
export const loginAdmin = (payload: LoginPayload) => {
  return api.post('/auth-user/login', { ...payload, role: adminRole });
};