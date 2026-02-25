"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import { FlightLogEntry, WeatherCondition, FlightRule, UserRole } from "@/lib/types";
import { Search, PlusCircle, SlidersHorizontal } from "lucide-react";

const PILOT_ID = "user-1";
const filterOptions = ["All", "VFR", "IFR", "VMC", "IMC"];

function LogbookContent() {
    const [logs, setLogs] = useState<FlightLogEntry[]>([]);
    const [filtered, setFiltered] = useState<FlightLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All");
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch(`/api/flights?pilotId=${PILOT_ID}`)
            .then((r) => r.json())
            .then((d) => {
                setLogs(d.data);
                setFiltered(d.data);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        let result = [...logs];
        if (activeFilter !== "All") {
            result = result.filter(
                (l) => l.flightRule === activeFilter || l.weatherCondition === activeFilter
            );
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (l) =>
                    l.departureAirport.toLowerCase().includes(q) ||
                    l.arrivalAirport.toLowerCase().includes(q) ||
                    l.aircraftModel.toLowerCase().includes(q) ||
                    l.aircraftTailNumber.toLowerCase().includes(q) ||
                    (l.remarks?.toLowerCase().includes(q) ?? false)
            );
        }
        setFiltered(result);
    }, [activeFilter, search, logs]);

    const totalHours = filtered.reduce((a, l) => a + l.totalFlightTime, 0);

    return (
        <DashboardLayout>
            <div className="page-header">
                <h1 className="page-title">Flight Logbook</h1>
                <p className="page-subtitle">
                    Complete record of all logged flights · {logs.length} total entries
                </p>
            </div>

            {/* ── Controls ── */}
            <div className="flex items-center justify-between mb-16" style={{ flexWrap: "wrap", gap: "12px" }}>
                <div className="flex items-center gap-8" style={{ flexWrap: "wrap" }}>
                    <SlidersHorizontal size={14} color="var(--text-muted)" strokeWidth={1.75} />
                    {filterOptions.map((f) => (
                        <button
                            key={f}
                            className={`tab-btn ${activeFilter === f ? "active" : ""}`}
                            onClick={() => setActiveFilter(f)}
                            style={{
                                borderBottom: "none",
                                padding: "6px 14px",
                                borderRadius: "var(--radius-sm)",
                                border: "1px solid",
                                borderColor: activeFilter === f ? "var(--accent-blue)" : "var(--border-subtle)",
                                background: activeFilter === f ? "var(--accent-blue-dim)" : "transparent",
                                fontSize: "0.8125rem",
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-12">
                    <div style={{ position: "relative" }}>
                        <Search
                            size={14}
                            color="var(--text-muted)"
                            strokeWidth={1.75}
                            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                        />
                        <input
                            className="form-input"
                            style={{ width: 220, paddingLeft: 32 }}
                            placeholder="Search routes, aircraft..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            id="logbook-search"
                        />
                    </div>
                    <a href="/dashboard/log-flight" className="btn btn-primary btn-sm" style={{ gap: 6 }}>
                        <PlusCircle size={14} strokeWidth={2} />
                        Log Flight
                    </a>
                </div>
            </div>

            {/* ── Summary strip ── */}
            <div
                className="flex gap-24 mb-16"
                style={{
                    padding: "12px 20px",
                    background: "var(--bg-card)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                    flexWrap: "wrap",
                }}
            >
                {[
                    ["Showing", `${filtered.length} flights`],
                    ["Total Hours", `${totalHours.toFixed(1)} hrs`],
                    ["PIC Hours", `${filtered.reduce((a, l) => a + l.picTime, 0).toFixed(1)} hrs`],
                    ["Night Hours", `${filtered.reduce((a, l) => a + l.nightTime, 0).toFixed(1)} hrs`],
                    ["IFR Hours", `${filtered.reduce((a, l) => a + l.ifrTime, 0).toFixed(1)} hrs`],
                    ["Landings", `${filtered.reduce((a, l) => a + l.dayLandings + l.nightLandings, 0)}`],
                ].map(([label, val]) => (
                    <div key={label}>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            {label}
                        </div>
                        <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)", marginTop: 2 }}>
                            {val}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Table ── */}
            {loading ? (
                <div className="empty-state"><p>Loading logs...</p></div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <Search size={40} color="var(--text-muted)" strokeWidth={1.5} />
                    <p style={{ marginTop: 12 }}>No flight entries match your filter.</p>
                </div>
            ) : (
                <div className="data-table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>From → To</th>
                                <th>Aircraft</th>
                                <th>Total</th>
                                <th>PIC</th>
                                <th>Night</th>
                                <th>IFR</th>
                                <th>X-Country</th>
                                <th>Day Ldg</th>
                                <th>Night Ldg</th>
                                <th>Conditions</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((log) => (
                                <tr key={log.id}>
                                    <td className="cell-primary" style={{ fontWeight: 500, whiteSpace: "nowrap" }}>
                                        {new Date(log.date).toLocaleDateString("en-US", {
                                            month: "short", day: "numeric", year: "numeric",
                                        })}
                                    </td>
                                    <td>
                                        <span className="cell-mono" style={{ color: "var(--text-primary)", letterSpacing: "0.04em" }}>
                                            {log.departureAirport} → {log.arrivalAirport}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: "0.8125rem", color: "var(--text-primary)", fontWeight: 500 }}>
                                            {log.aircraftModel}
                                        </div>
                                        <div className="cell-mono" style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                            {log.aircraftTailNumber}
                                        </div>
                                    </td>
                                    <td className="cell-primary fw-600">{log.totalFlightTime.toFixed(1)}</td>
                                    <td style={{ color: "var(--accent-blue-light)" }}>{log.picTime.toFixed(1)}</td>
                                    <td>{log.nightTime > 0 ? log.nightTime.toFixed(1) : "—"}</td>
                                    <td>{log.ifrTime > 0 ? log.ifrTime.toFixed(1) : "—"}</td>
                                    <td>{log.crossCountryTime > 0 ? log.crossCountryTime.toFixed(1) : "—"}</td>
                                    <td>{log.dayLandings || "—"}</td>
                                    <td>{log.nightLandings || "—"}</td>
                                    <td>
                                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                            <span className={`badge ${log.weatherCondition === WeatherCondition.IMC ? "badge-amber" : "badge-teal"}`}>
                                                {log.weatherCondition}
                                            </span>
                                            <span className={`badge ${log.flightRule === FlightRule.IFR ? "badge-purple" : "badge-blue"}`}>
                                                {log.flightRule}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", color: "var(--text-muted)", fontSize: "0.8125rem" }}>
                                        {log.remarks || "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </DashboardLayout>
    );
}

export default function LogbookPage() {
    return (
        <RoleGuard required={UserRole.PILOT}>
            <LogbookContent />
        </RoleGuard>
    );
}
