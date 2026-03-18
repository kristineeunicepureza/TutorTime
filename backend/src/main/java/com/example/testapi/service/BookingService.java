package com.example.testapi.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.example.testapi.entity.Availability;
import com.example.testapi.entity.Booking;
import com.example.testapi.entity.Location;
import com.example.testapi.entity.StudentProfile;
import com.example.testapi.entity.TutorProfile;
import com.example.testapi.entity.User;
import com.example.testapi.model.BookingDetailResponse;
import com.example.testapi.model.CancelBookingRequest;
import com.example.testapi.model.CreateBookingRequest;
import com.example.testapi.repository.AvailabilityRepository;
import com.example.testapi.repository.BookingRepository;
import com.example.testapi.repository.LocationRepository;
import com.example.testapi.repository.StudentProfileRepository;
import com.example.testapi.repository.TutorProfileRepository;
import com.example.testapi.repository.UserRepository;

@Service
public class BookingService {

    private static final String UNSPECIFIED_LOCATION_ID = "00000000-0000-0000-0000-000000000000";

    private void ensureDefaultBookingLocations() {
        List<String> defaults = List.of("Study Area", "Library");
        for (String name : defaults) {
            boolean exists = locationRepository.findByActive(true).stream()
                .anyMatch(loc -> loc.getName() != null && loc.getName().equalsIgnoreCase(name));
            if (!exists) {
                Location location = new Location();
                location.setName(name);
                location.setDescription("Default booking location option");
                location.setActive(true);
                locationRepository.save(location);
            }
        }
    }

    private DayOfWeek parseDayOfWeek(String dayOfWeekValue) {
        if (dayOfWeekValue == null || dayOfWeekValue.isBlank()) {
            throw new RuntimeException("Invalid dayOfWeek in availability slot");
        }

        String normalized = dayOfWeekValue.trim().toUpperCase();
        switch (normalized) {
            case "MON" -> normalized = "MONDAY";
            case "TUE", "TUES" -> normalized = "TUESDAY";
            case "WED" -> normalized = "WEDNESDAY";
            case "THU", "THUR", "THURS" -> normalized = "THURSDAY";
            case "FRI" -> normalized = "FRIDAY";
            case "SAT" -> normalized = "SATURDAY";
            case "SUN" -> normalized = "SUNDAY";
            default -> {
            }
        }

        try {
            return DayOfWeek.valueOf(normalized);
        } catch (Exception e) {
            throw new RuntimeException("Invalid dayOfWeek in availability slot");
        }
    }

    private LocalDate parseRequestDate(String dateValue) {
        if (dateValue == null || dateValue.isBlank()) {
            throw new RuntimeException("bookingDate is required");
        }

        String normalized = dateValue.trim();
        List<DateTimeFormatter> acceptedFormats = List.of(
            DateTimeFormatter.ISO_LOCAL_DATE,
            DateTimeFormatter.ofPattern("d/M/yyyy"),
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ofPattern("M/d/yyyy"),
            DateTimeFormatter.ofPattern("MM/dd/yyyy")
        );

        for (DateTimeFormatter formatter : acceptedFormats) {
            try {
                return LocalDate.parse(normalized, formatter);
            } catch (Exception ignored) {
                // Try next format.
            }
        }

        throw new RuntimeException("Invalid bookingDate format. Use yyyy-MM-dd or dd/MM/yyyy");
    }

    private String resolveLocationId(String locationInput) {
        ensureDefaultBookingLocations();

        if (locationInput == null || locationInput.isBlank()) {
            return ensureFallbackLocation().getId();
        }

        String normalized = locationInput.trim();

        // If frontend sends a location id, return it directly if it exists.
        if (locationRepository.findById(normalized).isPresent()) {
            return normalized;
        }

        Optional<Location> exactName = locationRepository.findByName(normalized);
        if (exactName.isPresent()) {
            return exactName.get().getId();
        }

        Optional<Location> caseInsensitiveMatch = locationRepository.findByActive(true).stream()
            .filter(loc -> loc.getName() != null && loc.getName().equalsIgnoreCase(normalized))
            .findFirst();
        if (caseInsensitiveMatch.isPresent()) {
            return caseInsensitiveMatch.get().getId();
        }

        return ensureFallbackLocation().getId();
    }

