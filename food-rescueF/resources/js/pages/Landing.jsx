import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Utensils, HeartHandshake, Truck, Sparkles } from "lucide-react";
import { PublicLayout } from "../components/Layout";
import { useLang } from "../context/LangContext";

export default function Landing() {
  const { t, lang } = useLang();
  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-16 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 text-xs font-medium border border-rose-100">
            <Sparkles size={14} />
            {t("tagline")}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]" style={{ fontFamily: lang === "ar" ? "Tajawal, sans-serif" : "Outfit, sans-serif" }}>
            {t("hero_title")}
          </h1>
          <p className="text-lg text-gray-600 max-w-xl leading-relaxed">{t("hero_sub")}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium transition-colors"
              data-testid="hero-get-started"
            >
              {t("get_started")} <ArrowRight size={18} className="rtl:rotate-180" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3.5 rounded-xl border border-gray-200 text-gray-700 hover:border-rose-300 hover:text-rose-600 font-medium transition-colors"
              data-testid="hero-login"
            >
              {t("login")}
            </Link>
          </div>
          <div className="flex items-center gap-8 pt-6">
            <Stat label={t("meals_saved")} value="12,480" />
            <Stat label={t("partners")} value="86" />
            <Stat label={t("cities_active")} value="14" />
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-rose-100/50 blur-3xl rounded-full" />
          <img
            src="https://static.prod-images.emergentagent.com/jobs/6e5bb3ab-8d4b-46ba-9afe-bbadd7971a95/images/f2ce08e4f51ec869c139d0e46cc35f7ec2fd07e5523bed9e395915c151ce4f83.png"
            alt="Box of rescued groceries"
            className="relative w-full max-w-lg mx-auto"
          />
        </div>
      </section>

      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{t("how_it_works")}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <HowCard icon={<Utensils />} title={t("step_restaurants")} desc={t("step_restaurants_d")} label={t("for_restaurants")} />
            <HowCard icon={<HeartHandshake />} title={t("step_beneficiaries")} desc={t("step_beneficiaries_d")} label={t("for_beneficiaries")} />
            <HowCard icon={<Truck />} title={t("step_volunteers")} desc={t("step_volunteers_d")} label={t("for_volunteers")} />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="bg-gradient-to-br from-rose-50 to-white border border-rose-100 rounded-3xl p-10 md:p-14 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight max-w-2xl mx-auto">
            {t("landing_cta")}
          </h2>
          <p className="text-gray-600 mt-4 max-w-xl mx-auto">{t("landing_cta_sub")}</p>
          <Link
            to="/register"
            className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium transition-colors"
            data-testid="cta-signup"
          >
            {t("signup")} <ArrowRight size={18} className="rtl:rotate-180" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} {t("app_name")}
        </div>
      </footer>
    </PublicLayout>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

function HowCard({ icon, title, desc, label }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-5">
        {icon}
      </div>
      <div className="text-xs uppercase tracking-wider text-rose-500 font-medium mb-2">{label}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
}
