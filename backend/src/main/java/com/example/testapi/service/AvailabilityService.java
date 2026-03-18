package com.example.testapi.service;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.testapi.entity.Availability;
import com.example.testapi.entity.TutorProfile;
import com.example.testapi.model.CreateAvailabilityRequest;
import com.example.testapi.repository.AvailabilityRepository;
import com.example.testapi.repository.TutorProfileRepository;

@Service
public class AvailabilityService {

    private UUID parseUuid(String id, String fieldName) {
        try {
            return UUID.fromString(id);
        } catch (Exception e) {
            throw new RuntimeException("Invalid " + fieldName + " format");
        }
    }

    @Autowired
    private AvailabilityRepository availabilityRepository;

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    private TutorProfile requireApprovedTutorProfile(String uid) {
        Optional<TutorProfile> tutorOpt = tutorProfileRepository.findByUserId(parseUuid(uid, "userId"));
        if (tutorOpt.isEmpty()) {
            throw new RuntimeException("Tutor profile not found for user: " + uid);
        }

        TutorProfile tutor = tutorOpt.get();
        if (!"APPROVED".equals(tutor.getApprovalStatus())) {
            throw new RuntimeException("Tutor approval is required before managing availability");
        }

        return tutor;
    }

    /**
     * Create a new availability slot for a tutor
     * AC-7: Check for time conflicts to prevent double-booking
     */
    public Availability createAvailability(String uid, CreateAvailabilityRequest request) {
        TutorProfile tutor = requireApprovedTutorProfile(uid);

        // AC-7: Parse times first
        LocalTime newStartTime;
        LocalTime newEndTime;
        try {
            newStartTime = LocalTime.parse(request.getStartTime());
            newEndTime = LocalTime.parse(request.getEndTime());
        } catch (Exception e) {
            throw new RuntimeException("Invalid time format. Expected HH:mm or HH:mm:ss");
        }

        // AC-7: Validate time range
        if (newEndTime.isBefore(newStartTime) || newEndTime.equals(newStartTime)) {
            throw new RuntimeException("End time must be after start time");
        }

        // AC-7: Check for conflicts with existing slots on same day
        List<Availability> existingSlots = availabilityRepository.findByTutorId(parseUuid(tutor.getId(), "tutorId"));
        for (Availability slot : existingSlots) {
            // Check if same day of week
            if (slot.getDayOfWeek().equalsIgnoreCase(request.getDayOfWeek())) {
                // Check for time overlap
                // Overlap occurs if: newStart < existingEnd AND newEnd > existingStart
                if (newStartTime.isBefore(slot.getEndTime()) && newEndTime.isAfter(slot.getStartTime())) {
                    throw new RuntimeException(
                        "Time conflict detected! You already have a slot from " +
                        slot.getStartTime() + " to " + slot.getEndTime() + " on " +
                        request.getDayOfWeek()
                    );
                }
            }
        }

        // Create availability slot
        Availability availability = new Availability();
        availability.setTutorId(tutor.getId());
        availability.setDayOfWeek(request.getDayOfWeek());
        availability.setSubject(request.getSubject());
        availability.setStartTime(newStartTime);
        availability.setEndTime(newEndTime);
        availability.setIsRecurring(request.getRecurringWeekly() == null || request.getRecurringWeekly());
        availability.setIsBooked(false);

        return availabilityRepository.save(availability);
    }

    /**
     * Get all availability slots for a tutor
     */
    public List<Availability> getAvailabilityByTutorId(String uid) {
        Optional<TutorProfile> tutorOpt = tutorProfileRepository.findByUserId(parseUuid(uid, "userId"));
        if (tutorOpt.isEmpty()) {
            return List.of();
        }

        TutorProfile tutor = tutorOpt.get();
        if (!"APPROVED".equals(tutor.getApprovalStatus())) {
            return List.of();
        }

        return availabilityRepository.findByTutorId(parseUuid(tutor.getId(), "tutorId"));
    }

