package com.pilotlogbook.repository;

import com.pilotlogbook.model.Aircraft;
import com.pilotlogbook.model.enums.AircraftStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AircraftRepository extends JpaRepository<Aircraft, UUID> {
    Optional<Aircraft> findByTailNumber(String tailNumber);

    List<Aircraft> findByStatus(AircraftStatus status);

    List<Aircraft> findByOwnerId(UUID ownerId);
}
