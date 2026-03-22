# TutorTime Booking System Spec

## Scope
This document defines booking behavior across student, tutor, and admin flows for web and Android clients.

## Core Rule
- Confirmed bookings are persisted in Supabase and must survive logout/login.
- Unconfirmed selections (draft date/time/location before user presses Confirm Booking) are temporary UI state and are discarded on logout, app close, or session timeout.

## User Journeys

### Student Booking
1. Student logs in.
2. Student searches subject and opens tutor profile.
3. Student selects a currently available slot and location.
4. Student confirms booking.
5. System actions:
- Create booking record in DB.
- Mark slot as booked for the selected occurrence.
- Send notification to tutor.
- Associate booking with student account.

### Tutor Availability and Bookings
1. Tutor logs in.
2. Tutor creates recurring/one-time availability with day, start/end, and subject.
3. New slots become visible to students immediately.
4. Tutor sees upcoming and past bookings.
5. Tutor sees student name and booking details on each booking.

### Admin Management
1. Admin logs in and reviews pending tutors.
2. Admin approves/rejects tutor accounts.
3. Admin manages subjects available to directory/search.

### Cancellation
1. Student or tutor cancels a confirmed booking.
2. System sets booking status to CANCELLED.
3. System reopens slot availability.
4. System sends cancellation notification to the counterpart user.

## Booking Constraints
- Booking time must match tutor day/slot constraints.
- Booking must be in the future.
- Subject is fixed by slot and cannot be changed by student.
- Double booking of the same tutor/slot occurrence is blocked.
- Overlapping availability slots for the same tutor are blocked.

## API Contracts

### POST /api/bookings
Creates a booking from a student account.

Request body:
- tutorId: string (uuid)
- availabilityId: string (uuid)
- locationId: string
- bookingDate: string (yyyy-MM-dd)
- bookingTime: string (HH:mm or h:mm a)

Response success shape:
- success: true
- message: string
- data: Booking

### GET /api/bookings/my
Returns student booking history with detail payload.

Response success shape:
- success: true
- data: BookingDetailResponse[]

### GET /api/bookings/tutor
Returns tutor booking history with student-facing details for tutor UI.

Response success shape:
- success: true
- data: BookingDetailResponse[]

### DELETE /api/bookings/{id}
Cancels a booking.

Request body (optional):
- reason: string

Response success shape:
- success: true
- message: string
- data: Booking

## Booking Detail DTO Contract
BookingDetailResponse should include:
- id
- studentId
- studentName (for tutor dashboard)
- tutorId
- tutorName
- subject
- date
- time
- slotStart
- slotEnd
- locationId
- locationName
- status
- bookingStatus
- cancellationReason
- durationMinutes
- price
- createdAt

## Data Persistence Expectations
- bookings table is source of truth for session records.
- availability table represents tutor slots; booking confirmation/cancellation updates bookable state.
- UI must always read from API/DB after login; no booking list should depend on transient local state.

## Acceptance Criteria
- AC-1 Booking success creates DB row, marks slot booked, sends tutor notification.
- AC-2 Tutor slot creation appears in student search promptly.
- AC-3 Already booked slot cannot be rebooked.
- AC-4 Student can view upcoming/past bookings after relogin.
- AC-5 Approved tutors become searchable.
- AC-6 Cancel updates status and reopens slot.
- AC-7 Overlapping tutor availability is rejected.
