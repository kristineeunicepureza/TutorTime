package com.example.testapi.controller;

import com.example.testapi.model.TutorSearchRequest;
import com.example.testapi.service.SearchService;
import com.example.testapi.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    @Autowired
    private SearchService searchService;

    @Autowired
    private AuthService authService;

    /**
     * Search for tutors by subject
     * GET /api/search/tutors?subject=Mathematics&dayOfWeek=MONDAY&location=Library
     * Requires authentication (student)
     */
    @GetMapping("/tutors")
    public Map<String, Object> searchTutors(
            @RequestParam String subject,
            @RequestParam(required = false) String dayOfWeek,
            @RequestParam(required = false) String location,
            @RequestHeader("Authorization") String authorization) throws Exception {
        
        String token = authService.extractToken(authorization);
        String studentId = authService.verifyTokenAndGetUid(token);
        
        List<Map<String, Object>> results = searchService.searchTutorsBySubject(subject, dayOfWeek, location);
        
        return Map.of(
            "success", true,
            "totalResults", results.size(),
            "data", results
        );
    }

    /**
     * Get available slots for a specific tutor
     * GET /api/search/tutor/{tutorId}/slots?subject=Mathematics
     */
    @GetMapping("/tutor/{tutorId}/slots")
    public Map<String, Object> getTutorSlots(
            @PathVariable String tutorId,
            @RequestParam(required = false) String subject,
            @RequestHeader("Authorization") String authorization) throws Exception {
        
        String token = authService.extractToken(authorization);
        authService.verifyTokenAndGetUid(token);
        
        List<Map<String, Object>> slots = searchService.getAvailableSlots(tutorId, subject);
        
        return Map.of(
            "success", true,
            "availableSlots", slots.size(),
            "data", slots
        );
    }
}
