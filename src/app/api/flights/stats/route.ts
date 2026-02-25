import { NextResponse } from "next/server";
import { flightLogs } from "@/lib/data";
import { FlightLogService } from "@/lib/services";

// GET /api/flights/stats?pilotId=user-1
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const pilotId = searchParams.get("pilotId");

    if (!pilotId) {
        return NextResponse.json({ error: "pilotId is required" }, { status: 400 });
    }

    const stats = FlightLogService.calculatePilotStats(flightLogs, pilotId);
    const monthly = FlightLogService.getMonthlyFlightData(flightLogs, pilotId);
    const byCategory = FlightLogService.getHoursByCategory(flightLogs, pilotId);

    return NextResponse.json({ stats, monthly, byCategory });
}
