package com.example.testapi.controller;

import com.example.testapi.entity.Tutor;
import com.example.testapi.repository.TutorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tutors")
public class TutorController {

    @Autowired
    private TutorRepository tutorRepository;

    /**
     * GET /api/tutors
     * Returns all tutors. No auth required.
     */
    @GetMapping
    public List<Tutor> getAllTutors() {
        return tutorRepository.findAll();
    }

    /**
     * GET /api/tutors/{id}
     * Returns a single tutor by ID.
     */
    @GetMapping("/{id}")
    public Tutor getTutorById(@PathVariable String id) {
        return tutorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tutor not found: " + id));
    }
}