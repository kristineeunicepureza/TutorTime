import { useState, useRef, useEffect } from 'react';
import { getStoredAuthToken } from '../apiService';

export function EditProfileModal({ editForm, setEditForm, onSave, onClose, editPhotoRef, onPhotoUpload, editPhoto, isLoading }) {
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
  const deptRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (deptRef.current && !deptRef.current.contains(event.target)) {
        setDeptOpen(false);
      }
    };
    if (deptOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }
  }, [deptOpen]);

  const handleSave = async () => {
    if (!editForm.name?.trim()) { setError('Full name is required.'); return; }
    setError(''); setSaving(true);
    try {
      // ✅ FIXED: Use getStoredAuthToken() with fallback chain instead of just localStorage
      const token = getStoredAuthToken();
      if (!token) {
        setError('Session expired. Please log in again.');
        setSaving(false);
        return;
      }
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ displayName: editForm.name.trim(), fullName: editForm.name.trim(), department: editForm.department, yearLevel: editForm.yearLevel, subject: editForm.subject, bio: editForm.bio, hourlyRate: editForm.hourlyRate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');
      // ✅ Save all profile fields to localStorage for session persistence
      localStorage.setItem('userName', editForm.name.trim());
      localStorage.setItem('userDepartment', editForm.department || '');
      localStorage.setItem('userYearLevel', editForm.yearLevel || '');
      setSuccess(true);
      setTimeout(() => onSave(), 1000);
    } catch (err) {
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ✅ UPDATED: Match the academic programs from SignUp
  const DEPTS = ['BSIT','BSCS','BSIS','BSCE','BSME','BSEE','BSECE','BSCpE','BSArch','BSIE','BSA','BSBA','BSHM','BSTM','BSN','BSPhar'];
  const YEARS = ['Freshman (Year 1)','Sophomore (Year 2)','Junior (Year 3)','Senior (Year 4)','Graduate Student'];

  return (
    <div className="tt-modal-overlay" onClick={onClose}>
      <div className="tt-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>

        <div className="tt-modal-head">
          <h2 className="tt-modal-title">✏️ Edit Profile</h2>
          <button className="tt-modal-close" onClick={onClose}>✕</button>
        </div>

        {success ? (
          <div style={{ padding: '44px 28px', textAlign: 'center' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#ECFDF5', border: '3px solid #A7F3D0', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>✅</div>
            <h3 style={{ fontFamily: "'Sora',sans-serif", color: '#047857', marginBottom: '8px', fontWeight: 800, fontSize: '18px' }}>Profile Updated!</h3>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>Your changes have been saved successfully.</p>
          </div>
        ) : (
          <>
            <div className="tt-modal-body">
              {error && (
                <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: '10px', color: '#DC2626', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Photo */}
              <div>
                <label className="tt-label">Profile Photo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    className="photo-preview"
                    onClick={() => editPhotoRef?.current?.click()}
                    title="Click to upload photo"
                    style={{ width: '72px', height: '72px', borderRadius: '50%', cursor: 'pointer', overflow: 'hidden', flexShrink: 0, border: '2px dashed #C3D9F8', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F8FF', transition: 'border-color .15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#2E71F0'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#C3D9F8'}
                  >
                    {editPhoto
                      ? <img src={editPhoto} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ textAlign: 'center', fontSize: '11px', color: '#9CA3AF', lineHeight: 1.4 }}>📷<br/>Upload</div>
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12.5px', color: '#6B7280', lineHeight: 1.6, marginBottom: '8px' }}>
                      Upload a clear profile photo.<br />
                      <span style={{ color: '#9CA3AF', fontSize: '12px' }}>JPG, PNG, WebP · Max 5MB</span>
                    </div>
                    <button type="button" className="tt-btn-ghost" onClick={() => editPhotoRef?.current?.click()} style={{ fontSize: '12px', padding: '6px 14px' }}>
                      📷 {editPhoto ? 'Change Photo' : 'Upload Photo'}
                    </button>
                  </div>
                  <input type="file" ref={editPhotoRef} accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={onPhotoUpload} />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="tt-label">Full Name <span style={{ color: '#DC2626' }}>*</span></label>
                <input className="tt-input" value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Enter your full name" disabled={saving} />
              </div>

              {editForm.department !== undefined && (
                <div>
                  {/* ✅ UPDATED: Custom dropdown with scrollbar like SignUp */}
                  <div className="tt-input" style={{ position: 'relative', padding: 0, height: 'auto' }} ref={deptRef}>
                    <button
                      type="button"
                      className="academic-trigger"
                      style={{ 
                        width: '100%', 
                        height: '40px',
                        padding: '0 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: 'none',
                        background: 'transparent',
                        color: '#08213E',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontFamily: "'Plus Jakarta Sans', sans-serif"
                      }}
                      onClick={() => !saving && setDeptOpen(prev => !prev)}
                      disabled={saving}
                    >
                      <span>{editForm.department || 'Select Department'}</span>
                      <span style={{ color: '#64748B', fontSize: '12px', marginLeft: '10px', transform: deptOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>▾</span>
                    </button>

                    {deptOpen && (
                      <div 
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 6px)',
                          left: 0,
                          right: 0,
                          zIndex: 40,
                          maxHeight: '180px',
                          overflowY: 'auto',
                          background: '#FFFFFF',
                          border: '1.5px solid #C7D8F3',
                          borderRadius: '10px',
                          boxShadow: '0 10px 24px rgba(8, 33, 62, 0.16)'
                        }}
                      >
                        {DEPTS.map((dept) => (
                          <button
                            key={dept}
                            type="button"
                            onClick={() => {
                              setEditForm({ ...editForm, department: dept });
                              setDeptOpen(false);
                            }}
                            style={{
                              width: '100%',
                              border: 'none',
                              background: editForm.department === dept ? '#DCE9FF' : '#FFFFFF',
                              color: editForm.department === dept ? '#0F4CC8' : '#08213E',
                              fontWeight: editForm.department === dept ? 700 : 500,
                              fontSize: '13px',
                              textAlign: 'left',
                              padding: '9px 12px',
                              cursor: 'pointer',
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              transition: 'background 0.1s'
                            }}
                            onMouseEnter={(e) => {
                              if (e.currentTarget.style.background !== '#DCE9FF') {
                                e.currentTarget.style.background = '#EEF4FF';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (editForm.department === dept) {
                                e.currentTarget.style.background = '#DCE9FF';
                              } else {
                                e.currentTarget.style.background = '#FFFFFF';
                              }
                            }}
                          >
                            {dept}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {editForm.yearLevel !== undefined && (
                <div>
                  <label className="tt-label">Year Level</label>
                  <select className="tt-input" value={editForm.yearLevel || ''} onChange={e => setEditForm({ ...editForm, yearLevel: e.target.value })} disabled={saving}>
                    {YEARS.map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
              )}

              {editForm.subject !== undefined && (
                <div>
                  <label className="tt-label">Subject / Specialization</label>
                  <input className="tt-input" value={editForm.subject || ''} onChange={e => setEditForm({ ...editForm, subject: e.target.value })} placeholder="e.g. Mathematics, Physics" disabled={saving} />
                </div>
              )}

              {editForm.hourlyRate !== undefined && (
                <div>
                  <label className="tt-label">Hourly Rate (₱)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', fontSize: '13.5px', fontWeight: 700, color: '#6B7280' }}>₱</span>
                    <input className="tt-input" type="number" value={editForm.hourlyRate || ''} onChange={e => setEditForm({ ...editForm, hourlyRate: e.target.value })} placeholder="e.g. 250" min="50" max="2000" disabled={saving} style={{ paddingLeft: '28px' }} />
                  </div>
                </div>
              )}

              {editForm.bio !== undefined && (
                <div>
                  <label className="tt-label">Bio</label>
                  <textarea className="tt-input" value={editForm.bio || ''} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Tell students about your experience and teaching style..." rows={4} disabled={saving} style={{ resize: 'vertical', height: 'auto', lineHeight: 1.6 }} />
                </div>
              )}
            </div>

            <div className="tt-modal-footer">
              <button className="tt-btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
              <button className="tt-btn-primary" onClick={handleSave} disabled={saving || !editForm.name?.trim()} style={{ opacity: saving || !editForm.name?.trim() ? .55 : 1 }}>
                {saving ? '⏳ Saving...' : '✅ Save Changes'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}