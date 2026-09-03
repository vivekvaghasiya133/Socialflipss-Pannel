"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { portalLogin, portalSendOTP, portalVerifyOTP } from "../../api/portalApi";
import { getAgencyConfig } from "../../api/agencyOsApi";

export default function PortalLogin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("password"); // "password" | "otp"
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [branding, setBranding] = useState(null);

  // Password login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // OTP login
  const [otpContact, setOtpContact] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    getAgencyConfig()
      .then((res) => {
        if (res.data?.success && res.data.config) {
          setBranding(res.data.config);
        }
      })
      .catch(() => {});
  }, []);

  const saveAndRedirect = (data) => {
    localStorage.setItem("sf_portal_token", data.token);
    localStorage.setItem("sf_portal_client", JSON.stringify(data.client));
    window.location.href = "/portal";
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await portalLogin({ email, password });
      saveAndRedirect(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid client credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    setLoading(true);
    setError("");
    setInfo("");
    const isEmail = otpContact.includes("@");
    try {
      const res = await portalSendOTP(isEmail ? { email: otpContact } : { mobile: otpContact });
      setInfo(res.data.message || "OTP sent successfully!");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "OTP send failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    setError("");
    const isEmail = otpContact.includes("@");
    try {
      const res = await portalVerifyOTP(isEmail ? { email: otpContact, otp } : { mobile: otpContact, otp });
      saveAndRedirect(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP entered.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between items-center p-4 sm:p-6 font-sans relative overflow-hidden select-none">
      {/* Background orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between py-3 px-1 z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-md rounded-full border border-slate-200/60 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold text-slate-700">Client VIP Access</span>
        </div>

        <a
          href="/login"
          className="text-xs font-black text-slate-600 hover:text-slate-900 bg-white/80 px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs transition-all active:scale-95"
        >
          Agency Admin ➔
        </a>
      </header>

      {/* Main Card */}
      <main className="w-full max-w-[430px] mx-auto my-auto z-10">
        <div className="bg-white/95 backdrop-blur-2xl rounded-[32px] p-7 sm:p-9 shadow-[0_20px_50px_-15px_rgba(255,82,0,0.08),0_10px_25px_-5px_rgba(0,0,0,0.04)] border border-slate-100/90 relative">
          <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-[#FF5200] to-transparent rounded-full opacity-80" />

          {/* Logo & Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center p-1.5 bg-white rounded-2xl shadow-md shadow-orange-500/10 border border-slate-100 mb-3.5">
              <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center bg-slate-950">
                <img
                  src={branding?.logoUrl || "/logo.jpg"}
                  alt="SocialFlipss Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
                <span className="text-white font-black text-lg tracking-wider">SF</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-orange-50 border border-orange-200/60 rounded-full text-[10px] font-black uppercase tracking-wider text-[#FF5200] mb-2">
              <span>Client Deliverables Portal</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {branding?.agencyName || "SocialFlipss"}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Track reels, approve scripts, and view your monthly delivery meter.
            </p>
          </div>

          {/* Alert messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-bold rounded-2xl border border-red-200">
              {error}
            </div>
          )}
          {info && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-2xl border border-emerald-200">
              {info}
            </div>
          )}

          {/* Tab Switcher */}
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-5">
            <button
              type="button"
              onClick={() => { setTab("password"); setError(""); setInfo(""); }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                tab === "password" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => { setTab("otp"); setStep(1); setError(""); setInfo(""); }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                tab === "otp" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              One-Tap OTP
            </button>
          </div>

          {/* Password Form */}
          {tab === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1.5 ml-1">Client Email</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-slate-400 text-sm">✉️</span>
                  <input
                    type="email"
                    required
                    placeholder="client@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-[#FF5200] focus:ring-3 focus:ring-orange-500/15"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1.5 ml-1">Password</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-slate-400 text-sm">🔒</span>
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-[#FF5200] focus:ring-3 focus:ring-orange-500/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  >
                    {showPass ? "👁️" : "🙈"}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[#FF5200] to-[#FC8019] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? "Verifying..." : "Access Client Portal ➔"}
                </button>
              </div>
            </form>
          )}

          {/* OTP Form */}
          {tab === "otp" && (
            <div className="space-y-4">
              {step === 1 ? (
                <>
                  <div>
                    <label className="text-xs font-extrabold text-slate-700 block mb-1.5 ml-1">Email or Mobile Number</label>
                    <input
                      type="text"
                      placeholder="client@company.com or 9876543210"
                      value={otpContact}
                      onChange={(e) => setOtpContact(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-[#FF5200]"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={loading || !otpContact}
                    onClick={handleSendOTP}
                    className="w-full py-4 bg-[#FF5200] hover:bg-[#E04800] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
                  >
                    {loading ? "Sending OTP..." : "Send Verification Code ➔"}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-extrabold text-slate-700 block mb-1.5 ml-1">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="• • • • • •"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="w-full py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xl text-center font-mono font-black text-slate-900 tracking-widest focus:outline-none focus:border-[#FF5200]"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={loading || otp.length !== 6}
                    onClick={handleVerifyOTP}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
                  >
                    {loading ? "Verifying..." : "Verify & Enter Portal ✓"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full text-center text-xs text-slate-500 font-bold hover:underline"
                  >
                    ← Change Email / Mobile
                  </button>
                </>
              )}
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 font-medium">
              Access is reserved for active agency clients of {branding?.agencyName || "SocialFlipss"}.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto text-center py-3 z-10">
        <p className="text-[10px] text-slate-400 font-semibold">
          🔒 Secure Client Portal • {new Date().getFullYear()} {branding?.agencyName || "SocialFlipss"}
        </p>
      </footer>
    </div>
  );
}
