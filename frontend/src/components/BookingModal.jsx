import { Avatar } from './Avatar';

function parseTimeToMinutes(value) {
  if (!value) return null;
  const text = String(value).trim().toUpperCase();
  const amPmMatch = text.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (amPmMatch) {
    let hours = Number(amPmMatch[1]);
    const minutes = Number(amPmMatch[2]);
    const period = amPmMatch[3];
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return (hours * 60) + minutes;
  }
  const hmMatch = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (hmMatch) return (Number(hmMatch[1]) * 60) + Number(hmMatch[2]);
  return null;
}
function formatMinutesTo12Hour(totalMinutes) {
  const h24 = Math.floor(totalMinutes / 60);
  const min = totalMinutes % 60;
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(min).padStart(2, '0')} ${period}`;
}
function toIsoDate(value) {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return String(value);
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return '';
}
function normalizeTimeLabel(value) {
  const mins = parseTimeToMinutes(value);
  return mins == null ? String(value || '') : formatMinutesTo12Hour(mins);
}
function extractBookedTimes(slot, selectedDate) {
  const booked = new Set();
  const addTime = (timeValue) => {
    const normalized = normalizeTimeLabel(timeValue);
    if (normalized) booked.add(normalized);
  };

  if (!slot || typeof slot !== 'object') return booked;

  (slot.bookedTimes || slot.bookedTimeSlots || slot.unavailableTimes || []).forEach(addTime);

  if (slot.bookedTimesByDate && selectedDate && Array.isArray(slot.bookedTimesByDate[selectedDate])) {
    slot.bookedTimesByDate[selectedDate].forEach(addTime);
  }

  if (Array.isArray(slot.bookings)) {
    const targetDate = toIsoDate(selectedDate);
    slot.bookings.forEach((booking) => {
      const status = String(booking?.status || booking?.bookingStatus || '').toUpperCase();
      if (status === 'CANCELLED') return;
      const bookingDate = toIsoDate(booking?.bookingDate || booking?.date || booking?.slotStart || booking?.slot_start);
      if (targetDate && bookingDate && bookingDate !== targetDate) return;
      addTime(booking?.bookingTime || booking?.time || booking?.slotTime || booking?.slot_start);
    });
  }

  return booked;
}
function generateSlotTimeOptions(slot) {
  if (!slot?.startTime || !slot?.endTime) return [];
  const s = parseTimeToMinutes(slot.startTime), e = parseTimeToMinutes(slot.endTime);
  if (s == null || e == null || s >= e) return [];
  const opts = [];
  for (let c = s; c < e; c += 30) opts.push(formatMinutesTo12Hour(c));
  return opts;
}
function isDateMatchingSlotDay(dateValue, slotDay) {
  if (!dateValue || !slotDay) return true;
  const sel = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(sel.getTime())) return false;
  return sel.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase() === String(slotDay).toUpperCase();
}

export function BookingModal({
  bookingTutor,
  selectedAvailability,
  locationOptions,
  bookForm,
  setBookForm,
  bookSuccess,
  studentBookedTimes,
  onConfirmBooking,
  onClose,
}) {
  if (!bookingTutor) return null;
  const timeOptions = selectedAvailability ? generateSlotTimeOptions(selectedAvailability) : [];
  const dateOk = isDateMatchingSlotDay(bookForm.date, selectedAvailability?.dayOfWeek);
  const unavailableFromSlot = extractBookedTimes(selectedAvailability, bookForm.date);
  const unavailableFromStudent = new Set((studentBookedTimes || []).map(normalizeTimeLabel));
  const blockedTimes = new Set([...unavailableFromSlot, ...unavailableFromStudent]);
  const locationName = (locationOptions || []).find(o => o.id === bookForm.locationId)?.name || 'Unspecified';
  const canConfirm = bookForm.date && bookForm.time && bookForm.locationId && dateOk && !blockedTimes.has(normalizeTimeLabel(bookForm.time));

  return (
    <div className="tt-modal-overlay" onClick={onClose}>
      <div className="tt-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '490px' }}>

        {/* Header */}
        <div className="tt-modal-head" style={{ background: bookSuccess ? 'linear-gradient(135deg,#047857,#059669)' : 'linear-gradient(135deg,#2E71F0,#1045B8)' }}>
          <h2 className="tt-modal-title">{bookSuccess ? '🎉 Session Booked!' : '📅 Book a Session'}</h2>
          <button className="tt-modal-close" onClick={onClose}>✕</button>
        </div>

        {bookSuccess ? (
          <div style={{ padding: '40px 28px', textAlign: 'center' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#ECFDF5', border: '3px solid #A7F3D0', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>📅</div>
            <p style={{ fontFamily: "'Sora',sans-serif", fontSize: '18px', fontWeight: 800, color: '#08213E', marginBottom: '8px' }}>You're all set!</p>
            <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.65, marginBottom: '14px' }}>
              Your session with <strong>{bookingTutor.name}</strong> on <strong>{new Date(bookForm.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</strong> at <strong>{bookForm.time}</strong> has been confirmed.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ECFDF5', border: '1.5px solid #A7F3D0', borderRadius: '10px', padding: '7px 16px', fontSize: '13px', color: '#047857', fontWeight: 600, marginBottom: '22px' }}>
              📍 {locationName}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              {/* ✅ UPDATED: "Book Another" keeps modal open and resets form */}
              <button className="tt-btn-primary" onClick={() => {
                setBookForm({ date: '', time: '', locationId: '', notes: '' });
                // Note: bookSuccess state is handled by parent, this is just to show we're ready for another booking
              }} style={{ background: 'linear-gradient(135deg,#2E71F0,#1045B8)' }}>+ Book Another</button>
              {/* "Done" closes the modal */}
              <button className="tt-btn-ghost" onClick={onClose}>Done</button>
            </div>
          </div>
        ) : (
          <>
            <div className="tt-modal-body">
              {/* Tutor summary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#F5F8FF', borderRadius: '12px', padding: '12px 14px', border: '1px solid #D5E3F7' }}>
                <Avatar initials={bookingTutor.avatar} size={44} />
                <div>
                  <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#08213E', marginBottom: '2px' }}>{bookingTutor.name}</div>
                  <div style={{ fontSize: '12.5px', color: '#6B7280', fontWeight: 500 }}>{bookingTutor.subject} · {bookingTutor.rate}</div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="tt-label">Subject</label>
                <input className="tt-input" value={selectedAvailability?.subject || bookingTutor.subject || ''} readOnly style={{ color: '#9CA3AF', cursor: 'not-allowed', background: '#F1F5F9' }} />
              </div>

              {/* Date */}
              <div>
                <label className="tt-label">Date <span style={{ color: '#DC2626' }}>*</span></label>
                <input className="tt-input" type="date" min={new Date().toISOString().split('T')[0]} value={bookForm.date} onChange={e => setBookForm({ ...bookForm, date: e.target.value })} />
                {selectedAvailability?.dayOfWeek && (
                  <div style={{ marginTop: 6, fontSize: 12, fontWeight: 500, color: dateOk ? '#047857' : '#DC2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {dateOk ? '✓' : '⚠️'} {dateOk ? `Available only on ${selectedAvailability.dayOfWeek}.` : `Please pick a ${selectedAvailability.dayOfWeek} date.`}
                  </div>
                )}
              </div>

              {/* Time */}
              <div>
                <label className="tt-label">Time <span style={{ color: '#DC2626' }}>*</span></label>
                <select className="tt-input" value={bookForm.time} onChange={e => setBookForm({ ...bookForm, time: e.target.value })}>
                  <option value="">Select a time slot</option>
                  {(timeOptions.length > 0 ? timeOptions : [bookForm.time].filter(Boolean)).map((o) => {
                    const normalized = normalizeTimeLabel(o);
                    const blocked = blockedTimes.has(normalized);
                    return (
                      <option key={o} value={o} disabled={blocked}>
                        {blocked ? `${o} (Booked)` : o}
                      </option>
                    );
                  })}
                </select>
                {bookForm.date && blockedTimes.size > 0 && (
                  <div style={{ marginTop: 6, fontSize: 12, fontWeight: 500, color: '#DC2626' }}>
                    Booked slots are disabled.
                  </div>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="tt-label">Location</label>
                <select className="tt-input" value={bookForm.locationId || ''} onChange={e => setBookForm({ ...bookForm, locationId: e.target.value })}>
                  <option value="">Select location</option>
                  {(locationOptions || []).map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="tt-label">Notes <span style={{ color: '#9CA3AF', fontWeight: 500, fontSize: '11px', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                <textarea className="tt-input modal-textarea" placeholder="Topics you'd like to cover, questions to prepare, etc." value={bookForm.notes} onChange={e => setBookForm({ ...bookForm, notes: e.target.value })} style={{ resize: 'vertical', minHeight: '80px', height: 'auto', lineHeight: 1.55 }} />
              </div>
            </div>

            <div className="tt-modal-footer">
              <button className="tt-btn-ghost" onClick={onClose}>Cancel</button>
              <button
                className="tt-btn-primary"
                onClick={onConfirmBooking}
                disabled={!canConfirm}
                style={{ opacity: canConfirm ? 1 : .5 }}
              >
                Confirm Booking
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}