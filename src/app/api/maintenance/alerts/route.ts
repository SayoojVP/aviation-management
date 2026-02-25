import { NextResponse } from "next/server";
import { aircraft as aircraftData, maintenanceRecords } from "@/lib/data";
import { MaintenanceService } from "@/lib/services";

// GET /api/maintenance/alerts
export async function GET() {
    const alerts = MaintenanceService.computeAlerts(maintenanceRecords, aircraftData);
    const fleetStats = MaintenanceService.computeFleetStats(aircraftData, maintenanceRecords);
    return NextResponse.json({ alerts, fleetStats });
}
