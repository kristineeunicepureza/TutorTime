import React, { useEffect, useRef, useState } from 'react';
import { registerUser } from './apiService';
import './SignUp.css';

function SignUp({ onSwitchToLogin, onSignUpSuccess }) {
  // ── ALL ORIGINAL STATE ────────────────────────────────────────────
  const [lastName,        setLastName]        = useState('');
  const [firstName,       setFirstName]       = useState('');
  const [middleInitial,   setMiddleInitial]   = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department,      setDepartment]      = useState('BSIT');
  const [courseSelectOpen, setCourseSelectOpen] = useState(false);
  const courseSelectRef = useRef(null);
  const [yearLevel,       setYearLevel]       = useState('Junior (Year 3)');
  const [selectedRole,    setSelectedRole]    = useState('Student');
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');

  const academicPrograms = [
    'BSIT',
    'BSCS',
    'BSIS',
    'BSCE',
    'BSME',
    'BSEE',
    'BSECE',
    'BSCpE',
    'BSArch',
    'BSIE',
    'BSA',
    'BSBA',
    'BSHM',
    'BSTM',
    'BSN',
    'BSPhar',
  ];

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (courseSelectRef.current && !courseSelectRef.current.contains(event.target)) {
        setCourseSelectOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // ── ORIGINAL handleSignUp — untouched ────────────────────────────
  const handleSignUp = async () => {
    setError('');
    const normalizedEmail = email.trim().toLowerCase();

    if (lastName.trim() === '' || firstName.trim() === '' || normalizedEmail === '' || password.trim() === '' || confirmPassword.trim() === '') {
      setError('Please fill in all fields.');
      return;
    }

    if (!/^[a-z0-9._%+-]+@cit\.edu$/.test(normalizedEmail)) {
      setError('Please use your CIT email address (@cit.edu).');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setConfirmPassword('');
      return;
    }

    setLoading(true);
    try {
      const normalizedMiddleInitial = middleInitial.trim().replace('.', '');
      const displayName = [
        firstName.trim(),
        normalizedMiddleInitial ? `${normalizedMiddleInitial}.` : '',
        lastName.trim(),
      ].filter(Boolean).join(' ');
      const roleUppercase = selectedRole.toUpperCase();
      const response = await registerUser(normalizedEmail, password, displayName, roleUppercase);
      if (response.success) {
        alert(response.message);
        // ✅ FIXED: Store token from response (just like loginUser does)
        if (response.token) {
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('token', response.token);
          sessionStorage.setItem('authToken', response.token);
        }
        localStorage.setItem('userRole', roleUppercase);
        if (onSignUpSuccess) {
          onSignUpSuccess(normalizedEmail, displayName, department, yearLevel, roleUppercase);
        }
      } else {
        let errMsg = response.message || 'Registration failed.';
        if (errMsg.toLowerCase().includes('user already registered') || errMsg.toLowerCase().includes('already exists')) {
          errMsg = 'An account with this email already exists.';
        }
        setError(errMsg);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="signup-container">

      {/* ══ LEFT PANEL ══════════════════════════════════════════════ */}
      <div className="signup-left">
        {/* decorative blobs */}
        <div className="signup-blob signup-blob-1" />
        <div className="signup-blob signup-blob-2" />
        <div className="signup-blob signup-blob-3" />
        <div className="signup-blob signup-blob-4" />
        <div className="signup-blob signup-blob-5" />

        {/* logo */}
        <div className="signup-left-logo">
          <span className="signup-left-logo-letter">T</span>
        </div>
        <div className="signup-left-brand">TutorTime</div>

        <div className="signup-left-title">
          Join the peer-to-peer tutoring community
        </div>
        <div className="signup-left-sub">
          Connect with verified student tutors for face-to-face sessions on campus.
        </div>

        {/* progress dots */}
        <div className="signup-left-dots">
          <div className="signup-left-dot active" />
          <div className="signup-left-dot" />
          <div className="signup-left-dot" />
        </div>
      </div>

      {/* ══ RIGHT PANEL ═════════════════════════════════════════════ */}
      <div className="signup-right">

        {/* top bar with back arrow */}
        <div className="top-bar">
          <span className="back-arrow" onClick={onSwitchToLogin}>←</span>
        </div>

        <div className="signup-content">

          {/* heading */}
          <div className="signup-heading">
            <h3 className="create-account">Create Account</h3>
            <p className="subtitle">Join the peer-to-peer tutoring community</p>
          </div>

          {/* error */}
          {error && <p className="error-message">{error}</p>}

          {/* ── Personal Info ── */}
          <div className="form-section-label">Personal Information</div>

          <div className="form-row">
            {/* Last Name */}
            <div className="form-group">
              <div className="input-field">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* First Name */}
            <div className="form-group">
              <div className="input-field">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Middle Initial */}
          <div className="form-group">
            <div className="input-field">
              <span className="input-icon">📝</span>
              <input
                type="text"
                placeholder="Middle Initial (optional)"
                value={middleInitial}
                onChange={e => setMiddleInitial(e.target.value.slice(0, 1).toUpperCase())}
                disabled={loading}
              />
            </div>
          </div>

          {/* ── Account Details ── */}
          <div className="form-section-label">Account Details</div>

          {/* Email */}
          <div className="form-group">
            <div className="input-field">
              <span className="input-icon">✉️</span>
              <input
                type="email"
                placeholder="University Email (@cit.edu)"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            {/* Password */}
            <div className="form-group">
              <div className="input-field">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <div className="input-field">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* ── Academic Info ── */}
          <div className="form-section-label">Academic Information</div>

          <div className="form-row">
            {/* Department */}
            <div className="form-group">
              <div className="input-field academic-field" ref={courseSelectRef}>
                <span className="input-icon">🏫</span>
                <button
                  type="button"
                  className={`academic-trigger ${courseSelectOpen ? 'open' : ''}`}
                  onClick={() => !loading && setCourseSelectOpen(prev => !prev)}
                  disabled={loading}
                >
                  <span>{department}</span>
                  <span className="academic-caret">▾</span>
                </button>

                {courseSelectOpen && (
                  <div className="academic-menu" role="listbox" aria-label="Academic program">
                    {academicPrograms.map((program) => (
                      <button
                        key={program}
                        type="button"
                        className={`academic-option ${department === program ? 'selected' : ''}`}
                        onClick={() => {
                          setDepartment(program);
                          setCourseSelectOpen(false);
                        }}
                      >
                        {program}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Year Level */}
            <div className="form-group">
              <div className="input-field">
                <span className="input-icon">📊</span>
                <select
                  value={yearLevel}
                  onChange={e => setYearLevel(e.target.value)}
                  disabled={loading}
                >
                  <option value="Freshman (Year 1)">Freshman (Year 1)</option>
                  <option value="Sophomore (Year 2)">Sophomore (Year 2)</option>
                  <option value="Junior (Year 3)">Junior (Year 3)</option>
                  <option value="Senior (Year 4)">Senior (Year 4)</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Role ── */}
          <div className="role-section">
            <span className="role-label">I am a...</span>
            <div className="role-cards">
              <div
                className={`role-card ${selectedRole === 'Student' ? 'selected' : ''}`}
                onClick={() => !loading && setSelectedRole('Student')}
              >
                <span className="role-icon">🎓</span>
                <span className="role-text">Student</span>
              </div>
              <div
                className={`role-card ${selectedRole === 'Tutor' ? 'selected' : ''}`}
                onClick={() => !loading && setSelectedRole('Tutor')}
              >
                <span className="role-icon">📚</span>
                <span className="role-text">Tutor</span>
              </div>
            </div>
          </div>

          {/* Sign Up Button */}
          <button
            className="sign-up-btn"
            onClick={handleSignUp}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up →'}
          </button>

          {/* Login Link */}
          <p className="login-link">
            Already have an account?{' '}
            <span onClick={onSwitchToLogin}>Log In</span>
          </p>

        </div>{/* /signup-content */}
      </div>{/* /signup-right */}
    </div>
  );
}

export default SignUp;