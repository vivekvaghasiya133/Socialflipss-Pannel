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
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-2xl border-t border-slate-200/90 px-2 pt-2.5 pb-6 shadow-[0_-4px_25px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = currentPath === item.path || (item.path === "/admin/production-hub" && currentPath === "/admin");

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all ${
                isActive
                  ? "text-[#FF5200] font-black scale-105"
                  : "text-slate-500 hover:text-slate-800 font-bold"
              }`}
            >
              <span className={`text-xl transition-transform ${isActive ? "scale-110 drop-shadow-[0_2px_8px_rgba(255,82,0,0.3)]" : "opacity-75"}`}>
                {item.icon}
              </span>
              <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5200] mt-1 shadow-[0_0_6px_rgba(255,82,0,0.8)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
