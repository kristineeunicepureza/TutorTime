package com.example.testapi.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.testapi.entity.TutorProfile;

@Repository
public interface TutorProfileRepository extends JpaRepository<TutorProfile, String> {
    Optional<TutorProfile> findByUserId(String userId);
    long countByApprovalStatus(String approvalStatus);
}
