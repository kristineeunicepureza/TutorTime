import React, { useState } from 'react';
import Login from './Login';
import SignUp from './SignUp';
import TutorTimeDashboard from './TutorTimeDashboard';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('login');
  // ✅ ADDED: store the logged-in user's name and role
  const [currentUser, setCurrentUser] = useState(null);

  const switchToSignUp = () => setCurrentView('signup');
  const switchToLogin = () => setCurrentView('login');

  // ✅ ADDED: called by Login on success — receives email + display name from API
  const handleLoginSuccess = (email, displayName) => {
    const name = displayName || email.split('@')[0];
    const role = localStorage.getItem('userRole') || 'Student';
    setCurrentUser({ name, email, role });
    setCurrentView('dashboard');
  };

  // ✅ ADDED: called by SignUp on success — receives email + full name typed by user
  const handleSignUpSuccess = (email, fullName) => {
    const role = localStorage.getItem('userRole') || 'Student';
    setCurrentUser({ name: fullName, email, role });
    setCurrentView('dashboard');
  };

  // ✅ ADDED: log out and return to login
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('userRole');
    setCurrentView('login');
  };

  return (
    <div className="App">
      {currentView === 'login' && (
        <Login
          onSwitchToSignUp={switchToSignUp}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {currentView === 'signup' && (
        <SignUp
          onSwitchToLogin={switchToLogin}
          onSignUpSuccess={handleSignUpSuccess}
        />
      )}
      {currentView === 'dashboard' && currentUser && (
        <TutorTimeDashboard user={currentUser} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;