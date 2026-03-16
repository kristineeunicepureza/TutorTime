package com.example.testapi.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "profiles")
public class UserProfile {
    @Id
    private String id; // Supabase auth user id (uuid)

    @Column(nullable = false, unique = true)
    private String email;

    private String displayName;

    @Lob
    private byte[] photo;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public byte[] getPhoto() {
        return photo;
    }

    public void setPhoto(byte[] photo) {
        this.photo = photo;
    }
}