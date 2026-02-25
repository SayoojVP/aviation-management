import { NextResponse } from "next/server";
import { aircraft as aircraftData } from "@/lib/data";

// GET /api/aircraft
export async function GET() {
    return NextResponse.json({ data: aircraftData, total: aircraftData.length });
}
