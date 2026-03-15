import { Avatar } from './Avatar';

export function ProfileSettings({ displayName, userEmail, userRole, userInitials, savedProfile, profilePhoto, onEditOpen, photoInputRef, onPhotoUpload, sessionStats = [] }) {
  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account and preferences.</p>
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
            onChange={onPhotoUpload}
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
        <button className="btn-primary" onClick={() => onEditOpen()}>
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
          {sessionStats.map(row => (
            <div key={row.label} className="detail-row">
              <span className="detail-label">{row.label}</span>
              <span className="detail-value">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
