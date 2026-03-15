import { Avatar } from './Avatar';

export function BookingModal({ bookingTutor, bookForm, setBookForm, bookSuccess, onConfirmBooking, onClose }) {
  if (!bookingTutor) return null;
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
            <div className="book-success-detail">📍 {bookingTutor.location}</div>
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
                <label className="modal-label">Date <span className="required">*</span></label>
                <input
                  className="modal-input"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={bookForm.date}
                  onChange={e => setBookForm({ ...bookForm, date: e.target.value })}
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">Time <span className="required">*</span></label>
                <select
                  className="modal-input"
                  value={bookForm.time}
                  onChange={e => setBookForm({ ...bookForm, time: e.target.value })}
                >
                  <option value="">Select a time slot</option>
                  <option>8:00 AM</option>
                  <option>9:00 AM</option>
                  <option>10:00 AM</option>
                  <option>11:00 AM</option>
                  <option>1:00 PM</option>
                  <option>2:00 PM</option>
                  <option>3:00 PM</option>
                  <option>4:00 PM</option>
                  <option>5:00 PM</option>
                  <option>6:00 PM</option>
                </select>
              </div>

              <div className="modal-field">
                <label className="modal-label">Location</label>
                <input
                  className="modal-input"
                  value={bookingTutor.location}
                  readOnly
                  style={{ color: 'var(--text-muted)', cursor: 'not-allowed' }}
                />
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
                disabled={!bookForm.date || !bookForm.time}
                style={{ opacity: (!bookForm.date || !bookForm.time) ? 0.5 : 1 }}
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
