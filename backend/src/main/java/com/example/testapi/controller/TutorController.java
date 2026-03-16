package com.example.testapi.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.testapi.entity.TutorProfile;
import com.example.testapi.entity.User;
import com.example.testapi.repository.TutorProfileRepository;
import com.example.testapi.repository.TutorRepository;
import com.example.testapi.repository.UserRepository;

@RestController
@RequestMapping("/api/tutors")
public class TutorController {

    @Autowired
    private TutorRepository tutorRepository;

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.example.testapi.service.AuthService authService;

    /**
     * GET /api/tutors
     * Returns all APPROVED tutors with user name and email. No auth required.
     */
    @GetMapping
    public Map<String, Object> getAllApprovedTutors() {
        List<TutorProfile> approved = tutorProfileRepository.findAll().stream()
            .filter(t -> "APPROVED".equals(t.getApprovalStatus()))
            .toList();

        List<Map<String, Object>> tutorList = new ArrayList<>();
        for (TutorProfile tutor : approved) {
            Optional<User> userOpt = userRepository.findById(tutor.getUserId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                Map<String, Object> tutorMap = new HashMap<>();
                tutorMap.put("id", tutor.getId());
                tutorMap.put("userId", tutor.getUserId());
                tutorMap.put("name", user.getFullName());
                tutorMap.put("email", user.getEmail());
                tutorMap.put("bio", tutor.getBio());
                tutorMap.put("subject", tutor.getSpecialization() != null ? tutor.getSpecialization() : "General Tutoring");
                tutorMap.put("specialization", tutor.getSpecialization());
                tutorMap.put("hourlyRate", tutor.getHourlyRate());
                tutorMap.put("yearsOfExperience", tutor.getYearsOfExperience());
                tutorMap.put("rating", tutor.getRating() != null ? tutor.getRating() : 0.0);
                tutorMap.put("verified", tutor.getVerified());
                tutorMap.put("sessions", 0);
                tutorMap.put("tags", new ArrayList<>());
                tutorMap.put("approvalStatus", tutor.getApprovalStatus());
                tutorList.add(tutorMap);
            }
        }

        return Map.of(
            "success", true,
            "count", tutorList.size(),
            "data", tutorList
        );
    }

    /**
     * GET /api/tutors/profile/my-profile
     * Get the current logged-in tutor's profile with approval status
     */
    @GetMapping("/profile/my-profile")
    public Map<String, Object> getMyProfile(
            @RequestHeader("Authorization") String authorization) throws Exception {

        String token = authService.extractToken(authorization);
        String uid = authService.verifyTokenAndGetUid(token);

        Optional<TutorProfile> tutorOpt = tutorProfileRepository.findByUserId(uid);
        if (tutorOpt.isEmpty()) {
            return Map.of(
                "success", false,
                "message", "No tutor profile found for this user"
            );
        }

        TutorProfile tutor = tutorOpt.get();
        Map<String, Object> profileMap = new HashMap<>();
        profileMap.put("id", tutor.getId());
        profileMap.put("userId", tutor.getUserId());
        profileMap.put("bio", tutor.getBio());
        profileMap.put("specialization", tutor.getSpecialization());
        profileMap.put("hourlyRate", tutor.getHourlyRate());
        profileMap.put("yearsOfExperience", tutor.getYearsOfExperience());
        profileMap.put("rating", tutor.getRating());
        profileMap.put("verified", tutor.getVerified());
        profileMap.put("approvalStatus", tutor.getApprovalStatus());
        profileMap.put("createdAt", tutor.getCreatedAt());

        return Map.of(
            "success", true,
            "data", profileMap
        );
    }

    /**
    @GetMapping("/{id}")
    public Tutor getTutorById(@PathVariable String id) {
        return tutorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tutor not found: " + id));
    }

    /**
     * POST /api/tutors/profile/create
     * Create a TutorProfile for the logged-in user
     */
    @PostMapping("/profile/create")
    public Map<String, Object> createTutorProfile(
            @RequestHeader("Authorization") String authorization,
            @RequestBody Map<String, Object> request) throws Exception {
        
        String token = authService.extractToken(authorization);
        String uid = authService.verifyTokenAndGetUid(token);
        
        // Check if profile already exists
        if (tutorProfileRepository.findByUserId(uid).isPresent()) {
            return Map.of(
                "success", false,
                "message", "TutorProfile already exists for this user"
            );
        }
        
        // Create new tutor profile
        TutorProfile profile = new TutorProfile();
        profile.setUserId(uid);
        profile.setBio(request.get("bio") != null ? request.get("bio").toString() : "");
        profile.setSpecialization(request.get("specialization") != null ? request.get("specialization").toString() : "");
        profile.setHourlyRate(request.get("hourlyRate") != null ? Double.parseDouble(request.get("hourlyRate").toString()) : 0.0);
        profile.setYearsOfExperience(request.get("yearsOfExperience") != null ? Integer.parseInt(request.get("yearsOfExperience").toString()) : 0);
        profile.setVerified(false);
        profile.setTotalSessions(0);
        
        TutorProfile saved = tutorProfileRepository.save(profile);
        
        return Map.of(
            "success", true,
            "message", "TutorProfile created successfully",
            "data", saved
        );
    }
}