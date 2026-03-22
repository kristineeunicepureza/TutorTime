import { useState } from 'react';
import { getStoredAuthToken } from '../apiService';

function strengthInfo(len) {
  if (len === 0) return { color: '#D5E3F7', label: '' };
  if (len < 6)  return { color: '#DC2626', label: '⚠️ Too short' };
  if (len < 10) return { color: '#D97706', label: '🟡 Fair' };
  return                { color: '#059669', label: '✅ Strong' };
}

export function ChangePasswordModal({ onClose }) {
  const [form, setForm]     = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) { setError('All fields are required.'); return; }
    if (form.newPassword.length < 6) { setError('New password must be at least 6 characters.'); return; }
    if (form.newPassword !== form.confirmPassword) { setError('New passwords do not match.'); return; }
    if (form.currentPassword === form.newPassword) { setError('New password must be different from current password.'); return; }
    setLoading(true);
    try {
      // ✅ FIXED: Use getStoredAuthToken() with fallback chain instead of just localStorage
      const token = getStoredAuthToken();
      if (!token) {
        setError('Session expired. Please log in again.');
        setLoading(false);
        return;
      }
      const res = await fetch('/api/password', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ newPassword: form.newPassword }) });
      const data = await res.json();
      if (!res.ok || data.success === false) throw new Error(data.message || data.error || 'Failed to change password');
      setSuccess(true);
      setTimeout(() => onClose(), 2500);
    } catch (err) {
      setError(err.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const { color: strColor, label: strLabel } = strengthInfo(form.newPassword.length);
  const canSubmit = !loading && form.currentPassword && form.newPassword && form.confirmPassword;

  return (
    <div className="tt-modal-overlay" onClick={onClose}>
      <div className="tt-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>

        <div className="tt-modal-head">
          <h2 className="tt-modal-title">🔑 Change Password</h2>
          <button className="tt-modal-close" onClick={onClose}>✕</button>
        </div>

        {success ? (
          <div style={{ padding: '44px 28px', textAlign: 'center' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#ECFDF5', border: '3px solid #A7F3D0', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>✅</div>
            <h3 style={{ fontFamily: "'Sora',sans-serif", color: '#047857', marginBottom: '8px', fontWeight: 800, fontSize: '18px' }}>Password Changed!</h3>
            <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: 1.6 }}>Your password has been updated. You'll be redirected shortly.</p>
          </div>
        ) : (
          <>
            <div className="tt-modal-body">
              {error && (
                <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: '10px', color: '#DC2626', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Current Password */}
              <div>
                <label className="tt-label">Current Password</label>
                <input className="tt-input" type="password" placeholder="Enter your current password" value={form.currentPassword} onChange={e => setForm({ ...form, currentPassword: e.target.value })} disabled={loading} />
              </div>

              {/* New Password */}
              <div>
                <label className="tt-label">New Password</label>
                <input
                  className="tt-input"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={form.newPassword}
                  onChange={e => setForm({ ...form, newPassword: e.target.value })}
                  disabled={loading}
                  style={{ borderColor: form.newPassword.length > 0 ? `${strColor}99` : '#D5E3F7' }}
                />
                {form.newPassword.length > 0 && (
                  <>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '7px' }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ flex: 1, height: '4px', borderRadius: '3px', background: form.newPassword.length >= i * 3 ? strColor : '#EBF1FD', transition: 'background .25s' }} />
                      ))}
                    </div>
                    <div style={{ fontSize: '11.5px', fontWeight: 600, color: strColor, marginTop: '4px' }}>{strLabel}</div>
                  </>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="tt-label">Confirm New Password</label>
                <input
                  className="tt-input"
                  type="password"
                  placeholder="Re-enter your new password"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  disabled={loading}
                  style={{ borderColor: form.confirmPassword.length > 0 ? (form.newPassword === form.confirmPassword ? '#059669aa' : '#DC2626aa') : '#D5E3F7' }}
                />
                {form.confirmPassword.length > 0 && form.newPassword !== form.confirmPassword && (
                  <div style={{ fontSize: '11.5px', color: '#DC2626', marginTop: '4px', fontWeight: 600 }}>✕ Passwords don't match</div>
                )}
                {form.confirmPassword.length > 0 && form.newPassword === form.confirmPassword && (
                  <div style={{ fontSize: '11.5px', color: '#059669', marginTop: '4px', fontWeight: 600 }}>✓ Passwords match</div>
                )}
              </div>
            </div>

            <div className="tt-modal-footer">
              <button className="tt-btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
              <button className="tt-btn-primary" onClick={handleSubmit} disabled={!canSubmit} style={{ opacity: canSubmit ? 1 : .5 }}>
                {loading ? '⏳ Updating...' : '🔑 Update Password'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}