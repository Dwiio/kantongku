import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import ThemeToggle from "@/components/ThemeToggle";
import { KantongKuLogo } from "@/components/KantongKuLogo";
import { formatIDR, formatIDRCompact, groupByDate, formatTime } from "@/lib/format";
import { findCategory, getCategoryIcon } from "@/lib/categories";
import { Wallet, TrendingUp, TrendingDown, Landmark, HandCoins, Target, Camera } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const DashboardPage = () => {
    const { user } = useAuth();
    const nav = useNavigate();
    const [summary, setSummary] = useState(null);
    const [txs, setTxs] = useState([]);
    const [wallets, setWallets] = useState([]);

    const load = async () => {
        const [s, t, w] = await Promise.all([
            api.get("/summary"),
            api.get("/transactions"),
            api.get("/wallets"),
        ]);
        setSummary(s.data);
        setTxs(t.data.transactions);
        setWallets(w.data.wallets);
    };

    useEffect(() => { load(); }, []);

    const walletById = useMemo(() => Object.fromEntries(wallets.map((w) => [w.id, w])), [wallets]);
    const grouped = useMemo(() => groupByDate(txs.slice(0, 40)), [txs]);

    return (
        <AppShell>
            <div className="px-5 pt-8">
                {/* Top row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <KantongKuLogo size={44} />
                        <div>
                            <p className="font-sans text-xs text-muted-foreground">Halo,</p>
                            <p className="font-display text-lg font-bold leading-tight flex items-center gap-2">
                                {user?.name}
                                {user?.role === "premium" && (
                                    <span data-testid="dashboard-pro-badge" className="text-[10px] font-black px-2 py-0.5 rounded-full text-brand-gold bg-brand-gold/15 border border-brand-gold/30 tracking-wider">
                                        PRO
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                    <ThemeToggle />
                </div>

                {/* Total balance card */}
                <div className="mt-6 rounded-3xl p-6 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg,#2C62B5 0%,#14B8A6 100%)" }}>
                    <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
                    <div className="absolute -right-14 top-12 w-24 h-24 rounded-full bg-white/10" />
                    <div className="relative flex items-center gap-2 text-white/80">
                        <Wallet className="w-4 h-4" strokeWidth={2.5} />
                        <span className="font-sans text-xs font-semibold uppercase tracking-wider">Total Saldo</span>
                    </div>
                    <p data-testid="dashboard-total-balance" className="relative mt-2 font-display text-4xl font-extrabold tracking-tight">
                        {formatIDR(summary?.total_balance)}
                    </p>
                    <p className="relative mt-1 font-sans text-xs text-white/70">Semua dompet aktif</p>
                </div>

                {/* Income / Expense */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl p-4 bg-card border border-border">
                        <div className="flex items-center gap-2 text-brand-teal">
                            <TrendingUp className="w-4 h-4" strokeWidth={2.5} />
                            <span className="font-sans text-[10px] font-bold uppercase tracking-wider">Pemasukan</span>
                        </div>
                        <p data-testid="dashboard-monthly-income" className="mt-2 font-display text-xl font-bold text-brand-teal">
                            {formatIDRCompact(summary?.monthly_income)}
                        </p>
                        <p className="font-sans text-[11px] text-muted-foreground">Bulan ini</p>
                    </div>
                    <div className="rounded-2xl p-4 bg-card border border-border">
                        <div className="flex items-center gap-2 text-brand-coral">
                            <TrendingDown className="w-4 h-4" strokeWidth={2.5} />
                            <span className="font-sans text-[10px] font-bold uppercase tracking-wider">Pengeluaran</span>
                        </div>
                        <p data-testid="dashboard-monthly-expense" className="mt-2 font-display text-xl font-bold text-brand-coral">
                            {formatIDRCompact(summary?.monthly_expense)}
                        </p>
                        <p className="font-sans text-[11px] text-muted-foreground">Bulan ini</p>
                    </div>
                </div>

                {/* Quick action shortcuts */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                    <QuickAction to="/dompet" icon={<Landmark className="w-5 h-5" />} label="Dompet" testId="quick-wallets" />
                    <QuickAction to="/utang" icon={<HandCoins className="w-5 h-5" />} label="Utang" testId="quick-debts" />
                    <QuickAction to="/anggaran" icon={<Target className="w-5 h-5" />} label="Anggaran" testId="quick-budgets" />
                </div>

                {/* Timeline */}
                <div className="mt-8 flex items-center justify-between">
                    <h2 className="font-display text-xl font-bold">Catat Keuangan</h2>
                    <Link to="/tambah" className="text-xs font-bold text-brand-blue dark:text-brand-teal" data-testid="dashboard-add-tx-link">+ Tambah</Link>
                </div>

                <div className="mt-3 space-y-5">
                    {grouped.length === 0 && (
                        <div className="rounded-2xl p-6 bg-card border border-border text-center">
                            <p className="font-sans text-sm text-muted-foreground">Belum ada transaksi</p>
                            <button onClick={() => nav("/tambah")} className="mt-3 px-4 py-2 rounded-full bg-brand-blue text-white text-sm font-bold" data-testid="dashboard-first-tx-btn">
                                Catat Pertama
                            </button>
                        </div>
                    )}
                    {grouped.map((g) => (
                        <div key={g.key}>
                            <div className="sticky top-0 z-10 -mx-1 px-1 py-2 bg-background/95 backdrop-blur">
                                <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{g.label}</p>
                            </div>
                            <div className="space-y-2">
                                {g.items.map((t) => {
                                    const cat = findCategory(t.type, t.category);
                                    const CatIcon = getCategoryIcon(cat.icon);
                                    const w = walletById[t.wallet_id];
                                    return (
                                        <div key={t.id} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border" data-testid={`tx-item-${t.id}`}>
                                            <div
                                                className="w-11 h-11 rounded-2xl grid place-items-center shrink-0"
                                                style={{ background: cat.color + "22", color: cat.color }}
                                                data-testid={`tx-cat-icon-${t.category}`}
                                            >
                                                <CatIcon className="w-5 h-5" strokeWidth={2.5} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-sans text-sm font-bold truncate">{t.category}</p>
                                                    {w && (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: (w.color || "#2C62B5") + "22", color: w.color || "#2C62B5" }}>
                                                            {w.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                                                    <span>{formatTime(t.date)}</span>
                                                    {t.note ? <>· <span className="truncate">{t.note}</span></> : null}
                                                    {t.photo && <Camera className="w-3 h-3 inline text-brand-teal" />}
                                                </p>
                                            </div>
                                            {t.photo && (
                                                <img src={t.photo} alt="struk" className="w-10 h-10 rounded-lg object-cover border border-border" />
                                            )}
                                            <p className={`font-sans text-sm font-extrabold shrink-0 ${t.type === "income" ? "text-brand-teal" : "text-brand-coral"}`}>
                                                {t.type === "income" ? "+" : "−"} {formatIDRCompact(t.amount)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppShell>
    );
};

const QuickAction = ({ to, icon, label, testId }) => (
    <Link to={to} data-testid={testId} className="flex flex-col items-center justify-center gap-1 p-3 rounded-2xl bg-card border border-border active:scale-95 transition-transform">
        <span className="w-9 h-9 rounded-full grid place-items-center bg-brand-blue/10 text-brand-blue dark:bg-brand-teal/15 dark:text-brand-teal">{icon}</span>
        <span className="font-sans text-[11px] font-bold">{label}</span>
    </Link>
);

export default DashboardPage;
