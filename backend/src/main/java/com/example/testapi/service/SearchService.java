package com.example.testapi.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.testapi.entity.Availability;
import com.example.testapi.entity.TutorProfile;
import com.example.testapi.repository.AvailabilityRepository;
import com.example.testapi.repository.TutorProfileRepository;

@Service
public class SearchService {

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private boolean matchesSubject(Availability slot, String requestedSubject, TutorProfile tutor) {
        if (!hasText(requestedSubject)) {
            return true;
        }

        String normalized = requestedSubject.trim().toLowerCase();
        String slotSubject = slot.getSubject() == null ? "" : slot.getSubject().trim().toLowerCase();
        String tutorSpecialization = tutor.getSpecialization() == null ? "" : tutor.getSpecialization().trim().toLowerCase();

        // Allow matching either the slot subject (e.g., Calculus) or tutor specialization (e.g., Mathematics).
        return slotSubject.equals(normalized)
            || slotSubject.contains(normalized)
            || normalized.contains(slotSubject)
            || tutorSpecialization.equals(normalized)
            || tutorSpecialization.contains(normalized)
            || normalized.contains(tutorSpecialization);
    }

    private List<TutorProfile> resolveApprovedTutorProfiles(String tutorIdentifier) {
        UUID tutorUuid = parseUuid(tutorIdentifier, "tutorId");

        Optional<TutorProfile> byProfileId = tutorProfileRepository.findById(tutorUuid);
        if (byProfileId.isPresent()) {
            TutorProfile profile = byProfileId.get();
            List<TutorProfile> sameUserProfiles = tutorProfileRepository.findAllByUserId(parseUuid(profile.getUserId(), "userId"));
            List<TutorProfile> approved = sameUserProfiles.stream()
                .filter(p -> "APPROVED".equals(p.getApprovalStatus()))
                .collect(Collectors.toList());
            if (!approved.isEmpty()) {
                return approved;
            }
            return "APPROVED".equals(profile.getApprovalStatus()) ? List.of(profile) : List.of();
        }

        List<TutorProfile> byUserId = tutorProfileRepository.findAllByUserId(tutorUuid);
        return byUserId.stream()
            .filter(p -> "APPROVED".equals(p.getApprovalStatus()))
            .collect(Collectors.toList());
    }

    private UUID parseUuid(String id, String fieldName) {
        try {
            return UUID.fromString(id);
        } catch (Exception e) {
            throw new RuntimeException("Invalid " + fieldName + " format");
        }
    }

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    @Autowired
    private AvailabilityRepository availabilityRepository;

    /**
     * Search for tutors by subject (AC-2 related)
     * Returns tutors who have approved status and available slots
     */
    public List<Map<String, Object>> searchTutorsBySubject(String subject, String dayOfWeek, String location) {
        List<TutorProfile> allTutors = tutorProfileRepository.findAll();

        // Filter tutors: must be APPROVED
        List<TutorProfile> approvedTutors = allTutors.stream()
            .filter(t -> "APPROVED".equals(t.getApprovalStatus()))
            .collect(Collectors.toList());

        // Get their availability slots
        List<Map<String, Object>> results = new ArrayList<>();

        for (TutorProfile tutor : approvedTutors) {
            List<Availability> slots = availabilityRepository.findByTutorId(parseUuid(tutor.getId(), "tutorId"));

            // Filter slots by subject and criteria
            List<Availability> matchingSlots = slots.stream()
                .filter(s -> !Boolean.TRUE.equals(s.getIsBooked()))  // Only available slots
                .filter(s -> matchesSubject(s, subject, tutor))
                .filter(s -> dayOfWeek == null || dayOfWeek.equalsIgnoreCase(s.getDayOfWeek()))
                .collect(Collectors.toList());

            if (!matchingSlots.isEmpty()) {
                Map<String, Object> tutorInfo = new HashMap<>();
                tutorInfo.put("tutorId", tutor.getId());
                tutorInfo.put("userId", tutor.getUserId());
                tutorInfo.put("specialization", tutor.getSpecialization());
                tutorInfo.put("rating", tutor.getRating());
                tutorInfo.put("hourlyRate", tutor.getHourlyRate());
                tutorInfo.put("availableSlots", matchingSlots.size());
                
                List<Map<String, Object>> slotsList = new ArrayList<>();
                for (Availability s : matchingSlots) {
                    Map<String, Object> slotMap = new HashMap<>();
                    slotMap.put("id", s.getId());
                    slotMap.put("dayOfWeek", s.getDayOfWeek());
                    slotMap.put("startTime", s.getStartTime().toString());
                    slotMap.put("endTime", s.getEndTime().toString());
                    slotMap.put("subject", s.getSubject());
                    slotMap.put("isRecurring", s.getIsRecurring());
                    slotsList.add(slotMap);
                }
                tutorInfo.put("slots", slotsList);
                results.add(tutorInfo);
            }
        }

        return results;
    }

    /**
     * Get available tutor slots for direct booking
     */
    public List<Map<String, Object>> getAvailableSlots(String tutorId, String subject) {
        List<TutorProfile> approvedProfiles = resolveApprovedTutorProfiles(tutorId);
        if (approvedProfiles.isEmpty()) {
            return List.of();
        }

        TutorProfile canonicalTutor = approvedProfiles.get(0);
        List<Availability> slots = new ArrayList<>();
        for (TutorProfile profile : approvedProfiles) {
            slots.addAll(availabilityRepository.findByTutorId(parseUuid(profile.getId(), "tutorId")));
        }
        List<Availability> unbookedSlots = slots.stream()
            .filter(s -> !Boolean.TRUE.equals(s.getIsBooked()))
            .collect(Collectors.toList());

        List<Availability> visibleSlots = unbookedSlots.stream()
            .filter(s -> matchesSubject(s, subject, canonicalTutor))
            .collect(Collectors.toList());

        // If a subject filter is too narrow or mismatched, still return unbooked slots for this tutor.
        if (hasText(subject) && visibleSlots.isEmpty()) {
            visibleSlots = unbookedSlots;
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Availability s : visibleSlots) {
            Map<String, Object> slotMap = new HashMap<>();
            slotMap.put("id", s.getId());
            slotMap.put("dayOfWeek", s.getDayOfWeek());
            slotMap.put("startTime", s.getStartTime().toString());
            slotMap.put("endTime", s.getEndTime().toString());
            slotMap.put("subject", s.getSubject());
            slotMap.put("isRecurring", s.getIsRecurring());
            result.add(slotMap);
        }
        return result;
    }
}
