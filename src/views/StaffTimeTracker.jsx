"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getTimeStatus,
  punchIn,
  startBreak,
  endBreak,
  punchOut,
  getTeamTimeOverview,
  getMyTimeHistory,
  getMyLeaves,
  applyMyLeave,
} from "../api/agencyOsApi";
import { useAuth } from "../context/AuthContext";

export default function StaffTimeTracker() {
  const { user, isAdmin } = useAuth();
  const [timeStatus, setTimeStatus] = useState(null);
  const [teamOverview, setTeamOverview] = useState([]);
  const [myHistory, setMyHistory] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Leave Modal State
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    fromDate: new Date().toISOString().split("T")[0],
    toDate: new Date().toISOString().split("T")[0],
    leaveType: "full_day",
    reason: "",
  });

  // Active view tab: "dashboard", "history", "leaves"
  const [viewTab, setViewTab] = useState("dashboard");

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const [statusRes, teamRes, historyRes, leavesRes] = await Promise.all([
        getTimeStatus(),
        getTeamTimeOverview(),
        getMyTimeHistory(),
        getMyLeaves(),
      ]);
      if (statusRes.data?.success) setTimeStatus(statusRes.data);
      if (teamRes.data?.success) setTeamOverview(teamRes.data.team || []);
      if (historyRes.data?.success) setMyHistory(historyRes.data.history || []);
      if (leavesRes.data?.success) setMyLeaves(leavesRes.data.leaves || []);
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
    setTimeout(() => setToastMsg(""), 3500);
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

  const handleStartBreak = async (type) => {
    setActionLoading(true);
    try {
      const res = await startBreak({ type: type || "Tea Break" });
      showToast(`Break started (${type || "Tea"}). Enjoy! ☕`);
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
      showToast("Break ended! Welcome back to work. 🚀");
      loadStatus();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to end break");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePunchOut = async () => {
    if (!window.confirm("Are you sure you want to Punch Out for today?")) return;
    setActionLoading(true);
    try {
      const res = await punchOut();
      showToast(res.data?.message || "Punched out! Have a great evening. 🌟");
      loadStatus();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to punch out");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApplyLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!leaveForm.reason.trim()) {
      alert("Please enter a reason for your leave!");
      return;
    }
    setActionLoading(true);
    try {
      await applyMyLeave(leaveForm);
      showToast("Leave applied successfully! Admin notified. 🌴");
      setShowLeaveModal(false);
      setLeaveForm({
        fromDate: new Date().toISOString().split("T")[0],
        toDate: new Date().toISOString().split("T")[0],
        leaveType: "full_day",
        reason: "",
      });
      loadStatus();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit leave");
    } finally {
      setActionLoading(false);
    }
  };

  const myLog = timeStatus?.todayLog;
  const isPunchedIn = timeStatus?.isPunchedIn;
  const isOnBreak = timeStatus?.isOnBreak;

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans pb-24">
      {/* ── SLEEK FLOATING ISLAND TOAST ── */}
      {toastMsg && (
        <div className="fixed top-5 left-4 right-4 max-w-md mx-auto z-50 p-4 bg-slate-900/95 text-white font-black text-xs rounded-2xl shadow-2xl backdrop-blur-xl border border-slate-700 flex items-center justify-between animate-slideDown">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-xs">✓</span>
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg("")} className="text-slate-400 hover:text-white font-bold ml-2">✕</button>
        </div>
      )}

      {/* ── HEADER HERO ── */}
      <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200 text-[#FF5200] rounded-full text-xs font-black uppercase tracking-wider mb-2">
            <span>Staff-Friendly HRMS Portal</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span>⏱️ Punch, Breaks & Leave Desk</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium max-w-xl">
            One-tap shift punch, tea/lunch breaks, date-wise timesheet history, and 1-click leave applications.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowLeaveModal(true)}
            className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <span>🌴</span>
            <span>+ Apply for Leave</span>
          </button>
        </div>
      </div>

      {/* ── HORIZONTAL VIEW TABS ── */}
      <div className="flex p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto max-w-md">
        {[
          { id: "dashboard", label: "Today's Punch", icon: "⏱️" },
          { id: "history", label: "My Timesheet History", icon: "📅", count: myHistory.length },
          { id: "leaves", label: "My Leaves", icon: "🌴", count: myLeaves.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setViewTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              viewTab === tab.id
                ? "bg-[#FF5200] text-white shadow-md shadow-orange-500/30"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  viewTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB 1: TODAY'S PUNCH & LIVE SCOREBOARD ── */}
      {viewTab === "dashboard" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Clock & Punch Widget */}
            <div className="lg:col-span-2 p-8 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Today's Shift</span>
                  <h2 className="text-2xl font-black text-slate-900 mt-0.5">Welcome, {user?.name}! 👋</h2>
                  <span className="text-xs text-[#FF5200] font-black uppercase tracking-wider">{user?.position || user?.role?.toUpperCase()}</span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-3xl font-black font-mono text-slate-900 tracking-wider block">
                    {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {currentTime.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>

              {/* Current Punch State Banner */}
              <div className="my-6">
                {!isPunchedIn ? (
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-black text-slate-900 text-base">You haven't punched in yet today.</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Tap the punch-in button when you start your shift.</p>
                    </div>
                    <button
                      disabled={actionLoading}
                      onClick={handlePunchIn}
                      className="px-8 py-3.5 bg-gradient-to-r from-[#FF5200] to-[#FC8019] hover:from-[#E04800] hover:to-[#EB7410] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/25 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                    >
                      🚀 Punch In Now
                    </button>
                  </div>
                ) : isOnBreak ? (
                  <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl animate-pulse">☕</span>
                      <div>
                        <h4 className="font-black text-amber-900 text-base">You are currently on a Break</h4>
                        <p className="text-xs text-amber-700 font-medium mt-0.5">Your break duration is being logged accurately.</p>
                      </div>
                    </div>
                    <button
                      disabled={actionLoading}
                      onClick={handleEndBreak}
                      className="px-6 py-3 bg-[#FF5200] hover:bg-[#E04800] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                    >
                      End Break & Resume Work ➔
                    </button>
                  </div>
                ) : (
                  <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="h-3.5 w-3.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <div>
                        <h4 className="font-black text-emerald-950 text-base">Shift Active (Working)</h4>
                        <p className="text-xs text-emerald-800 font-medium mt-0.5">
                          Punched in at: <span className="font-mono font-black">{myLog?.punchInTime ? new Date(myLog.punchInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        disabled={actionLoading}
                        onClick={() => handleStartBreak("Tea Break")}
                        className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition-all"
                      >
                        ☕ Tea Break
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleStartBreak("Lunch Break")}
                        className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition-all"
                      >
                        🍱 Lunch Break
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={handlePunchOut}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-black text-xs rounded-xl shadow-sm transition-all"
                      >
                        👋 Punch Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Metrics Footer */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-center">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Arrival</span>
                  <span className="text-sm font-black font-mono text-slate-800">
                    {myLog?.punchInTime ? new Date(myLog.punchInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Not Yet"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Break</span>
                  <span className="text-sm font-black font-mono text-slate-800">{myLog?.totalBreakMinutes || 0} mins</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Net Work</span>
                  <span className="text-sm font-black font-mono text-emerald-600">
                    {Math.floor((myLog?.totalWorkMinutes || 0) / 60)}h {(myLog?.totalWorkMinutes || 0) % 60}m
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Daily Scorecard Card */}
            <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">Daily Scorecard</span>
                  <span className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF5200] flex items-center justify-center text-lg font-black">
                    🏆
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Today's Content Score</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Automatic credit every time a reel is edited or a shoot is marked complete.
                </p>

                <div className="my-6 p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Reels Edited Today:</span>
                    <span className="text-xl font-black font-mono text-[#FF5200]">{myLog?.reelsEditedCount || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Shoots Completed:</span>
                    <span className="text-xl font-black font-mono text-emerald-600">{myLog?.shootsCompletedCount || 0}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-500">Daily Target: 3 Reels</span>
                  <span className="text-[#FF5200] font-mono font-black">
                    {Math.min(100, Math.round(((myLog?.reelsEditedCount || 0) / 3) * 100))}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[#FF5200] to-emerald-500 transition-all duration-700"
                    style={{ width: `${Math.min(100, ((myLog?.reelsEditedCount || 0) / 3) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── TEAM LIVE PRESENCE BOARD ── */}
          <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>👥 Live Team Presence & Daily Output</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Real-time office presence, current status, and reels counter per staff.</p>
              </div>
              <span className="text-xs font-bold px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-full">
                {teamOverview.length} Staff Members
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {teamOverview.map((member) => {
                const isWorking = member.status === "punched_in";
                const isBreak = member.status === "on_break";
                const isOut = member.status === "punched_out";

                return (
                  <div
                    key={member.userId}
                    className="p-5 bg-white border border-slate-200/80 hover:border-orange-200 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FF5200] to-[#FC8019] flex items-center justify-center font-black text-white text-base shadow-sm">
                          {member.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <span
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                            isWorking ? "bg-emerald-500" : isBreak ? "bg-amber-400" : isOut ? "bg-blue-400" : "bg-slate-300"
                          }`}
                        />
                      </div>

                      <div>
                        <h4 className="font-black text-sm text-slate-900 group-hover:text-[#FF5200] transition-colors">{member.name}</h4>
                        <span className="text-[11px] text-slate-400 font-medium block">{member.position || member.role}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border block mb-1 ${
                          isWorking
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : isBreak
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : isOut
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                      >
                        {isWorking ? "Working" : isBreak ? "Break" : isOut ? "Left" : "Absent"}
                      </span>
                      <span className="text-xs font-mono font-black text-[#FF5200]">
                        {member.reelsEdited || 0} Reels Done
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: MY DATE-WISE TIMESHEET HISTORY ── */}
      {viewTab === "history" && (
        <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">📅 My Personal Attendance & Break History</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Complete date-wise log of punch-in, punch-out, breaks, and reels output.</p>
            </div>
            <span className="text-xs font-bold px-3.5 py-1.5 bg-orange-50 text-[#FF5200] border border-orange-200 rounded-full">
              {myHistory.length} Days Recorded
            </span>
          </div>

          {myHistory.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-medium">No past attendance logs found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-black text-[10px] tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Clock In</th>
                    <th className="py-3 px-4">Clock Out</th>
                    <th className="py-3 px-4">Total Break</th>
                    <th className="py-3 px-4">Net Work Time</th>
                    <th className="py-3 px-4">Reels Output</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myHistory.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-black font-mono text-slate-900">{item.date}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {item.punchInTime ? new Date(item.punchInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {item.punchOutTime ? new Date(item.punchOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {item.totalBreakMinutes || 0} mins ({item.breaks?.length || 0} breaks)
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                        {Math.floor((item.totalWorkMinutes || 0) / 60)}h {(item.totalWorkMinutes || 0) % 60}m
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#FF5200]">
                        {item.reelsEditedCount || 0} Reels
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            item.status === "punched_out"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {item.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: MY LEAVE REQUESTS ── */}
      {viewTab === "leaves" && (
        <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">🌴 My Leave Applications</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Check current leave status (Approved, Pending, Rejected).</p>
            </div>
            <button
              onClick={() => setShowLeaveModal(true)}
              className="px-5 py-2.5 bg-[#FF5200] hover:bg-[#E04800] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <span>+</span>
              <span>Apply New Leave</span>
            </button>
          </div>

          {myLeaves.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-medium">No leave applications found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myLeaves.map((lv) => (
                <div key={lv._id} className="p-6 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono font-black text-slate-800">
                      {lv.fromDate} ➔ {lv.toDate}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        lv.status === "approved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : lv.status === "rejected"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      {lv.status}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Leave Type</span>
                    <span className="text-xs font-black text-slate-900 capitalize">{lv.leaveType?.replace("_", " ")}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reason</span>
                    <p className="text-xs text-slate-600 font-medium">{lv.reason}</p>
                  </div>

                  {lv.adminNote && (
                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                      <span className="font-bold">Admin Note: </span>
                      <span>{lv.adminNote}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: APPLY FOR LEAVE ── */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-black text-slate-900 mb-1">🌴 Apply for Leave</h3>
            <p className="text-xs text-slate-500 mb-4">Request will be sent directly to Admin for approval.</p>

            <form onSubmit={handleApplyLeaveSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">From Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.fromDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">To Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.toDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Leave Type</label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                >
                  <option value="full_day">Full Day Leave</option>
                  <option value="half_day">Half Day Leave</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Reason for Leave</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Family function in Ahmedabad / Medical reason..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-md"
                >
                  {actionLoading ? "Submitting..." : "Submit Leave Application ➔"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
