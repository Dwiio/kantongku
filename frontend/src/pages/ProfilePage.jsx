import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AppShell } from "@/components/AppShell";
import ThemeToggle from "@/components/ThemeToggle";
import { KantongKuLogo } from "@/components/KantongKuLogo";
import { ChevronRight, LogOut, Shield, Crown, Landmark, HandCoins, Target, FileText } from "lucide-react";
import { toast } from "sonner";

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const nav = useNavigate();

    const doLogout = async () => {
        await logout();
        toast.success("Berhasil keluar");
        nav("/");
    };

    return (
        <AppShell>
            <div className="px-5 pt-8">
                <div className="flex items-center justify-between">
                    <h1 className="font-display text-3xl font-extrabold tracking-tight">Profil</h1>
                    <ThemeToggle />
                </div>

                {/* User card */}
                <div className="mt-5 rounded-3xl p-5 bg-card border border-border flex items-center gap-4">
                    <KantongKuLogo size={56} />
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <p data-testid="profile-name" className="font-display text-lg font-bold truncate">{user?.name}</p>
                            {user?.role === "premium" && (
                                <span data-testid="profile-pro-badge" className="text-[10px] font-black px-2 py-0.5 rounded-full text-brand-gold bg-brand-gold/15 border border-brand-gold/30 tracking-wider">
                                    PRO
                                </span>
                            )}
                        </div>
                        <p data-testid="profile-email" className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                </div>

                {/* Upgrade CTA */}
                {user?.role !== "premium" && (
                    <button
                        onClick={() => nav("/pro")}
                        data-testid="profile-upgrade-btn"
                        className="mt-4 w-full rounded-3xl p-4 text-left text-white relative overflow-hidden active:scale-[0.98] transition-transform"
                        style={{ background: "linear-gradient(135deg,#F59E0B,#EF4444)" }}
                    >
                        <Crown className="absolute -right-2 -top-2 w-24 h-24 text-white/10" />
                        <p className="font-display text-lg font-extrabold">Upgrade ke KantongKu Pro</p>
                        <p className="text-xs mt-1 opacity-90">Dompet tanpa batas, laporan lengkap, badge PRO</p>
                        <p className="mt-2 inline-flex items-center gap-1 text-sm font-bold">Rp 29.000/bulan <ChevronRight className="w-4 h-4" /></p>
                    </button>
                )}

                {/* Menu */}
                <div className="mt-5 rounded-2xl bg-card border border-border overflow-hidden">
                    <MenuItem icon={<Landmark className="w-5 h-5" />} label="Akun dan Dompet" onClick={() => nav("/dompet")} testId="menu-wallets" />
                    <MenuItem icon={<HandCoins className="w-5 h-5" />} label="Pelacak Utang" onClick={() => nav("/utang")} testId="menu-debts" />
                    <MenuItem icon={<Target className="w-5 h-5" />} label="Anggaran Kategori" onClick={() => nav("/anggaran")} testId="menu-budgets" />
                    <MenuItem icon={<Crown className="w-5 h-5" />} label="KantongKu Pro" onClick={() => nav("/pro")} testId="menu-pro" />
                    <MenuItem icon={<Shield className="w-5 h-5" />} label="Kebijakan Privasi" onClick={() => nav("/privacy-policy")} testId="menu-privacy" />
                    <MenuItem icon={<FileText className="w-5 h-5" />} label="Tentang KantongKu" onClick={() => toast.info("Versi 1.0.0 — KantongKu")} testId="menu-about" />
                </div>

                <button
                    onClick={doLogout}
                    data-testid="profile-logout-btn"
                    className="mt-6 w-full h-13 rounded-full py-3 font-sans font-bold text-brand-coral bg-brand-coral/10 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                    <LogOut className="w-4 h-4" /> Keluar
                </button>
            </div>
        </AppShell>
    );
};

const MenuItem = ({ icon, label, onClick, testId }) => (
    <button onClick={onClick} data-testid={testId} className="w-full flex items-center gap-3 px-4 py-3.5 border-b last:border-b-0 border-border/60 active:bg-muted transition-colors">
        <span className="w-9 h-9 rounded-xl bg-brand-blue/10 text-brand-blue dark:bg-brand-teal/15 dark:text-brand-teal grid place-items-center">{icon}</span>
        <span className="font-sans text-sm font-bold flex-1 text-left">{label}</span>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </button>
);

export default ProfilePage;
