package com.example.testapi.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.testapi.entity.Availability;
import com.example.testapi.model.CreateAvailabilityRequest;
import com.example.testapi.service.AvailabilityService;

@RestController
@RequestMapping("/api/availability")
public class AvailabilityController {

    @Autowired
    private AvailabilityService availabilityService;

    @Autowired
    private com.example.testapi.service.AuthService authService;

    /**
     * POST /api/availability
     * Create a new availability slot for the logged-in tutor
     */
    @PostMapping
    public Map<String, Object> createAvailability(
            @RequestHeader("Authorization") String authorization,
            @RequestBody CreateAvailabilityRequest request) throws Exception {
        
        String token = authService.extractToken(authorization);
        String uid = authService.verifyTokenAndGetUid(token);
        
        Availability availability = availabilityService.createAvailability(uid, request);
        
        return Map.of(
            "success", true,
            "message", "Availability slot created",
            "data", availability
        );
    }

    /**
     * GET /api/availability
     * Get all availability slots for the logged-in tutor
     */
    @GetMapping
    public Map<String, Object> getMyAvailability(
            @RequestHeader("Authorization") String authorization) throws Exception {
        
        String token = authService.extractToken(authorization);
        String uid = authService.verifyTokenAndGetUid(token);
        
        List<Availability> slots = availabilityService.getAvailabilityByTutorId(uid);
        
        return Map.of(
            "success", true,
            "data", slots
        );
    }

    /**
     * GET /api/availability/{id}
     * Get a specific availability slot
     */
    @GetMapping("/{id}")
    public Map<String, Object> getAvailability(
            @PathVariable String id) {
        
        Availability availability = availabilityService.getAvailabilityById(id);
        
        if (availability == null) {
            return Map.of("success", false, "message", "Availability slot not found");
        }
        
        return Map.of("success", true, "data", availability);
    }

    /**
     * PUT /api/availability/{id}
     * Update an availability slot
     */
    @PutMapping("/{id}")
    public Map<String, Object> updateAvailability(
            @PathVariable String id,
            @RequestHeader("Authorization") String authorization,
            @RequestBody CreateAvailabilityRequest request) throws Exception {
        
        String token = authService.extractToken(authorization);
        String uid = authService.verifyTokenAndGetUid(token);
        
        Availability availability = availabilityService.updateAvailability(id, uid, request);
        
        if (availability == null) {
            return Map.of("success", false, "message", "Failed to update availability");
        }
        
        return Map.of(
            "success", true,
            "message", "Availability updated",
            "data", availability
        );
    }

    /**
     * DELETE /api/availability/{id}
     * Delete an availability slot
     */
    @DeleteMapping("/{id}")
    public Map<String, String> deleteAvailability(
            @PathVariable String id,
            @RequestHeader("Authorization") String authorization) throws Exception {
        
        String token = authService.extractToken(authorization);
        String uid = authService.verifyTokenAndGetUid(token);
        
        boolean deleted = availabilityService.deleteAvailability(id, uid);
        
        if (deleted) {
            return Map.of("success", "true", "message", "Availability deleted");
        }
        return Map.of("success", "false", "message", "Failed to delete availability");
    }
}
