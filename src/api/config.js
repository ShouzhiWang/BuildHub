import axios from 'axios';

// API base URL - adjust this based on your backend setup
const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          
          localStorage.setItem('access_token', response.data.access);
          api.defaults.headers.Authorization = `Bearer ${response.data.access}`;
          original.headers.Authorization = `Bearer ${response.data.access}`;
          
          return api(original);
        } catch (refreshError) {
          // Refresh failed, clear auth data and let the app handle the redirect
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          
          // Dispatch a custom event to notify the app about auth failure
          window.dispatchEvent(new CustomEvent('auth-failed'));
          
          // Don't redirect here - let the app handle it
          return Promise.reject(error);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Bookmark API functions
export const bookmarkAPI = {
  // Toggle bookmark for a project
  toggle: async (projectId) => {
    try {
      const response = await api.post(`/projects/${projectId}/bookmark/`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Please log in to bookmark projects');
      }
      throw error;
    }
  },

  // Remove bookmark for a project
  remove: async (projectId) => {
    try {
      const response = await api.delete(`/projects/${projectId}/bookmark/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Check bookmark status for a project
  checkStatus: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/bookmark-status/`);
      return response.data;
    } catch (error) {
      // If user is not authenticated, return false
      if (error.response?.status === 401) {
        return { bookmarked: false };
      }
      throw error;
    }
  },

  // Get user's bookmarked projects
  getUserBookmarks: async () => {
    try {
      const response = await api.get('/bookmarks/');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Search API functions
export const searchAPI = {
  // Global search across projects and users
  globalSearch: async (query, type = 'all', limit = 20) => {
    try {
      const response = await api.get(`/search/?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search projects with filters
  searchProjects: async (query, filters = {}) => {
    try {
      const params = new URLSearchParams({ search: query, ...filters });
      const response = await api.get(`/projects/?${params}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search users
  searchUsers: async (query) => {
    try {
      const response = await api.get(`/users/search/?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default api; 