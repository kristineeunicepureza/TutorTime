package com.example.testapi.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false, columnDefinition = "uuid")
    private UUID studentId;  // Student who booked (from JWT)

    @Column(nullable = false, columnDefinition = "uuid")
    private UUID tutorId;    // Tutor being booked

    @Column(nullable = false, columnDefinition = "uuid")
    private UUID availabilityId;  // Reference to availability slot

    @Column(nullable = false, columnDefinition = "uuid")
    private UUID locationId;  // Location of tutoring

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private LocalDateTime slotStart;

    @Column(nullable = false)
    private LocalDateTime slotEnd;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "time", nullable = false)
    private LocalTime time;

    @Column(nullable = false)
    private String bookingStatus = "CONFIRMED";  // CONFIRMED, CANCELLED, COMPLETED

    @Column(columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(nullable = false)
    private Double durationMinutes = 30.0;

    private Double price;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (bookingStatus == null || bookingStatus.isBlank()) {
            bookingStatus = "CONFIRMED";
        }
        if (date == null && slotStart != null) {
            date = slotStart.toLocalDate();
        }
        if (time == null && slotStart != null) {
            time = slotStart.toLocalTime().withSecond(0).withNano(0);
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id == null ? null : id.toString(); }
    public void setId(String id) { this.id = id == null ? null : UUID.fromString(id); }

    public String getStudentId() { return studentId == null ? null : studentId.toString(); }
    public void setStudentId(String studentId) { this.studentId = studentId == null ? null : UUID.fromString(studentId); }

    public String getTutorId() { return tutorId == null ? null : tutorId.toString(); }
    public void setTutorId(String tutorId) { this.tutorId = tutorId == null ? null : UUID.fromString(tutorId); }

    public String getAvailabilityId() { return availabilityId == null ? null : availabilityId.toString(); }
    public void setAvailabilityId(String availabilityId) { this.availabilityId = availabilityId == null ? null : UUID.fromString(availabilityId); }

    public String getLocationId() { return locationId == null ? null : locationId.toString(); }
    public void setLocationId(String locationId) { this.locationId = locationId == null ? null : UUID.fromString(locationId); }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public LocalDateTime getSlotStart() { return slotStart; }
    public void setSlotStart(LocalDateTime slotStart) { this.slotStart = slotStart; }

    public LocalDateTime getSlotEnd() { return slotEnd; }
    public void setSlotEnd(LocalDateTime slotEnd) { this.slotEnd = slotEnd; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalTime getTime() { return time; }
    public void setTime(LocalTime time) { this.time = time; }

    public String getBookingStatus() { return bookingStatus; }
    public void setBookingStatus(String bookingStatus) { this.bookingStatus = bookingStatus; }

    // Compatibility alias for frontend components that read `status`
    public String getStatus() { return bookingStatus; }
    public void setStatus(String status) { this.bookingStatus = status; }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String reason) { this.cancellationReason = reason; }

    public Double getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Double durationMinutes) { this.durationMinutes = durationMinutes; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}