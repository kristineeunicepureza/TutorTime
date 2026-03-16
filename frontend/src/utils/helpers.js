// ── String helpers ────────────────────────────────────────────────
export function getFirstName(name = '') {
  return name.trim().split(/\s+/)[0] || name;
}

export function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ── Stats ─────────────────────────────────────────────────────────
export function calculateStats(upcomingBookings = [], pastBookings = []) {
  const activeUpcoming = upcomingBookings.filter(b => b.status !== 'CANCELLED');
  const completed = pastBookings.filter(b => b.status === 'COMPLETED');
  const cancelled = pastBookings.filter(b => b.status === 'CANCELLED')
    .concat(upcomingBookings.filter(b => b.status === 'CANCELLED'));

  return [
    {
      icon: '📅',
      colorClass: 'blue',
      value: activeUpcoming.length,
      label: 'Upcoming Sessions',
      delta: activeUpcoming.length > 0 ? `${activeUpcoming.length} scheduled` : 'None scheduled',
    },
    {
      icon: '✅',
      colorClass: 'green',
      value: completed.length,
      label: 'Sessions Completed',
      delta: completed.length > 0 ? 'All time' : 'No sessions yet',
    },
    {
      icon: '🔍',
      colorClass: 'purple',
      value: upcomingBookings.length + pastBookings.length,
      label: 'Total Bookings',
      delta: 'All time',
    },
    {
      icon: '❌',
      colorClass: 'orange',
      value: cancelled.length,
      label: 'Cancelled',
      delta: cancelled.length > 0 ? 'All time' : 'None cancelled',
    },
  ];
}

// ── Notifications ─────────────────────────────────────────────────
let _notifCounter = Date.now();

export function createNotification(booking, type) {
  const tutorName = booking.tutor || 'your tutor';
  const date = booking.date || '';
  const time = booking.time || '';
  const dateStr = date && time ? ` on ${date} at ${time}` : date ? ` on ${date}` : '';

  const text =
    type === 'booked'
      ? `Session booked with ${tutorName}${dateStr}.`
      : `Session with ${tutorName}${dateStr} was cancelled.`;

  return {
    id: ++_notifCounter,
    text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: false,
  };
}

// ── Normalizers ───────────────────────────────────────────────────
export function normalizeTutor(raw = {}) {
  const name =
    raw.name ||
    [raw.firstName, raw.lastName].filter(Boolean).join(' ') ||
    'Unknown Tutor';

  const subject =
    raw.subject ||
    (Array.isArray(raw.subjects) ? raw.subjects[0] : raw.subjects) ||
    'General';

  return {
    id: raw.id ?? raw._id ?? Math.random(),
    name,
    subject,
    rating: raw.rating ?? raw.averageRating ?? 0,
    sessions: raw.sessions ?? raw.sessionsCompleted ?? raw.totalSessions ?? 0,
    avatar: getInitials(name),
    tags: Array.isArray(raw.tags) ? raw.tags : (raw.subjects ? [...(Array.isArray(raw.subjects) ? raw.subjects : [raw.subjects])] : [subject]),
    rate: raw.rate ?? raw.hourlyRate ?? raw.price ?? 'N/A',
    location: raw.location ?? raw.meetingLocation ?? 'Online',
    responseTime: raw.responseTime ?? raw.replyTime ?? 'within 24h',
    verified: raw.verified ?? raw.isVerified ?? false,
    bio: raw.bio ?? raw.description ?? raw.about ?? '',
    availability: Array.isArray(raw.availability) ? raw.availability : [],
    reviews: Array.isArray(raw.reviews) ? raw.reviews : [],
  };
}

export function normalizeBooking(raw = {}) {
  const tutorName =
    raw.tutorName ||
    (raw.tutor && typeof raw.tutor === 'object'
      ? raw.tutor.name || [raw.tutor.firstName, raw.tutor.lastName].filter(Boolean).join(' ')
      : raw.tutor) ||
    'Unknown Tutor';

  const subject =
    raw.subject ||
    (raw.tutor && typeof raw.tutor === 'object' ? raw.tutor.subject : '') ||
    'General';

  return {
    id: raw.id ?? raw._id ?? Math.random(),
    tutor: tutorName,
    subject,
    date: raw.date ?? raw.sessionDate ?? '',
    time: raw.time ?? raw.startTime ?? raw.sessionTime ?? '',
    location: raw.location ?? (raw.tutor && typeof raw.tutor === 'object' ? raw.tutor.location : '') ?? 'Online',
    status: raw.status ?? 'PENDING',
    notes: raw.notes ?? raw.message ?? '',
    avatar: getInitials(tutorName),
  };
}
