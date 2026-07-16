import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { KantongKuLogo } from "@/components/KantongKuLogo";
import { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";

const LoginPage = () => {
    const { login } = useAuth();
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success("Selamat datang kembali!");
            nav("/dashboard", { replace: true });
        } catch (err) {
            toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Gagal masuk");
        } finally {
            setLoading(false);
        }
    };

    const fillReviewer = () => {
        setEmail("reviewer@spendly.com");
        setPassword("ReviewerPassword123!");
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto w-full max-w-md min-h-screen border-x border-border/40 bg-background px-6 pt-8 pb-10 flex flex-col">
                <Link to="/" className="w-10 h-10 rounded-full grid place-items-center bg-card border border-border" data-testid="login-back-btn">
                    <ArrowLeft className="w-5 h-5" />
                </Link>

                <div className="mt-6 flex items-center gap-3">
                    <KantongKuLogo size={64} />
                    <div>
                        <h1 className="font-display text-3xl font-extrabold tracking-tight">Masuk</h1>
                        <p className="font-sans text-sm text-muted-foreground">ke KantongKu — Asisten Keuangan AI</p>
                    </div>
                </div>

                <form className="mt-8 flex flex-col gap-4" onSubmit={submit}>
                    <label className="block">
                        <span className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</span>
                        <div className="mt-1.5 relative">
                            <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                data-testid="login-email-input"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nama@email.com"
                                className="w-full h-13 pl-11 pr-4 py-3.5 rounded-2xl border border-input bg-card font-sans text-base outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-colors"
                            />
                        </div>
                    </label>

                    <label className="block">
                        <span className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Kata Sandi</span>
                        <div className="mt-1.5 relative">
                            <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                data-testid="login-password-input"
                                type={showPw ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full h-13 pl-11 pr-12 py-3.5 rounded-2xl border border-input bg-card font-sans text-base outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-colors"
                            />
                            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" data-testid="login-toggle-pw">
                                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </label>

                    <button
                        type="submit"
                        data-testid="login-submit-btn"
                        disabled={loading}
                        className="mt-2 w-full h-14 rounded-full text-white font-bold font-sans shadow-[0_10px_25px_rgba(44,98,181,0.35)] disabled:opacity-60 active:scale-95 transition-transform"
                        style={{ background: "linear-gradient(135deg,#2C62B5,#14B8A6)" }}
                    >
                        {loading ? "Memproses..." : "Masuk"}
                    </button>
                </form>

                <button
                    onClick={fillReviewer}
                    data-testid="login-reviewer-shortcut"
                    className="mt-4 text-xs text-center font-sans font-medium text-brand-blue dark:text-brand-teal underline underline-offset-4"
                >
                    Pakai akun demo (reviewer)
                </button>

                <div className="mt-auto pt-8 text-center font-sans text-sm">
                    Belum punya akun?{" "}
                    <Link to="/daftar" className="font-bold text-brand-blue dark:text-brand-teal" data-testid="login-goto-register">
                        Daftar
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
