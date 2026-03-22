import { Avatar } from './Avatar';

export function TutorDirectory({ tutors, tutorsLoading, searchQuery, setSearchQuery, onViewProfile }) {
  const filtered = tutors.filter(t =>
    !searchQuery ||
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="page-content tt-a0" style={{ padding: '32px 28px', width: '100%', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'stretch', marginBottom: '6px' }}>
          <div style={{ width: '4px', borderRadius: '4px', background: 'linear-gradient(to bottom,#2E71F0,#1045B8)', flexShrink: 0 }} />
          <div>
            <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: '23px', fontWeight: 800, color: '#08213E', letterSpacing: '-0.4px', lineHeight: 1.2 }}>
              Find Your Academic Partner
            </h1>
            <p style={{ color: '#6B7280', fontSize: '13.5px', marginTop: '5px' }}>
              Browse our verified directory of student tutors and book face-to-face sessions on campus.
            </p>
          </div>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        background: '#fff', borderRadius: '14px', padding: '11px 18px',
        border: '1.5px solid #D5E3F7',
        boxShadow: '0 1px 3px rgba(8,33,62,.05),0 4px 16px rgba(8,33,62,.07)',
        marginBottom: '28px',
      }}>
        <span style={{ fontSize: '15px', flexShrink: 0, opacity: .6 }}>🔍</span>
        <input
          className="search-input-full"
          placeholder="What subject do you need help with? (e.g. Calculus, Physics, Psychology...)"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13.5px', color: '#08213E', background: 'transparent', fontFamily: "'Plus Jakarta Sans',sans-serif" }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{ background: '#EBF1FD', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#6B7280', flexShrink: 0 }}
          >✕</button>
        )}
      </div>

      {/* ── Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: '18px' }}>

        {tutorsLoading && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: '#9CA3AF', fontSize: '14px' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏳</div>Loading tutors...
          </div>
        )}

        {!tutorsLoading && filtered.length === 0 && searchQuery && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: '#9CA3AF', fontSize: '14px' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔎</div>
            No tutors found for <strong style={{ color: '#374151' }}>"{searchQuery}"</strong>
          </div>
        )}

        {!tutorsLoading && filtered.length === 0 && !searchQuery && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: '#9CA3AF', fontSize: '14px' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>📚</div>No tutors available yet.
          </div>
        )}

        {filtered.map(t => (
          <div
            key={t.id}
            className="tutor-card"
            style={{
              background: '#fff', borderRadius: '16px', padding: '18px',
              border: '1.5px solid #D5E3F7',
              boxShadow: '0 1px 3px rgba(8,33,62,.05),0 4px 16px rgba(8,33,62,.07)',
              transition: 'transform .15s ease,box-shadow .15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(8,33,62,.13)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(8,33,62,.05),0 4px 16px rgba(8,33,62,.07)'; }}
          >
            <div style={{ display: 'flex', gap: '13px', alignItems: 'flex-start' }}>
              <Avatar initials={t.avatar} size={54} />
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* name row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#08213E', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</span>
                      {t.verified && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#1558D6', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '9px', fontWeight: 800, flexShrink: 0 }}>✓</span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#1558D6', letterSpacing: '0.08em' }}>
                      {t.subject.toUpperCase()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#08213E' }}>⭐ {t.rating}</div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>{t.sessions} sessions</div>
                  </div>
                </div>
                {/* tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '10px' }}>
                  {t.tags.map(tag => (
                    <span key={tag} style={{ fontSize: '11px', fontWeight: 600, color: '#1558D6', background: '#EBF1FD', borderRadius: '6px', padding: '3px 9px' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {/* footer */}
            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #EBF1FD' }}>
              <button
                className="tt-btn-primary"
                onClick={() => onViewProfile(t)}
                style={{ width: '100%', justifyContent: 'center', borderRadius: '10px', padding: '9px 0', fontSize: '13px' }}
              >
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}