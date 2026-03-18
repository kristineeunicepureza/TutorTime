package com.example.testapi.model;

public class CreateBookingRequest {
    private String tutorId;          // ID of tutor to book
    private String availabilityId;   // Availability slot ID being booked
    private String locationId;       // Location where session will occur
    private String subject;          // Subject (from availability)
    private String bookingDate;      // Student-selected date (yyyy-MM-dd)
    private String bookingTime;      // Student-selected time (e.g., 15:00 or 3:00 PM)

    public String getTutorId() { return tutorId; }
    public void setTutorId(String tutorId) { this.tutorId = tutorId; }

    public String getAvailabilityId() { return availabilityId; }
    public void setAvailabilityId(String availabilityId) { this.availabilityId = availabilityId; }

    public String getLocationId() { return locationId; }
    public void setLocationId(String locationId) { this.locationId = locationId; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getBookingDate() { return bookingDate; }
    public void setBookingDate(String bookingDate) { this.bookingDate = bookingDate; }

    public String getBookingTime() { return bookingTime; }
    public void setBookingTime(String bookingTime) { this.bookingTime = bookingTime; }
}