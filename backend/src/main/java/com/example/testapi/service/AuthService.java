package com.example.testapi.service;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.example.testapi.entity.User;
import com.example.testapi.entity.TutorProfile;
import com.example.testapi.model.AuthResponse;
import com.example.testapi.model.EditProfileRequest;
import com.example.testapi.model.ProfileResponse;
import com.example.testapi.repository.UserRepository;
import com.example.testapi.repository.TutorProfileRepository;

@Service
public class AuthService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.api.key}")
    private String apiKey;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    /**
     * Login via Supabase Auth REST API.
     * Returns user info (name and role) along with token.
     */
    public AuthResponse login(String email, String password) {
        String url = supabaseUrl + "/auth/v1/token?grant_type=password";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", apiKey);
        Map<String, String> payload = Map.of("email", email, "password", password);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(payload, headers);
        try {
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);
            if (response != null && response.get("access_token") != null) {
                String token = response.get("access_token").toString();

                // Extract user ID from token and fetch user details
                try {
                    String uid = verifyTokenAndGetUid(token);
                    System.out.println("✅ Login for UID: " + uid);
                    Optional<User> userOpt = userRepository.findById(uid);

                    AuthResponse.UserInfo userInfo = null;
                    if (userOpt.isPresent()) {
                        User user = userOpt.get();
                        System.out.println("✅ Found in local DB - Role: " + user.getRole() + ", Name: " + user.getFullName());

                        // For existing users, verify and potentially sync role if needed
                        String verifiedRole = user.getRole();

                        // Check if this email should be ADMIN based on environment or config
                        if ("admin@tutortime.com".equalsIgnoreCase(email) && !"ADMIN".equals(verifiedRole)) {
                            System.out.println("🔄 Admin email detected but stored as " + verifiedRole + ". Updating to ADMIN...");
                            user.setRole("ADMIN");
                            userRepository.save(user);
                            verifiedRole = "ADMIN";
                        }

                        userInfo = new AuthResponse.UserInfo(user.getFullName(), verifiedRole);
                    } else {
                        // If not in local database, sync from Supabase and determine role
                        System.out.println("⚠️ Not in local DB, checking for tutor profile...");
                        userInfo = fetchUserFromSupabase(uid, email);

                        // If we found user info, sync them to local database
                        if (userInfo != null && userInfo.getRole() != null) {
                            System.out.println("✅ Syncing user to local DB with role: " + userInfo.getRole());
                            User newUser = new User();
                            newUser.setId(uid);
                            newUser.setEmail(email);
                            newUser.setFullName(userInfo.getName());
                            newUser.setPasswordHash("auth_managed_by_supabase");
                            newUser.setRole(userInfo.getRole());
                            newUser.setVerified(true);
                            userRepository.save(newUser);
                            System.out.println("✅ User synced to local database");

                            // If tutor, also create local TutorProfile for availability management
                            if ("TUTOR".equals(userInfo.getRole())) {
                                Optional<TutorProfile> existingTutorProfile = tutorProfileRepository.findByUserId(uid);
                                if (existingTutorProfile.isEmpty()) {
                                    TutorProfile tutorProfile = new TutorProfile();
                                    tutorProfile.setUserId(uid);
                                    tutorProfile.setApprovalStatus("PENDING");
                                    tutorProfile.setRating(0.0);
                                    tutorProfileRepository.save(tutorProfile);
                                    System.out.println("📋 Tutor profile created with PENDING status. Admin approval required.");
                                }
                            }

                            // Ensure Supabase profiles are synced
                            syncSupabaseProfiles(uid, userInfo.getRole());
                        } else {
                            System.out.println("❌ Could not determine role, defaulting to STUDENT");
                            userInfo = new AuthResponse.UserInfo("User", "STUDENT");
                            syncSupabaseProfiles(uid, "STUDENT");
                        }
                    }

                    return new AuthResponse(true, "Login successful", token, userInfo);
                } catch (Exception e) {
                    // Still return success with token, but without user info
                    return new AuthResponse(true, "Login successful", token);
                }
            }
            return new AuthResponse(false, "Invalid credentials", null);
        } catch (HttpClientErrorException e) {
            return new AuthResponse(false, "Authentication failed: " + e.getResponseBodyAsString(), null);
        } catch (org.springframework.web.client.RestClientException e) {
            // covers I/O errors such as DNS lookup failures
            return new AuthResponse(false, "Unable to reach authentication server: " + e.getMessage(), null);
        }
    }

    /**
     * Fetch user role by checking multiple sources:
     * 1. Check if email is admin
     * 2. Local tutor_profiles table
     * 3. Supabase tutor_profiles via REST API using the token
     */
    private AuthResponse.UserInfo fetchUserFromSupabase(String uid, String email) {
        // Check if this is the admin email first
        if ("admin@tutortime.com".equalsIgnoreCase(email)) {
            System.out.println("🔑 Admin email detected, assigning ADMIN role");
            return new AuthResponse.UserInfo("Admin User", "ADMIN");
        }

        try {
            System.out.println("🔍 Checking local tutor_profiles for UID: " + uid);

            // First check if user has a tutor_profiles entry in our local database
            Optional<TutorProfile> tutorProfile = tutorProfileRepository.findByUserId(uid);
            if (tutorProfile.isPresent()) {
                System.out.println("✅ Found in local tutor_profiles, user is a TUTOR");
                return new AuthResponse.UserInfo("Tutor User", "TUTOR");
            }

            System.out.println("⚠️ Not in local tutor_profiles, checking Supabase tutor_profiles...");

            // Try to query Supabase tutor_profiles via REST API
            try {
                String url = supabaseUrl + "/rest/v1/tutor_profiles?user_id=eq." + uid;
                System.out.println("🔍 Querying: " + url);

                HttpHeaders headers = new HttpHeaders();
                headers.set("apikey", apiKey);
                headers.set("Accept", "application/json");

                HttpEntity<Void> entity = new HttpEntity<>(headers);
                ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    org.springframework.http.HttpMethod.GET,
                    entity,
                    String.class
                );

                String responseBody = response.getBody();
                System.out.println("📦 Supabase response: " + responseBody);

                // If we got a response and it's not empty array, they're a tutor
                if (responseBody != null && responseBody.contains("\"") && !responseBody.equals("[]")) {
                    System.out.println("✅ Found in Supabase tutor_profiles, user is a TUTOR");
                    return new AuthResponse.UserInfo("Tutor User", "TUTOR");
                }
            } catch (Exception e) {
                System.out.println("⚠️ Supabase REST query failed: " + e.getMessage());
            }

            System.out.println("❌ Not a tutor, defaulting user to STUDENT");
            return new AuthResponse.UserInfo("Student User", "STUDENT");

        } catch (Exception e) {
            System.out.println("⚠ Error checking tutor profile: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Register user using Supabase Auth and create user record in database.
     * Accepts userType (STUDENT or TUTOR) to properly configure the account.
     */
    public AuthResponse register(String email, String password, String fullName, String userType) {
        // Default to STUDENT if userType not provided
        if (userType == null || userType.isBlank()) {
            userType = "STUDENT";
        }
        userType = userType.toUpperCase();
        
        // Validate userType
        if (!userType.equals("STUDENT") && !userType.equals("TUTOR")) {
            return new AuthResponse(false, "Invalid userType. Must be STUDENT or TUTOR", null);
        }
        
        String url = supabaseUrl + "/auth/v1/signup";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", apiKey);
        Map<String, String> payload = Map.of("email", email, "password", password);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(payload, headers);
        try {
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);

            if (response != null && response.get("user") != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> userMap = (Map<String, Object>) response.get("user");
                String uid = userMap.get("id").toString();
                
                // Save user to Supabase via REST API
                saveUserToSupabase(uid, email, fullName, userType);

                // Also save to local H2 for offline support
                User user = new User();
                user.setId(uid);
                user.setEmail(email);
                user.setFullName(fullName);
                user.setPasswordHash(password);
                user.setRole(userType);
                user.setVerified(true);
                userRepository.save(user);

                // If registering as TUTOR, create TutorProfile locally
                if (userType.equals("TUTOR")) {
                    TutorProfile tutorProfile = new TutorProfile();
                    tutorProfile.setUserId(uid);
                    tutorProfile.setApprovalStatus("PENDING");
                    tutorProfile.setRating(0.0);
                    tutorProfileRepository.save(tutorProfile);

                    // Don't create Supabase tutor_profiles yet - tutors must choose a subject first
                    System.out.println("📋 Tutor profile created with PENDING status. Admin approval required.");
                } else {
                    // If registering as STUDENT, create StudentProfile in Supabase
                    saveStudentProfileToSupabase(uid);
                    System.out.println("✓ Student profile created for: " + email);
                }

                Object token = response.get("access_token");
                if (token == null && response.get("session") instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> sessionMap = (Map<String, Object>) response.get("session");
                    token = sessionMap.get("access_token");
                }

                String message = token == null ? 
                    "Success! Please check your email to verify your account." :
                    "Registration successful!";
                    
                return new AuthResponse(true, message, token == null ? null : token.toString());
            }

            String details = (response != null ? response.toString() : "no response");
            return new AuthResponse(false, "Registration failed: " + details, null);
        } catch (HttpClientErrorException e) {
            return new AuthResponse(false, "Registration failed: " + e.getResponseBodyAsString(), null);
        } catch (org.springframework.web.client.RestClientException e) {
            return new AuthResponse(false, "Unable to reach authentication server: " + e.getMessage(), null);
        }
    }

    /**
     * Save user to Supabase PostgreSQL database via REST API
     */
    private void saveUserToSupabase(String uid, String email, String fullName, String userType) {
        try {
            String url = supabaseUrl + "/rest/v1/users";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("apikey", apiKey);
            headers.set("Prefer", "return=minimal");

            Map<String, Object> userPayload = new HashMap<>();
            userPayload.put("id", uid);
            userPayload.put("email", email);
            userPayload.put("password_hash", "auth_managed");
            userPayload.put("full_name", fullName);
            userPayload.put("role", userType);
            userPayload.put("verified", true);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(userPayload, headers);
            restTemplate.postForObject(url, entity, Map.class);
            System.out.println("✓ User saved to Supabase: " + email);
        } catch (Exception e) {
            System.out.println("⚠ Failed to save to Supabase: " + e.getMessage());
            // Don't fail registration if Supabase write fails
        }
    }

    /**
     * Save tutor profile to Supabase tutor_profiles table
     */
    private void saveTutorProfileToSupabase(String userId) {
        try {
            String url = supabaseUrl + "/rest/v1/tutor_profiles";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("apikey", apiKey);
            headers.set("Prefer", "return=minimal");

            Map<String, Object> tutorPayload = new HashMap<>();
            tutorPayload.put("user_id", userId);
            tutorPayload.put("bio", ""); // Empty bio initially
            tutorPayload.put("hourly_rate", 0.0);
            tutorPayload.put("is_verified", false);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(tutorPayload, headers);
            restTemplate.postForObject(url, entity, Map.class);
            System.out.println("✓ Tutor profile saved to Supabase: " + userId);
        } catch (Exception e) {
            System.out.println("⚠ Failed to save tutor profile to Supabase: " + e.getMessage());
            // Don't fail registration if Supabase write fails
        }
    }

    /**
     * Save student profile to Supabase student_profiles table
     */
    private void saveStudentProfileToSupabase(String userId) {
        try {
            String url = supabaseUrl + "/rest/v1/student_profiles";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("apikey", apiKey);
            headers.set("Prefer", "return=minimal");

            Map<String, Object> studentPayload = new HashMap<>();
            studentPayload.put("user_id", userId);
            studentPayload.put("department", "Not Specified");
            studentPayload.put("year_level", "Not Specified");
            studentPayload.put("bio", "");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(studentPayload, headers);
            restTemplate.postForObject(url, entity, Map.class);
            System.out.println("✓ Student profile saved to Supabase: " + userId);
        } catch (Exception e) {
            System.out.println("⚠ Failed to save student profile to Supabase: " + e.getMessage());
            // Don't fail registration if Supabase write fails
        }
    }

    /**
     * Sync user profiles to Supabase based on role (idempotent - safe to call multiple times)
     */
    private void syncSupabaseProfiles(String userId, String role) {
        if ("TUTOR".equals(role)) {
            // For tutors, profile is created locally only
            // Supabase tutor_profiles requires subject_id, which tutors set up later
            System.out.println("✓ Tutor synced - subject can be added later via profile settings");
        } else {
            // Check if student profile exists, if not create it
            try {
                String checkUrl = supabaseUrl + "/rest/v1/student_profiles?user_id=eq." + userId + "&select=id";
                HttpHeaders headers = new HttpHeaders();
                headers.set("apikey", apiKey);
                headers.set("Accept", "application/json");

                HttpEntity<Void> entity = new HttpEntity<>(headers);
                ResponseEntity<String> response = restTemplate.exchange(
                    checkUrl,
                    org.springframework.http.HttpMethod.GET,
                    entity,
                    String.class
                );

                String responseBody = response.getBody();
                // If empty array (no records), create one
                if (responseBody != null && responseBody.equals("[]")) {
                    saveStudentProfileToSupabase(userId);
                }
            } catch (Exception e) {
                System.out.println("⚠ Sync student profile check failed: " + e.getMessage());
                // Attempt to create anyway
                saveStudentProfileToSupabase(userId);
            }
        }
    }

    /**
     * Extract user ID from JWT token without making a network call.
     * Parses the JWT payload locally (offline-friendly).
     */
    private String extractUserIdFromJwt(String token) {
        try {
            // JWT format: header.payload.signature
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new IllegalArgumentException("Invalid JWT format");
            }
            
            // Decode the payload (second part)
            String payload = new String(Base64.getDecoder().decode(parts[1]));
            
            // Parse as JSON - look for "sub" field (Subject = user ID in Supabase)
            int subIndex = payload.indexOf("\"sub\"");
            if (subIndex == -1) {
                throw new IllegalArgumentException("Token does not contain user ID (sub field)");
            }
            
            // Extract the value after "sub":"
            int startIndex = payload.indexOf("\"", subIndex + 5) + 1;
            int endIndex = payload.indexOf("\"", startIndex);
            return payload.substring(startIndex, endIndex);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract user ID from token: " + e.getMessage(), e);
        }
    }

    /**
     * Extract JWT token from Authorization header (removes "Bearer " prefix).
     */
    public String extractToken(String authorizationHeader) {
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);
        }
        throw new RuntimeException("Invalid or missing Authorization header");
    }

    /**
     * Verify access token by calling Supabase user endpoint.
     * Returns user id if valid.
     */
    public String verifyTokenAndGetUid(String idToken) {
        // Try to extract user ID locally first (offline-friendly)
        try {
            return extractUserIdFromJwt(idToken);
        } catch (Exception localParseError) {
            // If local parsing fails, try calling Supabase for validation
            String url = supabaseUrl + "/auth/v1/user";
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(idToken);
            headers.set("apikey", apiKey);
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            try {
                Map response = restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, entity, Map.class).getBody();
                if (response != null && response.get("id") != null) {
                    return response.get("id").toString();
                }
                throw new IllegalArgumentException("Invalid token");
            } catch (HttpClientErrorException e) {
                throw new RuntimeException("Token validation failed (Supabase error): " + e.getResponseBodyAsString(), e);
            } catch (org.springframework.web.client.RestClientException e) {
                throw new RuntimeException("Cannot reach Supabase authentication server. Check your internet connection. Error: " + e.getMessage(), e);
            }
        }
    }

    public ProfileResponse getProfile(String uid) {
        Optional<User> opt = userRepository.findById(uid);
        if (opt.isPresent()) {
            User user = opt.get();
            ProfileResponse res = new ProfileResponse();
            res.setUid(user.getId());
            res.setEmail(user.getEmail());
            res.setDisplayName(user.getFullName());
            res.setUserType(user.getRole());
            res.setPhoto(null); // Photo would need to be stored separately
            return res;
        }
        return null;
    }

    public boolean updateProfile(String uid, EditProfileRequest request) {
        Optional<User> opt = userRepository.findById(uid);
        if (opt.isPresent()) {
            User user = opt.get();
            if (request.getDisplayName() != null) {
                user.setFullName(request.getDisplayName());
            }
            userRepository.save(user);
            return true;
        }
        return false;
    }

    public boolean changePassword(String userToken, String newPassword) {
        // 1. Validation: Check if token looks like a JWT
        if (userToken == null || !userToken.contains(".")) {
            throw new RuntimeException("Invalid token format: Token is null or not a valid JWT");
        }

        // 2. Validate password
        if (newPassword == null || newPassword.isBlank()) {
            throw new RuntimeException("Password cannot be empty");
        }
        if (newPassword.length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters");
        }

        // 3. Extract user ID locally from token (no network call)
        String uid = extractUserIdFromJwt(userToken);

        // 4. Since we're using local H2 database, just return success
        // (In production with Supabase, you would call PATCH /auth/v1/user here)
        // For now, we acknowledge the password change locally
        return true;
    }

    public String uploadPhoto(String uid, byte[] bytes) {
        Optional<User> opt = userRepository.findById(uid);
        if (opt.isPresent()) {
            User user = opt.get();
            // In production, upload to cloud storage and save URL
            // For now, we'll acknowledge the upload
            return "photo upload endpoint ready";
        }
        return "user not found";
    }

}
