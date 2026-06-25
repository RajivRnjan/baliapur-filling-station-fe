import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'https://api.baliapurfillingstation.in/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for global toast errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.data?.message === 'Unauthenticated.') {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
    
    if (error.response?.data) {
      const data = error.response.data;
      
      // Handle validation errors (422)
      if (data.errors) {
        const errorMessages = Object.values(data.errors).flat();
        errorMessages.forEach((msg) => toast.error(msg as string));
      } 
      // Handle generic errors with a message
      else if (data.message) {
        toast.error(data.message);
      }
      // Fallback
      else {
        toast.error('An unexpected error occurred');
      }
    } else {
      toast.error(error.message || 'Network error');
    }
    
    return Promise.reject(error);
  }
);

export default api;
