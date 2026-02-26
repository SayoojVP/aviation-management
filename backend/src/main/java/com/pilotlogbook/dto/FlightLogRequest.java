package com.pilotlogbook.dto;

import com.pilotlogbook.model.enums.FlightRule;
import com.pilotlogbook.model.enums.WeatherCondition;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record FlightLogRequest(
        @NotNull UUID aircraftId,
        @NotNull LocalDate date,
        @NotBlank String departureAirport,
        @NotBlank String arrivalAirport,
        @PositiveOrZero double totalFlightTime,
        @PositiveOrZero double picTime,
        @PositiveOrZero double sicTime,
        @PositiveOrZero double dualReceivedTime,
        @PositiveOrZero double soloTime,
        @PositiveOrZero double nightTime,
        @PositiveOrZero double ifrTime,
        @PositiveOrZero double crossCountryTime,
        @Min(0) int dayLandings,
        @Min(0) int nightLandings,
        @NotNull WeatherCondition weatherCondition,
        @NotNull FlightRule flightRule,
        String remarks,
        List<String> approachTypes,
        Double simulatorTime) {
}
