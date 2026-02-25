/**
 * Business Logic Service Layer
 * Mirrors Spring Boot @Service classes — implements core aviation rules,
 * flight hour aggregation, and maintenance scheduling algorithms.
 */

import { differenceInDays, parseISO, isAfter, isBefore, subDays, subMonths, subYears } from "date-fns";
import {
    Aircraft,
    AircraftCategory,
    FleetStats,
    FlightLogEntry,
    MaintenanceAlert,
    MaintenanceCheckType,
    MaintenanceRecord,
    MaintenanceStatus,
    PilotFlightStats,
    UserRole,
} from "./types";

// ─── FlightLogService (mirrors Spring @Service) ───────────────────────────────

export class FlightLogService {
    /**
     * Aggregates all flight hours for a given pilot across multiple criteria.
     * Implements the same logic as a Spring Boot service method with JPA projections.
     */
    static calculatePilotStats(logs: FlightLogEntry[], pilotId: string): PilotFlightStats {
        const pilotLogs = logs.filter((l) => l.pilotId === pilotId);
        const now = new Date();
        const thirtyDaysAgo = subDays(now, 30);
        const ninetyDaysAgo = subDays(now, 90);
        const oneYearAgo = subYears(now, 1);

        const sum = (key: keyof FlightLogEntry) =>
            pilotLogs.reduce((acc, l) => acc + (Number(l[key]) || 0), 0);

        const totalLandings = pilotLogs.reduce(
            (acc, l) => acc + l.dayLandings + l.nightLandings,
            0
        );

        const filterByDate = (after: Date) =>
            pilotLogs
                .filter((l) => isAfter(parseISO(l.date), after))
                .reduce((acc, l) => acc + l.totalFlightTime, 0);

        const byAircraftCategory: Record<string, number> = {};
        for (const log of pilotLogs) {
            const cat = log.aircraftModel || "Unknown";
            byAircraftCategory[cat] = (byAircraftCategory[cat] || 0) + log.totalFlightTime;
        }

        return {
            totalTime: parseFloat(sum("totalFlightTime").toFixed(1)),
            picTime: parseFloat(sum("picTime").toFixed(1)),
            sicTime: parseFloat(sum("sicTime").toFixed(1)),
            nightTime: parseFloat(sum("nightTime").toFixed(1)),
            ifrTime: parseFloat(sum("ifrTime").toFixed(1)),
            crossCountryTime: parseFloat(sum("crossCountryTime").toFixed(1)),
            dualReceived: parseFloat(sum("dualReceivedTime").toFixed(1)),
            soloTime: parseFloat(sum("soloTime").toFixed(1)),
            totalLandings,
            nightLandings: pilotLogs.reduce((acc, l) => acc + l.nightLandings, 0),
            last30Days: parseFloat(filterByDate(thirtyDaysAgo).toFixed(1)),
            last90Days: parseFloat(filterByDate(ninetyDaysAgo).toFixed(1)),
            lastYear: parseFloat(filterByDate(oneYearAgo).toFixed(1)),
            byAircraftCategory,
        };
    }

    /**
     * Returns flight logs for a pilot sorted by date descending.
     */
    static getLogsForPilot(logs: FlightLogEntry[], pilotId: string): FlightLogEntry[] {
        return logs
            .filter((l) => l.pilotId === pilotId)
            .sort((a, b) => b.date.localeCompare(a.date));
    }

    /**
     * Groups logs by month for chart data.
     */
    static getMonthlyFlightData(logs: FlightLogEntry[], pilotId: string) {
        const pilotLogs = logs.filter((l) => l.pilotId === pilotId);
        const monthMap: Record<string, { month: string; totalTime: number; ifrTime: number; nightTime: number }> = {};

        const last6Months = Array.from({ length: 6 }, (_, i) => {
            const d = subMonths(new Date(), 5 - i);
            return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }) };
        });

        for (const { key, label } of last6Months) {
            monthMap[key] = { month: label, totalTime: 0, ifrTime: 0, nightTime: 0 };
        }

        for (const log of pilotLogs) {
            const key = log.date.slice(0, 7);
            if (monthMap[key]) {
                monthMap[key].totalTime += log.totalFlightTime;
                monthMap[key].ifrTime += log.ifrTime;
                monthMap[key].nightTime += log.nightTime;
            }
        }

        return Object.values(monthMap).map((m) => ({
            ...m,
            totalTime: parseFloat(m.totalTime.toFixed(1)),
            ifrTime: parseFloat(m.ifrTime.toFixed(1)),
            nightTime: parseFloat(m.nightTime.toFixed(1)),
        }));
    }

    /**
     * Returns distribution of hours by aircraft category.
     */
    static getHoursByCategory(logs: FlightLogEntry[], pilotId: string) {
        const pilotLogs = logs.filter((l) => l.pilotId === pilotId);
        const catMap: Record<string, number> = {};
        for (const log of pilotLogs) {
            catMap[log.aircraftModel] = (catMap[log.aircraftModel] || 0) + log.totalFlightTime;
        }
        return Object.entries(catMap).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(1)) }));
    }
}

// ─── MaintenanceService (mirrors Spring @Service) ────────────────────────────

export class MaintenanceService {
    private static readonly ALERT_DAYS_WARNING = 30;
    private static readonly ALERT_DAYS_CRITICAL = 7;
    private static readonly ALERT_HOURS_WARNING = 25;
    private static readonly ALERT_HOURS_CRITICAL = 5;

