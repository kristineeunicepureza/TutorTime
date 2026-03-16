package com.example.testapi.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String userId;  // Recipient user ID

    @Column(nullable = false)
    private String type;  // BOOKING_CREATED, BOOKING_CANCELLED, TUTOR_APPROVED, etc.

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    private String relatedBookingId;
    private String relatedTutorId;

    @Column(nullable = false)
    private Boolean isRead = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getRelatedBookingId() { return relatedBookingId; }
    public void setRelatedBookingId(String relatedBookingId) { this.relatedBookingId = relatedBookingId; }

    public String getRelatedTutorId() { return relatedTutorId; }
    public void setRelatedTutorId(String relatedTutorId) { this.relatedTutorId = relatedTutorId; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }

    public void markAsRead() {
        this.isRead = true;
        this.readAt = LocalDateTime.now();
    }
}
