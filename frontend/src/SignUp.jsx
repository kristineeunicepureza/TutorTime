import React, { useState } from 'react';
import { registerUser } from './apiService';

const styles = `
.signup-container {
  background-color: #FFFFFF;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-bar {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.back-arrow {
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: #111111;
  cursor: pointer;
}

.signup-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 32px 40px;
  overflow-y: auto;
}

.logo {
  width: 70px;
  height: 70px;
  background-color: #0047AB;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
}

.logo-text {
  font-size: 32px;
  font-weight: bold;
  color: #FFFFFF;
}

.app-name {
  font-size: 20px;
  font-weight: bold;
  color: #0047AB;
  margin-bottom: 8px;
}

.create-account {
  font-size: 22px;
  font-weight: bold;
  color: #111111;
  margin-bottom: 4px;
}

.subtitle {
  font-size: 13px;
  color: #888888;
  margin-bottom: 28px;
  text-align: center;
}

.error-message {
  font-size: 13px;
  color: #D32F2F;
  background-color: #FFEBEE;
  padding: 10px 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  border-left: 4px solid #D32F2F;
  width: 100%;
  max-width: 400px;
  box-sizing: border-box;
}

.input-field {
  display: flex;
  align-items: center;
  background-color: #F5F7FA;
  height: 52px;
  padding: 0 14px;
  margin-bottom: 14px;
  border-radius: 4px;
  width: 100%;
  max-width: 400px;
  box-sizing: border-box;
}

.input-icon {
  font-size: 16px;
  margin-right: 10px;
}

.input-field input {
  flex: 1;
  border: none;
  background: none;
  font-size: 14px;
  color: #222222;
  outline: none;
}

.input-field input::placeholder {
  color: #AAAAAA;
}

.input-field input:disabled {
  background-color: #E8EBF0;
  color: #CCCCCC;
}

/* Role section wrapper keeps label and cards together */
.role-section {
  width: 100%;
  max-width: 400px;
  margin-bottom: 28px;
  margin-top: 10px;
}

.role-label {
  font-size: 14px;
  font-weight: bold;
  color: #333333;
  margin-bottom: 12px;
  display: block;
}

.role-cards {
  display: flex;
  width: 100%;
  gap: 8px;
}

.role-card {
  flex: 1;
  height: 90px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #F5F7FA;
  border-radius: 4px;
  cursor: pointer;
}

.role-card.selected {
  background-color: #0047AB;
}

.role-card.selected .role-text {
  color: #FFFFFF;
}

.role-card .role-text {
  color: #0047AB;
}

.role-icon {
  font-size: 26px;
  margin-bottom: 4px;
}

.role-text {
  font-size: 14px;
  font-weight: bold;
}

.sign-up-btn {
  width: 100%;
  max-width: 400px;
  height: 52px;
  background-color: #0047AB;
  color: #FFFFFF;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  margin-bottom: 24px;
  cursor: pointer;
}

.sign-up-btn:disabled {
  background-color: #B0BFDB;
  cursor: not-allowed;
}

.login-link {
  font-size: 14px;
  color: #555555;
}

.login-link span {
  color: #0047AB;
  font-weight: bold;
  cursor: pointer;
}

.select-field {
  display: flex;
  align-items: center;
  background-color: #F5F7FA;
  height: 52px;
  padding: 0 14px;
  margin-bottom: 14px;
  border-radius: 4px;
  width: 100%;
  max-width: 400px;
  box-sizing: border-box;
}

.select-icon {
  font-size: 16px;
  margin-right: 10px;
}

.select-field select {
  flex: 1;
  border: none;
  background: none;
  font-size: 14px;
  color: #222222;
  outline: none;
  font-family: inherit;
}

.select-field select:disabled {
  background-color: #E8EBF0;
  color: #CCCCCC;
}

.select-field select option {
  color: #222222;
}
`;

function SignUp({ onSwitchToLogin, onSignUpSuccess }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [yearLevel, setYearLevel] = useState('Junior (Year 3)');
  const [selectedRole, setSelectedRole] = useState('Student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    setError('');

    if (fullName.trim() === '' || email.trim() === '' || password.trim() === '' || confirmPassword.trim() === '') {
      setError('Please fill in all fields.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
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
      const displayName = `${fullName} (${selectedRole})`;
      const roleUppercase = selectedRole.toUpperCase();
      const response = await registerUser(email, password, displayName, roleUppercase);
      if (response.success) {
        alert(response.message);
        localStorage.setItem('userRole', roleUppercase);
        if (onSignUpSuccess) {
          // ✅ FIXED: pass the selected role so dashboard shows correct view
          onSignUpSuccess(email, fullName.trim(), department, yearLevel, roleUppercase);
        }
      } else {
        // response.success === false -> show backend-provided message
        let errMsg = response.message || 'Registration failed.';
        // try to make the message user-friendly if we recognize a known error
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

  return (
    <>
      <style>{styles}</style>
      <div className="signup-container">
        {/* Top Bar with Back Arrow */}
        <div className="top-bar">
          <span className="back-arrow" onClick={onSwitchToLogin}>←</span>
        </div>

        <div className="signup-content">
          {/* Logo */}
          <div className="logo">
            <span className="logo-text">T</span>
          </div>

          <h2 className="app-name">TutorTime</h2>

          <h3 className="create-account">Create Account</h3>
          <p className="subtitle">Join the peer-to-peer tutoring community</p>

          {/* Error Message */}
          {error && <p className="error-message">{error}</p>}

          {/* Full Name */}
          <div className="input-field">
            <span className="input-icon">👤</span>
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div className="input-field">
            <span className="input-icon">✉</span>
            <input
              type="email"
              placeholder="University Email (@edu)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Password */}
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

          {/* Confirm Password */}
          <div className="input-field">
            <span className="input-icon">🔒</span>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Department */}
          <div className="select-field">
            <span className="select-icon">🏫</span>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={loading}
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Engineering">Engineering</option>
              <option value="Business">Business</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="English">English</option>
              <option value="History">History</option>
              <option value="Psychology">Psychology</option>
              <option value="Art">Art</option>
              <option value="Music">Music</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Year Level */}
          <div className="select-field">
            <span className="select-icon">📊</span>
            <select
              value={yearLevel}
              onChange={(e) => setYearLevel(e.target.value)}
              disabled={loading}
            >
              <option value="Freshman (Year 1)">Freshman (Year 1)</option>
              <option value="Sophomore (Year 2)">Sophomore (Year 2)</option>
              <option value="Junior (Year 3)">Junior (Year 3)</option>
              <option value="Senior (Year 4)">Senior (Year 4)</option>
              <option value="Graduate">Graduate</option>
            </select>
          </div>

          {/* Role Section — label and cards grouped together */}
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
          <button className="sign-up-btn" onClick={handleSignUp} disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up →'}
          </button>

          {/* Login Link */}
          <p className="login-link">
            Already have an account? <span onClick={onSwitchToLogin}>Log In</span>
          </p>
        </div>
      </div>
    </>
  );
}

export default SignUp;