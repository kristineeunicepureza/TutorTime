import { useState, useRef, useEffect } from 'react';
import './TutorTimeDashboard.css';

import { getFirstName, getInitials } from './utils/helpers';
import { Avatar } from './components/Avatar';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { getStoredAuthToken, getTutorBookings } from './apiService';

function TutorDashboard() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [notifOpen, setNotifOpen] = useState(false);
  const [bookingTab, setBookingTab] = useState('upcoming');
  const [notifications, setNotifications] = useState([]);

  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [pwModalOpen, setPwModalOpen] = useState(false);

  // Availability
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [availabilityForm, setAvailabilityForm] = useState({
    dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00', subject: '', isRecurring: true,
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);

  // Profile
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoInputRef = useRef(null);
  const editPhotoRef = useRef(null);
  const [editPhoto, setEditPhoto] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState('PENDING');
  const [approvalStatusLoading, setApprovalStatusLoading] = useState(true);
  const prevApprovalStatusRef = useRef(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState('');

  const [editForm, setEditForm] = useState({
    name: localStorage.getItem('userName') || '',
    subject: 'Mathematics',
    hourlyRate: '250',
  });
  const [savedProfile, setSavedProfile] = useState({
    name: localStorage.getItem('userName') || '',
    subject: 'Mathematics',
    hourlyRate: '250',
  });

  // Bookings
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  // Subjects
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);

  const displayName = savedProfile.name || localStorage.getItem('userName') || 'Tutor';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userInitials = getInitials(displayName);
  const firstName = getFirstName(displayName);
  const unreadCount = notifications.filter(n => !n.read).length;

  const normalizeAvailabilitySlot = (slot) => {
    if (!slot || typeof slot !== 'object') return null;
    return {
      id: slot.id,
      dayOfWeek: slot.dayOfWeek || slot.day_of_week || '-',
      startTime: slot.startTime || slot.start_time || '-',
      endTime: slot.endTime || slot.end_time || '-',
      subject: slot.subject || '-',
      isRecurring: slot.isRecurring ?? slot.is_recurring ?? false,
      isBooked: slot.isBooked ?? slot.is_booked ?? false,
    };
  };

  const normalizeNotification = (item) => {
    if (!item || typeof item !== 'object') return null;
    return {
      id: item.id || Date.now(),
      text: item.message || item.text || '',
      time: item.createdAt ? new Date(item.createdAt).toLocaleString() : (item.time || ''),
      read: item.isRead ?? item.read ?? false,
    };
  };

  const toBookingRows = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    if (Array.isArray(payload?.bookings)) return payload.bookings;
    if (Array.isArray(payload?.payload?.bookings)) return payload.payload.bookings;
    if (Array.isArray(payload?.result)) return payload.result;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.content)) return payload.content;
    return [];
  };

  // Load profile photo from backend on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.photoUrl && data.photoUrl.startsWith('http')) {
          setProfilePhoto(data.photoUrl);
        }
        if (data.displayName) {
          setSavedProfile(prev => ({ ...prev, name: data.displayName }));
        }
      })
      .catch(() => {});
  }, []);

  // Availability slots
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) { setSlotsLoading(false); return; }
    const fetchSlots = () => {
      fetch('/api/availability', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => {
          const rawSlots = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
          setAvailableSlots(rawSlots.map(normalizeAvailabilitySlot).filter(Boolean));
          setSlotsLoading(false);
        })
        .catch(() => setSlotsLoading(false));
    };
    fetchSlots();
    const interval = setInterval(fetchSlots, 5000);
    return () => clearInterval(interval);
  }, []);

  // Bookings
  useEffect(() => {
    const token = getStoredAuthToken();
    if (!token) { setBookingsLoading(false); return; }
    const fetchBookings = async () => {
      try {
        const data = await getTutorBookings();
        const bookings = toBookingRows(data);
        const normalizedBookings = bookings.map(b => {
          const rawStatus = (b.status || b.bookingStatus || '').toString().trim().toUpperCase();
          const parsedSlotStart = b.slotStart ? new Date(b.slotStart) : null;
          const parsedSlotEnd = b.slotEnd ? new Date(b.slotEnd) : null;
          const hasValidSlotStart = parsedSlotStart && !Number.isNaN(parsedSlotStart.getTime());
          const hasValidSlotEnd = parsedSlotEnd && !Number.isNaN(parsedSlotEnd.getTime());
          const displayStatus = rawStatus || (hasValidSlotStart && parsedSlotStart < new Date() ? 'COMPLETED' : 'CONFIRMED');
          const studentName = b.studentName || b.tutorName || `Student ${String(b.studentId || '').slice(0, 8)}` || 'Unknown';
          const dayLabel = hasValidSlotStart
            ? parsedSlotStart.toLocaleDateString('en-US', { weekday: 'long' })
            : (b.dayOfWeek || '');
          const timeRange = hasValidSlotStart
            ? `${parsedSlotStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${
                hasValidSlotEnd
                  ? parsedSlotEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                  : new Date(parsedSlotStart.getTime() + (30 * 60 * 1000)).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
              }`
            : (b.time || '');
          return {
            ...b, status: displayStatus, tutor: studentName,
            date: b.date || (hasValidSlotStart ? parsedSlotStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''),
            time: b.time || (hasValidSlotStart ? parsedSlotStart.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''),
            timeRange,
            dayLabel,
            subject: b.subject || 'General Tutoring',
            location: b.locationName || b.location || 'Online',
            slotStartDate: hasValidSlotStart ? parsedSlotStart : null,
          };
        });
        const now = new Date();
        const isPast = (b) => b.status === 'COMPLETED' || b.status === 'CANCELLED' || (b.slotStartDate && b.slotStartDate < now);
        setUpcomingBookings(normalizedBookings.filter(b => !isPast(b)));
        setPastBookings(normalizedBookings.filter(isPast));
      } finally {
        setBookingsLoading(false);
      }
    };
    fetchBookings();
    const interval = setInterval(fetchBookings, 5000);
    return () => clearInterval(interval);
  }, []);

  // Notifications
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    const fetchNotifications = () => {
      fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => {
          const rows = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
          setNotifications(rows.map(normalizeNotification).filter(Boolean));
        })
        .catch(() => {});
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  // Subjects
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) { setSubjectsLoading(false); return; }
    const fetchSubjects = () => {
      fetch('/api/subjects', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => {
          const subjectList = Array.isArray(data?.data) ? data.data : [];
          setSubjects(subjectList);
          if (subjectList.length > 0) {
            setAvailabilityForm(prev => {
              if (prev.subject) return prev;
              return { ...prev, subject: subjectList[0].name || '' };
            });
          }
          setSubjectsLoading(false);
        })
        .catch(() => setSubjectsLoading(false));
    };
    fetchSubjects();
    const interval = setInterval(fetchSubjects, 5000);
    return () => clearInterval(interval);
  }, []);

  // Approval status
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) { setApprovalStatusLoading(false); return; }

    const fetchApprovalStatus = async () => {
      try {
        const profileRes = await fetch('/api/tutors/profile/my-profile', { headers: { Authorization: `Bearer ${token}` } });
        if (profileRes.ok) {
          const data = await profileRes.json();
          if (data.success && data.data) {
            const newStatus = data.data.approvalStatus;
            if (newStatus) {
              if (prevApprovalStatusRef.current !== null && prevApprovalStatusRef.current !== newStatus) {
                const msg = newStatus === 'APPROVED'
                  ? 'Your tutor account has been approved! You can now accept bookings.'
                  : newStatus === 'REJECTED'
                  ? 'Your tutor application has been rejected. Contact support.'
                  : null;
                if (msg) setNotifications(prev => [{ id: Date.now(), text: msg, time: new Date().toLocaleTimeString(), read: false }, ...prev]);
              }
              prevApprovalStatusRef.current = newStatus;
              setApprovalStatus(newStatus);
            }
            // Load profile data from tutor profile
            setSavedProfile(prev => ({
              ...prev,
              subject: data.data.specialization || data.data.subject || prev.subject,
              hourlyRate: (data.data.hourlyRate ?? prev.hourlyRate).toString(),
            }));
          }
        } else {
          // Try to create profile
          await fetch('/api/tutors/profile/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ bio: '', specialization: '', hourlyRate: 0, yearsOfExperience: 0 }),
          });
        }
      } catch (err) {
        console.error('Failed to fetch approval status:', err);
      } finally {
        setApprovalStatusLoading(false);
      }
    };

    fetchApprovalStatus();
    const interval = setInterval(fetchApprovalStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
    { id: 'availability', label: 'Manage Availability', icon: '📅' },
    { id: 'bookings', label: 'My Bookings', icon: '📋' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  const handleNavClick = (id) => { setActiveNav(id); setNotifOpen(false); };
  const handleLogout = () => {
    localStorage.removeItem('authToken'); localStorage.removeItem('userName');
    localStorage.removeItem('userRole'); localStorage.removeItem('userEmail');
    window.location.href = '/';
  };

  // Photo upload with Supabase sync
  const handlePhotoUploadWithSync = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB.'); return; }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setProfilePhoto(ev.target.result);
    reader.readAsDataURL(file);

    // Upload to backend
    setPhotoUploading(true);
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/uploadPhoto', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      if (data.photoUrl && data.photoUrl.startsWith('http')) setProfilePhoto(data.photoUrl);
      console.log('✅ Photo uploaded:', data.photoUrl);
    } catch (err) {
      console.error('Photo upload failed:', err.message);
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleEditPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setEditPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  // Edit profile save — calls API
  const handleEditSaveWithSync = async () => {
    if (!editForm.name?.trim()) { setProfileSaveError('Name is required'); return; }
    setProfileSaving(true);
    setProfileSaveError('');
    try {
      const token = localStorage.getItem('authToken');

      // 1. Save profile via API
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          displayName: editForm.name.trim(),
          fullName: editForm.name.trim(),
          subject: editForm.subject,
          hourlyRate: editForm.hourlyRate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');

      // 2. If photo changed, upload it
      if (editPhoto && editPhoto !== profilePhoto && editPhoto.startsWith('data:')) {
        const blob = await fetch(editPhoto).then(r => r.blob());
        const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
        const formData = new FormData();
        formData.append('file', file);
        await fetch('/api/uploadPhoto', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        setProfilePhoto(editPhoto);
      }

      // 3. Update local state
      setSavedProfile({ ...editForm });
      localStorage.setItem('userName', editForm.name.trim());
      setEditProfileOpen(false);
    } catch (err) {
      setProfileSaveError(err.message || 'Failed to save changes');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAddAvailability = async () => {
    if (!availabilityForm.startTime || !availabilityForm.endTime) { alert('Please fill in all fields'); return; }
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...availabilityForm, recurringWeekly: availabilityForm.isRecurring }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || 'Failed to add availability');
      }
      const createdResponse = await res.json();
      const createdSlot = normalizeAvailabilitySlot(createdResponse?.data || createdResponse);
      if (createdSlot) setAvailableSlots(prev => [createdSlot, ...prev]);
      setAvailabilityModalOpen(false);
      setAvailabilityForm({ dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00', subject: subjects[0]?.name || '', isRecurring: true });
      alert('Availability added successfully!');
    } catch (error) {
      alert(error.message || 'Failed to add availability.');
    }
  };

  const renderContent = () => {
    if (!approvalStatusLoading && approvalStatus !== 'APPROVED') {
      return (
        <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div className="card" style={{ maxWidth: '480px', textAlign: 'center', padding: '44px 36px' }}>
            {approvalStatus === 'REJECTED' ? (
              <>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--error-light)', border: '3px solid #FECACA', margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>❌</div>
                <h2 style={{ fontFamily: "'Sora',sans-serif", color: 'var(--error)', marginBottom: '12px', fontSize: '20px', fontWeight: 800 }}>Application Rejected</h2>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.65', fontSize: '14px' }}>Your application was rejected. Please contact support for more details and next steps.</p>
              </>
            ) : (
              <>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--warning-light)', border: '3px solid #FDE68A', margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>⏳</div>
                <h2 style={{ fontFamily: "'Sora',sans-serif", color: 'var(--warning)', marginBottom: '12px', fontSize: '20px', fontWeight: 800 }}>Application Under Review</h2>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.65', fontSize: '14px' }}>Your profile is being reviewed by our admin team. You'll receive a notification once approved.</p>
              </>
            )}
            <button className="btn-ghost" onClick={() => setLogoutConfirmOpen(true)} style={{ marginTop: '24px' }}>🚪 Log Out</button>
          </div>
        </div>
      );
    }

    if (activeNav === 'dashboard') {
      return (
        <div className="page-content tt-a0">
          <div className="page-header">
            <div>
              <h1 className="page-title">Welcome, {firstName}! 👋</h1>
              <p className="page-subtitle">Manage your tutoring sessions and availability.</p>
            </div>
          </div>

          {/* Approval status banner */}
          {!approvalStatusLoading && (
            <div style={{
              padding: '14px 18px', borderRadius: '14px', marginBottom: '24px',
              display: 'flex', alignItems: 'center', gap: '14px',
              background: approvalStatus === 'APPROVED' ? 'var(--success-light)' : 'var(--warning-light)',
              border: `1.5px solid ${approvalStatus === 'APPROVED' ? '#A7F3D0' : '#FDE68A'}`,
            }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', background: approvalStatus === 'APPROVED' ? '#D1FAE5' : '#FEF3C7' }}>
                {approvalStatus === 'APPROVED' ? '✅' : '⏳'}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: approvalStatus === 'APPROVED' ? '#047857' : '#B45309' }}>
                  {approvalStatus === 'APPROVED' ? '🎉 Profile Approved!' : '⏳ Awaiting Admin Approval'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '3px' }}>
                  {approvalStatus === 'APPROVED'
                    ? 'Your profile is visible to students. You can accept bookings now!'
                    : "Your profile is under review. You'll be notified once approved."}
                </div>
              </div>
            </div>
          )}

          <div className="two-col">
            {/* Quick Stats */}
            <div className="card">
              <div className="card-header">
                <h2 className="section-title">
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>📊</div>
                  Quick Stats
                </h2>
              </div>
              {[
                { label: 'Upcoming Sessions',   value: upcomingBookings.length,                              color: 'var(--primary)' },
                { label: 'Completed Sessions',  value: pastBookings.filter(b => b.status === 'COMPLETED').length, color: 'var(--success)' },
                { label: 'Available Slots',     value: availableSlots.length,                                color: '#7C3AED' },
                { label: 'Average Rating',      value: '⭐ N/A',                                             color: 'var(--warning)' },
              ].map((row, i, arr) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--primary-light)' : 'none' }}>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-light)', fontWeight: 600 }}>{row.label}</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: row.color, fontFamily: "'Sora',sans-serif" }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Upcoming Sessions */}
            <div className="card">
              <div className="card-header">
                <h2 className="section-title">
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>📅</div>
                  Upcoming Sessions
                </h2>
              </div>
              {upcomingBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-light)', fontSize: '13px' }}>
                  <div style={{ fontSize: '26px', marginBottom: '8px' }}>📭</div>No upcoming sessions
                </div>
              ) : upcomingBookings.slice(0, 3).map((booking, i, arr) => (
                <div key={booking.id} style={{ padding: '11px 0', borderBottom: i < Math.min(arr.length, 3) - 1 ? '1px solid var(--primary-light)' : 'none' }}>
                  <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--navy)', marginBottom: '2px' }}>{booking.tutor}</div>
                  <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, marginBottom: '2px' }}>{booking.subject}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📅 {booking.date} · 🕐 {booking.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeNav === 'availability') {
      const DAY_COLOR = { MONDAY:'#1558D6', TUESDAY:'#059669', WEDNESDAY:'#B45309', THURSDAY:'#1558D6', FRIDAY:'#0284C7', SATURDAY:'#7C3AED', SUNDAY:'#DC2626' };
      const DAY_BG    = { MONDAY:'#EBF1FD', TUESDAY:'#F0FDF4', WEDNESDAY:'#FFFBEB', THURSDAY:'#EBF1FD', FRIDAY:'#F0F9FF', SATURDAY:'#F5F3FF', SUNDAY:'#FEF2F2' };

      return (
        <div className="page-content tt-a0">
          <div className="page-header">
            <div>
              <h1 className="page-title">Manage Availability</h1>
              <p className="page-subtitle">Add or edit your available time slots for students.</p>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="section-title">
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>🗓️</div>
                Your Available Slots
                {availableSlots.length > 0 && (
                  <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: '1.5px solid #C3D9F8', borderRadius: '20px', padding: '2px 10px', fontSize: '12px', fontWeight: 700 }}>
                    {availableSlots.length}
                  </span>
                )}
              </h2>
              <button className="btn-primary" onClick={() => setAvailabilityModalOpen(true)}>➕ Add Slot</button>
            </div>

            {slotsLoading ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-light)', fontSize: '13px' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>⏳</div>Loading slots...
              </div>
            ) : availableSlots.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 24px', border: '1.5px dashed #C3D9F8', borderRadius: '12px', background: 'var(--bg)' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>📭</div>
                <p style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', fontSize: '14px' }}>No available slots yet</p>
                <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>Click "Add Slot" to create your first availability.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                {availableSlots.map(slot => {
                  const color = DAY_COLOR[slot.dayOfWeek] || 'var(--primary)';
                  const bg    = DAY_BG[slot.dayOfWeek]    || 'var(--primary-light)';
                  return (
                    <div key={slot.id} style={{ padding: '14px 16px', border: `1.5px solid ${color}28`, borderRadius: '12px', background: bg, position: 'relative' }}>
                      <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: '13.5px', color, marginBottom: '4px' }}>
                        {slot.dayOfWeek}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--navy)', fontWeight: 600, marginBottom: '3px' }}>
                        🕐 {slot.startTime} – {slot.endTime}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        📚 {slot.subject}
                      </div>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        background: slot.isRecurring ? 'var(--success-light)' : 'var(--bg)',
                        color: slot.isRecurring ? '#047857' : 'var(--text-muted)',
                        border: `1.5px solid ${slot.isRecurring ? '#A7F3D0' : 'var(--border)'}`,
                        padding: '3px 10px', borderRadius: '20px', fontSize: '11.5px', fontWeight: 700,
                      }}>
                        {slot.isRecurring ? '🔁 Recurring' : '📌 One-time'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ADD SLOT MODAL */}
          {availabilityModalOpen && (
            <div className="modal-overlay" onClick={() => setAvailabilityModalOpen(false)}>
              <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2 className="modal-title">🗓️ Add Availability Slot</h2>
                  <button className="modal-close" onClick={() => setAvailabilityModalOpen(false)}>✕</button>
                </div>
                <div className="modal-body">
                  <div className="modal-field">
                    <label className="modal-label">Day of Week</label>
                    <select className="modal-input" value={availabilityForm.dayOfWeek}
                      onChange={e => setAvailabilityForm({ ...availabilityForm, dayOfWeek: e.target.value })}>
                      {['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="modal-field">
                    <label className="modal-label">Start Time</label>
                    <input className="modal-input" type="time" value={availabilityForm.startTime}
                      onChange={e => setAvailabilityForm({ ...availabilityForm, startTime: e.target.value })} />
                  </div>
                  <div className="modal-field">
                    <label className="modal-label">End Time</label>
                    <input className="modal-input" type="time" value={availabilityForm.endTime}
                      onChange={e => setAvailabilityForm({ ...availabilityForm, endTime: e.target.value })} />
                  </div>
                  <div className="modal-field">
                    <label className="modal-label">Subject</label>
                    <select className="modal-input" value={availabilityForm.subject}
                      onChange={e => setAvailabilityForm({ ...availabilityForm, subject: e.target.value })}>
                      <option value="">-- Select a Subject --</option>
                      {subjectsLoading
                        ? <option disabled>Loading...</option>
                        : subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="modal-field">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px 14px', background: 'var(--bg)', borderRadius: '10px', border: '1.5px solid var(--border)' }}>
                      <input type="checkbox" checked={availabilityForm.isRecurring}
                        onChange={e => setAvailabilityForm({ ...availabilityForm, isRecurring: e.target.checked })}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }} />
                      <div>
                        <span className="modal-label" style={{ margin: 0, display: 'block' }}>Recurring weekly</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}>This slot will repeat every week</span>
                      </div>
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn-ghost" onClick={() => setAvailabilityModalOpen(false)}>Cancel</button>
                  <button className="btn-primary" onClick={handleAddAvailability}>➕ Add Slot</button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (activeNav === 'bookings') {
      const list = bookingTab === 'upcoming' ? upcomingBookings : pastBookings;
      const STATUS_ACCENT = { CONFIRMED:'#059669', PENDING:'#D97706', CANCELLED:'#DC2626', COMPLETED:'#1558D6' };
      return (
        <div className="page-content tt-a0">
          <div className="page-header">
            <div>
              <h1 className="page-title">My Bookings</h1>
              <p className="page-subtitle">View your upcoming and past sessions.</p>
            </div>
          </div>

          {/* Pill tabs */}
          <div style={{ display: 'flex', gap: '4px', background: 'var(--primary-light)', borderRadius: '12px', padding: '4px', marginBottom: '20px', width: 'fit-content' }}>
            {[
              { key: 'upcoming', label: `Upcoming (${upcomingBookings.length})` },
              { key: 'past',     label: `Past (${pastBookings.length})` },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setBookingTab(key)} style={{
                background: bookingTab === key ? '#fff' : 'transparent',
                border: 'none', borderRadius: '9px', padding: '8px 20px',
                fontSize: '13px', fontWeight: bookingTab === key ? 700 : 500,
                color: bookingTab === key ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer', boxShadow: bookingTab === key ? '0 1px 4px rgba(8,33,62,.10)' : 'none',
                transition: 'all .15s', fontFamily: 'inherit',
              }}>{label}</button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {bookingsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)', fontSize: '13px' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>⏳</div>Loading...
              </div>
            ) : list.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', background: '#fff', borderRadius: '16px', border: '1.5px dashed #C3D9F8' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>📭</div>
                <p style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>No {bookingTab} bookings</p>
              </div>
            ) : list.map(booking => {
              const accent = STATUS_ACCENT[(booking.status||'').toUpperCase()] || 'var(--text-light)';
              return (
                <div key={booking.id} style={{
                  background: '#fff', borderRadius: '14px', padding: '15px 18px',
                  border: '1.5px solid var(--border)', borderLeft: `4px solid ${accent}`,
                  boxShadow: '0 1px 3px rgba(8,33,62,.05),0 4px 14px rgba(8,33,62,.06)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--navy)', marginBottom: '3px' }}>{booking.tutor}</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--primary)', fontWeight: 600, marginBottom: '6px' }}>{booking.subject}</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 500 }}>📅 {booking.dayLabel || booking.date} · 🕐 {booking.timeRange || booking.time}</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px' }}>📍 {booking.location || 'TBD'}</div>
                  </div>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center',
                    background: booking.status === 'CONFIRMED' ? 'var(--success-light)' : booking.status === 'CANCELLED' ? 'var(--error-light)' : booking.status === 'COMPLETED' ? 'var(--primary-light)' : 'var(--bg)',
                    color: booking.status === 'CONFIRMED' ? '#047857' : booking.status === 'CANCELLED' ? 'var(--error)' : booking.status === 'COMPLETED' ? 'var(--primary)' : 'var(--text-muted)',
                    border: `1.5px solid ${booking.status === 'CONFIRMED' ? '#A7F3D0' : booking.status === 'CANCELLED' ? '#FECACA' : booking.status === 'COMPLETED' ? '#C3D9F8' : 'var(--border)'}`,
                    padding: '4px 11px', borderRadius: '20px', fontSize: '11.5px', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0,
                  }}>
                    {booking.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (activeNav === 'profile') {
      return (
        <div className="page-content tt-a0">
          {pwModalOpen && <ChangePasswordModal onClose={() => setPwModalOpen(false)} />}

          <div className="page-header">
            <div>
              <h1 className="page-title">Tutor Profile</h1>
              <p className="page-subtitle">Manage your tutoring profile and credentials.</p>
            </div>
          </div>

          {/* PROFILE HERO with gradient banner */}
          <div className="card" style={{ marginBottom: '22px', overflow: 'hidden' }}>
            <div style={{ height: '88px', background: 'linear-gradient(135deg,#2E71F0 0%,#1045B8 60%,#0B2F7E 100%)', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, opacity: .15, backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '20px 20px' }} />
            </div>

            <div style={{ padding: '0 26px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  {/* avatar — overlaps banner */}
                  <div className="photo-upload-wrapper" style={{ position: 'relative', marginTop: '-44px', border: '4px solid #fff', borderRadius: '50%', boxShadow: '0 4px 16px rgba(8,33,62,.15)', width: '88px', height: '88px', flexShrink: 0 }}>
                    {photoUploading && (
                      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,.50)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>⏳</div>
                    )}
                    <div onClick={() => photoInputRef.current?.click()} style={{ cursor: 'pointer' }}>
                      <Avatar initials={userInitials} size={80} photoUrl={profilePhoto} />
                      <div className="photo-upload-overlay"><span className="photo-camera-icon">📷</span></div>
                    </div>
                    <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary)', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>📷</div>
                    <input type="file" ref={photoInputRef} accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handlePhotoUploadWithSync} />
                  </div>

                  <div style={{ paddingTop: '10px' }}>
                    <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '19px', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.3px', marginBottom: '3px' }}>{displayName}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>{userEmail}</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '6px', padding: '3px 10px' }}>
                        {savedProfile.subject || 'Tutor'}
                      </span>
                      <span style={{
                        fontSize: '11px', fontWeight: 700, borderRadius: '6px', padding: '3px 10px',
                        background: approvalStatus === 'APPROVED' ? 'var(--success-light)' : approvalStatus === 'REJECTED' ? 'var(--error-light)' : 'var(--warning-light)',
                        color: approvalStatus === 'APPROVED' ? '#047857' : approvalStatus === 'REJECTED' ? 'var(--error)' : 'var(--warning)',
                        border: `1.5px solid ${approvalStatus === 'APPROVED' ? '#A7F3D0' : approvalStatus === 'REJECTED' ? '#FECACA' : '#FDE68A'}`,
                      }}>
                        {approvalStatus === 'APPROVED' ? '✓ Verified Tutor' : approvalStatus === 'REJECTED' ? '✕ Not Approved' : '⏳ Pending Approval'}
                      </span>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '5px', fontStyle: 'italic' }}>
                      {photoUploading ? '⏳ Uploading...' : 'Click your photo to update it'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '148px', paddingTop: '10px' }}>
                  <button className="btn-primary" onClick={() => {
                    setEditForm({ name: displayName, subject: savedProfile.subject, hourlyRate: savedProfile.hourlyRate });
                    setEditPhoto(profilePhoto);
                    setProfileSaveError('');
                    setEditProfileOpen(true);
                  }}>✏️ Edit Profile</button>
                  <button className="btn-ghost" onClick={() => setPwModalOpen(true)} style={{ justifyContent: 'center' }}>🔑 Change Password</button>
                </div>
              </div>
            </div>
          </div>

          {/* DETAILS */}
          <div className="two-col">
            <div className="card">
              <div className="card-header">
                <h2 className="section-title">
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>👤</div>
                  Profile Information
                </h2>
              </div>
              {[
                { label: 'Full Name',        value: displayName },
                { label: 'Email',            value: userEmail },
                { label: 'Subject',          value: savedProfile.subject || '—' },
                { label: 'Hourly Rate',      value: savedProfile.hourlyRate ? `₱${savedProfile.hourlyRate}/hr` : '—' },
                { label: 'Approval Status',  value: approvalStatus },
              ].map((row, i, arr) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--primary-light)' : 'none' }}>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-light)', fontWeight: 600 }}>{row.label}</span>
                  <span style={{ fontSize: '13px', color: 'var(--navy)', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{row.value}</span>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="section-title">
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>📊</div>
                  Session Statistics
                </h2>
              </div>
              <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-light)', fontSize: '13px' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>📭</div>No sessions yet.
              </div>
            </div>
          </div>

          {/* EDIT PROFILE MODAL */}
          {editProfileOpen && (
            <div className="modal-overlay" onClick={() => setEditProfileOpen(false)}>
              <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
                <div className="modal-header">
                  <h2 className="modal-title">✏️ Edit Tutor Profile</h2>
                  <button className="modal-close" onClick={() => setEditProfileOpen(false)}>✕</button>
                </div>
                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  {profileSaveError && (
                    <div style={{ padding: '10px 14px', background: 'var(--error-light)', border: '1.5px solid #FECACA', borderRadius: '10px', color: 'var(--error)', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      ⚠️ {profileSaveError}
                    </div>
                  )}
                  <div className="modal-field">
                    <label className="modal-label">Profile Photo</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div className="photo-preview" onClick={() => editPhotoRef.current?.click()} style={{ flexShrink: 0 }}>
                        {editPhoto ? <img src={editPhoto} alt="Preview" className="photo-preview-img" /> : <div className="photo-placeholder">📷<br/>Upload photo</div>}
                      </div>
                      <div>
                        <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '8px' }}>JPG, PNG, WebP · Max 5MB.</div>
                        <button type="button" className="btn-ghost" onClick={() => editPhotoRef.current?.click()} style={{ fontSize: '12px', padding: '6px 12px' }}>
                          📷 {editPhoto ? 'Change' : 'Upload'}
                        </button>
                      </div>
                      <input type="file" ref={editPhotoRef} accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleEditPhotoUpload} />
                    </div>
                  </div>
                  <div className="modal-field">
                    <label className="modal-label">Full Name <span style={{ color: 'var(--error)' }}>*</span></label>
                    <input className="modal-input" value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Enter your full name" disabled={profileSaving}
                      style={{ width: '100%', boxSizing: 'border-box' }} />
                  </div>
                  <div className="modal-field">
                    <label className="modal-label">Subject / Specialization</label>
                    <input className="modal-input" value={editForm.subject}
                      onChange={e => setEditForm({ ...editForm, subject: e.target.value })}
                      placeholder="e.g. Mathematics, Physics" disabled={profileSaving}
                      style={{ width: '100%', boxSizing: 'border-box' }} />
                  </div>
                  <div className="modal-field">
                    <label className="modal-label">Hourly Rate (₱)</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', fontSize: '13.5px', fontWeight: 700, color: 'var(--text-muted)' }}>₱</span>
                      <input className="modal-input" type="number" value={editForm.hourlyRate}
                        onChange={e => setEditForm({ ...editForm, hourlyRate: e.target.value })}
                        placeholder="e.g. 250" min="50" max="2000" disabled={profileSaving}
                        style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '28px' }} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn-ghost" onClick={() => setEditProfileOpen(false)} disabled={profileSaving}>Cancel</button>
                  <button className="btn-primary" onClick={handleEditSaveWithSync}
                    disabled={profileSaving || !editForm.name?.trim()} style={{ opacity: profileSaving ? 0.7 : 1 }}>
                    {profileSaving ? '⏳ Saving...' : '✅ Save Changes'}
                  </button>
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
      {logoutConfirmOpen && (
        <div className="modal-overlay" onClick={() => setLogoutConfirmOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="modal-title">🚪 Confirm Logout</h2>
              <button className="modal-close" onClick={() => setLogoutConfirmOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: '1.65', fontSize: '14px' }}>Are you sure you want to logout? You'll need to sign in again to access your account.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setLogoutConfirmOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleLogout} style={{ background: 'linear-gradient(135deg,#DC2626,#B91C1C)', boxShadow: '0 4px 14px rgba(220,38,38,.28)' }}>🚪 Logout</button>
            </div>
          </div>
        </div>
      )}

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
              🔔{unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
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
            <div className="user-meta"><div className="user-name">{displayName}</div></div>
            <Avatar initials={userInitials} size={36} photoUrl={profilePhoto} />
          </div>
        </div>
      </header>

      <div className="dashboard-body">
        <aside className="sidebar">
          {navItems.map(item => (
            <button key={item.id} className={`nav-item ${activeNav === item.id ? 'active' : ''}`} onClick={() => handleNavClick(item.id)}>
              <span className="nav-icon">{item.icon}</span>{item.label}
            </button>
          ))}
          <div className="sidebar-spacer" />
          <button className="nav-item nav-logout" onClick={() => setLogoutConfirmOpen(true)}>
            <span className="nav-icon">🚪</span>Log Out
          </button>
        </aside>
        <main className="dashboard-main">{renderContent()}</main>
      </div>
    </div>
  );
}

export default TutorDashboard;