import { useState, useEffect } from 'react';
import './TutorTimeDashboard.css';

import { getInitials } from './utils/helpers';
import { Avatar } from './components/Avatar';

// ════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ════════════════════════════════════════════════════════════════════
function AdminDashboard() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications] = useState([]);

  // Logout confirmation
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  // Tutor verification
  const [pendingTutors, setPendingTutors] = useState([]);
  const [verifiedTutors, setVerifiedTutors] = useState([]);
  const [tutorsLoading, setTutorsLoading] = useState(true);
  const [tutorsError, setTutorsError] = useState('');
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [tutorDetailModalOpen, setTutorDetailModalOpen] = useState(false);

  // Subjects management
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [newSubjectModal, setNewSubjectModal] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', description: '' });

  // System logs
  const [systemLogs, setSystemLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);

  const displayName = localStorage.getItem('userName') || 'Admin';
  const userInitials = getInitials(displayName);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getTutorId = (tutor) => tutor?.tutorId ?? tutor?.id;

  const extractTutorList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.pendingTutors)) return payload.pendingTutors;
    if (Array.isArray(payload?.tutors)) return payload.tutors;
    return [];
  };

  // ── Fetch pending tutor verification requests ──────────────────────
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) { setTutorsLoading(false); return; }

    const fetchPendingTutors = () => {
      fetch('/api/admin/tutor-requests', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (r) => {
          const data = await r.json().catch(() => ({}));
          if (!r.ok || data.success === false) {
            throw new Error(data.message || `Failed to fetch pending tutor requests (${r.status})`);
          }
          return data;
        })
        .then(data => {
          setTutorsError('');
          setPendingTutors(extractTutorList(data));
          setTutorsLoading(false);
        })
        .catch((error) => {
          setTutorsError(error.message || 'Failed to fetch pending tutor requests');
          setTutorsLoading(false);
        });
    };

    fetchPendingTutors();
    const interval = setInterval(fetchPendingTutors, 5000);
    return () => clearInterval(interval);
  }, []);

  // ── Fetch verified tutors ─────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const fetchVerifiedTutors = () => {
      fetch('/api/admin/tutors/verified', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (r) => {
          const data = await r.json().catch(() => []);
          if (!r.ok) {
            throw new Error(`Failed to fetch verified tutors (${r.status})`);
          }
          return data;
        })
        .then(data => {
          // Handle both raw array and wrapped response
          const tutorsList = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
          setVerifiedTutors(tutorsList);
        })
        .catch((error) => {
          console.error('Failed to fetch verified tutors:', error);
          setVerifiedTutors([]);
        });
    };

    fetchVerifiedTutors();
    const interval = setInterval(fetchVerifiedTutors, 5000);
    return () => clearInterval(interval);
  }, []);

  // ── Fetch subjects ────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) { setSubjectsLoading(false); return; }

    const fetchSubjects = () => {
      fetch('/api/subjects', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => {
          setSubjects(Array.isArray(data.data) ? data.data : []);
          setSubjectsLoading(false);
        })
        .catch((error) => {
          console.error('Failed to fetch subjects:', error);
          setSubjectsLoading(false);
        });
    };

    fetchSubjects();
    const interval = setInterval(fetchSubjects, 5000);
    return () => clearInterval(interval);
  }, []);

  // ── Fetch system logs ─────────────────────────────────────────────
  // TODO: Implement system logs fetching when backend endpoint is ready
  useEffect(() => {
    // For now, set empty logs and mark as loaded
    setSystemLogs([]);
    setLogsLoading(false);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
    { id: 'tutors', label: 'Tutors', icon: '👨‍🏫' },
    { id: 'subjects', label: 'Subjects', icon: '📚' },
    { id: 'logs', label: 'System Logs', icon: '📋' },
  ];

  const handleNavClick = (id) => {
    setActiveNav(id);
    setNotifOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    window.location.href = '/';
  };

  const handleLogoutClick = () => {
    setLogoutConfirmOpen(true);
  };

  const handleViewTutorDetails = (tutor) => {
    setSelectedTutor(tutor);
    setTutorDetailModalOpen(true);
  };

  const handleApproveTutor = async (tutorId) => {
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`/api/admin/tutor/${tutorId}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const approved = pendingTutors.find(t => getTutorId(t) === tutorId);
        setPendingTutors(prev => prev.filter(t => getTutorId(t) !== tutorId));
        if (approved) {
          setVerifiedTutors(prev => [...prev, { ...approved, approvalStatus: 'APPROVED' }]);
        }
        alert('✅ Tutor approved successfully!');
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to approve tutor. Please try again.');
    }
  };

  const handleRejectTutor = async (tutorId) => {
    const reason = prompt('Enter reason for rejection:');
    if (!reason) return;

    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`/api/admin/tutor/${tutorId}/reject`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (data.success) {
        setPendingTutors(prev => prev.filter(t => getTutorId(t) !== tutorId));
        alert('❌ Tutor rejected.');
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to reject tutor. Please try again.');
    }
  };

  const handleAddSubject = async () => {
    if (!newSubject.name) {
      alert('Subject name is required');
      return;
    }
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSubject),
      });
      const data = await res.json();
      if (data.success) {
        setSubjects(prev => [data.data, ...prev]);
        setNewSubjectModal(false);
        setNewSubject({ name: '', description: '' });
        alert('✅ Subject added successfully!');
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to add subject. Please try again.');
    }
  };

  const renderContent = () => {
    if (activeNav === 'dashboard') {
      const statCards = [
        { value: pendingTutors.length,  label: 'Pending Verifications', icon: '⏳', bg: 'linear-gradient(140deg,#2E71F0,#1045B8)', iconBg: 'rgba(255,255,255,.20)', valColor: '#fff', lblColor: 'rgba(255,255,255,.75)', border: 'transparent' },
        { value: verifiedTutors.length, label: 'Verified Tutors',       icon: '✓',  bg: '#fff', iconBg: 'var(--success-light)', valColor: 'var(--navy)', lblColor: 'var(--text-muted)', border: 'var(--border)' },
        { value: subjects.length,       label: 'Academic Subjects',     icon: '📚', bg: '#fff', iconBg: 'var(--purple-light)',  valColor: 'var(--navy)', lblColor: 'var(--text-muted)', border: 'var(--border)' },
        { value: systemLogs.length,     label: 'System Events',         icon: '📋', bg: '#fff', iconBg: 'var(--warning-light)', valColor: 'var(--navy)', lblColor: 'var(--text-muted)', border: '#FDE68A' },
      ];
      return (
        <div className="page-content tt-a0">
          <div className="page-header">
            <div>
              <h1 className="page-title">Admin Dashboard 🛡️</h1>
              <p className="page-subtitle">System management and monitoring overview.</p>
            </div>
          </div>

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            {statCards.map((s, i) => (
              <div key={i} className="stat-card" style={{ background: s.bg, borderColor: s.border, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-26px', right: '-26px', width: '95px', height: '95px', borderRadius: '50%', background: i === 0 ? 'rgba(255,255,255,.09)' : 'rgba(21,88,214,.05)', pointerEvents: 'none' }} />
                <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '14px' }}>{s.icon}</div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '30px', fontWeight: 800, color: s.valColor, lineHeight: 1, letterSpacing: '-0.5px', marginBottom: '5px' }}>{s.value}</div>
                <div style={{ fontSize: '12.5px', fontWeight: 500, color: s.lblColor }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div className="two-col">
            {/* Recent Activities */}
            <div className="card">
              <div className="card-header">
                <h2 className="section-title">
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>📋</div>
                  Recent Activities
                </h2>
              </div>
              {systemLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-light)', fontSize: '13px' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>📭</div>No activity logs
                </div>
              ) : (
                systemLogs.slice(0, 5).map((log, idx) => (
                  <div key={idx} style={{ paddingBottom: '12px', borderBottom: '1px solid var(--primary-light)', fontSize: '13px', marginBottom: '12px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{log.action}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '11.5px', marginTop: '3px' }}>{log.timestamp}</div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h2 className="section-title">
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>⚡</div>
                  Quick Actions
                </h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button className="btn-primary" onClick={() => setActiveNav('tutors')} style={{ width: '100%', justifyContent: 'center' }}>
                  👨‍🏫 Review Pending Tutors
                  {pendingTutors.length > 0 && <span style={{ background: 'rgba(255,255,255,.25)', borderRadius: '20px', padding: '1px 8px', fontSize: '12px', marginLeft: '4px' }}>{pendingTutors.length}</span>}
                </button>
                <button className="btn-primary" onClick={() => setActiveNav('subjects')} style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', boxShadow: '0 4px 14px rgba(124,58,237,.28)' }}>
                  📚 Manage Subjects
                </button>
                <button className="btn-primary" onClick={() => setActiveNav('logs')} style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg,#D97706,#B45309)', boxShadow: '0 4px 14px rgba(217,119,6,.28)' }}>
                  📋 View All Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeNav === 'tutors') {
      return (
        <div className="page-content tt-a0">
          <div className="page-header">
            <div>
              <h1 className="page-title">Tutor Management</h1>
              <p className="page-subtitle">Verify and manage tutors in the system.</p>
            </div>
          </div>

          {/* Pending Verifications */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <h2 className="section-title">
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--warning-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>⏳</div>
                Pending Verifications
                {pendingTutors.length > 0 && (
                  <span style={{ background: 'var(--warning-light)', color: 'var(--warning)', border: '1.5px solid #FDE68A', borderRadius: '20px', padding: '2px 10px', fontSize: '12px', fontWeight: 700 }}>
                    {pendingTutors.length}
                  </span>
                )}
              </h2>
            </div>

            {tutorsError && (
              <div style={{ marginBottom: '16px', padding: '11px 14px', borderRadius: '10px', background: 'var(--error-light)', color: 'var(--error)', fontSize: '13px', fontWeight: 600, border: '1.5px solid #FECACA' }}>
                ⚠️ {tutorsError}
              </div>
            )}

            {tutorsLoading ? (
              <div style={{ textAlign: 'center', padding: '28px', color: 'var(--text-light)', fontSize: '13px' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>⏳</div>Loading tutors...
              </div>
            ) : pendingTutors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px', color: 'var(--text-light)', fontSize: '13px' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>✅</div>No pending verifications
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {pendingTutors.map(tutor => (
                  <div key={getTutorId(tutor) || tutor.email} style={{
                    padding: '14px 16px',
                    border: '1.5px solid var(--border)',
                    borderRadius: '12px',
                    borderLeft: '4px solid var(--warning)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--bg)',
                    gap: '12px',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, marginBottom: '3px', color: 'var(--navy)', fontSize: '14px' }}>👤 {tutor.name}</div>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>📧 {tutor.email}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '3px' }}>
                        🗓️ Submitted: {tutor.createdAt ? new Date(tutor.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button
                        className="btn-primary"
                        onClick={() => handleViewTutorDetails(tutor)}
                        style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', boxShadow: '0 4px 12px rgba(124,58,237,.28)', padding: '8px 14px', fontSize: '12.5px' }}
                      >
                        👁 View Details
                      </button>
                      <button
                        className="btn-primary"
                        onClick={() => handleApproveTutor(getTutorId(tutor))}
                        style={{ background: 'linear-gradient(135deg,#059669,#047857)', boxShadow: '0 4px 12px rgba(5,150,105,.28)', padding: '8px 14px', fontSize: '12.5px' }}
                      >
                        ✓ Approve
                      </button>
                      <button
                        className="btn-primary"
                        onClick={() => handleRejectTutor(getTutorId(tutor))}
                        style={{ background: 'linear-gradient(135deg,#DC2626,#B91C1C)', boxShadow: '0 4px 12px rgba(220,38,38,.28)', padding: '8px 14px', fontSize: '12.5px' }}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verified Tutors */}
          <div className="card">
            <div className="card-header">
              <h2 className="section-title">
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>✓</div>
                Verified Tutors
                <span style={{ background: 'var(--success-light)', color: '#047857', border: '1.5px solid #A7F3D0', borderRadius: '20px', padding: '2px 10px', fontSize: '12px', fontWeight: 700 }}>
                  {verifiedTutors.length}
                </span>
              </h2>
            </div>

            {verifiedTutors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px', color: 'var(--text-light)', fontSize: '13px' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>👨‍🏫</div>No verified tutors yet
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {verifiedTutors.map(tutor => (
                  <div key={tutor.id} style={{
                    padding: '14px 16px',
                    border: '1.5px solid var(--border)',
                    borderRadius: '12px',
                    borderLeft: '4px solid var(--success)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--bg)',
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: '3px', color: 'var(--navy)', fontSize: '14px' }}>{tutor.name}</div>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>📧 {tutor.email} · 📚 {tutor.subject}</div>
                    </div>
                    <span className="badge-verified">✓ Verified</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeNav === 'subjects') {
      return (
        <div className="page-content tt-a0">
          <div className="page-header">
            <div>
              <h1 className="page-title">Manage Subjects</h1>
              <p className="page-subtitle">Add and manage academic subjects available for tutoring.</p>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="section-title">
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>📚</div>
                Academic Subjects
                <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: '1.5px solid #C3D9F8', borderRadius: '20px', padding: '2px 10px', fontSize: '12px', fontWeight: 700 }}>
                  {subjects.length}
                </span>
              </h2>
              <button className="btn-primary" onClick={() => setNewSubjectModal(true)}>
                ➕ Add Subject
              </button>
            </div>

            {subjectsLoading ? (
              <div style={{ textAlign: 'center', padding: '28px', color: 'var(--text-light)', fontSize: '13px' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>⏳</div>Loading subjects...
              </div>
            ) : subjects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px', color: 'var(--text-light)', fontSize: '13px' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>📭</div>No subjects yet
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '14px' }}>
                {subjects.map(subject => (
                  <div key={subject.id} style={{
                    padding: '16px',
                    border: '1.5px solid var(--border)',
                    borderRadius: '12px',
                    background: 'var(--bg)',
                    transition: 'border-color .15s, box-shadow .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-mid)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(8,33,62,.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>📚</div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--navy)' }}>{subject.name}</div>
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.55' }}>
                      {subject.description || 'No description'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ADD SUBJECT MODAL */}
          {newSubjectModal && (
            <div className="modal-overlay" onClick={() => setNewSubjectModal(false)}>
              <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2 className="modal-title">📚 Add New Subject</h2>
                  <button className="modal-close" onClick={() => setNewSubjectModal(false)}>✕</button>
                </div>

                <div className="modal-body">
                  <div className="modal-field">
                    <label className="modal-label">Subject Name <span style={{ color: 'var(--error)' }}>*</span></label>
                    <input
                      className="modal-input"
                      value={newSubject.name}
                      onChange={e => setNewSubject({ ...newSubject, name: e.target.value })}
                      placeholder="e.g. Mathematics"
                    />
                  </div>

                  <div className="modal-field">
                    <label className="modal-label">Description <span style={{ color: 'var(--text-light)', fontWeight: 500, fontSize: '11px', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                    <textarea
                      className="modal-input modal-textarea"
                      value={newSubject.description}
                      onChange={e => setNewSubject({ ...newSubject, description: e.target.value })}
                      placeholder="Brief description of the subject"
                      rows={3}
                      style={{ resize: 'vertical', fontFamily: 'inherit', padding: '10px 14px' }}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn-ghost" onClick={() => setNewSubjectModal(false)}>Cancel</button>
                  <button className="btn-primary" onClick={handleAddSubject}>➕ Add Subject</button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (activeNav === 'logs') {
      return (
        <div className="page-content tt-a0">
          <div className="page-header">
            <div>
              <h1 className="page-title">System Logs</h1>
              <p className="page-subtitle">View all system activity and audit logs.</p>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="section-title">
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--warning-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>📋</div>
                Audit Log
              </h2>
            </div>
            {logsLoading ? (
              <div style={{ textAlign: 'center', padding: '28px', color: 'var(--text-light)', fontSize: '13px' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>⏳</div>Loading logs...
              </div>
            ) : systemLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-light)', fontSize: '13px' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>📭</div>
                <p style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>No system logs yet</p>
                <p>System events will appear here once activity is recorded.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid var(--primary-light)' }}>
                      {['Action', 'User', 'Timestamp', 'Status'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: '11.5px', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', background: 'var(--bg)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {systemLogs.map((log, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--primary-light)', transition: 'background .12s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 14px', fontSize: '13px', color: 'var(--navy)', fontWeight: 500 }}>{log.action}</td>
                        <td style={{ padding: '12px 14px', fontSize: '13px', color: 'var(--text-muted)' }}>{log.user || 'System'}</td>
                        <td style={{ padding: '12px 14px', fontSize: '12.5px', color: 'var(--text-muted)' }}>{log.timestamp}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            background: log.status === 'SUCCESS' ? 'var(--success-light)' : 'var(--error-light)',
                            color:      log.status === 'SUCCESS' ? '#047857'              : 'var(--error)',
                            border:     `1.5px solid ${log.status === 'SUCCESS' ? '#A7F3D0' : '#FECACA'}`,
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                          }}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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
              <h2 className="modal-title">🚪 Confirm Logout</h2>
              <button className="modal-close" onClick={() => setLogoutConfirmOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: '1.65', fontSize: '14px' }}>
                Are you sure you want to logout? You'll need to login again to access your account.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setLogoutConfirmOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleLogout} style={{ background: 'linear-gradient(135deg,#DC2626,#B91C1C)', boxShadow: '0 4px 14px rgba(220,38,38,.30)' }}>🚪 Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* TUTOR DETAILS MODAL */}
      {tutorDetailModalOpen && selectedTutor && (
        <div className="modal-overlay" onClick={() => setTutorDetailModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 className="modal-title">👤 Tutor Profile Details</h2>
              <button className="modal-close" onClick={() => setTutorDetailModalOpen(false)}>✕</button>
            </div>

            <div className="modal-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {[
                { label: 'NAME',  value: selectedTutor.name },
                { label: 'EMAIL', value: selectedTutor.email },
              ].map(row => (
                <div key={row.label} style={{ background: 'var(--bg)', borderRadius: '10px', padding: '12px 14px', border: '1px solid var(--border)' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{row.label}</label>
                  <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '4px', color: 'var(--navy)' }}>{row.value}</div>
                </div>
              ))}

              {selectedTutor.bio && (
                <div style={{ background: 'var(--bg)', borderRadius: '10px', padding: '12px 14px', border: '1px solid var(--border)' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>BIO</label>
                  <div style={{ fontSize: '13.5px', marginTop: '4px', lineHeight: '1.6', color: 'var(--text-muted)' }}>{selectedTutor.bio}</div>
                </div>
              )}

              {selectedTutor.specialization && (
                <div style={{ background: 'var(--bg)', borderRadius: '10px', padding: '12px 14px', border: '1px solid var(--border)' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>SPECIALIZATION</label>
                  <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '4px', color: 'var(--primary)' }}>📚 {selectedTutor.specialization}</div>
                </div>
              )}

              {selectedTutor.yearsOfExperience && (
                <div style={{ background: 'var(--bg)', borderRadius: '10px', padding: '12px 14px', border: '1px solid var(--border)' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>YEARS OF EXPERIENCE</label>
                  <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '4px', color: 'var(--navy)' }}>{selectedTutor.yearsOfExperience} years</div>
                </div>
              )}

              {selectedTutor.hourlyRate && (
                <div style={{ background: 'var(--success-light)', borderRadius: '10px', padding: '12px 14px', border: '1.5px solid #A7F3D0' }}>
                  <label style={{ fontSize: '11px', color: '#047857', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>HOURLY RATE</label>
                  <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '4px', color: '#047857' }}>₱{selectedTutor.hourlyRate}/hour</div>
                </div>
              )}

              {selectedTutor.rating && (
                <div style={{ background: 'var(--warning-light)', borderRadius: '10px', padding: '12px 14px', border: '1.5px solid #FDE68A' }}>
                  <label style={{ fontSize: '11px', color: 'var(--warning)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>CURRENT RATING</label>
                  <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '4px', color: 'var(--warning)' }}>⭐ {selectedTutor.rating.toFixed(1)} / 5.0</div>
                </div>
              )}

              <div style={{ background: 'var(--bg)', borderRadius: '10px', padding: '12px 14px', border: '1px solid var(--border)' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>APPLICATION DATE</label>
                <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '4px', color: 'var(--navy)' }}>
                  {selectedTutor.createdAt ? new Date(selectedTutor.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setTutorDetailModalOpen(false)}>Close</button>
              <button
                className="btn-primary"
                onClick={() => {
                  setTutorDetailModalOpen(false);
                  handleApproveTutor(getTutorId(selectedTutor));
                }}
                style={{ background: 'linear-gradient(135deg,#059669,#047857)', boxShadow: '0 4px 14px rgba(5,150,105,.30)' }}
              >
                ✓ Approve Tutor
              </button>
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
            <Avatar initials={userInitials} size={36} />
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

export default AdminDashboard;