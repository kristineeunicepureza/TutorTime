import { Avatar } from './Avatar';
import { StatusBadge } from './StatusBadge';

export function DashboardView({ firstName, upcomingBookings, stats, notifications, onBookSession, onNavClick }) {
  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Good afternoon, {firstName} 👋</h1>
            <p className="page-subtitle">Here's what's happening with your sessions today.</p>
          </div>
          <button className="btn-primary" onClick={() => onNavClick('tutors')}>+ Book a Session</button>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className={`stat-icon ${s.colorClass}`}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-delta">{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <h2 className="section-title">Upcoming Sessions</h2>
            <button className="btn-ghost" onClick={() => onNavClick('bookings')}>View All</button>
          </div>
          {upcomingBookings.slice(0, 3).map((b, i) => (
            <div key={b.id} className={`booking-row ${i === Math.min(upcomingBookings.length, 3) - 1 ? 'no-border' : ''}`}>
              <Avatar initials={b.avatar} size={40} />
              <div className="booking-info">
                <div className="booking-name">{b.tutor}</div>
                <div className="booking-meta">{b.subject} · {b.date}, {b.time}</div>
                <div className="booking-location">📍 {b.location}</div>
              </div>
              <StatusBadge status={b.status} />
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="section-title">Recent Activity</h2>
          </div>
          {notifications.slice(0, 5).map((n, i) => (
            <div key={n.id} className={`activity-row ${i === Math.min(notifications.length, 5) - 1 ? 'no-border' : ''}`}>
              <div className={`activity-dot ${n.read ? '' : 'unread'}`} />
              <div>
                <div className="activity-text">{n.text}</div>
                <div className="activity-time">{n.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
