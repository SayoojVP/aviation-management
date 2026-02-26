package com.pilotlogbook.service;

import com.pilotlogbook.dto.MaintenanceRequest;
import com.pilotlogbook.dto.MaintenanceResponse;
import com.pilotlogbook.model.Aircraft;
import com.pilotlogbook.model.MaintenanceRecord;
import com.pilotlogbook.repository.AircraftRepository;
import com.pilotlogbook.repository.MaintenanceRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final AircraftRepository aircraftRepository;

    public List<MaintenanceResponse> getAll() {
        return maintenanceRecordRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<MaintenanceResponse> getForAircraft(UUID aircraftId) {
        return maintenanceRecordRepository.findByAircraftIdOrderByScheduledDateDesc(aircraftId)
                .stream().map(this::toResponse).toList();
    }

    public MaintenanceResponse getById(UUID id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public MaintenanceResponse create(MaintenanceRequest request) {
        Aircraft aircraft = aircraftRepository.findById(request.aircraftId())
                .orElseThrow(() -> new IllegalArgumentException("Aircraft not found: " + request.aircraftId()));

        MaintenanceRecord record = MaintenanceRecord.builder()
                .aircraft(aircraft)
                .checkType(request.checkType())
                .status(request.status())
                .scheduledDate(request.scheduledDate())
                .completedDate(request.completedDate())
                .hoursAtCheck(request.hoursAtCheck())
                .nextDueHours(request.nextDueHours())
                .nextDueDate(request.nextDueDate())
                .technician(request.technician())
                .squawks(request.squawks())
                .cost(request.cost())
                .notes(request.notes())
                .build();

        return toResponse(maintenanceRecordRepository.save(record));
    }

    @Transactional
    public MaintenanceResponse update(UUID id, MaintenanceRequest request) {
        MaintenanceRecord record = findOrThrow(id);
        Aircraft aircraft = aircraftRepository.findById(request.aircraftId())
                .orElseThrow(() -> new IllegalArgumentException("Aircraft not found: " + request.aircraftId()));

        record.setAircraft(aircraft);
        record.setCheckType(request.checkType());
        record.setStatus(request.status());
        record.setScheduledDate(request.scheduledDate());
        record.setCompletedDate(request.completedDate());
        record.setHoursAtCheck(request.hoursAtCheck());
        record.setNextDueHours(request.nextDueHours());
        record.setNextDueDate(request.nextDueDate());
        record.setTechnician(request.technician());
        record.setSquawks(request.squawks());
        record.setCost(request.cost());
        record.setNotes(request.notes());

        return toResponse(maintenanceRecordRepository.save(record));
    }

    @Transactional
    public void delete(UUID id) {
        maintenanceRecordRepository.delete(findOrThrow(id));
    }

    private MaintenanceRecord findOrThrow(UUID id) {
        return maintenanceRecordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Maintenance record not found: " + id));
    }

    private MaintenanceResponse toResponse(MaintenanceRecord r) {
        return new MaintenanceResponse(
                r.getId(),
                r.getAircraft().getId(), r.getAircraft().getTailNumber(),
                r.getCheckType(), r.getStatus(),
                r.getScheduledDate(), r.getCompletedDate(),
                r.getHoursAtCheck(), r.getNextDueHours(), r.getNextDueDate(),
                r.getTechnician(), r.getSquawks(), r.getCost(), r.getNotes(),
                r.getCreatedAt(), r.getUpdatedAt());
    }
}
