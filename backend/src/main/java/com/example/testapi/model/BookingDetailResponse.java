package com.example.testapi.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class BookingDetailResponse {
    private String id;
    private String studentId;
    private String studentName;
    private String tutorId;
    private String tutorName;
    private String subject;
    private String date;
    private String time;
    private String slotStart;
    private String slotEnd;
    private String locationId;
    private String locationName;
    private String status;
    private String bookingStatus;
    private String notes;
    private String cancellationReason;
    private Double durationMinutes;
    private Double price;
    private LocalDateTime createdAt;

    // Default constructor
    public BookingDetailResponse() {}

    // Full constructor
    public BookingDetailResponse(String id, String studentId, String tutorId, String tutorName,
                                String subject, String slotStart, String slotEnd, String locationId,
                                String locationName, String bookingStatus, Double durationMinutes,
                                Double price, LocalDateTime createdAt) {
        this.id = id;
        this.studentId = studentId;
        this.tutorId = tutorId;
        this.tutorName = tutorName;
        this.subject = subject;
        this.locationId = locationId;
        this.locationName = locationName;
        this.bookingStatus = bookingStatus;
        this.status = bookingStatus;
        this.durationMinutes = durationMinutes;
        this.price = price;
        this.createdAt = createdAt;
        
        // Parse slot times
        if (slotStart != null && !slotStart.isEmpty()) {
            try {
                LocalDateTime start = LocalDateTime.parse(slotStart);
                this.slotStart = slotStart;
                this.date = start.format(DateTimeFormatter.ofPattern("MMM d"));
                this.time = start.format(DateTimeFormatter.ofPattern("h:mm a"));
            } catch (Exception e) {
                this.slotStart = slotStart;
                this.date = slotStart;
                this.time = "TBD";
            }
        }
        
        if (slotEnd != null && !slotEnd.isEmpty()) {
            this.slotEnd = slotEnd;
        }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getTutorId() { return tutorId; }
    public void setTutorId(String tutorId) { this.tutorId = tutorId; }

    public String getTutorName() { return tutorName; }
    public void setTutorName(String tutorName) { this.tutorName = tutorName; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getSlotStart() { return slotStart; }
    public void setSlotStart(String slotStart) { this.slotStart = slotStart; }

    public String getSlotEnd() { return slotEnd; }
    public void setSlotEnd(String slotEnd) { this.slotEnd = slotEnd; }

    public String getLocationId() { return locationId; }
    public void setLocationId(String locationId) { this.locationId = locationId; }

    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getBookingStatus() { return bookingStatus; }
    public void setBookingStatus(String bookingStatus) { 
        this.bookingStatus = bookingStatus;
        this.status = bookingStatus;
    }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }

    public Double getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Double durationMinutes) { this.durationMinutes = durationMinutes; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
