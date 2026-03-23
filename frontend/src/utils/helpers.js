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
  const booking = (b && typeof b === 'object' && b.data && typeof b.data === 'object') ? b.data : (b || {});

  const formatDateDisplay = (dateValue, slotStartValue) => {
    if (dateValue) {
      const parsedDate = new Date(dateValue);
      if (!Number.isNaN(parsedDate.getTime())) {
        return parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      const isoDateMatch = String(dateValue).match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (isoDateMatch) {
        const dateFromIso = new Date(`${isoDateMatch[1]}-${isoDateMatch[2]}-${isoDateMatch[3]}T00:00:00`);
        if (!Number.isNaN(dateFromIso.getTime())) {
          return dateFromIso.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
      }
      return String(dateValue);
    }

    if (slotStartValue) {
      const parsed = new Date(slotStartValue);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    }

    return '';
  };

  const formatTimeDisplay = (timeValue, slotStartValue) => {
    if (timeValue) {
      const parsedTime = new Date(`1970-01-01T${timeValue}`);
      if (!Number.isNaN(parsedTime.getTime())) {
        return parsedTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      }

      const regexMatch = String(timeValue).match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
      if (regexMatch) {
        const hours = Number(regexMatch[1]);
        const minutes = regexMatch[2];
        const period = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 === 0 ? 12 : hours % 12;
        return `${hour12}:${minutes} ${period}`;
      }

      return String(timeValue);
    }

    if (slotStartValue) {
      const parsed = new Date(slotStartValue);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      }
    }

    return '';
  };

  const tutorName =
    booking.tutorName ||
    booking.tutor_name ||
    booking.tutorFullName ||
    booking.tutorDisplayName ||
    (typeof booking.tutor === 'string' ? booking.tutor : null) ||
    booking.tutor?.name ||
    booking.tutor?.fullName ||
    booking.teacherName ||
    (booking.tutorId ? `Tutor ${String(booking.tutorId).slice(0, 8)}` : 'Unknown Tutor');

  const slotStart = booking.slotStart || booking.slot_start;
  const date = formatDateDisplay(booking.date || booking.bookingDate, slotStart);
  const time = formatTimeDisplay(booking.time || booking.bookingTime, slotStart);
  const location =
    booking.locationName ||
    booking.location?.name ||
    booking.location ||
    booking.locationId ||
    'Online';
  
  return {
    ...booking,
    id: booking.id || booking.bookingId || booking.uuid,
    status: (booking.status || booking.bookingStatus || 'UNKNOWN').toString().trim().toUpperCase(),
    tutor: tutorName,
    avatar: booking.avatarInitials || getInitials(tutorName || 'Unknown'),
    date,
    time,
    subject: booking.subject || booking.topic || 'General Tutoring',
    location,
    notes: booking.notes || '',
    durationMinutes: booking.durationMinutes,
    price: booking.price,
    cancellationReason: booking.cancellationReason || booking.cancelReason || '',
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
