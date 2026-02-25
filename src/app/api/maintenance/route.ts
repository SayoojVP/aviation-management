import { NextResponse } from "next/server";
import { aircraft as aircraftData, maintenanceRecords } from "@/lib/data";
import { MaintenanceService } from "@/lib/services";

// GET /api/maintenance?aircraftId=ac-1  OR  GET /api/maintenance  (all)
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const aircraftId = searchParams.get("aircraftId");

    if (aircraftId) {
        const records = MaintenanceService.getRecordsForAircraft(maintenanceRecords, aircraftId);
        return NextResponse.json({ data: records, total: records.length });
    }

    return NextResponse.json({ data: maintenanceRecords, total: maintenanceRecords.length });
}

// POST /api/maintenance
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newRecord = {
            id: `mr-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...body,
        };
        maintenanceRecords.unshift(newRecord);
        return NextResponse.json({ data: newRecord }, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
}
