import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Users, Utensils, Truck, Activity, Inbox, CheckCircle2, Recycle, Package } from "lucide-react";
import { DashboardLayout } from "../components/Layout";
import { StatusBadge } from "../components/Status";
import { useLang } from "../context/LangContext";
import { api, formatApiError } from "../lib/api";

export default function AdminDashboard({ tab = "overview" }) {
  const { t, lang } = useLang();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [foods, setFoods] = useState([]);
  const [reqs, setReqs] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      if (tab === "overview") {
        const { data } = await api.get("/admin/stats/overview");
        setOverview(data);
      } else if (tab === "users") {
        const { data } = await api.get("/admin/users");
        setUsers(data);
      } else if (tab === "foods") {
        const { data } = await api.get("/admin/foods");
        setFoods(data);
      } else if (tab === "requests") {
        const { data } = await api.get("/admin/requests");
        setReqs(data);
      } else if (tab === "deliveries") {
        const { data } = await api.get("/admin/deliveries");
        setDeliveries(data);
      } else if (tab === "analytics") {
        const [{ data: a }, { data: o }] = await Promise.all([
          api.get("/admin/analytics"),
          api.get("/admin/stats/overview"),
        ]);
        setAnalytics(a);
        setOverview(o);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [tab]);

  const deleteUser = async (id) => {
    if (!window.confirm(t("confirm_delete"))) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success(t("user_deleted"));
      setUsers((u) => u.filter((x) => x.id !== id));
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || err.message);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t("admin_dashboard")}</h1>
        <p className="text-gray-500 mt-1">{t(`admin_${tab}`)}</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400">...</div>
      ) : tab === "overview" ? (
        overview && <OverviewGrid overview={overview} t={t} />
      ) : tab === "users" ? (
        <UsersTable users={users} onDelete={deleteUser} t={t} lang={lang} />
      ) : tab === "foods" ? (
        <FoodsTable foods={foods} t={t} />
      ) : tab === "requests" ? (
        <RequestsTable items={reqs} t={t} />
      ) : tab === "deliveries" ? (
        <RequestsTable items={deliveries} t={t} />
      ) : tab === "analytics" ? (
        <AnalyticsView analytics={analytics} overview={overview} t={t} />
      ) : null}
    </DashboardLayout>
  );
}

