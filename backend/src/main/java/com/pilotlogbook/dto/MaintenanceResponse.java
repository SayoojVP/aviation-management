package com.pilotlogbook.dto;

import com.pilotlogbook.model.enums.MaintenanceCheckType;
import com.pilotlogbook.model.enums.MaintenanceStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record MaintenanceResponse(
        UUID id,
        UUID aircraftId,
        String aircraftTailNumber,
        MaintenanceCheckType checkType,
        MaintenanceStatus status,
        LocalDate scheduledDate,
        LocalDate completedDate,
        double hoursAtCheck,
        Double nextDueHours,
        LocalDate nextDueDate,
        String technician,
        String squawks,
        Double cost,
        String notes,
        Instant createdAt,
        Instant updatedAt) {
}
