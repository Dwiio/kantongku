import React from "react";
import { Link } from "react-router-dom";
import { KantongKuLogo } from "@/components/KantongKuLogo";
import { ArrowRight, Sparkles, ShieldCheck, TrendingUp } from "lucide-react";

const SplashPage = () => {
    return (
        <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
            <div className="fixed inset-0 grid-noise pointer-events-none" />
            <div className="relative mx-auto w-full max-w-md min-h-screen border-x border-border/40 bg-background flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
                    <div className="relative">
                        <div className="absolute inset-0 blur-3xl bg-brand-teal/30 rounded-full" />
                        <div className="relative animate-fade-up">
                            <KantongKuLogo size={140} />
                        </div>
                    </div>
                    <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
                        <h1 className="font-display text-5xl font-extrabold tracking-tight text-brand-blue dark:text-white">
                            KantongKu
                        </h1>
                        <p className="mt-2 font-sans text-base text-muted-foreground">
                            Asisten Keuangan AI • Cerdas • Sederhana
                        </p>
                    </div>

                    <div className="w-full flex flex-col gap-3 mt-2 animate-fade-up" style={{ animationDelay: "160ms" }}>
                        <Feature icon={<Sparkles className="w-4 h-4" />} text="Catat & lacak keuangan harian" />
                        <Feature icon={<TrendingUp className="w-4 h-4" />} text="Analisis pintar & anggaran otomatis" />
                        <Feature icon={<ShieldCheck className="w-4 h-4" />} text="Aman & privasi terjaga" />
                    </div>
                </div>

                <div className="px-6 pb-10 flex flex-col gap-3 animate-fade-up" style={{ animationDelay: "240ms" }}>
                    <Link
                        to="/masuk"
                        data-testid="splash-login-btn"
                        className="w-full h-14 grid place-items-center rounded-full text-white font-bold font-sans text-base shadow-[0_10px_25px_rgba(44,98,181,0.35)] active:scale-95 transition-transform"
                        style={{ background: "linear-gradient(135deg,#2C62B5,#14B8A6)" }}
                    >
                        <span className="flex items-center gap-2">Mulai Sekarang <ArrowRight className="w-5 h-5" /></span>
                    </Link>
                    <Link
                        to="/daftar"
                        data-testid="splash-register-btn"
                        className="w-full h-14 grid place-items-center rounded-full font-bold font-sans text-base border-2 border-brand-blue/20 text-brand-blue dark:text-white dark:border-white/20 active:scale-95 transition-transform"
                    >
                        Buat Akun Baru
                    </Link>
                    <Link to="/privacy-policy" className="text-center text-xs text-muted-foreground pt-2 underline underline-offset-4" data-testid="splash-privacy-link">
                        Kebijakan Privasi
                    </Link>
                </div>
            </div>
        </div>
    );
};

const Feature = ({ icon, text }) => (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-border/60 text-left">
        <span className="w-8 h-8 rounded-full bg-brand-teal/15 text-brand-teal grid place-items-center">{icon}</span>
        <span className="font-sans text-sm font-medium">{text}</span>
    </div>
);

export default SplashPage;
