// API Configuration
// In development: use relative paths to proxy through React dev server
// In production: use full URL from environment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? (process.env.REACT_APP_API_URL || 'http://localhost:8080/api')
  : '/api';

console.log('API Mode:', process.env.NODE_ENV);
console.log('API Base URL:', API_BASE_URL);

/**
 * Helper function to make API requests with proper headers
 */
const makeRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Bearer token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include credentials for CORS
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Register a new user account
 * POST /api/register
 */
export const registerUser = async (email, password, displayName, role) => {
  return makeRequest('/register', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      displayName,
      role,
    }),
  });
};

/**
 * Login user with email and password
 * POST /api/login
 */
export const loginUser = async (email, password) => {
  const response = await makeRequest('/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  });

  // Store token in localStorage if provided
  if (response.token) {
    localStorage.setItem('authToken', response.token);
  }

  return response;
};

/**
 * Get current user's profile
 * GET /api/profile
 */
export const getUserProfile = async () => {
  return makeRequest('/profile', {
    method: 'GET',
  });
};

/**
 * Update user's profile
 * PUT /api/profile
 */
export const updateProfile = async (displayName) => {
  return makeRequest('/profile', {
    method: 'PUT',
    body: JSON.stringify({
      displayName,
    }),
  });
};

/**
 * Change user's password
 * PUT /api/password
 */
export const changePassword = async (newPassword) => {
  return makeRequest('/password', {
    method: 'PUT',
    body: JSON.stringify({
      newPassword,
    }),
  });
};

/**
 * Upload profile photo
 * POST /api/uploadPhoto
 */
export const uploadPhoto = async (file) => {
  const token = localStorage.getItem('authToken');
  const formData = new FormData();
  formData.append('file', file);

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/uploadPhoto`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include', // Include credentials for CORS
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Upload Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
};

/**
 * Logout user (clear token)
 */
export const logout = () => {
  localStorage.removeItem('authToken');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

/**
 * Get stored auth token
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};
