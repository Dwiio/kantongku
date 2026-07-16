import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { api, formatApiErrorDetail } from "@/lib/api";
import { CATEGORIES } from "@/lib/categories";
import { toast } from "sonner";
import { ArrowLeft, Camera, X } from "lucide-react";

const AddTransactionPage = () => {
    const nav = useNavigate();
    const [wallets, setWallets] = useState([]);
    const [type, setType] = useState("expense");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("Makanan");
    const [note, setNote] = useState("");
    const [walletId, setWalletId] = useState("");
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16));
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get("/wallets").then((r) => {
            setWallets(r.data.wallets);
            if (r.data.wallets[0]) setWalletId(r.data.wallets[0].id);
        });
    }, []);

    useEffect(() => {
        const first = CATEGORIES[type][0];
        if (first) setCategory(first.key);
    }, [type]);

    const onFile = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (f.size > 2 * 1024 * 1024) { toast.error("Foto maksimal 2MB"); return; }
        const reader = new FileReader();
        reader.onload = () => setPhoto(reader.result);
        reader.readAsDataURL(f);
    };

    const submit = async (e) => {
        e.preventDefault();
        const amt = Number(String(amount).replace(/[^\d]/g, ""));
        if (!amt || amt <= 0) { toast.error("Jumlah tidak valid"); return; }
        if (!walletId) { toast.error("Pilih dompet"); return; }
        setLoading(true);
        try {
            await api.post("/transactions", {
                wallet_id: walletId,
                type,
                amount: amt,
                category,
                note,
                date: new Date(date).toISOString(),
                photo,
            });
            toast.success("Transaksi tersimpan");
            nav("/dashboard");
        } catch (err) {
            toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Gagal menyimpan");
        } finally {
            setLoading(false);
        }
    };

    const formatAmountInput = (v) => {
        const digits = String(v).replace(/[^\d]/g, "");
        if (!digits) return "";
        return new Intl.NumberFormat("id-ID").format(Number(digits));
    };

    return (
        <AppShell showNav={false}>
            <div className="px-5 pt-8 pb-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => nav(-1)} className="w-10 h-10 rounded-full grid place-items-center bg-card border border-border" data-testid="add-tx-back-btn">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="font-display text-2xl font-extrabold">Catat Transaksi</h1>
                </div>

                {/* Type toggle */}
                <div className="mt-6 grid grid-cols-2 rounded-full bg-muted p-1">
                    {["expense", "income"].map((t) => (
                        <button
                            key={t}
                            onClick={() => setType(t)}
                            data-testid={`add-tx-type-${t}`}
                            className={`h-11 rounded-full font-sans text-sm font-bold transition-colors ${
                                type === t
                                    ? t === "income"
                                        ? "bg-brand-teal text-white"
                                        : "bg-brand-coral text-white"
                                    : "text-muted-foreground"
                            }`}
                        >
                            {t === "income" ? "Pemasukan" : "Pengeluaran"}
                        </button>
                    ))}
                </div>

                <form className="mt-6 flex flex-col gap-4" onSubmit={submit}>
                    {/* Amount */}
                    <div>
                        <span className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Jumlah</span>
                        <div className="mt-1.5 flex items-center gap-2 px-4 py-4 rounded-2xl bg-card border border-border">
                            <span className="font-display text-2xl font-bold text-muted-foreground">Rp</span>
                            <input
                                data-testid="add-tx-amount-input"
                                inputMode="numeric"
                                value={amount}
                                onChange={(e) => setAmount(formatAmountInput(e.target.value))}
                                placeholder="0"
                                className="w-full bg-transparent outline-none font-display text-2xl font-extrabold"
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <span className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Kategori</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {CATEGORIES[type].map((c) => (
                                <button
                                    key={c.key}
                                    type="button"
                                    onClick={() => setCategory(c.key)}
                                    data-testid={`add-tx-cat-${c.key}`}
                                    className={`px-3 py-2 rounded-full font-sans text-xs font-bold border transition-colors ${
                                        category === c.key
                                            ? "border-transparent text-white"
                                            : "border-border bg-card text-foreground"
                                    }`}
                                    style={category === c.key ? { background: c.color } : {}}
                                >
                                    {c.key}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Wallet */}
                    <div>
                        <span className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Dompet</span>
                        <select
                            data-testid="add-tx-wallet-select"
                            value={walletId}
                            onChange={(e) => setWalletId(e.target.value)}
                            className="mt-1.5 w-full h-13 px-4 rounded-2xl border border-input bg-card font-sans text-base outline-none"
                        >
                            {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <span className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Tanggal & Waktu</span>
                        <input
                            data-testid="add-tx-date-input"
                            type="datetime-local"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="mt-1.5 w-full h-13 px-4 rounded-2xl border border-input bg-card font-sans text-base outline-none"
                        />
                    </div>

                    {/* Note */}
                    <div>
                        <span className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Catatan</span>
                        <input
                            data-testid="add-tx-note-input"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Contoh: Makan siang di kantor"
                            className="mt-1.5 w-full h-13 px-4 rounded-2xl border border-input bg-card font-sans text-base outline-none"
                        />
                    </div>

                    {/* Photo */}
                    <div>
                        <span className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Foto Struk</span>
                        {photo ? (
                            <div className="mt-1.5 relative">
                                <img src={photo} alt="struk" className="w-full h-40 object-cover rounded-2xl border border-border" />
                                <button type="button" onClick={() => setPhoto(null)} className="absolute top-2 right-2 w-8 h-8 rounded-full grid place-items-center bg-black/60 text-white" data-testid="add-tx-remove-photo">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <label className="mt-1.5 flex items-center justify-center gap-2 h-24 rounded-2xl border-2 border-dashed border-border bg-card cursor-pointer">
                                <Camera className="w-5 h-5 text-muted-foreground" />
                                <span className="font-sans text-sm text-muted-foreground">Tambah foto</span>
                                <input data-testid="add-tx-photo-input" type="file" accept="image/*" className="hidden" onChange={onFile} />
                            </label>
                        )}
                    </div>

                    <button
                        type="submit"
                        data-testid="add-tx-submit-btn"
                        disabled={loading}
                        className="mt-2 w-full h-14 rounded-full text-white font-bold shadow-[0_10px_25px_rgba(44,98,181,0.35)] disabled:opacity-60 active:scale-95 transition-transform"
                        style={{ background: "linear-gradient(135deg,#2C62B5,#14B8A6)" }}
                    >
                        {loading ? "Menyimpan..." : "Simpan"}
                    </button>
                </form>
            </div>
        </AppShell>
    );
};

export default AddTransactionPage;
