package com.example.testapi.model;

import com.fasterxml.jackson.annotation.JsonAlias;

public class RegisterRequest {
    private String email;
    private String password;
    @JsonAlias("fullName")
    private String displayName;
    @JsonAlias("role")
    private String userType; // STUDENT or TUTOR

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getResolvedName() {
        return displayName == null ? null : displayName.trim();
    }

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }
}