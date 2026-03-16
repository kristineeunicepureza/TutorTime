// ════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ════════════════════════════════════════════════════════════════════

export function getFirstName(fullName) {
  if (!fullName) return 'there';
  return fullName.split(' ')[0];
}

export function getInitials(fullName) {
  if (!fullName) return '?';
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Calculate stats dynamically from actual booking data
export function calculateStats(upcomingBookings, pastBookings) {
  const totalBooked = upcomingBookings.length + pastBookings.length;
  const completedBookings = pastBookings.filter(b => b.status === 'COMPLETED');
  const hoursPerSession = 1.5; // Assume 1.5 hours per session
  const totalHours = Math.round(completedBookings.length * hoursPerSession * 10) / 10;
  
  return [
    { 
      label: 'Sessions Booked', 
      value: totalBooked, 
      delta: `${upcomingBookings.length} upcoming`, 
      icon: '📅', 
      colorClass: 'stat-blue' 
    },
    { 
      label: 'Hours Learned', 
      value: `${totalHours}h`, 
      delta: `${completedBookings.length} completed`, 
      icon: '⏱️', 
      colorClass: 'stat-green' 
    },
    { 
      label: 'Active Bookings', 
      value: upcomingBookings.filter(b => b.status !== 'CANCELLED').length, 
      delta: `${pastBookings.filter(b => b.status === 'CANCELLED').length} cancelled`, 
      icon: '👥', 
      colorClass: 'stat-amber' 
    },
    { 
      label: 'Upcoming Sessions', 
      value: upcomingBookings.length, 
      delta: upcomingBookings.length > 0 ? `Next: ${upcomingBookings[0]?.time || 'TBD'}` : 'None scheduled', 
      icon: '🔔', 
      colorClass: 'stat-purple' 
    },
  ];
}

// Create a new notification from a booking event
export function createNotification(booking, type = 'booked') {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const messages = {
    booked: `Session with ${booking.tutor} booked for ${booking.date} at ${booking.time}`,
    cancelled: `Your session with ${booking.tutor} on ${booking.date} has been cancelled`,
    updated: `Session with ${booking.tutor} updated to ${booking.date} at ${booking.time}`,
  };
  return {
    id: Date.now(),
    text: messages[type] || messages.booked,
    time: 'now',
    read: false,
    timestamp,
  };
}

// Normalize tutor data from backend
export function normalizeTutor(t) {
  const approval = (t.approvalStatus || t.status || '').toString().toUpperCase();
  const isVerified = t.verified === true || t.isVerified === true || approval === 'APPROVED';

  return {
    ...t,
    avatar: t.avatarInitials || getInitials(t.name),
    tags: Array.isArray(t.tags) ? t.tags : (t.tags ? t.tags.split(',').map(s => s.trim()) : []),
    availability: Array.isArray(t.availability) ? t.availability : (t.availability ? t.availability.split(',').map(s => s.trim()) : []),
    reviews: Array.isArray(t.reviews) ? t.reviews : [],
    verified: isVerified,
  };
}

// Normalize booking data from backend
export function normalizeBooking(b) {
  return {
    ...b,
    status: (b.status || 'UNKNOWN').toString().toUpperCase(),
    tutor: b.tutorName,
    avatar: b.avatarInitials || getInitials(b.tutorName || ''),
    date: b.date ? new Date(b.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
  };
}

// Calculate session statistics for profile
export function calculateSessionStats(upcomingBookings, pastBookings) {
  const totalBooked = upcomingBookings.length + pastBookings.length;
  const completedBookings = pastBookings.filter(b => b.status === 'COMPLETED');
  const cancelledBookings = [...upcomingBookings, ...pastBookings].filter(b => b.status === 'CANCELLED');
  const hoursPerSession = 1.5; // Assume 1.5 hours per session
  const totalHours = Math.round(completedBookings.length * hoursPerSession * 10) / 10;
  
  // Calculate favourite subject (most frequently booked)
  const subjectCounts = {};
  [...upcomingBookings, ...pastBookings].forEach(b => {
    if (b.subject) {
      subjectCounts[b.subject] = (subjectCounts[b.subject] || 0) + 1;
    }
  });
  const favouriteSubject = Object.keys(subjectCounts).length > 0 
    ? Object.keys(subjectCounts).reduce((a, b) => subjectCounts[a] > subjectCounts[b] ? a : b)
    : 'None yet';

  return [
    { label: 'Total Sessions Booked', value: totalBooked.toString() },
    { label: 'Sessions Completed', value: completedBookings.length.toString() },
    { label: 'Sessions Cancelled', value: cancelledBookings.length.toString() },
    { label: 'Total Hours Learned', value: `${totalHours} hrs` },
    { label: 'Favourite Subject', value: favouriteSubject },
  ];
}
