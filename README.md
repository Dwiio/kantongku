# KantongKu - Asisten Keuangan AI & Manajemen Multi-Dompet

KantongKu adalah aplikasi manajemen keuangan pintar berbasis web yang dioptimalkan secara penuh untuk perangkat seluler (*mobile-first*). Aplikasi ini dirancang agar siap dibungkus menjadi paket aplikasi Android (`.aab`/`.apk`) menggunakan PWA Builder atau Bubblewrap untuk dipublikasikan di Google Play Store.

Aplikasi ini mengusung tema visual modern berbasis logo *Denim Pocket* dengan dukungan penuh Mode Gelap (*Dark Mode*) serta model bisnis *Freemium* yang terintegrasi.

---

## 🚀 Fitur Utama

### 1. Manajemen Multi-Dompet & Pembukuan Ganda
*   Mendukung banyak akun dompet: Tunai, Kartu, Bank, Tabungan, dan Investasi.
*   Akumulasi saldo utama secara dinamis dari seluruh dompet aktif.
*   Pembatasan alur akun: Pengguna gratis maksimal 2 dompet, pengguna **Pro/Premium** tanpa batas.

### 2. Kalender Keuangan & Linimasa Harian
*   Tampilan grid kalender bulanan dengan indikator pemasukan (hijau) dan pengeluaran (merah) harian.
*   Linimasa transaksi yang dikelompokkan rapi berdasarkan kartu tanggal kartu.
*   Dukungan lampiran gambar/kuitansi fisik untuk setiap riwayat transaksi.

### 3. Perencana Anggaran & Analisis Interaktif
*   Batas anggaran (*threshold*) bulanan/tahunan per kategori dengan indikator visual otomatis berubah menjadi Merah Coral dan memicu peringatan "Melebihi Anggaran".
*   Grafik lingkaran (*Pie Chart*) interaktif untuk membedakan persentase struktur pengeluaran (Makanan, Rental, Hiburan, dll.).

### 4. Pelacak Utang & Piutang
*   Ledger terpisah menjadi dua tab fungsional: **Untuk Dibayar** (utang Anda) dan **Untuk Diterima** (piutang dari orang lain).

### 5. Mode Gelap Dinamis (*Dynamic Dark Mode*)
*   Tombol toggle ikon Matahari/Bulan yang mengubah tema secara instan tanpa memutus sesi pengguna.
*   Preferensi tema tersimpan otomatis di penyimpanan lokal (*local storage* browser).

---

## 🛠️ Teknologi yang Digunakan

*   **Frontend**: React.js / Next.js (Tailwind CSS untuk *styling* responsif)
*   **Backend**: Python (Flask / FastAPI) atau Node.js
*   **Fitur Pro**: PWA Service Worker + `manifest.json` untuk kapabilitas luring (*offline caching*)

---

## 💻 Panduan Instalasi Lokal

### Prasyarat
Pastikan Anda sudah menginstal Node.js dan Python/Package Manager yang sesuai di komputer Anda.

1. **Clone Repositori:**
   ```bash
   git clone [https://github.com/USERNAME/kantongku.git](https://github.com/dwiio/kantongku.git)
   cd kantongku
