package com.example.testapi.controller;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

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
import com.example.testapi.repository.TutorProfileRepository;
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

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    private String extractEmailFromToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return null;
            }

            String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            int emailIndex = payload.indexOf("\"email\"");
            if (emailIndex == -1) {
                return null;
            }

            int colonIndex = payload.indexOf(':', emailIndex);
            int startIndex = payload.indexOf('"', colonIndex + 1) + 1;
            int endIndex = payload.indexOf('"', startIndex);
            if (startIndex <= 0 || endIndex <= startIndex) {
                return null;
            }

            return payload.substring(startIndex, endIndex);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Helper method to verify user is admin
     */
    private void verifyAdminRole(String userId, String token) throws Exception {
        Optional<User> userOpt = userRepository.findById(UUID.fromString(userId));
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if ("ADMIN".equals(user.getRole())) {
                return;
            }
            if ("admin@tutortime.com".equalsIgnoreCase(user.getEmail())) {
                user.setRole("ADMIN");
                userRepository.save(user);
                return;
            }
        }

        String email = extractEmailFromToken(token);
        if (email != null) {
            Optional<User> userByEmail = userRepository.findByEmail(email);
            if (userByEmail.isPresent()) {
                User user = userByEmail.get();
                if ("ADMIN".equals(user.getRole()) || "admin@tutortime.com".equalsIgnoreCase(user.getEmail())) {
                    if (!"ADMIN".equals(user.getRole())) {
                        user.setRole("ADMIN");
                        userRepository.save(user);
                    }
                    return;
                }
            }
        }

        throw new RuntimeException("❌ Access denied. Only admins can perform this action.");
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
        verifyAdminRole(userId, token);

        List<TutorDetailResponse> pending = adminService.getPendingTutorRequests();

        return Map.of(
            "success", true,
            "count", pending.size(),
            "data", pending
        );
    }

    /**
     * Quick database status check for admin.
     * GET /api/admin/db-status
     */
    @GetMapping("/db-status")
    public Map<String, Object> getDatabaseStatus(
            @RequestHeader("Authorization") String authorization) throws Exception {

        String token = authService.extractToken(authorization);
        String userId = authService.verifyTokenAndGetUid(token);
        verifyAdminRole(userId, token);

        long usersCount = userRepository.count();
        long tutorProfilesCount = tutorProfileRepository.count();
        long pendingTutorProfilesCount = tutorProfileRepository.countByApprovalStatus("PENDING");

        return Map.of(
            "success", true,
            "database", "connected",
            "usersCount", usersCount,
            "tutorProfilesCount", tutorProfilesCount,
            "pendingTutorProfilesCount", pendingTutorProfilesCount
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
        verifyAdminRole(userId, token);

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
        verifyAdminRole(userId, token);

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
     * Get all verified (APPROVED) tutors
     * GET /api/admin/tutors/verified
     * Requires admin authentication
     * Returns: List of verified tutors with user details
     */
    @GetMapping("/tutors/verified")
    public List<Map<String, Object>> getVerifiedTutors(
            @RequestHeader("Authorization") String authorization) throws Exception {

        String token = authService.extractToken(authorization);
        String userId = authService.verifyTokenAndGetUid(token);
        verifyAdminRole(userId, token);

        List<TutorProfile> verified = tutorProfileRepository.findAll().stream()
            .filter(t -> "APPROVED".equals(t.getApprovalStatus()))
            .toList();

        List<Map<String, Object>> tutorList = new ArrayList<>();
        for (TutorProfile tutor : verified) {
            Optional<User> userOpt = userRepository.findById(UUID.fromString(tutor.getUserId()));
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                Map<String, Object> tutorMap = new HashMap<>();
                tutorMap.put("id", tutor.getId());
                tutorMap.put("tutorId", tutor.getId());
                tutorMap.put("userId", tutor.getUserId());
                tutorMap.put("name", user.getFullName());
                tutorMap.put("email", user.getEmail());
                tutorMap.put("bio", tutor.getBio());
                tutorMap.put("subject", tutor.getSpecialization() != null ? tutor.getSpecialization() : "General Tutoring");
                tutorMap.put("hourlyRate", tutor.getHourlyRate());
                tutorMap.put("rating", tutor.getRating());
                tutorMap.put("verified", true);
                tutorList.add(tutorMap);
            }
        }

        return tutorList;
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
        verifyAdminRole(userId, token);

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
        verifyAdminRole(userId, token);

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
        verifyAdminRole(userId, token);

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
        verifyAdminRole(userId, token);

        adminService.deactivateSubject(subjectId);

        return Map.of(
            "success", true,
            "message", "Subject deactivated successfully"
        );
    }
}
