import { useState, useEffect } from 'react';
import { Avatar } from './Avatar';

// Normalize availability slots from backend
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
  };
}

// Format day of week display
function formatDayOfWeek(day) {
  const daysMap = {
    'MONDAY': 'Mon', 'TUESDAY': 'Tue', 'WEDNESDAY': 'Wed', 'THURSDAY': 'Thu',
    'FRIDAY': 'Fri', 'SATURDAY': 'Sat', 'SUNDAY': 'Sun'
  };
  return daysMap[day?.toUpperCase()] || day;
}

// Format time range display
function formatTimeRange(startTime, endTime) {
  return `${startTime} - ${endTime}`;
}

export function TutorProfile({ tutor, onBack, onBookSession }) {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const tutorId = tutor?.id;

  // Fetch tutor's availability slots when tutor changes
  useEffect(() => {
    if (!tutorId) {
      setSlotsLoading(false);
      return;
    }

    setSlotsLoading(true);
    
    // Fetch availability slots for this tutor (public endpoint, no auth required)
    fetch(`/api/availability/tutor/${tutorId}`)
      .then(r => r.json())
      .then(data => {
        // Handle wrapped response
        const rawSlots = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        const normalized = rawSlots.map(normalizeAvailabilitySlot).filter(Boolean);
        setAvailableSlots(normalized);
        setSlotsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch availability slots:', err);
        setSlotsLoading(false);
      });
  }, [tutorId]);

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
          <button
            className="btn-primary"
            onClick={() => onBookSession(tutor, availableSlots[0] || null)}
            disabled={availableSlots.length === 0}
            style={{ opacity: availableSlots.length === 0 ? 0.6 : 1 }}
          >
            📅 {availableSlots.length === 0 ? 'No Slots Available' : 'Book Session'}
          </button>
        </div>
      </div>

      <div className="two-col" style={{ marginTop: 24 }}>
        <div className="card">
          <h2 className="section-title" style={{ marginBottom: 14 }}>About</h2>
          <p className="tutor-bio">{tutor.bio}</p>

          <h2 className="section-title" style={{ margin: '20px 0 12px' }}>Available Time Slots</h2>
          <div className="availability-grid">
            {slotsLoading ? (
              <div style={{ color: '#888', padding: '16px' }}>Loading availability...</div>
            ) : availableSlots.length === 0 ? (
              <div style={{ color: '#888', padding: '16px' }}>No available slots at the moment</div>
            ) : (
              availableSlots.map(slot => (
                <div key={slot.id} className="availability-slot">
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                    {formatDayOfWeek(slot.dayOfWeek)}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666', marginTop: 4 }}>
                    {formatTimeRange(slot.startTime, slot.endTime)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: 2 }}>
                    📚 {slot.subject}
                  </div>
                  {slot.isRecurring && (
                    <div style={{ fontSize: '11px', color: '#666', marginTop: 4 }}>
                      🔁 Recurring
                    </div>
                  )}
                  {slot.isBooked && (
                    <div style={{ fontSize: '11px', color: '#d9534f', marginTop: 4 }}>
                      ⏰ Already Booked
                    </div>
                  )}
                  {!slot.isBooked && (
                    <button
                      className="btn-primary"
                      style={{ marginTop: 10, padding: '6px 10px', fontSize: '12px' }}
                      onClick={() => onBookSession(tutor, slot)}
                    >
                      Book This Slot
                    </button>
                  )}
                </div>
              ))
            )}
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
