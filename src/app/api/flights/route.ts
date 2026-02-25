import { NextResponse } from "next/server";
import { flightLogs, users } from "@/lib/data";
import { FlightLogService } from "@/lib/services";

// GET /api/flights?pilotId=user-1
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const pilotId = searchParams.get("pilotId");

    if (!pilotId) {
        return NextResponse.json({ error: "pilotId is required" }, { status: 400 });
    }

    const pilot = users.find((u) => u.id === pilotId);
    if (!pilot) {
        return NextResponse.json({ error: "Pilot not found" }, { status: 404 });
    }

    const logs = FlightLogService.getLogsForPilot(flightLogs, pilotId);
    return NextResponse.json({ data: logs, total: logs.length });
}

// POST /api/flights
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newEntry = {
            id: `fl-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...body,
        };
        // In production: persist to DB via JPA repository
        flightLogs.unshift(newEntry);
        return NextResponse.json({ data: newEntry }, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
}
