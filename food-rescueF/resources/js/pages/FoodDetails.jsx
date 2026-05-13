import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Clock, Package } from "lucide-react";
import { DashboardLayout } from "../components/Layout";
import { StatusBadge } from "../components/Status";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { api, formatApiError } from "../lib/api";

export default function FoodDetails() {
  const { id } = useParams();
  const { t, lang } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [food, setFood] = useState(null);
  const [type, setType] = useState("pickup");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`/food/${id}`).then(({ data }) => setFood(data)).catch(() => toast.error("Not found"));
  }, [id]);

  const request = async () => {
    if (!user) return navigate("/login");
    if (user.role !== "beneficiary") return toast.error("Only beneficiaries can request.");
    if (type === "delivery" && !address.trim()) return toast.error("Delivery address is required.");
    setBusy(true);
    try {
      await api.post("/requests", { food_id: id, type, delivery_address: type === "delivery" ? address : null, notes });
      toast.success("Request sent!");
      navigate("/my-requests");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!food) {
    return (
      <DashboardLayout role={user?.role || "beneficiary"}>
        <div className="py-20 text-center text-gray-400">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={user?.role || "beneficiary"}>
      <Link to="/browse" className="inline-flex items-center gap-2 text-gray-500 hover:text-rose-600 text-sm mb-6" data-testid="back-link">
        <ArrowLeft size={16} className="rtl:rotate-180" /> {t("back")}
      </Link>
      <div className="grid lg:grid-cols-2 gap-10">
        <div>
          <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden border border-gray-100">
            {food.image_url && <img src={food.image_url} alt={food.title} className="w-full h-full object-cover" />}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-3 mb-3">
            <StatusBadge status={food.status} />
            <span className="text-xs text-gray-400">{food.restaurant_name}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{food.title}</h1>
          <p className="text-gray-600 mt-3 leading-relaxed">{food.description}</p>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <Info icon={<Package size={16} />} label={t("quantity")} value={food.quantity} />
            <Info icon={<MapPin size={16} />} label={t("location")} value={food.location} />
            <Info icon={<Clock size={16} />} label="Posted" value={new Date(food.created_at).toLocaleString(lang === "ar" ? "ar-EG" : "en-US", { dateStyle: "medium", timeStyle: "short" })} />
            <Info label={t("price")} value={<span className="text-rose-600 font-semibold">{food.price > 0 ? `$${food.price.toFixed(2)}` : t("free")}</span>} />
          </div>

          {food.status === "available" && (!user || user.role === "beneficiary") && (
            <div className="mt-8 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">{t("request_food")}</h3>
              <div>
                <span className="text-sm font-medium text-gray-700 mb-2 block">{t("request_type")}</span>
                <div className="grid grid-cols-2 gap-3">
                  {["pickup", "delivery"].map((x) => (
                    <button
                      key={x}
                      type="button"
                      onClick={() => setType(x)}
                      className={`px-4 py-3 rounded-xl border font-medium text-sm transition-all ${
                        type === x ? "border-rose-400 bg-rose-50 text-rose-700" : "border-gray-200 text-gray-600 hover:border-rose-200"
                      }`}
                      data-testid={`req-type-${x}`}
                    >
                      {t(x)}
                    </button>
                  ))}
                </div>
              </div>
              {type === "delivery" && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">{t("delivery_address")}</label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t("delivery_placeholder")}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none resize-none"
                    data-testid="req-address"
                  />
                </div>
              )}
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">{t("notes")}</label>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none"
                  data-testid="req-notes"
                />
              </div>
              <button
                disabled={busy}
                onClick={request}
                className="mt-5 w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium transition-colors disabled:opacity-60"
                data-testid="req-submit"
              >
                {busy ? "..." : t("confirm")}
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
      <div className="text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
        {icon} {label}
      </div>
      <div className="text-sm font-medium text-gray-900 mt-1">{value}</div>
    </div>
  );
}
