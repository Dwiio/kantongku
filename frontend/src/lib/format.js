export const formatIDR = (n) => {
    const v = Number(n || 0);
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(v);
};

export const formatIDRCompact = (n) => {
    const v = Math.abs(Number(n || 0));
    if (v >= 1_000_000_000) return `Rp ${(v / 1_000_000_000).toFixed(1)}M`;
    if (v >= 1_000_000) return `Rp ${(v / 1_000_000).toFixed(1)}jt`;
    if (v >= 1_000) return `Rp ${(v / 1_000).toFixed(0)}rb`;
    return `Rp ${v}`;
};

const DAY_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTH_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const MONTH_ID_LONG = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export const formatDateID = (isoString) => {
    const d = new Date(isoString);
    return `${d.getDate()} ${DAY_ID[d.getDay()]}, ${MONTH_ID[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatDayLabel = (isoString) => {
    const d = new Date(isoString);
    return `${d.getDate()} ${DAY_ID[d.getDay()]}, ${MONTH_ID[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatTime = (isoString) => {
    const d = new Date(isoString);
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
};

export const monthLabelLong = (date) => `${MONTH_ID_LONG[date.getMonth()]} ${date.getFullYear()}`;

export const dateKey = (isoString) => {
    const d = new Date(isoString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const groupByDate = (txs) => {
    const map = new Map();
    for (const t of txs) {
        const k = dateKey(t.date);
        if (!map.has(k)) map.set(k, { key: k, label: formatDayLabel(t.date), items: [] });
        map.get(k).items.push(t);
    }
    return Array.from(map.values()).sort((a, b) => (a.key < b.key ? 1 : -1));
};
