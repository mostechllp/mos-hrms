import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
});

export const getStorageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('data:')) return path;
  const baseUrl = API_BASE_URL?.replace('/api', '') || '';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${baseUrl}/storage/${cleanPath}`;
};

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('employee-token') ||
                  localStorage.getItem('auth-token') ||
                  localStorage.getItem('hr-token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const clearAuthAndRedirect = () => {
  localStorage.removeItem('auth-token');
  localStorage.removeItem('user-type');
  localStorage.removeItem('user-data');
  localStorage.removeItem('hr-token');
  localStorage.removeItem('hr-user');
  localStorage.removeItem('employee-token');
  localStorage.removeItem('employee-user');
  localStorage.removeItem('remember-me');
  localStorage.removeItem('remembered-email');
  localStorage.removeItem('userType');
  // window.location.href = '/Mostech-HRMS/';
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If not a 401, just reject
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // If refresh endpoint itself returns 401 → logout
    if (originalRequest.url?.includes('/auth/refresh')) {
      console.log('Refresh token failed → logging out');
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    // If already retried → logout
    if (originalRequest._retry) {
      console.log('Already retried → logging out');
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    // Queue requests while refresh is in progress
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return apiClient(originalRequest);
        })
        .catch(err => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const expiredToken = localStorage.getItem('employee-token') ||
                           localStorage.getItem('auth-token') ||
                           localStorage.getItem('hr-token');

      console.log('Attempting token refresh...');

      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
        headers: {
          Authorization: `Bearer ${expiredToken}`,
          'Accept': 'application/json'
        }
      });

      const newToken = response.data?.data?.access_token ||
                       response.data?.access_token ||
                       response.data?.token;

      if (!newToken) throw new Error('No token in response');

      console.log('Token refreshed successfully!');

      // Save new token
      localStorage.setItem('employee-token', newToken);
      localStorage.setItem('auth-token', newToken);

      // Update default headers
      apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
      originalRequest.headers.Authorization = 'Bearer ' + newToken;

      processQueue(null, newToken);
      isRefreshing = false;

      return apiClient(originalRequest); // retry original request

    } catch (refreshError) {
      console.log('Refresh failed:', refreshError.response?.data);
      processQueue(refreshError, null);
      isRefreshing = false;
      clearAuthAndRedirect();
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;