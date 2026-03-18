package com.example.testapi.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.testapi.entity.UserProfile;

public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {
}