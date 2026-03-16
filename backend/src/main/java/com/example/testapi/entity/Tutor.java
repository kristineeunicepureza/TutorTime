package com.example.testapi.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "tutors")
public class Tutor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;
    private String subject;
    private double rating;
    private int totalSessions;
    private String avatarInitials;
    private boolean verified;
    private String bio;
    private String rate;
    private String location;
    private String responseTime;

    @ElementCollection
    @CollectionTable(name = "tutor_tags", joinColumns = @JoinColumn(name = "tutor_id"))
    @Column(name = "tag")
    private List<String> tags;

    @ElementCollection
    @CollectionTable(name = "tutor_availability", joinColumns = @JoinColumn(name = "tutor_id"))
    @Column(name = "slot")
    private List<String> availability;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }
    public int getTotalSessions() { return totalSessions; }
    public void setTotalSessions(int totalSessions) { this.totalSessions = totalSessions; }
    public String getAvatarInitials() { return avatarInitials; }
    public void setAvatarInitials(String avatarInitials) { this.avatarInitials = avatarInitials; }
    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getRate() { return rate; }
    public void setRate(String rate) { this.rate = rate; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getResponseTime() { return responseTime; }
    public void setResponseTime(String responseTime) { this.responseTime = responseTime; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public List<String> getAvailability() { return availability; }
    public void setAvailability(List<String> availability) { this.availability = availability; }
}