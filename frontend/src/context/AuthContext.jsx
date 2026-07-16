import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // null=loading, false=unauth, obj=authed
    const [ready, setReady] = useState(false);

    const refresh = async () => {
        try {
            const { data } = await api.get("/auth/me");
            setUser(data.user);
        } catch (e) {
            setUser(false);
        } finally {
            setReady(true);
        }
    };

    useEffect(() => {
        refresh();
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post("/auth/login", { email, password });
        if (data.token) localStorage.setItem("kk_token", data.token);
        setUser(data.user);
        return data.user;
    };

    const register = async (name, email, password) => {
        const { data } = await api.post("/auth/register", { name, email, password });
        if (data.token) localStorage.setItem("kk_token", data.token);
        setUser(data.user);
        return data.user;
    };

    const logout = async () => {
        try { await api.post("/auth/logout"); } catch {}
        localStorage.removeItem("kk_token");
        setUser(false);
    };

    return (
        <AuthContext.Provider value={{ user, ready, login, register, logout, refresh, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
