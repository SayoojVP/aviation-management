"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserRole } from "@/lib/types";
import { useUser } from "@/lib/userContext";
import {
    Plane,
    LayoutDashboard,
    BookOpen,
    PlusCircle,
    Layers,
    Wrench,
    Bell,
    Menu,
    X,
    LogOut,
} from "lucide-react";

const pilotNavItems = [
    { href: "/dashboard", label: "Overview", Icon: LayoutDashboard },
    { href: "/dashboard/logbook", label: "Flight Logbook", Icon: BookOpen },
    { href: "/dashboard/log-flight", label: "Log a Flight", Icon: PlusCircle },
];

const fleetNavItems = [
    { href: "/dashboard/fleet", label: "Fleet Overview", Icon: Layers },
    { href: "/dashboard/maintenance", label: "Maintenance", Icon: Wrench },
    { href: "/dashboard/alerts", label: "Alerts", Icon: Bell },
];

const userMeta: Record<UserRole, { name: string; initials: string; sub: string }> = {
    [UserRole.PILOT]: {
        name: "Captain James Hartwell",
        initials: "JH",
        sub: "FAA Cert #2847361",
    },
    [UserRole.FLEET_MANAGER]: {
        name: "Sarah Collins",
        initials: "SC",
        sub: "Fleet Manager",
    },
    [UserRole.ADMIN]: {
        name: "Admin",
        initials: "AD",
        sub: "Administrator",
    },
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { role } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isPilot = role === UserRole.PILOT;
    const navItems = isPilot ? pilotNavItems : fleetNavItems;
    const sectionLabel = isPilot ? "Pilot Workspace" : "Fleet Operations";
    const meta = userMeta[role] ?? userMeta[UserRole.PILOT];

    const handleSignOut = () => {
        router.push("/");
    };

    return (
        <div className="app-shell">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        zIndex: 49,
                    }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
                <div className="sidebar-logo">
                    <Link href="/" className="logo-mark" style={{ textDecoration: "none" }}>
                        <div className="logo-icon">
                            <Plane size={18} color="white" strokeWidth={2} />
                        </div>
                        <div>
                            <div className="logo-text">AviLog</div>
                            <div className="logo-sub">Professional Edition</div>
                        </div>
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section-label">{sectionLabel}</div>
                    {navItems.map(({ href, label, Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`nav-item ${pathname === href ? "active" : ""}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <Icon size={15} strokeWidth={1.75} className="icon" />
                            {label}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    {/* Role badge */}
                    <div
                        style={{
                            padding: "8px 10px",
                            marginBottom: 8,
                            borderRadius: "var(--radius-sm)",
                            background: isPilot ? "var(--accent-blue-dim)" : "var(--accent-teal-dim)",
                            border: `1px solid ${isPilot ? "rgba(59,130,246,0.2)" : "rgba(20,184,166,0.2)"}`,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        {isPilot ? (
                            <Plane size={13} color="var(--accent-blue-light)" strokeWidth={1.75} />
                        ) : (
                            <Wrench size={13} color="var(--accent-teal)" strokeWidth={1.75} />
                        )}
                        <span
                            style={{
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color: isPilot ? "var(--accent-blue-light)" : "var(--accent-teal)",
                            }}
                        >
                            {isPilot ? "Pilot Dashboard" : "Fleet Manager Dashboard"}
                        </span>
                    </div>

                    <div className="user-pill">
                        <div className="avatar">{meta.initials}</div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <div
                                className="user-name"
                                style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                            >
                                {meta.name.split(" ").slice(-2).join(" ")}
                            </div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 1 }}>
                                {meta.sub}
                            </div>
                        </div>
                        <button
                            className="btn btn-ghost btn-icon"
                            title="Back to home"
                            onClick={handleSignOut}
                            style={{ flexShrink: 0, opacity: 0.6 }}
                        >
                            <LogOut size={14} strokeWidth={1.75} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* ── Main Area ── */}
            <div className="main-content">
                {/* Topbar */}
                <header className="topbar">
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Toggle sidebar"
                        style={{ display: "none" }}
                        id="mobile-menu-btn"
                    >
                        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>

                    <div style={{ flex: 1 }} />

                    {/* Role pill in topbar */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "6px 14px",
                            borderRadius: "var(--radius-full)",
                            background: isPilot ? "var(--accent-blue-dim)" : "var(--accent-teal-dim)",
                            border: `1px solid ${isPilot ? "rgba(59,130,246,0.2)" : "rgba(20,184,166,0.2)"}`,
                        }}
                    >
                        {isPilot ? (
                            <Plane size={13} color="var(--accent-blue-light)" strokeWidth={1.75} />
                        ) : (
                            <Wrench size={13} color="var(--accent-teal)" strokeWidth={1.75} />
                        )}
                        <span
                            style={{
                                fontSize: "0.8125rem",
                                fontWeight: 600,
                                color: isPilot ? "var(--accent-blue-light)" : "var(--accent-teal)",
                            }}
                        >
                            {isPilot ? "Pilot" : "Fleet Manager"}
                        </span>
                    </div>

                    <div className="user-pill" style={{ padding: "5px 10px" }}>
                        <div className="avatar">{meta.initials}</div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <span className="user-name" style={{ fontSize: "0.8125rem" }}>
                                {meta.name.split(" ").slice(-2).join(" ")}
                            </span>
                            <span
                                style={{
                                    fontSize: "0.7rem",
                                    color: "var(--text-muted)",
                                    marginTop: 1,
                                }}
                            >
                                {meta.sub}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="page-content">{children}</main>
            </div>

            <style>{`
        @media (max-width: 768px) {
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
        </div>
    );
}
