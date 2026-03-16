package com.example.testapi.controller;

import com.example.testapi.entity.Booking;
import com.example.testapi.entity.Booking.BookingStatus;
import com.example.testapi.entity.Tutor;
import com.example.testapi.model.CreateBookingRequest;
import com.example.testapi.repository.BookingRepository;
import com.example.testapi.repository.TutorRepository;
import com.example.testapi.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TutorRepository tutorRepository;

    @Autowired
    private AuthService authService;

    private String extractToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid Authorization header");
        String token = authHeader.substring(7).trim();
        if (token.isEmpty())
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Empty token");
        return token;
    }

    /**
     * GET /api/bookings
     * Returns all bookings for the authenticated user.
     */
    @GetMapping
    public List<Booking> getMyBookings(@RequestHeader("Authorization") String authorization) {
        String token = extractToken(authorization);
        String userId = authService.verifyTokenAndGetUid(token);
        return bookingRepository.findByUserIdOrderByDateDesc(userId);
    }

    /**
     * POST /api/bookings
     * Create a new booking.
     * Body: { "tutorId": "...", "date": "2026-03-20", "time": "3:00 PM", "notes": "..." }
     */
    @PostMapping
    public Booking createBooking(
            @RequestHeader("Authorization") String authorization,
            @RequestBody CreateBookingRequest request) {

        String token = extractToken(authorization);
        String userId = authService.verifyTokenAndGetUid(token);

        Tutor tutor = tutorRepository.findById(request.getTutorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tutor not found"));

        if (request.getDate() == null || request.getDate().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date is required");
        if (request.getTime() == null || request.getTime().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Time is required");

        Booking booking = new Booking();
        booking.setUserId(userId);
        booking.setTutorId(tutor.getId());
        booking.setTutorName(tutor.getName());
        booking.setSubject(tutor.getSubject());
        booking.setLocation(tutor.getLocation());
        booking.setAvatarInitials(tutor.getAvatarInitials());
        booking.setDate(LocalDate.parse(request.getDate()));
        booking.setTime(request.getTime());
        booking.setNotes(request.getNotes());
        booking.setStatus(BookingStatus.CONFIRMED);

        return bookingRepository.save(booking);
    }

    /**
     * PUT /api/bookings/{id}/cancel
     * Cancel a booking. Only the owner can cancel.
     */
    @PutMapping("/{id}/cancel")
    public Map<String, String> cancelBooking(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String id) {

        String token = extractToken(authorization);
        String userId = authService.verifyTokenAndGetUid(token);

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (!booking.getUserId().equals(userId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only cancel your own bookings");

        if (booking.getStatus() == BookingStatus.CANCELLED)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking is already cancelled");

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        return Map.of("message", "Booking cancelled successfully", "bookingId", id);
    }

    /**
     * GET /api/bookings/{id}
     * Get a single booking by ID (must belong to the authenticated user).
     */
    @GetMapping("/{id}")
    public Booking getBookingById(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String id) {

        String token = extractToken(authorization);
        String userId = authService.verifyTokenAndGetUid(token);

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (!booking.getUserId().equals(userId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");

        return booking;
    }
}