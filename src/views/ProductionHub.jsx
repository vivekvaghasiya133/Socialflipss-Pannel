"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getProductionTasks,
  getProductionOverview,
  createProductionTask,
  passScriptToShoot,
  updateShootInfo,
  completeShoot,
  handoffToEdit,
  submitEditToQc,
  qcDecision,
  clientDecision,
  deleteProductionTask,
  getTeamTimeOverview,
} from "../api/agencyOsApi";
import { getClients } from "../api/clientsApi";
import { useAuth } from "../context/AuthContext";

export default function ProductionHub() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [overview, setOverview] = useState(null);
  const [clients, setClients] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [clientFilter, setClientFilter] = useState("");

  // Modals state
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showAssignShooterModal, setShowAssignShooterModal] = useState(null); // task to pass to shoot
  const [showEditShootModal, setShowEditShootModal] = useState(null); // task to edit shoot details
  const [showHandoffEditModal, setShowHandoffEditModal] = useState(null); // task to handoff to edit
  const [showSubmitQcModal, setShowSubmitQcModal] = useState(null); // task to submit edit
  const [showQcReviewModal, setShowQcReviewModal] = useState(null); // task for QC review
  const [showClientApprovalModal, setShowClientApprovalModal] = useState(null); // task for client review

  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiMsg, setConfettiMsg] = useState("");

  // Form states
  const [newTaskForm, setNewTaskForm] = useState({
    client: "",
    title: "",
    goal: "Authority",
    priority: "medium",
    reelNumber: 1,
    concept: "",
    hook: "",
    bodyText: "",
    cta: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tasksRes, overviewRes, clientsRes, teamRes] = await Promise.all([
        getProductionTasks({
          stage: activeTab === "all" ? undefined : activeTab,
          clientId: clientFilter || undefined,
          search: searchQuery || undefined,
        }),
        getProductionOverview(),
        getClients({ limit: 100 }),
        getTeamTimeOverview(),
      ]);
      if (tasksRes.data?.success) setTasks(tasksRes.data.tasks);
      if (overviewRes.data?.success) setOverview(overviewRes.data);
      if (clientsRes.data?.clients) setClients(clientsRes.data.clients);
      if (teamRes.data?.team) setTeamMembers(teamRes.data.team);
    } catch (err) {
      console.error("Error loading production data:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, clientFilter, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const triggerCelebration = (msg) => {
    setConfettiMsg(msg);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  };

  // ── 1. SCRIPT PASS ➔ ASSIGN SHOOTER SUBMIT ──
  const handlePassScriptSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const shooter = form.shooter.value;
    const shootDate = form.shootDate.value;
    const shootTime = form.shootTime.value;
    const location = form.location.value;
    const targetReels = form.targetReels.value;

    if (!shooter) {
      alert("Please select a Shoot Person (Shooter)!");
      return;
    }
    if (!shootDate) {
      alert("Please select a Shoot Date!");
      return;
    }

    try {
      await passScriptToShoot(showAssignShooterModal._id, {
        shooter,
        shootDate,
        shootTime,
        location,
        targetReels,
      });
      triggerCelebration("Script Passed! Shoot Person Assigned & Notified! 🎥");
      setShowAssignShooterModal(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to pass script to shoot");
    }
  };

  // ── 2. EDIT SHOOT INFO SUBMIT ──
  const handleEditShootSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      await updateShootInfo(showEditShootModal._id, {
        shooter: form.shooter.value,
        shootDate: form.shootDate.value,
        shootTime: form.shootTime.value,
        location: form.location.value,
        targetReels: Number(form.targetReels.value),
        completedReels: Number(form.completedReels.value),
      });
      triggerCelebration("Shoot details updated successfully! 🎬");
      setShowEditShootModal(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update shoot info");
    }
  };

  // ── 3. SHOOT COMPLETE (AUTO SCORE CREDIT TO SHOOTER) ──
  const handleCompleteShootClick = async (task) => {
    try {
      await completeShoot(task._id, {
        completedReels: task.completedReels || task.targetReels || 1,
      });
      triggerCelebration("Shoot marked Complete! +1 Shoot credited to Shooter! 🏆");
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to complete shoot");
    }
  };

  // ── 4. HANDOFF TO EDIT ➔ STRICT GATE (RAW DATA + EDITOR) ──
  const handleHandoffEditSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const rawFootageLink = form.rawFootageLink.value.trim();
    const editor = form.editor.value;

    if (!rawFootageLink) {
      alert("❌ રો ડેટા નાખ્યા વગર આગળ નહિ વધે! (Raw Footage Drive link is mandatory)");
      return;
    }
    if (!editor) {
      alert("❌ Please assign a Video Editor!");
      return;
    }

    try {
      await handoffToEdit(showHandoffEditModal._id, {
        rawFootageLink,
        editor,
        editorNotes: form.editorNotes.value,
      });
      triggerCelebration("Raw Data Link Verified & Assigned to Editor! ✂️");
      setShowHandoffEditModal(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to handoff to editor");
    }
  };

  // ── 5. SUBMIT EDIT ➔ MOVES TO QC ──
  const handleSubmitQcSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const editedPreviewLink = form.editedPreviewLink.value.trim();

    if (!editedPreviewLink) {
      alert("Please enter the edited video preview link!");
      return;
    }

    try {
      await submitEditToQc(showSubmitQcModal._id, {
        editedPreviewLink,
        editorNotes: form.editorNotes.value,
      });
      triggerCelebration("Reel Submitted for QC! +1 Credit to Editor Score! 🎉");
      setShowSubmitQcModal(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit for QC");
    }
  };

  // ── 6. QC DECISION (CHANGES OR PASS TO CLIENT) ──
  const handleQcDecision = async (taskId, decision) => {
    let qcNotes = "";
    if (decision === "changes_needed") {
      qcNotes = prompt("Enter QC revision notes for the Editor:");
      if (!qcNotes) return;
    }

    try {
      await qcDecision(taskId, { decision, qcNotes });
      if (decision === "changes_needed") {
        triggerCelebration("Revisions sent back to Video Editor! 🔄");
      } else {
        triggerCelebration("QC Approved! Moved to Client Approval! 🌟");
      }
      setShowQcReviewModal(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit QC decision");
    }
  };

  // ── 7. CLIENT APPROVAL DECISION ──
  const handleClientDecision = async (taskId, decision) => {
    let clientFeedback = "";
    if (decision === "changes_needed") {
      clientFeedback = prompt("Enter Client's requested changes for the Editor:");
      if (!clientFeedback) return;
    }

    try {
      await clientDecision(taskId, { decision, clientFeedback });
      if (decision === "changes_needed") {
        triggerCelebration("Client changes sent back to Video Editor! 🔄");
      } else {
        triggerCelebration("Reel Approved & Ready to Post! Client quota updated! 🚀");
      }
      setShowClientApprovalModal(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit client decision");
    }
  };

  return (
    <div className="min-h-screen pb-24 text-slate-100 font-sans">
      {/* ── CELEBRATION CONFETTI OVERLAY ── */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-none transition-all">
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
              Complete Creative Production Workflow
            </span>
            <span className="text-xs text-slate-400 font-medium">Auto-Notifications</span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1 tracking-tight flex items-center gap-3">
            <span>🎬 Production Hub</span>
          </h1>
          <p className="text-sm text-slate-400">
            Script ➔ Shoot (Shooter Assign) ➔ Edit (Raw Data Lock) ➔ QC Review ➔ Client Approval ➔ Posted.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 text-sm active:scale-95 cursor-pointer"
          >
            <span>✨</span>
            <span>+ New Reel Task</span>
          </button>
        </div>
      </div>

      {/* ── CLIENT DELIVERABLES METERS ── */}
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
                  <span className="font-bold text-emerald-400">{c.percentage}% Delivered</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 6-STAGE SEGMENTED TABS (Strict Pipeline Progression) ── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-lg overflow-x-auto max-w-full">
          {[
            { id: "all", label: "All Tasks", icon: "📋", count: tasks.length },
            { id: "script", label: "1. Script Vault", icon: "📝", count: overview?.stageCounts?.script || 0 },
            { id: "shoot", label: "2. Shooting", icon: "🎥", count: overview?.stageCounts?.shoot || 0 },
            { id: "edit", label: "3. Editing", icon: "✂️", count: overview?.stageCounts?.edit || 0 },
            { id: "qc", label: "4. QC Review", icon: "🔍", count: overview?.stageCounts?.qc || 0 },
            { id: "client_approval", label: "5. Client Approval", icon: "👤", count: overview?.stageCounts?.client_approval || 0 },
            { id: "posted", label: "6. Ready to Post", icon: "🚀", count: overview?.stageCounts?.posted || 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
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
            placeholder="Search reel, shooter, editor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-slate-800 text-xs rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-48"
          />
        </div>
      </div>

      {/* ── PRODUCTION CARDS GRID ── */}
      {loading ? (
        <div className="flex items-center justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="p-16 text-center bg-slate-900/40 border border-slate-800/80 rounded-3xl">
          <span className="text-5xl block mb-3">🎬</span>
          <h3 className="text-lg font-bold text-white">No tasks in this stage</h3>
          <p className="text-xs text-slate-400 mt-1">Add a new script or move tasks through the pipeline.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tasks.map((task) => {
            const isScript = task.stage === "script";
            const isShoot = task.stage === "shoot";
            const isEdit = task.stage === "edit";
            const isQc = task.stage === "qc";
            const isClientApproval = task.stage === "client_approval";
            const isPosted = task.stage === "posted" || task.stage === "completed";

            return (
              <div
                key={task._id}
                className="group relative p-5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-3xl transition-all duration-300 shadow-lg hover:shadow-2xl flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 block">
                        {task.client?.businessName || "Unknown Client"}
                      </span>
                      <h3 className="font-extrabold text-base text-white mt-0.5">
                        Reel #{task.reelNumber}: {task.title}
                      </h3>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                        isScript
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : isShoot
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : isEdit
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                          : isQc
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                          : isClientApproval
                          ? "bg-orange-500/10 text-orange-400 border-orange-500/30"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      }`}
                    >
                      {task.stage.replace("_", " ")}
                    </span>
                  </div>

                  {/* ── STAGE 1: SCRIPT VAULT ── */}
                  {isScript && (
                    <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl mb-4 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Writer:</span>
                        <span className="font-bold text-white">{task.writer?.name || "Unassigned"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Hook: </span>
                        <span className="text-amber-300 italic">"{task.hook || "No hook provided yet"}"</span>
                      </div>
                    </div>
                  )}

                  {/* ── STAGE 2: SHOOT OPERATIONS ── */}
                  {isShoot && (
                    <div className="p-3.5 bg-slate-950/70 border border-emerald-500/20 rounded-2xl mb-4 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Shooter:</span>
                        <span className="font-black text-emerald-400">{task.shooter?.name || "Not Assigned"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">📅 Date & Time:</span>
                        <span className="font-bold text-white">
                          {task.shootDate || "Set Date"} @ {task.shootTime || "Time"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">📍 Location:</span>
                        <span className="text-slate-300 truncate max-w-[160px]">{task.location || "Client Store"}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                        <span className="text-slate-400">Target Reels:</span>
                        <span className="font-mono font-black text-white">{task.targetReels || 1} Reels</span>
                      </div>
                    </div>
                  )}

                  {/* ── STAGE 3: VIDEO EDITING ── */}
                  {isEdit && (
                    <div className="p-3.5 bg-slate-950/70 border border-purple-500/20 rounded-2xl mb-4 space-y-2 text-xs">
                      {/* Revision Feedback Alert if coming back from QC or Client */}
                      {task.qcStatus === "changes_requested" && (
                        <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-[11px] mb-2">
                          <span className="font-bold block">⚠️ QC Changes Requested:</span>
                          <span>{task.qcNotes}</span>
                        </div>
                      )}
                      {task.clientApprovalStatus === "changes_requested" && (
                        <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-[11px] mb-2">
                          <span className="font-bold block">⚠️ Client Requested Changes:</span>
                          <span>{task.clientFeedback}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Assigned Editor:</span>
                        <span className="font-black text-purple-400">{task.editor?.name || "Unassigned"}</span>
                      </div>

                      {task.rawFootageLink && (
                        <div className="pt-1 border-t border-slate-800">
                          <a
                            href={task.rawFootageLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 font-bold underline hover:text-indigo-300"
                          >
                            <span>📁 Open Raw Footage Drive</span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── STAGE 4: QC REVIEW ── */}
                  {isQc && (
                    <div className="p-3.5 bg-slate-950/70 border border-cyan-500/20 rounded-2xl mb-4 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Edited By:</span>
                        <span className="font-bold text-white">{task.editor?.name || "Editor"}</span>
                      </div>
                      {task.editedPreviewLink && (
                        <a
                          href={task.editedPreviewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-cyan-400 font-bold underline"
                        >
                          <span>🎬 Watch Edited Video Preview</span>
                        </a>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1">Review video quality before client delivery.</p>
                    </div>
                  )}

                  {/* ── STAGE 5: CLIENT APPROVAL ── */}
                  {isClientApproval && (
                    <div className="p-3.5 bg-slate-950/70 border border-orange-500/20 rounded-2xl mb-4 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Client Contact:</span>
                        <span className="font-bold text-white">{task.client?.mobile}</span>
                      </div>
                      {task.editedPreviewLink && (
                        <a
                          href={task.editedPreviewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-orange-400 font-bold underline"
                        >
                          <span>🎬 Watch Video Preview</span>
                        </a>
                      )}
                    </div>
                  )}

                  {/* ── STAGE 6: READY TO POST / COMPLETED ── */}
                  {isPosted && (
                    <div className="p-3.5 bg-slate-950/70 border border-blue-500/20 rounded-2xl mb-4 space-y-1 text-xs">
                      <span className="text-emerald-400 font-extrabold block">✓ Reel Passed & Approved</span>
                      <span className="text-[11px] text-slate-400">Counted towards client's monthly quota!</span>
                    </div>
                  )}
                </div>

                {/* ── ACTION BUTTONS FOR EACH STAGE ── */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  {/* 1. SCRIPT STAGE ACTION ➔ MUST ASSIGN SHOOT PERSON */}
                  {isScript && (
                    <button
                      onClick={() => setShowAssignShooterModal(task)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-black rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Pass Script & Assign Shooter ➔</span>
                    </button>
                  )}

                  {/* 2. SHOOT STAGE ACTIONS */}
                  {isShoot && (
                    <div className="w-full space-y-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowEditShootModal(task)}
                          className="flex-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
                        >
                          ✏️ Edit Shoot Info
                        </button>
                        <button
                          onClick={() => handleCompleteShootClick(task)}
                          className="px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-black rounded-xl"
                        >
                          ✓ Shoot Complete
                        </button>
                      </div>

                      {/* Handoff to Edit (Strict Gate) */}
                      <button
                        onClick={() => setShowHandoffEditModal(task)}
                        className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl shadow-lg flex items-center justify-center gap-1.5"
                      >
                        <span>Handoff to Edit (Assign Raw Data) ➔</span>
                      </button>
                    </div>
                  )}

                  {/* 3. EDIT STAGE ACTION */}
                  {isEdit && (
                    <button
                      onClick={() => setShowSubmitQcModal(task)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-lg flex items-center justify-center gap-2"
                    >
                      <span>✂️ Submit Video Link for QC ➔</span>
                    </button>
                  )}

                  {/* 4. QC REVIEW ACTIONS */}
                  {isQc && (
                    <div className="w-full flex gap-2">
                      <button
                        onClick={() => handleQcDecision(task._id, "changes_needed")}
                        className="flex-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 text-xs font-bold rounded-xl"
                      >
                        🔄 Send Back to Editor
                      </button>
                      <button
                        onClick={() => handleQcDecision(task._id, "approved")}
                        className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md"
                      >
                        ✓ QC Passed ➔ Client
                      </button>
                    </div>
                  )}

                  {/* 5. CLIENT APPROVAL ACTIONS */}
                  {isClientApproval && (
                    <div className="w-full space-y-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleClientDecision(task._id, "changes_needed")}
                          className="flex-1 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-xl"
                        >
                          🔄 Client Changes (Back to Edit)
                        </button>
                        <button
                          onClick={() => handleClientDecision(task._id, "approved")}
                          className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md"
                        >
                          🚀 Client Approved ➔ Post!
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          const text = encodeURIComponent(
                            `Hello ${task.client?.businessName}! Please review your edited reel: ${task.editedPreviewLink}`
                          );
                          window.open(`https://api.whatsapp.com/send?phone=${task.client?.mobile}&text=${text}`);
                        }}
                        className="w-full py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <span>WhatsApp Video Link to Client 💬</span>
                      </button>
                    </div>
                  )}

                  {/* 6. POSTED ACTION */}
                  {isPosted && (
                    <div className="w-full flex justify-between items-center text-xs text-emerald-400 font-bold">
                      <span>✓ Ready to Post on Instagram</span>
                      <button
                        onClick={() => {
                          const text = encodeURIComponent(
                            `Congratulations ${task.client?.businessName}! Your reel "${task.title}" is ready for posting! 🎉`
                          );
                          window.open(`https://api.whatsapp.com/send?phone=${task.client?.mobile}&text=${text}`);
                        }}
                        className="text-indigo-400 hover:underline"
                      >
                        WhatsApp Client 💬
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

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await createProductionTask(newTaskForm);
                  setShowNewTaskModal(false);
                  triggerCelebration("New Reel Task Created in Script Vault! ✨");
                  loadData();
                } catch (err) {
                  alert(err.response?.data?.message || "Failed to create task");
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Client</label>
                <select
                  required
                  value={newTaskForm.client}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, client: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                >
                  <option value="">-- Select Client --</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.businessName}
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
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Hook / Concept</label>
                <textarea
                  rows={2}
                  placeholder="Viral Hook for the video..."
                  value={newTaskForm.hook}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, hook: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs shadow-lg"
                >
                  Save to Script Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: PASS SCRIPT & MUST ASSIGN SHOOT PERSON ── */}
      {showAssignShooterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-black text-white mb-1">🎥 Pass Script ➔ Assign Shoot Person</h3>
            <p className="text-xs text-slate-400 mb-4">{showAssignShooterModal.client?.businessName}</p>

            <form onSubmit={handlePassScriptSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Shoot Person (Shooter) <span className="text-red-400">*</span>
                </label>
                <select
                  name="shooter"
                  required
                  defaultValue={showAssignShooterModal.shooter?._id || ""}
                  className="w-full px-3 py-2 bg-slate-950 border border-indigo-500/50 rounded-xl text-xs text-white font-bold"
                >
                  <option value="">-- Choose Shooter --</option>
                  {teamMembers.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.name} ({m.position || m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Shoot Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    name="shootDate"
                    required
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Shoot Time</label>
                  <input
                    type="text"
                    name="shootTime"
                    defaultValue="03:00 PM"
                    placeholder="e.g. 3:00 PM"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Location / Store</label>
                <input
                  type="text"
                  name="location"
                  defaultValue="Client Store / Surat"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Target Reels to Shoot</label>
                <input
                  type="number"
                  name="targetReels"
                  defaultValue={showAssignShooterModal.targetReels || 1}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAssignShooterModal(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-lg"
                >
                  Pass & Send to Shoot ➔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: EDIT SHOOT DETAILS AT ANY TIME ── */}
      {showEditShootModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-black text-white mb-1">✏️ Edit Shoot Person & Details</h3>
            <p className="text-xs text-slate-400 mb-4">{showEditShootModal.client?.businessName}</p>

            <form onSubmit={handleEditShootSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Shoot Person (Shooter)</label>
                <select
                  name="shooter"
                  defaultValue={showEditShootModal.shooter?._id || ""}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                >
                  <option value="">-- Choose Shooter --</option>
                  {teamMembers.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.name} ({m.position || m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Shoot Date</label>
                  <input
                    type="date"
                    name="shootDate"
                    defaultValue={showEditShootModal.shootDate || ""}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Shoot Time</label>
                  <input
                    type="text"
                    name="shootTime"
                    defaultValue={showEditShootModal.shootTime || ""}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  defaultValue={showEditShootModal.location || ""}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Target Reels</label>
                  <input
                    type="number"
                    name="targetReels"
                    defaultValue={showEditShootModal.targetReels || 1}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Completed Reels</label>
                  <input
                    type="number"
                    name="completedReels"
                    defaultValue={showEditShootModal.completedReels || 0}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditShootModal(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs shadow-lg"
                >
                  Save Changes ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 4: HANDOFF TO EDIT (STRICT RAW DATA & EDITOR GATE) ── */}
      {showHandoffEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-black text-white mb-1">✂️ Handoff to Edit (Raw Data & Editor)</h3>
            <p className="text-xs text-amber-400 font-bold mb-4">
              ⚠️ રો ડેટા લિંક અને એડિટર અસાઇન કર્યા વગર આગળ નહિ વધે!
            </p>

            <form onSubmit={handleHandoffEditSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Raw Footage / Data Link (Google Drive) <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  name="rawFootageLink"
                  required
                  placeholder="https://drive.google.com/drive/folders/..."
                  defaultValue={showHandoffEditModal.rawFootageLink || ""}
                  className="w-full px-3 py-2 bg-slate-950 border border-indigo-500/60 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Assign Video Editor <span className="text-red-400">*</span>
                </label>
                <select
                  name="editor"
                  required
                  defaultValue={showHandoffEditModal.editor?._id || ""}
                  className="w-full px-3 py-2 bg-slate-950 border border-indigo-500/60 rounded-xl text-xs text-white font-bold"
                >
                  <option value="">-- Select Video Editor --</option>
                  {teamMembers.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.name} ({m.position || m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Editing Notes / Instructions</label>
                <textarea
                  rows={2}
                  name="editorNotes"
                  placeholder="e.g. Keep upbeat music, add Surat foodie captions..."
                  defaultValue={showHandoffEditModal.editorNotes || ""}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowHandoffEditModal(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs shadow-lg"
                >
                  Send to Editor ➔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 5: SUBMIT EDIT TO QC ── */}
      {showSubmitQcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-black text-white mb-1">✂️ Submit Edited Reel for QC</h3>
            <p className="text-xs text-slate-400 mb-4">{showSubmitQcModal.client?.businessName} - Reel #{showSubmitQcModal.reelNumber}</p>

            <form onSubmit={handleSubmitQcSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Edited Video Link (Drive / Frame.io / Cloud) <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  name="editedPreviewLink"
                  required
                  placeholder="https://drive.google.com/file/d/..."
                  defaultValue={showSubmitQcModal.editedPreviewLink || ""}
                  className="w-full px-3 py-2 bg-slate-950 border border-purple-500/60 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Editor Notes</label>
                <input
                  type="text"
                  name="editorNotes"
                  placeholder="e.g. Cut 1 ready with trending audio"
                  defaultValue={showSubmitQcModal.editorNotes || ""}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubmitQcModal(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs shadow-lg"
                >
                  Submit to QC ➔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
