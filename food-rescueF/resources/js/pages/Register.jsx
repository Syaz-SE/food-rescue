import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Utensils, HeartHandshake, Truck } from "lucide-react";
import { PublicLayout, roleHome } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { formatApiError } from "../lib/api";

const ROLES = [
  { value: "restaurant", icon: Utensils },
  { value: "beneficiary", icon: HeartHandshake },
  { value: "volunteer", icon: Truck },
];

export default function Register() {
  const { t } = useLang();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "beneficiary", phone: "" });
  const [busy, setBusy] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const u = await register(form);
      toast.success(`Welcome, ${u.name}`);
      navigate(roleHome(u.role));
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-lg mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t("register_title")}</h1>
        <p className="text-gray-500 mt-2">{t("register_sub")}</p>

        <form onSubmit={handle} className="mt-8 space-y-5" data-testid="register-form">
          <div>
            <span className="text-sm font-medium text-gray-700 mb-2 block">{t("role")}</span>
            <div className="grid grid-cols-3 gap-3">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const active = form.role === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      active
                        ? "border-rose-400 bg-rose-50 ring-2 ring-rose-100"
                        : "border-gray-200 hover:border-rose-200 hover:bg-rose-50/40"
                    }`}
                    data-testid={`role-${r.value}`}
                  >
                    <Icon size={22} className={`mx-auto mb-2 ${active ? "text-rose-600" : "text-gray-500"}`} />
                    <div className={`text-sm font-medium ${active ? "text-rose-700" : "text-gray-700"}`}>{t(r.value)}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <Field label={t("name")}>
            <input
              required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none"
              data-testid="register-name"
            />
          </Field>
          <Field label={t("email")}>
            <input
              type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none"
              data-testid="register-email"
            />
          </Field>
          <Field label={t("password")}>
            <input
              type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none"
              data-testid="register-password"
            />
          </Field>
          <Field label={t("phone")}>
            <input
              value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none"
              data-testid="register-phone"
            />
          </Field>

          <button
            type="submit" disabled={busy}
            className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium transition-colors disabled:opacity-60"
            data-testid="register-submit"
          >
            {busy ? "..." : t("signup")}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          {t("have_account")}{" "}
          <Link to="/login" className="text-rose-600 hover:underline font-medium" data-testid="link-login">
            {t("login")}
          </Link>
        </p>
      </div>
    </PublicLayout>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700 mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
