package com.pilotlogbook.model;

import com.pilotlogbook.model.enums.FlightRule;
import com.pilotlogbook.model.enums.WeatherCondition;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "flight_log_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlightLogEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pilot_id", nullable = false)
    private User pilot;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "aircraft_id", nullable = false)
    private Aircraft aircraft;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "departure_airport", nullable = false)
    private String departureAirport;

    @Column(name = "arrival_airport", nullable = false)
    private String arrivalAirport;

    @Column(name = "total_flight_time", nullable = false)
    private double totalFlightTime;

    @Column(name = "pic_time", nullable = false)
    private double picTime;

    @Column(name = "sic_time", nullable = false)
    private double sicTime;

    @Column(name = "dual_received_time", nullable = false)
    private double dualReceivedTime;

    @Column(name = "solo_time", nullable = false)
    private double soloTime;

    @Column(name = "night_time", nullable = false)
    private double nightTime;

    @Column(name = "ifr_time", nullable = false)
    private double ifrTime;

    @Column(name = "cross_country_time", nullable = false)
    private double crossCountryTime;

    @Column(name = "day_landings", nullable = false)
    private int dayLandings;

    @Column(name = "night_landings", nullable = false)
    private int nightLandings;

    @Enumerated(EnumType.STRING)
    @Column(name = "weather_condition", nullable = false)
    private WeatherCondition weatherCondition;

    @Enumerated(EnumType.STRING)
    @Column(name = "flight_rule", nullable = false)
    private FlightRule flightRule;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @ElementCollection
    @CollectionTable(name = "flight_approach_types", joinColumns = @JoinColumn(name = "flight_log_entry_id"))
    @Column(name = "approach_type")
    private List<String> approachTypes;

    @Column(name = "simulator_time")
    private Double simulatorTime;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
