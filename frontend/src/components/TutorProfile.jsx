import { useState, useEffect } from 'react';
import { Avatar } from './Avatar';
import { getTutorAvailability } from '../apiService';

function normalizeAvailabilitySlot(slot) {
  if (!slot || typeof slot !== 'object') return null;
  return {
    id: slot.id,
    dayOfWeek: slot.dayOfWeek || slot.day_of_week || '-',
    startTime: slot.startTime || slot.start_time || '-',
    endTime: slot.endTime || slot.end_time || '-',
    subject: slot.subject || '-',
    isRecurring: slot.isRecurring ?? slot.is_recurring ?? false,
    isBooked: slot.isBooked ?? slot.is_booked ?? false,
    bookedTimes: Array.isArray(slot.bookedTimes) ? slot.bookedTimes : (Array.isArray(slot.booked_times) ? slot.booked_times : []),
    bookedTimesByDate: slot.bookedTimesByDate || slot.booked_times_by_date || {},
    bookings: Array.isArray(slot.bookings) ? slot.bookings : [],
  };
}
function formatDayOfWeek(day) {
  const m = { MONDAY:'Mon',TUESDAY:'Tue',WEDNESDAY:'Wed',THURSDAY:'Thu',FRIDAY:'Fri',SATURDAY:'Sat',SUNDAY:'Sun' };
  return m[day?.toUpperCase()] || day;
}
function formatTimeRange(s, e) { return `${s} – ${e}`; }

const DAY_BG = { Mon:'#EBF1FD', Tue:'#F0FDF4', Wed:'#FFFBEB', Thu:'#EBF1FD', Fri:'#F0F9FF', Sat:'#F5F3FF', Sun:'#FEF2F2' };
const DAY_COLOR = { Mon:'#1558D6', Tue:'#059669', Wed:'#B45309', Thu:'#1558D6', Fri:'#0284C7', Sat:'#7C3AED', Sun:'#DC2626' };

export function TutorProfile({ tutor, onBack, onBookSession, refreshToken = 0 }) {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const tutorId = tutor?.id;

  useEffect(() => {
    if (!tutorId) { setSlotsLoading(false); return; }
    setSlotsLoading(true);
    getTutorAvailability(tutorId)
      .then((data) => {
        const raw = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        setAvailableSlots(raw.map(normalizeAvailabilitySlot).filter(Boolean));
      })
      .catch(() => {
        setAvailableSlots([]);
      })
      .finally(() => {
        setSlotsLoading(false);
      });
  }, [tutorId, refreshToken]);

  if (!tutor) return null;

  return (
    <div className="page-content tt-a0" style={{ padding: '32px 28px', width: '100%', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>

      {/* ── Back ── */}
      <button
        className="back-btn"
        onClick={onBack}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          background: 'transparent', border: '1.5px solid #D5E3F7', borderRadius: '10px',
          padding: '7px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
          color: '#374151', marginBottom: '22px', transition: 'all .15s',
          fontFamily: "'Plus Jakarta Sans',sans-serif",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#2E71F0'; e.currentTarget.style.color = '#1558D6'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#D5E3F7'; e.currentTarget.style.color = '#374151'; }}
      >
        ← Back to Tutors
      </button>

      {/* ── Hero Card ── */}
      <div className="tt-card tt-a1" style={{ padding: '26px 28px', marginBottom: '22px', position: 'relative', overflow: 'hidden' }}>
        {/* decorative bg */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '220px', height: '180px', background: 'radial-gradient(ellipse,rgba(46,113,240,.07) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <Avatar initials={tutor.avatar} size={88} />

          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: '22px', fontWeight: 800, color: '#08213E', letterSpacing: '-0.3px' }}>
                {tutor.name}
              </h1>
              {tutor.verified && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 700, color: '#047857', background: '#ECFDF5', border: '1.5px solid #A7F3D0', borderRadius: '20px', padding: '3px 10px' }}>
                  ✓ Verified
                </span>
              )}
            </div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#1558D6', letterSpacing: '0.1em', marginBottom: '8px' }}>
              {tutor.subject.toUpperCase()}
            </div>
            <div style={{ fontSize: '13px', color: '#374151', fontWeight: 600, marginBottom: '10px' }}>
              ⭐ {tutor.rating} <span style={{ color: '#9CA3AF', fontWeight: 400 }}>({tutor.sessions} sessions)</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {tutor.tags.map(tag => (
                <span key={tag} style={{ fontSize: '11.5px', fontWeight: 600, color: '#1558D6', background: '#EBF1FD', borderRadius: '6px', padding: '3px 10px' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* meta box */}
          <div style={{ background: '#F5F8FF', borderRadius: '14px', padding: '16px 18px', border: '1.5px solid #D5E3F7', display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '190px' }}>
            {[['💰', tutor.rate], ['📍', tutor.location], ['⚡', `Replies ${tutor.responseTime}`]].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', fontWeight: 500 }}>
                <span>{icon}</span><span>{text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Two Col ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>

        {/* Available Slots */}
        <div className="tt-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '14px', paddingBottom: '13px', borderBottom: '1.5px solid #EBF1FD' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EBF1FD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🗓️</div>
            <h2 className="tt-section-title">Available Time Slots</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {slotsLoading && <div style={{ gridColumn: '1/-1', color: '#9CA3AF', fontSize: '13px', padding: '12px', textAlign: 'center' }}>⏳ Loading...</div>}
            {!slotsLoading && availableSlots.length === 0 && (
              <div style={{ gridColumn: '1/-1', color: '#9CA3AF', fontSize: '13px', padding: '18px', textAlign: 'center', background: '#F5F8FF', borderRadius: '10px', border: '1.5px dashed #C3D9F8' }}>
                📭 No available slots at the moment
              </div>
            )}
            {availableSlots.map(slot => {
              const dayShort = formatDayOfWeek(slot.dayOfWeek);
              const color = DAY_COLOR[dayShort] || '#1558D6';
              const bg    = DAY_BG[dayShort]    || '#EBF1FD';
              return (
                <div key={slot.id} style={{ background: bg, borderRadius: '12px', padding: '12px', border: `1.5px solid ${color}28` }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: color, marginBottom: '3px', fontFamily: "'Sora',sans-serif" }}>{dayShort}</div>
                  <div style={{ fontSize: '12px', color: '#374151', fontWeight: 500, marginBottom: '3px' }}>{formatTimeRange(slot.startTime, slot.endTime)}</div>
                  <div style={{ fontSize: '11.5px', color: '#9CA3AF', marginBottom: '6px' }}>📚 {slot.subject}</div>
                  {slot.isRecurring && <div style={{ fontSize: '10.5px', color: '#1558D6', fontWeight: 600, marginBottom: '4px' }}>🔁 Recurring</div>}
                  <button className="tt-btn-primary" style={{ width: '100%', marginTop: '8px', padding: '6px 0', fontSize: '11.5px', justifyContent: 'center', background: `linear-gradient(135deg,${color},${color}cc)`, boxShadow: `0 2px 8px ${color}44` }} onClick={() => onBookSession(tutor, slot)}>Book This Slot</button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}