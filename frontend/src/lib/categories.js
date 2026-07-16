export const CATEGORIES = {
    expense: [
        { key: "Makanan", icon: "utensils", color: "#EF4444" },
        { key: "Transportasi", icon: "car", color: "#F59E0B" },
        { key: "Hiburan", icon: "gamepad-2", color: "#8B5CF6" },
        { key: "Rental", icon: "home", color: "#14B8A6" },
        { key: "Pendidikan", icon: "graduation-cap", color: "#2C62B5" },
        { key: "Kesehatan", icon: "heart-pulse", color: "#EC4899" },
        { key: "Belanja", icon: "shopping-bag", color: "#F97316" },
        { key: "Tagihan", icon: "receipt", color: "#0EA5E9" },
        { key: "Lain-lain", icon: "circle-dashed", color: "#64748B" },
    ],
    income: [
        { key: "Gaji", icon: "briefcase", color: "#14B8A6" },
        { key: "Bonus", icon: "gift", color: "#F59E0B" },
        { key: "Freelance", icon: "laptop", color: "#2C62B5" },
        { key: "Investasi", icon: "trending-up", color: "#8B5CF6" },
        { key: "Hadiah", icon: "party-popper", color: "#EC4899" },
        { key: "Lain-lain", icon: "circle-dashed", color: "#64748B" },
    ],
};

export const findCategory = (type, key) => {
    const list = CATEGORIES[type] || [];
    return list.find((c) => c.key === key) || { key, icon: "circle-dashed", color: "#64748B" };
};
