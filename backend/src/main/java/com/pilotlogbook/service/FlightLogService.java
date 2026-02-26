package com.pilotlogbook.service;

import com.pilotlogbook.dto.FlightLogRequest;
import com.pilotlogbook.dto.FlightLogResponse;
import com.pilotlogbook.dto.PilotStatsResponse;
import com.pilotlogbook.model.Aircraft;
import com.pilotlogbook.model.FlightLogEntry;
import com.pilotlogbook.model.User;
import com.pilotlogbook.repository.AircraftRepository;
import com.pilotlogbook.repository.FlightLogEntryRepository;
import com.pilotlogbook.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class FlightLogService {

    private final FlightLogEntryRepository flightLogRepository;
    private final UserRepository userRepository;
    private final AircraftRepository aircraftRepository;

    public List<FlightLogResponse> getLogsForPilot(UUID pilotId) {
        return flightLogRepository.findByPilotIdOrderByDateDesc(pilotId)
                .stream().map(this::toResponse).toList();
    }

    public List<FlightLogResponse> getAllLogs() {
        return flightLogRepository.findAll(
                org.springframework.data.domain.Sort.by(
                        org.springframework.data.domain.Sort.Direction.DESC, "date"))
                .stream().map(this::toResponse).toList();
    }

    public FlightLogResponse getById(UUID id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public FlightLogResponse create(UUID pilotId, FlightLogRequest request) {
        User pilot = userRepository.findById(pilotId)
                .orElseThrow(() -> new IllegalArgumentException("Pilot not found: " + pilotId));
        Aircraft aircraft = aircraftRepository.findById(request.aircraftId())
                .orElseThrow(() -> new IllegalArgumentException("Aircraft not found: " + request.aircraftId()));

        FlightLogEntry entry = FlightLogEntry.builder()
                .pilot(pilot)
                .aircraft(aircraft)
                .date(request.date())
                .departureAirport(request.departureAirport())
                .arrivalAirport(request.arrivalAirport())
                .totalFlightTime(request.totalFlightTime())
                .picTime(request.picTime())
                .sicTime(request.sicTime())
                .dualReceivedTime(request.dualReceivedTime())
                .soloTime(request.soloTime())
                .nightTime(request.nightTime())
                .ifrTime(request.ifrTime())
                .crossCountryTime(request.crossCountryTime())
                .dayLandings(request.dayLandings())
                .nightLandings(request.nightLandings())
                .weatherCondition(request.weatherCondition())
                .flightRule(request.flightRule())
                .remarks(request.remarks())
                .approachTypes(request.approachTypes())
                .simulatorTime(request.simulatorTime())
                .build();

        return toResponse(flightLogRepository.save(entry));
    }

    @Transactional
    public FlightLogResponse update(UUID id, FlightLogRequest request) {
        FlightLogEntry entry = findOrThrow(id);
        Aircraft aircraft = aircraftRepository.findById(request.aircraftId())
                .orElseThrow(() -> new IllegalArgumentException("Aircraft not found: " + request.aircraftId()));

        entry.setAircraft(aircraft);
        entry.setDate(request.date());
        entry.setDepartureAirport(request.departureAirport());
        entry.setArrivalAirport(request.arrivalAirport());
        entry.setTotalFlightTime(request.totalFlightTime());
        entry.setPicTime(request.picTime());
        entry.setSicTime(request.sicTime());
        entry.setDualReceivedTime(request.dualReceivedTime());
        entry.setSoloTime(request.soloTime());
        entry.setNightTime(request.nightTime());
        entry.setIfrTime(request.ifrTime());
        entry.setCrossCountryTime(request.crossCountryTime());
        entry.setDayLandings(request.dayLandings());
        entry.setNightLandings(request.nightLandings());
        entry.setWeatherCondition(request.weatherCondition());
        entry.setFlightRule(request.flightRule());
        entry.setRemarks(request.remarks());
        entry.setApproachTypes(request.approachTypes());
        entry.setSimulatorTime(request.simulatorTime());

        return toResponse(flightLogRepository.save(entry));
    }

    @Transactional
    public void delete(UUID id) {
        flightLogRepository.delete(findOrThrow(id));
    }

    /**
     * Mirror of the frontend FlightLogService.calculatePilotStats().
     * Aggregates all flight-hour metrics for a given pilot.
     */
    public PilotStatsResponse getPilotStats(UUID pilotId) {
        List<FlightLogEntry> logs = flightLogRepository.findByPilotIdOrderByDateDesc(pilotId);
        LocalDate now = LocalDate.now();
        LocalDate d30 = now.minusDays(30);
        LocalDate d90 = now.minusDays(90);
        LocalDate d365 = now.minusDays(365);

        Map<String, Double> byCategory = new LinkedHashMap<>();
        for (FlightLogEntry l : logs) {
            String key = l.getAircraft().getModel();
            byCategory.merge(key, l.getTotalFlightTime(), Double::sum);
        }
        byCategory.replaceAll((k, v) -> round1(v));

        return new PilotStatsResponse(
                round1(sum(logs, "totalFlightTime")),
                round1(sum(logs, "picTime")),
                round1(sum(logs, "sicTime")),
                round1(sum(logs, "nightTime")),
                round1(sum(logs, "ifrTime")),
                round1(sum(logs, "crossCountryTime")),
                round1(sum(logs, "dualReceivedTime")),
                round1(sum(logs, "soloTime")),
                logs.stream().mapToInt(l -> l.getDayLandings() + l.getNightLandings()).sum(),
                logs.stream().mapToInt(FlightLogEntry::getNightLandings).sum(),
                round1(filterAndSum(logs, d30)),
                round1(filterAndSum(logs, d90)),
                round1(filterAndSum(logs, d365)),
                byCategory);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private double sum(List<FlightLogEntry> logs, String field) {
        return logs.stream().mapToDouble(l -> switch (field) {
            case "totalFlightTime" -> l.getTotalFlightTime();
            case "picTime" -> l.getPicTime();
            case "sicTime" -> l.getSicTime();
            case "nightTime" -> l.getNightTime();
            case "ifrTime" -> l.getIfrTime();
            case "crossCountryTime" -> l.getCrossCountryTime();
            case "dualReceivedTime" -> l.getDualReceivedTime();
            case "soloTime" -> l.getSoloTime();
            default -> 0;
        }).sum();
    }

    private double filterAndSum(List<FlightLogEntry> logs, LocalDate from) {
        return logs.stream()
                .filter(l -> !l.getDate().isBefore(from))
                .mapToDouble(FlightLogEntry::getTotalFlightTime)
                .sum();
    }

    private double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }

    private FlightLogEntry findOrThrow(UUID id) {
        return flightLogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Flight log not found: " + id));
    }

    private FlightLogResponse toResponse(FlightLogEntry e) {
        return new FlightLogResponse(
                e.getId(),
                e.getPilot().getId(), e.getPilot().getName(),
                e.getAircraft().getId(), e.getAircraft().getTailNumber(), e.getAircraft().getModel(),
                e.getDate(), e.getDepartureAirport(), e.getArrivalAirport(),
                e.getTotalFlightTime(), e.getPicTime(), e.getSicTime(),
                e.getDualReceivedTime(), e.getSoloTime(), e.getNightTime(),
                e.getIfrTime(), e.getCrossCountryTime(),
                e.getDayLandings(), e.getNightLandings(),
                e.getWeatherCondition(), e.getFlightRule(),
                e.getRemarks(), e.getApproachTypes(), e.getSimulatorTime(),
                e.getCreatedAt(), e.getUpdatedAt());
    }
}
