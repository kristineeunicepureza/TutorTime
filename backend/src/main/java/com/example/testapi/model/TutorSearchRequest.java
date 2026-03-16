package com.example.testapi.model;

public class TutorSearchRequest {
    private String subject;        // Subject to search for
    private String dayOfWeek;     // Optional: filter by day (MONDAY, TUESDAY, etc.)
    private String location;       // Optional: filter by location

    public TutorSearchRequest() {}

    public TutorSearchRequest(String subject) {
        this.subject = subject;
    }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
}
