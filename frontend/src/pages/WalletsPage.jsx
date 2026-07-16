import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { api, formatApiErrorDetail } from "@/lib/api";
import { formatIDR } from "@/lib/format";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Plus, Wallet as WalletIcon, Lock, Crown, Trash2 } from "lucide-react";

const TYPES = [
    { key: "cash", label: "Tunai", color: "#14B8A6" },
    { key: "bank", label: "Bank", color: "#2C62B5" },
    { key: "ewallet", label: "E-Wallet", color: "#F59E0B" },
    { key: "savings", label: "Tabungan", color: "#8B5CF6" },
    { key: "card", label: "Kartu Kredit", color: "#EF4444" },
    { key: "investment", label: "Investasi", color: "#06B6D4" },
    { key: "other", label: "Lainnya", color: "#64748B" },
];

const WalletsPage = () => {
    const nav = useNavigate();
    const { user } = useAuth();
    const [wallets, setWallets] = useState([]);
    const [limit, setLimit] = useState(null);
    const [form, setForm] = useState({ open: false, name: "", type: "cash", balance: "" });

    const load = async () => {
        const r = await api.get("/wallets");
        setWallets(r.data.wallets);
        setLimit(r.data.limit);
    };
    useEffect(() => { load(); }, []);

    const canAdd = limit == null || wallets.length < limit;

    const submit = async (e) => {
        e.preventDefault();
        try {
            const t = TYPES.find((x) => x.key === form.type);
            await api.post("/wallets", {
                name: form.name,
                type: form.type,
                balance: Number(String(form.balance).replace(/[^\d-]/g, "")) || 0,
                color: t?.color || "#2C62B5",
                icon: "wallet",
            });
            toast.success("Dompet ditambahkan");
            setForm({ open: false, name: "", type: "cash", balance: "" });
            load();
        } catch (err) {
            toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Gagal");
        }
    };

    const del = async (id) => {
        if (!window.confirm("Hapus dompet dan semua transaksinya?")) return;
        await api.delete(`/wallets/${id}`);
        toast.success("Dihapus");
        load();
    };

    return (
        <AppShell showNav={false}>
            <div className="px-5 pt-8 pb-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => nav(-1)} className="w-10 h-10 rounded-full grid place-items-center bg-card border border-border" data-testid="wallets-back-btn">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="font-display text-2xl font-extrabold">Akun dan Dompet</h1>
                </div>

                {user?.role !== "premium" && (
                    <div className="mt-4 rounded-2xl p-3 bg-brand-gold/10 border border-brand-gold/30 flex items-center gap-3">
                        <Lock className="w-5 h-5 text-brand-gold" />
                        <div className="flex-1">
                            <p data-testid="wallets-freemium-notice" className="font-sans text-xs font-bold">
                                Tier Gratis: {wallets.length}/{limit} dompet
                            </p>
                            <p className="text-[11px] text-muted-foreground">Upgrade ke Pro untuk dompet tanpa batas.</p>
                        </div>
                        <button onClick={() => nav("/pro")} className="text-xs font-bold px-3 py-1.5 rounded-full bg-brand-gold text-white" data-testid="wallets-upgrade-btn">
                            <Crown className="w-3 h-3 inline mr-1" /> Pro
                        </button>
                    </div>
                )}

                <div className="mt-4 space-y-3">
                    {wallets.map((w) => (
                        <div key={w.id} className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border" data-testid={`wallet-item-${w.id}`}>
                            <span className="w-11 h-11 rounded-2xl grid place-items-center" style={{ background: (w.color || "#2C62B5") + "22", color: w.color || "#2C62B5" }}>
                                <WalletIcon className="w-5 h-5" strokeWidth={2.5} />
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="font-sans text-sm font-bold truncate">{w.name}</p>
                                <p className="text-[11px] text-muted-foreground capitalize">{w.type}</p>
                            </div>
                            <div className="text-right">
                                <p className={`font-display text-sm font-extrabold ${w.balance < 0 ? "text-brand-coral" : ""}`}>{formatIDR(w.balance)}</p>
                            </div>
                            <button onClick={() => del(w.id)} className="w-8 h-8 rounded-full grid place-items-center text-brand-coral hover:bg-brand-coral/10" data-testid={`wallet-delete-${w.id}`}>
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                {!form.open && (
                    <button
                        onClick={() => canAdd ? setForm({ ...form, open: true }) : nav("/pro")}
                        data-testid="wallets-add-btn"
                        className="mt-4 w-full h-13 rounded-full py-3 font-sans font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                        style={{ background: canAdd ? "linear-gradient(135deg,#2C62B5,#14B8A6)" : "linear-gradient(135deg,#F59E0B,#EF4444)", color: "white" }}
                    >
                        {canAdd ? <><Plus className="w-4 h-4" /> Tambah Dompet</> : <><Crown className="w-4 h-4" /> Upgrade untuk Tambah</>}
                    </button>
                )}

                {form.open && (
                    <form onSubmit={submit} className="mt-4 p-4 rounded-3xl bg-card border border-border flex flex-col gap-3" data-testid="wallets-add-form">
                        <input
                            placeholder="Nama dompet"
                            value={form.name}
                            required
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full h-13 px-4 rounded-2xl border border-input bg-background font-sans text-sm outline-none"
                            data-testid="wallet-name-input"
                        />
                        <select
                            value={form.type}
                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                            className="w-full h-13 px-4 rounded-2xl border border-input bg-background font-sans text-sm outline-none"
                            data-testid="wallet-type-select"
                        >
                            {TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
                        </select>
                        <input
                            placeholder="Saldo awal"
                            inputMode="numeric"
                            value={form.balance}
                            onChange={(e) => setForm({ ...form, balance: e.target.value })}
                            className="w-full h-13 px-4 rounded-2xl border border-input bg-background font-sans text-sm outline-none"
                            data-testid="wallet-balance-input"
                        />
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setForm({ open: false, name: "", type: "cash", balance: "" })} className="flex-1 h-12 rounded-full border border-border">
                                Batal
                            </button>
                            <button type="submit" data-testid="wallet-save-btn" className="flex-1 h-12 rounded-full bg-brand-blue text-white font-bold">
                                Simpan
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </AppShell>
    );
};

export default WalletsPage;
