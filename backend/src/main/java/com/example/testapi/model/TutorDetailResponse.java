package com.example.testapi.model;

import java.time.LocalDateTime;

public class TutorDetailResponse {
    private String tutorId;
    private String userId;
    private String name;
    private String email;
    private String bio;
    private Double hourlyRate;
    private String specialization;
    private Integer yearsOfExperience;
    private Double rating;
    private String approvalStatus;
    private LocalDateTime createdAt;

    public TutorDetailResponse(String tutorId, String userId, String name, String email,
                               String bio, Double hourlyRate, String specialization,
                               Integer yearsOfExperience, Double rating, String approvalStatus,
                               LocalDateTime createdAt) {
        this.tutorId = tutorId;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.bio = bio;
        this.hourlyRate = hourlyRate;
        this.specialization = specialization;
        this.yearsOfExperience = yearsOfExperience;
        this.rating = rating;
        this.approvalStatus = approvalStatus;
        this.createdAt = createdAt;
    }

    public String getTutorId() { return tutorId; }
    public void setTutorId(String tutorId) { this.tutorId = tutorId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public Double getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(Double hourlyRate) { this.hourlyRate = hourlyRate; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public Integer getYearsOfExperience() { return yearsOfExperience; }
    public void setYearsOfExperience(Integer yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public String getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
