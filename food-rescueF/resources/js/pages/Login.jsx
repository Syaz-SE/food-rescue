import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PublicLayout } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { formatApiError } from "../lib/api";
import { roleHome } from "../components/Layout";

export default function Login() {
  const { t } = useLang();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const u = await login(form.email, form.password);
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
      <div className="max-w-md mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t("login_title")}</h1>
        <p className="text-gray-500 mt-2">{t("login_sub")}</p>
        <form onSubmit={handle} className="mt-8 space-y-4" data-testid="login-form">
          <Field label={t("email")}>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none transition-all"
              data-testid="login-email"
            />
          </Field>
          <Field label={t("password")}>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none transition-all"
              data-testid="login-password"
            />
          </Field>
          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium transition-colors disabled:opacity-60"
            data-testid="login-submit"
          >
            {busy ? "..." : t("login")}
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-6 text-center">
          {t("no_account")}{" "}
          <Link to="/register" className="text-rose-600 hover:underline font-medium" data-testid="link-register">
            {t("signup")}
          </Link>
        </p>
        <div className="mt-8 text-xs text-gray-400 bg-gray-50 rounded-xl p-4 border border-gray-100">
          <div className="font-medium text-gray-500 mb-1">Demo accounts</div>
          restaurant@rescue.com · beneficiary@rescue.com · volunteer@rescue.com — password: <code>password123</code>
        </div>
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
