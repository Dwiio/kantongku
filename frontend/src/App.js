import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { RequireAuth } from "@/components/AppShell";

import SplashPage from "@/pages/SplashPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import CalendarPage from "@/pages/CalendarPage";
import AddTransactionPage from "@/pages/AddTransactionPage";
import AnalysisPage from "@/pages/AnalysisPage";
import ProfilePage from "@/pages/ProfilePage";
import WalletsPage from "@/pages/WalletsPage";
import DebtsPage from "@/pages/DebtsPage";
import BudgetsPage from "@/pages/BudgetsPage";
import ProPage from "@/pages/ProPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";

import "@/App.css";

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<SplashPage />} />
                        <Route path="/masuk" element={<LoginPage />} />
                        <Route path="/daftar" element={<RegisterPage />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

                        <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
                        <Route path="/kalender" element={<RequireAuth><CalendarPage /></RequireAuth>} />
                        <Route path="/tambah" element={<RequireAuth><AddTransactionPage /></RequireAuth>} />
                        <Route path="/analisis" element={<RequireAuth><AnalysisPage /></RequireAuth>} />
                        <Route path="/profil" element={<RequireAuth><ProfilePage /></RequireAuth>} />
                        <Route path="/dompet" element={<RequireAuth><WalletsPage /></RequireAuth>} />
                        <Route path="/utang" element={<RequireAuth><DebtsPage /></RequireAuth>} />
                        <Route path="/anggaran" element={<RequireAuth><BudgetsPage /></RequireAuth>} />
                        <Route path="/pro" element={<RequireAuth><ProPage /></RequireAuth>} />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                    <Toaster
                        position="top-center"
                        toastOptions={{
                            style: { borderRadius: "16px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 },
                        }}
                    />
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
