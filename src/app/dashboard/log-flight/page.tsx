"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import { WeatherCondition, FlightRule, UserRole } from "@/lib/types";
import {
    Plane,
    Clock,
    PlaneLanding,
    FileText,
    Save,
    ArrowLeft,
    CheckCircle,
} from "lucide-react";

const PILOT_ID = "user-1";

const aircraftOptions = [
    { id: "ac-1", tailNumber: "N7842K", model: "Cessna 172 Skyhawk" },
    { id: "ac-2", tailNumber: "N2391P", model: "Piper PA-44 Seminole" },
    { id: "ac-3", tailNumber: "N5510H", model: "Beechcraft King Air B200" },
    { id: "ac-4", tailNumber: "N8823A", model: "Robinson R44 Raven II" },
];

const approachTypeOptions = ["ILS", "RNAV", "VOR", "NDB", "LOC", "LPV", "Visual"];

function LogFlightContent() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const [form, setForm] = useState({
        date: new Date().toISOString().split("T")[0],
        aircraftId: "ac-1",
        departureAirport: "",
        arrivalAirport: "",
        totalFlightTime: "",
        picTime: "",
        sicTime: "0",
        dualReceivedTime: "0",
        soloTime: "",
        nightTime: "0",
        ifrTime: "0",
        crossCountryTime: "0",
        dayLandings: "1",
        nightLandings: "0",
        weatherCondition: WeatherCondition.VMC,
        flightRule: FlightRule.VFR,
        approachTypes: [] as string[],
        remarks: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const toggleApproach = (type: string) => {
        setForm((prev) => ({
            ...prev,
            approachTypes: prev.approachTypes.includes(type)
                ? prev.approachTypes.filter((t) => t !== type)
                : [...prev.approachTypes, type],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const aircraft = aircraftOptions.find((a) => a.id === form.aircraftId);
            const payload = {
                ...form,
                pilotId: PILOT_ID,
                aircraftTailNumber: aircraft?.tailNumber ?? "",
                aircraftModel: aircraft?.model ?? "",
                totalFlightTime: parseFloat(form.totalFlightTime),
                picTime: parseFloat(form.picTime),
                sicTime: parseFloat(form.sicTime),
                dualReceivedTime: parseFloat(form.dualReceivedTime),
                soloTime: parseFloat(form.soloTime || form.picTime),
                nightTime: parseFloat(form.nightTime),
                ifrTime: parseFloat(form.ifrTime),
                crossCountryTime: parseFloat(form.crossCountryTime),
                dayLandings: parseInt(form.dayLandings),
                nightLandings: parseInt(form.nightLandings),
            };
            await fetch("/api/flights", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            setSuccess(true);
            setTimeout(() => router.push("/dashboard/logbook"), 1800);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="page-header">
                <h1 className="page-title">Log a Flight</h1>
                <p className="page-subtitle">Record a new flight entry to your official logbook</p>
            </div>

            {success && (
                <div
                    className="alert-item mb-24"
                    style={{ background: "var(--accent-green-dim)", borderColor: "rgba(34,197,94,0.3)", marginBottom: 24 }}
                >
                    <CheckCircle size={20} color="var(--accent-green)" strokeWidth={1.75} />
                    <div>
                        <div style={{ fontWeight: 600, color: "var(--accent-green)" }}>Flight logged successfully!</div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                            Redirecting to your logbook...
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                    {/* ── Basic Info ── */}
                    <div className="card">
                        <div className="section-title mb-16" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Plane size={16} color="var(--accent-blue-light)" strokeWidth={1.75} />
                            Flight Information
                        </div>
                        <div className="grid-3" style={{ gap: "16px" }}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="date">Date</label>
                                <input id="date" name="date" type="date" className="form-input" value={form.date} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="aircraftId">Aircraft</label>
                                <select id="aircraftId" name="aircraftId" className="form-select" value={form.aircraftId} onChange={handleChange}>
                                    {aircraftOptions.map((a) => (
                                        <option key={a.id} value={a.id}>{a.tailNumber} — {a.model}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="totalFlightTime">Total Flight Time (hrs)</label>
                                <input id="totalFlightTime" name="totalFlightTime" type="number" step="0.1" min="0.1" className="form-input" placeholder="e.g. 2.5" value={form.totalFlightTime} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="departureAirport">Departure (ICAO)</label>
                                <input id="departureAirport" name="departureAirport" type="text" className="form-input" placeholder="e.g. KLAX" maxLength={4} value={form.departureAirport} onChange={(e) => setForm((p) => ({ ...p, departureAirport: e.target.value.toUpperCase() }))} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="arrivalAirport">Arrival (ICAO)</label>
                                <input id="arrivalAirport" name="arrivalAirport" type="text" className="form-input" placeholder="e.g. KSFO" maxLength={4} value={form.arrivalAirport} onChange={(e) => setForm((p) => ({ ...p, arrivalAirport: e.target.value.toUpperCase() }))} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="crossCountryTime">Cross Country (hrs)</label>
                                <input id="crossCountryTime" name="crossCountryTime" type="number" step="0.1" min="0" className="form-input" placeholder="0" value={form.crossCountryTime} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* ── Hour Breakdown ── */}
                    <div className="card">
                        <div className="section-title mb-16" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Clock size={16} color="var(--accent-teal)" strokeWidth={1.75} />
                            Hour Breakdown
                        </div>
                        <div className="grid-3" style={{ gap: "16px" }}>
                            {[
                                { id: "picTime", label: "PIC Time (hrs)" },
                                { id: "sicTime", label: "SIC Time (hrs)" },
                                { id: "dualReceivedTime", label: "Dual Received (hrs)" },
                                { id: "soloTime", label: "Solo Time (hrs)" },
                                { id: "nightTime", label: "Night Time (hrs)" },
                                { id: "ifrTime", label: "Actual IMC (hrs)" },
                            ].map(({ id, label }) => (
                                <div className="form-group" key={id}>
                                    <label className="form-label" htmlFor={id}>{label}</label>
                                    <input
                                        id={id}
                                        name={id}
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        className="form-input"
                                        placeholder="0.0"
                                        value={(form as any)[id]}
                                        onChange={handleChange}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Landings & Conditions ── */}
                    <div className="card">
                        <div className="section-title mb-16" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <PlaneLanding size={16} color="var(--accent-amber)" strokeWidth={1.75} />
                            Landings &amp; Conditions
                        </div>
                        <div className="grid-3" style={{ gap: "16px" }}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="dayLandings">Day Landings</label>
                                <input id="dayLandings" name="dayLandings" type="number" min="0" className="form-input" value={form.dayLandings} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="nightLandings">Night Landings</label>
                                <input id="nightLandings" name="nightLandings" type="number" min="0" className="form-input" value={form.nightLandings} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="weatherCondition">Weather Condition</label>
                                <select id="weatherCondition" name="weatherCondition" className="form-select" value={form.weatherCondition} onChange={handleChange}>
                                    <option value={WeatherCondition.VMC}>VMC — Visual</option>
                                    <option value={WeatherCondition.IMC}>IMC — Instrument</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="flightRule">Flight Rules</label>
                                <select id="flightRule" name="flightRule" className="form-select" value={form.flightRule} onChange={handleChange}>
                                    <option value={FlightRule.VFR}>VFR</option>
                                    <option value={FlightRule.IFR}>IFR</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ marginTop: 16 }}>
                            <div className="form-label" style={{ marginBottom: 8 }}>Instrument Approaches</div>
                            <div className="flex gap-8" style={{ flexWrap: "wrap" }}>
                                {approachTypeOptions.map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => toggleApproach(t)}
                                        className={`badge ${form.approachTypes.includes(t) ? "badge-blue" : "badge-muted"}`}
                                        style={{ cursor: "pointer", padding: "6px 12px", fontSize: "0.8125rem" }}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Remarks ── */}
                    <div className="card">
                        <div className="section-title mb-16" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <FileText size={16} color="var(--accent-purple)" strokeWidth={1.75} />
                            Remarks
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="remarks">Flight Remarks &amp; Notes</label>
                            <textarea
                                id="remarks"
                                name="remarks"
                                className="form-textarea"
                                placeholder="Notable weather events, route notes, training maneuvers, squawks..."
                                rows={3}
                                value={form.remarks}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* ── Submit ── */}
                    <div className="flex justify-between items-center" style={{ flexWrap: "wrap", gap: 12 }}>
                        <a href="/dashboard/logbook" className="btn btn-secondary" style={{ gap: 6 }}>
                            <ArrowLeft size={15} strokeWidth={2} />
                            Cancel
                        </a>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting}
                            style={{ padding: "11px 28px", gap: 8 }}
                            id="submit-flight-btn"
                        >
                            <Save size={15} strokeWidth={2} />
                            {submitting ? "Saving..." : "Save Flight Entry"}
                        </button>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}

export default function LogFlightPage() {
    return (
        <RoleGuard required={UserRole.PILOT}>
            <LogFlightContent />
        </RoleGuard>
    );
}
