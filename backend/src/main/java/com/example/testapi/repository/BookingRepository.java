package com.example.testapi.repository;

import com.example.testapi.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByUserIdOrderByDateDesc(String userId);
}