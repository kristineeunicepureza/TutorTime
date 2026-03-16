package com.example.testapi.model;

public class AdminApprovalRequest {
    private String tutorId;          // ID of tutor to approve/reject
    private String approvalStatus;   // "APPROVED" or "REJECTED"
    private String rejectionReason;  // Optional: reason for rejection

    public String getTutorId() { return tutorId; }
    public void setTutorId(String tutorId) { this.tutorId = tutorId; }

    public String getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}
