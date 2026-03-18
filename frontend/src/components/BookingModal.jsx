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
  if (hmMatch) {
    const hours = Number(hmMatch[1]);
    const minutes = Number(hmMatch[2]);
    return (hours * 60) + minutes;
  }

  return null;
}

function formatMinutesTo12Hour(totalMinutes) {
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
}

function generateSlotTimeOptions(slot) {
  if (!slot?.startTime || !slot?.endTime) return [];
  const startMinutes = parseTimeToMinutes(slot.startTime);
  const endMinutes = parseTimeToMinutes(slot.endTime);
  if (startMinutes == null || endMinutes == null || startMinutes >= endMinutes) return [];

  const options = [];
  for (let cursor = startMinutes; cursor < endMinutes; cursor += 30) {
    options.push(formatMinutesTo12Hour(cursor));
  }
  return options;
}

function isDateMatchingSlotDay(dateValue, slotDay) {
  if (!dateValue || !slotDay) return true;
  const selected = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(selected.getTime())) return false;
  const selectedDay = selected
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toUpperCase();
  return selectedDay === String(slotDay).toUpperCase();
}

export function BookingModal({
  bookingTutor,
  selectedAvailability,
  locationOptions,
  bookForm,
  setBookForm,
  bookSuccess,
  onConfirmBooking,
  onClose,
}) {
  if (!bookingTutor) return null;

  const timeOptions = selectedAvailability ? generateSlotTimeOptions(selectedAvailability) : [];
  const dateMatchesSlotDay = isDateMatchingSlotDay(bookForm.date, selectedAvailability?.dayOfWeek);
  const selectedLocationName =
    (locationOptions || []).find(option => option.id === bookForm.locationId)?.name ||
    'Unspecified';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {bookSuccess ? '🎉 Session Booked!' : 'Book a Session'}
          </h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {bookSuccess ? (
          <div className="book-success">
            <div className="book-success-icon">📅</div>
            <p className="book-success-title">You're all set!</p>
            <p className="book-success-sub">
              Your session with <strong>{bookingTutor.name}</strong> on{' '}
              <strong>{new Date(bookForm.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</strong>{' '}
              at <strong>{bookForm.time}</strong> has been confirmed.
            </p>
            <div className="book-success-detail">📍 {selectedLocationName}</div>
            <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
              <button className="btn-ghost" onClick={onClose}>Close</button>
            </div>
          </div>
        ) : (
          <>
            <div className="modal-body">
              <div className="book-tutor-summary">
                <Avatar initials={bookingTutor.avatar} size={44} />
                <div>
                  <div className="book-tutor-name">{bookingTutor.name}</div>
                  <div className="book-tutor-subject">{bookingTutor.subject} · {bookingTutor.rate}</div>
                </div>
              </div>

              <div className="modal-field">
                <label className="modal-label">Subject</label>
                <input
                  className="modal-input"
                  value={selectedAvailability?.subject || bookingTutor.subject || ''}
                  readOnly
                  style={{ color: 'var(--text-muted)', cursor: 'not-allowed' }}
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">Date <span className="required">*</span></label>
                <input
                  className="modal-input"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={bookForm.date}
                  onChange={e => setBookForm({ ...bookForm, date: e.target.value })}
                />
                {selectedAvailability?.dayOfWeek && (
                  <div style={{ marginTop: 6, fontSize: 12, color: dateMatchesSlotDay ? '#6b7280' : '#dc2626' }}>
                    {dateMatchesSlotDay
                      ? `This slot is available only on ${selectedAvailability.dayOfWeek}.`
                      : `Please pick a ${selectedAvailability.dayOfWeek} date.`}
                  </div>
                )}
              </div>

              <div className="modal-field">
                <label className="modal-label">Time <span className="required">*</span></label>
                <select
                  className="modal-input"
                  value={bookForm.time}
                  onChange={e => setBookForm({ ...bookForm, time: e.target.value })}
                >
                  <option value="">Select a time slot</option>
                  {(timeOptions.length > 0 ? timeOptions : [bookForm.time].filter(Boolean)).map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="modal-field">
                <label className="modal-label">Location</label>
                <select
                  className="modal-input"
                  value={bookForm.locationId || ''}
                  onChange={e => setBookForm({ ...bookForm, locationId: e.target.value })}
                >
                  <option value="">Select location</option>
                  {(locationOptions || []).map(option => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </select>
              </div>

              <div className="modal-field">
                <label className="modal-label">Notes <span className="optional">(optional)</span></label>
                <textarea
                  className="modal-input modal-textarea"
                  placeholder="Topics you'd like to cover, questions to prepare, etc."
                  value={bookForm.notes}
                  onChange={e => setBookForm({ ...bookForm, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-ghost" onClick={onClose}>Cancel</button>
              <button
                className="btn-primary"
                onClick={onConfirmBooking}
                disabled={!bookForm.date || !bookForm.time || !bookForm.locationId || !dateMatchesSlotDay}
                style={{ opacity: (!bookForm.date || !bookForm.time || !bookForm.locationId || !dateMatchesSlotDay) ? 0.5 : 1 }}
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
