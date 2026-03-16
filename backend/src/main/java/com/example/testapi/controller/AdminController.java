package com.example.testapi.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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

import com.example.testapi.entity.Subject;
import com.example.testapi.entity.TutorProfile;
import com.example.testapi.entity.User;
import com.example.testapi.model.TutorDetailResponse;
import com.example.testapi.repository.UserRepository;
import com.example.testapi.service.AdminService;
import com.example.testapi.service.AuthService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Helper method to verify user is admin
     */
    private void verifyAdminRole(String userId) throws Exception {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty() || !"ADMIN".equals(userOpt.get().getRole())) {
            throw new RuntimeException("❌ Access denied. Only admins can perform this action.");
        }
    }

    /**
     * AC-5: Get pending tutor verification requests
     * GET /api/admin/tutor-requests
     * Requires admin authentication
     */
    @GetMapping("/tutor-requests")
    public Map<String, Object> getPendingTutorRequests(
            @RequestHeader("Authorization") String authorization) throws Exception {

        String token = authService.extractToken(authorization);
        String userId = authService.verifyTokenAndGetUid(token);
        verifyAdminRole(userId);

        List<TutorDetailResponse> pending = adminService.getPendingTutorRequests();

        return Map.of(
            "success", true,
            "count", pending.size(),
            "data", pending
        );
    }

    /**
     * AC-5: Approve a tutor
     * PUT /api/admin/tutor/{tutorId}/approve
     * Requires admin authentication
     */
    @PutMapping("/tutor/{tutorId}/approve")
    public Map<String, Object> approveTutor(
            @PathVariable String tutorId,
            @RequestHeader("Authorization") String authorization) throws Exception {

        String token = authService.extractToken(authorization);
        String userId = authService.verifyTokenAndGetUid(token);
        verifyAdminRole(userId);

        try {
            TutorProfile approved = adminService.approveTutor(tutorId);
            return Map.of(
                "success", true,
                "message", "Tutor approved successfully",
                "data", approved
            );
        } catch (RuntimeException e) {
            return Map.of(
                "success", false,
                "message", e.getMessage()
            );
        }
    }

    /**
     * Reject a tutor
     * PUT /api/admin/tutor/{tutorId}/reject
     * Requires admin authentication
     */
    @PutMapping("/tutor/{tutorId}/reject")
    public Map<String, Object> rejectTutor(
            @PathVariable String tutorId,
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String authorization) throws Exception {

        String token = authService.extractToken(authorization);
        String userId = authService.verifyTokenAndGetUid(token);
        verifyAdminRole(userId);

        String reason = request.getOrDefault("reason", "No reason provided");

        try {
            TutorProfile rejected = adminService.rejectTutor(tutorId, reason);
            return Map.of(
                "success", true,
                "message", "Tutor rejected",
                "data", rejected
            );
        } catch (RuntimeException e) {
            return Map.of(
                "success", false,
                "message", e.getMessage()
            );
        }
    }

    /**
     * Get all subjects in the system
     * GET /api/admin/subjects
     */
    @GetMapping("/subjects")
    public Map<String, Object> getSubjects(
            @RequestHeader("Authorization") String authorization) throws Exception {

        String token = authService.extractToken(authorization);
        String userId = authService.verifyTokenAndGetUid(token);
        verifyAdminRole(userId);

        List<Subject> subjects = adminService.getAllSubjects();

        return Map.of(
            "success", true,
            "count", subjects.size(),
            "data", subjects
        );
    }

    /**
     * Add a new subject
     * POST /api/admin/subjects
     * Requires admin authentication
     */
    @PostMapping("/subjects")
    public Map<String, Object> addSubject(
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String authorization) throws Exception {

        String token = authService.extractToken(authorization);
        String userId = authService.verifyTokenAndGetUid(token);
        verifyAdminRole(userId);

        String name = request.get("name");
        String description = request.getOrDefault("description", "");

        if (name == null || name.isBlank()) {
            return Map.of("success", false, "message", "Subject name is required");
        }

        try {
            Subject subject = adminService.addSubject(name, description);
            return Map.of(
                "success", true,
                "message", "Subject added successfully",
                "data", subject
            );
        } catch (RuntimeException e) {
            return Map.of(
                "success", false,
                "message", e.getMessage()
            );
        }
    }

    /**
     * Update a subject
     * PUT /api/admin/subjects/{subjectId}
     * Requires admin authentication
     */
    @PutMapping("/subjects/{subjectId}")
    public Map<String, Object> updateSubject(
            @PathVariable String subjectId,
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String authorization) throws Exception {

        String token = authService.extractToken(authorization);
        String userId = authService.verifyTokenAndGetUid(token);
        verifyAdminRole(userId);

        String name = request.get("name");
        String description = request.getOrDefault("description", "");

        try {
            Subject subject = adminService.updateSubject(subjectId, name, description);
            return Map.of(
                "success", true,
                "message", "Subject updated successfully",
                "data", subject
            );
        } catch (RuntimeException e) {
            return Map.of(
                "success", false,
                "message", e.getMessage()
            );
        }
    }

    /**
     * Deactivate a subject
     * DELETE /api/admin/subjects/{subjectId}
     * Requires admin authentication
     */
    @DeleteMapping("/subjects/{subjectId}")
    public Map<String, Object> deactivateSubject(
            @PathVariable String subjectId,
            @RequestHeader("Authorization") String authorization) throws Exception {

        String token = authService.extractToken(authorization);
        String userId = authService.verifyTokenAndGetUid(token);
        verifyAdminRole(userId);

        adminService.deactivateSubject(subjectId);

        return Map.of(
            "success", true,
            "message", "Subject deactivated successfully"
        );
    }
}