    private Location ensureFallbackLocation() {
        Optional<Location> existing = locationRepository.findById(UNSPECIFIED_LOCATION_ID);
        if (existing.isPresent()) {
            return existing.get();
        }

        Location fallback = new Location();
        fallback.setId(UNSPECIFIED_LOCATION_ID);
        fallback.setName("Unspecified");
        fallback.setDescription("Fallback location used when booking location is not provided.");
        fallback.setActive(true);
        return locationRepository.save(fallback);
    }

    private LocalTime parseRequestTime(String timeValue) {
        if (timeValue == null || timeValue.isBlank()) {
            return null;
        }

        String normalized = timeValue.trim().toUpperCase();
        List<DateTimeFormatter> acceptedFormats = List.of(
            DateTimeFormatter.ofPattern("H:mm"),
            DateTimeFormatter.ofPattern("HH:mm"),
            DateTimeFormatter.ofPattern("H:mm:ss"),
            DateTimeFormatter.ofPattern("HH:mm:ss"),
            DateTimeFormatter.ofPattern("h:mm a"),
            DateTimeFormatter.ofPattern("hh:mm a")
        );

        for (DateTimeFormatter formatter : acceptedFormats) {
            try {
                return LocalTime.parse(normalized, formatter);
            } catch (Exception ignored) {
                // Try next format.
            }
        }

        throw new RuntimeException("Invalid bookingTime format");
    }

    private UUID parseUuid(String id, String fieldName) {
        try {
            return UUID.fromString(id);
        } catch (Exception e) {
            throw new RuntimeException("Invalid " + fieldName + " format");
        }
    }

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private AvailabilityRepository availabilityRepository;

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private NotificationService notificationService;

    private String resolveStudentProfileId(String studentUserId) {
        UUID studentUserUuid = parseUuid(studentUserId, "studentUserId");
        Optional<StudentProfile> profile = studentProfileRepository.findByUserId(studentUserUuid);
        if (profile.isPresent()) {
            return profile.get().getId().toString();
        }

        StudentProfile created = new StudentProfile();
        created.setUserId(studentUserUuid);
        created.setTotalSessions(0);
        return studentProfileRepository.save(created).getId().toString();
    }

    private String resolveTutorProfileId(String tutorUserId) {
        Optional<TutorProfile> profile = tutorProfileRepository.findByUserId(parseUuid(tutorUserId, "tutorUserId"));
        if (profile.isEmpty()) {
            throw new RuntimeException("Tutor profile not found for this account");
        }
        return profile.get().getId();
    }

    private String resolveTutorUserIdFromProfileId(String tutorProfileId) {
        Optional<TutorProfile> tutorProfile = tutorProfileRepository.findById(parseUuid(tutorProfileId, "tutorProfileId"));
        if (tutorProfile.isPresent()) {
            return tutorProfile.get().getUserId();
        }
        return tutorProfileId;
    }

    private String resolveStudentUserIdFromProfileId(String studentProfileId) {
        Optional<StudentProfile> profile = studentProfileRepository.findById(parseUuid(studentProfileId, "studentProfileId"));
        if (profile.isPresent()) {
            return profile.get().getUserId().toString();
        }
        return studentProfileId;
    }

    private String resolveLocationName(String locationId) {
        if (locationId == null || locationId.isBlank()) {
            return "Online";
        }

        return locationRepository.findById(locationId)
            .map(Location::getName)
            .orElse(locationId);
    }

    public List<Map<String, String>> getBookingLocationChoices() {
        ensureDefaultBookingLocations();

        return locationRepository.findByActive(true).stream()
            .filter(loc -> loc.getName() != null)
            .filter(loc -> loc.getName().equalsIgnoreCase("Study Area") || loc.getName().equalsIgnoreCase("Library"))
            .sorted(Comparator.comparing(Location::getName, String.CASE_INSENSITIVE_ORDER))
            .map(loc -> Map.of(
                "id", loc.getId(),
                "name", loc.getName()
            ))
            .toList();
    }

