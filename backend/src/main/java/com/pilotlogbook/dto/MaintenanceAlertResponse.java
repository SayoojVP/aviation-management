package com.pilotlogbook.dto;

import com.pilotlogbook.model.enums.MaintenanceCheckType;
import com.pilotlogbook.model.enums.MaintenanceStatus;

import java.util.UUID;

public record MaintenanceAlertResponse(
        UUID aircraftId,
        String tailNumber,
        MaintenanceCheckType checkType,
        MaintenanceStatus status,
        long daysUntilDue,
        double hoursUntilDue,
        String urgency) {
}
