package com.pilotlogbook.service;

import com.pilotlogbook.dto.AircraftRequest;
import com.pilotlogbook.dto.AircraftResponse;
import com.pilotlogbook.dto.FleetStatsResponse;
import com.pilotlogbook.dto.MaintenanceAlertResponse;
import com.pilotlogbook.model.Aircraft;
import com.pilotlogbook.model.MaintenanceRecord;
import com.pilotlogbook.model.User;
import com.pilotlogbook.model.enums.MaintenanceStatus;
import com.pilotlogbook.repository.AircraftRepository;
import com.pilotlogbook.repository.MaintenanceRecordRepository;
import com.pilotlogbook.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AircraftService {

    private final AircraftRepository aircraftRepository;
    private final UserRepository userRepository;
    private final MaintenanceRecordRepository maintenanceRecordRepository;

    public List<AircraftResponse> getAllAircraft() {
        return aircraftRepository.findAll().stream().map(this::toResponse).toList();
    }

    public AircraftResponse getById(UUID id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public AircraftResponse create(AircraftRequest request) {
        User owner = request.ownerId() != null
                ? userRepository.findById(request.ownerId()).orElse(null)
                : null;

        Aircraft aircraft = Aircraft.builder()
                .tailNumber(request.tailNumber())
                .make(request.make())
                .model(request.model())
                .year(request.year())
                .category(request.category())
                .totalAirframeHours(request.totalAirframeHours())
                .status(request.status())
                .engineCount(request.engineCount())
                .maxPassengers(request.maxPassengers())
                .owner(owner)
                .imageUrl(request.imageUrl())
                .build();

        return toResponse(aircraftRepository.save(aircraft));
    }

    @Transactional
    public AircraftResponse update(UUID id, AircraftRequest request) {
        Aircraft aircraft = findOrThrow(id);
        User owner = request.ownerId() != null
                ? userRepository.findById(request.ownerId()).orElse(null)
                : null;

        aircraft.setTailNumber(request.tailNumber());
        aircraft.setMake(request.make());
        aircraft.setModel(request.model());
        aircraft.setYear(request.year());
        aircraft.setCategory(request.category());
        aircraft.setTotalAirframeHours(request.totalAirframeHours());
        aircraft.setStatus(request.status());
        aircraft.setEngineCount(request.engineCount());
        aircraft.setMaxPassengers(request.maxPassengers());
        aircraft.setOwner(owner);
        aircraft.setImageUrl(request.imageUrl());

        return toResponse(aircraftRepository.save(aircraft));
    }

    @Transactional
    public void delete(UUID id) {
        aircraftRepository.delete(findOrThrow(id));
    }

    public FleetStatsResponse getFleetStats() {
        List<Aircraft> all = aircraftRepository.findAll();
        List<MaintenanceRecord> records = maintenanceRecordRepository.findAll();

        long overdue = records.stream()
                .filter(r -> r.getStatus() == MaintenanceStatus.OVERDUE).count();

        long dueSoon = records.stream()
                .filter(r -> r.getStatus() == MaintenanceStatus.DUE && r.getNextDueDate() != null
                        && ChronoUnit.DAYS.between(LocalDate.now(), r.getNextDueDate()) <= 30)
                .count();

        return new FleetStatsResponse(
                all.size(),
                (int) all.stream().filter(a -> a.getStatus().name().equals("AIRWORTHY")).count(),
                (int) all.stream().filter(a -> a.getStatus().name().equals("GROUNDED")).count(),
                (int) all.stream().filter(a -> a.getStatus().name().equals("MAINTENANCE")).count(),
                (int) overdue,
                (int) dueSoon,
                all.stream().mapToDouble(Aircraft::getTotalAirframeHours).sum());
    }

    public List<MaintenanceAlertResponse> getMaintenanceAlerts() {
        List<Aircraft> all = aircraftRepository.findAll();
        List<MaintenanceRecord> pending = maintenanceRecordRepository.findByStatusIn(
                List.of(MaintenanceStatus.DUE, MaintenanceStatus.OVERDUE, MaintenanceStatus.IN_PROGRESS));
        LocalDate now = LocalDate.now();

        return pending.stream().map(record -> {
            Aircraft ac = record.getAircraft();
            long daysUntilDue = record.getNextDueDate() != null
                    ? ChronoUnit.DAYS.between(now, record.getNextDueDate())
                    : -999L;
            double hoursUntilDue = record.getNextDueHours() != null
                    ? round1(record.getNextDueHours() - ac.getTotalAirframeHours())
                    : 999.0;

            String urgency;
            if (record.getStatus() == MaintenanceStatus.OVERDUE || daysUntilDue < 0 || hoursUntilDue < 0) {
                urgency = "CRITICAL";
            } else if (daysUntilDue <= 7 || hoursUntilDue <= 5) {
                urgency = "CRITICAL";
            } else if (daysUntilDue <= 30 || hoursUntilDue <= 25) {
                urgency = "WARNING";
            } else {
                urgency = "INFO";
            }

            return new MaintenanceAlertResponse(ac.getId(), ac.getTailNumber(),
                    record.getCheckType(), record.getStatus(), daysUntilDue, hoursUntilDue, urgency);
        }).sorted(Comparator.comparing(a -> switch (a.urgency()) {
            case "CRITICAL" -> 0;
            case "WARNING" -> 1;
            default -> 2;
        })).toList();
    }

    private Aircraft findOrThrow(UUID id) {
        return aircraftRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Aircraft not found: " + id));
    }

    private AircraftResponse toResponse(Aircraft a) {
        return new AircraftResponse(
                a.getId(), a.getTailNumber(), a.getMake(), a.getModel(), a.getYear(),
                a.getCategory(), a.getTotalAirframeHours(), a.getStatus(),
                a.getEngineCount(), a.getMaxPassengers(),
                a.getOwner() != null ? a.getOwner().getId() : null,
                a.getImageUrl(), a.getCreatedAt(), a.getUpdatedAt());
    }

    private double round1(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
