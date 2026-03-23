package com.example.testapi.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.testapi.entity.Booking;
import com.example.testapi.exception.BusinessException;
import com.example.testapi.model.BookingDetailResponse;
import com.example.testapi.model.CancelBookingRequest;
import com.example.testapi.model.CreateBookingRequest;
import com.example.testapi.service.AuthService;
import com.example.testapi.service.BookingService;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private String safeMessage(Throwable e, String fallback) {
        if (e == null || e.getMessage() == null || e.getMessage().isBlank()) {
            return fallback;
        }
        return e.getMessage();
    }

    private ResponseEntity<Map<String, Object>> buildErrorResponse(HttpStatus status, String code, String message) {
        return ResponseEntity.status(status).body(Map.of(
            "success", false,
            "message", message,
            "error", Map.of(
                "code", code,
                "message", message
            )
        ));
    }

    @Autowired
    private BookingService bookingService;

    @Autowired
    private AuthService authService;

    /**
     * AC-1: Student books a tutor appointment
     * POST /api/bookings
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createBooking(
            @RequestHeader("Authorization") String authorization,
            @RequestBody CreateBookingRequest request) {
        // ✅ FIX: Explicit auth header validation
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return buildErrorResponse(HttpStatus.UNAUTHORIZED, "AUTH-001", "Missing or invalid Authorization header");
        }
        
        try {
            String token = authService.extractToken(authorization);
            String studentId = authService.verifyTokenAndGetUid(token);

            Booking booking = bookingService.createBooking(studentId, request);
            
            // ✅ FIX: Transform to BookingDetailResponse for complete client-side data
            BookingDetailResponse detailedResponse = bookingService.transformBookingToResponse(booking, true);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Booking created successfully",
                "data", detailedResponse
            ));
        } catch (BusinessException e) {
            return buildErrorResponse(HttpStatus.CONFLICT, e.getCode(), safeMessage(e, "Booking business rule violation"));
        } catch (Exception e) {
            return buildErrorResponse(HttpStatus.BAD_REQUEST, "BOOKING-001", safeMessage(e, "Failed to create booking"));
        }
    }

    /**
     * Booking form location choices.
     * GET /api/bookings/location-options
     */
    @GetMapping("/location-options")
    public Map<String, Object> getBookingLocationOptions() {
        return Map.of(
            "success", true,
            "data", bookingService.getBookingLocationChoices()
        );
    }

    /**
     * AC-4: Student views their booking history
     * GET /api/bookings/student
     */
    @GetMapping("/student")
    public Map<String, Object> getStudentBookings(
            @RequestHeader("Authorization") String authorization) throws Exception {
        try {
            String token = authService.extractToken(authorization);
            String studentId = authService.verifyTokenAndGetUid(token);

            List<?> bookings = bookingService.getStudentBookingsWithDetails(studentId);

            return Map.of(
                "success", true,
                "data", bookings
            );
        } catch (Exception e) {
            return Map.of(
                "success", false,
                "data", List.of(),
                "message", safeMessage(e, "Failed to fetch student bookings")
            );
        }
    }

    /**
     * Backward-compatible alias for older frontend clients.
     * GET /api/bookings/my
     */
    @GetMapping("/my")
    public Map<String, Object> getMyBookings(
            @RequestHeader("Authorization") String authorization) throws Exception {
        return getStudentBookings(authorization);
    }

    /**
     * Tutor views their bookings
     * GET /api/bookings/tutor
     */
    @GetMapping("/tutor")
    public Map<String, Object> getTutorBookings(
            @RequestHeader("Authorization") String authorization) throws Exception {
        try {
            String token = authService.extractToken(authorization);
            String tutorId = authService.verifyTokenAndGetUid(token);

            List<?> bookings = bookingService.getTutorBookingsWithDetails(tutorId);

            return Map.of(
                "success", true,
                "data", bookings
            );
        } catch (Exception e) {
            return Map.of(
                "success", false,
                "data", List.of(),
                "message", safeMessage(e, "Failed to fetch tutor bookings")
            );
        }
    }

    /**
     * Get a specific booking
     * GET /api/bookings/{id}
     */
    @GetMapping("/{id}")
    public Map<String, Object> getBooking(
            @PathVariable String id,
            @RequestHeader("Authorization") String authorization) throws Exception {
        
        String token = authService.extractToken(authorization);
        authService.verifyTokenAndGetUid(token);
        
        Booking booking = bookingService.getBooking(id);
        
        if (booking == null) {
            return Map.of("success", false, "message", "Booking not found");
        }
        
        return Map.of("success", true, "data", booking);
    }

    /**
     * AC-6: Cancel a booking
     * DELETE /api/bookings/{id}
     */
    @DeleteMapping("/{id}")
    public Map<String, Object> cancelBooking(
            @PathVariable String id,
            @RequestHeader("Authorization") String authorization,
            @RequestBody(required = false) CancelBookingRequest request) throws Exception {
        
        String token = authService.extractToken(authorization);
        String userId = authService.verifyTokenAndGetUid(token);
        
        CancelBookingRequest cancelRequest = request != null ? request : new CancelBookingRequest("No reason provided");
        
        try {
            Booking cancelled = bookingService.cancelBooking(id, userId, cancelRequest);
            return Map.of(
                "success", true,
                "message", "Booking cancelled successfully",
                "data", cancelled
            );
        } catch (BusinessException e) {
            return Map.of(
                "success", false,
                "message", safeMessage(e, "Failed to cancel booking"),
                "error", Map.of(
                    "code", e.getCode(),
                    "message", safeMessage(e, "Failed to cancel booking")
                )
            );
        } catch (RuntimeException e) {
            return Map.of(
                "success", false,
                "message", safeMessage(e, "Failed to cancel booking"),
                "error", Map.of(
                    "code", "BOOKING-002",
                    "message", safeMessage(e, "Failed to cancel booking")
                )
            );
        }
    }
}