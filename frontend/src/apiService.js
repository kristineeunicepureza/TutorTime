// API Configuration
// In development: use relative paths to proxy through React dev server
// In production: use full URL from environment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? (process.env.REACT_APP_API_URL || 'http://localhost:8083/api')
  : '/api';

console.log('API Mode:', process.env.NODE_ENV);
console.log('API Base URL:', API_BASE_URL);

const getStoredAuthToken = () => {
  return (
    localStorage.getItem('authToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('authToken') ||
    sessionStorage.getItem('token') ||
    sessionStorage.getItem('accessToken') ||
    ''
  );
};

// ✅ EXPORTED: Use in components that need manual token retrieval
export { getStoredAuthToken };

const isPublicEndpoint = (endpoint) => endpoint === '/login' || endpoint === '/register';

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
  const token = getStoredAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (!isPublicEndpoint(endpoint)) {
    throw new Error('Session expired. Please log in again.');
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include credentials for CORS
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const serverMessage = data?.message || data?.error || data?.details;
      throw new Error(serverMessage || `API Error: ${response.status}`);
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
    // Compatibility keys for older code paths
    localStorage.setItem('token', response.token);
    sessionStorage.setItem('authToken', response.token);
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
  // ✅ FIXED: Use getStoredAuthToken() with fallback chain
  const token = getStoredAuthToken();
  const formData = new FormData();
  formData.append('file', file);

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (!token) {
    throw new Error('Session expired. Please log in again.');
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

// ── Tutors ────────────────────────────────────────────────────────
export const getTutors = async () => {
  return makeRequest('/tutors', { method: 'GET' });
};

export const searchTutors = async (query) => {
  return makeRequest('/search', {
    method: 'POST',
    body: JSON.stringify(query),
  });
};

// ── Bookings ──────────────────────────────────────────────────────
export const getMyBookings = async () => {
  return makeRequest('/bookings/student', { method: 'GET' });
};

export const getTutorBookings = async () => {
  return makeRequest('/bookings/tutor', { method: 'GET' });
};

export const createBooking = async (bookingData) => {
  return makeRequest('/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  });
};

export const getBookingLocationOptions = async () => {
  return makeRequest('/bookings/location-options', { method: 'GET' });
};

export const cancelBooking = async (id) => {
  return makeRequest(`/bookings/${id}`, { method: 'DELETE' });
};

// ── Availability ──────────────────────────────────────────────────
export const getAvailability = async () => {
  return makeRequest('/availability', { method: 'GET' });
};

export const addAvailability = async (availabilityData) => {
  return makeRequest('/availability', {
    method: 'POST',
    body: JSON.stringify(availabilityData),
  });
};

// ── Admin ─────────────────────────────────────────────────────────
export const getPendingTutors = async () => {
  return makeRequest('/admin/tutor-requests', { method: 'GET' });
};

export const approveTutor = async (tutorId) => {
  return makeRequest(`/admin/tutor/${tutorId}/approve`, { method: 'PUT' });
};

export const rejectTutor = async (tutorId, reason) => {
  return makeRequest(`/admin/tutor/${tutorId}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  });
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
