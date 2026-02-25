"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import { PilotFlightStats, FlightLogEntry, WeatherCondition, FlightRule, UserRole } from "@/lib/types";
import {
    Plane,
    Clock,
    Award,
    Moon,
    Cloud,
    Map,
    PlaneLanding,
    Calendar,
    CalendarDays,
    TrendingUp,
    PieChart as PieIcon,
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

const PILOT_ID = "user-1";
const COLORS = ["#3b82f6", "#14b8a6", "#a855f7", "#f59e0b", "#22c55e"];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div
            style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                padding: "10px 14px",
                fontSize: "0.8125rem",
            }}
        >
            <p style={{ color: "var(--text-muted)", marginBottom: 4 }}>{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} style={{ color: p.color, fontWeight: 600 }}>
                    {p.name}: {p.value} hrs
                </p>
            ))}
        </div>
    );
};

function PilotDashboardContent() {
    const [stats, setStats] = useState<PilotFlightStats | null>(null);
    const [monthly, setMonthly] = useState<any[]>([]);
    const [byCategory, setByCategory] = useState<any[]>([]);
    const [recentLogs, setRecentLogs] = useState<FlightLogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const [statsRes, logsRes] = await Promise.all([
                fetch(`/api/flights/stats?pilotId=${PILOT_ID}`),
                fetch(`/api/flights?pilotId=${PILOT_ID}`),
            ]);
            const statsData = await statsRes.json();
            const logsData = await logsRes.json();
            setStats(statsData.stats);
            setMonthly(statsData.monthly);
            setByCategory(statsData.byCategory);
            setRecentLogs(logsData.data.slice(0, 5));
            setLoading(false);
        }
        load();
    }, []);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="empty-state">
                    <Plane size={40} color="var(--text-muted)" strokeWidth={1.5} />
                    <p style={{ marginTop: 12 }}>Loading your logbook...</p>
                </div>
            </DashboardLayout>
        );
    }

    const statCards = [
        { label: "Total Flight Time", value: `${stats?.totalTime}`, unit: "hrs", Icon: Clock, color: "var(--accent-blue-dim)", iconColor: "var(--accent-blue-light)" },
        { label: "PIC Time", value: `${stats?.picTime}`, unit: "hrs", Icon: Award, color: "var(--accent-teal-dim)", iconColor: "var(--accent-teal)" },
        { label: "Night Hours", value: `${stats?.nightTime}`, unit: "hrs", Icon: Moon, color: "var(--accent-purple-dim)", iconColor: "var(--accent-purple)" },
        { label: "IFR Hours", value: `${stats?.ifrTime}`, unit: "hrs", Icon: Cloud, color: "var(--accent-amber-dim)", iconColor: "var(--accent-amber)" },
        { label: "Cross Country", value: `${stats?.crossCountryTime}`, unit: "hrs", Icon: Map, color: "var(--accent-green-dim)", iconColor: "var(--accent-green)" },
        { label: "Total Landings", value: `${stats?.totalLandings}`, unit: "", Icon: PlaneLanding, color: "var(--accent-red-dim)", iconColor: "var(--accent-red)" },
        { label: "Last 30 Days", value: `${stats?.last30Days}`, unit: "hrs", Icon: Calendar, color: "var(--accent-blue-dim)", iconColor: "var(--accent-blue-light)" },
        { label: "Last 90 Days", value: `${stats?.last90Days}`, unit: "hrs", Icon: CalendarDays, color: "var(--accent-teal-dim)", iconColor: "var(--accent-teal)" },
    ];

    return (
        <DashboardLayout>
            <div className="page-header">
                <h1 className="page-title">Pilot Dashboard</h1>
                <p className="page-subtitle">
                    Captain James Hartwell · FAA Cert #2847361 · Medical Class 1 expires Sep 2026
                </p>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid-4 mb-24">
                {statCards.map(({ label, value, unit, Icon, color, iconColor }) => (
                    <div className="stat-card" key={label}>
                        <div className="stat-icon" style={{ background: color }}>
                            <Icon size={16} color={iconColor} strokeWidth={1.75} />
                        </div>
                        <div className="stat-label">{label}</div>
                        <div className="stat-value">
                            {value}
                            {unit && (
                                <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-secondary)", marginLeft: 4 }}>
                                    {unit}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Charts ── */}
            <div className="grid-chart mb-24">
                {/* Monthly Trend */}
                <div className="card">
                    <div className="section-header" style={{ marginBottom: 16 }}>
                        <div>
                            <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <TrendingUp size={16} color="var(--accent-blue-light)" strokeWidth={1.75} />
                                Flight Hours Trend
                            </div>
                            <div className="section-subtitle">Last 6 months</div>
                        </div>
                    </div>
                    <div className="chart-wrapper" style={{ height: 220 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="totalTime" name="Total" stroke="#3b82f6" fill="url(#blueGrad)" strokeWidth={2} dot={false} />
                                <Area type="monotone" dataKey="ifrTime" name="IFR" stroke="#14b8a6" fill="url(#tealGrad)" strokeWidth={2} dot={false} />
                                <Area type="monotone" dataKey="nightTime" name="Night" stroke="#a855f7" fill="url(#purpleGrad)" strokeWidth={2} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex gap-16 mt-8" style={{ flexWrap: "wrap" }}>
                        {[["Total", "#3b82f6"], ["IFR", "#14b8a6"], ["Night", "#a855f7"]].map(([l, c]) => (
                            <div key={l} className="flex items-center gap-4">
                                <div style={{ width: 10, height: 10, borderRadius: 2, background: c, flexShrink: 0 }} />
                                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{l}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hours by Aircraft */}
                <div className="card">
                    <div className="section-header" style={{ marginBottom: 8 }}>
                        <div>
                            <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <PieIcon size={16} color="var(--accent-purple)" strokeWidth={1.75} />
                                Hours by Aircraft
                            </div>
                            <div className="section-subtitle">All time</div>
                        </div>
                    </div>
                    <div className="chart-wrapper" style={{ height: 220 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={byCategory}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {byCategory.map((_: any, index: number) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(val: any) => [`${val} hrs`, ""]}
                                    contentStyle={{
                                        background: "var(--bg-card)",
                                        border: "1px solid var(--border-default)",
                                        borderRadius: "var(--radius-md)",
                                        fontSize: "0.8125rem",
                                    }}
                                />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "0.75rem", color: "var(--text-secondary)" }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ── Recent Flights Table ── */}
            <div className="card">
                <div className="section-header">
                    <div>
                        <div className="section-title">Recent Flights</div>
                        <div className="section-subtitle">Last 5 entries</div>
                    </div>
                    <a href="/dashboard/logbook" className="btn btn-secondary btn-sm">
                        View All
                    </a>
                </div>
                <div className="data-table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Route</th>
                                <th>Aircraft</th>
                                <th>Total</th>
                                <th>Night</th>
                                <th>IFR</th>
                                <th>Ldgs</th>
                                <th>Conditions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentLogs.map((log) => (
                                <tr key={log.id}>
                                    <td className="cell-primary" style={{ fontWeight: 500 }}>
                                        {new Date(log.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </td>
                                    <td>
                                        <span className="cell-mono" style={{ color: "var(--text-primary)" }}>
                                            {log.departureAirport} → {log.arrivalAirport}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: "0.8125rem" }}>{log.aircraftModel}</div>
                                        <div className="cell-mono" style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                            {log.aircraftTailNumber}
                                        </div>
                                    </td>
                                    <td className="cell-primary fw-600">{log.totalFlightTime.toFixed(1)}</td>
                                    <td>{log.nightTime > 0 ? log.nightTime.toFixed(1) : "—"}</td>
                                    <td>{log.ifrTime > 0 ? log.ifrTime.toFixed(1) : "—"}</td>
                                    <td>{log.dayLandings + log.nightLandings}</td>
                                    <td>
                                        <span className={`badge ${log.weatherCondition === WeatherCondition.IMC ? "badge-amber" : "badge-teal"}`}>
                                            {log.weatherCondition}
                                        </span>
                                        {" "}
                                        <span className={`badge ${log.flightRule === FlightRule.IFR ? "badge-purple" : "badge-blue"}`}>
                                            {log.flightRule}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default function PilotDashboardPage() {
    return (
        <RoleGuard required={UserRole.PILOT}>
            <PilotDashboardContent />
        </RoleGuard>
    );
}
