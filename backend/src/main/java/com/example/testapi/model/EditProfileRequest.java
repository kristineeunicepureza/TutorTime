package com.example.testapi.model;

public class EditProfileRequest {
    private String displayName;
    private String fullName;       // alias for displayName
    private String department;
    private String yearLevel;
    private String subject;        // for tutors
    private String bio;            // for tutors
    private String hourlyRate;     // for tutors
    private String profilePhotoUrl;

    // Resolve the name from either field
    public String getDisplayName() {
        if (displayName != null && !displayName.isBlank()) return displayName;
        return fullName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getYearLevel() { return yearLevel; }
    public void setYearLevel(String yearLevel) { this.yearLevel = yearLevel; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(String hourlyRate) { this.hourlyRate = hourlyRate; }

    public String getProfilePhotoUrl() { return profilePhotoUrl; }
    public void setProfilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; }
}