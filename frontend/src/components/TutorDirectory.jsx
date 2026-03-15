import { Avatar } from './Avatar';

export function TutorDirectory({ tutors, tutorsLoading, searchQuery, setSearchQuery, onViewProfile, onContactTutor }) {
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
                  <button className="btn-primary" onClick={() => onViewProfile(t)}>View Profile</button>
                  <button className="btn-ghost" onClick={() => onContactTutor(t)}>Contact Tutor</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
