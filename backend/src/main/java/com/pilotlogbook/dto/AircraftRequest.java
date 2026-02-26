package com.pilotlogbook.dto;

import com.pilotlogbook.model.enums.AircraftCategory;
import com.pilotlogbook.model.enums.AircraftStatus;
import jakarta.validation.constraints.*;

import java.util.UUID;

public record AircraftRequest(
        @NotBlank String tailNumber,
        @NotBlank String make,
        @NotBlank String model,
        @Min(1900) int year,
        @NotNull AircraftCategory category,
        @PositiveOrZero double totalAirframeHours,
        @NotNull AircraftStatus status,
        @Min(1) int engineCount,
        @Min(1) int maxPassengers,
        UUID ownerId,
        String imageUrl) {
}
