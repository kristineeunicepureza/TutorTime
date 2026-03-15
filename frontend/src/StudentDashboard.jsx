import { useState, useRef, useEffect } from 'react';
import './TutorTimeDashboard.css';

// Import utility functions
import {
  getFirstName,
  getInitials,
  calculateStats,
  calculateSessionStats,
  createNotification,
  normalizeTutor,
  normalizeBooking,
} from './utils/helpers';

// Import UI Components
import { Avatar } from './components/Avatar';
import { DashboardView } from './components/DashboardView';
import { TutorProfile } from './components/TutorProfile';
import { ChatInterface } from './components/ChatInterface';
import { TutorDirectory } from './components/TutorDirectory';
import { BookingsManager } from './components/BookingsManager';
import { ProfileSettings } from './components/ProfileSettings';
import { BookingModal } from './components/BookingModal';
import { EditProfileModal } from './components/EditProfileModal';

// ════════════════════════════════════════════════════════════════════
// STUDENT DASHBOARD
// ════════════════════════════════════════════════════════════════════
function StudentDashboard() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [notifOpen, setNotifOpen] = useState(false);
  const [bookingTab, setBookingTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  // Tutor sub-views
  const [tutorView, setTutorView] = useState('list'); // 'list' | 'profile' | 'contact'
  const [selectedTutor, setSelectedTutor] = useState(null);

  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const chatEndRef = useRef(null);

  // Notifications — now dynamic based on events
  const [notifications, setNotifications] = useState([]);

  // Edit Profile modal
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: localStorage.getItem('userName') || '',
    department: localStorage.getItem('userDepartment') || 'Computer Science',
    yearLevel: localStorage.getItem('userYearLevel') || 'Junior (Year 3)',
  });
  const [savedProfile, setSavedProfile] = useState({
    name: localStorage.getItem('userName') || '',
    department: localStorage.getItem('userDepartment') || 'Computer Science',
    yearLevel: localStorage.getItem('userYearLevel') || 'Junior (Year 3)',
  });

  // Photo upload
  const [profilePhoto, setProfilePhoto] = useState(null);
  const photoInputRef = useRef(null);
  
  // Edit photo upload
  const [editPhoto, setEditPhoto] = useState(null);
  const editPhotoRef = useRef(null);

  // Logout confirmation
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  // Tutors & Bookings — fetched from backend
  const [tutors, setTutors] = useState([]);
  const [tutorsLoading, setTutorsLoading] = useState(true);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [bookingTutor, setBookingTutor] = useState(null);
  const [bookForm, setBookForm] = useState({ date: '', time: '', notes: '' });
  const [bookSuccess, setBookSuccess] = useState(false);
  const [cancelConfirmId, setCancelConfirmId] = useState(null);

  const displayName = savedProfile.name || localStorage.getItem('userName') || 'Student';
  const userRole = 'STUDENT';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userInitials = getInitials(displayName);
  const firstName = getFirstName(displayName);
  const unreadCount = notifications.filter(n => !n.read).length;
  const stats = calculateStats(upcomingBookings, pastBookings);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // ── Fetch tutors on mount ─────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    fetch('http://localhost:8080/api/tutors', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.json())
      .then(data => {
        const tutorList = data.data ? Array.isArray(data.data) ? data.data : [] : Array.isArray(data) ? data : [];
        setTutors(tutorList.map(normalizeTutor));
        setTutorsLoading(false);
      })
      .catch(() => setTutorsLoading(false));
  }, []);

  // ── Fetch bookings on mount ───────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setBookingsLoading(false); return; }
    fetch('http://localhost:8080/api/bookings', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) { setBookingsLoading(false); return; }
        const normalized = data.map(normalizeBooking);
        setUpcomingBookings(normalized.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING'));
        setPastBookings(normalized.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED'));
        setBookingsLoading(false);
      })
      .catch(() => setBookingsLoading(false));
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
    { id: 'tutors', label: 'Find Tutors', icon: '🔍' },
    { id: 'bookings', label: 'My Bookings', icon: '📅' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  const handleNavClick = (id) => {
    setActiveNav(id);
    setNotifOpen(false);
    if (id === 'tutors') {
      setTutorView('list');
      setSelectedTutor(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    window.location.href = '/login'; // Redirect to login
  };

  const handleLogoutClick = () => {
    setLogoutConfirmOpen(true);
  };

  const handleViewProfile = (tutor) => {
    setSelectedTutor(tutor);
    setTutorView('profile');
    setActiveNav('tutors');
  };

  const handleContactTutor = (tutor) => {
    setSelectedTutor(tutor);
    // Init with a greeting message from tutor
    setChatMessages([
      {
        id: 1,
        sender: 'tutor',
        text: `Hi there! I'm ${tutor.name}. How can I help you with ${tutor.subject}?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
    setChatInput('');
    setTutorView('contact');
    setActiveNav('tutors');
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg = {
      id: chatMessages.length + 1,
      sender: 'user',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfilePhoto(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleEditPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditPhoto(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleEditSave = () => {
    setSavedProfile({ ...editForm });
    if (editPhoto) {
      setProfilePhoto(editPhoto);
      setEditPhoto(null);
    }
    setEditProfileOpen(false);
    editPhotoRef.current = null; // Reset ref
  };

  const handleBookSession = (tutor) => {
    setBookingTutor(tutor);
    setBookForm({ date: '', time: '', notes: '' });
    setBookSuccess(false);
    setBookModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!bookForm.date || !bookForm.time) return;
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch('http://localhost:8080/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tutorId: bookingTutor.id,
          date: bookForm.date,
          time: bookForm.time,
          notes: bookForm.notes,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const created = await res.json();
      const normalizedBooking = normalizeBooking(created);
      setUpcomingBookings(prev => [normalizedBooking, ...prev]);
      
      // Add notification for booking confirmation
      const newNotif = createNotification(normalizedBooking, 'booked');
      setNotifications(prev => [newNotif, ...prev]);
      
      setBookSuccess(true);
    } catch {
      alert('Failed to book session. Please try again.');
    }
  };

  const handleCancelBooking = async (id) => {
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`http://localhost:8080/api/bookings/${id}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed');
      
      // Find the booking to create notification
      const booking = upcomingBookings.find(b => b.id === id);
      if (booking) {
        const newNotif = createNotification(booking, 'cancelled');
        setNotifications(prev => [newNotif, ...prev]);
      }
      
      setUpcomingBookings(prev =>
        prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b)
      );
    } catch {
      alert('Failed to cancel booking. Please try again.');
    }
    setCancelConfirmId(null);
  };

  const renderContent = () => {
    if (activeNav === 'dashboard') {
      return (
        <DashboardView 
          firstName={firstName} 
          upcomingBookings={upcomingBookings}
          stats={stats}
          notifications={notifications}
          onNavClick={handleNavClick}
        />
      );
    }
    
    if (activeNav === 'tutors') {
      if (tutorView === 'profile') {
        return (
          <TutorProfile 
            tutor={selectedTutor}
            onBack={() => setTutorView('list')}
            onContactTutor={handleContactTutor}
            onBookSession={handleBookSession}
          />
        );
      }
      if (tutorView === 'contact') {
        return (
          <ChatInterface 
            tutor={selectedTutor}
            chatMessages={chatMessages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            onSendMessage={handleSendMessage}
            onBack={() => setTutorView('profile')}
            chatEndRef={chatEndRef}
          />
        );
      }
      return (
        <TutorDirectory 
          tutors={tutors}
          tutorsLoading={tutorsLoading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onViewProfile={handleViewProfile}
          onContactTutor={handleContactTutor}
        />
      );
    }
    
    if (activeNav === 'bookings') {
      return (
        <BookingsManager 
          bookingTab={bookingTab}
          setBookingTab={setBookingTab}
          upcomingBookings={upcomingBookings}
          pastBookings={pastBookings}
          bookingsLoading={bookingsLoading}
          onCancelBooking={handleCancelBooking}
          cancelConfirmId={cancelConfirmId}
          setCancelConfirmId={setCancelConfirmId}
          onNavClick={handleNavClick}
        />
      );
    }
    
    if (activeNav === 'profile') {
      return (
        <ProfileSettings 
          displayName={displayName}
          userEmail={userEmail}
          userRole={userRole}
          userInitials={userInitials}
          savedProfile={savedProfile}
          profilePhoto={profilePhoto}
          sessionStats={calculateSessionStats(upcomingBookings, pastBookings)}
          onEditOpen={() => { 
            setEditForm({ 
              name: displayName, 
              department: savedProfile.department, 
              yearLevel: savedProfile.yearLevel 
            }); 
            setEditPhoto(profilePhoto);
            setEditProfileOpen(true); 
          }}
          photoInputRef={photoInputRef}
          onPhotoUpload={handlePhotoUpload}
        />
      );
    }
  };

  return (
    <div className="dashboard-root">
      {/* LOGOUT CONFIRMATION MODAL */}
      {logoutConfirmOpen && (
        <div className="modal-overlay" onClick={() => setLogoutConfirmOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Confirm Logout</h2>
              <button className="modal-close" onClick={() => setLogoutConfirmOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, color: 'var(--text)', lineHeight: '1.6' }}>
                Are you sure you want to logout? You'll need to login again to access your account.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setLogoutConfirmOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleLogout} style={{ background: 'var(--error)' }}>Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {editProfileOpen && (
        <EditProfileModal 
          editForm={editForm}
          setEditForm={setEditForm}
          onSave={handleEditSave}
          onClose={() => setEditProfileOpen(false)}
          editPhotoRef={editPhotoRef}
          onPhotoUpload={handleEditPhotoUpload}
          editPhoto={editPhoto}
        />
      )}

      {/* BOOK SESSION MODAL */}
      {bookModalOpen && (
        <BookingModal 
          bookingTutor={bookingTutor}
          bookForm={bookForm}
          setBookForm={setBookForm}
          bookSuccess={bookSuccess}
          onConfirmBooking={handleConfirmBooking}
          onClose={() => { 
            setBookModalOpen(false); 
            setBookSuccess(false); 
          }}
        />
      )}

      {/* TOPBAR */}
      <header className="topbar">
        <div className="topbar-logo">
          <div className="topbar-logo-circle">T</div>
          <span className="topbar-logo-text">TutorTime</span>
        </div>

        <div className="topbar-search">
          <span className="topbar-search-icon">🔍</span>
          <input className="topbar-search-input" placeholder="Search by subject, tutor name, or department..." />
        </div>

        <div className="topbar-right">
          <div className="notif-wrapper">
            <button className="notif-btn" onClick={() => setNotifOpen(!notifOpen)}>
              🔔
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>
            {notifOpen && (
              <div className="notif-panel">
                <div className="notif-panel-header">Notifications</div>
                {notifications.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#888' }}>No notifications</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`notif-item ${n.read ? 'read' : 'unread'}`}>
                      <div className="notif-text">{n.text}</div>
                      <div className="notif-time">{n.time}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="user-chip">
            <div className="user-meta">
              <div className="user-name">{displayName}</div>
            </div>
            <Avatar initials={userInitials} size={36} photoUrl={profilePhoto} />
          </div>
        </div>
      </header>

      <div className="dashboard-body">
        <aside className="sidebar">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
          <div className="sidebar-spacer" />
          <button className="nav-item nav-logout" onClick={handleLogoutClick}>
            <span className="nav-icon">🚪</span>
            Log Out
          </button>
        </aside>

        <main className="dashboard-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default StudentDashboard;
