package com.example.testapi.service;

import com.example.testapi.entity.*;
import com.example.testapi.model.CreateBookingRequest;
import com.example.testapi.model.CancelBookingRequest;
import com.example.testapi.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private AvailabilityRepository availabilityRepository;

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private NotificationService notificationService;

    /**
     * AC-1: Student books a tutor appointment
     * Creates booking, marks slot as booked, sends notification to tutor
     */
    public Booking createBooking(String studentId, CreateBookingRequest request) {
        // Validate availability slot exists
        Optional<Availability> availOpt = availabilityRepository.findById(request.getAvailabilityId());
        if (availOpt.isEmpty()) {
            throw new RuntimeException("Availability slot not found");
        }
        Availability availability = availOpt.get();

        // AC-3: Prevent double-booking - check if slot already booked
        List<Booking> existingBookings = bookingRepository.findByAvailabilityIdAndBookingStatus(
            request.getAvailabilityId(), "CONFIRMED"
        );
        if (!existingBookings.isEmpty()) {
            throw new RuntimeException("This time slot has already been booked");
        }

        // Validate tutor exists
        Optional<TutorProfile> tutorOpt = tutorProfileRepository.findById(availability.getTutorId());
        if (tutorOpt.isEmpty()) {
            throw new RuntimeException("Tutor not found");
        }
        TutorProfile tutor = tutorOpt.get();

        // AC-5: Check tutor is approved
        if (!"APPROVED".equals(tutor.getApprovalStatus())) {
            throw new RuntimeException("This tutor is not yet approved");
        }

        // Create booking record
        Booking booking = new Booking();
        booking.setStudentId(studentId);
        booking.setTutorId(tutor.getUserId());
        booking.setAvailabilityId(request.getAvailabilityId());
        booking.setLocationId(request.getLocationId());
        booking.setSubject(request.getSubject());
        booking.setSlotStart(LocalDateTime.now());  // Use availability slot timing
        booking.setSlotEnd(LocalDateTime.now().plusMinutes(30));
        booking.setBookingStatus("CONFIRMED");
        booking.setDurationMinutes(30.0);

        Booking saved = bookingRepository.save(booking);

        // AC-1: Mark slot as booked
        availability.setIsBooked(true);
        availabilityRepository.save(availability);

        // AC-1: Send notification to tutor
        notificationService.sendBookingNotification(
            tutor.getUserId(),
            studentId,
            saved.getId(),
            "A student has booked your session for " + request.getSubject()
        );

        return saved;
    }

    /**
     * AC-4: Student views their booking history
     */
    public List<Booking> getStudentBookings(String studentId) {
        return bookingRepository.findByStudentIdOrderBySlotStartDesc(studentId);
    }

    /**
     * Tutor views their bookings
     */
    public List<Booking> getTutorBookings(String tutorId) {
        return bookingRepository.findByTutorIdOrderBySlotStartDesc(tutorId);
    }

    /**
     * AC-6: Cancel a booking
     * Updates booking status to CANCELLED and reverts slot availability
     */
    public Booking cancelBooking(String bookingId, String userId, CancelBookingRequest request) {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isEmpty()) {
            throw new RuntimeException("Booking not found");
        }

        Booking booking = bookingOpt.get();

        // Verify user is either student or tutor of this booking
        if (!booking.getStudentId().equals(userId) && !booking.getTutorId().equals(userId)) {
            throw new RuntimeException("You don't have permission to cancel this booking");
        }

        // AC-6: Mark as cancelled
        booking.setBookingStatus("CANCELLED");
        booking.setCancellationReason(request.getReason());
        Booking updated = bookingRepository.save(booking);

        // AC-6: Revert slot availability
        Optional<Availability> availOpt = availabilityRepository.findById(booking.getAvailabilityId());
        if (availOpt.isPresent()) {
            Availability availability = availOpt.get();
            availability.setIsBooked(false);
            availabilityRepository.save(availability);
        }

        // Send notification to other party
        String otherPartyId = booking.getStudentId().equals(userId) ? booking.getTutorId() : booking.getStudentId();
        notificationService.sendBookingNotification(
            otherPartyId,
            userId,
            bookingId,
            "A session booking has been cancelled. Reason: " + request.getReason()
        );

        return updated;
    }

    /**
     * Get a single booking
     */
    public Booking getBooking(String bookingId) {
        return bookingRepository.findById(bookingId).orElse(null);
    }
}
