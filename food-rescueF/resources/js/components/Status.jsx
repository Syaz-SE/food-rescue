import React from "react";
import { useLang } from "../context/LangContext";

const map = {
  available: { en: "Available", ar: "متاح", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  reserved: { en: "Reserved", ar: "محجوز", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  completed: { en: "Completed", ar: "مكتمل", cls: "bg-gray-100 text-gray-700 border-gray-200" },
  pending: { en: "Pending", ar: "قيد الانتظار", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  accepted: { en: "Accepted", ar: "مقبول", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  rejected: { en: "Rejected", ar: "مرفوض", cls: "bg-gray-100 text-gray-500 border-gray-200" },
  on_the_way: { en: "On the way", ar: "في الطريق", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  picked_up: { en: "Picked up", ar: "تم الاستلام", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  delivered: { en: "Delivered", ar: "تم التسليم", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

export function StatusBadge({ status }) {
  const { lang } = useLang();
  const s = map[status] || { en: status, ar: status, cls: "bg-gray-100 text-gray-700 border-gray-200" };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${s.cls}`}
      data-testid={`status-${status}`}
    >
      {s[lang] || s.en}
    </span>
  );
}

export function StatusTracker({ status }) {
  const steps = ["accepted", "on_the_way", "picked_up", "delivered"];
  const { t } = useLang();
  const idx = steps.indexOf(status);
  return (
    <div className="flex items-center gap-2 w-full">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center gap-1 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                i <= idx ? "bg-rose-500 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-xs ${i <= idx ? "text-gray-900 font-medium" : "text-gray-400"}`}>{t(s)}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 flex-1 ${i < idx ? "bg-rose-500" : "bg-gray-200"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
