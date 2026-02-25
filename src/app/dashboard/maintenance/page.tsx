"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import { MaintenanceRecord, MaintenanceStatus, MaintenanceCheckType, UserRole } from "@/lib/types";
import { checkTypeLabel } from "@/lib/services";
import {
    CheckCircle,
    Clock,
    AlertTriangle,
    Wrench,
    PlusCircle,
    X,
    Plane,
} from "lucide-react";

function StatusBadge({ status }: { status: MaintenanceStatus }) {
    const map: Record<MaintenanceStatus, { cls: string; Icon: any; label: string }> = {
        COMPLETED: { cls: "badge-green", Icon: CheckCircle, label: "Completed" },
        DUE: { cls: "badge-amber", Icon: Clock, label: "Due" },
        OVERDUE: { cls: "badge-red", Icon: AlertTriangle, label: "Overdue" },
        IN_PROGRESS: { cls: "badge-blue", Icon: Wrench, label: "In Progress" },
    };
    const { cls, Icon, label } = map[status] ?? { cls: "badge-muted", Icon: Clock, label: status };
    return (
        <span className={`badge ${cls}`} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Icon size={10} strokeWidth={2.5} />
            {label}
        </span>
    );
}

function MaintenanceContent() {
    const searchParams = useSearchParams();
    const aircraftFilter = searchParams.get("aircraft");

    const [records, setRecords] = useState<MaintenanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("All");
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        aircraftId: aircraftFilter ?? "ac-1",
        aircraftTailNumber: "",
        checkType: MaintenanceCheckType.ANNUAL,
        status: MaintenanceStatus.DUE,
        scheduledDate: new Date().toISOString().split("T")[0],
        hoursAtCheck: "",
        nextDueHours: "",
        nextDueDate: "",
        technician: "",
        cost: "",
        notes: "",
    });

    useEffect(() => {
        const url = aircraftFilter
            ? `/api/maintenance?aircraftId=${aircraftFilter}`
            : "/api/maintenance";
        fetch(url)
            .then((r) => r.json())
            .then((d) => {
                setRecords(d.data);
                setLoading(false);
            });
    }, [aircraftFilter]);

    const filtered =
        statusFilter === "All"
            ? records
            : records.filter((r) => r.status === statusFilter);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const aircraftMap: Record<string, string> = {
            "ac-1": "N7842K",
            "ac-2": "N2391P",
            "ac-3": "N5510H",
            "ac-4": "N8823A",
            "ac-5": "N1100J",
        };
        const payload = {
            ...form,
            aircraftTailNumber: aircraftMap[form.aircraftId] ?? form.aircraftId,
            hoursAtCheck: parseFloat(form.hoursAtCheck),
            nextDueHours: form.nextDueHours ? parseFloat(form.nextDueHours) : undefined,
            cost: form.cost ? parseFloat(form.cost) : undefined,
        };
        const res = await fetch("/api/maintenance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        setRecords((prev) => [data.data, ...prev]);
        setShowModal(false);
    };

    const aircraftOptions = [
        { id: "ac-1", label: "N7842K — Cessna 172" },
        { id: "ac-2", label: "N2391P — Piper Seminole" },
        { id: "ac-3", label: "N5510H — King Air B200" },
        { id: "ac-4", label: "N8823A — R44 Raven II" },
        { id: "ac-5", label: "N1100J — Cirrus SR22T" },
    ];

    return (
        <DashboardLayout>
            <div className="page-header">
                <h1 className="page-title">Maintenance Records</h1>
                <p className="page-subtitle">
                    {aircraftFilter ? "Filtered by aircraft · " : "All aircraft · "}
                    {records.length} total records
                </p>
            </div>

            {/* ── Controls ── */}
            <div className="flex items-center justify-between mb-16" style={{ flexWrap: "wrap", gap: 12 }}>
                <div className="flex gap-8" style={{ flexWrap: "wrap" }}>
                    {["All", "DUE", "OVERDUE", "IN_PROGRESS", "COMPLETED"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setStatusFilter(f)}
                            style={{
                                padding: "6px 14px",
                                borderRadius: "var(--radius-sm)",
                                border: "1px solid",
                                borderColor: statusFilter === f ? "var(--accent-blue)" : "var(--border-subtle)",
                                background: statusFilter === f ? "var(--accent-blue-dim)" : "transparent",
                                color: statusFilter === f ? "var(--accent-blue-light)" : "var(--text-secondary)",
                                fontSize: "0.8125rem",
                                cursor: "pointer",
                                fontWeight: 500,
                            }}
                        >
                            {f.replace("_", " ")}
                        </button>
                    ))}
                </div>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowModal(true)}
                    id="add-maintenance-btn"
                    style={{ gap: 6 }}
                >
                    <PlusCircle size={14} strokeWidth={2} />
                    Add Record
                </button>
            </div>

            {loading ? (
                <div className="empty-state">
                    <Wrench size={40} color="var(--text-muted)" strokeWidth={1.5} />
                    <p style={{ marginTop: 12 }}>Loading records...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <Wrench size={40} color="var(--text-muted)" strokeWidth={1.5} />
                    <p style={{ marginTop: 12 }}>No records match the selected filter.</p>
                </div>
            ) : (
                <div className="data-table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Aircraft</th>
                                <th>Check Type</th>
                                <th>Status</th>
                                <th>Scheduled</th>
                                <th>Completed</th>
                                <th>Hours at Check</th>
                                <th>Next Due (hrs)</th>
                                <th>Next Due Date</th>
                                <th>Technician</th>
                                <th>Cost</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((r) => (
                                <tr key={r.id}>
                                    <td>
                                        <span className="cell-mono fw-600" style={{ color: "var(--text-primary)" }}>
                                            {r.aircraftTailNumber}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="badge badge-muted">{checkTypeLabel(r.checkType)}</span>
                                    </td>
                                    <td>
                                        <StatusBadge status={r.status} />
                                    </td>
                                    <td>
                                        {new Date(r.scheduledDate).toLocaleDateString("en-US", {
                                            month: "short", day: "numeric", year: "numeric",
                                        })}
                                    </td>
                                    <td>
                                        {r.completedDate
                                            ? new Date(r.completedDate).toLocaleDateString("en-US", {
                                                month: "short", day: "numeric", year: "numeric",
                                            })
                                            : "—"}
                                    </td>
                                    <td className="cell-primary">{r.hoursAtCheck.toLocaleString()}</td>
                                    <td>{r.nextDueHours?.toLocaleString() ?? "—"}</td>
                                    <td>
                                        {r.nextDueDate
                                            ? new Date(r.nextDueDate).toLocaleDateString("en-US", {
                                                month: "short", day: "numeric", year: "numeric",
                                            })
                                            : "—"}
                                    </td>
                                    <td style={{ color: "var(--text-secondary)" }}>{r.technician ?? "—"}</td>
                                    <td>{r.cost != null ? `$${r.cost.toLocaleString()}` : "—"}</td>
                                    <td
                                        style={{
                                            maxWidth: 200,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            fontSize: "0.8125rem",
                                            color: "var(--text-muted)",
                                        }}
                                    >
                                        {r.squawks ?? r.notes ?? "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Add Record Modal ── */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-20">
                            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                                <Wrench size={18} color="var(--accent-blue-light)" strokeWidth={1.75} />
                                Add Maintenance Record
                            </h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)} aria-label="Close">
                                <X size={16} strokeWidth={2} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div className="grid-2" style={{ gap: 14 }}>
                                <div className="form-group">
                                    <label className="form-label">Aircraft</label>
                                    <select
                                        className="form-select"
                                        value={form.aircraftId}
                                        onChange={(e) => setForm((p) => ({ ...p, aircraftId: e.target.value }))}
                                    >
                                        {aircraftOptions.map((a) => (
                                            <option key={a.id} value={a.id}>{a.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Check Type</label>
                                    <select
                                        className="form-select"
                                        value={form.checkType}
                                        onChange={(e) => setForm((p) => ({ ...p, checkType: e.target.value as MaintenanceCheckType }))}
                                    >
                                        {Object.values(MaintenanceCheckType).map((t) => (
                                            <option key={t} value={t}>{checkTypeLabel(t)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <select
                                        className="form-select"
                                        value={form.status}
                                        onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as MaintenanceStatus }))}
                                    >
                                        {Object.values(MaintenanceStatus).map((s) => (
                                            <option key={s} value={s}>{s.replace("_", " ")}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Scheduled Date</label>
                                    <input type="date" className="form-input" value={form.scheduledDate} onChange={(e) => setForm((p) => ({ ...p, scheduledDate: e.target.value }))} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Hours at Check</label>
                                    <input type="number" step="0.1" className="form-input" placeholder="e.g. 1248.5" value={form.hoursAtCheck} onChange={(e) => setForm((p) => ({ ...p, hoursAtCheck: e.target.value }))} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Next Due Hours</label>
                                    <input type="number" step="0.1" className="form-input" placeholder="e.g. 1348.5" value={form.nextDueHours} onChange={(e) => setForm((p) => ({ ...p, nextDueHours: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Next Due Date</label>
                                    <input type="date" className="form-input" value={form.nextDueDate} onChange={(e) => setForm((p) => ({ ...p, nextDueDate: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Technician</label>
                                    <input type="text" className="form-input" placeholder="A&P Name" value={form.technician} onChange={(e) => setForm((p) => ({ ...p, technician: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Cost ($)</label>
                                    <input type="number" className="form-input" placeholder="0" value={form.cost} onChange={(e) => setForm((p) => ({ ...p, cost: e.target.value }))} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Notes / Squawks</label>
                                <textarea
                                    className="form-textarea"
                                    rows={2}
                                    value={form.notes}
                                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                                    placeholder="Defects found, work performed..."
                                />
                            </div>
                            <div className="flex justify-between mt-4">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" id="save-maintenance-btn" style={{ gap: 6 }}>
                                    <CheckCircle size={14} strokeWidth={2} />
                                    Save Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default function MaintenancePage() {
    return (
        <RoleGuard required={UserRole.FLEET_MANAGER}>
            <Suspense
                fallback={
                    <DashboardLayout>
                        <div className="empty-state">
                            <Plane size={40} color="var(--text-muted)" strokeWidth={1.5} />
                            <p style={{ marginTop: 12 }}>Loading...</p>
                        </div>
                    </DashboardLayout>
                }
            >
                <MaintenanceContent />
            </Suspense>
        </RoleGuard>
    );
}
