"use client";

import React, { useState, useEffect } from "react";
import { loginAdmin } from "../api";
import { useAuth } from "../context/AuthContext";
import { getAgencyConfig } from "../api/agencyOsApi";

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [branding, setBranding] = useState(null);

  useEffect(() => {
    getAgencyConfig()
      .then((res) => {
        if (res.data?.success && res.data.config) {
          setBranding(res.data.config);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginAdmin(form);
      login(res.data.token, res.data.user);
      window.location.href = "/admin";
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between items-center p-4 sm:p-6 font-sans relative overflow-hidden select-none">
      {/* ── AMBIENT LUXURY GLOW BACKGROUND ORBS ── */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-orange-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* ── TOP APP BAR STATUS ── */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between py-3 px-1 z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-md rounded-full border border-slate-200/60 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold text-slate-700">Surat Studio HQ • Live</span>
        </div>

        <a
          href="/portal/login"
          className="text-xs font-black text-[#FF5200] hover:text-[#E04800] bg-orange-50 hover:bg-orange-100/80 px-3.5 py-1.5 rounded-full border border-orange-200/80 transition-all active:scale-95"
        >
          Client Portal ➔
        </a>
      </header>

      {/* ── MAIN LUXURY APP CARD ── */}
      <main className="w-full max-w-[430px] mx-auto my-auto z-10">
        <div className="bg-white/95 backdrop-blur-2xl rounded-[32px] p-7 sm:p-9 shadow-[0_20px_50px_-15px_rgba(255,82,0,0.08),0_10px_25px_-5px_rgba(0,0,0,0.04)] border border-slate-100/90 relative">
          {/* Top Accent Line */}
          <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-[#FF5200] to-transparent rounded-full opacity-80" />

          {/* Logo & App Title */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center p-1.5 bg-white rounded-2xl shadow-md shadow-orange-500/10 border border-slate-100 mb-3.5">
              <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center bg-slate-950">
                <img
                  src={branding?.logoUrl || "/logo.jpg"}
                  alt="SocialFlipss Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <span className="text-white font-black text-lg tracking-wider">SF</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-orange-50 border border-orange-200/60 rounded-full text-[10px] font-black uppercase tracking-wider text-[#FF5200] mb-2">
              <span>Agency OS • Enterprise</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {branding?.agencyName || "SocialFlipss"}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Sign in to manage your reels pipeline, shoots & staff desk.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50/90 border border-red-200 text-red-700 text-xs font-bold rounded-2xl flex items-center gap-2.5 animate-shake">
              <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs shrink-0">!</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1.5 ml-1">
                Email Address
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400 text-sm">✉️</span>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="admin@socialflipss.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50/90 border border-slate-200/80 rounded-2xl text-xs sm:text-sm text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#FF5200] focus:ring-3 focus:ring-orange-500/15 transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1 mr-1">
                <label className="text-xs font-extrabold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] font-bold text-[#FF5200] hover:underline cursor-pointer">
                  Forgot?
                </span>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400 text-sm">🔒</span>
                <input
                  type={showPass ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-11 pr-11 py-3.5 bg-slate-50/90 border border-slate-200/80 rounded-2xl text-xs sm:text-sm text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#FF5200] focus:ring-3 focus:ring-orange-500/15 transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 text-slate-400 hover:text-slate-700 p-1 cursor-pointer transition-colors"
                >
                  {showPass ? "👁️" : "🙈"}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1 px-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-[#FF5200] rounded cursor-pointer"
                />
                <span>Remember this device</span>
              </label>

              <span className="text-[11px] font-bold text-slate-400">v2.4 Pro</span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-[#FF5200] via-[#FF621F] to-[#FC8019] hover:from-[#E04800] hover:to-[#EB7410] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Agency OS</span>
                    <span>➔</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Hint Footer */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 font-medium">
              Need access or credentials? Contact agency administrator.
            </p>
          </div>
        </div>
      </main>

      {/* ── BOTTOM APP BAR FOOTER ── */}
      <footer className="w-full max-w-md mx-auto text-center py-3 z-10 space-y-1">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
          <span>🔒</span>
          <span>256-Bit SSL Encrypted Studio Operating System</span>
        </div>
        <p className="text-[10px] text-slate-400">
          © {new Date().getFullYear()} {branding?.agencyName || "SocialFlipss"}. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
