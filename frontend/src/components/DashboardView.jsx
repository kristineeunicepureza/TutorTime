import { Avatar } from './Avatar';
import { StatusBadge } from './StatusBadge';

/* ─────────────────────────────────────────────
   Inject fonts + design tokens once
───────────────────────────────────────────── */
const STYLE_ID = 'tt-blue-theme';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap';
  document.head.appendChild(link);

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    :root {
      --navy:       #08213E;
      --blue:       #1558D6;
      --blue-mid:   #2E71F0;
      --blue-light: #EBF1FD;
      --blue-pale:  #F5F8FF;
      --sky:        #7BB3F7;
      --gold:       #F59E0B;
      --red:        #DC2626;
      --green:      #059669;
      --white:      #FFFFFF;
      --text:       #08213E;
      --body:       #374151;
      --muted:      #6B7280;
      --border:     #D5E3F7;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0; padding: 0;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    }

    /* Buttons */
    .tt-btn-primary {
      display: inline-flex; align-items: center; gap: 7px;
      background: linear-gradient(135deg, #2E71F0 0%, #1045B8 100%);
      color: #fff; border: none; border-radius: 10px;
      padding: 10px 20px; font-size: 13.5px; font-weight: 700;
      cursor: pointer; letter-spacing: .01em;
      box-shadow: 0 4px 16px rgba(21,88,214,.30);
      transition: transform .15s ease, box-shadow .15s ease;
    }
    .tt-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(21,88,214,.40);
    }
    .tt-btn-ghost {
      display: inline-flex; align-items: center; gap: 5px;
      background: var(--blue-light); color: var(--blue);
      border: 1.5px solid #C3D9F8; border-radius: 8px;
      padding: 6px 14px; font-size: 12.5px; font-weight: 700;
      cursor: pointer; transition: background .12s, border-color .12s;
    }
    .tt-btn-ghost:hover { background: #D9EAFD; border-color: var(--blue-mid); }

    /* Cards */
    .tt-card {
      background: var(--white);
      border-radius: 16px;
      border: 1.5px solid var(--border);
      box-shadow: 0 1px 3px rgba(8,33,62,.05), 0 6px 20px rgba(8,33,62,.07);
    }

    /* Stat cards */
    .tt-stat {
      position: relative; overflow: hidden;
      border-radius: 16px; padding: 22px 20px 18px;
      border: 1.5px solid var(--border);
      background: var(--white);
      box-shadow: 0 1px 3px rgba(8,33,62,.05), 0 6px 20px rgba(8,33,62,.07);
      transition: transform .15s ease, box-shadow .15s ease;
    }
    .tt-stat:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(8,33,62,.12); }

    /* Rows */
    .tt-row + .tt-row { border-top: 1px solid var(--blue-light); }

    /* Badge overrides */
    .badge {
      font-family: 'Plus Jakarta Sans', sans-serif !important;
      font-size: 11.5px !important; font-weight: 700 !important;
      padding: 4px 11px !important; border-radius: 20px !important;
      border-width: 1.5px !important; border-style: solid !important;
    }
    .badge-confirmed  { color: #047857 !important; background: #ECFDF5 !important; border-color: #A7F3D0 !important; }
    .badge-pending    { color: #B45309 !important; background: #FFFBEB !important; border-color: #FDE68A !important; }
    .badge-cancelled  { color: #DC2626 !important; background: #FEF2F2 !important; border-color: #FECACA !important; }
    .badge-completed  { color: var(--blue) !important; background: var(--blue-light) !important; border-color: var(--sky) !important; }

    /* Fade-up animations */
    @keyframes ttUp {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .tt-a0 { animation: ttUp .38s .00s ease both; }
    .tt-a1 { animation: ttUp .38s .07s ease both; }
    .tt-a2 { animation: ttUp .38s .14s ease both; }
    .tt-a3 { animation: ttUp .38s .21s ease both; }
    .tt-a4 { animation: ttUp .38s .28s ease both; }
  `;
  document.head.appendChild(style);
}

/* ─────────────────────────────────────────────
   Stat colour themes
───────────────────────────────────────────── */
const STAT_THEMES = [
  // first card: solid blue gradient (hero)
  {
    card:    'linear-gradient(140deg, #1E6BF1 0%, #0A3FA0 100%)',
    border:  'transparent',
    icon:    'rgba(255,255,255,.20)',
    val:     '#fff',
    lbl:     'rgba(255,255,255,.72)',
    delta:   'rgba(255,255,255,.90)',
    circle:  'rgba(255,255,255,.10)',
  },
  // second: light blue tint
  {
    card:    '#fff',
    border:  '#D5E3F7',
    icon:    '#DBEAFE',
    val:     '#08213E',
    lbl:     '#6B7280',
    delta:   '#1558D6',
    circle:  'rgba(21,88,214,.06)',
  },
  // third: same light blue
  {
    card:    '#fff',
    border:  '#D5E3F7',
    icon:    '#DBEAFE',
    val:     '#08213E',
    lbl:     '#6B7280',
    delta:   '#1558D6',
    circle:  'rgba(21,88,214,.06)',
  },
  // fourth: light yellow tint (accent warmth)
  {
    card:    '#fff',
    border:  '#FDE68A',
    icon:    '#FFFBEB',
    val:     '#08213E',
    lbl:     '#6B7280',
    delta:   '#B45309',
    circle:  'rgba(245,158,11,.06)',
  },
];

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export function DashboardView({ firstName, upcomingBookings, stats, notifications, onBookSession, onNavClick }) {
  return (
    <div
      className="page-content"
      style={{ padding: '32px 28px', width: '100%', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >

      {/* ══ PAGE HEADER ══ */}
      <div className="tt-a0" style={{ marginBottom: '28px' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px',
        }}>

          {/* left: title */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'stretch' }}>
            {/* blue accent strip */}
            <div style={{
              width: '4px', borderRadius: '4px',
              background: 'linear-gradient(to bottom, #2E71F0, #1045B8)',
              flexShrink: 0,
            }} />
            <div>
              <h1 style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: '23px', fontWeight: 800,
                color: '#08213E', letterSpacing: '-0.4px', lineHeight: 1.2,
              }}>
                Good afternoon, {firstName} 👋
              </h1>
              <p style={{ color: '#6B7280', fontSize: '13.5px', fontWeight: 400, marginTop: '5px' }}>
                Here's what's happening with your sessions today.
              </p>
            </div>
          </div>

          <button className="tt-btn-primary" onClick={() => onNavClick('tutors')}>
            <span style={{ fontSize: '16px', lineHeight: 1, marginTop: '-1px' }}>＋</span>
            Book a Session
          </button>
        </div>
      </div>

      {/* ══ STATS GRID ══ */}
      <div
        className="stats-grid tt-a1"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '26px',
        }}
      >
        {stats.map((s, i) => {
          const t = STAT_THEMES[i % STAT_THEMES.length];
          return (
            <div
              key={i}
              className={`stat-card tt-stat`}
              style={{ background: t.card, borderColor: t.border }}
            >
              {/* decorative circle */}
              <div style={{
                position: 'absolute', top: '-28px', right: '-28px',
                width: '100px', height: '100px', borderRadius: '50%',
                background: t.circle, pointerEvents: 'none',
              }} />

              {/* icon */}
              <div style={{
                width: '40px', height: '40px', borderRadius: '11px',
                background: t.icon,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', marginBottom: '16px',
              }}>
                {s.icon}
              </div>

              {/* value */}
              <div
                className="stat-value"
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '30px', fontWeight: 800, letterSpacing: '-0.8px',
                  color: t.val, lineHeight: 1, marginBottom: '5px',
                }}
              >
                {s.value}
              </div>

              {/* label */}
              <div
                className="stat-label"
                style={{ fontSize: '12.5px', fontWeight: 500, color: t.lbl, marginBottom: '6px' }}
              >
                {s.label}
              </div>

              {/* delta */}
              <div
                className="stat-delta"
                style={{ fontSize: '11.5px', fontWeight: 700, color: t.delta }}
              >
                {s.delta}
              </div>
            </div>
          );
        })}
      </div>

      {/* ══ TWO COLUMNS ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* ── Upcoming Sessions ── */}
        <div className="tt-card tt-a2" style={{ padding: '20px 22px' }}>

          {/* card head */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '14px', paddingBottom: '13px',
            borderBottom: '1.5px solid #EBF1FD',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: '#EBF1FD',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px',
              }}>
                📅
              </div>
              <h2 style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: '14px', fontWeight: 700, color: '#08213E',
              }}>
                Upcoming Sessions
              </h2>
            </div>
            <button className="tt-btn-ghost" onClick={() => onNavClick('bookings')}>
              View All →
            </button>
          </div>

          {/* empty */}
          {upcomingBookings.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '28px 0',
              color: '#9CA3AF', fontSize: '13px', fontWeight: 500,
            }}>
              <div style={{
                width: '46px', height: '46px', borderRadius: '12px',
                background: '#EBF1FD', margin: '0 auto 10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
              }}>📭</div>
              No upcoming sessions yet
            </div>
          )}

          {/* rows */}
          {upcomingBookings.slice(0, 3).map((b, i) => (
            <div
              key={b.id}
              className="booking-row tt-row"
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 0',
                borderTop: i === 0 ? 'none' : '1px solid #EBF1FD',
              }}
            >
              <Avatar initials={b.avatar} size={40} />

              <div className="booking-info" style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 700, fontSize: '13.5px', color: '#08213E',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  marginBottom: '2px',
                }}>
                  {b.tutor}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500, marginBottom: '1px' }}>
                  {b.subject} · {b.date}, {b.time}
                </div>
                <div style={{ fontSize: '11.5px', color: '#9CA3AF' }}>
                  📍 {b.location}
                </div>
              </div>

              <StatusBadge status={b.status} />
            </div>
          ))}
        </div>

        {/* ── Recent Activity ── */}
        <div className="tt-card tt-a3" style={{ padding: '20px 22px' }}>

          {/* card head */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '9px',
            marginBottom: '14px', paddingBottom: '13px',
            borderBottom: '1.5px solid #EBF1FD',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: '#FFFBEB',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px',
            }}>
              🔔
            </div>
            <h2 style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '14px', fontWeight: 700, color: '#08213E',
            }}>
              Recent Activity
            </h2>
          </div>

          {/* empty */}
          {notifications.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '28px 0',
              color: '#9CA3AF', fontSize: '13px', fontWeight: 500,
            }}>
              <div style={{
                width: '46px', height: '46px', borderRadius: '12px',
                background: '#FFFBEB', margin: '0 auto 10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
              }}>🔕</div>
              No recent activity
            </div>
          )}

          {/* rows */}
          {notifications.slice(0, 5).map((n, i) => (
            <div
              key={n.id}
              className="activity-row tt-row"
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '11px',
                padding: '10px 0',
                borderTop: i === 0 ? 'none' : '1px solid #EBF1FD',
              }}
            >
              {/* dot */}
              <div style={{ paddingTop: '5px', flexShrink: 0 }}>
                {n.read ? (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D1D5DB' }} />
                ) : (
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: '#2E71F0',
                    boxShadow: '0 0 0 3.5px rgba(46,113,240,.18)',
                  }} />
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '13px',
                  color: n.read ? '#374151' : '#08213E',
                  fontWeight: n.read ? 400 : 600,
                  lineHeight: 1.45, marginBottom: '2px',
                }}>
                  {n.text}
                </div>
                <div style={{ fontSize: '11.5px', color: '#9CA3AF', fontWeight: 500 }}>
                  🕐 {n.time}
                </div>
              </div>

              {/* unread indicator pill */}
              {!n.read && (
                <div style={{
                  flexShrink: 0, marginTop: '4px',
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: '#F59E0B',
                }} />
              )}
            </div>
          ))}
        </div>

      </div>{/* end two-col */}
    </div>
  );
}