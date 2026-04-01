import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { api } from '../../services/apiService';
import { User, Lock, Loader2, Check, Camera, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface UpdateProfileData {
  firstName: string;
  lastName: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function AdminSettings() {
  const { currentUser, setCurrentUser } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);

  // Profile editing
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState<UpdateProfileData>({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password change
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Photo upload
  const [photoUploading, setPhotoUploading] = useState(false);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be under 5 MB.');
      return;
    }

    setPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadedUrl = await api.post<string>('/api/upload/profile-photo', formData);
      const updated = await api.put('/api/users/me', { profilePhotoUrl: uploadedUrl });
      setCurrentUser(updated);
      toast.success('Profile photo updated!');
    } catch (e: any) {
      toast.error(e.message || 'Photo upload failed.');
    } finally {
      setPhotoUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleProfileSave = async () => {
    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      toast.error('Names cannot be empty.');
      return;
    }
    setProfileLoading(true);
    try {
      const updated = await api.put('/api/users/me', profileData);
      setCurrentUser(updated);
      setIsEditingProfile(false);
      toast.success('Profile updated successfully!');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('All password fields are required.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setPasswordLoading(true);
    try {
      await api.put('/api/users/me/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
      toast.success('Password changed successfully!');
    } catch (e: any) {
      toast.error(e.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1.5px solid #e0eaff',
    background: '#f7faff',
    fontSize: '13.5px',
    outline: 'none',
    color: '#001a4d',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const card: React.CSSProperties = {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,47,108,0.07)',
    border: '1px solid rgba(59,130,246,0.08)',
  };

  return (
    <DashboardLayout role="ADMIN">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#001a4d', fontWeight: 800, fontSize: '24px', letterSpacing: '-0.5px', marginBottom: '4px' }}>Settings</h1>
        <p style={{ color: '#5a7bad', fontSize: '14px' }}>Manage your account and security settings.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* ── Left Column: Photo & Quick Info ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Photo Card */}
          <div style={{ ...card, textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
              {/* Circular Avatar */}
              <div
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  margin: '0 auto',
                  border: '3px solid #DBEAFE',
                  boxShadow: '0 4px 16px rgba(0,47,108,0.15)',
                  background: currentUser?.profilePhotoUrl ? '#f0f4fa' : 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {currentUser?.profilePhotoUrl ? (
                  <img src={currentUser.profilePhotoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={40} color="white" />
                )}
              </div>

              {/* Camera Upload Button */}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={photoUploading}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                  border: '3px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: photoUploading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 3px 12px rgba(59,130,246,0.4)',
                  opacity: photoUploading ? 0.7 : 1,
                  transition: 'all 0.2s',
                }}
                title="Upload profile photo"
              >
                {photoUploading ? (
                  <Loader2 size={14} color="white" style={{ animation: 'spin 0.8s linear infinite' }} />
                ) : (
                  <Camera size={14} color="white" />
                )}
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
            </div>

            <h2 style={{ color: '#001a4d', fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>
              {currentUser?.firstName} {currentUser?.lastName}
            </h2>
            <p style={{ color: '#5a7bad', fontSize: '13px', marginBottom: '10px' }}>{currentUser?.email}</p>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 14px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #DBEAFE, #EFF6FF)',
                color: '#1D4ED8',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              Administrator
            </span>
            <p style={{ color: '#94a3b8', fontSize: '11px', marginTop: '12px' }}>Click the camera icon to update your photo</p>
          </div>

          {/* Security Card */}
          <div style={card}>
            <h3 style={{ color: '#001a4d', fontWeight: 700, fontSize: '14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '7px', margin: 0 }}>
              <Lock size={15} color="#3B82F6" /> Security
            </h3>
            <button
              onClick={() => setIsChangingPassword(true)}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: '10px',
                border: '1.5px solid #BFDBFE',
                background: 'white',
                color: '#1E40AF',
                fontWeight: 600,
                fontSize: '13.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#EFF6FF')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
            >
              <Lock size={14} /> Change Password
            </button>
          </div>
        </div>

        {/* ── Right Column: Profile Information ── */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
            <h2 style={{ color: '#001a4d', fontWeight: 700, fontSize: '16px', margin: 0 }}>Profile Information</h2>
            {!isEditingProfile ? (
              <button
                onClick={() => setIsEditingProfile(true)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                Edit
              </button>
            ) : null}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', color: '#6B8FC4', fontSize: '11px', fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                First Name
              </label>
              <input
                type="text"
                value={profileData.firstName}
                onChange={(e) => setProfileData((p) => ({ ...p, firstName: e.target.value }))}
                disabled={!isEditingProfile}
                style={{
                  ...inp,
                  background: isEditingProfile ? '#f7faff' : '#f0f4fa',
                  color: isEditingProfile ? '#001a4d' : '#6B8FC4',
                  cursor: isEditingProfile ? 'text' : 'default',
                }}
                onFocus={(e) => {
                  if (isEditingProfile) {
                    e.target.style.borderColor = '#3B82F6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0eaff';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#6B8FC4', fontSize: '11px', fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Last Name
              </label>
              <input
                type="text"
                value={profileData.lastName}
                onChange={(e) => setProfileData((p) => ({ ...p, lastName: e.target.value }))}
                disabled={!isEditingProfile}
                style={{
                  ...inp,
                  background: isEditingProfile ? '#f7faff' : '#f0f4fa',
                  color: isEditingProfile ? '#001a4d' : '#6B8FC4',
                  cursor: isEditingProfile ? 'text' : 'default',
                }}
                onFocus={(e) => {
                  if (isEditingProfile) {
                    e.target.style.borderColor = '#3B82F6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0eaff';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#6B8FC4', fontSize: '11px', fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Email
              </label>
              <input
                type="email"
                value={currentUser?.email || ''}
                disabled
                style={{ ...inp, background: '#f0f4fa', color: '#6B8FC4', cursor: 'default' }}
              />
            </div>

            {isEditingProfile && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  onClick={handleProfileSave}
                  disabled={profileLoading}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#3B82F6',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: profileLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    opacity: profileLoading ? 0.7 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  {profileLoading ? (
                    <>
                      <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving
                    </>
                  ) : (
                    <>
                      <Check size={13} /> Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsEditingProfile(false);
                    setProfileData({
                      firstName: currentUser?.firstName || '',
                      lastName: currentUser?.lastName || '',
                    });
                  }}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '10px',
                    border: '1.5px solid #e0eaff',
                    background: 'white',
                    color: '#6B8FC4',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {isChangingPassword && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 26, 77, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
          onClick={() => setIsChangingPassword(false)}
        >
          <div
            style={{
              ...card,
              width: '100%',
              maxWidth: '420px',
              padding: '32px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: '#001a4d', fontWeight: 800, fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} color="#DC2626" /> Change Password
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', color: '#6B8FC4', fontSize: '11px', fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  Current Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))}
                    style={inp}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#DC2626';
                      e.target.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0eaff';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    onClick={() => setShowPassword((p) => ({ ...p, current: !p.current }))}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {showPassword.current ? (
                      <EyeOff size={16} color="#94a3b8" />
                    ) : (
                      <Eye size={16} color="#94a3b8" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#6B8FC4', fontSize: '11px', fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: e.target.value }))}
                    placeholder="At least 6 characters"
                    style={inp}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#DC2626';
                      e.target.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0eaff';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    onClick={() => setShowPassword((p) => ({ ...p, new: !p.new }))}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {showPassword.new ? (
                      <EyeOff size={16} color="#94a3b8" />
                    ) : (
                      <Eye size={16} color="#94a3b8" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#6B8FC4', fontSize: '11px', fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Re-enter password"
                    style={inp}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#DC2626';
                      e.target.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0eaff';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    onClick={() => setShowPassword((p) => ({ ...p, confirm: !p.confirm }))}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {showPassword.confirm ? (
                      <EyeOff size={16} color="#94a3b8" />
                    ) : (
                      <Eye size={16} color="#94a3b8" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handlePasswordChange}
                disabled={passwordLoading}
                style={{
                  flex: 1,
                  padding: '11px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#DC2626',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: passwordLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  opacity: passwordLoading ? 0.7 : 1,
                  transition: 'all 0.2s',
                }}
              >
                {passwordLoading ? (
                  <>
                    <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Updating
                  </>
                ) : (
                  <>
                    <Lock size={13} /> Update Password
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setShowPassword({ current: false, new: false, confirm: false });
                }}
                style={{
                  flex: 1,
                  padding: '11px',
                  borderRadius: '10px',
                  border: '1.5px solid #e0eaff',
                  background: 'white',
                  color: '#6B8FC4',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  );
}