import axios, { isAxiosError } from 'axios';
import { StatusCodes } from 'http-status-codes';

// ---------- Axios setup ----------
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 60000,
});

// Attach the token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the token is invalid or expired, log the user out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === StatusCodes.UNAUTHORIZED) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ---------- Endpoint ----------
const profileUrl = '/auth-user/viewProfile';

// ---------- Types ----------
export interface AdminProfile {
  name: string;
  email: string;
}

// What the layout shares with the header and the profile page
export interface ProfileContextValue {
  profile: AdminProfile | null;
  isLoading: boolean;
  errorMessage: string;
}

// ---------- Reading the backend response: CONFIRM the field names in the Network tab ----------
interface RawProfile {
  name?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

type RawProfileResponse = RawProfile & { data?: RawProfile };

const mapProfile = (raw: RawProfile): AdminProfile => ({
  name: raw.name ?? raw.fullName ?? [raw.firstName, raw.lastName].filter(Boolean).join(' '),
  email: raw.email ?? '',
});

// ---------- Error message for the user ----------
export const getApiErrorMessage = (error: unknown): string => {
  if (!isAxiosError(error)) return 'Something went wrong. Please try again.';

  if (!error.response) return 'Cannot reach the server. Check your internet and try again.';

  const { status, data } = error.response;

  if (status >= StatusCodes.INTERNAL_SERVER_ERROR) return 'Server error. Please try again later.';

  return String(data?.message || 'Something went wrong. Please try again.');
};

// ---------- API call ----------
export const getAdminProfile = () => {
  return api.get<RawProfileResponse>(profileUrl).then((response): AdminProfile => {
    const body = response.data;
    return mapProfile(body.data ?? body);
  });
};