    private List<Booking> dedupeAndSortBySlotStartDesc(List<Booking> bookings) {
        Map<String, Booking> unique = new LinkedHashMap<>();
        for (Booking booking : bookings) {
            if (booking == null || booking.getId() == null) {
                continue;
            }
            unique.put(booking.getId(), booking);
        }

        List<Booking> result = new ArrayList<>(unique.values());
        result.sort(Comparator.comparing(Booking::getSlotStart, Comparator.nullsLast(Comparator.reverseOrder())));
        return result;
    }

    /**
     * AC-1: Student books a tutor appointment
     * Creates booking, marks slot as booked, sends notification to tutor
     */
    public Booking createBooking(String studentId, CreateBookingRequest request) {
        Optional<User> studentOpt = userRepository.findById(parseUuid(studentId, "studentId"));
        if (studentOpt.isEmpty()) {
            throw new RuntimeException("Student account not found");
        }

        User student = studentOpt.get();
        if (!"STUDENT".equalsIgnoreCase(student.getRole())) {
            throw new RuntimeException("Only students can book a tutor session");
        }

        String studentProfileId = resolveStudentProfileId(studentId);

        // Validate availability slot exists
        UUID availabilityId = parseUuid(request.getAvailabilityId(), "availabilityId");
        Optional<Availability> availOpt = availabilityRepository.findById(availabilityId);
        if (availOpt.isEmpty()) {
            throw new RuntimeException("Availability slot not found");
        }
        Availability availability = availOpt.get();

        if (Boolean.TRUE.equals(availability.getIsBooked())) {
            throw new RuntimeException("This time slot has already been booked");
        }

        // Ensure student is booking a slot that belongs to the requested tutor.
        if (request.getTutorId() != null && !request.getTutorId().isBlank()) {
            UUID requestedTutorUuid = parseUuid(request.getTutorId(), "tutorId");
            Optional<TutorProfile> requestedTutorProfile = tutorProfileRepository.findById(requestedTutorUuid);
            if (requestedTutorProfile.isEmpty()) {
                requestedTutorProfile = tutorProfileRepository.findByUserId(requestedTutorUuid);
            }
            if (requestedTutorProfile.isEmpty() || !availability.getTutorId().equals(requestedTutorProfile.get().getId())) {
                throw new RuntimeException("Selected slot does not belong to the requested tutor");
            }
        }

        // Validate tutor exists
        Optional<TutorProfile> tutorOpt = tutorProfileRepository.findById(parseUuid(availability.getTutorId(), "tutorId"));
        if (tutorOpt.isEmpty()) {
            throw new RuntimeException("Tutor not found");
        }
        TutorProfile tutor = tutorOpt.get();

        if (tutor.getUserId().equals(studentId)) {
            throw new RuntimeException("You cannot book your own availability slot");
        }

        // AC-5: Check tutor is approved
        if (!"APPROVED".equals(tutor.getApprovalStatus())) {
            throw new RuntimeException("This tutor is not yet approved");
        }

        // Create booking record
        Booking booking = new Booking();
        booking.setStudentId(studentProfileId);
        booking.setTutorId(tutor.getId());
        booking.setAvailabilityId(request.getAvailabilityId());
        booking.setLocationId(resolveLocationId(request.getLocationId()));
        // The availability slot defines the subject; student input is ignored by design.
        booking.setSubject(availability.getSubject());

        if (request.getBookingTime() == null || request.getBookingTime().isBlank()) {
            throw new RuntimeException("bookingTime is required");
        }

        LocalDate selectedDate = parseRequestDate(request.getBookingDate());

        DayOfWeek expectedDay = parseDayOfWeek(availability.getDayOfWeek());
        if (selectedDate.getDayOfWeek() != expectedDay) {
            throw new RuntimeException("Selected booking date does not match tutor's available day");
        }

        LocalTime selectedTime = parseRequestTime(request.getBookingTime());
        LocalTime slotStartTime = availability.getStartTime().withSecond(0).withNano(0);
        LocalTime slotEndTime = availability.getEndTime().withSecond(0).withNano(0);

        if (selectedTime == null) {
            throw new RuntimeException("bookingTime is required");
        }

        boolean withinSlot = !selectedTime.isBefore(slotStartTime) && selectedTime.isBefore(slotEndTime);
        if (!withinSlot) {
            throw new RuntimeException("Selected booking time must be within tutor's available slot");
        }

        LocalDateTime slotStart = LocalDateTime.of(selectedDate, selectedTime);
        if (!slotStart.isAfter(LocalDateTime.now())) {
            throw new RuntimeException("Selected booking date/time must be in the future");
        }

        LocalDateTime slotEnd = LocalDateTime.of(slotStart.toLocalDate(), availability.getEndTime());
        if (!slotEnd.isAfter(slotStart)) {
            slotEnd = slotEnd.plusDays(1);
        }

        // Prevent double-booking only for the selected occurrence.
        List<Booking> existingBookings = bookingRepository.findByAvailabilityIdAndBookingStatus(
            availabilityId, "CONFIRMED"
        );
        boolean alreadyBookedForOccurrence = existingBookings.stream()
            .anyMatch(existing -> existing.getSlotStart() != null && existing.getSlotStart().equals(slotStart));
        if (alreadyBookedForOccurrence) {
            throw new RuntimeException("This tutor slot is already booked for the selected date/time");
        }

        booking.setSlotStart(slotStart);
        booking.setSlotEnd(slotEnd);
        booking.setDate(selectedDate);
        booking.setTime(selectedTime);
        booking.setBookingStatus("CONFIRMED");
        booking.setDurationMinutes((double) java.time.Duration.between(slotStart, slotEnd).toMinutes());

        // Defensive FK checks for clearer errors before insert.
        if (tutorProfileRepository.findById(parseUuid(booking.getTutorId(), "tutorProfileId")).isEmpty()) {
            throw new RuntimeException("Invalid tutor profile reference: selected tutor is not available for booking");
        }
        if (studentProfileRepository.findById(parseUuid(booking.getStudentId(), "studentProfileId")).isEmpty()) {
            throw new RuntimeException("Invalid student profile reference: please complete your student profile and try again");
        }

        Booking saved;
        try {
            saved = bookingRepository.save(booking);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Booking failed due to invalid linked record (tutor, student, availability, or location)");
        }

        // AC-1: Mark slot as booked
        availability.setIsBooked(true);
        availabilityRepository.save(availability);

        // AC-1: Send notification to tutor
        String notificationMessage = String.format(
            "New booking: A student has booked your %s session. Session time: %s - %s. Duration: 30 minutes.",
            booking.getSubject(),
            booking.getSlotStart(),
            booking.getSlotEnd()
        );
        notificationService.sendBookingNotification(
            tutor.getUserId(),
            studentId,
            saved.getId(),
            notificationMessage
        );

        return saved;
    }

