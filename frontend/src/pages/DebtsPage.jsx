import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { api, formatApiErrorDetail } from "@/lib/api";
import { formatIDR } from "@/lib/format";
import { toast } from "sonner";
import { ArrowLeft, Plus, User, CheckCircle2, Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const DebtsPage = () => {
    const nav = useNavigate();
    const [debts, setDebts] = useState([]);
    const [form, setForm] = useState({ open: false, type: "payable", person: "", amount: "", note: "", due_date: "" });

    const load = async () => {
        const r = await api.get("/debts");
        setDebts(r.data.debts);
    };
    useEffect(() => { load(); }, []);

    const payables = useMemo(() => debts.filter((d) => d.type === "payable" && !d.settled), [debts]);
    const receivables = useMemo(() => debts.filter((d) => d.type === "receivable" && !d.settled), [debts]);
    const totalPayable = payables.reduce((s, d) => s + d.amount, 0);
    const totalReceivable = receivables.reduce((s, d) => s + d.amount, 0);

    const submit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/debts", {
                type: form.type,
                person: form.person,
                amount: Number(String(form.amount).replace(/[^\d]/g, "")),
                note: form.note,
                due_date: form.due_date || null,
                settled: false,
            });
            toast.success("Dicatat");
            setForm({ open: false, type: "payable", person: "", amount: "", note: "", due_date: "" });
            load();
        } catch (err) {
            toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Gagal");
        }
    };

    const settle = async (id) => {
        await api.patch(`/debts/${id}`, { settled: true });
        toast.success("Ditandai lunas");
        load();
    };

    const del = async (id) => {
        await api.delete(`/debts/${id}`);
        load();
    };

    return (
        <AppShell showNav={false}>
            <div className="px-5 pt-8 pb-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => nav(-1)} className="w-10 h-10 rounded-full grid place-items-center bg-card border border-border" data-testid="debts-back-btn">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="font-display text-2xl font-extrabold">Pelacak Utang</h1>
                </div>

                <Tabs defaultValue="payable" className="mt-6">
                    <TabsList className="w-full grid grid-cols-2 rounded-full bg-muted p-1 h-12">
                        <TabsTrigger value="payable" data-testid="debts-tab-payable" className="rounded-full data-[state=active]:bg-brand-coral data-[state=active]:text-white font-bold">
                            Untuk Dibayar
                        </TabsTrigger>
                        <TabsTrigger value="receivable" data-testid="debts-tab-receivable" className="rounded-full data-[state=active]:bg-brand-teal data-[state=active]:text-white font-bold">
                            Untuk Diterima
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="payable" className="mt-4">
                        <SummaryBlock label="Total dibayar" amount={totalPayable} color="text-brand-coral" testId="debts-total-payable" />
                        <DebtList items={payables} onSettle={settle} onDelete={del} color="#EF4444" />
                    </TabsContent>
                    <TabsContent value="receivable" className="mt-4">
                        <SummaryBlock label="Total diterima" amount={totalReceivable} color="text-brand-teal" testId="debts-total-receivable" />
                        <DebtList items={receivables} onSettle={settle} onDelete={del} color="#14B8A6" />
                    </TabsContent>
                </Tabs>

                {!form.open && (
                    <button
                        onClick={() => setForm({ ...form, open: true })}
                        data-testid="debts-add-btn"
                        className="mt-4 w-full h-13 rounded-full py-3 font-sans font-bold flex items-center justify-center gap-2 text-white active:scale-95 transition-transform"
                        style={{ background: "linear-gradient(135deg,#2C62B5,#14B8A6)" }}
                    >
                        <Plus className="w-4 h-4" /> Catat Utang / Piutang
                    </button>
                )}

                {form.open && (
                    <form onSubmit={submit} className="mt-4 p-4 rounded-3xl bg-card border border-border flex flex-col gap-3">
                        <div className="grid grid-cols-2 rounded-full bg-muted p-1">
                            {["payable", "receivable"].map((t) => (
                                <button key={t} type="button" onClick={() => setForm({ ...form, type: t })} data-testid={`debts-form-type-${t}`} className={`h-10 rounded-full font-bold text-sm ${form.type === t ? (t === "payable" ? "bg-brand-coral text-white" : "bg-brand-teal text-white") : "text-muted-foreground"}`}>
                                    {t === "payable" ? "Dibayar" : "Diterima"}
                                </button>
                            ))}
                        </div>
                        <input placeholder="Nama orang" value={form.person} required onChange={(e) => setForm({ ...form, person: e.target.value })} className="h-13 px-4 rounded-2xl border border-input bg-background font-sans text-sm outline-none" data-testid="debt-person-input" />
                        <input placeholder="Jumlah" inputMode="numeric" value={form.amount} required onChange={(e) => setForm({ ...form, amount: e.target.value })} className="h-13 px-4 rounded-2xl border border-input bg-background font-sans text-sm outline-none" data-testid="debt-amount-input" />
                        <input placeholder="Catatan (opsional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="h-13 px-4 rounded-2xl border border-input bg-background font-sans text-sm outline-none" data-testid="debt-note-input" />
                        <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="h-13 px-4 rounded-2xl border border-input bg-background font-sans text-sm outline-none" data-testid="debt-due-input" />
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setForm({ open: false, type: "payable", person: "", amount: "", note: "", due_date: "" })} className="flex-1 h-12 rounded-full border border-border">
                                Batal
                            </button>
                            <button type="submit" data-testid="debt-save-btn" className="flex-1 h-12 rounded-full bg-brand-blue text-white font-bold">
                                Simpan
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </AppShell>
    );
};

const SummaryBlock = ({ label, amount, color, testId }) => (
    <div className="rounded-2xl p-4 bg-card border border-border">
        <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p data-testid={testId} className={`mt-1 font-display text-2xl font-extrabold ${color}`}>{formatIDR(amount)}</p>
    </div>
);

const DebtList = ({ items, onSettle, onDelete, color }) => (
    <div className="mt-3 space-y-2">
        {items.length === 0 && <p className="text-center text-sm text-muted-foreground py-6">Belum ada catatan</p>}
        {items.map((d) => (
            <div key={d.id} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border" data-testid={`debt-item-${d.id}`}>
                <span className="w-11 h-11 rounded-2xl grid place-items-center" style={{ background: color + "22", color }}>
                    <User className="w-5 h-5" strokeWidth={2.5} />
                </span>
                <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm font-bold truncate">{d.person}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                        {d.note || "—"}{d.due_date ? ` · Jatuh tempo ${d.due_date}` : ""}
                    </p>
                </div>
                <p className="font-display text-sm font-extrabold" style={{ color }}>{formatIDR(d.amount)}</p>
                <button onClick={() => onSettle(d.id)} className="w-8 h-8 rounded-full grid place-items-center text-brand-teal hover:bg-brand-teal/10" data-testid={`debt-settle-${d.id}`}>
                    <CheckCircle2 className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(d.id)} className="w-8 h-8 rounded-full grid place-items-center text-brand-coral hover:bg-brand-coral/10" data-testid={`debt-delete-${d.id}`}>
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        ))}
    </div>
);

export default DebtsPage;
