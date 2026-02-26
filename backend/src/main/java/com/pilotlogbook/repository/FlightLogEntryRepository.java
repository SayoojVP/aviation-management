package com.pilotlogbook.repository;

import com.pilotlogbook.model.FlightLogEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface FlightLogEntryRepository extends JpaRepository<FlightLogEntry, UUID> {

    List<FlightLogEntry> findByPilotIdOrderByDateDesc(UUID pilotId);

    List<FlightLogEntry> findByAircraftIdOrderByDateDesc(UUID aircraftId);

    @Query("SELECT f FROM FlightLogEntry f WHERE f.pilot.id = :pilotId AND f.date >= :from ORDER BY f.date DESC")
    List<FlightLogEntry> findByPilotIdAndDateAfter(@Param("pilotId") UUID pilotId, @Param("from") LocalDate from);

    @Query("SELECT SUM(f.totalFlightTime) FROM FlightLogEntry f WHERE f.pilot.id = :pilotId")
    Double sumTotalFlightTimeByPilotId(@Param("pilotId") UUID pilotId);
}
