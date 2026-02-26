package com.pilotlogbook.controller;

import com.pilotlogbook.dto.FlightLogRequest;
import com.pilotlogbook.dto.FlightLogResponse;
import com.pilotlogbook.dto.PilotStatsResponse;
import com.pilotlogbook.service.FlightLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/flights")
@RequiredArgsConstructor
public class FlightLogController {

    private final FlightLogService flightLogService;

    /** Fleet managers / admins can see all logs */
    @GetMapping
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN')")
    public ResponseEntity<List<FlightLogResponse>> getAll() {
        return ResponseEntity.ok(flightLogService.getAllLogs());
    }

    /** Pilots see their own logs */
    @GetMapping("/pilot/{pilotId}")
    public ResponseEntity<List<FlightLogResponse>> getForPilot(@PathVariable UUID pilotId) {
        return ResponseEntity.ok(flightLogService.getLogsForPilot(pilotId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlightLogResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(flightLogService.getById(id));
    }

    /** Log a new flight — pilotId comes from the path so it's explicit */
    @PostMapping("/pilot/{pilotId}")
    @PreAuthorize("hasAnyRole('PILOT', 'ADMIN')")
    public ResponseEntity<FlightLogResponse> create(@PathVariable UUID pilotId,
            @Valid @RequestBody FlightLogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(flightLogService.create(pilotId, request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PILOT', 'ADMIN')")
    public ResponseEntity<FlightLogResponse> update(@PathVariable UUID id,
            @Valid @RequestBody FlightLogRequest request) {
        return ResponseEntity.ok(flightLogService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PILOT', 'ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        flightLogService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/pilot/{pilotId}/stats")
    public ResponseEntity<PilotStatsResponse> getPilotStats(@PathVariable UUID pilotId) {
        return ResponseEntity.ok(flightLogService.getPilotStats(pilotId));
    }
}
