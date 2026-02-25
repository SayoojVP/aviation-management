"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/userContext";
import { UserRole } from "@/lib/types";
import { Loader2 } from "lucide-react";

type RoleGuardProps = {
    required: UserRole;
    children: React.ReactNode;
};

/**
 * Wraps a page and redirects away if the active role doesn't match.
 * Pilots who try to hit /dashboard/fleet will be sent to /dashboard, and vice versa.
 */
export default function RoleGuard({ required, children }: RoleGuardProps) {
    const { role, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        if (role !== required) {
            if (required === UserRole.PILOT) {
                // Fleet manager tried to access a pilot page → send to fleet
                router.replace("/dashboard/fleet");
            } else {
                // Pilot tried to access a fleet manager page → send to pilot dashboard
                router.replace("/dashboard");
            }
        }
    }, [role, loading, required, router]);

    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100vh",
                    background: "var(--bg-primary)",
                }}
            >
                <Loader2
                    size={28}
                    color="var(--accent-blue-light)"
                    strokeWidth={1.75}
                    style={{ animation: "spin 0.8s linear infinite" }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (role !== required) {
        // Still redirecting — show nothing to avoid flash
        return null;
    }

    return <>{children}</>;
}
