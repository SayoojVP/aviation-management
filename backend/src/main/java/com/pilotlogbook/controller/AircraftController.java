package com.pilotlogbook.controller;

import com.pilotlogbook.dto.*;
import com.pilotlogbook.service.AircraftService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/aircraft")
@RequiredArgsConstructor
public class AircraftController {

    private final AircraftService aircraftService;

    @GetMapping
    public ResponseEntity<List<AircraftResponse>> getAll() {
        return ResponseEntity.ok(aircraftService.getAllAircraft());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AircraftResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(aircraftService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN')")
    public ResponseEntity<AircraftResponse> create(@Valid @RequestBody AircraftRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(aircraftService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN')")
    public ResponseEntity<AircraftResponse> update(@PathVariable UUID id,
            @Valid @RequestBody AircraftRequest request) {
        return ResponseEntity.ok(aircraftService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        aircraftService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/fleet-stats")
    public ResponseEntity<FleetStatsResponse> getFleetStats() {
        return ResponseEntity.ok(aircraftService.getFleetStats());
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<MaintenanceAlertResponse>> getAlerts() {
        return ResponseEntity.ok(aircraftService.getMaintenanceAlerts());
    }
}
