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
                .filter(s -> subject.equalsIgnoreCase(s.getSubject()))
                .filter(s -> !s.getIsBooked())  // Only available slots
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
        UUID tutorUuid = parseUuid(tutorId, "tutorId");
        Optional<TutorProfile> tutorOpt = tutorProfileRepository.findById(tutorUuid);
        if (tutorOpt.isEmpty()) {
            tutorOpt = tutorProfileRepository.findByUserId(tutorUuid);
        }

        if (tutorOpt.isEmpty() || !"APPROVED".equals(tutorOpt.get().getApprovalStatus())) {
            return List.of();
        }

        List<Availability> slots = availabilityRepository.findByTutorId(parseUuid(tutorOpt.get().getId(), "tutorId"));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Availability s : slots) {
            if ((subject == null || subject.equalsIgnoreCase(s.getSubject())) &&
                !s.getIsBooked()) {
                Map<String, Object> slotMap = new HashMap<>();
                slotMap.put("id", s.getId());
                slotMap.put("dayOfWeek", s.getDayOfWeek());
                slotMap.put("startTime", s.getStartTime().toString());
                slotMap.put("endTime", s.getEndTime().toString());
                slotMap.put("subject", s.getSubject());
                slotMap.put("isRecurring", s.getIsRecurring());
                result.add(slotMap);
            }
        }
        return result;
    }
}
