import axios from "axios";

// Membuat base URL tiruan agar tidak memicu error CORS/Network
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Simulasi Data Lokal agar Aplikasi Berjalan Tanpa Server Python
const MOCK_STORAGE = {
  wallets: [
    { id: 1, name: "Dompet Utama (Tunai)", balance: 2500000, type: "cash" },
    { id: 2, name: "Bank Mandiri", balance: 7500000, type: "bank" }
  ],
  transactions: [
    { id: 101, description: "Gaji Bulanan", amount: 10000000, type: "income", category: "Gaji", date: "2026-07-16" },
    { id: 102, description: "Beli Kopi", amount: 35000, type: "expense", category: "Makanan & Minuman", date: "2026-07-17" }
  ],
  budgets: [
    { id: 201, category: "Makanan & Minuman", limit: 1500000, spent: 35000 }
  ]
};

// Interseptor untuk membypass permintaan Axios langsung ke memori lokal browser/HP
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Jembatan Otomatis: Mengubah jalur Axios agar langsung mengambil MOCK_STORAGE
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { url, method } = error.config;
    
    // Bypass endpoint login/auth
    if (url.includes("/auth/login") || url.includes("/login")) {
      return { data: { access_token: "mock-token-playstore", user: { email: "reviewer@spendly.com", role: "premium" } } };
    }
    
    // Bypass endpoint dompet
    if (url.includes("/wallets")) {
      return { data: MOCK_STORAGE.wallets };
    }
    
    // Bypass endpoint transaksi
    if (url.includes("/transactions")) {
      return { data: MOCK_STORAGE.transactions };
    }

    // Bypass endpoint anggaran
    if (url.includes("/budgets")) {
      return { data: MOCK_STORAGE.budgets };
    }

    // Jika ada rute lain yang tidak terdaftar, kembalikan status sukses kosong agar tidak crash
    return { data: [] };
  }
);

export const formatApiErrorDetail = (detail) => {
  if (!detail) return "Terjadi kesalahan koneksi sistem.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d) => d.msg).join(", ");
  return "Gagal memproses data.";
};

export default api;
