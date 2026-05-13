import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Package, Check, X } from "lucide-react";
import { DashboardLayout } from "../components/Layout";
import { StatusBadge } from "../components/Status";
import { EmptyState } from "./Browse";
import { useLang } from "../context/LangContext";
import { api, formatApiError } from "../lib/api";

const EMPTY_FORM = { title: "", description: "", quantity: "", price: 0, location: "", image_url: "" };

export default function RestaurantDashboard({ tab = "overview" }) {
  const { t } = useLang();
  const [foods, setFoods] = useState([]);
  const [reqs, setReqs] = useState([]);
  const [stats, setStats] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = async () => {
    const [f, r, s] = await Promise.all([
      api.get("/food/mine"),
      api.get("/requests/restaurant"),
      api.get("/stats/restaurant"),
    ]);
    setFoods(f.data);
    setReqs(r.data);
    setStats(s.data);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/food/${editingId}`, { ...form, price: parseFloat(form.price) || 0 });
        toast.success("Updated");
      } else {
        await api.post("/food", { ...form, price: parseFloat(form.price) || 0 });
        toast.success("Listing added");
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || err.message);
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    await api.delete(`/food/${id}`);
    toast.success("Deleted");
    load();
  };

  const edit = (f) => {
    setEditingId(f.id);
    setForm({
      title: f.title, description: f.description, quantity: f.quantity,
      price: f.price, location: f.location, image_url: f.image_url || "",
    });
    setShowForm(true);
  };

  const decide = async (id, action) => {
    try {
      await api.patch(`/requests/${id}/${action}`);
      toast.success(action === "accept" ? "Accepted" : "Rejected");
      load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || err.message);
    }
  };

  return (
    <DashboardLayout role="restaurant">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t("dashboard")}</h1>
          <p className="text-gray-500 mt-1">{t("for_restaurants")}</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium transition-colors"
          data-testid="add-food-btn"
        >
          <Plus size={18} /> {t("add_food")}
        </button>
      </div>

      {tab === "overview" && stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard label={t("stats_total")} value={stats.total} />
          <StatCard label={t("stats_available")} value={stats.available} accent />
          <StatCard label={t("stats_reserved")} value={stats.reserved} />
          <StatCard label={t("stats_completed")} value={stats.completed} />
          <StatCard label={t("stats_pending")} value={stats.pending_requests} accent />
        </div>
      )}

      {(tab === "overview" || tab === "listings") && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">{t("my_listings")}</h2>
          </div>
          {foods.length === 0 ? (
            <EmptyState text={t("no_data")} />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-4 text-start">{t("title")}</th>
                    <th className="p-4 text-start">{t("quantity")}</th>
                    <th className="p-4 text-start">{t("location")}</th>
                    <th className="p-4 text-start">{t("price")}</th>
                    <th className="p-4 text-start">{t("status")}</th>
                    <th className="p-4 text-end">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {foods.map((f) => (
                    <tr key={f.id} className="border-t border-gray-100 hover:bg-gray-50/50" data-testid={`listing-${f.id}`}>
                      <td className="p-4 font-medium text-gray-900">{f.title}</td>
                      <td className="p-4 text-gray-600">{f.quantity}</td>
                      <td className="p-4 text-gray-600">{f.location}</td>
                      <td className="p-4 text-rose-600 font-medium">
                        {f.price > 0 ? `$${f.price.toFixed(2)}` : t("free")}
                      </td>
                      <td className="p-4"><StatusBadge status={f.status} /></td>
                      <td className="p-4 text-end">
                        <div className="inline-flex gap-2">
                          <button onClick={() => edit(f)} className="p-2 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50" data-testid={`edit-${f.id}`}>
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => del(f.id)} className="p-2 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50" data-testid={`delete-${f.id}`}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {(tab === "overview" || tab === "requests") && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t("requests_inbox")}</h2>
          {reqs.length === 0 ? (
            <EmptyState text={t("no_data")} />
          ) : (
            <div className="space-y-3" data-testid="requests-inbox">
              {reqs.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-5 flex-wrap" data-testid={`inbox-${r.id}`}>
                  <div className="w-14 h-14 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <Package size={20} />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{r.food_title}</span>
                      <StatusBadge status={r.status} />
                      <span className="text-xs text-gray-400">{t(r.type)}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{r.beneficiary_name}{r.delivery_address && ` · ${r.delivery_address}`}</p>
                    {r.notes && <p className="text-xs text-gray-400 mt-1">“{r.notes}”</p>}
                  </div>
                  {r.status === "pending" && (
                    <div className="flex gap-2">
                      <button onClick={() => decide(r.id, "accept")} className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium" data-testid={`accept-${r.id}`}>
                        <Check size={16} /> {t("accept")}
                      </button>
                      <button onClick={() => decide(r.id, "reject")} className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200 hover:border-rose-300 text-gray-700 hover:text-rose-600 text-sm font-medium" data-testid={`reject-${r.id}`}>
                        <X size={16} /> {t("reject")}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">{editingId ? t("edit") : t("add_food")}</h3>
          <form onSubmit={submit} className="space-y-4" data-testid="food-form">
            <Input label={t("title")} required value={form.title} onChange={(v) => setForm({ ...form, title: v })} testid="food-title" />
            <Input label={t("description")} required value={form.description} onChange={(v) => setForm({ ...form, description: v })} textarea testid="food-desc" />
            <div className="grid grid-cols-2 gap-3">
              <Input label={t("quantity")} required value={form.quantity} onChange={(v) => setForm({ ...form, quantity: v })} testid="food-qty" />
              <Input label={t("price")} type="number" step="0.01" value={form.price} onChange={(v) => setForm({ ...form, price: v })} testid="food-price" />
            </div>
            <Input label={t("location")} required value={form.location} onChange={(v) => setForm({ ...form, location: v })} testid="food-loc" />
            <Input label={t("image_url")} value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} testid="food-img" />
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium" data-testid="food-save">
                {t("save")}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 rounded-xl border border-gray-200 hover:border-rose-300 text-gray-700 hover:text-rose-600">
                {t("cancel")}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className={`bg-white rounded-2xl border p-5 shadow-sm ${accent ? "border-rose-200" : "border-gray-100"}`}>
      <div className="text-xs uppercase tracking-wider text-gray-400">{label}</div>
      <div className={`text-3xl font-bold mt-2 ${accent ? "text-rose-600" : "text-gray-900"}`}>{value}</div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", textarea, required, step, testid }) {
  const cls = "w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none";
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700 mb-1.5 block">{label}</span>
      {textarea ? (
        <textarea rows={3} required={required} value={value} onChange={(e) => onChange(e.target.value)} className={`${cls} resize-none`} data-testid={testid} />
      ) : (
        <input type={type} step={step} required={required} value={value} onChange={(e) => onChange(e.target.value)} className={cls} data-testid={testid} />
      )}
    </label>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-start md:items-center justify-center p-4 overflow-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl my-8" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
