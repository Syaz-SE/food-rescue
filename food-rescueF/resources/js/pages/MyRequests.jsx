import React, { useEffect, useState } from "react";
import { DashboardLayout } from "../components/Layout";
import { StatusBadge, StatusTracker } from "../components/Status";
import { EmptyState } from "./Browse";
import { useLang } from "../context/LangContext";
import { api } from "../lib/api";

export default function MyRequests() {
  const { t, lang } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/requests/mine").then(({ data }) => setItems(data)).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout role="beneficiary">
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-6">{t("my_requests")}</h1>
      {loading ? (
        <div className="py-20 text-center text-gray-400">...</div>
      ) : items.length === 0 ? (
        <EmptyState text={t("no_data")} />
      ) : (
        <div className="space-y-4" data-testid="requests-list">
          {items.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6" data-testid={`request-${r.id}`}>
              <div className="flex items-start gap-5">
                <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                  {r.food_image && <img src={r.food_image} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{r.food_title}</h3>
                    <StatusBadge status={r.status} />
                    <span className="text-xs text-gray-400">{t(r.type)}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {t("from")}: {r.restaurant_name}
                    {r.delivery_address && <> · {r.delivery_address}</>}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {t("requested_on")}: {new Date(r.created_at).toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}
                  </p>
                </div>
              </div>
              {r.type === "delivery" && ["accepted", "on_the_way", "picked_up", "delivered"].includes(r.status) && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <StatusTracker status={r.status} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
