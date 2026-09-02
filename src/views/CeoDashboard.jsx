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
    <div className="min-h-screen pb-20 text-slate-100 font-sans">
      {/* ── TOP HERO BANNER ── */}
      <div className="mb-8 p-6 md:p-8 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800/90 rounded-3xl backdrop-blur-2xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400">
              Agency Operations Live
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-medium">Surat HQ</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Welcome back, {user?.name || "Vivek"} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Here is your live creative production overview, client retainers, and today's team output.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            to="/admin/production-hub"
            className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs rounded-2xl shadow-xl shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-2"
          >
            <span>🎬</span>
            <span>Production Hub ➔</span>
          </Link>

          <Link
            to="/admin/time-tracker"
            className="px-4 py-3 bg-slate-800/90 hover:bg-slate-750 border border-slate-700 text-slate-200 font-bold text-xs rounded-2xl transition-all active:scale-95 flex items-center gap-2"
          >
            <span>⏱️</span>
            <span>Punch & Time</span>
          </Link>

          <Link
            to="/admin/clients"
            className="px-4 py-3 bg-slate-800/90 hover:bg-slate-750 border border-slate-700 text-slate-200 font-bold text-xs rounded-2xl transition-all active:scale-95 flex items-center gap-2"
          >
            <span>👥</span>
            <span>+ Onboard Client</span>
          </Link>
        </div>
      </div>

      {/* ── 4 LUXURY KPI METRIC CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Card 1: Active Retainers */}
        <div className="p-6 bg-slate-900/90 border border-slate-800/90 hover:border-indigo-500/40 rounded-3xl backdrop-blur-xl shadow-xl transition-all group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Active Retainers
            </span>
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 text-lg group-hover:scale-110 transition-transform">
              👥
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black text-white font-mono">{activeClientsList.length}</span>
            <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              Live Accounts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Brands actively billed monthly</p>
        </div>

        {/* Card 2: Reels In Production */}
        <div className="p-6 bg-slate-900/90 border border-slate-800/90 hover:border-amber-500/40 rounded-3xl backdrop-blur-xl shadow-xl transition-all group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Reels in Production
            </span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 text-lg group-hover:scale-110 transition-transform">
              🎞️
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black text-white font-mono">{inProgressList.length}</span>
            <span className="text-[11px] font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              Active Pipeline
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="h-1.5 rounded-full bg-gradient-to-r from-amber-500 to-indigo-500 w-3/4" />
          </div>
        </div>

        {/* Card 3: Client Approvals */}
        <div className="p-6 bg-slate-900/90 border border-slate-800/90 hover:border-purple-500/40 rounded-3xl backdrop-blur-xl shadow-xl transition-all group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Pending Approvals
            </span>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 text-lg group-hover:scale-110 transition-transform">
              ⏳
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black text-white font-mono">{waitingApprovalList.length}</span>
            <span className="text-[11px] font-extrabold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
              Needs Review
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Reels awaiting client sign-off</p>
        </div>

        {/* Card 4: Overdue / Delayed */}
        <div className="p-6 bg-slate-900/90 border border-slate-800/90 hover:border-red-500/40 rounded-3xl backdrop-blur-xl shadow-xl transition-all group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Delayed Reels
            </span>
            <span className="p-2 rounded-xl bg-red-500/10 text-red-400 text-lg group-hover:scale-110 transition-transform">
              ⚠️
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className={`text-4xl font-black font-mono ${delayedList.length > 0 ? "text-red-400" : "text-emerald-400"}`}>
              {delayedList.length}
            </span>
            <span
              className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md border ${
                delayedList.length > 0
                  ? "text-red-400 bg-red-500/10 border-red-500/20"
                  : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
              }`}
            >
              {delayedList.length > 0 ? "Attention Needed" : "On Track"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Passed scheduled post deadline</p>
        </div>
      </div>

      {/* ── INTERACTIVE CREATIVE ASSEMBLY LINE OVERVIEW ── */}
      <div className="mb-8 p-6 bg-slate-900/80 border border-slate-800 rounded-3xl backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span>🚀 Creative Assembly Line (Active Flow)</span>
            </h3>
            <p className="text-xs text-slate-400">Live breakdown of all reels across the production lifecycle.</p>
          </div>
          <Link
            to="/admin/production-hub"
            className="text-xs font-extrabold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            Open Full Production Studio ➔
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stage 1 */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-extrabold text-amber-400">📝 Script Vault</span>
              <span className="text-sm font-mono font-bold text-white">{scriptCount}</span>
            </div>
            <p className="text-[11px] text-slate-400">Concepts in ideation & script writing</p>
          </div>

          {/* Stage 2 */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-extrabold text-emerald-400">🎥 Shoot Field Desk</span>
              <span className="text-sm font-mono font-bold text-white">{shootCount}</span>
            </div>
            <p className="text-[11px] text-slate-400">On-ground shoots & footage capture</p>
          </div>

          {/* Stage 3 */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-extrabold text-purple-400">✂️ Editing Studio</span>
              <span className="text-sm font-mono font-bold text-white">{editCount}</span>
            </div>
            <p className="text-[11px] text-slate-400">Cutting, color grading & motion graphics</p>
          </div>

          {/* Stage 4 */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-extrabold text-blue-400">🚀 Client Delivery</span>
              <span className="text-sm font-mono font-bold text-white">{waitingApprovalList.length}</span>
            </div>
            <p className="text-[11px] text-slate-400">Approval and publishing to Instagram</p>
          </div>
        </div>
      </div>

      {/* ── CLIENT PORTFOLIO MATRIX ── */}
      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span>👥 Active Client Portfolio</span>
            </h3>
            <p className="text-xs text-slate-400">Live retainers, deliverable quotas, and account status.</p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
            {activeClientsList.length} Active Retainers
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : activeClientsList.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">No active clients found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-extrabold text-[10px] tracking-wider">
                  <th className="py-3 px-4">Brand / Client</th>
                  <th className="py-3 px-4">Owner / Mobile</th>
                  <th className="py-3 px-4">Industry</th>
                  <th className="py-3 px-4">Goal</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activeClientsList.slice(0, 8).map((c) => (
                  <tr key={c._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-white text-sm">{c.businessName}</div>
                      <span className="text-[10px] text-indigo-400 font-semibold">{c.city || "Gujarat"}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-medium">{c.ownerName}</div>
                      <span className="text-[11px] font-mono text-slate-400">{c.mobile}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{c.industry || "General Retail"}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-lg text-[10px] font-bold uppercase">
                        {c.clientGoal || "Authority"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          const text = encodeURIComponent(
                            `Hello ${c.businessName}! This is Vivek from SocialFlipss. We are reviewing your monthly content progress! ✨`
                          );
                          window.open(`https://api.whatsapp.com/send?phone=${c.mobile}&text=${text}`);
                        }}
                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold transition-all"
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
