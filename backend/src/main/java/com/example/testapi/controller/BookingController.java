package com.example.testapi.controller;

import com.example.testapi.entity.Booking;
import com.example.testapi.model.CreateBookingRequest;
import com.example.testapi.model.CancelBookingRequest;
import com.example.testapi.service.BookingService;
import com.example.testapi.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private AuthService authService;

    /**
     * AC-1: Student books a tutor appointment
     * POST /api/bookings
     */
    @PostMapping
    public Map<String, Object> createBooking(
            @RequestHeader("Authorization") String authorization,
            @RequestBody CreateBookingRequest request) throws Exception {
        
        String token = authService.extractToken(authorization);
        String studentId = authService.verifyTokenAndGetUid(token);
        
        try {
            Booking booking = bookingService.createBooking(studentId, request);
            return Map.of(
                "success", true,
                "message", "Booking created successfully",
                "data", booking
            );
        } catch (RuntimeException e) {
            return Map.of(
                "success", false,
                "message", e.getMessage()
            );
        }
    }

    /**
     * AC-4: Student views their booking history
     * GET /api/bookings/my
     */
    @GetMapping("/my")
    public Map<String, Object> getMyBookings(
            @RequestHeader("Authorization") String authorization) throws Exception {
        
        String token = authService.extractToken(authorization);
        String studentId = authService.verifyTokenAndGetUid(token);
        
        List<Booking> bookings = bookingService.getStudentBookings(studentId);
        
        return Map.of(
            "success", true,
            "data", bookings
        );
    }

    /**
     * Tutor views their bookings
     * GET /api/bookings/tutor
     */
    @GetMapping("/tutor")
    public Map<String, Object> getTutorBookings(
            @RequestHeader("Authorization") String authorization) throws Exception {
        
        String token = authService.extractToken(authorization);
        String tutorId = authService.verifyTokenAndGetUid(token);
        
        List<Booking> bookings = bookingService.getTutorBookings(tutorId);
        
        return Map.of(
            "success", true,
            "data", bookings
        );
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
        } catch (RuntimeException e) {
            return Map.of(
                "success", false,
                "message", e.getMessage()
            );
        }
    }
}