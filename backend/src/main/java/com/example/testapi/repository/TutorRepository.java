package com.example.testapi.repository;

import com.example.testapi.entity.Tutor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TutorRepository extends JpaRepository<Tutor, String> {
}