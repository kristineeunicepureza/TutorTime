package com.example.testapi.repository;

import com.example.testapi.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, String> {
    Optional<Subject> findByName(String name);
    List<Subject> findByActive(Boolean active);
}
