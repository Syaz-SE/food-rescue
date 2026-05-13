import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Globe, LogOut, Utensils, LayoutDashboard, Package, Inbox, Truck, Search, UserCircle2, Users, Activity, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";

export function Topbar() {
  const { user, logout } = useAuth();
  const { lang, toggle, t } = useLang();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2" data-testid="nav-home">
          <div className="w-9 h-9 rounded-xl bg-rose-500 flex items-center justify-center text-white">
            <Utensils size={18} />
          </div>
          <span className="font-semibold text-lg text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            {t("app_name")}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 hover:text-rose-600 hover:bg-rose-50 transition-colors text-sm font-medium"
            data-testid="lang-switcher"
            aria-label="Toggle language"
          >
            <Globe size={16} />
            {lang === "en" ? "عربي" : "EN"}
          </button>

          {user ? (
            <>
              <Link
                to={roleHome(user.role)}
                className="hidden md:inline-flex items-center gap-2 px-3 py-2 text-sm rounded-xl text-gray-700 hover:text-rose-600 hover:bg-rose-50"
                data-testid="nav-dashboard"
              >
                <LayoutDashboard size={16} /> {t("dashboard")}
              </Link>
              <div className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-gray-600">
                <UserCircle2 size={18} />
                <span data-testid="nav-user-name">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 hover:text-rose-600 hover:bg-rose-50 text-sm"
                data-testid="nav-logout"
              >
                <LogOut size={16} /> {t("logout")}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 rounded-xl text-gray-700 hover:text-rose-600 hover:bg-rose-50 text-sm font-medium" data-testid="nav-login">
                {t("login")}
              </Link>
              <Link to="/register" className="px-4 py-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600 text-sm font-medium" data-testid="nav-signup">
                {t("get_started")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function roleHome(role) {
  if (role === "admin") return "/admin";
  if (role === "restaurant") return "/restaurant";
  if (role === "volunteer") return "/volunteer";
  return "/browse";
}

export function Sidebar({ items }) {
  return (
    <aside className="w-64 shrink-0 bg-white border-e border-gray-200 min-h-[calc(100vh-4rem)] hidden lg:block">
      <nav className="p-4 space-y-1">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive ? "bg-rose-50 text-rose-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
            data-testid={`side-${it.key}`}
          >
            {it.icon}
            {it.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export function DashboardLayout({ children, role }) {
  const { t } = useLang();
  const items =
    role === "admin"
      ? [
          { to: "/admin", end: true, icon: <LayoutDashboard size={18} />, label: t("admin_overview"), key: "ov" },
          { to: "/admin/users", icon: <Users size={18} />, label: t("admin_users"), key: "u" },
          { to: "/admin/foods", icon: <Package size={18} />, label: t("admin_foods"), key: "f" },
          { to: "/admin/requests", icon: <Inbox size={18} />, label: t("admin_requests"), key: "r" },
          { to: "/admin/deliveries", icon: <Truck size={18} />, label: t("admin_deliveries"), key: "d" },
          { to: "/admin/analytics", icon: <Activity size={18} />, label: t("admin_analytics"), key: "a" },
        ]
      : role === "restaurant"
      ? [
          { to: "/restaurant", end: true, icon: <LayoutDashboard size={18} />, label: t("dashboard"), key: "dash" },
          { to: "/restaurant/listings", icon: <Package size={18} />, label: t("my_listings"), key: "listings" },
          { to: "/restaurant/requests", icon: <Inbox size={18} />, label: t("requests_inbox"), key: "requests" },
        ]
      : role === "volunteer"
      ? [
          { to: "/volunteer", end: true, icon: <Truck size={18} />, label: t("available_deliveries"), key: "avail" },
          { to: "/volunteer/mine", icon: <Package size={18} />, label: t("deliveries"), key: "mine" },
        ]
      : [
          { to: "/browse", end: true, icon: <Search size={18} />, label: t("browse"), key: "browse" },
          { to: "/my-requests", icon: <Inbox size={18} />, label: t("my_requests"), key: "mine" },
        ];
  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <div className="max-w-7xl mx-auto flex">
        <Sidebar items={items} />
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      <Topbar />
      <main>{children}</main>
    </div>
  );
}
