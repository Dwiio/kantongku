import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export const ThemeToggle = ({ className = "" }) => {
    const { theme, toggle } = useTheme();
    const isDark = theme === "dark";
    return (
        <button
            data-testid="theme-toggle-btn"
            onClick={toggle}
            aria-label="Ganti tema"
            className={`relative w-11 h-11 rounded-full grid place-items-center bg-white/70 dark:bg-white/10 backdrop-blur border border-black/5 dark:border-white/10 hover:scale-105 active:scale-95 transition-transform ${className}`}
        >
            {isDark ? (
                <Sun className="w-5 h-5 text-brand-gold" strokeWidth={2.5} />
            ) : (
                <Moon className="w-5 h-5 text-brand-blue" strokeWidth={2.5} />
            )}
        </button>
    );
};

export default ThemeToggle;
