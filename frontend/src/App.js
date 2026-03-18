import React, { useState, useEffect } from 'react';
import Login from './Login';
import SignUp from './SignUp';
import StudentDashboard from './StudentDashboard';
import TutorDashboard from './TutorDashboard';
import AdminDashboard from './AdminDashboard';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('login');
  // ✅ ADDED: store the logged-in user's name and role
  const [currentUser, setCurrentUser] = useState(null);

  const switchToSignUp = () => setCurrentView('signup');
  const switchToLogin = () => setCurrentView('login');

  // ✅ NEW: Restore user from localStorage on app mount (for page refreshes)
  useEffect(() => {
    const savedUserName = localStorage.getItem('userName');
    const savedUserEmail = localStorage.getItem('userEmail');
    const savedUserRole = localStorage.getItem('userRole');
    
    if (savedUserName && savedUserEmail && savedUserRole) {
      const role = (savedUserRole || 'STUDENT').toUpperCase();
      setCurrentUser({ 
        name: savedUserName, 
        email: savedUserEmail, 
        role 
      });
      setCurrentView('dashboard');
      console.log('✅ Restored user from localStorage:', { name: savedUserName, role });
    }
  }, []);

  // ✅ FIXED: called by Login on success — now ensures role is uppercase
  const handleLoginSuccess = (email, displayName, userRole) => {
    const name = displayName || email.split('@')[0];
    const role = (userRole || 'STUDENT').toUpperCase();
    console.log('✅ Login successful! Name:', name, 'Role:', role, 'Raw userRole:', userRole);
    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);
    setCurrentUser({ name, email, role });
    setCurrentView('dashboard');
  };

  // ✅ FIXED: called by SignUp on success — now receives role
  const handleSignUpSuccess = (email, fullName, department, yearLevel, role) => {
    const userRole = (role || 'STUDENT').toUpperCase();
    localStorage.setItem('userName', fullName);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userDepartment', department);
    localStorage.setItem('userYearLevel', yearLevel);
    localStorage.setItem('userRole', userRole);
    setCurrentUser({ name: fullName, email, role: userRole });
    setCurrentView('dashboard');
  };



  // Route to correct dashboard based on user role
  const renderDashboard = () => {
    if (!currentUser) return null;

    const role = (currentUser.role || '').toUpperCase();

    if (role === 'ADMIN') return <AdminDashboard />;
    if (role === 'TUTOR') return <TutorDashboard />;
    if (role === 'STUDENT') return <StudentDashboard />;

    // Fallback: unknown/missing role — clear session and return to login
    localStorage.clear();
    setCurrentUser(null);
    setCurrentView('login');
    return null;
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
      {currentView === 'dashboard' && currentUser && renderDashboard()}
    </div>
  );
}

export default App;