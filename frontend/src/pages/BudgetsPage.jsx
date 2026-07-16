import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { api, formatApiErrorDetail } from "@/lib/api";
import { formatIDR } from "@/lib/format";
import { CATEGORIES } from "@/lib/categories";
import { toast } from "sonner";
import { ArrowLeft, Plus, Target, Trash2, AlertTriangle } from "lucide-react";

const BudgetsPage = () => {
    const nav = useNavigate();
    const [budgets, setBudgets] = useState([]);
    const [txs, setTxs] = useState([]);
    const [form, setForm] = useState({ open: false, category: "Makanan", amount: "", period: "monthly" });

    const load = async () => {
        const [b, t] = await Promise.all([api.get("/budgets"), api.get("/transactions")]);
        setBudgets(b.data.budgets);
        setTxs(t.data.transactions);
    };
    useEffect(() => { load(); }, []);

    const spentByCategory = useMemo(() => {
        const now = new Date();
        const monthly = {};
        const yearly = {};
        for (const t of txs) {
            if (t.type !== "expense") continue;
            const d = new Date(t.date);
            if (d.getFullYear() === now.getFullYear()) {
                yearly[t.category] = (yearly[t.category] || 0) + t.amount;
                if (d.getMonth() === now.getMonth()) {
                    monthly[t.category] = (monthly[t.category] || 0) + t.amount;
                }
            }
        }
        return { monthly, yearly };
    }, [txs]);

    const submit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/budgets", {
                category: form.category,
                amount: Number(String(form.amount).replace(/[^\d]/g, "")),
                period: form.period,
            });
            toast.success("Anggaran dibuat");
            setForm({ open: false, category: "Makanan", amount: "", period: "monthly" });
            load();
        } catch (err) {
            toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Gagal");
        }
    };

    const del = async (id) => {
        await api.delete(`/budgets/${id}`);
        load();
    };

    return (
        <AppShell showNav={false}>
            <div className="px-5 pt-8 pb-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => nav(-1)} className="w-10 h-10 rounded-full grid place-items-center bg-card border border-border" data-testid="budgets-back-btn">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="font-display text-2xl font-extrabold">Anggaran Kategori</h1>
                </div>

                <div className="mt-6 space-y-3">
                    {budgets.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground py-6">Belum ada anggaran. Buat sekarang!</p>
                    )}
                    {budgets.map((b) => {
                        const spent = (b.period === "monthly" ? spentByCategory.monthly : spentByCategory.yearly)[b.category] || 0;
                        const pct = Math.min(200, (spent / b.amount) * 100);
                        const over = spent > b.amount;
                        return (
                            <div key={b.id} className="p-4 rounded-2xl bg-card border border-border" data-testid={`budget-item-${b.id}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Target className="w-4 h-4 text-brand-blue" strokeWidth={2.5} />
                                        <p className="font-sans text-sm font-bold">{b.category}</p>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase">
                                            {b.period === "monthly" ? "Bulanan" : "Tahunan"}
                                        </span>
                                    </div>
                                    <button onClick={() => del(b.id)} className="w-7 h-7 rounded-full grid place-items-center text-brand-coral hover:bg-brand-coral/10" data-testid={`budget-delete-${b.id}`}>
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="mt-2 flex items-baseline justify-between">
                                    <p className="font-display text-lg font-extrabold">{formatIDR(spent)}</p>
                                    <p className="text-xs text-muted-foreground">/ {formatIDR(b.amount)}</p>
                                </div>
                                <div className="mt-2 h-2.5 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{
                                            width: `${Math.min(100, pct)}%`,
                                            background: over ? "#EF4444" : "#14B8A6",
                                        }}
                                    />
                                </div>
                                {over && (
                                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-brand-coral/15 text-brand-coral text-[10px] font-bold" data-testid={`budget-over-${b.id}`}>
                                        <AlertTriangle className="w-3 h-3" /> Melebihi Anggaran
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {!form.open && (
                    <button
                        onClick={() => setForm({ ...form, open: true })}
                        data-testid="budgets-add-btn"
                        className="mt-4 w-full h-13 rounded-full py-3 font-sans font-bold flex items-center justify-center gap-2 text-white active:scale-95 transition-transform"
                        style={{ background: "linear-gradient(135deg,#2C62B5,#14B8A6)" }}
                    >
                        <Plus className="w-4 h-4" /> Tambah Anggaran
                    </button>
                )}

                {form.open && (
                    <form onSubmit={submit} className="mt-4 p-4 rounded-3xl bg-card border border-border flex flex-col gap-3">
                        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-13 px-4 rounded-2xl border border-input bg-background font-sans text-sm outline-none" data-testid="budget-category-select">
                            {CATEGORIES.expense.map((c) => <option key={c.key} value={c.key}>{c.key}</option>)}
                        </select>
                        <input placeholder="Jumlah anggaran" inputMode="numeric" value={form.amount} required onChange={(e) => setForm({ ...form, amount: e.target.value })} className="h-13 px-4 rounded-2xl border border-input bg-background font-sans text-sm outline-none" data-testid="budget-amount-input" />
                        <select value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} className="h-13 px-4 rounded-2xl border border-input bg-background font-sans text-sm outline-none" data-testid="budget-period-select">
                            <option value="monthly">Bulanan</option>
                            <option value="yearly">Tahunan</option>
                        </select>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setForm({ ...form, open: false })} className="flex-1 h-12 rounded-full border border-border">Batal</button>
                            <button type="submit" data-testid="budget-save-btn" className="flex-1 h-12 rounded-full bg-brand-blue text-white font-bold">Simpan</button>
                        </div>
                    </form>
                )}
            </div>
        </AppShell>
    );
};

export default BudgetsPage;
