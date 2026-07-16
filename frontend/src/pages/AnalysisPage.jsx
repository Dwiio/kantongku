import React, { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";
import { formatIDR, formatIDRCompact } from "@/lib/format";
import { findCategory } from "@/lib/categories";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const AnalysisPage = () => {
    const [txs, setTxs] = useState([]);
    const [type, setType] = useState("expense");
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        api.get("/transactions").then((r) => setTxs(r.data.transactions));
    }, []);

    const { data, total } = useMemo(() => {
        const now = new Date();
        const monthly = txs.filter((t) => {
            const d = new Date(t.date);
            return t.type === type && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        const map = new Map();
        for (const t of monthly) map.set(t.category, (map.get(t.category) || 0) + t.amount);
        const total = Array.from(map.values()).reduce((a, b) => a + b, 0);
        const data = Array.from(map.entries()).map(([category, value]) => {
            const c = findCategory(type, category);
            return { name: category, value, color: c.color, pct: total ? (value / total) * 100 : 0 };
        }).sort((a, b) => b.value - a.value);
        return { data, total };
    }, [txs, type]);

    const filtered = useMemo(() => {
        if (!selected) return [];
        const now = new Date();
        return txs.filter((t) =>
            t.type === type &&
            t.category === selected &&
            new Date(t.date).getMonth() === now.getMonth() &&
            new Date(t.date).getFullYear() === now.getFullYear()
        );
    }, [selected, txs, type]);

    return (
        <AppShell>
            <div className="px-5 pt-8">
                <h1 className="font-display text-3xl font-extrabold tracking-tight">Dapatkan Analisis</h1>
                <p className="font-sans text-sm text-muted-foreground">Struktur keuanganmu bulan ini</p>

                {/* Type toggle */}
                <div className="mt-5 grid grid-cols-2 rounded-full bg-muted p-1">
                    {["expense", "income"].map((t) => (
                        <button
                            key={t}
                            onClick={() => { setType(t); setSelected(null); }}
                            data-testid={`analysis-type-${t}`}
                            className={`h-11 rounded-full font-sans text-sm font-bold transition-colors ${
                                type === t ? (t === "income" ? "bg-brand-teal text-white" : "bg-brand-coral text-white") : "text-muted-foreground"
                            }`}
                        >
                            {t === "income" ? "Pemasukan" : "Pengeluaran"}
                        </button>
                    ))}
                </div>

                {/* Chart */}
                <div className="mt-6 rounded-3xl bg-card border border-border p-5">
                    <p className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Struktur {type === "income" ? "Pemasukan" : "Pengeluaran"}</p>
                    <div className="relative h-64">
                        {data.length === 0 ? (
                            <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">Belum ada data</div>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data}
                                            dataKey="value"
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={2}
                                            stroke="none"
                                            onClick={(d) => setSelected(d.name)}
                                        >
                                            {data.map((d, i) => (
                                                <Cell key={i} fill={d.color} cursor="pointer" opacity={selected && selected !== d.name ? 0.35 : 1} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 grid place-items-center pointer-events-none">
                                    <div className="text-center">
                                        <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total</p>
                                        <p className="font-display text-xl font-extrabold">{formatIDRCompact(total)}</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Legend */}
                    <div className="mt-4 space-y-2">
                        {data.map((d) => (
                            <button
                                key={d.name}
                                onClick={() => setSelected(selected === d.name ? null : d.name)}
                                data-testid={`analysis-legend-${d.name}`}
                                className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors ${selected === d.name ? "bg-muted" : ""}`}
                            >
                                <span className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                                <span className="font-sans text-sm font-bold flex-1 text-left">{d.name}</span>
                                <span className="font-sans text-xs text-muted-foreground">{d.pct.toFixed(1)}%</span>
                                <span className="font-sans text-sm font-bold">{formatIDRCompact(d.value)}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filtered list */}
                {selected && (
                    <div className="mt-5">
                        <div className="flex items-center justify-between">
                            <h3 className="font-display text-lg font-bold">Detail {selected}</h3>
                            <button onClick={() => setSelected(null)} className="text-xs font-bold text-brand-blue dark:text-brand-teal" data-testid="analysis-clear-filter">Reset</button>
                        </div>
                        <div className="mt-2 space-y-2">
                            {filtered.map((t) => (
                                <div key={t.id} className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border">
                                    <div>
                                        <p className="font-sans text-sm font-bold">{t.note || t.category}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString("id-ID")}</p>
                                    </div>
                                    <p className={`font-sans text-sm font-extrabold ${t.type === "income" ? "text-brand-teal" : "text-brand-coral"}`}>
                                        {t.type === "income" ? "+" : "−"} {formatIDR(t.amount)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppShell>
    );
};

export default AnalysisPage;