    /**
     * AC-4: Student views their booking history
     */
    public List<Booking> getStudentBookings(String studentId) {
        UUID studentUserUuid = parseUuid(studentId, "studentUserId");
        List<Booking> collected = new ArrayList<>();

        // Include all profile ids tied to this user to handle legacy duplicate profile rows.
        List<StudentProfile> profiles = studentProfileRepository.findAllByUserId(studentUserUuid);
        if (profiles.isEmpty()) {
            // Preserve existing behavior by creating profile on first booking/history access.
            String createdProfileId = resolveStudentProfileId(studentId);
            collected.addAll(bookingRepository.findByStudentIdOrderBySlotStartDesc(parseUuid(createdProfileId, "studentProfileId")));
        } else {
            for (StudentProfile profile : profiles) {
                if (profile.getId() != null) {
                    collected.addAll(bookingRepository.findByStudentIdOrderBySlotStartDesc(profile.getId()));
                }
            }
        }

        // Backward compatibility for rows historically stored with userId instead of profileId.
        collected.addAll(bookingRepository.findByStudentIdOrderBySlotStartDesc(studentUserUuid));

        return dedupeAndSortBySlotStartDesc(collected);
    }

    /**
     * Get student bookings with complete details (tutor name, location, etc)
     * Transforms Booking entities to BookingDetailResponse DTOs
     */
    public List<BookingDetailResponse> getStudentBookingsWithDetails(String studentId) {
        List<Booking> bookings = getStudentBookings(studentId);
        List<BookingDetailResponse> responses = new ArrayList<>();
        
        for (Booking booking : bookings) {
            BookingDetailResponse response = new BookingDetailResponse();
            response.setId(booking.getId());
            response.setStudentId(booking.getStudentId());
            response.setTutorId(booking.getTutorId());
            response.setSubject(booking.getSubject());
            response.setLocationId(booking.getLocationId());
            response.setLocationName(resolveLocationName(booking.getLocationId()));
            response.setBookingStatus(booking.getBookingStatus());
            response.setStatus(booking.getBookingStatus());
            response.setCancellationReason(booking.getCancellationReason());
            response.setDurationMinutes(booking.getDurationMinutes());
            response.setPrice(booking.getPrice());
            response.setCreatedAt(booking.getCreatedAt());
            
            // Fetch tutor name
            try {
                String tutorUserId = resolveTutorUserIdFromProfileId(booking.getTutorId());
                Optional<User> tutorOpt = userRepository.findById(parseUuid(tutorUserId, "tutorUserId"));
                if (tutorOpt.isPresent()) {
                    response.setTutorName(tutorOpt.get().getFullName());
                } else {
                    response.setTutorName("Unknown Tutor");
                }
            } catch (Exception e) {
                response.setTutorName("Unknown Tutor");
            }
            
            // Parse slot start/end times
            if (booking.getSlotStart() != null) {
                response.setSlotStart(booking.getSlotStart().toString());
                response.setDate(booking.getSlotStart().format(java.time.format.DateTimeFormatter.ofPattern("MMM d")));
                response.setTime(booking.getSlotStart().format(java.time.format.DateTimeFormatter.ofPattern("h:mm a")));
            }
            if (booking.getSlotEnd() != null) {
                response.setSlotEnd(booking.getSlotEnd().toString());
            }
            
            responses.add(response);
        }
        
        return responses;
    }

