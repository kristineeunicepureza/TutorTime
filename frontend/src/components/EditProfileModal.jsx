export function EditProfileModal({ editForm, setEditForm, onSave, onClose, editPhotoRef, onPhotoUpload, editPhoto }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Profile</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
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
                onChange={onPhotoUpload}
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
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={onSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
