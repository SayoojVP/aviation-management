"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import { Aircraft, AircraftStatus, FleetStats, MaintenanceAlert, UserRole } from "@/lib/types";
import { categoryLabel } from "@/lib/services";
import {
    Plane,
    CheckCircle,
    Wrench,
    XCircle,
    AlertTriangle,
    AlertOctagon,
    Info,
    Clock,
    BarChart3,
    ChevronRight,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

function AircraftStatusBadge({ status }: { status: AircraftStatus }) {
    if (status === AircraftStatus.AIRWORTHY)
        return (
            <span className="badge badge-green" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <CheckCircle size={10} strokeWidth={2.5} /> Airworthy
            </span>
        );
    if (status === AircraftStatus.GROUNDED)
        return (
            <span className="badge badge-red" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <XCircle size={10} strokeWidth={2.5} /> Grounded
            </span>
        );
    return (
        <span className="badge badge-amber" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Wrench size={10} strokeWidth={2.5} /> Maintenance
        </span>
    );
}

function FleetOverviewContent() {
    const [aircraft, setAircraft] = useState<Aircraft[]>([]);
    const [fleetStats, setFleetStats] = useState<FleetStats | null>(null);
    const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch("/api/aircraft").then((r) => r.json()),
            fetch("/api/maintenance/alerts").then((r) => r.json()),
        ]).then(([acData, alertData]) => {
            setAircraft(acData.data);
            setFleetStats(alertData.fleetStats);
            setAlerts(alertData.alerts.slice(0, 4));
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="empty-state">
                    <Plane size={40} color="var(--text-muted)" strokeWidth={1.5} />
                    <p style={{ marginTop: 12 }}>Loading fleet data...</p>
                </div>
            </DashboardLayout>
        );
    }

    const chartData = aircraft.map((ac) => ({
        name: ac.tailNumber,
        hours: ac.totalAirframeHours,
        fill:
            ac.status === AircraftStatus.AIRWORTHY
                ? "#3b82f6"
                : ac.status === AircraftStatus.GROUNDED
                    ? "#ef4444"
                    : "#f59e0b",
    }));

    const statCards = [
        { label: "Total Aircraft", value: `${fleetStats?.totalAircraft}`, Icon: Plane, color: "var(--accent-blue-dim)", iconColor: "var(--accent-blue-light)" },
        { label: "Airworthy", value: `${fleetStats?.airworthyCount}`, Icon: CheckCircle, color: "var(--accent-green-dim)", iconColor: "var(--accent-green)" },
        { label: "In Maintenance", value: `${fleetStats?.maintenanceCount}`, Icon: Wrench, color: "var(--accent-amber-dim)", iconColor: "var(--accent-amber)" },
        { label: "Grounded", value: `${fleetStats?.groundedCount}`, Icon: XCircle, color: "var(--accent-red-dim)", iconColor: "var(--accent-red)" },
        { label: "Overdue Checks", value: `${fleetStats?.overdueChecks}`, Icon: AlertOctagon, color: "var(--accent-red-dim)", iconColor: "var(--accent-red)" },
        { label: "Due in 30 Days", value: `${fleetStats?.dueSoonChecks}`, Icon: AlertTriangle, color: "var(--accent-amber-dim)", iconColor: "var(--accent-amber)" },
        { label: "Total Fleet Hours", value: `${fleetStats?.totalFleetHours?.toLocaleString()}`, unit: "hrs", Icon: Clock, color: "var(--accent-teal-dim)", iconColor: "var(--accent-teal)" },
    ];

    const alertIcon = (urgency: string) => {
        if (urgency === "CRITICAL") return <AlertOctagon size={14} color="var(--accent-red)" strokeWidth={1.75} />;
        if (urgency === "WARNING") return <AlertTriangle size={14} color="var(--accent-amber)" strokeWidth={1.75} />;
        return <Info size={14} color="var(--accent-blue-light)" strokeWidth={1.75} />;
    };

    return (
        <DashboardLayout>
            <div className="page-header">
                <h1 className="page-title">Fleet Overview</h1>
                <p className="page-subtitle">
                    Fleet Manager Dashboard · {aircraft.length} aircraft registered
                </p>
            </div>

            {/* ── Stats ── */}
            <div className="grid-4 mb-24">
                {statCards.map(({ label, value, unit, Icon, color, iconColor }: any) => (
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

            <div className="grid-chart mb-24">
                {/* Aircraft Cards */}
                <div>
                    <div className="section-header">
                        <div>
                            <div className="section-title">Registered Aircraft</div>
                            <div className="section-subtitle">Click an aircraft to view maintenance history</div>
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {aircraft.map((ac) => (
                            <a
                                key={ac.id}
                                href={`/dashboard/maintenance?aircraft=${ac.id}`}
                                style={{ textDecoration: "none" }}
                            >
                                <div className="aircraft-card">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="tail-number">{ac.tailNumber}</div>
                                        <AircraftStatusBadge status={ac.status} />
                                    </div>
                                    <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
                                        {ac.make} {ac.model}
                                    </div>
                                    <div className="flex gap-16" style={{ flexWrap: "wrap" }}>
                                        <div>
                                            <div className="fs-xs text-muted">Category</div>
                                            <div className="fs-sm text-secondary">{categoryLabel(ac.category)}</div>
                                        </div>
                                        <div>
                                            <div className="fs-xs text-muted">Airframe Hours</div>
                                            <div className="fs-sm fw-600 text-primary">{ac.totalAirframeHours.toLocaleString()} hrs</div>
                                        </div>
                                        <div>
                                            <div className="fs-xs text-muted">Year</div>
                                            <div className="fs-sm text-secondary">{ac.year}</div>
                                        </div>
                                        <div>
                                            <div className="fs-xs text-muted">Engines</div>
                                            <div className="fs-sm text-secondary">{ac.engineCount}</div>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Right column */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Bar chart */}
                    <div className="card">
                        <div className="section-title mb-12" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <BarChart3 size={16} color="var(--accent-blue-light)" strokeWidth={1.75} />
                            Airframe Hours by Aircraft
                        </div>
                        <div style={{ height: 220 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        formatter={(val: any) => [`${val} hrs`]}
                                        contentStyle={{
                                            background: "var(--bg-card)",
                                            border: "1px solid var(--border-default)",
                                            borderRadius: "var(--radius-md)",
                                            fontSize: "0.8125rem",
                                        }}
                                    />
                                    <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                                        {chartData.map((entry, i) => (
                                            <Cell key={i} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex gap-12 mt-8">
                            {[["Airworthy", "#3b82f6"], ["Maintenance", "#f59e0b"], ["Grounded", "#ef4444"]].map(([l, c]) => (
                                <div key={l} className="flex items-center gap-4">
                                    <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                                    <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{l}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Active Alerts */}
                    <div className="card">
                        <div className="section-header" style={{ marginBottom: 12 }}>
                            <div className="section-title">Active Alerts</div>
                            <a href="/dashboard/alerts" className="btn btn-ghost btn-sm" style={{ gap: 4 }}>
                                View All <ChevronRight size={13} strokeWidth={2} />
                            </a>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {alerts.length === 0 ? (
                                <p className="text-muted fs-sm">No active alerts. All checks are current.</p>
                            ) : (
                                alerts.map((a, i) => (
                                    <div
                                        key={i}
                                        className={`alert-item ${a.urgency === "CRITICAL" ? "alert-critical" : a.urgency === "WARNING" ? "alert-warning" : "alert-info"}`}
                                    >
                                        {alertIcon(a.urgency)}
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: "0.8125rem", color: "var(--text-primary)" }}>
                                                {a.tailNumber}
                                            </div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                                                {a.checkType.replace(/_/g, " ")} ·{" "}
                                                {a.daysUntilDue < 0 ? `${Math.abs(a.daysUntilDue)}d overdue` : `${a.daysUntilDue}d`}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default function FleetOverviewPage() {
    return (
        <RoleGuard required={UserRole.FLEET_MANAGER}>
            <FleetOverviewContent />
        </RoleGuard>
    );
}
