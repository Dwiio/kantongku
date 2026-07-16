import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
    baseURL: API,
    withCredentials: true,
});

// Also attach token if present in localStorage as fallback
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("kk_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export function formatApiErrorDetail(detail) {
    if (detail == null) return "Terjadi kesalahan. Coba lagi.";
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail))
        return detail
            .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
            .filter(Boolean)
            .join(" ");
    if (detail && typeof detail.msg === "string") return detail.msg;
    return String(detail);
}
