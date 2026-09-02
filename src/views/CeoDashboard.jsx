"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getClients } from "../api/clientsApi";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function CeoDashboard() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cliRes, contRes] = await Promise.all([
        getClients({ limit: 100 }),
        api.get("/content", { params: { type: "reel", limit: 300 } }),
      ]);
      setClients(cliRes.data?.clients || []);
      setContent(contRes.data?.content || []);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Operational metrics
  const activeClientsList = clients.filter((c) => c.status === "active");
  const inProgressList = content.filter((c) => c.stage !== "posted" && c.stage !== "idea");
  const waitingApprovalList = content.filter((c) => c.stage === "client_approval");
  const delayedList = content.filter((c) => {
    if (!c.postDate || c.stage === "posted") return false;
    return new Date(c.postDate) < new Date();
  });

  // Stage breakdown
  const scriptCount = content.filter((c) => c.stage === "script" || c.stage === "idea").length;
  const shootCount = content.filter((c) => c.stage === "shoot" || c.stage === "shooting").length;
  const editCount = content.filter((c) => c.stage === "edit" || c.stage === "editing").length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans">
      {/* ── SWIGGY-TIER HERO BANNER ── */}
      <div className="p-8 md:p-10 bg-gradient-to-r from-white via-orange-50/40 to-white rounded-3xl border border-orange-100/80 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100/70 text-[#FF5200] border border-orange-200 rounded-full text-xs font-black uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-[#FF5200] animate-pulse" />
            SocialFlipss Executive Command Center
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Namaste, {user?.name || "Vivek"}! 👋
          </h1>
          <p className="text-sm md:text-base text-slate-500 mt-1 max-w-xl font-medium">
            Here is your live creative assembly line, active client retainers, and today's agency output.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            to="/admin/production-hub"
            className="px-6 py-3.5 bg-gradient-to-r from-[#FF5200] to-[#FC8019] hover:from-[#E04800] hover:to-[#EB7410] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/25 transition-all active:scale-95 flex items-center gap-2"
          >
            <span>🎬</span>
            <span>Production Hub ➔</span>
          </Link>

          <Link
            to="/admin/time-tracker"
            className="px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs rounded-2xl shadow-sm transition-all active:scale-95 flex items-center gap-2"
          >
            <span>⏱️</span>
            <span>Punch & Time</span>
          </Link>

          <Link
            to="/admin/clients"
            className="px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs rounded-2xl shadow-sm transition-all active:scale-95 flex items-center gap-2"
          >
            <span>👥</span>
            <span>+ Onboard Client</span>
          </Link>
        </div>
      </div>

      {/* ── 4 CRISP METRIC KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Active Retainers */}
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Active Retainers
            </span>
            <span className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF5200] flex items-center justify-center text-lg font-black group-hover:scale-110 transition-transform">
              👥
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black text-slate-900 font-mono tracking-tight">
              {activeClientsList.length}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Live Brands
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-2">Active monthly billing clients</p>
        </div>

        {/* Card 2: Reels In Production */}
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Reels In Production
            </span>
            <span className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg font-black group-hover:scale-110 transition-transform">
              🎞️
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black text-slate-900 font-mono tracking-tight">
              {inProgressList.length}
            </span>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              Active Flow
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="h-1.5 rounded-full bg-gradient-to-r from-[#FF5200] to-indigo-500 w-3/4" />
          </div>
        </div>

        {/* Card 3: Pending Client Approvals */}
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Client Approvals
            </span>
            <span className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg font-black group-hover:scale-110 transition-transform">
              ⏳
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black text-slate-900 font-mono tracking-tight">
              {waitingApprovalList.length}
            </span>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Pending Pass
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-2">Reels awaiting client confirmation</p>
        </div>

        {/* Card 4: Delayed Reels */}
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Delayed Reels
            </span>
            <span className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-lg font-black group-hover:scale-110 transition-transform">
              ⚠️
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className={`text-4xl font-black font-mono tracking-tight ${delayedList.length > 0 ? "text-red-600" : "text-emerald-600"}`}>
              {delayedList.length}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                delayedList.length > 0
                  ? "text-red-700 bg-red-50 border-red-200"
                  : "text-emerald-700 bg-emerald-50 border-emerald-200"
              }`}
            >
              {delayedList.length > 0 ? "Needs Attention" : "All On Time"}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-2">Past scheduled post date</p>
        </div>
      </div>

      {/* ── SWIGGY-STYLE LIVE CREATIVE ASSEMBLY TRACKER ── */}
      <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🚀</span>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Live Creative Production Assembly Line
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Real-time progression of reels through ideation, shoot, edit, and delivery.
            </p>
          </div>
          <Link
            to="/admin/production-hub"
            className="text-xs font-extrabold text-[#FF5200] hover:text-[#E04800] flex items-center gap-1.5 uppercase tracking-wider"
          >
            <span>Open Production Studio</span>
            <span>➔</span>
          </Link>
        </div>

        {/* 4 Step Timeline Progress Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-100">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-black text-orange-950 uppercase tracking-wider">1. Script Vault</span>
              <span className="text-base font-black text-[#FF5200] font-mono">{scriptCount}</span>
            </div>
            <p className="text-xs text-orange-900/70 font-medium">Approved hooks ready for shooting</p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">2. Shoot Desk</span>
              <span className="text-base font-black text-emerald-600 font-mono">{shootCount}</span>
            </div>
            <p className="text-xs text-emerald-900/70 font-medium">On-ground shoots & raw footage capture</p>
          </div>

          <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-black text-indigo-950 uppercase tracking-wider">3. Edit Studio</span>
              <span className="text-base font-black text-indigo-600 font-mono">{editCount}</span>
            </div>
            <p className="text-xs text-indigo-900/70 font-medium">Video cutting, color & sound design</p>
          </div>

          <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-black text-blue-950 uppercase tracking-wider">4. Client Pass</span>
              <span className="text-base font-black text-blue-600 font-mono">{waitingApprovalList.length}</span>
            </div>
            <p className="text-xs text-blue-900/70 font-medium">Final quality check & client approval</p>
          </div>
        </div>
      </div>

      {/* ── CLIENT PORTFOLIO MATRIX TABLE ── */}
      <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>👥 Active Retainers Portfolio</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Live client accounts, primary point of contact, and WhatsApp quick connect.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3.5 py-1.5 rounded-full">
            {activeClientsList.length} Active Accounts
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF5200]" />
          </div>
        ) : activeClientsList.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-medium">No active clients found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-black text-[10px] tracking-wider">
                  <th className="py-4 px-4">Brand / Client</th>
                  <th className="py-4 px-4">Contact Person</th>
                  <th className="py-4 px-4">Industry</th>
                  <th className="py-4 px-4">Core Goal</th>
                  <th className="py-4 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeClientsList.slice(0, 8).map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-extrabold text-slate-900 text-sm">{c.businessName}</div>
                      <span className="text-[10px] text-[#FF5200] font-bold">{c.city || "Surat"}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-slate-700 font-semibold">{c.ownerName}</div>
                      <span className="text-[11px] font-mono text-slate-400">{c.mobile}</span>
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-medium">{c.industry || "General Retainer"}</td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {c.clientGoal || "Brand Authority"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => {
                          const text = encodeURIComponent(
                            `Hello ${c.businessName}! This is Vivek from SocialFlipss. We are reviewing your monthly content progress! ✨`
                          );
                          window.open(`https://api.whatsapp.com/send?phone=${c.mobile}&text=${text}`);
                        }}
                        className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold transition-all"
                      >
                        WhatsApp 💬
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
