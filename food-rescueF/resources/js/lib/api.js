import axios from "axios";

// Same-origin in production (Laravel serves both API and SPA).
// Override with VITE_API_URL during development if your API lives elsewhere.
const BASE = import.meta.env.VITE_API_URL || "";
export const API = `${BASE}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: false, // we use Bearer tokens
});

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export function formatApiError(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  if (detail && typeof detail === "object") {
    // Laravel validator → { field: [msg], ... }
    const msgs = Object.values(detail).flat().filter((x) => typeof x === "string");
    if (msgs.length) return msgs.join(" ");
  }
  return String(detail);
}
