package com.example.testapi.model;

public class CreateAvailabilityRequest {
    private String dayOfWeek;      // "MONDAY", "TUESDAY", etc.
    private String startTime;      // "14:00:00"
    private String endTime;        // "18:00:00"
    private String subject;        // "Mathematics"
    private Boolean recurringWeekly; // true/false

    public CreateAvailabilityRequest() {}

    public CreateAvailabilityRequest(String dayOfWeek, String startTime, String endTime, 
                                     String subject, Boolean recurringWeekly) {
        this.dayOfWeek = dayOfWeek;
        this.startTime = startTime;
        this.endTime = endTime;
        this.subject = subject;
        this.recurringWeekly = recurringWeekly;
    }

    // Getters and Setters
    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public Boolean getRecurringWeekly() { return recurringWeekly; }
    public void setRecurringWeekly(Boolean recurringWeekly) { this.recurringWeekly = recurringWeekly; }
}
