import { Avatar } from './Avatar';
import { StatusBadge } from './StatusBadge';

export function BookingsManager({
  bookingTab, setBookingTab,
  upcomingBookings, pastBookings,
  bookingsLoading, onCancelBooking,
  cancelConfirmId, setCancelConfirmId,
  onBookSession, onNavClick,
}) {
  const list = bookingTab === 'upcoming' ? upcomingBookings : pastBookings;
  const upcomingActive = upcomingBookings.filter(b => b.status !== 'CANCELLED').length;

  return (
    <div className="page-content tt-a0" style={{ padding: '32px 28px', width: '100%', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'stretch' }}>
          <div style={{ width: '4px', borderRadius: '4px', background: 'linear-gradient(to bottom,#2E71F0,#1045B8)', flexShrink: 0 }} />
          <div>
            <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: '23px', fontWeight: 800, color: '#08213E', letterSpacing: '-0.4px', lineHeight: 1.2 }}>
              My Bookings
            </h1>
            <p style={{ color: '#6B7280', fontSize: '13.5px', marginTop: '5px' }}>
              Track and manage all your tutoring sessions.
            </p>
          </div>
        </div>
        <button className="tt-btn-primary" onClick={() => onNavClick('tutors')}>
          <span style={{ fontSize: '16px', lineHeight: 1 }}>＋</span> Book a Session
        </button>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '4px', background: '#EBF1FD', borderRadius: '12px', padding: '4px', marginBottom: '22px', width: 'fit-content' }}>
        {[
          { key: 'upcoming', label: `Upcoming (${upcomingActive})` },
          { key: 'past',     label: `Past Sessions (${pastBookings.length})` },
        ].map(({ key, label }) => {
          const active = bookingTab === key;
          return (
            <button
              key={key}
              onClick={() => setBookingTab(key)}
              style={{
                background: active ? '#fff' : 'transparent',
                border: 'none', borderRadius: '9px', padding: '8px 20px',
                fontSize: '13px', fontWeight: active ? 700 : 500,
                color: active ? '#1558D6' : '#6B7280',
                cursor: 'pointer',
                boxShadow: active ? '0 1px 4px rgba(8,33,62,.10)' : 'none',
                transition: 'all .15s', fontFamily: "'Plus Jakarta Sans',sans-serif",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {bookingsLoading && (
          <div style={{ textAlign: 'center', padding: '48px', color: '#9CA3AF', fontSize: '14px' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏳</div>
            Loading bookings...
          </div>
        )}

        {!bookingsLoading && list.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '56px 24px',
            background: '#fff', borderRadius: '16px',
            border: '1.5px dashed #C3D9F8',
          }}>
            <div style={{ width: '58px', height: '58px', borderRadius: '16px', background: '#EBF1FD', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>
              {bookingTab === 'upcoming' ? '📅' : '📋'}
            </div>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#08213E', marginBottom: '6px' }}>
              No {bookingTab === 'upcoming' ? 'upcoming' : 'past'} sessions yet
            </p>
            <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '18px' }}>
              Find a tutor and book your first session!
            </p>
            <span style={{ color: '#1558D6', cursor: 'pointer', fontWeight: 700, fontSize: '13.5px' }} onClick={() => onNavClick('tutors')}>
              Find a tutor →
            </span>
          </div>
        )}

        {list.map(b => {
          const statusColors = { CONFIRMED: '#059669', PENDING: '#D97706', CANCELLED: '#DC2626', COMPLETED: '#1558D6' };
          const accent = statusColors[(b.status||'').toUpperCase()] || '#9CA3AF';
          return (
            <div
              key={b.id}
              className="booking-card"
              style={{
                background: '#fff', borderRadius: '16px', padding: '16px 20px',
                border: '1.5px solid #D5E3F7',
                boxShadow: '0 1px 3px rgba(8,33,62,.05),0 4px 16px rgba(8,33,62,.06)',
                display: 'flex', gap: '14px', alignItems: 'flex-start',
                borderLeft: `4px solid ${accent}`,
                transition: 'box-shadow .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(8,33,62,.12)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(8,33,62,.05),0 4px 16px rgba(8,33,62,.06)'}
            >
              <Avatar initials={b.avatar} size={50} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#08213E', marginBottom: '2px' }}>
                  {b.tutor}
                </div>
                <div style={{ fontSize: '12.5px', color: '#1558D6', fontWeight: 600, marginBottom: '8px' }}>
                  {b.subject}
                </div>
                <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12.5px', color: '#374151', fontWeight: 500 }}>📅 {b.date}, {b.time}</span>
                  <span style={{ fontSize: '12.5px', color: '#374151', fontWeight: 500 }}>📍 {b.location}</span>
                </div>
                {(b.durationMinutes || b.price) && (
                  <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', marginTop: 4 }}>
                    {b.durationMinutes && <span style={{ fontSize: '12px', color: '#9CA3AF' }}>⏱️ {b.durationMinutes} mins</span>}
                    {b.price && <span style={{ fontSize: '12px', color: '#9CA3AF' }}>💵 {b.price}</span>}
                  </div>
                )}
                {b.notes && (
                  <div style={{ fontSize: '12.5px', color: '#374151', marginTop: '8px', background: '#F5F8FF', borderRadius: '8px', padding: '6px 10px', border: '1px solid #D5E3F7' }}>
                    📝 {b.notes}
                  </div>
                )}
                {b.status === 'CANCELLED' && b.cancellationReason && (
                  <div style={{ fontSize: '12.5px', color: '#DC2626', marginTop: '8px', background: '#FEF2F2', borderRadius: '8px', padding: '6px 10px', border: '1px solid #FECACA' }}>
                    ❌ {b.cancellationReason}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', flexShrink: 0 }}>
                <StatusBadge status={b.status} />
                {bookingTab === 'upcoming' && b.status !== 'CANCELLED' && (
                  cancelConfirmId === b.id ? (
                    <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: '10px', padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{ display: 'block', fontSize: '12px', color: '#DC2626', fontWeight: 600, marginBottom: '8px' }}>Cancel this session?</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="tt-btn-danger"
                          onClick={() => onCancelBooking(b.id)}
                          style={{ background: '#DC2626', color: '#fff', border: 'none', borderRadius: '8px', padding: '5px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                        >Yes</button>
                        <button className="tt-btn-ghost" style={{ padding: '5px 12px', fontSize: '12px' }} onClick={() => setCancelConfirmId(null)}>No</button>
                      </div>
                    </div>
                  ) : (
                    <button className="tt-btn-danger" onClick={() => setCancelConfirmId(b.id)}>Cancel</button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}