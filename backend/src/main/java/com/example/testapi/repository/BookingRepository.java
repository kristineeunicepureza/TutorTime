package com.example.testapi.repository;

import com.example.testapi.entity.Booking;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    // Student booking history
    List<Booking> findByStudentIdOrderBySlotStartDesc(UUID studentId);
    
    // Tutor's upcoming and past bookings
    List<Booking> findByTutorIdOrderBySlotStartDesc(UUID tutorId);

    // Legacy-safe retrieval: booking belongs to tutor if the linked availability slot belongs to tutor profile id.
    @Query(value = "SELECT b.* FROM bookings b JOIN availability a ON b.availability_id = a.id WHERE a.tutor_id = ?1 ORDER BY b.slot_start DESC", nativeQuery = true)
    List<Booking> findByTutorAvailabilityOwner(UUID tutorProfileId);
    
    // Check for booking conflicts (AC-3, AC-7)
    List<Booking> findByAvailabilityIdAndBookingStatus(UUID availabilityId, String status);

    // Check if slot has any active booking (anything except CANCELLED)
    boolean existsByAvailabilityIdAndBookingStatusNot(UUID availabilityId, String bookingStatus);
    
    // Check tutor's time conflicts
    @Query("SELECT b FROM Booking b WHERE b.tutorId = ?1 AND b.bookingStatus != 'CANCELLED' AND " +
           "NOT (b.slotEnd <= ?2 OR b.slotStart >= ?3)")
    List<Booking> findTutorConflicts(UUID tutorId, LocalDateTime slotStart, LocalDateTime slotEnd);
    
    // Get bookings by status
    List<Booking> findByBookingStatus(String status);
}