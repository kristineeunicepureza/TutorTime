import { useState, useRef, useEffect } from 'react';
import './TutorTimeDashboard.css';

// Import utility functions
import {
  getFirstName,
  getInitials,
} from './utils/helpers';

// Import UI Components
import { Avatar } from './components/Avatar';

// ════════════════════════════════════════════════════════════════════
// TUTOR DASHBOARD
// ════════════════════════════════════════════════════════════════════
function TutorDashboard() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [notifOpen, setNotifOpen] = useState(false);
  const [bookingTab, setBookingTab] = useState('upcoming');
  const [notifications] = useState([]);

  // Logout confirmation
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  // Availability Management
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [availabilityForm, setAvailabilityForm] = useState({
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '17:00',
    subject: 'Mathematics',
    isRecurring: true,
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);

  // Profile
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const photoInputRef = useRef(null);
  const editPhotoRef = useRef(null);
  const [editPhoto, setEditPhoto] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState('PENDING');
  const [approvalStatusLoading, setApprovalStatusLoading] = useState(true);

  const [editForm, setEditForm] = useState({
    name: localStorage.getItem('userName') || '',
    subject: 'Mathematics',
    bio: 'Experienced tutor in Mathematics and Data Structures',
    hourlyRate: '25',
  });
  const [savedProfile, setSavedProfile] = useState({
    name: localStorage.getItem('userName') || '',
    subject: 'Mathematics',
    bio: 'Experienced tutor in Mathematics and Data Structures',
    hourlyRate: '25',
  });

  // Bookings
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  const displayName = savedProfile.name || localStorage.getItem('userName') || 'Tutor';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userInitials = getInitials(displayName);
  const firstName = getFirstName(displayName);
  const unreadCount = notifications.filter(n => !n.read).length;

  // ── Fetch availability slots on mount ──────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) { setSlotsLoading(false); return; }
    fetch('http://localhost:8080/api/availability', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setAvailableSlots(Array.isArray(data) ? data : []);
        setSlotsLoading(false);
      })
      .catch(() => setSlotsLoading(false));
  }, []);

  // ── Fetch bookings on mount ───────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) { setBookingsLoading(false); return; }
    fetch('http://localhost:8080/api/bookings/myBookings', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) { setBookingsLoading(false); return; }
        setUpcomingBookings(data.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING') || []);
        setPastBookings(data.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED') || []);
        setBookingsLoading(false);
      })
      .catch(() => setBookingsLoading(false));
  }, []);

  // ── Fetch approval status on mount ─────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) { setApprovalStatusLoading(false); return; }

    const fetchApprovalStatus = () => {
      fetch('http://localhost:8080/api/tutors/profile/my-profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => {
          if (data.success && data.data && data.data.approvalStatus) {
            setApprovalStatus(data.data.approvalStatus);
          }
          setApprovalStatusLoading(false);
        })
        .catch(() => setApprovalStatusLoading(false));
    };

    fetchApprovalStatus();

    // Refresh approval status every 5 seconds
    const interval = setInterval(fetchApprovalStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
    { id: 'availability', label: 'Manage Availability', icon: '📅' },
    { id: 'bookings', label: 'My Bookings', icon: '📋' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  const handleNavClick = (id) => {
    setActiveNav(id);
    setNotifOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    window.location.href = '/login';
  };

  const handleLogoutClick = () => {
    setLogoutConfirmOpen(true);
  };

  const handleAddAvailability = async () => {
    if (!availabilityForm.startTime || !availabilityForm.endTime) {
      alert('Please fill in all fields');
      return;
    }
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch('http://localhost:8080/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(availabilityForm),
      });
      if (!res.ok) throw new Error('Failed');
      const newSlot = await res.json();
      setAvailableSlots(prev => [newSlot, ...prev]);
      setAvailabilityModalOpen(false);
      setAvailabilityForm({
        dayOfWeek: 'MONDAY',
        startTime: '09:00',
        endTime: '17:00',
        subject: 'Mathematics',
        isRecurring: true,
      });
      alert('Availability added successfully!');
    } catch {
      alert('Failed to add availability. Please try again.');
    }
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
    editPhotoRef.current = null;
  };

  const renderContent = () => {
    if (activeNav === 'dashboard') {
      return (
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">Welcome, {firstName}! 👋</h1>
            <p className="page-subtitle">Manage your tutoring sessions and availability.</p>
          </div>

          {/* APPROVAL STATUS BANNER */}
          {!approvalStatusLoading && (
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: approvalStatus === 'APPROVED' ? 'rgba(76, 175, 80, 0.1)' :
                         approvalStatus === 'REJECTED' ? 'rgba(244, 67, 54, 0.1)' :
                         'rgba(255, 152, 0, 0.1)',
              border: `2px solid ${
                approvalStatus === 'APPROVED' ? '#4CAF50' :
                approvalStatus === 'REJECTED' ? '#F44336' :
                '#FF9800'
              }`
            }}>
              <span style={{ fontSize: '20px' }}>
                {approvalStatus === 'APPROVED' ? '✅' :
                 approvalStatus === 'REJECTED' ? '❌' :
                 '⏳'}
              </span>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                  {approvalStatus === 'APPROVED' ? '🎉 Your Profile is Approved!' :
                   approvalStatus === 'REJECTED' ? '⚠️ Your Profile was Rejected' :
                   '⏳ Awaiting Admin Approval'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {approvalStatus === 'APPROVED' ? 'Your profile is visible to students. You can accept bookings now!' :
                   approvalStatus === 'REJECTED' ? 'Your profile application was rejected. Please contact support for details.' :
                   'Your profile is under review by our admin team. You\'ll receive a notification once approved.'}
                </div>
              </div>
            </div>
          )}

          <div className="two-col">
            <div className="card">
              <h2 className="section-title" style={{ marginBottom: 16 }}>Quick Stats</h2>
              {[
                { label: 'Upcoming Sessions', value: upcomingBookings.length },
                { label: 'Total Hours This Month', value: '24 hrs' },
                { label: 'Completed Sessions', value: '18' },
                { label: 'Average Rating', value: '★★★★★ (4.8)' },
              ].map(row => (
                <div key={row.label} className="detail-row">
                  <span className="detail-label">{row.label}</span>
                  <span className="detail-value">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="card">
              <h2 className="section-title" style={{ marginBottom: 16 }}>Upcoming Sessions</h2>
              {upcomingBookings.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#888' }}>No upcoming sessions</div>
              ) : (
                upcomingBookings.slice(0, 3).map(booking => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-title">{booking.tutor}</div>
                    <div className="booking-time">{booking.date} • {booking.time}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      );
    }

    if (activeNav === 'availability') {
      return (
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">Manage Availability</h1>
            <p className="page-subtitle">Add or edit your available time slots.</p>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 className="section-title">Your Available Slots</h2>
              <button className="btn-primary" onClick={() => setAvailabilityModalOpen(true)}>
                ➕ Add Slot
              </button>
            </div>

            {slotsLoading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>Loading slots...</div>
            ) : availableSlots.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                No available slots. Click "Add Slot" to create one.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {availableSlots.map(slot => (
                  <div key={slot.id} className="availability-card" style={{
                    padding: '12px 16px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>{slot.dayOfWeek}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {slot.startTime} - {slot.endTime} • {slot.subject}
                      </div>
                    </div>
                    <span style={{ 
                      background: slot.isRecurring ? 'var(--success-light)' : 'var(--bg)',
                      color: slot.isRecurring ? 'var(--success)' : 'var(--text-muted)',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      {slot.isRecurring ? 'Recurring' : 'One-time'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ADD AVAILABILITY MODAL */}
          {availabilityModalOpen && (
            <div className="modal-overlay" onClick={() => setAvailabilityModalOpen(false)}>
              <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2 className="modal-title">Add Availability</h2>
                  <button className="modal-close" onClick={() => setAvailabilityModalOpen(false)}>✕</button>
                </div>

                <div className="modal-body">
                  <div className="modal-field">
                    <label className="modal-label">Day of Week</label>
                    <select
                      className="modal-input"
                      value={availabilityForm.dayOfWeek}
                      onChange={e => setAvailabilityForm({ ...availabilityForm, dayOfWeek: e.target.value })}
                    >
                      <option>MONDAY</option>
                      <option>TUESDAY</option>
                      <option>WEDNESDAY</option>
                      <option>THURSDAY</option>
                      <option>FRIDAY</option>
                      <option>SATURDAY</option>
                      <option>SUNDAY</option>
                    </select>
                  </div>

                  <div className="modal-field">
                    <label className="modal-label">Start Time</label>
                    <input
                      className="modal-input"
                      type="time"
                      value={availabilityForm.startTime}
                      onChange={e => setAvailabilityForm({ ...availabilityForm, startTime: e.target.value })}
                    />
                  </div>

                  <div className="modal-field">
                    <label className="modal-label">End Time</label>
                    <input
                      className="modal-input"
                      type="time"
                      value={availabilityForm.endTime}
                      onChange={e => setAvailabilityForm({ ...availabilityForm, endTime: e.target.value })}
                    />
                  </div>

                  <div className="modal-field">
                    <label className="modal-label">Subject</label>
                    <input
                      className="modal-input"
                      value={availabilityForm.subject}
                      onChange={e => setAvailabilityForm({ ...availabilityForm, subject: e.target.value })}
                      placeholder="e.g. Mathematics"
                    />
                  </div>

                  <div className="modal-field">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={availabilityForm.isRecurring}
                        onChange={e => setAvailabilityForm({ ...availabilityForm, isRecurring: e.target.checked })}
                      />
                      <span className="modal-label" style={{ margin: 0 }}>Recurring weekly</span>
                    </label>
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn-ghost" onClick={() => setAvailabilityModalOpen(false)}>Cancel</button>
                  <button className="btn-primary" onClick={handleAddAvailability}>Add Slot</button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (activeNav === 'bookings') {
      return (
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">My Bookings</h1>
            <p className="page-subtitle">View your upcoming and past sessions.</p>
          </div>

          <div className="card">
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <button
                className={`btn-tab ${bookingTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => setBookingTab('upcoming')}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontWeight: bookingTab === 'upcoming' ? '700' : '500',
                  color: bookingTab === 'upcoming' ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: bookingTab === 'upcoming' ? '2px solid var(--primary)' : 'none',
                  marginBottom: '-10px'
                }}
              >
                Upcoming ({upcomingBookings.length})
              </button>
              <button
                className={`btn-tab ${bookingTab === 'past' ? 'active' : ''}`}
                onClick={() => setBookingTab('past')}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontWeight: bookingTab === 'past' ? '700' : '500',
                  color: bookingTab === 'past' ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: bookingTab === 'past' ? '2px solid var(--primary)' : 'none',
                  marginBottom: '-10px'
                }}
              >
                Past ({pastBookings.length})
              </button>
            </div>

            {bookingsLoading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>Loading bookings...</div>
            ) : bookingTab === 'upcoming' ? (
              upcomingBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No upcoming bookings</div>
              ) : (
                upcomingBookings.map(booking => (
                  <div key={booking.id} className="booking-card" style={{ marginBottom: '12px', padding: '16px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{booking.tutor}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          📅 {booking.date} • 🕐 {booking.time}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          📍 {booking.location || 'TBD'}
                        </div>
                      </div>
                      <span style={{
                        background: 'var(--success-light)',
                        color: 'var(--success)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))
              )
            ) : (
              pastBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No past bookings</div>
              ) : (
                pastBookings.map(booking => (
                  <div key={booking.id} className="booking-card" style={{ marginBottom: '12px', padding: '16px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{booking.tutor}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          📅 {booking.date} • 🕐 {booking.time}
                        </div>
                      </div>
                      <span style={{
                        background: booking.status === 'COMPLETED' ? 'var(--success-light)' : 'var(--error-light)',
                        color: booking.status === 'COMPLETED' ? 'var(--success)' : 'var(--error)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      );
    }

    if (activeNav === 'profile') {
      return (
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">Tutor Profile</h1>
            <p className="page-subtitle">Manage your tutoring profile and credentials.</p>
          </div>

          <div className="card profile-hero">
            <div className="photo-upload-wrapper" onClick={() => photoInputRef.current.click()} title="Click to change photo">
              <Avatar initials={userInitials} size={80} photoUrl={profilePhoto} />
              <div className="photo-upload-overlay">
                <span className="photo-camera-icon">📷</span>
              </div>
              <input
                type="file"
                ref={photoInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
              />
            </div>

            <div className="profile-hero-info">
              <div className="profile-hero-name">{displayName}</div>
              <div className="profile-hero-email">{userEmail}</div>
              <div className="profile-hero-badges">
                <span className="tag">{savedProfile.subject}</span>
                <span className="badge-verified">✓ Verified Tutor</span>
              </div>
              <p className="photo-hint">Click your photo to update it</p>
            </div>
            <button className="btn-primary" onClick={() => {
              setEditForm({
                name: displayName,
                subject: savedProfile.subject,
                bio: savedProfile.bio,
                hourlyRate: savedProfile.hourlyRate,
              });
              setEditPhoto(profilePhoto);
              setEditProfileOpen(true);
            }}>
              ✏️ Edit Profile
            </button>
          </div>

          <div className="two-col">
            <div className="card">
              <h2 className="section-title" style={{ marginBottom: 16 }}>Profile Information</h2>
              {[
                { label: 'Full Name', value: displayName },
                { label: 'Email', value: userEmail },
                { label: 'Subject', value: savedProfile.subject },
                { label: 'Hourly Rate', value: `$${savedProfile.hourlyRate}/hour` },
              ].map(row => (
                <div key={row.label} className="detail-row">
                  <span className="detail-label">{row.label}</span>
                  <span className="detail-value">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="card">
              <h2 className="section-title" style={{ marginBottom: 16 }}>Bio</h2>
              <p style={{ color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>{savedProfile.bio}</p>
            </div>
          </div>

          {/* EDIT PROFILE MODAL */}
          {editProfileOpen && (
            <div className="modal-overlay" onClick={() => setEditProfileOpen(false)}>
              <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2 className="modal-title">Edit Tutor Profile</h2>
                  <button className="modal-close" onClick={() => setEditProfileOpen(false)}>✕</button>
                </div>

                <div className="modal-body">
                  <div className="modal-field">
                    <label className="modal-label">Profile Photo</label>
                    <div className="photo-input-wrapper">
                      <div 
                        className="photo-preview"
                        onClick={() => editPhotoRef.current?.click()}
                        title="Click to upload photo"
                      >
                        {editPhoto ? (
                          <img src={editPhoto} alt="Profile preview" className="photo-preview-img" />
                        ) : (
                          <div className="photo-placeholder">📷 Click to upload photo</div>
                        )}
                      </div>
                      <input
                        type="file"
                        ref={editPhotoRef}
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleEditPhotoUpload}
                      />
                    </div>
                  </div>

                  <div className="modal-field">
                    <label className="modal-label">Full Name</label>
                    <input
                      className="modal-input"
                      value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="modal-field">
                    <label className="modal-label">Subject</label>
                    <input
                      className="modal-input"
                      value={editForm.subject}
                      onChange={e => setEditForm({ ...editForm, subject: e.target.value })}
                      placeholder="e.g. Mathematics"
                    />
                  </div>

                  <div className="modal-field">
                    <label className="modal-label">Hourly Rate ($)</label>
                    <input
                      className="modal-input"
                      type="number"
                      value={editForm.hourlyRate}
                      onChange={e => setEditForm({ ...editForm, hourlyRate: e.target.value })}
                      placeholder="e.g. 25"
                      min="5"
                      max="100"
                    />
                  </div>

                  <div className="modal-field">
                    <label className="modal-label">Bio</label>
                    <textarea
                      className="modal-input"
                      value={editForm.bio}
                      onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                      placeholder="Tell students about your tutoring experience..."
                      rows={4}
                      style={{ resize: 'vertical', fontFamily: 'inherit', padding: '10px 14px' }}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn-ghost" onClick={() => setEditProfileOpen(false)}>Cancel</button>
                  <button className="btn-primary" onClick={handleEditSave}>Save Changes</button>
                </div>
              </div>
            </div>
          )}
        </div>
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

      {/* TOPBAR */}
      <header className="topbar">
        <div className="topbar-logo">
          <div className="topbar-logo-circle">T</div>
          <span className="topbar-logo-text">TutorTime</span>
        </div>

        <div className="topbar-search">
          <span className="topbar-search-icon">🔍</span>
          <input className="topbar-search-input" placeholder="Search..." disabled />
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

export default TutorDashboard;
