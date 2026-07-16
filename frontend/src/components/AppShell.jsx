import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { KantongKuLogo } from "@/components/KantongKuLogo";
import BottomNav from "@/components/BottomNav";

export const AppShell = ({ children, showNav = true }) => {
    return (
        <div className="relative min-h-screen bg-background text-foreground">
            <div className="fixed inset-0 grid-noise pointer-events-none" />
            <div className="relative mx-auto w-full max-w-md min-h-screen border-x border-border/40 bg-background">
                <div className={showNav ? "pb-28" : ""}>{children}</div>
                {showNav && <BottomNav />}
            </div>
        </div>
    );
};

export const RequireAuth = ({ children }) => {
    const { user, ready } = useAuth();
    const location = useLocation();

    if (!ready) {
        return (
            <div className="min-h-screen grid place-items-center bg-background">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <KantongKuLogo size={80} />
                    <p className="font-display text-lg text-muted-foreground">Memuat KantongKu…</p>
                </div>
            </div>
        );
    }
    if (!user) return <Navigate to="/masuk" state={{ from: location }} replace />;
    return children;
};
