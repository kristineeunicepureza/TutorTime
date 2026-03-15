import { Avatar } from './Avatar';

export function TutorProfile({ tutor, onBack, onContactTutor, onBookSession }) {
  if (!tutor) return null;
  return (
    <div className="page-content">
      <button className="back-btn" onClick={onBack}>← Back to Tutors</button>

      <div className="tutor-profile-hero card">
        <div className="tutor-profile-hero-inner">
          <Avatar initials={tutor.avatar} size={90} />
          <div className="tutor-profile-info">
            <div className="tutor-profile-name">
              {tutor.name}
              {tutor.verified && <span className="verified-pill">✓ Verified</span>}
            </div>
            <div className="tutor-profile-subject">{tutor.subject.toUpperCase()}</div>
            <div className="tutor-rating" style={{ marginTop: 6 }}>
              ⭐ {tutor.rating} <span className="rating-sessions">({tutor.sessions} sessions)</span>
            </div>
            <div className="tag-row" style={{ marginTop: 10 }}>
              {tutor.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
            </div>
          </div>
          <div className="tutor-profile-meta-right">
            <div className="tutor-meta-item"><span>💰</span> {tutor.rate}</div>
            <div className="tutor-meta-item"><span>📍</span> {tutor.location}</div>
            <div className="tutor-meta-item"><span>⚡</span> Replies {tutor.responseTime}</div>
          </div>
        </div>
        <div className="tutor-profile-actions">
          <button className="btn-primary" onClick={() => onContactTutor(tutor)}>💬 Contact Tutor</button>
          <button className="btn-ghost" onClick={() => onBookSession(tutor)}>📅 Book Session</button>
        </div>
      </div>

      <div className="two-col" style={{ marginTop: 24 }}>
        <div className="card">
          <h2 className="section-title" style={{ marginBottom: 14 }}>About</h2>
          <p className="tutor-bio">{tutor.bio}</p>

          <h2 className="section-title" style={{ margin: '20px 0 12px' }}>Availability</h2>
          <div className="availability-grid">
            {tutor.availability.map((slot, i) => (
              <div key={i} className="availability-slot">
                <span className="avail-dot" />
                {slot}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="section-title" style={{ marginBottom: 14 }}>Student Reviews</h2>
          {tutor.reviews.map((r, i) => (
            <div key={i} className={`review-item ${i < tutor.reviews.length - 1 ? 'review-border' : ''}`}>
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
}
