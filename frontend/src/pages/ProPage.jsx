import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/context/AuthContext";
import { api, formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, Crown, Check, X, QrCode, Landmark, Sparkles, Zap } from "lucide-react";

const FEATURES = [
    "Dompet tanpa batas (Cash, Bank, E-Wallet, Kartu, Tabungan, Investasi)",
    "Analisis lanjutan tanpa batas laporan",
    "Ekspor data ke CSV / PDF",
    "Sinkronisasi cloud + backup otomatis",
    "Badge PRO emas di profil",
    "Prioritas dukungan pelanggan",
];

const ProPage = () => {
    const nav = useNavigate();
    const { user, setUser, refresh } = useAuth();
    const [checkout, setCheckout] = useState(null); // "qris" | "bank_transfer" | null
    const [processing, setProcessing] = useState(false);
    const [payCfg, setPayCfg] = useState(null); // { provider, client_key, is_production }

    useEffect(() => {
        api.get("/payments/config").then((r) => setPayCfg(r.data)).catch(() => setPayCfg({ provider: "simulation" }));
    }, []);

    // Inject Midtrans Snap script when real provider is active
    useEffect(() => {
        if (!payCfg || payCfg.provider !== "midtrans") return;
        if (document.getElementById("midtrans-snap-js")) return;
        const s = document.createElement("script");
        s.id = "midtrans-snap-js";
        s.src = payCfg.is_production
            ? "https://app.midtrans.com/snap/snap.js"
            : "https://app.sandbox.midtrans.com/snap/snap.js";
        s.setAttribute("data-client-key", payCfg.client_key || "");
        s.async = true;
        document.body.appendChild(s);
    }, [payCfg]);

    const payWithMidtrans = async () => {
        setProcessing(true);
        try {
            const { data } = await api.post("/payments/snap-token");
            if (!window.snap) {
                toast.error("Snap belum termuat. Coba lagi.");
                return;
            }
            window.snap.pay(data.token, {
                onSuccess: async () => {
                    toast.success("Pembayaran berhasil. Aktivasi PRO…");
                    // webhook will mark premium; poll /me a few times
                    for (let i = 0; i < 6; i++) {
                        await new Promise((r) => setTimeout(r, 1500));
                        await refresh();
                        if (user?.role === "premium") break;
                    }
                    setCheckout(null);
                    nav("/profil");
                },
                onPending: () => toast.info("Menunggu pembayaran…"),
                onError: () => toast.error("Pembayaran gagal"),
                onClose: () => setProcessing(false),
            });
        } catch (err) {
            toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Gagal memulai pembayaran");
        } finally {
            setProcessing(false);
        }
    };

    const simulate = async (method) => {
        setProcessing(true);
        try {
            await new Promise((r) => setTimeout(r, 1600));
            const { data } = await api.post("/premium/simulate-payment", { method });
            setUser(data.user);
            toast.success("Selamat! Kamu sekarang PRO 🎉");
            setCheckout(null);
            setTimeout(() => nav("/profil"), 400);
        } catch (err) {
            toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Gagal");
        } finally {
            setProcessing(false);
        }
    };

    const isPro = user?.role === "premium";
    const usingMidtrans = payCfg?.provider === "midtrans";

    return (
        <AppShell showNav={false}>
            <div className="relative px-5 pt-8 pb-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => nav(-1)} className="w-10 h-10 rounded-full grid place-items-center bg-card border border-border" data-testid="pro-back-btn">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="font-display text-2xl font-extrabold">KantongKu Pro</h1>
                </div>

                {/* Hero */}
                <div className="mt-6 relative rounded-3xl p-6 text-white overflow-hidden" style={{ background: "linear-gradient(135deg,#F59E0B 0%,#EF4444 100%)" }}>
                    <Crown className="absolute -right-4 -top-4 w-40 h-40 text-white/10" />
                    <div className="relative flex items-center gap-2 text-white/85">
                        <Sparkles className="w-4 h-4" />
                        <span className="font-sans text-[10px] font-bold uppercase tracking-widest">Paket Premium</span>
                    </div>
                    <p className="relative mt-2 font-display text-3xl font-extrabold">Kelola lebih banyak, tanpa batas</p>
                    <div className="relative mt-3 flex items-baseline gap-1">
                        <span className="font-display text-4xl font-extrabold">Rp 29.000</span>
                        <span className="font-sans text-sm opacity-90">/bulan</span>
                    </div>
                </div>

                {/* Features */}
                <div className="mt-4 rounded-3xl bg-card border border-border p-4">
                    {FEATURES.map((f) => (
                        <div key={f} className="flex items-start gap-3 py-2.5 border-b last:border-b-0 border-border/60">
                            <Check className="w-5 h-5 shrink-0 text-brand-teal mt-0.5" strokeWidth={3} />
                            <p className="font-sans text-sm">{f}</p>
                        </div>
                    ))}
                </div>

                {isPro ? (
                    <div data-testid="pro-already-active" className="mt-6 rounded-2xl p-4 bg-brand-teal/10 border border-brand-teal/30 text-center">
                        <p className="font-display text-lg font-bold text-brand-teal">Kamu sudah PRO 🎉</p>
                        <p className="text-xs text-muted-foreground mt-1">Terima kasih telah mendukung KantongKu</p>
                    </div>
                ) : (
                    <>
                        {usingMidtrans ? (
                            <div className="mt-6">
                                <div className="rounded-2xl p-3 bg-brand-teal/10 border border-brand-teal/30 flex items-center gap-2 mb-3">
                                    <Zap className="w-4 h-4 text-brand-teal" />
                                    <p className="text-xs font-bold text-brand-teal">Pembayaran real via Midtrans {payCfg.is_production ? "(Production)" : "(Sandbox)"}</p>
                                </div>
                                <button
                                    onClick={payWithMidtrans}
                                    disabled={processing}
                                    data-testid="pro-pay-midtrans"
                                    className="w-full h-14 rounded-full text-white font-bold shadow-[0_10px_25px_rgba(20,184,166,0.4)] active:scale-95 transition-transform disabled:opacity-60"
                                    style={{ background: "linear-gradient(135deg,#14B8A6,#2C62B5)" }}
                                >
                                    {processing ? "Membuka pembayaran…" : "Bayar Sekarang · Rp 29.000"}
                                </button>
                                <p className="mt-2 text-[11px] text-center text-muted-foreground">Menggunakan QRIS, VA, GoPay, ShopeePay, kartu kredit — semua via Midtrans.</p>
                            </div>
                        ) : (
                            <>
                                <p className="mt-6 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Pilih Metode Pembayaran</p>
                                <p className="text-[11px] text-muted-foreground">Mode simulasi aktif. Aktifkan Midtrans dari env untuk pembayaran nyata.</p>
                                <div className="mt-2 grid grid-cols-2 gap-3">
                                    <button onClick={() => setCheckout("qris")} data-testid="pro-pay-qris" className="rounded-2xl p-4 bg-card border border-border active:scale-95 transition-transform">
                                        <QrCode className="w-6 h-6 text-brand-blue" strokeWidth={2.5} />
                                        <p className="mt-2 font-sans text-sm font-bold">QRIS</p>
                                        <p className="text-[10px] text-muted-foreground">Scan & bayar</p>
                                    </button>
                                    <button onClick={() => setCheckout("bank_transfer")} data-testid="pro-pay-bank" className="rounded-2xl p-4 bg-card border border-border active:scale-95 transition-transform">
                                        <Landmark className="w-6 h-6 text-brand-teal" strokeWidth={2.5} />
                                        <p className="mt-2 font-sans text-sm font-bold">Transfer Bank</p>
                                        <p className="text-[10px] text-muted-foreground">BCA / Mandiri / BNI</p>
                                    </button>
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* Checkout modal (simulation) */}
                {checkout && !usingMidtrans && (
                    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" data-testid="pro-checkout-modal">
                        <div className="w-full max-w-sm rounded-3xl bg-card p-6 border border-border">
                            <div className="flex items-center justify-between">
                                <p className="font-display text-lg font-bold">{checkout === "qris" ? "Pembayaran QRIS" : "Transfer Bank"}</p>
                                <button onClick={() => setCheckout(null)} className="w-8 h-8 rounded-full grid place-items-center bg-muted" data-testid="pro-checkout-close">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">Rp 29.000 · KantongKu Pro</p>

                            {checkout === "qris" ? (
                                <div className="mt-4 rounded-2xl bg-white p-4 grid place-items-center">
                                    <QRISMock />
                                </div>
                            ) : (
                                <div className="mt-4 rounded-2xl bg-muted p-4">
                                    <p className="text-xs text-muted-foreground">Rekening tujuan</p>
                                    <p className="font-display text-lg font-bold mt-1">BCA · 1234 5678 9012</p>
                                    <p className="text-xs">a.n. KantongKu Indonesia</p>
                                    <div className="mt-3 pt-3 border-t border-border">
                                        <p className="text-xs text-muted-foreground">Kode unik</p>
                                        <p className="font-display text-lg font-bold">Rp 29.017</p>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => simulate(checkout)}
                                disabled={processing}
                                data-testid="pro-simulate-success-btn"
                                className="mt-4 w-full h-13 py-3 rounded-full text-white font-bold shadow-[0_10px_25px_rgba(20,184,166,0.4)] active:scale-95 transition-transform disabled:opacity-60"
                                style={{ background: "linear-gradient(135deg,#14B8A6,#0EA5A0)" }}
                            >
                                {processing ? "Memverifikasi pembayaran…" : "Simulate Successful Payment"}
                            </button>
                            <p className="mt-2 text-[10px] text-center text-muted-foreground">Simulasi lokal — tidak ada biaya nyata.</p>
                        </div>
                    </div>
                )}
            </div>
        </AppShell>
    );
};

// simple QR grid mock
const QRISMock = () => {
    const cells = 21;
    const bits = [];
    let s = 12345;
    const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    for (let i = 0; i < cells * cells; i++) bits.push(rand() > 0.5 ? 1 : 0);
    return (
        <div className="w-48 h-48 grid" style={{ gridTemplateColumns: `repeat(${cells}, 1fr)` }}>
            {bits.map((b, i) => {
                const r = Math.floor(i / cells), c = i % cells;
                const inTL = r < 7 && c < 7;
                const inTR = r < 7 && c > cells - 8;
                const inBL = r > cells - 8 && c < 7;
                if (inTL || inTR || inBL) {
                    const rr = r % 7, cc = c % 7;
                    const on = rr === 0 || rr === 6 || cc === 0 || cc === 6 || (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4);
                    return <div key={i} style={{ background: on ? "#000" : "#fff" }} />;
                }
                return <div key={i} style={{ background: b ? "#000" : "#fff" }} />;
            })}
        </div>
    );
};

export default ProPage;
