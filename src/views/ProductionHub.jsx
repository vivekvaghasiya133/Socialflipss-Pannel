"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getProductionTasks,
  getProductionOverview,
  createProductionTask,
  updateScriptStage,
  updateShootStage,
  assignEditor,
  completeEdit,
  deliverTask,
  deleteProductionTask,
} from "../api/agencyOsApi";
import { getClients } from "../api/clientsApi";
import { useAuth } from "../context/AuthContext";

export default function ProductionHub() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [overview, setOverview] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // "all", "script", "shoot", "edit", "completed"
  const [searchQuery, setSearchQuery] = useState("");
  const [clientFilter, setClientFilter] = useState("");

  // Modals state
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showShootModal, setShowShootModal] = useState(null); // task object
  const [showScriptModal, setShowScriptModal] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiMsg, setConfettiMsg] = useState("");

  // Form states
  const [newTaskForm, setNewTaskForm] = useState({
    client: "",
    title: "",
    goal: "Authority",
    priority: "medium",
    reelNumber: 1,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tasksRes, overviewRes, clientsRes] = await Promise.all([
        getProductionTasks({
          stage: activeTab === "all" ? undefined : activeTab,
          clientId: clientFilter || undefined,
          search: searchQuery || undefined,
        }),
        getProductionOverview(),
        getClients({ limit: 100 }),
      ]);
      if (tasksRes.data?.success) setTasks(tasksRes.data.tasks);
      if (overviewRes.data?.success) setOverview(overviewRes.data);
      if (clientsRes.data?.clients) setClients(clientsRes.data.clients);
    } catch (err) {
      console.error("Error loading production data:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, clientFilter, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Trigger celebration animation
  const triggerCelebration = (msg) => {
    setConfettiMsg(msg);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  };

  // Quick Action: Shooter Done 1 Reel
  const handleQuickShootIncrement = async (task) => {
    try {
      const nextDone = (task.completedReels || 0) + 1;
      await updateShootStage(task._id, {
        completedReels: nextDone,
        shootStatus: nextDone >= (task.targetReels || 1) ? "done" : "in_progress",
      });
      triggerCelebration(`+1 Reel Shot for ${task.client?.businessName}! 🎥`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update shoot count");
    }
  };

  // Handle Quick Edit Complete
  const handleCompleteEdit = async (taskId, previewLink) => {
    try {
      await completeEdit(taskId, {
        editedPreviewLink: previewLink,
        editorNotes: "Completed via Production Hub",
      });
      triggerCelebration("Reel Editing Completed! +1 Credit to Editor Scorecard! 🎉");
      setShowEditModal(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to complete edit");
    }
  };

  // Handle Script Pass
  const handlePassScript = async (taskId) => {
    try {
      await updateScriptStage(taskId, {
        passToShoot: true,
        scriptStatus: "approved",
      });
      triggerCelebration("Script Approved & Moved to Shoot Stage! 🎬");
      setShowScriptModal(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to pass script");
    }
  };

  // Handle New Task Submit
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskForm.client || !newTaskForm.title) {
      alert("Please select a client and provide a title.");
      return;
    }
    try {
      await createProductionTask(newTaskForm);
      setShowNewTaskModal(false);
      setNewTaskForm({ client: "", title: "", goal: "Authority", priority: "medium", reelNumber: 1 });
      triggerCelebration("New Reel Task Created in Pipeline! ✨");
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create task");
    }
  };

  return (
    <div className="min-h-screen pb-24 text-slate-100 font-sans">
      {/* ── CELEBRATION CONFETTI OVERLAY ── */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none transition-all">
          <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-500 via-indigo-600 to-emerald-500 text-white shadow-2xl scale-110 animate-bounce flex flex-col items-center">
            <span className="text-5xl mb-2">🎉 🚀 ✨</span>
            <h2 className="text-2xl font-black text-center">{confettiMsg}</h2>
          </div>
        </div>
      )}

      {/* ── TOP HEADER & QUICK METRICS ── */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full text-xs font-extrabold uppercase tracking-wider">
              Creative Assembly Line
            </span>
            <span className="text-xs text-slate-400 font-medium">Auto-Sync</span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1 tracking-tight flex items-center gap-3">
            <span>🎬 Production Pipeline</span>
          </h1>
          <p className="text-sm text-slate-400">
            From Script ➔ Shoot ➔ Editing ➔ Delivery with live editor credit & client quotas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center gap-2 text-sm active:scale-95 cursor-pointer"
          >
            <span>✨</span>
            <span>+ New Reel Task</span>
          </button>
        </div>
      </div>

      {/* ── CLIENT DELIVERABLES QUOTA CAROUSEL (Top Bar) ── */}
      {overview?.clientQuotas && overview.clientQuotas.length > 0 && (
        <div className="mb-8 p-5 bg-slate-900/80 border border-slate-800 rounded-3xl backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span>🎯 Monthly Client Delivery Meters</span>
            </h3>
            <span className="text-xs text-indigo-400 font-bold">{overview.clientQuotas.length} Active Accounts</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {overview.clientQuotas.slice(0, 4).map((c) => (
              <div
                key={c._id}
                className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl hover:border-slate-700 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-sm text-white truncate max-w-[140px]">{c.businessName}</h4>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {c.delivered} / {c.quota} Reels
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-700"
                    style={{ width: `${c.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
                  <span>{c.packageName}</span>
                  <span className="font-bold text-emerald-400">{c.percentage}% Done</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STAGE TABS (Swiggy / Apple Style Segmented Control) ── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-lg overflow-x-auto max-w-full">
          {[
            { id: "all", label: "All Tasks", icon: "📋", count: tasks.length },
            { id: "script", label: "Script Vault", icon: "📝", count: overview?.stageCounts?.script || 0 },
            { id: "shoot", label: "Shooting (Field)", icon: "🎥", count: overview?.stageCounts?.shoot || 0 },
            { id: "edit", label: "Editing Queue", icon: "✂️", count: overview?.stageCounts?.edit || 0 },
            { id: "completed", label: "Delivered", icon: "🚀", count: overview?.stageCounts?.completed || 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 text-xs font-semibold rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Clients</option>
            {clients.map((cl) => (
              <option key={cl._id} value={cl._id}>
                {cl.businessName}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search tasks, shoots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-slate-800 text-xs rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44 md:w-56"
          />
        </div>
      </div>

      {/* ── PRODUCTION CARDS GRID (Luxury Card-Based Feed) ── */}
      {loading ? (
        <div className="flex items-center justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="p-16 text-center bg-slate-900/40 border border-slate-800/80 rounded-3xl">
          <span className="text-5xl block mb-3">🎬</span>
          <h3 className="text-lg font-bold text-white">No tasks found in this stage</h3>
          <p className="text-xs text-slate-400 mt-1">Tap "+ New Reel Task" above to get the cameras rolling!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tasks.map((task) => {
            const isShootStage = task.stage === "shoot";
            const isEditStage = task.stage === "edit";
            const isScriptStage = task.stage === "script";

            return (
              <div
                key={task._id}
                className="group relative p-5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-3xl transition-all duration-300 shadow-lg hover:shadow-2xl flex flex-col justify-between"
              >
                {/* Header: Client & Stage Badge */}
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 block">
                        {task.client?.businessName || "Unknown Client"}
                      </span>
                      <h3 className="font-extrabold text-base text-white mt-0.5 group-hover:text-indigo-200 transition-colors">
                        Reel #{task.reelNumber}: {task.title}
                      </h3>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                        task.stage === "script"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : task.stage === "shoot"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : task.stage === "edit"
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      }`}
                    >
                      {task.stage}
                    </span>
                  </div>

                  {/* ── STAGE-SPECIFIC HIGHLIGHT CARDS ── */}

                  {/* 1. SCRIPT DETAILS */}
                  {isScriptStage && (
                    <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-2xl mb-4 space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Writer:</span>
                        <span className="font-bold text-slate-200">{task.writer?.name || "Unassigned"}</span>
                      </div>
                      <div className="text-[11px]">
                        <span className="text-slate-400">Hook: </span>
                        <span className="text-amber-300 italic">"{task.hook || "No hook drafted yet"}"</span>
                      </div>
                    </div>
                  )}

                  {/* 2. SHOOT DETAILS (WhatsApp Flow in UI) */}
                  {isShootStage && (
                    <div className="p-3.5 bg-slate-950/70 border border-emerald-500/20 rounded-2xl mb-4 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">📅 Date & Time:</span>
                        <span className="font-bold text-white">
                          {task.shootDate || "Today"} @ {task.shootTime || "Flexible"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">📍 Location:</span>
                        <span className="text-slate-300 font-medium">{task.location || "Client Store"}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800">
                        <span className="text-slate-400">Reels Target:</span>
                        <span className="font-extrabold font-mono text-emerald-400">
                          {task.completedReels || 0} / {task.targetReels || 1} Done
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 3. EDITING QUEUE DETAILS */}
                  {isEditStage && (
                    <div className="p-3.5 bg-slate-950/70 border border-purple-500/20 rounded-2xl mb-4 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Video Editor:</span>
                        <span className="font-bold text-purple-300">{task.editor?.name || "Unassigned"}</span>
                      </div>
                      {task.rawFootageLink ? (
                        <a
                          href={task.rawFootageLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-indigo-400 underline font-semibold hover:text-indigo-300"
                        >
                          <span>📁 Open Raw Footage Drive</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-red-400">⚠️ No Footage Link Yet</span>
                      )}
                    </div>
                  )}
                </div>

                {/* ── ACTION BUTTONS (Swiggy 1-Tap Style) ── */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  {/* Script Stage Actions */}
                  {isScriptStage && (
                    <>
                      <button
                        onClick={() => setShowScriptModal(task)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Edit Script
                      </button>
                      <button
                        onClick={() => handlePassScript(task._id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        Pass & Send to Shoot ➔
                      </button>
                    </>
                  )}

                  {/* Shoot Stage Actions */}
                  {isShootStage && (
                    <>
                      <button
                        onClick={() => handleQuickShootIncrement(task)}
                        className="px-3.5 py-1.5 bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 text-emerald-300 text-xs font-black rounded-xl transition-all cursor-pointer active:scale-95"
                      >
                        +1 Reel Done 🎥
                      </button>
                      <button
                        onClick={() => setShowShootModal(task)}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        Handoff to Edit ➔
                      </button>
                    </>
                  )}

                  {/* Edit Stage Actions */}
                  {isEditStage && (
                    <>
                      <button
                        onClick={() => setShowEditModal(task)}
                        className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>✂️</span>
                        <span>Complete Reel (Credit Score)</span>
                      </button>
                    </>
                  )}

                  {/* Completed Stage Action */}
                  {task.stage === "completed" && (
                    <div className="w-full flex justify-between items-center text-xs text-emerald-400 font-bold">
                      <span>✓ Delivered to Client</span>
                      <button
                        onClick={() => {
                          const text = encodeURIComponent(
                            `Hello ${task.client?.businessName}! Your reel "${task.title}" has been successfully delivered! 🎉`
                          );
                          window.open(`https://api.whatsapp.com/send?phone=${task.client?.mobile}&text=${text}`);
                        }}
                        className="text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <span>WhatsApp Client 💬</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL 1: CREATE NEW REEL TASK ── */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-black text-white mb-4">✨ Create New Reel Task</h3>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Select Client</label>
                <select
                  required
                  value={newTaskForm.client}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, client: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose Client --</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.businessName} ({c.ownerName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Reel Title / Angle</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer Mango Drink Viral Hook"
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Reel Number</label>
                  <input
                    type="number"
                    min="1"
                    value={newTaskForm.reelNumber}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, reelNumber: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Reel Goal</label>
                  <select
                    value={newTaskForm.goal}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, goal: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="Authority">Authority</option>
                    <option value="Trust">Trust</option>
                    <option value="Sales">Sales</option>
                    <option value="Viral">Viral</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Add to Script Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: SHOOT DETAILS & FOOTAGE HANDOFF ── */}
      {showShootModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-black text-white mb-2">🎥 Shoot Details & Footage Link</h3>
            <p className="text-xs text-slate-400 mb-4">{showShootModal.client?.businessName}</p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Raw Footage Google Drive Link</label>
                <input
                  type="url"
                  id="footageLinkInput"
                  placeholder="https://drive.google.com/drive/folders/..."
                  defaultValue={showShootModal.rawFootageLink || ""}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Reels Count Shot</label>
                <input
                  type="number"
                  id="reelsCountInput"
                  defaultValue={showShootModal.completedReels || 1}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setShowShootModal(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const link = document.getElementById("footageLinkInput").value;
                    const count = document.getElementById("reelsCountInput").value;
                    await updateShootStage(showShootModal._id, {
                      rawFootageLink: link,
                      completedReels: Number(count),
                      handoverToEdit: true,
                    });
                    triggerCelebration("Raw Footage Handed Over to Video Editors! 🎬");
                    setShowShootModal(null);
                    loadData();
                  }}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs shadow-lg"
                >
                  Send to Editing Queue ➔
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: COMPLETE REEL EDIT MODAL ── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-black text-white mb-2">✂️ Submit Edited Reel</h3>
            <p className="text-xs text-slate-400 mb-4">{showEditModal.client?.businessName} - Reel #{showEditModal.reelNumber}</p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Edited Video Link (Drive / Frame.io)</label>
                <input
                  type="url"
                  id="previewLinkInput"
                  placeholder="https://drive.google.com/file/d/..."
                  defaultValue={showEditModal.editedPreviewLink || ""}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setShowEditModal(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const link = document.getElementById("previewLinkInput").value;
                    handleCompleteEdit(showEditModal._id, link);
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-lg flex items-center gap-1.5"
                >
                  <span>🎉</span>
                  <span>Mark Done & Credit Score</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