    /**
     * Scheduling algorithm — scans all maintenance records and computes
     * alert statuses based on hours and calendar days remaining.
     */
    static computeAlerts(records: MaintenanceRecord[], aircraft: Aircraft[]): MaintenanceAlert[] {
        const now = new Date();
        const alerts: MaintenanceAlert[] = [];

        const pendingRecords = records.filter(
            (r) => r.status === MaintenanceStatus.DUE ||
                r.status === MaintenanceStatus.OVERDUE ||
                r.status === MaintenanceStatus.IN_PROGRESS
        );

        for (const record of pendingRecords) {
            const ac = aircraft.find((a) => a.id === record.aircraftId);
            if (!ac) continue;

            const daysUntilDue = record.nextDueDate
                ? differenceInDays(parseISO(record.nextDueDate), now)
                : -999;

            const hoursUntilDue = record.nextDueHours != null
                ? parseFloat((record.nextDueHours - ac.totalAirframeHours).toFixed(1))
                : 999;

            let urgency: "CRITICAL" | "WARNING" | "INFO" = "INFO";

            if (record.status === MaintenanceStatus.OVERDUE || daysUntilDue < 0 || hoursUntilDue < 0) {
                urgency = "CRITICAL";
            } else if (
                daysUntilDue <= this.ALERT_DAYS_CRITICAL ||
                hoursUntilDue <= this.ALERT_HOURS_CRITICAL
            ) {
                urgency = "CRITICAL";
            } else if (
                daysUntilDue <= this.ALERT_DAYS_WARNING ||
                hoursUntilDue <= this.ALERT_HOURS_WARNING
            ) {
                urgency = "WARNING";
            }

            alerts.push({
                aircraftId: ac.id,
                tailNumber: ac.tailNumber,
                checkType: record.checkType,
                status: record.status,
                daysUntilDue,
                hoursUntilDue,
                urgency,
            });
        }

        return alerts.sort((a, b) => {
            const order = { CRITICAL: 0, WARNING: 1, INFO: 2 };
            return order[a.urgency] - order[b.urgency];
        });
    }

    /**
     * Computes fleet-wide statistics for the fleet manager dashboard.
     */
    static computeFleetStats(aircraftList: Aircraft[], records: MaintenanceRecord[]): FleetStats {
        const overdueChecks = records.filter(
            (r) => r.status === MaintenanceStatus.OVERDUE
        ).length;

        const now = new Date();
        const dueSoon = records.filter((r) => {
            if (r.status !== MaintenanceStatus.DUE) return false;
            if (!r.nextDueDate) return false;
            return differenceInDays(parseISO(r.nextDueDate), now) <= 30;
        }).length;

        return {
            totalAircraft: aircraftList.length,
            airworthyCount: aircraftList.filter((a) => a.status === "AIRWORTHY").length,
            groundedCount: aircraftList.filter((a) => a.status === "GROUNDED").length,
            maintenanceCount: aircraftList.filter((a) => a.status === "MAINTENANCE").length,
            overdueChecks,
            dueSoonChecks: dueSoon,
            totalFleetHours: parseFloat(
                aircraftList.reduce((acc, a) => acc + a.totalAirframeHours, 0).toFixed(1)
            ),
        };
    }

    /**
     * Returns maintenance records for a specific aircraft.
     */
    static getRecordsForAircraft(records: MaintenanceRecord[], aircraftId: string): MaintenanceRecord[] {
        return records
            .filter((r) => r.aircraftId === aircraftId)
            .sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));
    }
}

// ─── AuthService (role-based access guard) ────────────────────────────────────

export class AuthService {
    static canAccessFleetManager(role: UserRole): boolean {
        return role === UserRole.FLEET_MANAGER || role === UserRole.ADMIN;
    }

    static canAccessPilotDashboard(role: UserRole): boolean {
        return role === UserRole.PILOT || role === UserRole.ADMIN;
    }

    static canLogFlight(role: UserRole): boolean {
        return role === UserRole.PILOT || role === UserRole.ADMIN;
    }
}

// ─── Helper formatters ────────────────────────────────────────────────────────

export function formatHours(h: number): string {
    return `${h.toFixed(1)} hrs`;
}

export function categoryLabel(cat: AircraftCategory): string {
    const labels: Record<string, string> = {
        SINGLE_ENGINE_LAND: "Single Engine Land",
        MULTI_ENGINE_LAND: "Multi Engine Land",
        SINGLE_ENGINE_SEA: "Single Engine Sea",
        MULTI_ENGINE_SEA: "Multi Engine Sea",
        HELICOPTER: "Helicopter",
        GLIDER: "Glider",
        TURBOPROP: "Turboprop",
        JET: "Jet",
    };
    return labels[cat] ?? cat;
}

export function checkTypeLabel(c: MaintenanceCheckType): string {
    const labels: Record<string, string> = {
        ANNUAL: "Annual Inspection",
        HUNDRED_HOUR: "100-Hour Inspection",
        FIFTY_HOUR: "50-Hour Inspection",
        PHASE: "Phase Check",
        UNSCHEDULED: "Unscheduled",
        AD_COMPLIANCE: "AD Compliance",
    };
    return labels[c] ?? c;
}
