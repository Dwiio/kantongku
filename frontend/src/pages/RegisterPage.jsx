import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { KantongKuLogo } from "@/components/KantongKuLogo";
import { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from "lucide-react";

const RegisterPage = () => {
    const { register } = useAuth();
    const nav = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            toast.error("Kata sandi minimal 6 karakter");
            return;
        }
        setLoading(true);
        try {
            await register(name, email, password);
            toast.success("Akun berhasil dibuat");
            nav("/dashboard", { replace: true });
        } catch (err) {
            toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Gagal daftar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto w-full max-w-md min-h-screen border-x border-border/40 bg-background px-6 pt-8 pb-10 flex flex-col">
                <Link to="/" className="w-10 h-10 rounded-full grid place-items-center bg-card border border-border" data-testid="register-back-btn">
                    <ArrowLeft className="w-5 h-5" />
                </Link>

                <div className="mt-6 flex items-center gap-3">
                    <KantongKuLogo size={64} />
                    <div>
                        <h1 className="font-display text-3xl font-extrabold tracking-tight">Daftar</h1>
                        <p className="font-sans text-sm text-muted-foreground">Mulai kelola keuanganmu</p>
                    </div>
                </div>

                <form className="mt-8 flex flex-col gap-4" onSubmit={submit}>
                    <Field icon={<User className="w-4 h-4" />} label="Nama" testId="register-name-input" value={name} onChange={setName} placeholder="Nama lengkap" />
                    <Field icon={<Mail className="w-4 h-4" />} label="Email" type="email" testId="register-email-input" value={email} onChange={setEmail} placeholder="nama@email.com" />
                    <div className="block">
                        <span className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Kata Sandi</span>
                        <div className="mt-1.5 relative">
                            <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                data-testid="register-password-input"
                                type={showPw ? "text" : "password"}
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Minimal 6 karakter"
                                className="w-full h-13 pl-11 pr-12 py-3.5 rounded-2xl border border-input bg-card font-sans text-base outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-colors"
                            />
                            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        data-testid="register-submit-btn"
                        disabled={loading}
                        className="mt-2 w-full h-14 rounded-full text-white font-bold font-sans shadow-[0_10px_25px_rgba(44,98,181,0.35)] disabled:opacity-60 active:scale-95 transition-transform"
                        style={{ background: "linear-gradient(135deg,#2C62B5,#14B8A6)" }}
                    >
                        {loading ? "Memproses..." : "Buat Akun"}
                    </button>
                </form>

                <div className="mt-auto pt-8 text-center font-sans text-sm">
                    Sudah punya akun?{" "}
                    <Link to="/masuk" className="font-bold text-brand-blue dark:text-brand-teal" data-testid="register-goto-login">Masuk</Link>
                </div>
            </div>
        </div>
    );
};

const Field = ({ icon, label, type = "text", value, onChange, placeholder, testId }) => (
    <label className="block">
        <span className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className="mt-1.5 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
            <input
                data-testid={testId}
                type={type}
                required
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-13 pl-11 pr-4 py-3.5 rounded-2xl border border-input bg-card font-sans text-base outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-colors"
            />
        </div>
    </label>
);

export default RegisterPage;
