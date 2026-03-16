package com.example.testapi.model;

public class CreateBookingRequest {
    private String tutorId;
    private String date;   // "YYYY-MM-DD"
    private String time;   // e.g. "3:00 PM"
    private String notes;

    public String getTutorId() { return tutorId; }
    public void setTutorId(String tutorId) { this.tutorId = tutorId; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}