    /**
     * Tutor views their bookings
     */
    public List<Booking> getTutorBookings(String tutorId) {
        UUID tutorUserUuid = parseUuid(tutorId, "tutorUserId");
        List<Booking> collected = new ArrayList<>();

        // Include all profile ids tied to this user to handle legacy duplicate profile rows.
        List<TutorProfile> profiles = tutorProfileRepository.findAllByUserId(tutorUserUuid);
        for (TutorProfile profile : profiles) {
            UUID tutorProfileUuid = parseUuid(profile.getId(), "tutorProfileId");
            collected.addAll(bookingRepository.findByTutorIdOrderBySlotStartDesc(tutorProfileUuid));
            collected.addAll(bookingRepository.findByTutorAvailabilityOwner(tutorProfileUuid));
        }

        // Backward compatibility for rows that may have been stored using tutor userId.
        collected.addAll(bookingRepository.findByTutorIdOrderBySlotStartDesc(tutorUserUuid));

        return dedupeAndSortBySlotStartDesc(collected);
    }

    /**
     * Get tutor bookings with complete details (student name, location, etc)
     * Transforms Booking entities to BookingDetailResponse DTOs
     */
    public List<BookingDetailResponse> getTutorBookingsWithDetails(String tutorId) {
        List<Booking> bookings = getTutorBookings(tutorId);
        List<BookingDetailResponse> responses = new ArrayList<>();
        
        for (Booking booking : bookings) {
            BookingDetailResponse response = new BookingDetailResponse();
            response.setId(booking.getId());
            response.setStudentId(booking.getStudentId());
            response.setTutorId(booking.getTutorId());
            response.setSubject(booking.getSubject());
            response.setLocationId(booking.getLocationId());
            response.setLocationName(resolveLocationName(booking.getLocationId()));
            response.setBookingStatus(booking.getBookingStatus());
            response.setStatus(booking.getBookingStatus());
            response.setCancellationReason(booking.getCancellationReason());
            response.setDurationMinutes(booking.getDurationMinutes());
            response.setPrice(booking.getPrice());
            response.setCreatedAt(booking.getCreatedAt());
            
            // Fetch student name (displayed as "tutor" field for compatibility with normalization)
            try {
                String studentUserId = resolveStudentUserIdFromProfileId(booking.getStudentId());
                Optional<User> studentOpt = userRepository.findById(parseUuid(studentUserId, "studentUserId"));
                if (studentOpt.isPresent()) {
                    String fullName = studentOpt.get().getFullName();
                    response.setStudentName(fullName);
                    response.setTutorName(fullName);
                } else {
                    response.setStudentName("Unknown Student");
                    response.setTutorName("Unknown Student");
                }
            } catch (Exception e) {
                response.setStudentName("Unknown Student");
                response.setTutorName("Unknown Student");
            }
            
            // Parse slot start/end times
            if (booking.getSlotStart() != null) {
                response.setSlotStart(booking.getSlotStart().toString());
                response.setDate(booking.getSlotStart().format(java.time.format.DateTimeFormatter.ofPattern("MMM d")));
                response.setTime(booking.getSlotStart().format(java.time.format.DateTimeFormatter.ofPattern("h:mm a")));
            }
            if (booking.getSlotEnd() != null) {
                response.setSlotEnd(booking.getSlotEnd().toString());
            }
            
            responses.add(response);
        }
        
        return responses;
    }

