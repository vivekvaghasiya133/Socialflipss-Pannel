"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getTimeStatus,
  punchIn,
  startBreak,
  endBreak,
  punchOut,
  getTeamTimeOverview,
} from "../api/agencyOsApi";
import { useAuth } from "../context/AuthContext";

export default function StaffTimeTracker() {
  const { user, isAdmin } = useAuth();
  const [timeStatus, setTimeStatus] = useState(null);
  const [teamOverview, setTeamOverview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const [statusRes, teamRes] = await Promise.all([
        getTimeStatus(),
        getTeamTimeOverview(),
      ]);
      if (statusRes.data?.success) setTimeStatus(statusRes.data);
      if (teamRes.data?.success) setTeamOverview(teamRes.data.team || []);
    } catch (err) {
      console.error("Error loading time status:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const handlePunchIn = async () => {
    setActionLoading(true);
    try {
      const res = await punchIn({ location: "Office HQ" });
      showToast(res.data?.message || "Punched in successfully! ✨");
      loadStatus();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to punch in");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartBreak = async (reason = "lunch") => {
    setActionLoading(true);
    try {
      const res = await startBreak({ reason });
      showToast(res.data?.message || "Break started! ☕");
      loadStatus();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to start break");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndBreak = async () => {
    setActionLoading(true);
    try {
      const res = await endBreak();
      showToast(res.data?.message || "Break ended! Welcome back 🚀");
      loadStatus();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to end break");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePunchOut = async () => {
    if (!window.confirm("Are you sure you want to punch out for the day?")) return;
    setActionLoading(true);
    try {
      const res = await punchOut();
      showToast(res.data?.message || "Punched out successfully! 👋");
      loadStatus();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to punch out");
    } finally {
      setActionLoading(false);
    }
  };

  const isPunchedIn = timeStatus?.punchedIn;
  const isOnBreak = timeStatus?.status === "on_break";
  const myLog = timeStatus?.log;

  // Format Elapsed Time
  const getElapsedString = () => {
    if (!myLog?.punchInTime || !isPunchedIn) return "0h 00m";
    const diffMins = Math.max(0, Math.floor((new Date() - new Date(myLog.punchInTime)) / 60000) - (myLog.totalBreakMinutes || 0));
    return `${Math.floor(diffMins / 60)}h ${String(diffMins % 60).padStart(2, "0")}m`;
  };

  return (
    <div className="min-h-screen pb-24 text-slate-100 font-sans">
      {/* Toast alert */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 p-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-2xl flex items-center gap-3 animate-slideIn">
          <span>✨</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-extrabold uppercase tracking-wider">
          Smart Operations HRMS
        </span>
        <h1 className="text-3xl font-black text-white mt-1 tracking-tight">
          ⏱️ Staff Time & Productivity Hub
        </h1>
        <p className="text-sm text-slate-400">
          One-tap arrival punch, break tracking, and automated editor performance scoreboard.
        </p>
      </div>

      {/* ── TOP HERO: DIGITAL CLOCK & USER PUNCH CARD ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left: Clock & Punch Widget */}
        <div className="lg:col-span-2 p-7 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Shift</span>
              <h2 className="text-xl font-black text-white mt-0.5">Welcome, {user?.name}! 👋</h2>
              <span className="text-xs text-indigo-400 font-semibold">{user?.position || user?.role?.toUpperCase()}</span>
            </div>

            <div className="text-right">
              <span className="text-3xl font-black font-mono text-white tracking-wider block">
                {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
              <span className="text-xs font-medium text-slate-400">
                {currentTime.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>

          {/* Current Punch State Banner */}
          <div className="my-6">
            {!isPunchedIn ? (
              <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-base">You haven't punched in yet today.</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Tap the punch-in button when you arrive at the office.</p>
                </div>
                <button
                  disabled={actionLoading}
                  onClick={handlePunchIn}
                  className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  🚀 Punch In Now
                </button>
              </div>
            ) : isOnBreak ? (
              <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl animate-pulse">☕</span>
                  <div>
                    <h4 className="font-bold text-amber-300 text-base">You are currently on a Break</h4>
                    <p className="text-xs text-amber-200/70 mt-0.5">Relax! Your break duration is being logged accurately.</p>
                  </div>
                </div>
                <button
                  disabled={actionLoading}
                  onClick={handleEndBreak}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/30 active:scale-95 transition-all cursor-pointer"
                >
                  End Break & Resume Work ➔
                </button>
              </div>
            ) : (
              <div className="p-5 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="h-3.5 w-3.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <div>
                    <h4 className="font-bold text-white text-base">Shift Active (Working)</h4>
                    <p className="text-xs text-indigo-300 mt-0.5">
                      Punched in at: {new Date(myLog.punchInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    disabled={actionLoading}
                    onClick={() => handleStartBreak("tea")}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    ☕ Tea Break
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleStartBreak("lunch")}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    🍱 Lunch Break
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={handlePunchOut}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    👋 Punch Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Live Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-center">
            <div className="p-2.5 bg-slate-950/50 rounded-xl">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">In-Time</span>
              <span className="text-xs font-mono font-bold text-white mt-1 block">
                {myLog?.punchInTime ? new Date(myLog.punchInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}
              </span>
            </div>
            <div className="p-2.5 bg-slate-950/50 rounded-xl">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Total Breaks</span>
              <span className="text-xs font-mono font-bold text-amber-400 mt-1 block">
                {myLog?.totalBreakMinutes || 0} mins
              </span>
            </div>
            <div className="p-2.5 bg-slate-950/50 rounded-xl">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Net Work Time</span>
              <span className="text-xs font-mono font-bold text-emerald-400 mt-1 block">
                {getElapsedString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Gamified Editor / Daily Output Scorecard */}
        <div className="p-7 bg-slate-900 border border-slate-800 rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider">
                Daily Productivity Score
              </span>
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="text-xl font-black text-white mt-1">Reels Completed Today</h3>
            <p className="text-xs text-slate-400 mt-1">
              Automatically credited whenever you mark an assigned reel "Complete" in the Pipeline!
            </p>
          </div>

          <div className="my-6 text-center">
            <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-indigo-400 to-emerald-400 font-mono">
              {myLog?.reelsEditedCount || 0}
            </span>
            <span className="text-xs text-slate-400 block mt-1 font-bold">Reels Finished Today</span>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-400">Daily Target: 3 Reels</span>
              <span className="text-emerald-400 font-mono">
                {Math.min(100, Math.round(((myLog?.reelsEditedCount || 0) / 3) * 100))}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-700"
                style={{ width: `${Math.min(100, ((myLog?.reelsEditedCount || 0) / 3) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── TEAM LIVE PRESENCE BOARD (For Admin & Whole Agency) ── */}
      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>👥 Live Team Presence & Daily Output</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time office presence, current status, and reels counter per staff.</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-800 text-slate-300 rounded-xl">
            {teamOverview.length} Staff Members
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamOverview.map((member) => {
            const isWorking = member.status === "punched_in";
            const isBreak = member.status === "on_break";
            const isOut = member.status === "punched_out";

            return (
              <div
                key={member.userId}
                className="p-4 bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-white text-sm">
                      {member.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-950 ${
                        isWorking ? "bg-emerald-500" : isBreak ? "bg-amber-400" : isOut ? "bg-blue-400" : "bg-slate-600"
                      }`}
                    />
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-white">{member.name}</h4>
                    <span className="text-[10px] text-slate-400 block">{member.position}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                      isWorking
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : isBreak
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : isOut
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {isWorking ? "Working" : isBreak ? "On Break" : isOut ? "Punched Out" : "Absent"}
                  </span>
                  <span className="text-xs font-mono font-bold text-indigo-400 block mt-1">
                    {member.reelsEdited} Reels Done
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
