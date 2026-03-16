package com.example.testapi.model;

public class CancelBookingRequest {
    private String reason;  // Cancellation reason

    public CancelBookingRequest() {}

    public CancelBookingRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
