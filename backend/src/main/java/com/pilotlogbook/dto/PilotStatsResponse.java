package com.pilotlogbook.dto;

import java.util.Map;

public record PilotStatsResponse(
        double totalTime,
        double picTime,
        double sicTime,
        double nightTime,
        double ifrTime,
        double crossCountryTime,
        double dualReceived,
        double soloTime,
        int totalLandings,
        int nightLandings,
        double last30Days,
        double last90Days,
        double lastYear,
        Map<String, Double> byAircraftCategory) {
}
