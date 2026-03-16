package com.example.testapi.repository;

import com.example.testapi.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {
    // Student booking history
    List<Booking> findByStudentIdOrderBySlotStartDesc(String studentId);
    
    // Tutor's upcoming and past bookings
    List<Booking> findByTutorIdOrderBySlotStartDesc(String tutorId);
    
    // Check for booking conflicts (AC-3, AC-7)
    List<Booking> findByAvailabilityIdAndBookingStatus(String availabilityId, String status);
    
    // Check tutor's time conflicts
    @Query("SELECT b FROM Booking b WHERE b.tutorId = ?1 AND b.bookingStatus != 'CANCELLED' AND " +
           "NOT (b.slotEnd <= ?2 OR b.slotStart >= ?3)")
    List<Booking> findTutorConflicts(String tutorId, LocalDateTime slotStart, LocalDateTime slotEnd);
    
    // Get bookings by status
    List<Booking> findByBookingStatus(String status);
}