    /**
     * AC-6: Cancel a booking
     * Updates booking status to CANCELLED and reverts slot availability
     */
    public Booking cancelBooking(String bookingId, String userId, CancelBookingRequest request) {
        Optional<Booking> bookingOpt = bookingRepository.findById(parseUuid(bookingId, "bookingId"));
        if (bookingOpt.isEmpty()) {
            throw new RuntimeException("Booking not found");
        }

        Booking booking = bookingOpt.get();

        String requesterStudentProfileId = null;
        String requesterTutorProfileId = null;

        try {
            requesterStudentProfileId = resolveStudentProfileId(userId);
        } catch (Exception ignored) {
            // User may not be a student.
        }

        try {
            requesterTutorProfileId = resolveTutorProfileId(userId);
        } catch (Exception ignored) {
            // User may not be a tutor.
        }

        boolean isStudentOwner = booking.getStudentId().equals(userId)
            || (requesterStudentProfileId != null && booking.getStudentId().equals(requesterStudentProfileId));
        boolean isTutorOwner = booking.getTutorId().equals(userId)
            || (requesterTutorProfileId != null && booking.getTutorId().equals(requesterTutorProfileId));

        // Verify user is either student or tutor of this booking
        if (!isStudentOwner && !isTutorOwner) {
            throw new RuntimeException("You don't have permission to cancel this booking");
        }

        // AC-6: Mark as cancelled
        booking.setBookingStatus("CANCELLED");
        booking.setCancellationReason(request.getReason());
        Booking updated = bookingRepository.save(booking);

        // AC-6: Revert slot availability
        Optional<Availability> availOpt = availabilityRepository.findById(parseUuid(booking.getAvailabilityId(), "availabilityId"));
        if (availOpt.isPresent()) {
            Availability availability = availOpt.get();
            availability.setIsBooked(false);
            availabilityRepository.save(availability);
        }

        // Send notification to other party (notification userId is users.id)
        String otherPartyId = isStudentOwner
            ? resolveTutorUserIdFromProfileId(booking.getTutorId())
            : resolveStudentUserIdFromProfileId(booking.getStudentId());
        String cancellationMessage = String.format(
            "Booking cancelled: Your %s session has been cancelled. Reason: %s",
            booking.getSubject(),
            request.getReason() != null ? request.getReason() : "No reason provided"
        );
        notificationService.sendBookingNotification(
            otherPartyId,
            userId,
            bookingId,
            cancellationMessage
        );

        return updated;
    }

    /**
     * Get a single booking
     */
    public Booking getBooking(String bookingId) {
        return bookingRepository.findById(parseUuid(bookingId, "bookingId")).orElse(null);
    }
}
