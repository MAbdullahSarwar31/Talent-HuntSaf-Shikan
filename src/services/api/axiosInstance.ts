import axios, { AxiosError } from 'axios';
import config from '../../config';
import { useAuthStore } from '../../store/authStore';

const axiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (reqConfig) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken && reqConfig.headers) {
      reqConfig.headers.Authorization = `Bearer ${accessToken}`;
    }
    return reqConfig;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear auth session and redirect to login on token expiration
      useAuthStore.getState().clearAuth();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
