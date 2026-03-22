package com.example.testapi.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.testapi.model.LoginRequest;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final com.example.testapi.service.AuthService authService;

    public AuthController(com.example.testapi.service.AuthService authService) {
        this.authService = authService;
    }

    private String extractToken(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            throw new RuntimeException("Authorization header is missing.");
        }
        if (!authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization header format is invalid.");
        }
        String token = authHeader.substring(7).trim();
        if (token.isEmpty()) {
            throw new RuntimeException("Authorization token is empty.");
        }
        return token;
    }

    @GetMapping("/test-token")
    public Map<String, String> testToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null) {
                return Map.of("status", "MISSING", "message", "Authorization header was not sent");
            }
            String token = extractToken(authHeader);
            String uid = authService.verifyTokenAndGetUid(token);
            return Map.of("status", "SUCCESS", "message", "Token is valid", "uid", uid);
        } catch (Exception e) {
            return Map.of("status", "ERROR", "message", e.getMessage());
        }
    }

    @PostMapping("/login")
    public com.example.testapi.model.AuthResponse login(@RequestBody LoginRequest request) {
        return authService.login(request.getEmail(), request.getPassword());
    }

    @PostMapping("/register")
    public com.example.testapi.model.AuthResponse register(@RequestBody com.example.testapi.model.RegisterRequest request) {
        return authService.register(request.getEmail(), request.getPassword(), request.getResolvedName(), request.getUserType());
    }

    @GetMapping("/profile")
    public com.example.testapi.model.ProfileResponse profile(@RequestHeader("Authorization") String authorization) throws Exception {
        String token = extractToken(authorization);
        String uid = authService.verifyTokenAndGetUid(token);
        com.example.testapi.model.ProfileResponse profile = authService.getProfile(uid);
        if (profile == null) {
            throw new RuntimeException("Profile not found");
        }
        return profile;
    }

    @PutMapping("/profile")
    public Map<String, String> editProfile(
            @RequestHeader("Authorization") String authorization,
            @RequestBody com.example.testapi.model.EditProfileRequest request) throws Exception {
        String token = extractToken(authorization);
        String uid = authService.verifyTokenAndGetUid(token);
        boolean ok = authService.updateProfile(uid, request);
        if (ok) {
            return Map.of("message", "profile updated", "success", "true");
        }
        return Map.of("message", "no changes", "success", "false");
    }

    @PutMapping("/password")
    public Map<String, String> changePassword(
            @RequestHeader("Authorization") String authorization,
            @RequestBody com.example.testapi.model.ChangePasswordRequest request) throws Exception {
        String token = extractToken(authorization);
        authService.changePassword(token, request.getNewPassword());
        return Map.of("message", "password changed", "success", "true");
    }

    @PostMapping(value = "/uploadPhoto", consumes = {"multipart/form-data"})
    public Map<String, String> uploadPhoto(
            @RequestHeader("Authorization") String authorization,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) throws Exception {
        String token = extractToken(authorization);
        String uid = authService.verifyTokenAndGetUid(token);
        byte[] bytes = file.getBytes();
        String photoUrl = authService.uploadPhoto(uid, bytes, file.getOriginalFilename(), file.getContentType());
        return Map.of("message", "photo uploaded", "photoUrl", photoUrl != null ? photoUrl : "");
    }
}