package com.example.testapi.controller;

import com.example.testapi.entity.Subject;
import com.example.testapi.service.AdminService;
import com.example.testapi.service.AuthService;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public API endpoints accessible to authenticated users (tutors, students, admins)
 * This controller provides non-administrative endpoints that all authenticated users can access
 */
@RestController
@RequestMapping("/api")
public class PublicController {

    @Autowired
    private AuthService authService;

    @Autowired
    private AdminService adminService;

    /**
     * Get all available subjects
     * GET /api/subjects
     * Accessible to: All authenticated users (tutors, students, admins)
     * Required: Valid authentication token
     */
    @GetMapping("/subjects")
    public Map<String, Object> getAvailableSubjects(
            @RequestHeader("Authorization") String authorization) throws Exception {

        // Verify token is valid, but don't require admin role
        String token = authService.extractToken(authorization);
        authService.verifyTokenAndGetUid(token);

        // Fetch all active subjects
        List<Subject> subjects = adminService.getAllSubjects();

        return Map.of(
            "success", true,
            "count", subjects.size(),
            "data", subjects
        );
    }
}
