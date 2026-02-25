"use client";

import { useRouter } from "next/navigation";
import { UserRole } from "@/lib/types";
import { useUser } from "@/lib/userContext";
import { ReactNode, CSSProperties } from "react";

type LandingCTAProps = {
    role: "PILOT" | "FLEET_MANAGER";
    href: string;
    className?: string;
    style?: CSSProperties;
    label: string;
    icon?: ReactNode;
};

/**
 * A CTA button that updates the UserContext role (and persists to localStorage
 * via the context's setRole) then navigates to the appropriate dashboard.
 */
export default function LandingCTA({
    role,
    href,
    className = "btn btn-primary",
    style,
    label,
    icon,
}: LandingCTAProps) {
    const router = useRouter();
    const { setRole } = useUser();

    const handleClick = () => {
        // Update the context (which also persists to localStorage)
        setRole(role as UserRole);
        router.push(href);
    };

    return (
        <button
            onClick={handleClick}
            className={className}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", ...style }}
            id={`cta-${role.toLowerCase()}`}
        >
            {icon}
            {label}
        </button>
    );
}
