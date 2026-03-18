package com.example.testapi.repository;

import com.example.testapi.entity.TutorProfile;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TutorProfileRepository extends JpaRepository<TutorProfile, UUID> {
    Optional<TutorProfile> findByUserId(UUID userId);
    java.util.List<TutorProfile> findAllByUserId(UUID userId);
    long countByApprovalStatus(String approvalStatus);
}
