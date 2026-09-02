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

  // Quotas view more state
  const [showAllQuotas, setShowAllQuotas] = useState(false);
  const [quotaSearch, setQuotaSearch] = useState("");

  // Modals state
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showAssignShooterModal, setShowAssignShooterModal] = useState(null);
  const [showEditShootModal, setShowEditShootModal] = useState(null);
  const [showHandoffEditModal, setShowHandoffEditModal] = useState(null);
  const [showSubmitQcModal, setShowSubmitQcModal] = useState(null);
  const [showQcReviewModal, setShowQcReviewModal] = useState(null);
  const [showClientApprovalModal, setShowClientApprovalModal] = useState(null);

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
    setTimeout(() => setShowConfetti(false), 3500);
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

  // ── 3. SHOOT COMPLETE ──
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

  // ── 4. HANDOFF TO EDIT (STRICT RAW DATA + EDITOR) ──
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

  // ── 6. QC DECISION ──
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

  // Active vs Posted task categorization
  const activeTasks = tasks.filter((t) => t.stage !== "posted" && t.stage !== "completed");
  const postedTasks = tasks.filter((t) => t.stage === "posted" || t.stage === "completed");

  // Client Quotas with search and expand
  const allQuotas = overview?.clientQuotas || [];
  const filteredQuotas = allQuotas.filter((c) =>
    c.businessName.toLowerCase().includes(quotaSearch.toLowerCase())
  );
  const displayedQuotas = showAllQuotas ? filteredQuotas : filteredQuotas.slice(0, 4);

  // Reusable Single Task Card Renderer
  const renderTaskCard = (task) => {
    const isScript = task.stage === "script";
    const isShoot = task.stage === "shoot";
    const isEdit = task.stage === "edit";
    const isQc = task.stage === "qc";
    const isClientApproval = task.stage === "client_approval";
    const isPosted = task.stage === "posted" || task.stage === "completed";

    return (
      <div
        key={task._id}
        className="group relative p-6 bg-white hover:bg-white border border-slate-100 hover:border-orange-200 rounded-3xl transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between"
      >
        <div>
          {/* Card Header */}
          <div className="flex justify-between items-start gap-2 mb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5200] block">
                {task.client?.businessName || "Unknown Client"}
              </span>
              <h3 className="font-black text-base text-slate-900 mt-0.5 tracking-tight">
                Reel #{task.reelNumber}: {task.title}
              </h3>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                isScript
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : isShoot
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : isEdit
                  ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                  : isQc
                  ? "bg-cyan-50 text-cyan-800 border-cyan-200"
                  : isClientApproval
                  ? "bg-orange-50 text-orange-800 border-orange-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}
            >
              {task.stage.replace("_", " ")}
            </span>
          </div>

          {/* ── STAGE 1: SCRIPT VAULT ── */}
          {isScript && (
            <div className="p-4 bg-amber-50/40 border border-amber-100 rounded-2xl mb-4 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Writer:</span>
                <span className="font-black text-slate-800">{task.writer?.name || "Unassigned"}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Hook: </span>
                <span className="text-amber-900 font-bold italic">"{task.hook || "No hook provided yet"}"</span>
              </div>
            </div>
          )}

          {/* ── STAGE 2: SHOOT OPERATIONS ── */}
          {isShoot && (
            <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl mb-4 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Shooter:</span>
                <span className="font-black text-emerald-700">{task.shooter?.name || "Not Assigned"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">📅 Date & Time:</span>
                <span className="font-extrabold text-slate-800">
                  {task.shootDate || "Set Date"} @ {task.shootTime || "Time"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">📍 Location:</span>
                <span className="text-slate-700 font-semibold truncate max-w-[160px]">
                  {task.location || "Client Store"}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-emerald-100">
                <span className="text-slate-500 font-medium">Target Reels:</span>
                <span className="font-mono font-black text-slate-900">{task.targetReels || 1} Reels</span>
              </div>
            </div>
          )}

          {/* ── STAGE 3: VIDEO EDITING ── */}
          {isEdit && (
            <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl mb-4 space-y-2 text-xs">
              {task.qcStatus === "changes_requested" && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] mb-2 font-medium">
                  <span className="font-black block text-amber-800">⚠️ QC Changes Requested:</span>
                  <span>{task.qcNotes}</span>
                </div>
              )}
              {task.clientApprovalStatus === "changes_requested" && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-900 text-[11px] mb-2 font-medium">
                  <span className="font-black block text-red-800">⚠️ Client Requested Changes:</span>
                  <span>{task.clientFeedback}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Assigned Editor:</span>
                <span className="font-black text-indigo-700">{task.editor?.name || "Unassigned"}</span>
              </div>

              {task.rawFootageLink && (
                <div className="pt-2 border-t border-indigo-100">
                  <a
                    href={task.rawFootageLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#FF5200] font-black underline hover:text-[#E04800]"
                  >
                    <span>📁 Open Raw Footage Drive</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* ── STAGE 4: QC REVIEW ── */}
          {isQc && (
            <div className="p-4 bg-cyan-50/40 border border-cyan-100 rounded-2xl mb-4 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Edited By:</span>
                <span className="font-black text-slate-800">{task.editor?.name || "Editor"}</span>
              </div>
              {task.editedPreviewLink && (
                <a
                  href={task.editedPreviewLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-cyan-700 font-black underline"
                >
                  <span>🎬 Watch Edited Video Preview</span>
                </a>
              )}
              <p className="text-[10px] text-slate-500 font-medium mt-1">Review video quality before client delivery.</p>
            </div>
          )}

          {/* ── STAGE 5: CLIENT APPROVAL ── */}
          {isClientApproval && (
            <div className="p-4 bg-orange-50/40 border border-orange-100 rounded-2xl mb-4 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Client Mobile:</span>
                <span className="font-black text-slate-800">{task.client?.mobile}</span>
              </div>
              {task.editedPreviewLink && (
                <a
                  href={task.editedPreviewLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#FF5200] font-black underline"
                >
                  <span>🎬 Watch Video Preview</span>
                </a>
              )}
            </div>
          )}

          {/* ── STAGE 6: READY TO POST / COMPLETED ── */}
          {isPosted && (
            <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl mb-4 space-y-1 text-xs">
              <span className="text-emerald-700 font-black block">✓ Reel Passed & Approved</span>
              <span className="text-[11px] text-slate-500 font-medium">Counted towards client's monthly quota!</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          {isScript && (
            <button
              onClick={() => setShowAssignShooterModal(task)}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-[#FF5200] to-[#FC8019] hover:from-[#E04800] hover:to-[#EB7410] text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Pass Script & Assign Shooter ➔</span>
            </button>
          )}

          {isShoot && (
            <div className="w-full space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEditShootModal(task)}
                  className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                >
                  ✏️ Edit Shoot Info
                </button>
                <button
                  onClick={() => handleCompleteShootClick(task)}
                  className="px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-black rounded-xl"
                >
                  ✓ Shoot Complete
                </button>
              </div>
              <button
                onClick={() => setShowHandoffEditModal(task)}
                className="w-full px-4 py-2.5 bg-[#FF5200] hover:bg-[#E04800] text-white text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Handoff to Edit (Assign Raw Data) ➔</span>
              </button>
            </div>
          )}

          {isEdit && (
            <button
              onClick={() => setShowSubmitQcModal(task)}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <span>✂️ Submit Video Link for QC ➔</span>
            </button>
          )}

          {isQc && (
            <div className="w-full flex gap-2">
              <button
                onClick={() => handleQcDecision(task._id, "changes_needed")}
                className="flex-1 px-3 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold rounded-xl"
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

          {isClientApproval && (
            <div className="w-full space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => handleClientDecision(task._id, "changes_needed")}
                  className="flex-1 px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold rounded-xl"
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
                className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <span>WhatsApp Video Link to Client 💬</span>
              </button>
            </div>
          )}

          {isPosted && (
            <div className="w-full flex justify-between items-center text-xs text-emerald-700 font-bold">
              <span>✓ Ready to Post on Instagram</span>
              <button
                onClick={() => {
                  const text = encodeURIComponent(
                    `Congratulations ${task.client?.businessName}! Your reel "${task.title}" is ready for posting! 🎉`
                  );
                  window.open(`https://api.whatsapp.com/send?phone=${task.client?.mobile}&text=${text}`);
                }}
                className="text-[#FF5200] hover:underline"
              >
                WhatsApp Client 💬
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans pb-24">
      {/* ── SLEEK FLOATING DYNAMIC ISLAND TOAST (PREMIUM & NON-BLOCKING) ── */}
      {showConfetti && (
        <div className="fixed top-5 left-4 right-4 max-w-sm mx-auto z-50 py-3 px-4 rounded-2xl bg-slate-900/95 text-white shadow-2xl backdrop-blur-xl flex items-center gap-3 border border-slate-700/80 animate-slideDown pointer-events-none">
          <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-xs shrink-0">✓</span>
          <span className="text-xs font-black tracking-tight text-white">{confettiMsg}</span>
        </div>
      )}

      {/* ── TOP HEADER & QUICK METRICS ── */}
      <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200 text-[#FF5200] rounded-full text-xs font-black uppercase tracking-wider mb-2">
            <span>Swiggy-Grade Creative Workflow</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span>🎬 Production Hub</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Strict 6-Stage Pipeline: Script ➔ Shoot Person Assign ➔ Raw Data Lock ➔ QC Review ➔ Client Approval ➔ Ready to Post.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="px-6 py-3.5 bg-gradient-to-r from-[#FF5200] to-[#FC8019] hover:from-[#E04800] hover:to-[#EB7410] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/25 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <span>✨</span>
            <span>+ New Reel Task</span>
          </button>
        </div>
      </div>

      {/* ── CLIENT DELIVERABLES METERS (WITH VIEW ALL / EXPAND FEATURE) ── */}
      {allQuotas.length > 0 && (
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span>🎯 Monthly Client Delivery Quotas</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Live deliverable progress across active client accounts.</p>
            </div>

            <div className="flex items-center gap-3">
              {showAllQuotas && (
                <input
                  type="text"
                  placeholder="Search client quota..."
                  value={quotaSearch}
                  onChange={(e) => setQuotaSearch(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF5200] w-44 font-medium"
                />
              )}

              <button
                onClick={() => setShowAllQuotas(!showAllQuotas)}
                className="px-4 py-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[#FF5200] text-xs font-black rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>{showAllQuotas ? "Show Less ⌃" : `View All (${allQuotas.length} Accounts) ➔`}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayedQuotas.map((c) => (
              <div
                key={c._id}
                className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl hover:border-orange-200 hover:bg-orange-50/30 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-extrabold text-sm text-slate-900 truncate max-w-[140px]">{c.businessName}</h4>
                  <span className="text-xs font-mono font-black text-[#FF5200]">
                    {c.delivered} / {c.quota} Reels
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[#FF5200] to-emerald-500 transition-all duration-700"
                    style={{ width: `${c.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 font-semibold">
                  <span>{c.packageName}</span>
                  <span className="font-black text-emerald-600">{c.percentage}% Delivered</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 6-STAGE SEGMENTED TABS (Swiggy Horizontal Filter Bar) ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto max-w-full">
          {[
            { id: "all", label: "Active Tasks", icon: "📋", count: activeTasks.length },
            { id: "script", label: "1. Script Vault", icon: "📝", count: overview?.stageCounts?.script || 0 },
            { id: "shoot", label: "2. Shooting", icon: "🎥", count: overview?.stageCounts?.shoot || 0 },
            { id: "edit", label: "3. Editing", icon: "✂️", count: overview?.stageCounts?.edit || 0 },
            { id: "qc", label: "4. QC Review", icon: "🔍", count: overview?.stageCounts?.qc || 0 },
            { id: "client_approval", label: "5. Client Approval", icon: "👤", count: overview?.stageCounts?.client_approval || 0 },
            { id: "posted", label: "6. Posted Archive", icon: "🚀", count: postedTasks.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#FF5200] text-white shadow-md shadow-orange-500/30"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === tab.id ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"
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
            className="px-3 py-2 bg-white border border-slate-200 text-xs font-bold rounded-xl text-slate-700 focus:outline-none focus:border-[#FF5200] shadow-sm"
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
            className="px-4 py-2 bg-white border border-slate-200 text-xs rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#FF5200] w-48 shadow-sm font-medium"
          />
        </div>
      </div>

      {/* ── PRODUCTION CARDS GRID ── */}
      {loading ? (
        <div className="flex items-center justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5200]"></div>
        </div>
      ) : activeTab === "all" ? (
        <div className="space-y-12">
          {/* Main Active Tasks (Script, Shoot, Edit, QC, Client Approval) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900">
                In-Progress Creative Tasks ({activeTasks.length})
              </h3>
              <span className="text-xs font-bold text-[#FF5200] bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                Active Production Line
              </span>
            </div>

            {activeTasks.length === 0 ? (
              <div className="p-12 text-center bg-white border border-slate-100 rounded-3xl shadow-sm">
                <span className="text-4xl block mb-2">🎉</span>
                <h4 className="text-base font-black text-slate-900">No active in-progress reels!</h4>
                <p className="text-xs text-slate-500 mt-0.5">All created reels are posted, or create a new reel task.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTasks.map((t) => renderTaskCard(t))}
              </div>
            )}
          </div>

          {/* Separate Dedicated Section for Posted & Completed Archive */}
          {postedTasks.length > 0 && (
            <div className="pt-8 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🚀</span>
                  <h3 className="text-lg font-black text-slate-900">
                    Delivered & Posted Archive ({postedTasks.length})
                  </h3>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Ready on Instagram
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {postedTasks.map((t) => renderTaskCard(t))}
              </div>
            </div>
          )}
        </div>
      ) : tasks.length === 0 ? (
        <div className="p-16 text-center bg-white border border-slate-100 rounded-3xl shadow-sm">
          <span className="text-5xl block mb-3">🎬</span>
          <h3 className="text-lg font-black text-slate-900">No tasks in this stage</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Move tasks through the pipeline or create a new one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => renderTaskCard(task))}
        </div>
      )}

      {/* ── MODAL 1: CREATE NEW REEL TASK ── */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-black text-slate-900 mb-4">✨ Create New Reel Task</h3>

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
                <label className="text-xs font-bold text-slate-600 block mb-1">Client</label>
                <select
                  required
                  value={newTaskForm.client}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, client: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
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
                <label className="text-xs font-bold text-slate-600 block mb-1">Reel Title / Angle</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer Mango Drink Viral Hook"
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Hook / Concept</label>
                <textarea
                  rows={2}
                  placeholder="Viral Hook for the video..."
                  value={newTaskForm.hook}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, hook: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#FF5200] hover:bg-[#E04800] text-white font-black rounded-xl text-xs shadow-md"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 mb-1">🎥 Pass Script ➔ Assign Shoot Person</h3>
            <p className="text-xs text-slate-500 mb-4">{showAssignShooterModal.client?.businessName}</p>

            <form onSubmit={handlePassScriptSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Shoot Person (Shooter) <span className="text-red-500">*</span>
                </label>
                <select
                  name="shooter"
                  required
                  defaultValue={showAssignShooterModal.shooter?._id || ""}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-orange-200 rounded-xl text-xs text-slate-900 font-bold"
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
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Shoot Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="shootDate"
                    required
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Shoot Time</label>
                  <input
                    type="text"
                    name="shootTime"
                    defaultValue="03:00 PM"
                    placeholder="e.g. 3:00 PM"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Location / Store</label>
                <input
                  type="text"
                  name="location"
                  defaultValue="Client Store / Surat"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Target Reels to Shoot</label>
                <input
                  type="number"
                  name="targetReels"
                  defaultValue={showAssignShooterModal.targetReels || 1}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignShooterModal(null)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#FF5200] hover:bg-[#E04800] text-white font-black rounded-xl text-xs shadow-md"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 mb-1">✏️ Edit Shoot Person & Details</h3>
            <p className="text-xs text-slate-500 mb-4">{showEditShootModal.client?.businessName}</p>

            <form onSubmit={handleEditShootSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Shoot Person (Shooter)</label>
                <select
                  name="shooter"
                  defaultValue={showEditShootModal.shooter?._id || ""}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
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
                  <label className="text-xs font-bold text-slate-700 block mb-1">Shoot Date</label>
                  <input
                    type="date"
                    name="shootDate"
                    defaultValue={showEditShootModal.shootDate || ""}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Shoot Time</label>
                  <input
                    type="text"
                    name="shootTime"
                    defaultValue={showEditShootModal.shootTime || ""}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  defaultValue={showEditShootModal.location || ""}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Target Reels</label>
                  <input
                    type="number"
                    name="targetReels"
                    defaultValue={showEditShootModal.targetReels || 1}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Completed Reels</label>
                  <input
                    type="number"
                    name="completedReels"
                    defaultValue={showEditShootModal.completedReels || 0}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditShootModal(null)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#FF5200] hover:bg-[#E04800] text-white font-black rounded-xl text-xs shadow-md"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 mb-1">✂️ Handoff to Edit (Raw Data & Editor)</h3>
            <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-bold mb-4">
              ⚠️ રો ડેટા લિંક અને એડિટર અસાઇન કર્યા વગર આગળ નહિ વધે!
            </p>

            <form onSubmit={handleHandoffEditSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Raw Footage / Data Link (Google Drive) <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  name="rawFootageLink"
                  required
                  placeholder="https://drive.google.com/drive/folders/..."
                  defaultValue={showHandoffEditModal.rawFootageLink || ""}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-orange-200 rounded-xl text-xs text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Assign Video Editor <span className="text-red-500">*</span>
                </label>
                <select
                  name="editor"
                  required
                  defaultValue={showHandoffEditModal.editor?._id || ""}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-orange-200 rounded-xl text-xs text-slate-900 font-bold"
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
                <label className="text-xs font-bold text-slate-700 block mb-1">Editing Notes / Instructions</label>
                <textarea
                  rows={2}
                  name="editorNotes"
                  placeholder="e.g. Keep upbeat music, add Surat foodie captions..."
                  defaultValue={showHandoffEditModal.editorNotes || ""}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowHandoffEditModal(null)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#FF5200] hover:bg-[#E04800] text-white font-black rounded-xl text-xs shadow-md"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 mb-1">✂️ Submit Edited Reel for QC</h3>
            <p className="text-xs text-slate-500 mb-4">{showSubmitQcModal.client?.businessName} - Reel #{showSubmitQcModal.reelNumber}</p>

            <form onSubmit={handleSubmitQcSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Edited Video Link (Drive / Frame.io / Cloud) <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  name="editedPreviewLink"
                  required
                  placeholder="https://drive.google.com/file/d/..."
                  defaultValue={showSubmitQcModal.editedPreviewLink || ""}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-indigo-200 rounded-xl text-xs text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Editor Notes</label>
                <input
                  type="text"
                  name="editorNotes"
                  placeholder="e.g. Cut 1 ready with trending audio"
                  defaultValue={showSubmitQcModal.editorNotes || ""}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSubmitQcModal(null)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs shadow-md"
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
