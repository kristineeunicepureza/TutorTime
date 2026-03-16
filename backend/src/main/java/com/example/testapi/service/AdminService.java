package com.example.testapi.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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
    private SubjectRepository subjectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    /**
     * AC-5: Get pending tutor verification requests with user details
     */
    public List<TutorDetailResponse> getPendingTutorRequests() {
        List<TutorProfile> allTutors = tutorProfileRepository.findAll();
        List<TutorDetailResponse> pending = new ArrayList<>();

        for (TutorProfile tutor : allTutors) {
            if ("PENDING".equals(tutor.getApprovalStatus())) {
                Optional<User> userOpt = userRepository.findById(tutor.getUserId());
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    TutorDetailResponse detail = new TutorDetailResponse(
                        tutor.getId(),
                        tutor.getUserId(),
                        user.getFullName(),
                        user.getEmail(),
                        tutor.getBio(),
                        tutor.getHourlyRate(),
                        tutor.getSpecialization(),
                        tutor.getYearsOfExperience(),
                        tutor.getRating(),
                        tutor.getApprovalStatus(),
                        tutor.getCreatedAt()
                    );
                    pending.add(detail);
                }
            }
        }

        return pending;
    }

    /**
     * AC-5: Approve a tutor
     * Updates status to APPROVED and sends notification
     */
    public TutorProfile approveTutor(String tutorId) {
        Optional<TutorProfile> tutorOpt = tutorProfileRepository.findById(tutorId);
        if (tutorOpt.isEmpty()) {
            throw new RuntimeException("Tutor not found");
        }

        TutorProfile tutor = tutorOpt.get();
        tutor.setApprovalStatus("APPROVED");
        tutor.setVerified(true);
        TutorProfile updated = tutorProfileRepository.save(tutor);

        // AC-5: Send notification to tutor
        notificationService.sendApprovalNotification(
            tutor.getUserId(),
            "Congratulations! Your tutor profile has been approved. You can now accept bookings from students!"
        );

        return updated;
    }

    /**
     * Reject a tutor
     */
    public TutorProfile rejectTutor(String tutorId, String reason) {
        Optional<TutorProfile> tutorOpt = tutorProfileRepository.findById(tutorId);
        if (tutorOpt.isEmpty()) {
            throw new RuntimeException("Tutor not found");
        }

        TutorProfile tutor = tutorOpt.get();
        tutor.setApprovalStatus("REJECTED");
        TutorProfile updated = tutorProfileRepository.save(tutor);

        // Send notification
        notificationService.sendApprovalNotification(
            tutor.getUserId(),
            "Your tutor profile application has been rejected. Reason: " + reason
        );

        return updated;
    }

    /**
     * Add a new subject to the system
     */
    public Subject addSubject(String name, String description) {
        // Check if subject already exists
        Optional<Subject> existing = subjectRepository.findByName(name);
        if (existing.isPresent()) {
            throw new RuntimeException("Subject already exists");
        }

        Subject subject = new Subject();
        subject.setName(name);
        subject.setDescription(description);
        subject.setActive(true);
        return subjectRepository.save(subject);
    }

    /**
     * Get all available subjects
     */
    public List<Subject> getAllSubjects() {
        return subjectRepository.findByActive(true);
    }

    /**
     * Update a subject
     */
    public Subject updateSubject(String subjectId, String name, String description) {
        Optional<Subject> subjectOpt = subjectRepository.findById(subjectId);
        if (subjectOpt.isEmpty()) {
            throw new RuntimeException("Subject not found");
        }

        Subject subject = subjectOpt.get();
        subject.setName(name);
        subject.setDescription(description);
        return subjectRepository.save(subject);
    }

    /**
     * Deactivate a subject
     */
    public void deactivateSubject(String subjectId) {
        Optional<Subject> subjectOpt = subjectRepository.findById(subjectId);
        if (subjectOpt.isPresent()) {
            Subject subject = subjectOpt.get();
            subject.setActive(false);
            subjectRepository.save(subject);
        }
    }
}