    /**
     * Get unbooked availability slots for student-facing tutor profile pages.
     * Accepts either tutor profile id or tutor user id.
     */
    public List<Availability> getPublicAvailableSlotsByTutorIdentifier(String tutorIdentifier) {
        UUID tutorUuid = parseUuid(tutorIdentifier, "tutorId");

        Optional<TutorProfile> tutorOpt = tutorProfileRepository.findById(tutorUuid);
        if (tutorOpt.isEmpty()) {
            tutorOpt = tutorProfileRepository.findByUserId(tutorUuid);
        }

        if (tutorOpt.isEmpty() || !"APPROVED".equals(tutorOpt.get().getApprovalStatus())) {
            return List.of();
        }

        return availabilityRepository.findByTutorId(parseUuid(tutorOpt.get().getId(), "tutorId")).stream()
            .filter(slot -> !Boolean.TRUE.equals(slot.getIsBooked()))
            .collect(Collectors.toList());
    }

    /**
     * Get a specific availability slot
     */
    public Availability getAvailabilityById(String id) {
        Optional<Availability> opt = availabilityRepository.findById(parseUuid(id, "availabilityId"));
        return opt.orElse(null);
    }

    /**
     * Update an availability slot (only if tutor owns it)
     * AC-7: Check for time conflicts with other slots
     */
    public Availability updateAvailability(String id, String uid, CreateAvailabilityRequest request) {
        Optional<Availability> opt = availabilityRepository.findById(parseUuid(id, "availabilityId"));
        
        if (opt.isEmpty()) {
            throw new RuntimeException("Availability not found");
        }

        Availability availability = opt.get();

        // Verify ownership
        TutorProfile tutor = requireApprovedTutorProfile(uid);
        if (!availability.getTutorId().equals(tutor.getId())) {
            throw new RuntimeException("You don't have permission to update this availability");
        }

        // AC-7: Parse and validate new times
        LocalTime newStartTime;
        LocalTime newEndTime;
        try {
            newStartTime = LocalTime.parse(request.getStartTime());
            newEndTime = LocalTime.parse(request.getEndTime());
        } catch (Exception e) {
            throw new RuntimeException("Invalid time format. Expected HH:mm or HH:mm:ss");
        }

        if (newEndTime.isBefore(newStartTime) || newEndTime.equals(newStartTime)) {
            throw new RuntimeException("End time must be after start time");
        }

        // AC-7: Check for conflicts with OTHER slots on same day
        List<Availability> existingSlots = availabilityRepository.findByTutorId(parseUuid(availability.getTutorId(), "tutorId"));
        for (Availability slot : existingSlots) {
            // Skip the slot being updated
            if (slot.getId().equals(id)) {
                continue;
            }

            // Check if same day of week
            if (slot.getDayOfWeek().equalsIgnoreCase(request.getDayOfWeek())) {
                // Check for time overlap
                if (newStartTime.isBefore(slot.getEndTime()) && newEndTime.isAfter(slot.getStartTime())) {
                    throw new RuntimeException(
                        "Time conflict detected! You already have a slot from " +
                        slot.getStartTime() + " to " + slot.getEndTime() + " on " +
                        request.getDayOfWeek()
                    );
                }
            }
        }

        // Update fields
        availability.setDayOfWeek(request.getDayOfWeek());
        availability.setSubject(request.getSubject());
        availability.setStartTime(newStartTime);
        availability.setEndTime(newEndTime);
        availability.setIsRecurring(request.getRecurringWeekly() == null || request.getRecurringWeekly());

        return availabilityRepository.save(availability);
    }

    /**
     * Delete an availability slot
     */
    public boolean deleteAvailability(String id, String uid) {
        Optional<Availability> availabilityOpt = availabilityRepository.findById(parseUuid(id, "availabilityId"));
        if (availabilityOpt.isEmpty()) {
            return false;
        }

        Availability availability = availabilityOpt.get();
        TutorProfile tutor = requireApprovedTutorProfile(uid);
        if (!availability.getTutorId().equals(tutor.getId())) {
            throw new RuntimeException("You don't have permission to delete this availability");
        }

        availabilityRepository.deleteById(parseUuid(id, "availabilityId"));
        return true;
    }
}
