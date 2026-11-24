import React from "react";
import { Link, useLocation } from "wouter";
import { useAuthStore } from "../store/authStore";
import {
  Coffee,
  Bell,
  QrCode,
  UtensilsCrossed,
  CalendarDays,
  MessageSquare,
  BarChart3,
  LogOut,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export function Sidebar({ pendingOrdersCount = 0 }) {
  const [location] = useLocation();
  const { user, logout } = useAuthStore();

  const navItems = [
    { href: "/", label: "Live Orders Stream", icon: Bell, badge: pendingOrdersCount > 0 ? pendingOrdersCount : null },
    { href: "/tables", label: "Table QR Station", icon: QrCode },
    { href: "/menu", label: "Menu Catalog", icon: UtensilsCrossed },
    { href: "/reservations", label: "Table Bookings", icon: CalendarDays },
    { href: "/inquiries", label: "Inquiries & Feedback", icon: MessageSquare },
    { href: "/analytics", label: "Sales & Insights", icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-[#24160f] text-[#faede3] flex flex-col justify-between shrink-0 min-h-screen border-r border-[#3d271b] shadow-2xl z-20">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-[#3d271b] flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#b85c1f] to-[#ea8e47] flex items-center justify-center text-white shadow-lg shadow-[#b85c1f]/30">
            <Coffee className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl leading-tight text-white tracking-wide">
              Bean & Brew
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#ea8e47] flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3" /> Staff Admin Portal
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#b85c1f] to-[#c76828] text-white font-bold shadow-md shadow-[#b85c1f]/25"
                      : "text-[#d8c8b8] hover:text-white hover:bg-[#342015]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Links */}
      <div className="p-4 border-t border-[#3d271b] space-y-3">
        {/* View Customer Website Link */}
        <a
          href="http://localhost:5000"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#342015] hover:bg-[#42291b] text-[#faede3] text-xs font-medium transition-colors group border border-[#4a2e1f]"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-[#ea8e47]" />
            <span>Open Customer Site</span>
          </span>
          <span className="text-[10px] text-[#a89688] group-hover:text-white">:5000</span>
        </a>

        {/* Admin User Card */}
        <div className="p-3 bg-[#1d120c] rounded-xl border border-[#3d271b] flex items-center justify-between">
          <div className="truncate mr-2">
            <p className="text-xs font-bold text-white truncate">{user?.name || "Master Admin"}</p>
            <p className="text-[10px] text-[#a89688] truncate">{user?.email || "admin@beanbrew.com"}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-[#a89688] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
