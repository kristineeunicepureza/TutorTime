package com.example.testapi.controller;


import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.testapi.service.AuthService;
import com.example.testapi.service.SearchService;

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
        authService.verifyTokenAndGetUid(token);
        
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
