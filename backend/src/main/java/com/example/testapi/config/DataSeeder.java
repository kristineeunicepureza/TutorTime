package com.example.testapi.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.example.testapi.entity.Tutor;
import com.example.testapi.repository.TutorRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private TutorRepository tutorRepository;

    @Override
    public void run(String... args) {
        try {
            // Only seed if the table is empty
            if (tutorRepository.count() > 0) return;
        } catch (Exception e) {
            // If count fails (e.g., prepared statement error, table doesn't exist yet), skip seeding
            System.out.println("⚠️ Skipping DataSeeder: " + e.getMessage());
            return;
        }

        Tutor t1 = new Tutor();
        t1.setName("Dr. Sarah Chen");
        t1.setSubject("Advanced Mathematics");
        t1.setRating(4.9);
        t1.setTotalSessions(84);
        t1.setAvatarInitials("SC");
        t1.setVerified(true);
        t1.setBio("PhD in Applied Mathematics from NUS. Passionate about making complex concepts intuitive and accessible to all students. I specialize in helping students overcome math anxiety.");
        t1.setRate("₱250/hr");
        t1.setLocation("Library Room 2B");
        t1.setResponseTime("< 1 hour");
        t1.setTags(Arrays.asList("Calculus", "Linear Algebra", "Statistics"));
        t1.setAvailability(Arrays.asList("Mon 2–5 PM", "Wed 10 AM–1 PM", "Fri 3–6 PM"));

        Tutor t2 = new Tutor();
        t2.setName("Marcus Williams");
        t2.setSubject("Computer Science");
        t2.setRating(4.8);
        t2.setTotalSessions(61);
        t2.setAvatarInitials("MW");
        t2.setVerified(true);
        t2.setBio("Senior CS student with internship experience at top tech companies. I make DSA and system design click for students at every level.");
        t2.setRate("₱220/hr");
        t2.setLocation("CS Lab 101");
        t2.setResponseTime("< 2 hours");
        t2.setTags(Arrays.asList("Data Structures", "Algorithms", "Python"));
        t2.setAvailability(Arrays.asList("Tue 1–4 PM", "Thu 2–5 PM", "Sat 9 AM–12 PM"));

        Tutor t3 = new Tutor();
        t3.setName("Elena Rodriguez");
        t3.setSubject("Economics");
        t3.setRating(4.7);
        t3.setTotalSessions(45);
        t3.setAvatarInitials("ER");
        t3.setVerified(true);
        t3.setBio("Economics honors student with a passion for connecting theory to real-world applications. I use case studies and current events to make economics come alive.");
        t3.setRate("₱200/hr");
        t3.setLocation("Study Hall A");
        t3.setResponseTime("< 3 hours");
        t3.setTags(Arrays.asList("Microeconomics", "Statistics", "Finance"));
        t3.setAvailability(Arrays.asList("Mon 9 AM–12 PM", "Wed 3–6 PM", "Fri 10 AM–1 PM"));

        Tutor t4 = new Tutor();
        t4.setName("James Foster");
        t4.setSubject("Physics");
        t4.setRating(4.9);
        t4.setTotalSessions(72);
        t4.setAvatarInitials("JF");
        t4.setVerified(true);
        t4.setBio("Physics graduate student specializing in quantum mechanics. I break down the most daunting physics problems into manageable steps using visual diagrams and real examples.");
        t4.setRate("₱240/hr");
        t4.setLocation("Science Bldg 3F");
        t4.setResponseTime("< 1 hour");
        t4.setTags(Arrays.asList("Mechanics", "Thermodynamics", "Quantum"));
        t4.setAvailability(Arrays.asList("Tue 10 AM–1 PM", "Thu 3–6 PM", "Sun 2–5 PM"));

        tutorRepository.saveAll(List.of(t1, t2, t3, t4));
        System.out.println("✅ Tutors seeded successfully.");
    }
}