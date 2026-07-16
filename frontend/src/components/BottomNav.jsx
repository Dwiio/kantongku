import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, Calendar, PieChart, User, Plus } from "lucide-react";

const items = [
    { to: "/dashboard", label: "Beranda", icon: Home, testId: "nav-dashboard" },
    { to: "/kalender", label: "Kalender", icon: Calendar, testId: "nav-calendar" },
    { to: "/analisis", label: "Analisis", icon: PieChart, testId: "nav-analysis" },
    { to: "/profil", label: "Profil", icon: User, testId: "nav-profile" },
];

export const BottomNav = () => {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <nav
            data-testid="bottom-nav"
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40"
        >
            <div className="mx-3 mb-3 rounded-full bg-white/80 dark:bg-[#1E293B]/90 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-[0_10px_40px_rgba(15,23,42,0.12)] px-2 py-2 flex items-center justify-between">
                {items.slice(0, 2).map((it) => (
                    <NavItem key={it.to} {...it} active={location.pathname === it.to} />
                ))}

                {/* Center FAB */}
                <button
                    data-testid="nav-add-fab"
                    onClick={() => navigate("/tambah")}
                    className="relative -mt-8 w-14 h-14 rounded-full grid place-items-center shadow-[0_10px_25px_rgba(44,98,181,0.45)] active:scale-95 transition-transform"
                    style={{ background: "linear-gradient(135deg,#2C62B5,#14B8A6)" }}
                    aria-label="Tambah transaksi"
                >
                    <Plus className="w-7 h-7 text-white" strokeWidth={3} />
                </button>

                {items.slice(2).map((it) => (
                    <NavItem key={it.to} {...it} active={location.pathname === it.to} />
                ))}
            </div>
        </nav>
    );
};

const NavItem = ({ to, label, icon: Icon, active, testId }) => (
    <NavLink
        to={to}
        data-testid={testId}
        className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-2xl transition-colors ${
            active ? "text-brand-blue dark:text-brand-teal" : "text-muted-foreground"
        }`}
    >
        <Icon className="w-5 h-5" strokeWidth={active ? 2.75 : 2} />
        <span className={`text-[10px] font-semibold ${active ? "" : "opacity-80"}`}>{label}</span>
    </NavLink>
);

export default BottomNav;
