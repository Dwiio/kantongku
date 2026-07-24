# 👛 KantongKu

**KantongKu** adalah aplikasi manajemen keuangan pribadi berbasis web full-stack yang dirancang untuk membantu pengguna mengelola transaksi, dompet, anggaran, hutang-piutang, serta menganalisis kesehatan finansial secara terstruktur dan intuitif.

---

## 🎬 Demo Video

Lihat demonstrasi penggunaan aplikasi KantongKu melalui video berikut:

[![Video Demo KantongKu](https://img.shields.io/badge/TikTok-Watch%20Demo%20Video-000000?style=for-the-badge&logo=tiktok&logoColor=white)](https://www.tiktok.com/@sudahtapibelum/video/7663509435741916437?is_from_webapp=1&sender_device=pc&web_id=7542002393333827080)

> 🔗 **Direct Link**: [Tonton Video Demo di TikTok](https://www.tiktok.com/@sudahtapibelum/video/7663509435741916437?is_from_webapp=1&sender_device=pc&web_id=7542002393333827080)

---

## 📋 Daftar Isi

- [Demo Video](#-demo-video)
- [Fitur Utama](#-fitur-utama)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Struktur Repositori](#-struktur-repositori)
- [Panduan Memulai](#-panduan-memulai)
  - [Prasyarat](#prasyarat)
  - [Langkah Instalasi](#langkah-instalasi)
- [Pengujian (Testing)](#-pengujian-testing)
- [Deployment](#-deployment)
- [Lisensi](#-lisensi)

---

## ✨ Fitur Utama

- 📊 **Dashboard & Ringkasan Keuangan** — Pantau alur kas masuk/keluar, saldo dompet, dan rekapitulasi harian/bulanan.
- 💳 **Manajemen Dompet (Wallets)** — Kelola beberapa akun/kantong penyimpanan uang (tunai, bank, e-wallet).
- 💸 **Pencatatan Transaksi & Kategori** — Tambah, edit, dan kategorikan transaksi pemasukan dan pengeluaran.
- 🎯 **Perencanaan Anggaran (Budgets)** — Atur batas pengeluaran per kategori untuk menjaga finansial tetap seimbang.
- 🤝 **Catatan Utang & Piutang (Debts)** — Lacak riwayat pinjaman uang beserta status pelunasannya.
- 📅 **Tampilan Kalender** — Visualisasi riwayat transaksi harian secara lebih rapi dan periodik.
- 📈 **Analisis & Laporan** — Grafik dan analisis mendalam mengenai pola pengeluaran pengguna.
- 🌓 **Tema Gelap/Terang (Dark/Light Mode)** — Dukungan mode tampilan yang fleksibel sesuai kenyamanan visual.

---

## 🧰 Teknologi yang Digunakan

### Frontend
- **Framework**: React.js
- **Styling**: Tailwind CSS & Shadcn UI Components
- **Build Tool / Config**: CRACO (Create React App Configuration Override)

### Backend
- **Framework**: Python (FastAPI / Server.py)
- **Testing**: Pytest

### Infrastructure & Config
- **Deployment Platform**: Vercel (`vercel.json`)
- **Cron Jobs**: Emergent scripts & shell automation

---

## 📁 Struktur Repositori

```text
kantongku-main/
├── backend/                  # Application backend (Python / Server API)
│   ├── tests/                # Unit & integration tests for backend
│   ├── pytest.ini            # Pytest configuration
│   ├── requirements.txt      # Python backend dependencies
│   └── server.py             # Main backend application entry point
├── frontend/                 # Application frontend (React.js)
│   ├── public/               # Public assets, icons, HTML template, manifest
│   ├── src/                  # Source code React
│   │   ├── components/       # Reusable components & UI Library
│   │   ├── context/          # React Context (Auth, Theme)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility helpers, API instances, categories
│   │   └── pages/            # Page components (Dashboard, Budgets, Debts, dll)
│   ├── craco.config.js       # CRACO configuration file
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   └── package.json          # Frontend dependencies & scripts
├── memory/                   # Documentation & Product Requirements (PRD)
│   └── PRD.md
├── test_reports/             # Test results & automated test reports
├── .emergent/                # Automation & webhook cron scripts
├── design_guidelines.json    # UI/UX design tokens & guidelines
├── vercel.json               # Vercel deployment configuration
└── README.md                 # Documentation
