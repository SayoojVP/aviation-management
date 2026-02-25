"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { UserRole } from "@/lib/types";

const STORAGE_KEY = "avilog_role";

type UserContextType = {
    role: UserRole;
    setRole: (role: UserRole) => void;
    loading: boolean;
};

const UserContext = createContext<UserContextType>({
    role: UserRole.PILOT,
    setRole: () => { },
    loading: true,
});

export function UserProvider({ children }: { children: ReactNode }) {
    const [role, setRoleState] = useState<UserRole>(UserRole.PILOT);
    const [loading, setLoading] = useState(true);

    // Hydrate from localStorage once on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === UserRole.FLEET_MANAGER || stored === UserRole.PILOT) {
            setRoleState(stored);
        }
        setLoading(false);
    }, []);

    const setRole = (newRole: UserRole) => {
        localStorage.setItem(STORAGE_KEY, newRole);
        setRoleState(newRole);
    };

    return (
        <UserContext.Provider value={{ role, setRole, loading }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
