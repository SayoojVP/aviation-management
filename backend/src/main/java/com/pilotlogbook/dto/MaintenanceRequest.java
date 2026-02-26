package com.pilotlogbook.dto;

import com.pilotlogbook.model.enums.MaintenanceCheckType;
import com.pilotlogbook.model.enums.MaintenanceStatus;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.UUID;

public record MaintenanceRequest(
        @NotNull UUID aircraftId,
        @NotNull MaintenanceCheckType checkType,
        @NotNull MaintenanceStatus status,
        @NotNull LocalDate scheduledDate,
        LocalDate completedDate,
        @PositiveOrZero double hoursAtCheck,
        Double nextDueHours,
        LocalDate nextDueDate,
        String technician,
        String squawks,
        Double cost,
        String notes) {
}
