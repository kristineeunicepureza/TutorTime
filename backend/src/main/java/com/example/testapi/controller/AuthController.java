package com.example.testapi.controller;

import com.example.testapi.model.LoginRequest;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final com.example.testapi.service.AuthService authService;

    public AuthController(com.example.testapi.service.AuthService authService) {
        this.authService = authService;
    }

    /**
     * Extract Bearer token from Authorization header.
     * Validates that header exists and is properly formatted.
     */
    private String extractToken(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            throw new RuntimeException("Authorization header is missing. Please include 'Authorization: Bearer <token>' in the request headers");
        }
        if (!authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization header format is invalid. Expected 'Bearer <token>', but got: " + authHeader.substring(0, Math.min(20, authHeader.length())));
        }
        String token = authHeader.substring(7).trim();
        if (token.isEmpty()) {
            throw new RuntimeException("Authorization header token is empty. Please provide a valid JWT token after 'Bearer '");
        }
        if (!token.contains(".")) {
            throw new RuntimeException("Token format is invalid. A valid JWT should contain dots (e.g., xxx.yyy.zzz). Received: " + token.substring(0, Math.min(30, token.length())));
        }
        return token;
    }

    /**
     * DEBUG ENDPOINT: Test the Authorization header format.
     * Use this to verify your Postman request is sending the header correctly.
     * GET http://localhost:8080/api/test-token
     * Headers: Authorization: Bearer <your_token>
     */
    @GetMapping("/test-token")
    public Map<String, String> testToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null) {
                return Map.of(
                    "status", "MISSING",
                    "message", "Authorization header was not sent",
                    "solution", "Add header: Authorization: Bearer <your_jwt_token>"
                );
            }
            
            String token = extractToken(authHeader);
            String uid = authService.verifyTokenAndGetUid(token);
            
            return Map.of(
                "status", "SUCCESS",
                "message", "Token is valid",
                "uid", uid,
                "tokenLength", String.valueOf(token.length())
            );
        } catch (Exception e) {
            return Map.of(
                "status", "ERROR",
                "message", e.getMessage(),
                "authHeaderReceived", authHeader == null ? "NO" : "YES (" + authHeader.length() + " chars)"
            );
        }
    }

    @PostMapping("/login")
    public com.example.testapi.model.AuthResponse login(@RequestBody LoginRequest request) {
        return authService.login(request.getEmail(), request.getPassword());
    }

    @PostMapping("/register")
    public com.example.testapi.model.AuthResponse register(@RequestBody com.example.testapi.model.RegisterRequest request) {
        return authService.register(request.getEmail(), request.getPassword(), request.getDisplayName());
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
    public Map<String, String> editProfile(@RequestHeader("Authorization") String authorization,
                                           @RequestBody com.example.testapi.model.EditProfileRequest request) throws Exception {
        String token = extractToken(authorization);
        String uid = authService.verifyTokenAndGetUid(token);
        boolean ok = authService.updateProfile(uid, request);
        if (ok) {
            return Map.of("message", "profile updated");
        }
        return Map.of("message", "no changes");
    }

    @PutMapping("/password")
    public Map<String, String> changePassword(@RequestHeader("Authorization") String authorization,
                                              @RequestBody com.example.testapi.model.ChangePasswordRequest request) throws Exception {
        String token = extractToken(authorization);
        authService.changePassword(token, request.getNewPassword());
        return Map.of("message", "password changed");
    }

    @PostMapping(value = "/uploadPhoto", consumes = {"multipart/form-data"})
    public Map<String, String> uploadPhoto(@RequestHeader("Authorization") String authorization,
                                           @RequestParam("file") org.springframework.web.multipart.MultipartFile file) throws Exception {
        String token = extractToken(authorization);
        String uid = authService.verifyTokenAndGetUid(token);
        byte[] bytes = file.getBytes();
        authService.uploadPhoto(uid, bytes);
        return Map.of("message", "photo uploaded");
    }
}

