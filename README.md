# TutorTime 📚⏰

**Peer-to-Peer Academic Scheduling Platform**

TutorTime is a **peer tutoring scheduling platform** designed to connect students who need academic help with student tutors offering expertise in specific subjects. The system provides an efficient way to **discover tutors, manage availability, and book face-to-face tutoring sessions** through a mobile application and web dashboard.

---

# Project Overview

TutorTime solves the problem of **manual and inefficient tutor scheduling**, which commonly happens through social media or messaging platforms.

The platform consists of three main components:

* **Backend API** – Handles authentication, booking transactions, tutor management, and database operations.
* **Web Application** – Used by tutors and administrators to manage schedules, subjects, and system data.
* **Mobile Application** – Used by students to search for tutors and book sessions.

---

# Technology Stack

### Backend

* Java 17
* Spring Boot 3
* Spring Security (JWT Authentication)
* Spring Data JPA
* Maven

### Database

* PostgreSQL 14+

### Web Frontend

* React 18
* TypeScript
* CSS

### Mobile Application

* Kotlin
* Jetpack Compose

### Deployment

* Backend: Railway / Render / Heroku
* Web: Vercel / Netlify
* Mobile: Android APK Distribution

---

# Core Features

## User Authentication

* Student, Tutor, and Admin roles
* Secure login and registration
* JWT-based authentication
* Password hashing using bcrypt

## Tutor Directory

* Browse tutors by subject
* Search tutors by name or expertise
* View tutor profiles and qualifications

## Booking System

* Students can select available time slots
* Choose campus meeting locations
* Confirm bookings instantly
* Prevents double-booking conflicts

## Tutor Dashboard

* Manage availability slots
* View upcoming and past bookings
* Update tutor profile information

## Admin Panel

* Verify tutor accounts
* Manage academic subjects
* View system booking logs

## Booking Management

* View booking history
* Cancel sessions
* Automatic slot recovery after cancellation

---

# Functional Workflow

### Student Booking Flow

1. Student logs into the mobile app
2. Searches for a tutor by subject
3. Selects an available time slot
4. Chooses a campus meeting location
5. Confirms the booking

Result:

* Booking record created
* Slot marked as booked
* Tutor receives notification

---

### Tutor Availability Flow

1. Tutor logs into the web dashboard
2. Navigates to availability management
3. Adds available time slots
4. Slots become visible to students immediately

---

### Admin Verification Flow

1. Admin logs into the dashboard
2. Reviews pending tutor accounts
3. Approves or rejects tutor applications
4. Approved tutors appear in the directory

---

# Contributors

**Kristine Eunice Pureza (BSIT-3)**
System Integration and Architecture
IT342-G7

---
