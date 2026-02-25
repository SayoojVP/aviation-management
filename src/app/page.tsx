import type { Metadata } from "next";
import LandingCTA from "@/components/LandingCTA";
import {
  Plane,
  Wrench,
  BarChart3,
  Shield,
  Layers,
  ClipboardList,
  ArrowRight,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "AviLog — Professional Aviation Logbook & Fleet Management",
  description:
    "The complete platform for pilots to log certified flight hours and for fleet managers to keep every aircraft airworthy — with intelligent maintenance scheduling and real-time analytics.",
};

const features = [
  {
    Icon: Plane,
    color: "var(--accent-blue-dim)",
    iconColor: "var(--accent-blue-light)",
    title: "Pilot Logbook",
    description:
      "Log every flight with complete detail: PIC/SIC time, night hours, IFR, cross-country, landings by type, and approach categories.",
  },
  {
    Icon: Wrench,
    color: "var(--accent-teal-dim)",
    iconColor: "var(--accent-teal)",
    title: "Maintenance Scheduler",
    description:
      "Intelligent scheduling engine tracks 100-hour, annual, and AD compliance checks. Get alerts before they become problems.",
  },
  {
    Icon: BarChart3,
    color: "var(--accent-purple-dim)",
    iconColor: "var(--accent-purple)",
    title: "Analytics & Charts",
    description:
      "Visualize flight hour trends, category breakdowns, and fleet utilization with interactive charts and real-time data.",
  },
  {
    Icon: Shield,
    color: "var(--accent-amber-dim)",
    iconColor: "var(--accent-amber)",
    title: "Role-Based Access",
    description:
      "Separate dashboards for pilots and fleet managers with granular permissions. Each role sees exactly what they need.",
  },
  {
    Icon: Layers,
    color: "var(--accent-green-dim)",
    iconColor: "var(--accent-green)",
    title: "Fleet Overview",
    description:
      "Track airworthiness status across your entire fleet. Identify grounded aircraft, active maintenance, and upcoming checks at a glance.",
  },
  {
    Icon: ClipboardList,
    color: "var(--accent-red-dim)",
    iconColor: "var(--accent-red)",
    title: "Compliance Tracking",
    description:
      "Stay FAA-compliant with Airworthiness Directive tracking, medical expiry alerts, and certificate management.",
  },
];

const stats = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "FAA", label: "Compliant" },
  { value: "50+", label: "Aircraft Types" },
  { value: "24/7", label: "Real-time Alerts" },
];

export default function LandingPage() {
  return (
    <div className="landing-hero">
      {/* ── Navigation ── */}
      <nav className="landing-nav">
        <div className="logo-mark">
          <div className="logo-icon">
            <Plane size={18} color="white" strokeWidth={2} />
          </div>
          <div>
            <div className="logo-text">AviLog</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>For Pilots</span>
          <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>For Fleet Managers</span>
          <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Pricing</span>
          {/* CTA sets role then navigates */}
          <LandingCTA role="PILOT" href="/dashboard" className="btn btn-primary btn-sm" label="Open Dashboard" />
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero-section">
        <div className="hero-glow" />
        <div className="hero-badge">
          <Zap size={12} color="var(--accent-blue-light)" />
          Now with real-time maintenance alerts
        </div>
        <h1 className="hero-title">
          Aviation Logbook &amp;<br />
          <span className="gradient-text">Fleet Management</span>
          <br />Built for Professionals
        </h1>
        <p className="hero-description">
          The complete platform for pilots to log certified flight hours and for fleet managers to
          keep every aircraft airworthy — with intelligent maintenance scheduling and real-time
          analytics.
        </p>

        {/* Two distinct role entry points */}
        <div className="hero-actions">
          <LandingCTA
            role="PILOT"
            href="/dashboard"
            className="btn btn-primary"
            style={{ padding: "12px 28px", fontSize: "0.9375rem" }}
            icon={<Plane size={16} />}
            label="Pilot Dashboard"
          />
          <LandingCTA
            role="FLEET_MANAGER"
            href="/dashboard/fleet"
            className="btn btn-secondary"
            style={{ padding: "12px 28px", fontSize: "0.9375rem" }}
            icon={<Wrench size={16} />}
            label="Fleet Manager View"
          />
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: "40px",
            marginTop: "56px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.03em",
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "60px 0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 40, padding: "0 24px" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
            Every tool aviation professionals need
          </h2>
          <p style={{ color: "var(--text-secondary)", marginTop: 8, fontSize: "1rem" }}>
            Purpose-built for FAA compliance, situational awareness, and fleet efficiency.
          </p>
        </div>
        <div className="feature-grid">
          {features.map(({ Icon, color, iconColor, title, description }) => (
            <div className="feature-card" key={title}>
              <div className="feature-icon-wrap" style={{ background: color }}>
                <Icon size={20} color={iconColor} strokeWidth={1.75} />
              </div>
              <h3 style={{ marginBottom: 8, color: "var(--text-primary)", fontSize: "0.9375rem" }}>
                {title}
              </h3>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.65 }}>{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div
        style={{
          borderTop: "1px solid var(--border-subtle)",
          padding: "60px 24px",
          textAlign: "center",
        }}
      >
        <h2
          style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}
        >
          Ready to elevate your operations?
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 28 }}>
          Start logging flights and tracking maintenance instantly — no setup required.
        </p>
        <div className="flex gap-12" style={{ justifyContent: "center", flexWrap: "wrap" }}>
          <LandingCTA
            role="PILOT"
            href="/dashboard"
            className="btn btn-primary"
            style={{ padding: "13px 32px", fontSize: "0.9375rem" }}
            icon={<Plane size={16} />}
            label="Enter as Pilot"
          />
          <LandingCTA
            role="FLEET_MANAGER"
            href="/dashboard/fleet"
            className="btn btn-secondary"
            style={{ padding: "13px 32px", fontSize: "0.9375rem" }}
            icon={<Wrench size={16} />}
            label="Enter as Fleet Manager"
          />
        </div>
      </div>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid var(--border-subtle)",
          padding: "20px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div className="logo-mark">
          <div className="logo-icon">
            <Plane size={18} color="white" strokeWidth={2} />
          </div>
          <span className="logo-text">AviLog</span>
        </div>
        <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
          © 2026 AviLog Inc. Built for the aviation community.
        </p>
      </footer>
    </div>
  );
}
