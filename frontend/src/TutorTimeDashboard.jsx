import { useState, useRef, useEffect } from 'react';
import './TutorTimeDashboard.css';

const mockData = {
  stats: [
    { label: 'Sessions Booked', value: 12, delta: '+3 this week', icon: '📅', colorClass: 'stat-blue' },
    { label: 'Hours Learned', value: '18h', delta: '+4h this week', icon: '⏱️', colorClass: 'stat-green' },
    { label: 'Tutors Contacted', value: 5, delta: '2 new', icon: '👥', colorClass: 'stat-amber' },
    { label: 'Upcoming Sessions', value: 3, delta: 'Next: Today 3PM', icon: '🔔', colorClass: 'stat-purple' },
  ],
  upcomingBookings: [
    { id: 1, tutor: 'Dr. Sarah Chen', subject: 'Advanced Mathematics', date: 'Today', time: '3:00 PM', location: 'Library Room 2B', status: 'CONFIRMED', avatar: 'SC' },
    { id: 2, tutor: 'Marcus Williams', subject: 'Computer Science', date: 'Tomorrow', time: '10:00 AM', location: 'CS Lab 101', status: 'CONFIRMED', avatar: 'MW' },
    { id: 3, tutor: 'Elena Rodriguez', subject: 'Economics', date: 'Mar 8', time: '2:00 PM', location: 'Study Hall A', status: 'CONFIRMED', avatar: 'ER' },
  ],
  pastBookings: [
    { id: 4, tutor: 'James Foster', subject: 'Physics', date: 'Mar 1', time: '11:00 AM', location: 'Science Bldg 3F', status: 'COMPLETED', avatar: 'JF' },
    { id: 5, tutor: 'Dr. Sarah Chen', subject: 'Advanced Mathematics', date: 'Feb 26', time: '9:00 AM', location: 'Library Room 2B', status: 'COMPLETED', avatar: 'SC' },
    { id: 6, tutor: 'Marcus Williams', subject: 'Computer Science', date: 'Feb 22', time: '1:00 PM', location: 'CS Lab 101', status: 'CANCELLED', avatar: 'MW' },
  ],
  featuredTutors: [
    {
      id: 1, name: 'Dr. Sarah Chen', subject: 'Advanced Mathematics', rating: 4.9, sessions: 84,
      avatar: 'SC', verified: true, tags: ['Calculus', 'Linear Algebra', 'Statistics'],
      bio: 'PhD in Applied Mathematics from NUS. Passionate about making complex concepts intuitive and accessible to all students. I specialize in helping students overcome math anxiety.',
      availability: ['Mon 2–5 PM', 'Wed 10 AM–1 PM', 'Fri 3–6 PM'],
      rate: '₱250/hr', location: 'Library Room 2B', responseTime: '< 1 hour',
      reviews: [
        { name: 'Maria S.', text: 'Sarah helped me go from failing to top of my Calculus class in 3 weeks!', rating: 5 },
        { name: 'John R.', text: 'Very patient and explains everything step by step. Highly recommend!', rating: 5 },
      ]
    },
    {
      id: 2, name: 'Marcus Williams', subject: 'Computer Science', rating: 4.8, sessions: 61,
      avatar: 'MW', verified: true, tags: ['Data Structures', 'Algorithms', 'Python'],
      bio: 'Senior CS student with internship experience at top tech companies. I make DSA and system design click for students at every level.',
      availability: ['Tue 1–4 PM', 'Thu 2–5 PM', 'Sat 9 AM–12 PM'],
      rate: '₱220/hr', location: 'CS Lab 101', responseTime: '< 2 hours',
      reviews: [
        { name: 'Ana L.', text: 'Marcus explains algorithms so clearly. Aced my technical interviews!', rating: 5 },
        { name: 'Ben K.', text: 'Great tutor, very knowledgeable and always on time.', rating: 4 },
      ]
    },
    {
      id: 3, name: 'Elena Rodriguez', subject: 'Economics', rating: 4.7, sessions: 45,
      avatar: 'ER', verified: true, tags: ['Microeconomics', 'Statistics', 'Finance'],
      bio: 'Economics honors student with a passion for connecting theory to real-world applications. I use case studies and current events to make economics come alive.',
      availability: ['Mon 9 AM–12 PM', 'Wed 3–6 PM', 'Fri 10 AM–1 PM'],
      rate: '₱200/hr', location: 'Study Hall A', responseTime: '< 3 hours',
      reviews: [
        { name: 'Claire M.', text: 'Elena makes micro so much clearer than my professor. Worth every peso!', rating: 5 },
        { name: 'David P.', text: 'Super organized and thorough. My grades improved significantly.', rating: 5 },
      ]
    },
    {
      id: 4, name: 'James Foster', subject: 'Physics', rating: 4.9, sessions: 72,
      avatar: 'JF', verified: true, tags: ['Mechanics', 'Thermodynamics', 'Quantum'],
      bio: 'Physics graduate student specializing in quantum mechanics. I break down the most daunting physics problems into manageable steps using visual diagrams and real examples.',
      availability: ['Tue 10 AM–1 PM', 'Thu 3–6 PM', 'Sun 2–5 PM'],
      rate: '₱240/hr', location: 'Science Bldg 3F', responseTime: '< 1 hour',
      reviews: [
        { name: 'Sophie T.', text: "James is phenomenal. Finally understood quantum after one session!", rating: 5 },
        { name: 'Leo B.', text: 'Patient, smart, and great at drawing diagrams. 10/10!', rating: 5 },
      ]
    },
  ],
  notifications: [
    { id: 1, text: 'Dr. Sarah Chen confirmed your session for Today 3:00 PM', time: '5m ago', read: false },
    { id: 2, text: 'Reminder: Session with Marcus Williams tomorrow at 10:00 AM', time: '1h ago', read: false },
    { id: 3, text: 'Your booking BK-2026-0011 has been confirmed', time: '3h ago', read: true },
    { id: 4, text: 'New tutor in Mathematics department is now available', time: '1d ago', read: true },
  ],
};

