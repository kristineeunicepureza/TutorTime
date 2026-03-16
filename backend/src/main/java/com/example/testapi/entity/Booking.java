package com.example.testapi.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // The user who made the booking (from JWT token)
    private String userId;

    // Tutor info (denormalized for easy retrieval)
    private String tutorId;
    private String tutorName;
    private String subject;
    private String location;
    private String avatarInitials;

    private LocalDate date;
    private String time;
    private String notes;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    public enum BookingStatus {
        CONFIRMED, COMPLETED, CANCELLED, PENDING
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getTutorId() { return tutorId; }
    public void setTutorId(String tutorId) { this.tutorId = tutorId; }
    public String getTutorName() { return tutorName; }
    public void setTutorName(String tutorName) { this.tutorName = tutorName; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getAvatarInitials() { return avatarInitials; }
    public void setAvatarInitials(String avatarInitials) { this.avatarInitials = avatarInitials; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }
}