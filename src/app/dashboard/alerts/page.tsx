"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import { MaintenanceAlert, FleetStats, UserRole } from "@/lib/types";
import { checkTypeLabel } from "@/lib/services";
import {
    AlertOctagon,
    AlertTriangle,
    Info,
    ChevronRight,
    Calculator,
    Plane,
    Wrench,
} from "lucide-react";

function AlertCard({ alert }: { alert: MaintenanceAlert }) {
    const isOverdue = alert.daysUntilDue < 0;

    const urgencyConfig = {
        CRITICAL: {
            cls: "alert-critical",
            Icon: AlertOctagon,
            color: "var(--accent-red)",
            bg: "var(--accent-red-dim)",
            border: "rgba(239,68,68,0.2)",
            badgeCls: "badge-red",
        },
        WARNING: {
            cls: "alert-warning",
            Icon: AlertTriangle,
            color: "var(--accent-amber)",
            bg: "var(--accent-amber-dim)",
            border: "rgba(245,158,11,0.2)",
            badgeCls: "badge-amber",
        },
        INFO: {
            cls: "alert-info",
            Icon: Info,
            color: "var(--accent-blue-light)",
            bg: "var(--accent-blue-dim)",
            border: "rgba(59,130,246,0.2)",
            badgeCls: "badge-blue",
        },
    } as const;

    const cfg = urgencyConfig[alert.urgency];
    const { Icon } = cfg;

    return (
        <div
            className={`alert-item ${cfg.cls}`}
            style={{ padding: "16px 20px", borderRadius: "var(--radius-lg)" }}
        >
            <div
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: "var(--radius-sm)",
                    background: cfg.bg,
                    border: `1px solid ${cfg.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <Icon size={18} color={cfg.color} strokeWidth={1.75} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex items-center gap-8 mb-6" style={{ flexWrap: "wrap" }}>
                    <span
                        className="mono fw-700 text-primary"
                        style={{ fontSize: "1rem", letterSpacing: "0.04em" }}
                    >
                        {alert.tailNumber}
                    </span>
                    <span
                        className={`badge ${cfg.badgeCls}`}
                    >
                        {alert.urgency}
                    </span>
                    <span className="badge badge-muted">{checkTypeLabel(alert.checkType)}</span>
                    <span className="badge badge-muted">{alert.status.replace(/_/g, " ")}</span>
                </div>

                <div className="flex gap-24" style={{ flexWrap: "wrap" }}>
                    <div>
                        <div
                            style={{
                                fontSize: "0.7rem",
                                color: "var(--text-muted)",
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                                marginBottom: 2,
                            }}
                        >
                            Calendar Days
                        </div>
                        <div style={{ fontSize: "1.125rem", fontWeight: 700, color: cfg.color }}>
                            {isOverdue
                                ? `${Math.abs(alert.daysUntilDue)}d overdue`
                                : `${alert.daysUntilDue}d remaining`}
                        </div>
                    </div>
                    {alert.hoursUntilDue < 999 && (
                        <div>
                            <div
                                style={{
                                    fontSize: "0.7rem",
                                    color: "var(--text-muted)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.08em",
                                    marginBottom: 2,
                                }}
                            >
                                Hours Remaining
                            </div>
                            <div style={{ fontSize: "1.125rem", fontWeight: 700, color: cfg.color }}>
                                {alert.hoursUntilDue < 0
                                    ? `${Math.abs(alert.hoursUntilDue)} hrs over`
                                    : `${alert.hoursUntilDue} hrs`}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <a
                href="/dashboard/maintenance"
                className="btn btn-secondary btn-sm"
                style={{ flexShrink: 0, gap: 4 }}
            >
                View <ChevronRight size={13} strokeWidth={2} />
            </a>
        </div>
    );
}

function AlertsContent() {
    const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
    const [fleetStats, setFleetStats] = useState<FleetStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"ALL" | "CRITICAL" | "WARNING" | "INFO">("ALL");

    useEffect(() => {
        fetch("/api/maintenance/alerts")
            .then((r) => r.json())
            .then((d) => {
                setAlerts(d.alerts);
                setFleetStats(d.fleetStats);
                setLoading(false);
            });
    }, []);

    const filtered =
        filter === "ALL" ? alerts : alerts.filter((a) => a.urgency === filter);

    const critical = alerts.filter((a) => a.urgency === "CRITICAL").length;
    const warning = alerts.filter((a) => a.urgency === "WARNING").length;
    const info = alerts.filter((a) => a.urgency === "INFO").length;

    const summaryCfg = [
        {
            key: "CRITICAL",
            label: "Critical",
            count: critical,
            Icon: AlertOctagon,
            color: "var(--accent-red)",
            bg: "var(--accent-red-dim)",
            sub: "immediate action required",
            highlight: critical > 0,
        },
        {
            key: "WARNING",
            label: "Warning",
            count: warning,
            Icon: AlertTriangle,
            color: "var(--accent-amber)",
            bg: "var(--accent-amber-dim)",
            sub: "due within 30 days / 25 hrs",
            highlight: false,
        },
        {
            key: "INFO",
            label: "Informational",
            count: info,
            Icon: Info,
            color: "var(--accent-blue-light)",
            bg: "var(--accent-blue-dim)",
            sub: "upcoming check items",
            highlight: false,
        },
    ];

    return (
        <DashboardLayout>
            <div className="page-header">
                <div className="flex items-center gap-12">
                    <h1 className="page-title">Maintenance Alerts</h1>
                    {critical > 0 && (
                        <span className="badge badge-red" style={{ fontSize: "0.875rem", padding: "5px 12px", display: "inline-flex", alignItems: "center", gap: 5 }}>
                            <AlertOctagon size={12} strokeWidth={2.5} />
                            {critical} Critical
                        </span>
                    )}
                </div>
                <p className="page-subtitle">
                    Automated scheduling engine · alerts generated based on hours flown and calendar days
                </p>
            </div>

            {/* ── Summary Cards ── */}
            <div className="grid-3 mb-24">
                {summaryCfg.map(({ key, label, count, Icon, color, bg, sub, highlight }) => (
                    <div
                        className="stat-card"
                        key={key}
                        style={{ borderColor: highlight && count > 0 ? "rgba(239,68,68,0.3)" : undefined }}
                    >
                        <div className="stat-icon" style={{ background: bg }}>
                            <Icon size={16} color={color} strokeWidth={1.75} />
                        </div>
                        <div className="stat-label">{label}</div>
                        <div className="stat-value" style={{ color: count > 0 ? color : undefined }}>
                            {count}
                        </div>
                        <div className="stat-sub">{sub}</div>
                    </div>
                ))}
            </div>

            {/* ── Filter Tabs ── */}
            <div className="tab-bar mb-20">
                {(["ALL", "CRITICAL", "WARNING", "INFO"] as const).map((f) => (
                    <button
                        key={f}
                        className={`tab-btn ${filter === f ? "active" : ""}`}
                        onClick={() => setFilter(f)}
                    >
                        {f}
                        {f !== "ALL" && (
                            <span style={{ marginLeft: 6, fontSize: "0.7rem" }}>
                                ({f === "CRITICAL" ? critical : f === "WARNING" ? warning : info})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Alert List ── */}
            {loading ? (
                <div className="empty-state">
                    <Wrench size={40} color="var(--text-muted)" strokeWidth={1.5} />
                    <p style={{ marginTop: 12 }}>Running scheduling analysis...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <Plane size={40} color="var(--text-muted)" strokeWidth={1.5} />
                    <p style={{ marginTop: 12 }}>
                        No {filter !== "ALL" ? filter.toLowerCase() : ""} alerts. All checks are current.
                    </p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {filtered.map((alert, i) => (
                        <AlertCard key={i} alert={alert} />
                    ))}
                </div>
            )}

            {/* ── Algorithm note ── */}
            <div
                className="card"
                style={{
                    marginTop: 28,
                    background: "var(--accent-blue-dim)",
                    borderColor: "rgba(59,130,246,0.15)",
                }}
            >
                <div className="flex gap-12 items-center">
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: "var(--radius-sm)",
                            background: "rgba(59,130,246,0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <Calculator size={18} color="var(--accent-blue-light)" strokeWidth={1.75} />
                    </div>
                    <div>
                        <div
                            style={{
                                fontWeight: 600,
                                color: "var(--text-primary)",
                                fontSize: "0.875rem",
                                marginBottom: 4,
                            }}
                        >
                            Scheduling Algorithm
                        </div>
                        <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                            Alerts are computed by comparing each aircraft&apos;s current airframe hours and
                            today&apos;s date against scheduled maintenance intervals. Critical threshold: &lt;7
                            days or &lt;5 hours remaining. Warning threshold: &lt;30 days or &lt;25 hours
                            remaining.
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default function AlertsPage() {
    return (
        <RoleGuard required={UserRole.FLEET_MANAGER}>
            <AlertsContent />
        </RoleGuard>
    );
}
