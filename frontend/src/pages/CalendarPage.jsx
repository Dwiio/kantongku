import React, { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";
import { formatIDRCompact, monthLabelLong, dateKey } from "@/lib/format";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAY_HEADERS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const CalendarPage = () => {
    const [current, setCurrent] = useState(new Date());
    const [txs, setTxs] = useState([]);

    useEffect(() => {
        api.get("/transactions").then((r) => setTxs(r.data.transactions));
    }, []);

    const { grid, byDay, monthIncome, monthExpense } = useMemo(() => {
        const year = current.getFullYear();
        const month = current.getMonth();
        const first = new Date(year, month, 1);
        const last = new Date(year, month + 1, 0);
        // Monday-start
        const startWeekday = (first.getDay() + 6) % 7;
        const daysInMonth = last.getDate();

        const cells = [];
        for (let i = 0; i < startWeekday; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
        while (cells.length % 7 !== 0) cells.push(null);

        const map = new Map();
        let mi = 0, me = 0;
        for (const t of txs) {
            const d = new Date(t.date);
            if (d.getFullYear() !== year || d.getMonth() !== month) continue;
            const k = dateKey(t.date);
            if (!map.has(k)) map.set(k, { income: 0, expense: 0, count: 0 });
            const rec = map.get(k);
            if (t.type === "income") { rec.income += t.amount; mi += t.amount; }
            else { rec.expense += t.amount; me += t.amount; }
            rec.count += 1;
        }
        return { grid: cells, byDay: map, monthIncome: mi, monthExpense: me };
    }, [current, txs]);

    const shift = (delta) => setCurrent(new Date(current.getFullYear(), current.getMonth() + delta, 1));
    const netTotal = monthIncome - monthExpense;

    return (
        <AppShell>
            <div className="px-5 pt-8">
                <h1 className="font-display text-3xl font-extrabold tracking-tight">Kalender Keuangan</h1>
                <p className="font-sans text-sm text-muted-foreground">Pantau arus per hari</p>

                {/* Month header */}
                <div className="mt-5 flex items-center justify-between rounded-2xl bg-card border border-border p-3">
                    <button onClick={() => shift(-1)} className="w-9 h-9 rounded-full grid place-items-center hover:bg-muted" data-testid="calendar-prev-month">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <p data-testid="calendar-month-label" className="font-display text-lg font-bold">{monthLabelLong(current)}</p>
                    <button onClick={() => shift(1)} className="w-9 h-9 rounded-full grid place-items-center hover:bg-muted" data-testid="calendar-next-month">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Summary block */}
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <Sum label="Pendapatan" value={monthIncome} color="text-brand-teal" testId="calendar-total-income" />
                    <Sum label="Pengeluaran" value={monthExpense} color="text-brand-coral" testId="calendar-total-expense" />
                    <Sum label="Total" value={netTotal} color={netTotal >= 0 ? "text-brand-blue dark:text-white" : "text-brand-coral"} testId="calendar-total-net" />
                </div>

                {/* Weekday header */}
                <div className="mt-5 grid grid-cols-7 gap-1 text-center">
                    {DAY_HEADERS.map((d) => (
                        <span key={d} className="font-sans text-[10px] font-bold text-muted-foreground uppercase">{d}</span>
                    ))}
                </div>

                {/* Grid */}
                <div className="mt-2 grid grid-cols-7 gap-1">
                    {grid.map((d, i) => {
                        if (!d) return <div key={i} className="aspect-square" />;
                        const k = dateKey(d.toISOString());
                        const rec = byDay.get(k);
                        const isToday = k === dateKey(new Date().toISOString());
                        return (
                            <div
                                key={i}
                                data-testid={`calendar-day-${d.getDate()}`}
                                className={`aspect-square flex flex-col items-start p-1.5 rounded-lg border ${
                                    isToday ? "border-brand-blue bg-brand-blue/5" : "border-border/50 bg-card/50"
                                }`}
                            >
                                <span className={`text-[11px] font-bold ${isToday ? "text-brand-blue dark:text-brand-teal" : ""}`}>{d.getDate()}</span>
                                {rec && (
                                    <div className="mt-auto w-full flex flex-col gap-0.5">
                                        {rec.income > 0 && <span className="text-[9px] leading-none font-bold text-brand-teal truncate">+{formatIDRCompact(rec.income)}</span>}
                                        {rec.expense > 0 && <span className="text-[9px] leading-none font-bold text-brand-coral truncate">−{formatIDRCompact(rec.expense)}</span>}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </AppShell>
    );
};

const Sum = ({ label, value, color, testId }) => (
    <div className="rounded-2xl p-3 bg-card border border-border">
        <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p data-testid={testId} className={`mt-1 font-display text-sm font-extrabold ${color}`}>{formatIDRCompact(value)}</p>
    </div>
);

export default CalendarPage;
