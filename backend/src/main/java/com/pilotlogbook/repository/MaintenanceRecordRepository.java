package com.pilotlogbook.repository;

import com.pilotlogbook.model.MaintenanceRecord;
import com.pilotlogbook.model.enums.MaintenanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecord, UUID> {
    List<MaintenanceRecord> findByAircraftIdOrderByScheduledDateDesc(UUID aircraftId);

    List<MaintenanceRecord> findByStatus(MaintenanceStatus status);

    List<MaintenanceRecord> findByStatusIn(List<MaintenanceStatus> statuses);
}
