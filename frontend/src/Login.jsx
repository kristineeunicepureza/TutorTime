import React, { useState } from 'react';
import './Login.css';
import { getUserProfile, loginUser } from './apiService';

function Login({ onSwitchToSignUp, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isCitEmail = (value) => /^[a-z0-9._%+-]+@cit\.edu$/.test(String(value || '').trim().toLowerCase());

  const clearStoredTokens = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('accessToken');
  };

  const handleLogin = async () => {
    setError('');
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail === '' || password.trim() === '') {
      setError('Please enter both email and password.');
      return;
    }

    // Allow login attempt for all roles (admin may use non-CIT emails).
    // CIT enforcement for student/tutor happens after role is resolved.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser(normalizedEmail, password);
      console.log('📡 Full login response:', JSON.stringify(response, null, 2)); // Debug log
      // if backend indicates failure, surface message to user instead of silently ignoring
      if (response.success) {
        if (onLoginSuccess) {
          const displayName = response.user?.name || response.displayName || normalizedEmail.split('@')[0];
          let userRole = (
            response.user?.role ||
            response.role ||
            response.userRole ||
            response.data?.role ||
            ''
          ).toString().toUpperCase();

          // Some backend responses omit role on /login. Try /profile before deciding.
          if (!userRole) {
            try {
              const profile = await getUserProfile();
              userRole = (
                profile?.role ||
                profile?.userRole ||
                profile?.data?.role ||
                profile?.data?.userRole ||
                ''
              ).toString().toUpperCase();
            } catch {
              userRole = '';
            }
          }

          if (!userRole) {
            setError('Unable to determine your account role. Please contact support.');
            setLoading(false);
            return;
          }

          const requiresCitEmail = userRole === 'STUDENT' || userRole === 'TUTOR';
          if (requiresCitEmail && !isCitEmail(normalizedEmail)) {
            clearStoredTokens();
            setError('Students and tutors must use a CIT email address (@cit.edu).');
            setPassword('');
            return;
          }

          onLoginSuccess(normalizedEmail, displayName, userRole);
        }
      } else {
        // response.success === false -> show backend-provided message
        let errMsg = response.message || 'Login failed.';
        // try to make the message user-friendly if we recognize a known error
        try {
          const prefix = 'Authentication failed: ';
          if (errMsg.startsWith(prefix)) {
            const payload = errMsg.slice(prefix.length);
            const obj = JSON.parse(payload);
            if (obj.error_code === 'invalid_credentials') {
              errMsg = 'Invalid email or password. Please try again.';
            }
          }
        } catch (e) {
          // parsing failed, leave original message
        }
        setError(errMsg);
        setPassword('');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        {/* Logo Circle */}
        <div className="logo-circle">
          <span className="logo-text">T</span>
        </div>

        {/* App Name */}
        <h1 className="app-name">TutorTime</h1>

        {/* Welcome Back */}
        <h2 className="welcome-text">Welcome Back</h2>
        <p className="subtitle">Sign in to access your campus tutoring network</p>

        {/* Error Message */}
        {error && <p className="error-message">{error}</p>}

        {/* Email Field */}
        <div className="input-field">
          <span className="input-icon">✉</span>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Password Field */}
        <div className="input-field">
          <span className="input-icon">🔒</span>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Forgot Password */}
        <p className="forgot-password">Forgot Password?</p>

        {/* Sign In Button */}
        <button className="sign-in-btn" onClick={handleLogin} disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In →'}
        </button>

        {/* Sign Up Link */}
        <p className="sign-up-link">
          Don't have an account? <span onClick={onSwitchToSignUp}>Sign Up</span>
        </p>
      </div>
    </div>
  );
}

export default Login;