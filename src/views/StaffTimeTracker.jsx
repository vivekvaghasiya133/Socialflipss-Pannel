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
  getStaffTimeHistory,
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
  const [showPunchOutModal, setShowPunchOutModal] = useState(false);

  // Staff Punch History State (Tab & Modal)
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [selectedStaffMonth, setSelectedStaffMonth] = useState(new Date().toISOString().slice(0, 7));
  const [staffHistoryData, setStaffHistoryData] = useState(null);
  const [staffHistoryLoading, setStaffHistoryLoading] = useState(false);

  // Modal State for instant card click
  const [showStaffHistoryModal, setShowStaffHistoryModal] = useState(null);
  const [modalMonth, setModalMonth] = useState(new Date().toISOString().slice(0, 7));
  const [modalHistoryData, setModalHistoryData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const getRecentMonths = () => {
    const list = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      list.push({ val, label });
    }
    return list;
  };

  const loadStaffHistory = async (userId, month) => {
    if (!userId) return;
    setStaffHistoryLoading(true);
    try {
      const res = await getStaffTimeHistory(userId, { month: month || selectedStaffMonth });
      if (res.data?.success) {
        setStaffHistoryData(res.data);
      }
    } catch (err) {
      console.error("Error loading staff history:", err);
    } finally {
      setStaffHistoryLoading(false);
    }
  };

  const openStaffHistoryModal = async (member) => {
    setShowStaffHistoryModal(member);
    const curMonth = selectedStaffMonth || new Date().toISOString().slice(0, 7);
    setModalMonth(curMonth);
    setModalLoading(true);
    try {
      const res = await getStaffTimeHistory(member.userId, { month: curMonth });
      if (res.data?.success) {
        setModalHistoryData(res.data);
      }
    } catch (err) {
      console.error("Error loading modal history:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleModalMonthChange = async (newMonth) => {
    setModalMonth(newMonth);
    if (!showStaffHistoryModal) return;
    setModalLoading(true);
    try {
      const res = await getStaffTimeHistory(showStaffHistoryModal.userId, { month: newMonth });
      if (res.data?.success) {
        setModalHistoryData(res.data);
      }
    } catch (err) {
      console.error("Error changing modal month:", err);
    } finally {
      setModalLoading(false);
    }
  };
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
    } catch (err) {
      alert(err.response?.data?.message || "Failed to punch in");
    } finally {
      await loadStatus();
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

  const handlePunchOutClick = () => {
    setShowPunchOutModal(true);
  };

  const confirmPunchOutAction = async () => {
    setActionLoading(true);
    try {
      const res = await punchOut();
      showToast(res.data?.message || "Punched out! Have a great evening. 🌟");
      setShowPunchOutModal(false);
      await loadStatus();
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

  const myLog = timeStatus?.todayLog || timeStatus?.log;
  const isPunchedIn = Boolean(
    timeStatus?.isPunchedIn ??
    (timeStatus?.punchedIn !== undefined ? timeStatus?.punchedIn : (myLog?.status === "punched_in" || myLog?.status === "on_break"))
  );
  const isOnBreak = Boolean(
    timeStatus?.isOnBreak ??
    (myLog?.status === "on_break" || (myLog?.breaks && myLog.breaks.some(b => !b.endTime)))
  );
  const isPunchedOut = Boolean(
    timeStatus?.isPunchedOut ??
    (myLog?.status === "punched_out")
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans pb-24">
      {/* ── SLEEK FLOATING ISLAND TOAST ── */}
      {toastMsg && (
        <div className="fixed top-5 left-4 right-4 max-w-2xl mx-auto z-50 p-4 bg-slate-900/95 text-white font-black text-xs rounded-2xl shadow-2xl backdrop-blur-xl border border-slate-700 flex items-center justify-between animate-slideDown">
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
          { id: "staff_history", label: "👥 Staff Attendance History", icon: "📊" },
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
                {isPunchedOut ? (
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">👋</span>
                      <div>
                        <h4 className="font-black text-slate-900 text-base">Shift Completed for Today!</h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Punched out at: <span className="font-mono font-black">{myLog?.punchOutTime ? new Date(myLog.punchOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}</span> • Total Work: <span className="font-bold text-emerald-600 font-mono">{Math.floor((myLog?.totalWorkMinutes || 0) / 60)}h {(myLog?.totalWorkMinutes || 0) % 60}m</span>
                        </p>
                      </div>
                    </div>
                    <button
                      disabled={actionLoading}
                      onClick={handlePunchIn}
                      className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all"
                    >
                      Re-Punch In
                    </button>
                  </div>
                ) : !isPunchedIn ? (
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
                        onClick={handlePunchOutClick}
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
                    className="p-5 bg-white border border-slate-200/80 hover:border-orange-200 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-wrap items-center justify-between gap-3 group"
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
                    {/* View Punch History Button */}
                    <div className="w-full pt-3 mt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => openStaffHistoryModal(member)}
                        className="w-full py-1.5 px-3 bg-slate-50 hover:bg-[#FF5200] hover:text-white border border-slate-200 hover:border-[#FF5200] text-slate-700 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 group/btn"
                      >
                        <span>📅</span>
                        <span>Punch History (Month & Day)</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: ALL STAFF ATTENDANCE HISTORY (MONTH & DAY WISE) ── */}
      {viewTab === "staff_history" && (
        <div className="space-y-6">
          {/* Header & Filter Controls Card */}
          <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>👥 Staff Punch-In / Punch-Out & Attendance History</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Complete day-wise and month-wise records of arrival, departure, breaks, and net work hours.
                </p>
              </div>

              <span className="text-xs font-bold px-3.5 py-1.5 bg-orange-50 text-[#FF5200] border border-orange-200 rounded-full shrink-0">
                {teamOverview.length} Active Staff Members
              </span>
            </div>

            {/* Filter Bar: Select Staff & Select Month */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1.5">
                  👤 Select Staff Member <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedStaffId(id);
                    loadStaffHistory(id, selectedStaffMonth);
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-[#FF5200]"
                >
                  <option value="">-- Choose Staff Member --</option>
                  {teamOverview.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.name} ({m.position || m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1.5">
                  📅 Select Month
                </label>
                <select
                  value={selectedStaffMonth}
                  onChange={(e) => {
                    const m = e.target.value;
                    setSelectedStaffMonth(m);
                    if (selectedStaffId) loadStaffHistory(selectedStaffId, m);
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-[#FF5200]"
                >
                  <option value="all">All Available Records</option>
                  {getRecentMonths().map((rm) => (
                    <option key={rm.val} value={rm.val}>
                      {rm.label} ({rm.val})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedStaffId) loadStaffHistory(selectedStaffId, selectedStaffMonth);
                  }}
                  className="w-full py-2.5 px-4 bg-[#FF5200] hover:bg-[#E04800] text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>🔄 Refresh History</span>
                </button>
              </div>
            </div>

            {/* Monthly Summary Statistics Cards */}
            {staffHistoryData?.summary && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-2">
                <div className="p-4 bg-orange-50/80 border border-orange-200 rounded-2xl">
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-700 block mb-0.5">🗓️ Days Present</span>
                  <span className="text-xl font-black font-mono text-[#FF5200]">{staffHistoryData.summary.daysPresent}</span>
                  <span className="text-[10px] text-slate-500 block">Days recorded</span>
                </div>

                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block mb-0.5">⏱️ Total Work Hours</span>
                  <span className="text-xl font-black font-mono text-emerald-700">{staffHistoryData.summary.totalWorkHours}h</span>
                  <span className="text-[10px] text-slate-500 block">Net on-duty time</span>
                </div>

                <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block mb-0.5">⚡ Daily Average</span>
                  <span className="text-xl font-black font-mono text-purple-700">{staffHistoryData.summary.avgDailyWorkHours}h</span>
                  <span className="text-[10px] text-slate-500 block">Hours / day</span>
                </div>

                <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block mb-0.5">☕ Total Breaks</span>
                  <span className="text-xl font-black font-mono text-amber-700">{staffHistoryData.summary.totalBreakHours}h</span>
                  <span className="text-[10px] text-slate-500 block">Rest & meals</span>
                </div>

                <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 block mb-0.5">🎬 Reels Output</span>
                  <span className="text-xl font-black font-mono text-blue-700">{staffHistoryData.summary.totalReelsEdited}</span>
                  <span className="text-[10px] text-slate-500 block">Reels finished</span>
                </div>

                <div className="p-4 bg-teal-50/80 border border-teal-200 rounded-2xl">
                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 block mb-0.5">🎥 Shoots Done</span>
                  <span className="text-xl font-black font-mono text-teal-700">{staffHistoryData.summary.totalShootsDone}</span>
                  <span className="text-[10px] text-slate-500 block">Shoots credited</span>
                </div>
              </div>
            )}
          </div>

          {/* Day-wise History Table */}
          <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-black text-slate-900 tracking-tight">
                📅 Day-by-Day Punch In & Out Breakdown
                {staffHistoryData?.staff?.name && (
                  <span className="text-sm font-semibold text-slate-500 ml-2">
                    ({staffHistoryData.staff.name} — {selectedStaffMonth === "all" ? "All Time" : selectedStaffMonth})
                  </span>
                )}
              </h4>
              <span className="text-xs font-bold text-slate-400">
                {staffHistoryData?.logs?.length || 0} Records Found
              </span>
            </div>

            {staffHistoryLoading ? (
              <div className="p-12 text-center text-slate-500 text-xs font-medium">Loading staff attendance logs... ⏳</div>
            ) : !selectedStaffId ? (
              <div className="p-12 text-center text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                👈 Please select a Staff Member from the dropdown above to view their punch-in and punch-out history.
              </div>
            ) : (staffHistoryData?.logs || []).length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No punch records found for this staff member in {selectedStaffMonth === "all" ? "the selected period" : selectedStaffMonth}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-black text-[10px] tracking-wider bg-slate-50/50">
                      <th className="py-3 px-4 rounded-l-xl">Date</th>
                      <th className="py-3 px-4">Punch In (Clock In)</th>
                      <th className="py-3 px-4">Punch Out (Clock Out)</th>
                      <th className="py-3 px-4">Total Break</th>
                      <th className="py-3 px-4">Net Working Hours</th>
                      <th className="py-3 px-4">Output / Score</th>
                      <th className="py-3 px-4 text-center rounded-r-xl">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {staffHistoryData.logs.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-black font-mono text-slate-900">
                          {item.date}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {item.punchInTime ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span>{new Date(item.punchInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                              {item.punchInLocation && <span className="text-[10px] text-slate-400 font-normal">({item.punchInLocation})</span>}
                            </span>
                          ) : (
                            <span className="text-slate-400">--:--</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {item.punchOutTime ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-500" />
                              <span>{new Date(item.punchOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                              {item.punchOutLocation && <span className="text-[10px] text-slate-400 font-normal">({item.punchOutLocation})</span>}
                            </span>
                          ) : (
                            <span className="text-amber-600 font-bold">Currently On-Duty</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          <span className="font-bold text-amber-700">{item.totalBreakMinutes || 0} mins</span>
                          {item.breaks && item.breaks.length > 0 && (
                            <span className="text-[10px] text-slate-400 block">
                              {item.breaks.length} {item.breaks.length === 1 ? "break" : "breaks"}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-black text-emerald-700 text-sm">
                          {Math.floor((item.totalWorkMinutes || 0) / 60)}h {(item.totalWorkMinutes || 0) % 60}m
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#FF5200]">
                          {(item.reelsEditedCount || 0) > 0 && <span>{item.reelsEditedCount} Reels </span>}
                          {(item.shootsCompletedCount || 0) > 0 && <span className="text-emerald-600">· {item.shootsCompletedCount} Shoots</span>}
                          {!(item.reelsEditedCount || 0) && !(item.shootsCompletedCount || 0) && <span className="text-slate-400">-</span>}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              item.status === "punched_out"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : item.status === "on_break"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {item.status ? item.status.replace("_", " ") : "logged"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
          {/* ── IN-APP PUNCH OUT CONFIRMATION MODAL ── */}
      {showPunchOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center animate-scaleUp">
            <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-500 flex items-center justify-center text-3xl mx-auto mb-4 border border-red-100">
              👋
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">Confirm Punch Out</h3>
            <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed">
              Are you sure you want to end your shift for today? Your total net working hours will be calculated and saved.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowPunchOutModal(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={confirmPunchOutAction}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                {actionLoading ? "Punching Out..." : "Yes, Punch Out 👋"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}