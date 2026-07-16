import React from "react";
import { Link } from "react-router-dom";
import { KantongKuLogo } from "@/components/KantongKuLogo";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicyPage = () => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto w-full max-w-md min-h-screen border-x border-border/40 bg-background px-5 pt-8 pb-10">
                <Link to="/" className="w-10 h-10 rounded-full grid place-items-center bg-card border border-border" data-testid="privacy-back-btn">
                    <ArrowLeft className="w-5 h-5" />
                </Link>

                <div className="mt-6 flex items-center gap-3">
                    <KantongKuLogo size={48} />
                    <div>
                        <h1 className="font-display text-2xl font-extrabold">Kebijakan Privasi</h1>
                        <p className="text-xs text-muted-foreground">Terakhir diperbarui: 1 Februari 2026</p>
                    </div>
                </div>

                <div className="mt-6 space-y-4 font-sans text-sm leading-relaxed">
                    <Section title="1. Pendahuluan">
                        KantongKu ("kami") berkomitmen melindungi privasi kamu ("Pengguna"). Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi kamu saat menggunakan aplikasi KantongKu — Asisten Keuangan AI.
                    </Section>
                    <Section title="2. Data yang Kami Kumpulkan">
                        Kami mengumpulkan data yang kamu masukkan secara sukarela: nama, email, transaksi keuangan (jumlah, kategori, catatan, dompet, foto struk opsional), utang & piutang, anggaran, dan preferensi tampilan. Kami tidak mengakses rekening bank kamu secara otomatis.
                    </Section>
                    <Section title="3. Penggunaan Data">
                        Data digunakan untuk menyediakan fitur inti aplikasi (pencatatan, analisis, kalender, anggaran), personalisasi pengalaman, dan menyimpan histori keuanganmu. Kami tidak menjual data pribadi kepada pihak ketiga.
                    </Section>
                    <Section title="4. Penyimpanan & Keamanan">
                        Data disimpan pada server yang terenkripsi. Kata sandi di-hash dengan algoritma bcrypt. Kami menerapkan langkah-langkah keamanan yang wajar untuk mencegah akses tidak sah.
                    </Section>
                    <Section title="5. Berbagi Data">
                        Kami hanya berbagi data ketika: (a) diwajibkan hukum, (b) dengan penyedia layanan pihak ketiga yang terikat kontrak (seperti hosting), (c) untuk melindungi hak & keamanan pengguna.
                    </Section>
                    <Section title="6. Hak Pengguna">
                        Kamu berhak: (a) mengakses data pribadi, (b) memperbarui atau menghapus akun, (c) meminta ekspor data, (d) mencabut persetujuan kapan saja dengan menghubungi kami.
                    </Section>
                    <Section title="7. Anak di Bawah Umur">
                        Layanan tidak ditujukan untuk anak di bawah 13 tahun. Kami tidak dengan sengaja mengumpulkan data anak di bawah umur.
                    </Section>
                    <Section title="8. Perubahan Kebijakan">
                        Kebijakan ini dapat diperbarui. Perubahan signifikan akan diinformasikan melalui aplikasi. Melanjutkan penggunaan setelah perubahan dianggap sebagai persetujuan.
                    </Section>
                    <Section title="9. Kontak">
                        Pertanyaan atau permintaan privasi dapat dikirim ke: <span className="font-bold">privacy@kantongku.app</span>
                    </Section>
                </div>

                <p className="mt-8 text-center text-xs text-muted-foreground">© 2026 KantongKu. Hak cipta dilindungi.</p>
            </div>
        </div>
    );
};

const Section = ({ title, children }) => (
    <div>
        <h2 className="font-display text-base font-bold">{title}</h2>
        <p className="mt-1 text-muted-foreground">{children}</p>
    </div>
);

export default PrivacyPolicyPage;
