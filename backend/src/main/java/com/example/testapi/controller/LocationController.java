package com.example.testapi.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.testapi.service.BookingService;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    @Autowired
    private BookingService bookingService;

    /**
     * Get booking location choices for the Book Session form.
     */
    @GetMapping("/booking-options")
    public Map<String, Object> getBookingLocationOptions() {
        List<Map<String, String>> options = bookingService.getBookingLocationChoices();
        return Map.of(
            "success", true,
            "data", options
        );
    }
}