function OverviewGrid({ overview, t }) {
  const cards = [
    { icon: <Users />, label: t("total_users"), value: overview.total_users, accent: true },
    { icon: <Utensils />, label: t("total_restaurants"), value: overview.total_restaurants },
    { icon: <Inbox />, label: t("total_beneficiaries"), value: overview.total_beneficiaries },
    { icon: <Truck />, label: t("total_volunteers"), value: overview.total_volunteers },
    { icon: <Package />, label: t("active_listings"), value: overview.active_listings },
    { icon: <CheckCircle2 />, label: t("stats_meals_saved"), value: overview.meals_saved, accent: true },
    { icon: <Truck />, label: t("active_deliveries"), value: overview.active_deliveries },
    { icon: <Activity />, label: t("success_rate"), value: `${overview.success_rate}%` },
    { icon: <Recycle />, label: t("waste_reduction_rate"), value: `${overview.waste_reduction_rate}%`, accent: true },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="admin-overview">
      {cards.map((c, i) => (
        <div
          key={i}
          className={`bg-white rounded-2xl p-5 shadow-sm border ${c.accent ? "border-rose-200" : "border-gray-100"}`}
          data-testid={`stat-${i}`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.accent ? "bg-rose-50 text-rose-600" : "bg-gray-50 text-gray-500"}`}>
            {c.icon}
          </div>
          <div className="text-xs uppercase tracking-wider text-gray-400">{c.label}</div>
          <div className={`text-3xl font-bold mt-1 ${c.accent ? "text-rose-600" : "text-gray-900"}`}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}

function UsersTable({ users, onDelete, t, lang }) {
  if (users.length === 0)
    return <div className="py-20 text-center text-gray-400 bg-white border border-dashed border-gray-200 rounded-2xl">{t("no_users")}</div>;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm" data-testid="users-table">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
          <tr>
            <th className="p-4 text-start">{t("name")}</th>
            <th className="p-4 text-start">{t("email")}</th>
            <th className="p-4 text-start">{t("role_label")}</th>
            <th className="p-4 text-start">{t("status")}</th>
            <th className="p-4 text-start">{t("joined")}</th>
            <th className="p-4 text-end">{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50/50" data-testid={`user-row-${u.id}`}>
              <td className="p-4 font-medium text-gray-900">{u.name}</td>
              <td className="p-4 text-gray-600">{u.email}</td>
              <td className="p-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                  {t(u.role)}
                </span>
              </td>
              <td className="p-4">
                {u.is_deleted ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                    Disabled
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                )}
              </td>
              <td className="p-4 text-gray-500 text-sm">
                {new Date(u.created_at).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}
              </td>
              <td className="p-4 text-end">
                {!u.is_deleted && (
                  <button
                    onClick={() => onDelete(u.id)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-sm font-medium"
                    data-testid={`delete-user-${u.id}`}
                  >
                    <Trash2 size={14} /> {t("delete_user")}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FoodsTable({ foods, t }) {
  if (foods.length === 0)
    return <div className="py-20 text-center text-gray-400 bg-white border border-dashed border-gray-200 rounded-2xl">{t("no_data")}</div>;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm" data-testid="foods-table">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
          <tr>
            <th className="p-4 text-start">{t("title")}</th>
            <th className="p-4 text-start">{t("restaurant")}</th>
            <th className="p-4 text-start">{t("quantity")}</th>
            <th className="p-4 text-start">{t("location")}</th>
            <th className="p-4 text-start">{t("price")}</th>
            <th className="p-4 text-start">{t("status")}</th>
          </tr>
        </thead>
        <tbody>
          {foods.map((f) => (
            <tr key={f.id} className="border-t border-gray-100 hover:bg-gray-50/50">
              <td className="p-4 font-medium text-gray-900">{f.title}</td>
              <td className="p-4 text-gray-600">{f.restaurant_name}</td>
              <td className="p-4 text-gray-600">{f.quantity}</td>
              <td className="p-4 text-gray-600">{f.location}</td>
              <td className="p-4 text-rose-600 font-medium">{f.price > 0 ? `$${f.price.toFixed(2)}` : t("free")}</td>
              <td className="p-4"><StatusBadge status={f.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RequestsTable({ items, t }) {
  if (items.length === 0)
    return <div className="py-20 text-center text-gray-400 bg-white border border-dashed border-gray-200 rounded-2xl">{t("no_data")}</div>;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm" data-testid="requests-table">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
          <tr>
            <th className="p-4 text-start">Food</th>
            <th className="p-4 text-start">{t("from")}</th>
            <th className="p-4 text-start">{t("to")}</th>
            <th className="p-4 text-start">Type</th>
            <th className="p-4 text-start">{t("volunteer")}</th>
            <th className="p-4 text-start">{t("status")}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50/50">
              <td className="p-4 font-medium text-gray-900">{r.food_title}</td>
              <td className="p-4 text-gray-600">{r.restaurant_name}</td>
              <td className="p-4 text-gray-600">{r.beneficiary_name}</td>
              <td className="p-4 text-gray-600">{t(r.type)}</td>
              <td className="p-4 text-gray-600">{r.volunteer_name || "—"}</td>
              <td className="p-4"><StatusBadge status={r.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AnalyticsView({ analytics, overview, t }) {
  const max = Math.max(1, ...analytics.map((d) => d.meals_saved));
  return (
    <div className="space-y-6">
      {overview && <OverviewGrid overview={overview} t={t} />}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6" data-testid="analytics-chart">
        <h3 className="font-semibold text-gray-900 mb-6">{t("stats_meals_saved")} — last 7 days</h3>
        <div className="flex items-end gap-3 h-48">
          {analytics.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-rose-50 rounded-xl relative" style={{ height: "100%" }}>
                <div
                  className="absolute bottom-0 left-0 right-0 bg-rose-500 rounded-xl transition-all"
                  style={{ height: `${(d.meals_saved / max) * 100}%` }}
                  title={`${d.meals_saved} meals`}
                />
              </div>
              <div className="text-xs text-gray-500">{d.date.slice(5)}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">{t("success_rate")}</h3>
          <div className="space-y-3">
            {analytics.map((d) => (
              <div key={d.date} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-16">{d.date.slice(5)}</span>
                <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, d.success_rate)}%` }} />
                </div>
                <span className="text-xs text-gray-600 w-12 text-end">{d.success_rate.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">{t("waste_reduction_rate")}</h3>
          <div className="space-y-3">
            {analytics.map((d) => (
              <div key={d.date} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-16">{d.date.slice(5)}</span>
                <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-rose-500" style={{ width: `${Math.min(100, d.waste_reduction_rate)}%` }} />
                </div>
                <span className="text-xs text-gray-600 w-12 text-end">{d.waste_reduction_rate.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
