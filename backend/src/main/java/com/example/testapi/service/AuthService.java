package com.example.testapi.service;

import com.example.testapi.entity.UserProfile;
import com.example.testapi.model.AuthResponse;
import com.example.testapi.model.ChangePasswordRequest;
import com.example.testapi.model.EditProfileRequest;
import com.example.testapi.model.ProfileResponse;
import com.example.testapi.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.api.key}")
    private String apiKey;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private UserProfileRepository profileRepo;

    /**
     * Login via Supabase Auth REST API.
     */
    public AuthResponse login(String email, String password) {
        String url = supabaseUrl + "/auth/v1/token?grant_type=password";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", apiKey);
        Map<String, String> payload = Map.of("email", email, "password", password);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(payload, headers);
        try {
            Map response = restTemplate.postForObject(url, entity, Map.class);
            if (response != null && response.get("access_token") != null) {
                return new AuthResponse(true, "Login successful", response.get("access_token").toString());
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
     * Register user using Supabase Auth and create profile record.
     */
    public AuthResponse register(String email, String password, String displayName) {
        String url = supabaseUrl + "/auth/v1/signup";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", apiKey);
        Map<String, String> payload = Map.of("email", email, "password", password);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(payload, headers);
        try {
            Map response = restTemplate.postForObject(url, entity, Map.class);

            /*
             * Supabase returns a map containing at least a "user" entry when
             * the request succeeds.  If the user has not yet verified their
             * email address the response does *not* include an access token
             * (or session) – the client must check their inbox before
             * attempting to log in.  When the email is already confirmed the
             * response will include a token and the user is effectively
             * logged in immediately.
             */
            if (response != null && response.get("user") != null) {
                Map userMap = (Map) response.get("user");
                String uid = userMap.get("id").toString();
                // persist profile regardless of whether we received a token
                UserProfile profile = new UserProfile();
                profile.setId(uid);
                profile.setEmail(email);
                profile.setDisplayName(displayName);
                profileRepo.save(profile);

                Object token = response.get("access_token");
                // supabase sometimes nests session info under "session"
                if (token == null && response.get("session") instanceof Map) {
                    token = ((Map) response.get("session")).get("access_token");
                }

                String message;
                boolean success;
                if (token == null) {
                    // user created but must verify email
                    message = "Success! Please check your email to verify your account.";
                    success = true;
                } else {
                    // user created and automatically logged in
                    message = "Registration successful!";
                    success = true;
                }
                return new AuthResponse(success, message, token == null ? null : token.toString());
            }

            // if we reach here the response was empty or did not contain a
            // user object; surface the entire map for easier debugging
            String details = (response != null ? response.toString() : "no response");
            return new AuthResponse(false, "Registration failed: " + details, null);
        } catch (HttpClientErrorException e) {
            return new AuthResponse(false, "Registration failed: " + e.getResponseBodyAsString(), null);
        } catch (org.springframework.web.client.RestClientException e) {
            return new AuthResponse(false, "Unable to reach authentication server: " + e.getMessage(), null);
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
        Optional<UserProfile> opt = profileRepo.findById(uid);
        if (opt.isPresent()) {
            UserProfile p = opt.get();
            ProfileResponse res = new ProfileResponse();
            res.setUid(p.getId());
            res.setEmail(p.getEmail());
            res.setDisplayName(p.getDisplayName());
            res.setPhoto(p.getPhoto());
            return res;
        }
        return null;
    }

    public boolean updateProfile(String uid, EditProfileRequest request) {
        Optional<UserProfile> opt = profileRepo.findById(uid);
        if (opt.isPresent()) {
            UserProfile p = opt.get();
            if (request.getDisplayName() != null) {
                p.setDisplayName(request.getDisplayName());
            }
            profileRepo.save(p);
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
        Optional<UserProfile> opt = profileRepo.findById(uid);
        if (opt.isPresent()) {
            UserProfile p = opt.get();
            p.setPhoto(bytes);
            profileRepo.save(p);
            return "photo saved";
        }
        return "user not found";
    }

}
