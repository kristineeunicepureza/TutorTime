package com.example.testapi.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.testapi.entity.Location;

@Repository
public interface LocationRepository extends JpaRepository<Location, String> {
    Optional<Location> findByName(String name);
    List<Location> findByActive(Boolean active);
}
