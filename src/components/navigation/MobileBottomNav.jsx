"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function MobileBottomNav() {
  const location = useLocation();
  const currentPath = location?.pathname || "";

  const navItems = [
    { label: "Production", icon: "🎬", path: "/admin/production-hub" },
    { label: "Punch & Time", icon: "⏱️", path: "/admin/time-tracker" },
    { label: "Clients", icon: "👥", path: "/admin/clients" },
    { label: "Invoices", icon: "🧾", path: "/admin/invoices" },
    { label: "Settings", icon: "⚙️", path: "/admin/agency-settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800/80 px-2 py-2 safe-area-pb shadow-2xl">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = currentPath === item.path || (item.path === "/admin/production-hub" && currentPath === "/admin");

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all ${
                isActive
                  ? "text-indigo-400 font-extrabold scale-105"
                  : "text-slate-400 hover:text-slate-200 font-medium"
              }`}
            >
              <span className={`text-xl transition-transform ${isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" : ""}`}>
                {item.icon}
              </span>
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-0.5 shadow-[0_0_6px_rgba(99,102,241,1)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
