package com.pilotlogbook.dto;

public record FleetStatsResponse(
        int totalAircraft,
        int airworthyCount,
        int groundedCount,
        int maintenanceCount,
        int overdueChecks,
        int dueSoonChecks,
        double totalFleetHours) {
}