function getFirstName(fullName) {
  if (!fullName) return 'there';
  return fullName.split(' ')[0];
}

function getInitials(fullName) {
  if (!fullName) return '?';
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Avatar({ initials, size = 40, photoUrl }) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt="avatar"
        className="avatar"
        style={{ width: size, height: size, objectFit: 'cover' }}
      />
    );
  }
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.35 }}>
      {initials}
    </div>
  );
}

function Badge({ status }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>;
}

export default function TutorTimeDashboard({ user, onLogout }) {
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

  // Edit Profile modal
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    department: 'Computer Science',
    yearLevel: 'Junior (Year 3)',
  });
  const [savedProfile, setSavedProfile] = useState({
    name: user?.name || '',
    department: 'Computer Science',
    yearLevel: 'Junior (Year 3)',
  });

  // Photo upload
  const [profilePhoto, setProfilePhoto] = useState(null);
  const photoInputRef = useRef(null);

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

  const displayName = savedProfile.name || user?.name || 'User';
  const userRole = user?.role || localStorage.getItem('userRole') || 'Student';
  const userEmail = user?.email || '';
  const userInitials = getInitials(displayName);
  const firstName = getFirstName(displayName);
  const unreadCount = mockData.notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // ── Helper: normalize backend tutor → UI shape ───────────────────
  const normalizeTutor = (t) => ({
    ...t,
    avatar: t.avatarInitials || getInitials(t.name),
    tags: Array.isArray(t.tags) ? t.tags : (t.tags ? t.tags.split(',').map(s => s.trim()) : []),
    availability: Array.isArray(t.availability) ? t.availability : (t.availability ? t.availability.split(',').map(s => s.trim()) : []),
    reviews: Array.isArray(t.reviews) ? t.reviews : [],
    verified: true,
  });

  // ── Helper: normalize backend booking → UI shape ─────────────────
  const normalizeBooking = (b) => ({
    ...b,
    tutor: b.tutorName,
    avatar: b.avatarInitials || getInitials(b.tutorName || ''),
    date: b.date ? new Date(b.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
  });

  // ── Fetch tutors on mount ─────────────────────────────────────────
  useEffect(() => {
    fetch('http://localhost:8080/api/tutors')
      .then(r => r.json())
      .then(data => {
        setTutors(Array.isArray(data) ? data.map(normalizeTutor) : []);
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

  const handleEditSave = () => {
    setSavedProfile({ ...editForm });
    setEditProfileOpen(false);
  };

  const handleBookSession = (tutor) => {
    setBookingTutor(tutor);
    setBookForm({ date: '', time: '', notes: '' });
    setBookSuccess(false);
    setBookModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!bookForm.date || !bookForm.time) return;
    const token = localStorage.getItem('token');
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
      setUpcomingBookings(prev => [normalizeBooking(created), ...prev]);
      setBookSuccess(true);
    } catch {
      alert('Failed to book session. Please try again.');
    }
  };

  const handleCancelBooking = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8080/api/bookings/${id}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed');
      setUpcomingBookings(prev =>
        prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b)
      );
    } catch {
      alert('Failed to cancel booking. Please try again.');
    }
    setCancelConfirmId(null);
  };


  const renderDashboard = () => (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Good afternoon, {firstName} 👋</h1>
            <p className="page-subtitle">Here's what's happening with your sessions today.</p>
          </div>
          <button className="btn-primary" onClick={() => handleNavClick('tutors')}>+ Book a Session</button>
        </div>
      </div>

      <div className="stats-grid">
        {mockData.stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className={`stat-icon ${s.colorClass}`}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-delta">{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <h2 className="section-title">Upcoming Sessions</h2>
            <button className="btn-ghost" onClick={() => handleNavClick('bookings')}>View All</button>
          </div>
          {upcomingBookings.slice(0, 3).map((b, i) => (
            <div key={b.id} className={`booking-row ${i === Math.min(upcomingBookings.length, 3) - 1 ? 'no-border' : ''}`}>
              <Avatar initials={b.avatar} size={40} />
              <div className="booking-info">
                <div className="booking-name">{b.tutor}</div>
                <div className="booking-meta">{b.subject} · {b.date}, {b.time}</div>
                <div className="booking-location">📍 {b.location}</div>
              </div>
              <Badge status={b.status} />
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="section-title">Recommended Tutors</h2>
            <button className="btn-ghost" onClick={() => handleNavClick('tutors')}>Browse All</button>
          </div>
          <div className="tutor-mini-grid">
            {tutors.slice(0, 4).map(t => (
              <div key={t.id} className="tutor-mini-card" onClick={() => handleViewProfile(t)}>
                <div className="tutor-mini-top">
                  <Avatar initials={t.avatar} size={36} />
                  <div>
                    <div className="tutor-mini-name">
                      {t.name} {t.verified && <span className="verified-check">✓</span>}
                    </div>
                    <div className="tutor-mini-subject">{t.subject}</div>
                  </div>
                </div>
                <div className="tutor-rating">⭐ {t.rating} <span className="rating-sessions">· {t.sessions} sessions</span></div>
                <div className="tag-row">
                  {t.tags.slice(0, 2).map(tag => <span key={tag} className="tag">{tag}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title" style={{ marginBottom: 16 }}>Recent Activity</h2>
        {mockData.notifications.map((n, i) => (
          <div key={n.id} className={`activity-row ${i === mockData.notifications.length - 1 ? 'no-border' : ''}`}>
            <div className={`activity-dot ${n.read ? '' : 'unread'}`} />
            <div>
              <div className="activity-text">{n.text}</div>
              <div className="activity-time">{n.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── TUTOR PROFILE PAGE ────────────────────────────────────────────
  const renderTutorProfile = () => {
    const t = selectedTutor;
    if (!t) return null;
    return (
      <div className="page-content">
        <button className="back-btn" onClick={() => setTutorView('list')}>
          ← Back to Tutors
        </button>

        <div className="tutor-profile-hero card">
          <div className="tutor-profile-hero-inner">
            <Avatar initials={t.avatar} size={90} />
            <div className="tutor-profile-info">
              <div className="tutor-profile-name">
                {t.name}
                {t.verified && <span className="verified-pill">✓ Verified</span>}
              </div>
              <div className="tutor-profile-subject">{t.subject.toUpperCase()}</div>
              <div className="tutor-rating" style={{ marginTop: 6 }}>
                ⭐ {t.rating} <span className="rating-sessions">({t.sessions} sessions)</span>
              </div>
              <div className="tag-row" style={{ marginTop: 10 }}>
                {t.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
              </div>
            </div>
            <div className="tutor-profile-meta-right">
              <div className="tutor-meta-item"><span>💰</span> {t.rate}</div>
              <div className="tutor-meta-item"><span>📍</span> {t.location}</div>
              <div className="tutor-meta-item"><span>⚡</span> Replies {t.responseTime}</div>
            </div>
          </div>
          <div className="tutor-profile-actions">
            <button className="btn-primary" onClick={() => handleContactTutor(t)}>
              💬 Contact Tutor
            </button>
            <button className="btn-ghost" onClick={() => handleBookSession(t)}>📅 Book Session</button>
          </div>
        </div>

        <div className="two-col" style={{ marginTop: 24 }}>
          <div className="card">
            <h2 className="section-title" style={{ marginBottom: 14 }}>About</h2>
            <p className="tutor-bio">{t.bio}</p>

            <h2 className="section-title" style={{ margin: '20px 0 12px' }}>Availability</h2>
            <div className="availability-grid">
              {t.availability.map((slot, i) => (
                <div key={i} className="availability-slot">
                  <span className="avail-dot" />
                  {slot}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="section-title" style={{ marginBottom: 14 }}>Student Reviews</h2>
            {t.reviews.map((r, i) => (
              <div key={i} className={`review-item ${i < t.reviews.length - 1 ? 'review-border' : ''}`}>
                <div className="review-header">
                  <div className="review-avatar">
                    {r.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="review-name">{r.name}</div>
                    <div className="review-stars">{'⭐'.repeat(r.rating)}</div>
                  </div>
                </div>
                <p className="review-text">"{r.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ── CONTACT TUTOR (CHAT) PAGE ────────────────────────────────────
  const renderContactTutor = () => {
    const t = selectedTutor;
    if (!t) return null;
    return (
      <div className="page-content chat-page">
        <button className="back-btn" onClick={() => setTutorView('profile')}>
          ← Back to Profile
        </button>

        <div className="chat-wrapper card">
          {/* Chat Header */}
          <div className="chat-header">
            <Avatar initials={t.avatar} size={44} />
            <div className="chat-header-info">
              <div className="chat-tutor-name">
                {t.name}
                {t.verified && <span className="verified-check">✓</span>}
              </div>
              <div className="chat-tutor-sub">{t.subject} · Replies {t.responseTime}</div>
            </div>
            <span className="chat-online-dot" />
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {chatMessages.map(msg => (
              <div key={msg.id} className={`chat-bubble-row ${msg.sender === 'user' ? 'user-row' : 'tutor-row'}`}>
                {msg.sender === 'tutor' && (
                  <Avatar initials={t.avatar} size={30} />
                )}
                <div className={`chat-bubble ${msg.sender === 'user' ? 'bubble-user' : 'bubble-tutor'}`}>
                  {msg.text}
                  <span className="bubble-time">{msg.time}</span>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-bar">
            <input
              className="chat-input"
              placeholder={`Message ${t.name.split(' ')[0]}...`}
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            />
            <button className="chat-send-btn" onClick={handleSendMessage} disabled={!chatInput.trim()}>
              ➤
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── FIND TUTORS PAGE ─────────────────────────────────────────────
  const renderTutors = () => {
    if (tutorView === 'profile') return renderTutorProfile();
    if (tutorView === 'contact') return renderContactTutor();

    const filtered = tutors.filter(t =>
      !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Find Your Academic Partner</h1>
          <p className="page-subtitle">Search through our verified directory of student tutors and book face-to-face sessions on campus today.</p>
        </div>

        <div className="search-bar-full">
          <span className="search-icon">🔍</span>
          <input
            className="search-input-full"
            placeholder="What subject do you need help with? (e.g. Calculus, Physics, Psychology...)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="tutor-grid">
          {tutorsLoading ? (
            <div className="empty-state">Loading tutors...</div>
          ) : filtered.length === 0 && searchQuery ? (
            <div className="empty-state">No tutors found for "{searchQuery}"</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">No tutors available yet.</div>
          ) : filtered.map(t => (
            <div key={t.id} className="tutor-card">
              <div className="tutor-card-inner">
                <Avatar initials={t.avatar} size={56} />
                <div className="tutor-card-body">
                  <div className="tutor-card-top-row">
                    <div>
                      <div className="tutor-card-name">
                        {t.name} {t.verified && <span className="verified-check">✓</span>}
                      </div>
                      <div className="tutor-card-subject">{t.subject.toUpperCase()}</div>
                    </div>
                    <div className="tutor-card-rating">
                      <div className="rating-value">⭐ {t.rating}</div>
                      <div className="rating-count">{t.sessions} sessions</div>
                    </div>
                  </div>
                  <div className="tag-row" style={{ marginTop: 10 }}>
                    {t.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                  </div>
                  <div className="tutor-card-actions">
                    <button className="btn-primary" onClick={() => handleViewProfile(t)}>View Profile</button>
                    <button className="btn-ghost" onClick={() => handleContactTutor(t)}>Contact Tutor</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── MY BOOKINGS PAGE ─────────────────────────────────────────────
  const renderBookings = () => {
    const list = bookingTab === 'upcoming' ? upcomingBookings : pastBookings;
    return (
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <h1 className="page-title">My Bookings</h1>
              <p className="page-subtitle">Track and manage all your tutoring sessions.</p>
            </div>
            <button className="btn-primary" onClick={() => handleNavClick('tutors')}>+ Book a Session</button>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab ${bookingTab === 'upcoming' ? 'active' : ''}`} onClick={() => setBookingTab('upcoming')}>
            Upcoming ({upcomingBookings.filter(b => b.status !== 'CANCELLED').length})
          </button>
          <button className={`tab ${bookingTab === 'past' ? 'active' : ''}`} onClick={() => setBookingTab('past')}>
            Past Sessions ({pastBookings.length})
          </button>
        </div>

        <div className="bookings-list">
          {bookingsLoading ? (
            <div className="empty-state" style={{ gridColumn: 'unset' }}>Loading bookings...</div>
          ) : list.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: 'unset' }}>
              No sessions yet. <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 700 }} onClick={() => handleNavClick('tutors')}>Find a tutor →</span>
            </div>
          ) : null}
          {list.map(b => (
            <div key={b.id} className="booking-card">
              <Avatar initials={b.avatar} size={50} />
              <div className="booking-card-info">
                <div className="booking-card-name">{b.tutor}</div>
                <div className="booking-card-subject">{b.subject}</div>
                <div className="booking-card-meta">
                  <span>📅 {b.date}, {b.time}</span>
                  <span>📍 {b.location}</span>
                </div>
                {b.notes && <div className="booking-notes">📝 {b.notes}</div>}
              </div>
              <div className="booking-card-right">
                <Badge status={b.status} />
                {bookingTab === 'upcoming' && b.status !== 'CANCELLED' && (
                  cancelConfirmId === b.id ? (
                    <div className="cancel-confirm">
                      <span className="cancel-confirm-text">Cancel this session?</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-cancel" onClick={() => handleCancelBooking(b.id)}>Yes</button>
                        <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setCancelConfirmId(null)}>No</button>
                      </div>
                    </div>
                  ) : (
                    <button className="btn-cancel" onClick={() => setCancelConfirmId(b.id)}>Cancel</button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── BOOK SESSION MODAL ───────────────────────────────────────────
  const renderBookModal = () => {
    if (!bookingTutor) return null;
    return (
      <div className="modal-overlay" onClick={() => { setBookModalOpen(false); setBookSuccess(false); }}>
        <div className="modal-box" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">
              {bookSuccess ? '🎉 Session Booked!' : 'Book a Session'}
            </h2>
            <button className="modal-close" onClick={() => { setBookModalOpen(false); setBookSuccess(false); }}>✕</button>
          </div>

          {bookSuccess ? (
            <div className="book-success">
              <div className="book-success-icon">📅</div>
              <p className="book-success-title">You're all set!</p>
              <p className="book-success-sub">
                Your session with <strong>{bookingTutor.name}</strong> on{' '}
                <strong>{new Date(bookForm.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</strong>{' '}
                at <strong>{bookForm.time}</strong> has been confirmed.
              </p>
              <div className="book-success-detail">📍 {bookingTutor.location}</div>
              <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
                <button className="btn-ghost" onClick={() => { setBookModalOpen(false); setBookSuccess(false); }}>
                  Close
                </button>
                <button className="btn-primary" onClick={() => { setBookModalOpen(false); setBookSuccess(false); handleNavClick('bookings'); }}>
                  View My Bookings →
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="modal-body">
                {/* Tutor summary */}
                <div className="book-tutor-summary">
                  <Avatar initials={bookingTutor.avatar} size={44} />
                  <div>
                    <div className="book-tutor-name">{bookingTutor.name}</div>
                    <div className="book-tutor-subject">{bookingTutor.subject} · {bookingTutor.rate}</div>
                  </div>
                </div>

                <div className="modal-field">
                  <label className="modal-label">Date <span className="required">*</span></label>
                  <input
                    className="modal-input"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookForm.date}
                    onChange={e => setBookForm({ ...bookForm, date: e.target.value })}
                  />
                </div>

                <div className="modal-field">
                  <label className="modal-label">Time <span className="required">*</span></label>
                  <select
                    className="modal-input"
                    value={bookForm.time}
                    onChange={e => setBookForm({ ...bookForm, time: e.target.value })}
                  >
                    <option value="">Select a time slot</option>
                    <option>8:00 AM</option>
                    <option>9:00 AM</option>
                    <option>10:00 AM</option>
                    <option>11:00 AM</option>
                    <option>1:00 PM</option>
                    <option>2:00 PM</option>
                    <option>3:00 PM</option>
                    <option>4:00 PM</option>
                    <option>5:00 PM</option>
                    <option>6:00 PM</option>
                  </select>
                </div>

                <div className="modal-field">
                  <label className="modal-label">Location</label>
                  <input
                    className="modal-input"
                    value={bookingTutor.location}
                    readOnly
                    style={{ color: 'var(--text-muted)', cursor: 'not-allowed' }}
                  />
                </div>

                <div className="modal-field">
                  <label className="modal-label">Notes <span className="optional">(optional)</span></label>
                  <textarea
                    className="modal-input modal-textarea"
                    placeholder="Topics you'd like to cover, questions to prepare, etc."
                    value={bookForm.notes}
                    onChange={e => setBookForm({ ...bookForm, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-ghost" onClick={() => setBookModalOpen(false)}>Cancel</button>
                <button
                  className="btn-primary"
                  onClick={handleConfirmBooking}
                  disabled={!bookForm.date || !bookForm.time}
                  style={{ opacity: (!bookForm.date || !bookForm.time) ? 0.5 : 1 }}
                >
                  Confirm Booking
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // ── EDIT PROFILE MODAL ───────────────────────────────────────────
  const renderEditModal = () => (
    <div className="modal-overlay" onClick={() => setEditProfileOpen(false)}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Profile</h2>
          <button className="modal-close" onClick={() => setEditProfileOpen(false)}>✕</button>
        </div>

        <div className="modal-body">
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
            <label className="modal-label">Department</label>
            <input
              className="modal-input"
              value={editForm.department}
              onChange={e => setEditForm({ ...editForm, department: e.target.value })}
              placeholder="e.g. Computer Science"
            />
          </div>
          <div className="modal-field">
            <label className="modal-label">Year Level</label>
            <select
              className="modal-input"
              value={editForm.yearLevel}
              onChange={e => setEditForm({ ...editForm, yearLevel: e.target.value })}
            >
              <option>Freshman (Year 1)</option>
              <option>Sophomore (Year 2)</option>
              <option>Junior (Year 3)</option>
              <option>Senior (Year 4)</option>
              <option>Graduate Student</option>
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-ghost" onClick={() => setEditProfileOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleEditSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );

  // ── PROFILE PAGE ─────────────────────────────────────────────────
  const renderProfile = () => (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account and preferences.</p>
      </div>

      <div className="card profile-hero">
        {/* Photo with upload overlay */}
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
            <span className="tag">{userRole.toUpperCase()}</span>
            <span className="badge-verified">✓ ID Verified</span>
          </div>
          <p className="photo-hint">Click your photo to update it</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditForm({ name: displayName, department: savedProfile.department, yearLevel: savedProfile.yearLevel }); setEditProfileOpen(true); }}>
          ✏️ Edit Profile
        </button>
      </div>

      <div className="two-col">
        <div className="card">
          <h2 className="section-title" style={{ marginBottom: 16 }}>Account Details</h2>
          {[
            { label: 'Full Name', value: displayName },
            { label: 'University Email', value: userEmail },
            { label: 'Role', value: userRole },
            { label: 'Department', value: savedProfile.department },
            { label: 'Year Level', value: savedProfile.yearLevel },
          ].map(row => (
            <div key={row.label} className="detail-row">
              <span className="detail-label">{row.label}</span>
              <span className="detail-value">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="section-title" style={{ marginBottom: 16 }}>Session Statistics</h2>
          {[
            { label: 'Total Sessions Booked', value: '12' },
            { label: 'Sessions Completed', value: '9' },
            { label: 'Sessions Cancelled', value: '1' },
            { label: 'Total Hours Learned', value: '18 hrs' },
            { label: 'Favourite Subject', value: 'Mathematics' },
          ].map(row => (
            <div key={row.label} className="detail-row">
              <span className="detail-label">{row.label}</span>
              <span className="detail-value">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (activeNav === 'dashboard') return renderDashboard();
    if (activeNav === 'tutors') return renderTutors();
    if (activeNav === 'bookings') return renderBookings();
    if (activeNav === 'profile') return renderProfile();
  };

  return (
    <div className="dashboard-root">
      {/* EDIT PROFILE MODAL */}
      {editProfileOpen && renderEditModal()}

      {/* BOOK SESSION MODAL */}
      {bookModalOpen && renderBookModal()}

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
                {mockData.notifications.map(n => (
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
              <div className="user-role">{userRole.toUpperCase()}</div>
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
          <button className="nav-item nav-logout" onClick={onLogout}>
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