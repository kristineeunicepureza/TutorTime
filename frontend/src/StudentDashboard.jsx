import { useState, useRef, useEffect } from 'react';
import './TutorTimeDashboard.css';
import { getTutors, getMyBookings, getBookingLocationOptions, createBooking, cancelBooking, updateProfile, getStoredAuthToken } from './apiService';

import {
  getFirstName,
  getInitials,
  calculateStats,
  calculateSessionStats,
  createNotification,
  normalizeTutor,
  normalizeBooking,
} from './utils/helpers';

import { Avatar } from './components/Avatar';
import { DashboardView } from './components/DashboardView';
import { TutorProfile } from './components/TutorProfile';
import { TutorDirectory } from './components/TutorDirectory';
import { BookingsManager } from './components/BookingsManager';
import { ProfileSettings } from './components/ProfileSettings';
import { BookingModal } from './components/BookingModal';
import { EditProfileModal } from './components/EditProfileModal';

function StudentDashboard() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [notifOpen, setNotifOpen] = useState(false);
  const [bookingTab, setBookingTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  const [tutorView, setTutorView] = useState('list');
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [notifications, setNotifications] = useState([]);

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

  const [profilePhoto, setProfilePhoto] = useState(null);
  const photoInputRef = useRef(null);
  const [editPhoto, setEditPhoto] = useState(null);
  const editPhotoRef = useRef(null);

  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const [tutors, setTutors] = useState([]);
  const [tutorsLoading, setTutorsLoading] = useState(true);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [bookingTutor, setBookingTutor] = useState(null);
  const [selectedAvailability, setSelectedAvailability] = useState(null);
  const [bookForm, setBookForm] = useState({ date: '', time: '', locationId: '', notes: '' });
  const [locationOptions, setLocationOptions] = useState([]);
  const [bookSuccess, setBookSuccess] = useState(false);
  const [cancelConfirmId, setCancelConfirmId] = useState(null);
  const [tutorProfileRefreshToken, setTutorProfileRefreshToken] = useState(0);

  const normalizeApiTime = (timeValue) => {
    if (!timeValue) return '';
    const match = String(timeValue).match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (!match) return String(timeValue);
    const hours = Number(match[1]);
    const minutes = match[2];
    const period = hours >= 12 ? 'PM' : 'AM';
    const twelveHour = hours % 12 === 0 ? 12 : hours % 12;
    return `${twelveHour}:${minutes} ${period}`;
  };

  const normalizeDateToIso = (dateValue) => {
    if (!dateValue) return '';
    const value = String(dateValue);
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return '';
  };

  const getAuthUserId = () => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';
      if (!token || !token.includes('.')) return '';
      const payload = token.split('.')[1];
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(atob(normalized).split('').map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`).join(''));
      const parsed = JSON.parse(json);
      return parsed?.sub || '';
    } catch {
      return '';
    }
  };

  const getStudentBlockedTimesForTutor = (tutor, selectedDate) => {
    if (!tutor || !selectedDate) return [];
    const targetDate = normalizeDateToIso(selectedDate);

    return upcomingBookings
      .filter((booking) => {
        const sameTutorById = booking?.tutorId && tutor?.id && String(booking.tutorId) === String(tutor.id);
        const sameTutorByName = !sameTutorById && booking?.tutor && tutor?.name && String(booking.tutor).toLowerCase() === String(tutor.name).toLowerCase();
        if (!sameTutorById && !sameTutorByName) return false;

        const bookingDate = normalizeDateToIso(booking?.bookingDate || booking?.date || booking?.slotStart || booking?.slot_start);
        return bookingDate && bookingDate === targetDate;
      })
      .map((booking) => normalizeApiTime(booking?.bookingTime || booking?.time))
      .filter(Boolean);
  };

  const displayName = savedProfile.name || localStorage.getItem('userName') || 'Student';
  const userRole = 'STUDENT';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userInitials = getInitials(displayName);
  const firstName = getFirstName(displayName);
  const unreadCount = notifications.filter(n => !n.read).length;
  const stats = calculateStats(upcomingBookings, pastBookings);

  // Load profile from backend on mount
  useEffect(() => {
    // ✅ FIXED: Use getStoredAuthToken with fallback chain
    const token = getStoredAuthToken();
    if (!token) return;
    fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.photoUrl && data.photoUrl.startsWith('http')) {
          setProfilePhoto(data.photoUrl);
        }
        // Load all profile fields from backend
        setSavedProfile(prev => ({
          ...prev,
          name: data.displayName || data.fullName || prev.name,
          department: data.department || prev.department,
          yearLevel: data.yearLevel || prev.yearLevel,
        }));
        // Also update localStorage for persistence within session
        if (data.displayName) localStorage.setItem('userName', data.displayName);
        if (data.department) localStorage.setItem('userDepartment', data.department);
        if (data.yearLevel) localStorage.setItem('userYearLevel', data.yearLevel);
      })
      .catch(() => {});
  }, []);

  const refreshBookings = async () => {
    const payload = await getMyBookings();
    const rows = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
    const normalized = rows.map(normalizeBooking);
    setUpcomingBookings(normalized.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING'));
    setPastBookings(normalized.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED'));
  };

  useEffect(() => {
    (async () => {
      try {
        const payload = await getTutors();
        const tutorRows = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
        setTutors(tutorRows.map(normalizeTutor));
      } catch { setTutors([]); }
      finally { setTutorsLoading(false); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      // ✅ FIXED: Use getStoredAuthToken with fallback chain
      const token = getStoredAuthToken();
      if (!token) { setBookingsLoading(false); return; }
      try { await refreshBookings(); }
      catch { setUpcomingBookings([]); setPastBookings([]); }
      finally { setBookingsLoading(false); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const payload = await getBookingLocationOptions();
        const options = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
        setLocationOptions(options);
      } catch { setLocationOptions([]); }
    })();
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
    if (id === 'tutors') { setTutorView('list'); setSelectedTutor(null); }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    window.location.href = '/';
  };

  const handleViewProfile = (tutor) => {
    setSelectedTutor(tutor);
    setTutorView('profile');
    setActiveNav('tutors');
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setProfilePhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleEditPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setEditPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleEditSave = async () => {
    // EditProfileModal already called PUT /api/profile for profile fields.
    // This handler focuses on:
    // 1. Uploading the photo to backend (if changed)
    // 2. Updating local state

    try {
      // ✅ FIXED: Use getStoredAuthToken() with fallback chain
      const token = getStoredAuthToken();
      if (!token) {
        alert('Session expired. Please log in again.');
        return;
      }

      // If student changed photo, upload it so it persists after refresh
      if (editPhoto && editPhoto !== profilePhoto) {
        if (editPhoto.startsWith('data:')) {
          const blob = await fetch(editPhoto).then(r => r.blob());
          const file = new File([blob], 'avatar.jpg', { type: blob.type || 'image/jpeg' });
          const formData = new FormData();
          formData.append('file', file);

          const uploadRes = await fetch('/api/uploadPhoto', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });

          const uploadData = await uploadRes.json();
          if (!uploadRes.ok) throw new Error(uploadData.message || 'Photo upload failed');

          setProfilePhoto(uploadData.photoUrl || editPhoto);
          console.log('✅ Photo uploaded:', uploadData.photoUrl);
        } else {
          setProfilePhoto(editPhoto);
        }
      } else if (editPhoto) {
        setProfilePhoto(editPhoto);
      }

      // Update local state with new profile (EditProfileModal already persisted to backend)
      setSavedProfile({ ...editForm });
      setEditPhoto(null);
      setEditProfileOpen(false);
    } catch (err) {
      console.error('Photo upload error:', err.message);
      alert('Photo upload failed: ' + (err.message || 'Please try again.'));
    }
  };

  const handleBookSession = (tutor, availabilitySlot = null) => {
    setBookingTutor(tutor);
    setSelectedAvailability(availabilitySlot);
    setBookForm({
      date: '',
      time: '',
      locationId: locationOptions[0]?.id || '',
      notes: '',
    });
    setBookSuccess(false);
    setBookModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!bookForm.date || !bookForm.time) return;
    if (!selectedAvailability?.id) { alert('Please book from a specific available slot.'); return; }

    const selectedDay = new Date(`${bookForm.date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    const slotDay = String(selectedAvailability.dayOfWeek || '').toUpperCase();
    if (slotDay && selectedDay !== slotDay) { alert(`Please select a ${slotDay} date for this slot.`); return; }

    const bookingTime = normalizeApiTime(selectedAvailability.startTime) || bookForm.time;
    const studentBlockedTimes = getStudentBlockedTimesForTutor(bookingTutor, bookForm.date);
    if (studentBlockedTimes.includes(bookingTime)) {
      alert('You already booked this tutor at that time. Please select another time slot.');
      return;
    }

    const bookingPayload = {
        tutorId: bookingTutor.id,
        availabilityId: selectedAvailability.id,
        locationId: bookForm.locationId,
        bookingDate: bookForm.date,
        bookingTime,
        // Compatibility fields for backends that resolve student account from payload.
        date: bookForm.date,
        time: bookingTime,
        studentEmail: localStorage.getItem('userEmail') || '',
        studentName: localStorage.getItem('userName') || '',
        studentAuthId: getAuthUserId(),
      };

    try {
      await createBooking(bookingPayload);
      await refreshBookings();
      const normalizedBooking = normalizeBooking({
        tutorName: bookingTutor.name,
        date: bookForm.date,
        time: bookingTime,
        subject: selectedAvailability.subject || bookingTutor.subject,
      });
      setNotifications(prev => [createNotification(normalizedBooking, 'booked'), ...prev]);
      setBookSuccess(true);
      setTutorProfileRefreshToken((prev) => prev + 1);
    } catch (error) {
      const message = error?.message || 'Failed to book session. Please try again.';
      if (String(message).toLowerCase().includes('student account not found')) {
        try {
          // Recovery path: some backends create/link student records when profile is updated.
          await updateProfile(localStorage.getItem('userName') || 'Student');
          await createBooking(bookingPayload);
          await refreshBookings();
          const normalizedBooking = normalizeBooking({
            tutorName: bookingTutor.name,
            date: bookForm.date,
            time: bookingTime,
            subject: selectedAvailability.subject || bookingTutor.subject,
          });
          setNotifications(prev => [createNotification(normalizedBooking, 'booked'), ...prev]);
          setBookSuccess(true);
          setTutorProfileRefreshToken((prev) => prev + 1);
          return;
        } catch {
          alert('Your account is authenticated, but the backend has no linked student record yet. Please sign out and sign up as STUDENT using the same @cit.edu email, then log in again.');
        }
      } else {
        alert(message);
      }
    }
  };

  const handleCancelBooking = async (id) => {
    try {
      await cancelBooking(id);
      await refreshBookings();
      const booking = upcomingBookings.find(b => b.id === id);
      if (booking) setNotifications(prev => [createNotification(booking, 'cancelled'), ...prev]);
    } catch (error) {
      alert(error?.message || 'Failed to cancel booking. Please try again.');
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
        return <TutorProfile tutor={selectedTutor} onBack={() => setTutorView('list')} onBookSession={handleBookSession} refreshToken={tutorProfileRefreshToken} />;
      }
      return (
        <TutorDirectory
          tutors={tutors}
          tutorsLoading={tutorsLoading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onViewProfile={handleViewProfile}
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
              yearLevel: savedProfile.yearLevel,
            });
            setEditPhoto(profilePhoto);
            setEditProfileOpen(true);
          }}
          photoInputRef={photoInputRef}
          onPhotoUpload={handlePhotoUpload}
          onPhotoUrlChange={(url) => setProfilePhoto(url)}
        />
      );
    }
  };

  return (
    <div className="dashboard-root">
      {/* LOGOUT MODAL */}
      {logoutConfirmOpen && (
        <div className="modal-overlay" onClick={() => setLogoutConfirmOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="modal-title">🚪 Confirm Logout</h2>
              <button className="modal-close" onClick={() => setLogoutConfirmOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: '1.65', fontSize: '14px' }}>
                Are you sure you want to logout? You'll need to sign in again to access your account.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setLogoutConfirmOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleLogout} style={{ background: 'linear-gradient(135deg,#DC2626,#B91C1C)', boxShadow: '0 4px 14px rgba(220,38,38,.28)' }}>🚪 Logout</button>
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
          selectedAvailability={selectedAvailability}
          locationOptions={locationOptions}
          bookForm={bookForm}
          setBookForm={(newForm) => {
            // ✅ UPDATED: When form is reset (e.g., from "Book Another" button), clear success state
            if (!newForm.date && !newForm.time) {
              setBookSuccess(false);
            }
            setBookForm(newForm);
          }}
          bookSuccess={bookSuccess}
          studentBookedTimes={getStudentBlockedTimesForTutor(bookingTutor, bookForm.date)}
          onConfirmBooking={handleConfirmBooking}
          onClose={() => { setBookModalOpen(false); setSelectedAvailability(null); setBookSuccess(false); }}
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
                {notifications.length === 0
                  ? <div style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--text-light)', fontSize: '13px' }}>
                      <div style={{ fontSize: '24px', marginBottom: '6px' }}>🔔</div>No notifications
                    </div>
                  : notifications.map(n => (
                    <div key={n.id} className={`notif-item ${n.read ? 'read' : 'unread'}`}>
                      <div className="notif-text">{n.text}</div>
                      <div className="notif-time">{n.time}</div>
                    </div>
                  ))}
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
          <button className="nav-item nav-logout" onClick={() => setLogoutConfirmOpen(true)}>
            <span className="nav-icon">🚪</span>
            Log Out
          </button>
        </aside>
        <main className="dashboard-main">{renderContent()}</main>
      </div>
    </div>
  );
}

export default StudentDashboard;