import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Truck, MapPin, Package } from "lucide-react";
import { DashboardLayout } from "../components/Layout";
import { StatusBadge, StatusTracker } from "../components/Status";
import { EmptyState } from "./Browse";
import { useLang } from "../context/LangContext";
import { api, formatApiError } from "../lib/api";

export default function VolunteerDashboard({ tab = "available" }) {
  const { t } = useLang();
  const [avail, setAvail] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [a, m] = await Promise.all([api.get("/deliveries/available"), api.get("/deliveries/mine")]);
      setAvail(a.data);
      setMine(m.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const accept = async (id) => {
    try {
      await api.post(`/deliveries/${id}/accept`);
      toast.success("Delivery accepted");
      load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || err.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/deliveries/${id}/status`, { status });
      toast.success("Status updated");
      load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || err.message);
    }
  };

  return (
    <DashboardLayout role="volunteer">
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">{tab === "available" ? t("available_deliveries") : t("deliveries")}</h1>
      <p className="text-gray-500 mb-8">{t("for_volunteers")}</p>

      {loading ? (
        <div className="py-10 text-center text-gray-400">...</div>
      ) : tab === "available" ? (
        avail.length === 0 ? (
          <EmptyState text={t("no_data")} />
        ) : (
          <div className="space-y-4" data-testid="avail-deliveries">
            {avail.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-5 flex-wrap" data-testid={`avail-${r.id}`}>
                <div className="w-14 h-14 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Truck size={20} />
                </div>
                <div className="flex-1 min-w-[220px]">
                  <h3 className="font-semibold text-gray-900">{r.food_title}</h3>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1"><MapPin size={14} /> {t("from")}: {r.restaurant_name}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={14} /> {t("to")}: {r.delivery_address}</p>
                </div>
                <button
                  onClick={() => accept(r.id)}
                  className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm"
                  data-testid={`accept-delivery-${r.id}`}
                >
                  {t("accept_delivery")}
                </button>
              </div>
            ))}
          </div>
        )
      ) : mine.length === 0 ? (
        <EmptyState text={t("no_data")} />
      ) : (
        <div className="space-y-4" data-testid="mine-deliveries">
          {mine.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6" data-testid={`mine-${r.id}`}>
              <div className="flex items-start gap-4 flex-wrap">
                <div className="w-14 h-14 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Package size={20} />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{r.food_title}</h3>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{t("from")}: {r.restaurant_name}</p>
                  <p className="text-sm text-gray-500">{t("to")}: {r.delivery_address}</p>
                </div>
                <div className="flex gap-2">
                  {r.status === "on_the_way" && (
                    <button onClick={() => updateStatus(r.id, "picked_up")} className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium" data-testid={`picked-${r.id}`}>
                      {t("mark_picked_up")}
                    </button>
                  )}
                  {r.status === "picked_up" && (
                    <button onClick={() => updateStatus(r.id, "delivered")} className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium" data-testid={`delivered-${r.id}`}>
                      {t("mark_delivered")}
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <StatusTracker status={r.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
