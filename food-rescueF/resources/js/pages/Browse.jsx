import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Clock, Search } from "lucide-react";
import { DashboardLayout } from "../components/Layout";
import { StatusBadge } from "../components/Status";
import { useLang } from "../context/LangContext";
import { api } from "../lib/api";

export default function Browse() {
  const { t, lang } = useLang();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async (query = "") => {
    setLoading(true);
    try {
      const { data } = await api.get("/food", { params: query ? { q: query } : {} });
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <DashboardLayout role="beneficiary">
      <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t("browse")}</h1>
          <p className="text-gray-500 mt-1">{t("hero_sub")}</p>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); load(q); }}
          className="relative"
        >
          <Search size={18} className="absolute top-1/2 -translate-y-1/2 start-4 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("search_placeholder")}
            className="ps-11 pe-4 py-3 rounded-xl border border-gray-200 bg-white w-72 focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none"
            data-testid="browse-search"
          />
        </form>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState text={t("no_data")} />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="food-grid">
          {items.map((f) => (
            <Link key={f.id} to={`/food/${f.id}`} className="group" data-testid={`food-card-${f.id}`}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm group-hover:shadow-md transition-all overflow-hidden h-full flex flex-col">
                <div className="h-48 w-full bg-gray-100 relative">
                  {f.image_url && (
                    <img src={f.image_url} alt={f.title} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute top-3 end-3">
                    <StatusBadge status={f.status} />
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{f.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{f.description}</p>
                  <div className="mt-4 space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} /> {f.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      {new Date(f.created_at).toLocaleString(lang === "ar" ? "ar-EG" : "en-US", { dateStyle: "medium", timeStyle: "short" })}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500">{f.quantity}</span>
                    <span className="text-rose-600 font-semibold">
                      {f.price > 0 ? `$${f.price.toFixed(2)}` : t("free")}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export function EmptyState({ text }) {
  return (
    <div className="py-20 text-center bg-white border border-dashed border-gray-200 rounded-2xl">
      <p className="text-gray-400">{text}</p>
    </div>
  );
}
