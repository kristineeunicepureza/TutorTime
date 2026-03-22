import { useRef, useState } from 'react';
import { Avatar } from './Avatar';
import { ChangePasswordModal } from './ChangePasswordModal';
import { getStoredAuthToken } from '../apiService';

export function ProfileSettings({ displayName, userEmail, userRole, userInitials, savedProfile, profilePhoto, onEditOpen, photoInputRef, onPhotoUpload, sessionStats = [], onPhotoUrlChange }) {
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const internalPhotoRef = useRef(null);
  const resolvedPhotoRef = photoInputRef || internalPhotoRef;

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setPhotoError('Please select an image file (JPG, PNG, etc.)'); return; }
    if (file.size > 5 * 1024 * 1024) { setPhotoError('Image must be under 5MB'); return; }
    setPhotoError('');
    setPhotoUploading(true);
    if (onPhotoUpload) onPhotoUpload(e);
    try {
      // ✅ FIXED: Use getStoredAuthToken() with fallback chain
      const token = getStoredAuthToken();
      if (!token) {
        setPhotoError('Session expired. Please log in again.');
        setPhotoUploading(false);
        return;
      }
      const fd = new FormData(); fd.append('file', file);
      const res = await fetch('/api/uploadPhoto', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      if (data.photoUrl && onPhotoUrlChange) onPhotoUrlChange(data.photoUrl);
    } catch (err) {
      setPhotoError('Photo saved locally. Cloud sync failed: ' + err.message);
    } finally {
      setPhotoUploading(false);
    }
  };

  const accountRows = [
    { label: 'Full Name',        value: displayName },
    { label: 'University Email', value: userEmail },
    { label: 'Role',             value: userRole },
    { label: 'Department',       value: savedProfile?.department || '—' },
    { label: 'Year Level',       value: savedProfile?.yearLevel  || '—' },
  ];

  return (
    <div className="page-content tt-a0" style={{ padding: '32px 28px', width: '100%', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      {pwModalOpen && <ChangePasswordModal onClose={() => setPwModalOpen(false)} />}

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', gap: '14px', alignItems: 'stretch', marginBottom: '26px' }}>
        <div style={{ width: '4px', borderRadius: '4px', background: 'linear-gradient(to bottom,#2E71F0,#1045B8)', flexShrink: 0 }} />
        <div>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: '23px', fontWeight: 800, color: '#08213E', letterSpacing: '-0.4px', lineHeight: 1.2 }}>My Profile</h1>
          <p style={{ color: '#6B7280', fontSize: '13.5px', marginTop: '5px' }}>Manage your account and preferences.</p>
        </div>
      </div>

      {/* ── Hero Card ── */}
      <div className="tt-card" style={{ marginBottom: '22px', overflow: 'hidden' }}>
        {/* gradient banner */}
        <div style={{ height: '88px', background: 'linear-gradient(135deg,#2E71F0 0%,#1045B8 60%,#0B2F7E 100%)', position: 'relative' }}>
          {/* subtle dot pattern */}
          <div style={{ position: 'absolute', inset: 0, opacity: .15, backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '20px 20px' }} />
        </div>

        <div style={{ padding: '0 26px 24px' }}>
          {/* avatar + name row — avatar uses negative margin to overlap banner */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>

            {/* left: avatar + text */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              {/* avatar wrapper — only this gets pulled up */}
              <div
                className="photo-upload-wrapper"
                onClick={() => resolvedPhotoRef.current?.click()}
                title="Click to change photo"
                style={{ position: 'relative', cursor: 'pointer', borderRadius: '50%', border: '4px solid #fff', boxShadow: '0 4px 16px rgba(8,33,62,.15)', width: '88px', height: '88px', flexShrink: 0, marginTop: '-44px' }}
              >
                {photoUploading && (
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,.50)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, fontSize: '16px' }}>⏳</div>
                )}
                <Avatar initials={userInitials} size={80} photoUrl={profilePhoto} />
                <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '22px', height: '22px', borderRadius: '50%', background: '#1558D6', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>📷</div>
                <input type="file" ref={resolvedPhotoRef} accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: 'none' }} onChange={handlePhotoChange} />
              </div>

              {/* name / email / badges — sits below banner normally */}
              <div style={{ paddingTop: '10px' }}>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '19px', fontWeight: 800, color: '#08213E', letterSpacing: '-0.3px', marginBottom: '3px' }}>{displayName}</div>
                <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>{userEmail}</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, background: '#EBF1FD', color: '#1558D6', borderRadius: '6px', padding: '3px 10px', letterSpacing: '0.06em' }}>{userRole.toUpperCase()}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, background: '#ECFDF5', color: '#047857', borderRadius: '6px', padding: '3px 10px', border: '1.5px solid #A7F3D0' }}>✓ ID Verified</span>
                </div>
                {photoUploading && <p style={{ fontSize: '11px', color: '#1558D6', marginTop: '5px', fontStyle: 'italic' }}>⏳ Uploading...</p>}
                {photoError    && <p style={{ fontSize: '11px', color: '#D97706', marginTop: '5px' }}>⚠️ {photoError}</p>}
                {!photoUploading && !photoError && <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>Click your photo to update it</p>}
              </div>
            </div>

            {/* right: buttons — sit in normal flow, fully visible */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '148px', paddingTop: '10px' }}>
              <button className="tt-btn-primary" onClick={onEditOpen}>✏️ Edit Profile</button>
              <button className="tt-btn-ghost" onClick={() => setPwModalOpen(true)} style={{ justifyContent: 'center' }}>🔑 Change Password</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Details Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Account Details */}
        <div className="tt-card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '14px', paddingBottom: '13px', borderBottom: '1.5px solid #EBF1FD' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EBF1FD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>👤</div>
            <h2 className="tt-section-title">Account Details</h2>
          </div>
          {accountRows.map((row, i) => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < accountRows.length - 1 ? '1px solid #EBF1FD' : 'none' }}>
              <span style={{ fontSize: '12.5px', color: '#9CA3AF', fontWeight: 600 }}>{row.label}</span>
              <span style={{ fontSize: '13px', color: '#08213E', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Session Statistics */}
        <div className="tt-card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '14px', paddingBottom: '13px', borderBottom: '1.5px solid #EBF1FD' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EBF1FD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>📊</div>
            <h2 className="tt-section-title">Session Statistics</h2>
          </div>
          {sessionStats.length > 0 ? sessionStats.map((row, i) => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < sessionStats.length - 1 ? '1px solid #EBF1FD' : 'none' }}>
              <span style={{ fontSize: '12.5px', color: '#9CA3AF', fontWeight: 600 }}>{row.label}</span>
              <span style={{ fontSize: '14px', color: '#1558D6', fontWeight: 800 }}>{row.value}</span>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '28px 0', color: '#9CA3AF', fontSize: '13px' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>📭</div>No sessions yet.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}