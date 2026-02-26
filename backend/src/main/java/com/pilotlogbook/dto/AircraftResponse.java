package com.pilotlogbook.dto;

import com.pilotlogbook.model.enums.AircraftCategory;
import com.pilotlogbook.model.enums.AircraftStatus;

import java.time.Instant;
import java.util.UUID;

public record AircraftResponse(
        UUID id,
        String tailNumber,
        String make,
        String model,
        int year,
        AircraftCategory category,
        double totalAirframeHours,
        AircraftStatus status,
        int engineCount,
        int maxPassengers,
        UUID ownerId,
        String imageUrl,
        Instant createdAt,
        Instant updatedAt) {
}
