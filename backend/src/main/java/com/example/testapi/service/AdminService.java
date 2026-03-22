package com.example.testapi.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.testapi.entity.Subject;
import com.example.testapi.entity.TutorProfile;
import com.example.testapi.entity.User;
import com.example.testapi.model.TutorDetailResponse;
import com.example.testapi.repository.SubjectRepository;
import com.example.testapi.repository.TutorProfileRepository;
import com.example.testapi.repository.UserRepository;

@Service
public class AdminService {

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    private UUID parseUuid(String id, String fieldName) {
        try {
            return UUID.fromString(id);
        } catch (Exception e) {
            throw new RuntimeException("Invalid " + fieldName + " format");
        }
    }

    public List<TutorDetailResponse> getPendingTutorRequests() {
        List<TutorProfile> pendingProfiles = tutorProfileRepository.findAll().stream()
            .filter(profile -> "PENDING".equalsIgnoreCase(profile.getApprovalStatus()))
            .sorted(Comparator.comparing(TutorProfile::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())))
            .toList();

        List<TutorDetailResponse> responses = new ArrayList<>();
        for (TutorProfile profile : pendingProfiles) {
            Optional<User> userOpt = userRepository.findById(parseUuid(profile.getUserId(), "userId"));
            String name = userOpt.map(User::getFullName).orElse("Unknown User");
            String email = userOpt.map(User::getEmail).orElse(null);

            responses.add(new TutorDetailResponse(
                profile.getId(),
                profile.getUserId(),
                name,
                email,
                profile.getBio(),
                profile.getHourlyRate(),
                profile.getSpecialization(),
                profile.getYearsOfExperience(),
                profile.getRating(),
                profile.getApprovalStatus(),
                profile.getCreatedAt()
            ));
        }

        return responses;
    }

    public TutorProfile approveTutor(String tutorId) {
        TutorProfile profile = tutorProfileRepository.findById(parseUuid(tutorId, "tutorId"))
            .orElseThrow(() -> new RuntimeException("Tutor profile not found"));

        profile.setApprovalStatus("APPROVED");
        profile.setVerified(true);
        TutorProfile saved = tutorProfileRepository.save(profile);

        userRepository.findById(parseUuid(profile.getUserId(), "userId")).ifPresent(user -> {
            if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
                user.setRole("TUTOR");
                userRepository.save(user);
            }
        });

        return saved;
    }

    public TutorProfile rejectTutor(String tutorId, String reason) {
        TutorProfile profile = tutorProfileRepository.findById(parseUuid(tutorId, "tutorId"))
            .orElseThrow(() -> new RuntimeException("Tutor profile not found"));

        profile.setApprovalStatus("REJECTED");
        profile.setVerified(false);
        return tutorProfileRepository.save(profile);
    }

    public List<Subject> getAllSubjects() {
        return subjectRepository.findByActive(true).stream()
            .sorted(Comparator.comparing(Subject::getName, String.CASE_INSENSITIVE_ORDER))
            .toList();
    }

    public Subject addSubject(String name, String description) {
        String normalizedName = normalizeName(name);
        if (normalizedName.isEmpty()) {
            throw new RuntimeException("Subject name is required");
        }

        boolean exists = subjectRepository.findAll().stream()
            .anyMatch(subject -> normalizedName.equalsIgnoreCase(subject.getName()));
        if (exists) {
            throw new RuntimeException("Subject already exists");
        }

        Subject subject = new Subject();
        subject.setName(normalizedName);
        subject.setDescription(description == null ? "" : description.trim());
        subject.setActive(true);
        return subjectRepository.save(subject);
    }

    public Subject updateSubject(String subjectId, String name, String description) {
        Subject subject = subjectRepository.findById(parseUuid(subjectId, "subjectId"))
            .orElseThrow(() -> new RuntimeException("Subject not found"));

        String normalizedName = normalizeName(name);
        if (normalizedName.isEmpty()) {
            throw new RuntimeException("Subject name is required");
        }

        boolean duplicateName = subjectRepository.findAll().stream()
            .anyMatch(existing -> !existing.getId().equals(subject.getId())
                && normalizedName.equalsIgnoreCase(existing.getName()));
        if (duplicateName) {
            throw new RuntimeException("Another subject with this name already exists");
        }

        subject.setName(normalizedName);
        subject.setDescription(description == null ? "" : description.trim());
        return subjectRepository.save(subject);
    }

    public void deactivateSubject(String subjectId) {
        Subject subject = subjectRepository.findById(parseUuid(subjectId, "subjectId"))
            .orElseThrow(() -> new RuntimeException("Subject not found"));

        subject.setActive(false);
        subjectRepository.save(subject);
    }

    private String normalizeName(String name) {
        if (name == null) {
            return "";
        }
        return name.trim().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT)
            .replaceFirst("^.", name.trim().isEmpty() ? "" : name.trim().substring(0, 1).toUpperCase(Locale.ROOT));
    }
}