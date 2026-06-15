// src/utils/apiClient.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
});

// Helper function to get full storage URL for files
export const getStorageUrl = (path) => {
  if (!path) return null;
  
  // If it's already a full URL, return it
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If it's a data URL, return it
  if (path.startsWith('data:')) {
    return path;
  }
  
  // Remove /api from base URL if present
  const baseUrl = API_BASE_URL?.replace('/api', '') || '';
  
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Construct full URL
  return `${baseUrl}/storage/${cleanPath}`;
};

// Request interceptor to add token (works for both admin and employee)
apiClient.interceptors.request.use(
  (config) => {
    // Try to get token in priority order:
    // 1. Unified auth-token (new)
    // 2. Admin hr-token (backward compatibility)
    // 3. Employee token (backward compatibility)
    const token = localStorage.getItem('auth-token') || 
                  localStorage.getItem('hr-token') || 
                  localStorage.getItem('employee-token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Handle FormData properly (for file uploads)
    if (config.data instanceof FormData) {
      // Let browser set Content-Type with boundary for FormData
      delete config.headers['Content-Type'];
    } else {
      // For JSON data, set Content-Type to application/json
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
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return apiClient(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const token = localStorage.getItem('auth-token') || 
                      localStorage.getItem('hr-token') || 
                      localStorage.getItem('employee-token');
                      
        // Call refresh endpoint directly using axios to avoid circular dependency / interceptor loops
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        // The API returns the token in response.data.access_token or response.data.token
        const newToken = response.data?.access_token || response.data?.token || response.data?.data?.access_token;
        
        if (newToken) {
          // Update tokens in local storage depending on what was there
          if (localStorage.getItem('auth-token')) localStorage.setItem('auth-token', newToken);
          if (localStorage.getItem('hr-token')) localStorage.setItem('hr-token', newToken);
          if (localStorage.getItem('employee-token')) localStorage.setItem('employee-token', newToken);

          apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
          originalRequest.headers.Authorization = 'Bearer ' + newToken;
          
          processQueue(null, newToken);
          return apiClient(originalRequest);
        } else {
          throw new Error('No new token received');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Clear all auth data from localStorage
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user-type');
        localStorage.removeItem('user-data');
        localStorage.removeItem('hr-token');
        localStorage.removeItem('hr-user');
        localStorage.removeItem('employee-token');
        localStorage.removeItem('employee-user');
        localStorage.removeItem('remember-me');
        localStorage.removeItem('remembered-email');
        
        // Redirect to login
        window.location.href = '/';
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // For other errors or if already retried and still 401
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user-type');
      localStorage.removeItem('user-data');
      localStorage.removeItem('hr-token');
      localStorage.removeItem('hr-user');
      localStorage.removeItem('employee-token');
      localStorage.removeItem('employee-user');
      localStorage.removeItem('remember-me');
      localStorage.removeItem('remembered-email');
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;