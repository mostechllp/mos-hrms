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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
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
      
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;