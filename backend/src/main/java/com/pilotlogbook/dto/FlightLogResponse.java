package com.pilotlogbook.dto;

import com.pilotlogbook.model.enums.FlightRule;
import com.pilotlogbook.model.enums.WeatherCondition;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record FlightLogResponse(
        UUID id,
        UUID pilotId,
        String pilotName,
        UUID aircraftId,
        String aircraftTailNumber,
        String aircraftModel,
        LocalDate date,
        String departureAirport,
        String arrivalAirport,
        double totalFlightTime,
        double picTime,
        double sicTime,
        double dualReceivedTime,
        double soloTime,
        double nightTime,
        double ifrTime,
        double crossCountryTime,
        int dayLandings,
        int nightLandings,
        WeatherCondition weatherCondition,
        FlightRule flightRule,
        String remarks,
        List<String> approachTypes,
        Double simulatorTime,
        Instant createdAt,
        Instant updatedAt) {
}
