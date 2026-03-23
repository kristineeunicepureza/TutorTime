package com.example.testapi.service;

import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.example.testapi.entity.TutorProfile;
import com.example.testapi.entity.User;
import com.example.testapi.model.AuthResponse;
import com.example.testapi.model.EditProfileRequest;
import com.example.testapi.model.ProfileResponse;
import com.example.testapi.repository.TutorProfileRepository;
import com.example.testapi.repository.UserRepository;

@Service
public class AuthService {

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private UUID parseUuid(String id, String fieldName) {
        try {
            return UUID.fromString(id);
        } catch (Exception e) {
            throw new RuntimeException("Invalid " + fieldName + " format");
        }
    }

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.api.key}")
    private String apiKey;          // anon key — for Auth endpoints

    @Value("${supabase.service.key}")
    private String serviceKey;      // service_role key — for Storage & admin ops

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    // ─────────────────────────────────────────────────────────────────
    // HEADER HELPERS
    // ─────────────────────────────────────────────────────────────────

    /**
     * Headers for Supabase REST/Storage using the service_role key.
     * Bypasses RLS — only used server-side.
     */
    private HttpHeaders serviceHeaders() {
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_JSON);
        h.set("apikey", serviceKey);
        h.setBearerAuth(serviceKey);
        return h;
    }

    // ─────────────────────────────────────────────────────────────────
    // LOGIN  (unchanged from your original)
    // ─────────────────────────────────────────────────────────────────
    @SuppressWarnings("unchecked")
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

                try {
                    String uid = verifyTokenAndGetUid(token);
                    System.out.println("✅ Login for UID: " + uid);
                    Optional<User> userOpt = userRepository.findById(parseUuid(uid, "userId"));

                    AuthResponse.UserInfo userInfo;
                    if (userOpt.isPresent()) {
                        User user = userOpt.get();
                        System.out.println("✅ Found in local DB - Role: " + user.getRole() + ", Name: " + user.getFullName());

                        String verifiedRole = user.getRole();

                        if ("admin@tutortime.com".equalsIgnoreCase(email) && !"ADMIN".equals(verifiedRole)) {
                            System.out.println("🔄 Admin email detected but stored as " + verifiedRole + ". Updating to ADMIN...");
                            user.setRole("ADMIN");
                            userRepository.save(user);
                            verifiedRole = "ADMIN";
                        }

                        if (!"TUTOR".equals(verifiedRole) && !"ADMIN".equals(verifiedRole)) {
                            Optional<TutorProfile> tutorProfile = tutorProfileRepository.findByUserId(parseUuid(uid, "userId"));
                            if (tutorProfile.isPresent()) {
                                System.out.println("🔄 User has TutorProfile but role is " + verifiedRole + ". Updating to TUTOR...");
                                user.setRole("TUTOR");
                                userRepository.save(user);
                                verifiedRole = "TUTOR";
                            }
                        }

                        userInfo = new AuthResponse.UserInfo(user.getFullName(), verifiedRole);
                    } else {
                        System.out.println("⚠️ Not in local DB by UID, checking by email...");
                        Optional<User> userByEmail = userRepository.findByEmail(email);

                        if (userByEmail.isPresent()) {
                            User existingUser = userByEmail.get();
                            System.out.println("✅ Found in local DB by email - Role: " + existingUser.getRole() + ", Name: " + existingUser.getFullName());

                            String verifiedRole = existingUser.getRole();

                            if ("admin@tutortime.com".equalsIgnoreCase(email) && !"ADMIN".equals(verifiedRole)) {
                                System.out.println("🔄 Admin email detected but stored as " + verifiedRole + ". Updating to ADMIN...");
                                existingUser.setRole("ADMIN");
                                userRepository.save(existingUser);
                                verifiedRole = "ADMIN";
                            }

                            if (!"TUTOR".equals(verifiedRole) && !"ADMIN".equals(verifiedRole)) {
                                Optional<TutorProfile> tutorProfile = tutorProfileRepository.findByUserId(parseUuid(existingUser.getId(), "userId"));
                                if (tutorProfile.isPresent()) {
                                    System.out.println("🔄 User has TutorProfile but role is " + verifiedRole + ". Updating to TUTOR...");
                                    existingUser.setRole("TUTOR");
                                    userRepository.save(existingUser);
                                    verifiedRole = "TUTOR";
                                }
                            }

                            userInfo = new AuthResponse.UserInfo(existingUser.getFullName(), verifiedRole);
                        } else {
                            System.out.println("⚠️ Not found by UID or email, checking for tutor profile...");
                            userInfo = fetchUserFromSupabase(uid, email);

                            if (userInfo != null && userInfo.getRole() != null) {
                                System.out.println("✅ Syncing user to local DB with role: " + userInfo.getRole());
                                User newUser = new User();
                                newUser.setId(uid);
                                newUser.setEmail(email);
                                newUser.setFullName(userInfo.getName());
                                newUser.setPasswordHash("auth_managed_by_supabase");
                                newUser.setRole(userInfo.getRole());
                                newUser.setVerified(true);
                                try {
                                    userRepository.save(newUser);
                                    System.out.println("✅ User synced to local database");
                                } catch (Exception saveError) {
                                    System.out.println("⚠️ Error saving user (likely duplicate): " + saveError.getMessage());
                                    Optional<User> fallbackUser = userRepository.findByEmail(email);
                                    if (fallbackUser.isPresent()) {
                                        System.out.println("✅ Using existing user record from DB");
                                        userInfo = new AuthResponse.UserInfo(fallbackUser.get().getFullName(), fallbackUser.get().getRole());
                                    }
                                }

                                if ("TUTOR".equals(userInfo.getRole())) {
                                    Optional<TutorProfile> existingTutorProfile = tutorProfileRepository.findByUserId(parseUuid(uid, "userId"));
                                    if (existingTutorProfile.isEmpty()) {
                                        TutorProfile tutorProfile = new TutorProfile();
                                        tutorProfile.setUserId(uid);
                                        tutorProfile.setApprovalStatus("PENDING");
                                        tutorProfile.setRating(0.0);
                                        tutorProfileRepository.save(tutorProfile);
                                        System.out.println("📋 Tutor profile created with PENDING status. Admin approval required.");
                                    }
                                }

                                syncSupabaseProfiles(uid, userInfo.getRole(), email);
                            } else {
                                System.out.println("❌ Could not determine role, defaulting to STUDENT");
                                userInfo = new AuthResponse.UserInfo("User", "STUDENT");
                                syncSupabaseProfiles(uid, "STUDENT", email);
                            }
                        }
                    }

                    return new AuthResponse(true, "Login successful", token, userInfo);
                } catch (Exception e) {
                    System.err.println("⚠️ Error during login: " + e.getMessage());
                    AuthResponse.UserInfo defaultUserInfo = "admin@tutortime.com".equalsIgnoreCase(email)
                        ? new AuthResponse.UserInfo("Admin User", "ADMIN")
                        : new AuthResponse.UserInfo("User", "STUDENT");
                    return new AuthResponse(true, "Login successful", token, defaultUserInfo);
                }
            }
            return new AuthResponse(false, "Invalid credentials", null);
        } catch (HttpClientErrorException e) {
            return new AuthResponse(false, "Authentication failed: " + e.getResponseBodyAsString(), null);
        } catch (org.springframework.web.client.RestClientException e) {
            return new AuthResponse(false, "Unable to reach authentication server: " + e.getMessage(), null);
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // fetchUserFromSupabase  (unchanged from your original)
    // ─────────────────────────────────────────────────────────────────
    private AuthResponse.UserInfo fetchUserFromSupabase(String uid, String email) {
        if ("admin@tutortime.com".equalsIgnoreCase(email)) {
            System.out.println("🔑 Admin email detected, assigning ADMIN role");
            return new AuthResponse.UserInfo("Admin User", "ADMIN");
        }

        try {
            System.out.println("🔍 Checking local tutor_profiles for UID: " + uid);

            Optional<TutorProfile> tutorProfile = tutorProfileRepository.findByUserId(parseUuid(uid, "userId"));
            if (tutorProfile.isPresent()) {
                System.out.println("✅ Found in local tutor_profiles, user is a TUTOR");
                return new AuthResponse.UserInfo("Tutor User", "TUTOR");
            }

            System.out.println("⚠️ Not in local tutor_profiles, checking Supabase tutor_profiles...");

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
        }
        return null;
    }

    // ─────────────────────────────────────────────────────────────────
    // REGISTER  (unchanged from your original)
    // ─────────────────────────────────────────────────────────────────
    @SuppressWarnings("unchecked")
    public AuthResponse register(String email, String password, String fullName, String userType) {
        if (email == null || email.isBlank()) {
            return new AuthResponse(false, "Registration failed: email is required", null);
        }
        String normalizedEmail = email.trim().toLowerCase();

        if (password == null || password.isBlank()) {
            return new AuthResponse(false, "Registration failed: password is required", null);
        }

        if (fullName == null || fullName.isBlank()) {
            return new AuthResponse(false, "Registration failed: displayName or fullName is required", null);
        }
        fullName = fullName.trim();

        if (userRepository.existsByEmail(normalizedEmail)) {
            return new AuthResponse(false, "Email is already registered. Please log in instead.", null);
        }
        String existingSupabaseUid = lookupSupabaseUidByEmail(normalizedEmail);
        if (existingSupabaseUid != null) {
            return new AuthResponse(false, "Email is already registered. Please log in instead.", null);
        }

        if (userType == null || userType.isBlank()) {
            return new AuthResponse(false, "Registration failed: userType (or role) is required and must be STUDENT or TUTOR", null);
        }
        userType = userType.toUpperCase();

        if (!userType.equals("STUDENT") && !userType.equals("TUTOR")) {
            return new AuthResponse(false, "Invalid userType. Must be STUDENT or TUTOR", null);
        }

        String url = supabaseUrl + "/auth/v1/signup";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", apiKey);
        Map<String, String> payload = Map.of("email", normalizedEmail, "password", password);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(payload, headers);
        try {
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);

            if (response != null && response.get("user") != null) {
                Map<String, Object> userMap = (Map<String, Object>) response.get("user");
                String uid = userMap.get("id").toString();

                String hashedPassword = passwordEncoder.encode(password);
                System.out.println("🔐 Password hashing enabled - Original length: " + password.length() + ", Hash length: " + hashedPassword.length());

                String resolvedUid = saveUserToSupabase(uid, normalizedEmail, fullName, userType, hashedPassword);

                try {
                    User user = new User();
                    user.setId(resolvedUid);
                    user.setEmail(normalizedEmail);
                    user.setFullName(fullName);
                    user.setPasswordHash(hashedPassword);
                    user.setRole(userType);
                    user.setVerified(true);
                    userRepository.save(user);
                    System.out.println("✅ User saved to local database: " + normalizedEmail);
                } catch (Exception dbError) {
                    System.err.println("⚠️ Failed to save user to local database: " + dbError.getMessage());
                    return new AuthResponse(false, "Registration failed: Could not save user to database. " + dbError.getMessage(), null);
                }

                if (userType.equals("TUTOR")) {
                    try {
                        TutorProfile tutorProfile = new TutorProfile();
                        tutorProfile.setUserId(resolvedUid);
                        tutorProfile.setApprovalStatus("PENDING");
                        tutorProfile.setRating(0.0);
                        tutorProfile.setHourlyRate(0.0);
                        tutorProfile.setTotalSessions(0);
                        tutorProfileRepository.save(tutorProfile);
                        System.out.println("📋 Tutor profile created with PENDING status. Admin approval required.");
                    } catch (Exception tutorError) {
                        System.err.println("⚠️ Failed to create tutor profile: " + tutorError.getMessage());
                        return new AuthResponse(false, "Registration failed: Could not create tutor profile. " + tutorError.getMessage(), null);
                    }
                } else {
                    try {
                        saveStudentProfileToSupabase(resolvedUid);
                        System.out.println("✓ Student profile created for: " + normalizedEmail);
                    } catch (Exception studentError) {
                        System.err.println("⚠️ Failed to create student profile: " + studentError.getMessage());
                    }
                }

                Object token = response.get("access_token");
                if (token == null && response.get("session") instanceof Map) {
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
        } catch (Exception e) {
            System.err.println("❌ Unexpected error during registration: " + e.getMessage());
            e.printStackTrace();
            return new AuthResponse(false, "Registration failed: " + e.getMessage(), null);
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // saveUserToSupabase  (unchanged from your original)
    // ─────────────────────────────────────────────────────────────────
    private String saveUserToSupabase(String uid, String email, String fullName, String userType, String hashedPassword) {
        try {
            String url = supabaseUrl + "/rest/v1/users";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("apikey", apiKey);
            headers.set("Prefer", "return=minimal");

            Map<String, Object> userPayload = new HashMap<>();
            userPayload.put("id", uid);
            userPayload.put("email", email);
            userPayload.put("password_hash", hashedPassword);
            userPayload.put("full_name", fullName);
            userPayload.put("role", userType);
            userPayload.put("verified", true);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(userPayload, headers);
            restTemplate.postForObject(url, entity, Map.class);
            System.out.println("✓ User saved to Supabase: " + email);
            return uid;
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 409) {
                String existingUid = lookupSupabaseUidByEmail(email);
                if (existingUid != null) {
                    System.out.println("⚠ User already in Supabase (UID: " + existingUid + "), using existing record");
                    return existingUid;
                }
            }
            System.out.println("⚠ Failed to save to Supabase: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("⚠ Failed to save to Supabase: " + e.getMessage());
        }
        return uid;
    }

    // ─────────────────────────────────────────────────────────────────
    // lookupSupabaseUidByEmail  (unchanged from your original)
    // ─────────────────────────────────────────────────────────────────
    private String lookupSupabaseUidByEmail(String email) {
        try {
            String url = supabaseUrl + "/rest/v1/users?email=eq." + email + "&select=id";
            HttpHeaders headers = new HttpHeaders();
            headers.set("apikey", apiKey);
            headers.set("Accept", "application/json");
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                url, org.springframework.http.HttpMethod.GET, entity, String.class);
            String body = response.getBody();
            if (body != null && !body.equals("[]")) {
                int idIdx = body.indexOf("\"id\"");
                if (idIdx != -1) {
                    int start = body.indexOf("\"", idIdx + 4) + 1;
                    int end = body.indexOf("\"", start);
                    return body.substring(start, end);
                }
            }
        } catch (Exception e) {
            System.out.println("⚠ Failed to look up Supabase UID by email: " + e.getMessage());
        }
        return null;
    }

    // ─────────────────────────────────────────────────────────────────
    // saveTutorProfileToSupabase  (unchanged from your original)
    // ─────────────────────────────────────────────────────────────────
    @SuppressWarnings("unused")
    private void saveTutorProfileToSupabase(String userId) {
        try {
            String url = supabaseUrl + "/rest/v1/tutor_profiles";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("apikey", apiKey);
            headers.set("Prefer", "return=minimal");

            Map<String, Object> tutorPayload = new HashMap<>();
            tutorPayload.put("user_id", userId);
            tutorPayload.put("bio", "");
            tutorPayload.put("hourly_rate", 0.0);
            tutorPayload.put("is_verified", false);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(tutorPayload, headers);
            restTemplate.postForObject(url, entity, Map.class);
            System.out.println("✓ Tutor profile saved to Supabase: " + userId);
        } catch (Exception e) {
            System.out.println("⚠ Failed to save tutor profile to Supabase: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // saveStudentProfileToSupabase  (unchanged from your original)
    // ─────────────────────────────────────────────────────────────────
    private void saveStudentProfileToSupabase(String userId) {
        try {
            String url = supabaseUrl + "/rest/v1/student_profiles";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("apikey", apiKey);
            headers.set("Prefer", "resolution=ignore-duplicates,return=minimal");

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
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // syncSupabaseProfiles  (unchanged from your original)
    // ─────────────────────────────────────────────────────────────────
    private void syncSupabaseProfiles(String userId, String role, String email) {
        if ("TUTOR".equals(role)) {
            System.out.println("✓ Tutor synced - subject can be added later via profile settings");
        } else if ("ADMIN".equals(role)) {
            System.out.println("✓ Admin synced - no student profile needed");
        } else {
            String canonicalUid = userId;
            if (email != null) {
                String lookedUp = lookupSupabaseUidByEmail(email);
                if (lookedUp != null) {
                    canonicalUid = lookedUp;
                }
            }
            try {
                String checkUrl = supabaseUrl + "/rest/v1/student_profiles?user_id=eq." + canonicalUid + "&select=id";
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
                if (responseBody != null && responseBody.equals("[]")) {
                    saveStudentProfileToSupabase(canonicalUid);
                }
            } catch (Exception e) {
                System.out.println("⚠ Sync student profile check failed: " + e.getMessage());
                saveStudentProfileToSupabase(canonicalUid);
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // extractUserIdFromJwt  (unchanged from your original)
    // ─────────────────────────────────────────────────────────────────
    private String extractUserIdFromJwt(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new IllegalArgumentException("Invalid JWT format");
            }

            // Pad base64url string if necessary before decoding
            String base64Payload = parts[1];
            int padding = base64Payload.length() % 4;
            if (padding != 0) base64Payload += "=".repeat(4 - padding);

            String payload = new String(Base64.getUrlDecoder().decode(base64Payload));

            int subIndex = payload.indexOf("\"sub\"");
            if (subIndex == -1) {
                throw new IllegalArgumentException("Token does not contain user ID (sub field)");
            }

            int startIndex = payload.indexOf("\"", subIndex + 5) + 1;
            int endIndex = payload.indexOf("\"", startIndex);
            return payload.substring(startIndex, endIndex);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract user ID from token: " + e.getMessage(), e);
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // extractToken  (unchanged from your original)
    // ─────────────────────────────────────────────────────────────────
    public String extractToken(String authorizationHeader) {
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);
        }
        throw new RuntimeException("Invalid or missing Authorization header");
    }

    // ─────────────────────────────────────────────────────────────────
    // verifyTokenAndGetUid  (unchanged from your original)
    // ─────────────────────────────────────────────────────────────────
    public String verifyTokenAndGetUid(String idToken) {
        try {
            return extractUserIdFromJwt(idToken);
        } catch (Exception localParseError) {
            String url = supabaseUrl + "/auth/v1/user";
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(idToken);
            headers.set("apikey", apiKey);
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> response = restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, entity, Map.class).getBody();
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

    // ═════════════════════════════════════════════════════════════════
    // GET PROFILE  ← updated: now returns photoUrl from DB
    // ═════════════════════════════════════════════════════════════════
    public ProfileResponse getProfile(String uid) {
        Optional<User> opt = userRepository.findById(parseUuid(uid, "userId"));
        if (opt.isPresent()) {
            User user = opt.get();
            ProfileResponse res = new ProfileResponse();
            res.setUid(user.getId());
            res.setEmail(user.getEmail());
            res.setDisplayName(user.getFullName());
            res.setUserType(user.getRole());
            res.setRole(user.getRole());
            res.setPhotoUrl(user.getProfilePhotoUrl()); // ← returns Supabase Storage URL
            res.setPhoto(null);
            return res;
        }
        return null;
    }

    // ═════════════════════════════════════════════════════════════════
    // UPDATE PROFILE  ← updated: now syncs name to Supabase via service key
    // ═════════════════════════════════════════════════════════════════
    public boolean updateProfile(String uid, EditProfileRequest request) {
        Optional<User> opt = userRepository.findById(parseUuid(uid, "userId"));
        if (opt.isPresent()) {
            User user = opt.get();
            boolean changed = false;

            String newName = request.getDisplayName();
            if (newName != null && !newName.isBlank()) {
                user.setFullName(newName.trim());
                changed = true;
            }

            UUID userUuid = parseUuid(uid, "userId");
            List<TutorProfile> tutorProfiles = tutorProfileRepository.findAllByUserId(userUuid);

            String newBio = request.getBio();
            String newSubject = request.getSubject();
            String newHourlyRate = request.getHourlyRate();
            boolean hasTutorFieldUpdate =
                (newBio != null && !newBio.isBlank())
                || (newSubject != null && !newSubject.isBlank())
                || (newHourlyRate != null && !newHourlyRate.isBlank());

            if (!tutorProfiles.isEmpty()) {
                Double parsedRate = null;
                if (newHourlyRate != null && !newHourlyRate.isBlank()) {
                    String normalizedRate = newHourlyRate.replaceAll("[^0-9.\\-]", "").trim();
                    if (!normalizedRate.isBlank()) {
                        try {
                            parsedRate = Double.parseDouble(normalizedRate);
                            if (parsedRate < 0) {
                                throw new RuntimeException("Hourly rate cannot be negative");
                            }
                        } catch (NumberFormatException ex) {
                            throw new RuntimeException("Invalid hourly rate format");
                        }
                    }
                }

                for (TutorProfile tutorProfile : tutorProfiles) {
                    if (newBio != null && !newBio.isBlank()) {
                        tutorProfile.setBio(newBio.trim());
                        changed = true;
                    }

                    if (newSubject != null && !newSubject.isBlank()) {
                        tutorProfile.setSpecialization(newSubject.trim());
                        changed = true;
                    }

                    if (parsedRate != null) {
                        tutorProfile.setHourlyRate(parsedRate);
                        changed = true;
                    }

                    tutorProfileRepository.save(tutorProfile);
                }
            } else if (hasTutorFieldUpdate) {
                TutorProfile createdProfile = new TutorProfile();
                createdProfile.setUserId(uid);
                createdProfile.setApprovalStatus("PENDING");
                createdProfile.setRating(0.0);
                createdProfile.setTotalSessions(0);

                if (newBio != null && !newBio.isBlank()) {
                    createdProfile.setBio(newBio.trim());
                }
                if (newSubject != null && !newSubject.isBlank()) {
                    createdProfile.setSpecialization(newSubject.trim());
                }
                if (newHourlyRate != null && !newHourlyRate.isBlank()) {
                    String normalizedRate = newHourlyRate.replaceAll("[^0-9.\\-]", "").trim();
                    if (!normalizedRate.isBlank()) {
                        try {
                            double parsedRate = Double.parseDouble(normalizedRate);
                            if (parsedRate < 0) {
                                throw new RuntimeException("Hourly rate cannot be negative");
                            }
                            createdProfile.setHourlyRate(parsedRate);
                        } catch (NumberFormatException ex) {
                            throw new RuntimeException("Invalid hourly rate format");
                        }
                    }
                }

                tutorProfileRepository.save(createdProfile);
                changed = true;
            }

            if (changed) {
                // ── Save to local DB ──
                userRepository.save(user);
                System.out.println("✅ Profile updated in local DB for UID: " + uid);

                // ── Sync to Supabase users table using service_role key ──
                try {
                    String url = supabaseUrl + "/rest/v1/users?id=eq." + uid;
                    HttpHeaders headers = serviceHeaders();
                    headers.set("Prefer", "return=minimal");

                    Map<String, Object> payload = new HashMap<>();
                    if (newName != null && !newName.isBlank()) {
                        payload.put("full_name", newName.trim());
                    }

                    if (!payload.isEmpty()) {
                        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
                        restTemplate.exchange(url, org.springframework.http.HttpMethod.PATCH, entity, String.class);
                        System.out.println("✅ Profile synced to Supabase for UID: " + uid);
                    }
                } catch (Exception e) {
                    System.err.println("⚠️ Supabase profile sync failed (local DB was saved): " + e.getMessage());
                }
            }

            return changed;
        }
        return false;
    }

    // ═════════════════════════════════════════════════════════════════
    // CHANGE PASSWORD  ← updated: now actually updates password in Supabase Auth
    // ═════════════════════════════════════════════════════════════════
    public boolean changePassword(String userToken, String newPassword) {
        if (userToken == null || !userToken.contains(".")) {
            throw new RuntimeException("Invalid token format: Token is null or not a valid JWT");
        }
        if (newPassword == null || newPassword.isBlank()) {
            throw new RuntimeException("Password cannot be empty");
        }
        if (newPassword.length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters");
        }

        String uid = extractUserIdFromJwt(userToken);

        // ── Method 1: Use user's own bearer token (standard Supabase way) ──
        boolean success = false;
        try {
            String url = supabaseUrl + "/auth/v1/user";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("apikey", apiKey);       // anon key as apikey header
            headers.setBearerAuth(userToken);    // user's own JWT as Bearer

            Map<String, Object> payload = new HashMap<>();
            payload.put("password", newPassword);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            restTemplate.exchange(url, org.springframework.http.HttpMethod.PUT, entity, Map.class);
            System.out.println("✅ Password updated in Supabase via user token for UID: " + uid);
            success = true;
        } catch (Exception e) {
            System.err.println("⚠️ User-token password update failed, trying admin API: " + e.getMessage());
        }

        // ── Method 2: Fallback — admin API with service_role key ──
        if (!success) {
            try {
                String url = supabaseUrl + "/auth/v1/admin/users/" + uid;
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("apikey", serviceKey);   // service_role as apikey
                headers.setBearerAuth(serviceKey);   // service_role as Bearer

                Map<String, Object> payload = new HashMap<>();
                payload.put("password", newPassword);

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
                restTemplate.exchange(url, org.springframework.http.HttpMethod.PUT, entity, Map.class);
                System.out.println("✅ Password updated via admin API for UID: " + uid);
                success = true;
            } catch (Exception e2) {
                System.err.println("❌ Both password update methods failed: " + e2.getMessage());
                throw new RuntimeException("Failed to update password in Supabase. Please try again.");
            }
        }

        // ── Update local DB passwordHash timestamp for audit trail ──
        userRepository.findById(parseUuid(uid, "userId")).ifPresent(user -> {
            user.setPasswordHash("supabase_managed_" + System.currentTimeMillis());
            userRepository.save(user);
        });

        return success;
    }

    // ═════════════════════════════════════════════════════════════════
    // UPLOAD PHOTO  ← updated: now uploads to Supabase Storage via service key
    // ═════════════════════════════════════════════════════════════════
    public String uploadPhoto(String uid, byte[] bytes, String originalFilename, String contentType) {
        Optional<User> opt = userRepository.findById(parseUuid(uid, "userId"));
        if (opt.isEmpty()) throw new RuntimeException("User not found");
        User user = opt.get();

        String bucketName = "profile-photos";
        String ext = ".jpg";
        if (originalFilename != null && originalFilename.contains(".")) {
            ext = originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase(Locale.ROOT);
        }
        if (!List.of(".jpg", ".jpeg", ".png", ".webp", ".gif").contains(ext)) {
            ext = ".jpg";
        }

        MediaType mediaType;
        try {
            mediaType = contentType != null ? MediaType.parseMediaType(contentType) : MediaType.IMAGE_JPEG;
        } catch (Exception ignored) {
            mediaType = MediaType.IMAGE_JPEG;
        }

        String fileName   = uid + "/avatar-" + System.currentTimeMillis() + ext;
        String uploadUrl  = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + fileName;

        try {
            // ── Upload bytes to Supabase Storage using service_role key ──
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(mediaType);
            headers.set("apikey", serviceKey);   // service_role bypasses RLS
            headers.setBearerAuth(serviceKey);
            headers.set("x-upsert", "true");

            HttpEntity<byte[]> uploadEntity = new HttpEntity<>(bytes, headers);
            restTemplate.exchange(uploadUrl, org.springframework.http.HttpMethod.POST, uploadEntity, String.class);

            // ── Build public URL ──
            String publicUrl = supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + fileName;
            System.out.println("✅ Photo uploaded to Supabase Storage: " + publicUrl);

            // ── Save URL to local DB ──
            user.setProfilePhotoUrl(publicUrl);
            userRepository.save(user);
            System.out.println("✅ Photo URL saved to local DB for UID: " + uid);

            // ── Sync URL to Supabase users table ──
            try {
                String updateUrl = supabaseUrl + "/rest/v1/users?id=eq." + uid;
                HttpHeaders updateHeaders = serviceHeaders();
                updateHeaders.set("Prefer", "return=minimal");

                Map<String, Object> updatePayload = new HashMap<>();
                updatePayload.put("profile_photo_url", publicUrl);

                HttpEntity<Map<String, Object>> updateEntity = new HttpEntity<>(updatePayload, updateHeaders);
                restTemplate.exchange(updateUrl, org.springframework.http.HttpMethod.PATCH, updateEntity, String.class);
                System.out.println("✅ Photo URL synced to Supabase users table for UID: " + uid);
            } catch (Exception syncErr) {
                System.err.println("⚠️ Photo URL sync to Supabase users table failed (photo still uploaded): " + syncErr.getMessage());
            }

            return publicUrl;

        } catch (Exception e) {
            System.err.println("❌ Supabase Storage upload failed: " + e.getMessage());
            throw new RuntimeException("Photo upload failed: " + e.getMessage());
        }
    }
}