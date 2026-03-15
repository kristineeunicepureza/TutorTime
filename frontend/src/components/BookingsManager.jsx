import { Avatar } from './Avatar';
import { StatusBadge } from './StatusBadge';

export function BookingsManager({ bookingTab, setBookingTab, upcomingBookings, pastBookings, bookingsLoading, onCancelBooking, cancelConfirmId, setCancelConfirmId, onBookSession, onNavClick }) {
  const list = bookingTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">My Bookings</h1>
            <p className="page-subtitle">Track and manage all your tutoring sessions.</p>
          </div>
          <button className="btn-primary" onClick={() => onNavClick('tutors')}>+ Book a Session</button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${bookingTab === 'upcoming' ? 'active' : ''}`} onClick={() => setBookingTab('upcoming')}>
          Upcoming ({upcomingBookings.filter(b => b.status !== 'CANCELLED').length})
        </button>
        <button className={`tab ${bookingTab === 'past' ? 'active' : ''}`} onClick={() => setBookingTab('past')}>
          Past Sessions ({pastBookings.length})
        </button>
      </div>

      <div className="bookings-list">
        {bookingsLoading ? (
          <div className="empty-state" style={{ gridColumn: 'unset' }}>Loading bookings...</div>
        ) : list.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: 'unset' }}>
            No sessions yet. <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 700 }} onClick={() => onNavClick('tutors')}>Find a tutor →</span>
          </div>
        ) : null}
        {list.map(b => (
          <div key={b.id} className="booking-card">
            <Avatar initials={b.avatar} size={50} />
            <div className="booking-card-info">
              <div className="booking-card-name">{b.tutor}</div>
              <div className="booking-card-subject">{b.subject}</div>
              <div className="booking-card-meta">
                <span>📅 {b.date}, {b.time}</span>
                <span>📍 {b.location}</span>
              </div>
              {b.notes && <div className="booking-notes">📝 {b.notes}</div>}
            </div>
            <div className="booking-card-right">
              <StatusBadge status={b.status} />
              {bookingTab === 'upcoming' && b.status !== 'CANCELLED' && (
                cancelConfirmId === b.id ? (
                  <div className="cancel-confirm">
                    <span className="cancel-confirm-text">Cancel this session?</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-cancel" onClick={() => onCancelBooking(b.id)}>Yes</button>
                      <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setCancelConfirmId(null)}>No</button>
                    </div>
                  </div>
                ) : (
                  <button className="btn-cancel" onClick={() => setCancelConfirmId(b.id)}>Cancel</button>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
