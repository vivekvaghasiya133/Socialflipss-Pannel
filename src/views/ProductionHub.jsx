"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getProductionTasks,
  getProductionOverview,
  createProductionTask,
  passScriptToShoot,
  batchPassScriptToShoot,
  updateShootInfo,
  completeShoot,
  handoffToEdit,
  batchHandoffToEdit,
  submitEditToQc,
  qcDecision,
  clientDecision,
  deleteProductionTask,
  getTeamTimeOverview,
} from "../api/agencyOsApi";
import { getClients } from "../api/clientsApi";
import { useAuth } from "../context/AuthContext";
import { generateShootScriptPdf } from "../utils/shootScriptPdf";

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
  const [showAdvancedScriptFields, setShowAdvancedScriptFields] = useState(false);
  const [showAssignShooterModal, setShowAssignShooterModal] = useState(null);
  const [selectedBatchTaskIds, setSelectedBatchTaskIds] = useState([]);
  const [targetReelsCount, setTargetReelsCount] = useState(1);
  const [showEditShootModal, setShowEditShootModal] = useState(null);
  const [showHandoffEditModal, setShowHandoffEditModal] = useState(null);
  const [handoffSessionTasks, setHandoffSessionTasks] = useState([]);
  const [handoffCardData, setHandoffCardData] = useState({});
  const [masterRawLink, setMasterRawLink] = useState("");
  const [masterEditor, setMasterEditor] = useState("");
  const [masterNotes, setMasterNotes] = useState("");
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
    reelNumber: "",
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
      if (tasksRes.data?.success) {
        const sorted = [...(tasksRes.data.tasks || [])].sort((a, b) => {
          const clientA = a.client?.businessName || "";
          const clientB = b.client?.businessName || "";
          if (clientA !== clientB) {
            return clientA.localeCompare(clientB);
          }
          return (a.reelNumber || 0) - (b.reelNumber || 0);
        });
        setTasks(sorted);
      }
      if (overviewRes.data?.success) setOverview(overviewRes.data);
      if (clientsRes.data?.clients) {
        const sorted = [...clientsRes.data.clients].sort((a, b) => {
          if (a.businessName.includes("Chhutak")) return -1;
          if (b.businessName.includes("Chhutak")) return 1;
          return a.businessName.localeCompare(b.businessName);
        });
        setClients(sorted);
      }
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

  const openHandoffEditModal = (task) => {
    setShowHandoffEditModal(task);

    const normalizeDate = (d) => (d ? String(d).trim().toLowerCase() : "");
    const normalizeTime = (t) => {
      if (!t) return "";
      let s = String(t).trim().toLowerCase().replace(/\s+/g, " ");
      return s.replace(/^(\d):/, "0$1:");
    };

    const taskDate = normalizeDate(task.shootDate);
    const taskTime = normalizeTime(task.shootTime);

    // Find all shoot-stage tasks for this client in the SAME shoot session (same date & time)
    const sameSessionTasks = tasks.filter((t) => {
      if (t.stage !== "shoot") return false;
      const sameClient = String(t.client?._id || t.client) === String(task.client?._id || task.client);
      if (!sameClient) return false;

      // Same date & time
      if (taskDate !== normalizeDate(t.shootDate)) return false;
      if (taskTime !== normalizeTime(t.shootTime)) return false;
      return true;
    });

    sameSessionTasks.sort((a, b) => (a.reelNumber || 0) - (b.reelNumber || 0));
    const sessionList = sameSessionTasks.length > 0 ? sameSessionTasks : [task];

    const initialData = {};
    const defaultEditor = task.editor?._id || task.editor || "";
    const defaultLink = task.rawFootageLink || "";

    sessionList.forEach((t) => {
      initialData[t._id] = {
        selected: true,
        rawFootageLink: t.rawFootageLink || defaultLink,
        editor: t.editor?._id || t.editor || defaultEditor,
        editorNotes: t.editorNotes || "",
      };
    });

    setHandoffSessionTasks(sessionList);
    setHandoffCardData(initialData);
    setMasterRawLink(defaultLink);
    setMasterEditor(defaultEditor);
    setMasterNotes("");
  };

  const handleApplyMasterLinkToAll = () => {
    if (!masterRawLink.trim()) return;
    setHandoffCardData((prev) => {
      const next = { ...prev };
      handoffSessionTasks.forEach((t) => {
        if (next[t._id]?.selected) {
          next[t._id] = { ...next[t._id], rawFootageLink: masterRawLink.trim() };
        }
      });
      return next;
    });
  };

  const handleApplyMasterEditorToAll = (editorId) => {
    setMasterEditor(editorId);
    if (!editorId) return;
    setHandoffCardData((prev) => {
      const next = { ...prev };
      handoffSessionTasks.forEach((t) => {
        if (next[t._id]?.selected) {
          next[t._id] = { ...next[t._id], editor: editorId };
        }
      });
      return next;
    });
  };

  const openAssignShooterModal = (task) => {
    setShowAssignShooterModal(task);
    setSelectedBatchTaskIds([task._id]);
    setTargetReelsCount(task.targetReels || 1);
  };

  const clientScriptTasks = showAssignShooterModal
    ? tasks.filter(
        (t) =>
          t.stage === "script" &&
          String(t.client?._id || t.client) === String(showAssignShooterModal.client?._id || showAssignShooterModal.client)
      )
    : [];

  const handleGenerateShootPdf = (task, batchMode = true) => {
    if (!task) return;
    if (!batchMode) {
      generateShootScriptPdf([task], task.client);
      return;
    }

    const normalizeDate = (d) => (d ? String(d).trim().toLowerCase() : "");
    const normalizeTime = (t) => {
      if (!t) return "";
      let s = String(t).trim().toLowerCase().replace(/\s+/g, " ");
      return s.replace(/^(\d):/, "0$1:");
    };

    const taskDate = normalizeDate(task.shootDate);
    const taskTime = normalizeTime(task.shootTime);

    // Filter to ONLY reels for this client that match the EXACT SAME Shoot Date & Shoot Time (Exact Shoot Session)
    const sessionTasks = tasks.filter((t) => {
      if (t.stage !== "shoot") return false;
      const sameClient = String(t.client?._id || t.client) === String(task.client?._id || task.client);
      if (!sameClient) return false;

      const tDate = normalizeDate(t.shootDate);
      const tTime = normalizeTime(t.shootTime);

      // Strict match for Shoot Date
      if (taskDate !== tDate) return false;

      // Strict match for Shoot Time
      if (taskTime !== tTime) return false;

      return true;
    });

    // Sort reels chronologically by reel number
    sessionTasks.sort((a, b) => (a.reelNumber || 0) - (b.reelNumber || 0));

    const tasksToExport = sessionTasks.length > 0 ? sessionTasks : [task];
    generateShootScriptPdf(tasksToExport, task.client);
  };

  const handleTopBarDocketExport = () => {
    const shootTasks = clientFilter
      ? tasks.filter((t) => (t.client?._id === clientFilter || t.client === clientFilter) && t.stage === "shoot")
      : tasks.filter((t) => t.stage === "shoot");

    if (shootTasks.length === 0) {
      alert("No scheduled shoot tasks found.");
      return;
    }

    // Group by Client + Date + Time
    const sessions = {};
    shootTasks.forEach((t) => {
      const clientName = t.client?.businessName || "Client";
      const key = `${clientName} — 📅 ${t.shootDate || "No Date"} @ ${t.shootTime || "Time TBD"}`;
      if (!sessions[key]) sessions[key] = [];
      sessions[key].push(t);
    });

    const sessionKeys = Object.keys(sessions);
    if (sessionKeys.length === 1) {
      generateShootScriptPdf(sessions[sessionKeys[0]]);
      return;
    }

    // Multiple sessions: ask user which session to print
    const sessionListText = sessionKeys
      .map((key, idx) => `${idx + 1}. ${key} (${sessions[key].length} Reels)`)
      .join("\n");
    const choice = window.prompt(
      `Multiple shoot sessions found. Enter number (1 to ${sessionKeys.length}) to export:\n\n${sessionListText}`,
      "1"
    );
    if (!choice) return;
    const selectedIdx = parseInt(choice, 10) - 1;
    if (selectedIdx >= 0 && selectedIdx < sessionKeys.length) {
      generateShootScriptPdf(sessions[sessionKeys[selectedIdx]]);
    } else {
      alert("Invalid selection.");
    }
  };

  const handleTargetReelsChange = (num) => {
    const val = Math.max(1, Number(num) || 1);
    setTargetReelsCount(val);
    if (clientScriptTasks.length > 1) {
      const otherTasks = clientScriptTasks.filter((t) => t._id !== showAssignShooterModal._id);
      const neededFromOthers = Math.max(0, val - 1);
      const chosenOthers = otherTasks.slice(0, neededFromOthers).map((t) => t._id);
      setSelectedBatchTaskIds([showAssignShooterModal._id, ...chosenOthers]);
    }
  };

  const toggleBatchTaskSelect = (taskId) => {
    if (taskId === showAssignShooterModal._id) return;
    let updated;
    if (selectedBatchTaskIds.includes(taskId)) {
      updated = selectedBatchTaskIds.filter((id) => id !== taskId);
    } else {
      updated = [...selectedBatchTaskIds, taskId];
    }
    setSelectedBatchTaskIds(updated);
    setTargetReelsCount(updated.length);
  };

  const handleToggleSelectAll = () => {
    if (selectedBatchTaskIds.length === clientScriptTasks.length) {
      setSelectedBatchTaskIds([showAssignShooterModal._id]);
      setTargetReelsCount(1);
    } else {
      const allIds = clientScriptTasks.map((t) => t._id);
      setSelectedBatchTaskIds(allIds);
      setTargetReelsCount(allIds.length);
    }
  };

  // ── 1. SCRIPT PASS ➔ ASSIGN SHOOTER SUBMIT ──
  const handlePassScriptSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const shooter = form.shooter.value;
    const shootDate = form.shootDate.value;
    const shootTime = form.shootTime.value;
    const location = form.location.value;
    const targetReels = Number(targetReelsCount || form.targetReels?.value || 1);

    if (!shooter) {
      alert("Please select a Shoot Person (Shooter)!");
      return;
    }
    if (!shootDate) {
      alert("Please select a Shoot Date!");
      return;
    }

    const taskIdsToPass = selectedBatchTaskIds.length > 0 ? selectedBatchTaskIds : [showAssignShooterModal._id];

    try {
      if (taskIdsToPass.length > 1) {
        await batchPassScriptToShoot({
          taskIds: taskIdsToPass,
          shooter,
          shootDate,
          shootTime,
          location,
          targetReels,
        });
        triggerCelebration(`${taskIdsToPass.length} Scripts Passed to Shoot together! 🎥`);
      } else {
        await passScriptToShoot(showAssignShooterModal._id, {
          shooter,
          shootDate,
          shootTime,
          location,
          targetReels,
        });
        triggerCelebration("Script Passed! Shoot Person Assigned & Notified! 🎥");
      }
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

  // Helper to check if user can delete task (Admin, Manager, Shooter, or Creator)
  const canDeleteTask = (task) => {
    if (!user) return true;
    if (user.role === "admin" || user.role === "manager") return true;
    const taskShooterId = task.shooterId?._id || task.shooter?._id || task.shooter;
    const currentUserId = user._id || user.id;
    if (taskShooterId && currentUserId && String(taskShooterId) === String(currentUserId)) return true;
    const creatorId = task.createdBy?._id || task.createdBy;
    if (creatorId && currentUserId && String(creatorId) === String(currentUserId)) return true;
    return false;
  };

  const handleDeleteTask = async (task) => {
    const clientName = task.client?.businessName || "Client";
    const confirmMsg = `Are you sure you want to delete Reel #${task.reelNumber} ("${task.title}") for ${clientName}?\n\nThis will remove the card and update ${clientName}'s reels progress bar.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await deleteProductionTask(task._id);
      triggerCelebration("Card deleted & Client Quota updated! 🗑️");
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete task");
    }
  };

  // Helper to check if current user is Admin, Manager or Assigned Shooter
  const canCompleteShoot = (task) => {
    if (!user) return false;
    if (user.role === "admin" || user.role === "manager") return true;

    const taskShooterId = task.shooterId?._id || task.shooter?._id || task.shooter;
    const currentUserId = user._id || user.id;
    if (taskShooterId && currentUserId && String(taskShooterId) === String(currentUserId)) return true;

    const taskShooterName = (task.shooterId?.name || task.shooter?.name || "").toLowerCase().trim();
    const currentUserName = (user.name || "").toLowerCase().trim();
    if (taskShooterName && currentUserName && taskShooterName === currentUserName) return true;

    return false;
  };

  // ── 3. SHOOT COMPLETE ──
  const handleCompleteShootClick = async (task) => {
    if (!canCompleteShoot(task)) {
      alert("Access Denied: Only the assigned Shooter (" + (task.shooterId?.name || "Shooter") + "), Admin, or Manager can mark this shoot as complete.");
      return;
    }
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

    const selectedTasks = handoffSessionTasks.filter(
      (t) => handoffCardData[t._id]?.selected
    );

    if (selectedTasks.length === 0) {
      alert("Please select at least 1 reel to handoff to editing!");
      return;
    }

    // Strict validation for each selected reel
    for (const t of selectedTasks) {
      const data = handoffCardData[t._id] || {};
      const link = (data.rawFootageLink || "").trim();
      const editor = data.editor;

      if (!link) {
        alert(
          `❌ રો ડેટા નાખ્યા વગર આગળ નહિ વધે!\n\nRaw Footage Link is strictly required for Reel #${t.reelNumber} (${t.title || "Reel"}).`
        );
        return;
      }
      if (!editor) {
        alert(
          `❌ Please assign a Video Editor for Reel #${t.reelNumber} (${t.title || "Reel"}).`
        );
        return;
      }
    }

    try {
      const handoffs = selectedTasks.map((t) => {
        const data = handoffCardData[t._id];
        return {
          taskId: t._id,
          reelNumber: t.reelNumber,
          rawFootageLink: data.rawFootageLink.trim(),
          editor: data.editor,
          editorNotes: (data.editorNotes || "").trim(),
        };
      });

      if (handoffs.length > 1) {
        await batchHandoffToEdit({ handoffs });
        triggerCelebration(`${handoffs.length} Reels Handed Off to Video Editing! ✂️`);
      } else {
        await handoffToEdit(handoffs[0].taskId, handoffs[0]);
        triggerCelebration(`Reel #${selectedTasks[0].reelNumber} Handed Off to Video Editing! ✂️`);
      }

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
  const activeTasks = tasks
    .filter((t) => t.stage !== "posted" && t.stage !== "completed")
    .sort((a, b) => (a.reelNumber || 0) - (b.reelNumber || 0));
  const postedTasks = tasks
    .filter((t) => t.stage === "posted" || t.stage === "completed")
    .sort((a, b) => (a.reelNumber || 0) - (b.reelNumber || 0));

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
              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 bg-orange-50 text-[#FF5200] border border-orange-200/80 text-[11px] font-black uppercase tracking-wider rounded-lg inline-flex items-center gap-1 shadow-2xs">
                  🏢 {task.client?.businessName || "Unknown Client"}
                </span>
                {task.client?.mobile && (
                  <span className="text-[10px] text-slate-500 font-mono font-semibold bg-slate-100 px-1.5 py-0.5 rounded">
                    📞 {task.client.mobile}
                  </span>
                )}
              </div>
              <h3 className="font-black text-base text-slate-900 mt-0.5 tracking-tight">
                Reel #{task.reelNumber}: {task.title}
              </h3>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                isScript
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : isShoot
                  ? task.shootStatus === "done"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : isEdit
                  ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                  : isQc
                  ? "bg-cyan-50 text-cyan-800 border-cyan-200"
                  : isClientApproval
                  ? "bg-orange-50 text-orange-800 border-orange-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}
            >
              {isShoot && task.shootStatus === "done" ? "SHOOT DONE ✓" : task.stage.replace("_", " ")}
              </span>

              {canDeleteTask(task) && (
                <button
                  onClick={() => handleDeleteTask(task)}
                  title={"Delete Reel #" + task.reelNumber + " (" + task.title + ")"}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer border border-transparent hover:border-red-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* ── ALL DETAILS: CLIENT, SHOOTER, EDITOR, WRITER ── */}
          <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50/80 border border-slate-200/80 rounded-2xl mb-3.5 text-xs">
            {/* Shooter */}
            <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-slate-100/90 shadow-2xs">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs flex-shrink-0">
                🎥
              </span>
              <div className="min-w-0">
                <span className="text-[9px] font-black text-slate-400 uppercase block leading-none">Shooter</span>
                <span className="font-black text-slate-800 truncate block text-[11px] mt-0.5">
                  {task.shooter?.name || <span className="text-slate-400 font-normal italic">Unassigned</span>}
                </span>
              </div>
            </div>

            {/* Editor */}
            <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-slate-100/90 shadow-2xs">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center text-xs flex-shrink-0">
                ✂️
              </span>
              <div className="min-w-0">
                <span className="text-[9px] font-black text-slate-400 uppercase block leading-none">Editor</span>
                <span className="font-black text-slate-800 truncate block text-[11px] mt-0.5">
                  {task.editor?.name || <span className="text-slate-400 font-normal italic">Unassigned</span>}
                </span>
              </div>
            </div>

            {/* Writer */}
            <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-slate-100/90 shadow-2xs">
              <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs flex-shrink-0">
                ✍️
              </span>
              <div className="min-w-0">
                <span className="text-[9px] font-black text-slate-400 uppercase block leading-none">Writer</span>
                <span className="font-bold text-slate-700 truncate block text-[11px] mt-0.5">
                  {task.writer?.name || <span className="text-slate-400 font-normal italic">Unassigned</span>}
                </span>
              </div>
            </div>

            {/* Client */}
            <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-slate-100/90 shadow-2xs">
              <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF5200] flex items-center justify-center text-xs flex-shrink-0">
                🏢
              </span>
              <div className="min-w-0">
                <span className="text-[9px] font-black text-slate-400 uppercase block leading-none">Client</span>
                <span className="font-black text-[#FF5200] truncate block text-[11px] mt-0.5">
                  {task.client?.businessName || "Client"}
                </span>
              </div>
            </div>
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
            <div className={`p-4 ${task.shootStatus === "done" ? "bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-200" : "bg-emerald-50/40 border-emerald-100"} border rounded-2xl mb-4 space-y-2 text-xs transition-all`}>
              {task.shootStatus === "done" && (
                <div className="flex items-center justify-between px-3 py-2 bg-emerald-100 border border-emerald-300 text-emerald-950 font-black rounded-xl text-xs mb-2">
                  <span className="flex items-center gap-1.5">
                    <span className="text-emerald-700 font-bold">✓</span> Shoot Completed!
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded-md">
                    Ready for Handoff
                  </span>
                </div>
              )}
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
            <div className="w-full space-y-2">
              <button
                onClick={() => openAssignShooterModal(task)}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-[#FF5200] to-[#FC8019] hover:from-[#E04800] hover:to-[#EB7410] text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Pass Script & Assign Shooter ➔</span>
              </button>
              <button
                onClick={() => handleGenerateShootPdf(task, false)}
                className="w-full px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>📄 View / Print Script PDF</span>
              </button>
            </div>
          )}

          {isShoot && (
            <div className="w-full space-y-2">
              <div className="flex gap-2">
                {canCompleteShoot(task) && (
                  <button
                    onClick={() => setShowEditShootModal(task)}
                    className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    ✏️ Edit Shoot Info
                  </button>
                )}
                <button
                  onClick={() => handleGenerateShootPdf(task, true)}
                  title={`Print / Save Shoot Script PDF for ${task.client?.businessName || "Client"}`}
                  className="flex-1 px-3 py-2 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <span>📄</span>
                  <span>Script PDF</span>
                </button>
              </div>

              <div>
                {task.shootStatus === "done" ? (
                  <div className="w-full px-3.5 py-2 bg-emerald-600 text-white text-xs font-black rounded-xl text-center flex items-center justify-center gap-1.5 shadow-sm select-none">
                    <span>✓</span> Shoot Completed
                  </div>
                ) : canCompleteShoot(task) ? (
                  <button
                    onClick={() => handleCompleteShootClick(task)}
                    className="w-full px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-black rounded-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <span>✓</span> Shoot Complete
                  </button>
                ) : (
                  <div
                    title={`Only assigned Shooter (${task.shooterId?.name || "Shooter"}), Admin, or Manager can complete this shoot`}
                    className="w-full px-3 py-2 bg-slate-100 text-slate-400 text-[11px] font-bold rounded-xl text-center border border-slate-200 select-none cursor-not-allowed"
                  >
                    🔒 Shooter / Admin Only
                  </div>
                )}
              </div>

              {(user?.role === "admin" || user?.role === "manager" || canCompleteShoot(task)) && (
                <button
                  onClick={() => openHandoffEditModal(task)}
                  className={`w-full px-4 py-2.5 bg-[#FF5200] hover:bg-[#E04800] text-white text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${task.shootStatus === "done" ? "ring-2 ring-orange-400 ring-offset-2 shadow-orange-200 shadow-lg" : ""}`}
                >
                  <span>Handoff to Edit (Assign Raw Data) ➔</span>
                </button>
              )}
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
                  <div className="flex items-center gap-1.5">
                    {c.inProgress > 0 && (
                      <span className="text-amber-600 font-bold">({c.inProgress} active)</span>
                    )}
                    <span className="font-black text-emerald-600">{c.percentage}% Delivered</span>
                  </div>
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

          {activeTab === "shoot" && tasks.length > 0 && (
            <button
              onClick={handleTopBarDocketExport}
              className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>📄</span>
              <span>Export Shoot Docket (PDF)</span>
            </button>
          )}
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
          {tasks.slice().sort((a, b) => (a.reelNumber || 0) - (b.reelNumber || 0)).map((task) => renderTaskCard(task))}
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
                <label className="text-xs font-bold text-slate-600 block mb-1">Client (છૂટક કામ માટે ⚡ Chhutak Work પસંદ કરો)</label>
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
                {newTaskForm.client && (
                  <div className="mt-2 text-[11px] font-bold text-[#FF5200] bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200/80 flex items-center justify-between">
                    <span>🎯 Reel Number Sequence:</span>
                    <span className="font-black font-mono">
                      Reel #{tasks.filter(t => String(t.client?._id || t.client) === String(newTaskForm.client)).length + 1} (Auto-assigned)
                    </span>
                  </div>
                )}
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
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Script / Hook / Dialogue <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write the reel script, spoken dialogue, or opening hook..."
                  value={newTaskForm.hook}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, hook: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-[#FF5200] leading-relaxed"
                />
              </div>

              {/* Optional Advanced Breakdown Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvancedScriptFields(!showAdvancedScriptFields)}
                  className="text-xs font-bold text-[#FF5200] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{showAdvancedScriptFields ? "▾ Hide Advanced Script Fields" : "▸ + Add Visual Concept, CTA & Goal (Optional)"}</span>
                </button>

                {showAdvancedScriptFields && (
                  <div className="mt-2.5 space-y-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">🎬 Visual Concept & Camera Direction</label>
                      <input
                        type="text"
                        placeholder="e.g. Close-up on product, slow pan, outdoor sunlight..."
                        value={newTaskForm.concept || ""}
                        onChange={(e) => setNewTaskForm({ ...newTaskForm, concept: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">🎯 Call to Action (CTA)</label>
                      <input
                        type="text"
                        placeholder="e.g. Comment 'GROWTH' to get our free guide!"
                        value={newTaskForm.cta || ""}
                        onChange={(e) => setNewTaskForm({ ...newTaskForm, cta: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">🎯 Reel Goal</label>
                      <select
                        value={newTaskForm.goal || "Authority"}
                        onChange={(e) => setNewTaskForm({ ...newTaskForm, goal: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-bold"
                      >
                        <option value="Authority">Authority</option>
                        <option value="Sales">Sales</option>
                        <option value="Trust">Trust</option>
                        <option value="Viral">Viral</option>
                        <option value="Awareness">Awareness</option>
                      </select>
                    </div>
                  </div>
                )}
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
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">Target Reels to Shoot</label>
                  {clientScriptTasks.length > 1 && (
                    <span className="text-[11px] font-black text-[#FF5200]">
                      {selectedBatchTaskIds.length} of {clientScriptTasks.length} Reels Selected
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  name="targetReels"
                  min="1"
                  value={targetReelsCount}
                  onChange={(e) => handleTargetReelsChange(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-orange-200 rounded-xl text-xs text-slate-900 font-bold focus:ring-2 focus:ring-orange-400 focus:outline-none"
                />
              </div>

              {/* Multiple Script Cards Selection for this Client */}
              {clientScriptTasks.length > 1 && (
                <div className="p-3 bg-orange-50/60 border border-orange-200 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <span>🎬</span> Select Reels to Shoot Together:
                    </span>
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      className="text-[11px] font-bold text-[#FF5200] hover:underline cursor-pointer"
                    >
                      {selectedBatchTaskIds.length === clientScriptTasks.length ? "Deselect Others" : "Select All Available"}
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {clientScriptTasks.map((t) => {
                      const isSelected = selectedBatchTaskIds.includes(t._id);
                      const isPrimary = t._id === showAssignShooterModal._id;
                      return (
                        <label
                          key={t._id}
                          className={`flex items-center gap-2.5 p-2 rounded-xl text-xs cursor-pointer transition-all border ${
                            isSelected
                              ? "bg-white border-orange-300 text-slate-900 shadow-2xs font-bold ring-1 ring-orange-200"
                              : "bg-slate-50 border-slate-200/70 text-slate-500 hover:bg-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isPrimary}
                            onChange={() => toggleBatchTaskSelect(t._id)}
                            className="w-4 h-4 text-[#FF5200] accent-[#FF5200] rounded cursor-pointer"
                          />
                          <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                            <span className="truncate">
                              <span className="font-mono font-black text-[#FF5200] mr-1.5">Reel #{t.reelNumber}</span>
                              {t.title}
                            </span>
                            {isPrimary && (
                              <span className="text-[10px] bg-orange-100 text-[#FF5200] font-black px-1.5 py-0.5 rounded">
                                Current
                              </span>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">
                    💡 All checked reels will be scheduled together for this shooter!
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignShooterModal(null)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#FF5200] hover:bg-[#E04800] text-white font-black rounded-xl text-xs shadow-md cursor-pointer transition-all active:scale-95"
                >
                  Pass & Send {selectedBatchTaskIds.length > 1 ? `(${selectedBatchTaskIds.length} Reels)` : ""} to Shoot ➔
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

      {/* ── MODAL 4: HANDOFF TO EDIT (MULTI-REEL BATCH & CARD-WISE DATA) ── */}
      {showHandoffEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl max-h-[92vh] flex flex-col my-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">✂️</span>
                  <h3 className="text-lg font-black text-slate-900">
                    Handoff to Edit (Assign Raw Data & Video Editors)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>Client: <strong className="text-slate-800 font-black">{showHandoffEditModal.client?.businessName || "Client"}</strong></span>
                  {showHandoffEditModal.shootDate && (
                    <span>· 📅 <strong className="text-slate-800">{showHandoffEditModal.shootDate}</strong></span>
                  )}
                  {showHandoffEditModal.shootTime && (
                    <span>· ⏰ <strong className="text-slate-800">{showHandoffEditModal.shootTime}</strong></span>
                  )}
                  <span>· 🎯 <strong className="text-orange-600">{handoffSessionTasks.length} {handoffSessionTasks.length === 1 ? "Reel" : "Reels"} Shot</strong></span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHandoffEditModal(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Mandatory Warning Banner */}
            <div className="my-3 text-xs text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>રો ડેટા લિંક અને એડિટર અસાઇન કર્યા વગર આગળ નહિ વધે! (Raw data link & Editor are strictly mandatory)</span>
            </div>

            <form onSubmit={handleHandoffEditSubmit} className="flex-1 overflow-y-auto pr-1 space-y-4">
              {/* Quick Fill / Master Controls */}
              {handoffSessionTasks.length > 1 && (
                <div className="p-3.5 bg-gradient-to-r from-orange-50/80 to-amber-50/60 border border-orange-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-orange-950 flex items-center gap-1.5">
                      <span>⚡</span>
                      <span>Quick-Fill Master Controls (Apply to All Selected Reels)</span>
                    </span>
                    <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                      Time Saver
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Master Raw Footage Link (Google Drive Folder)
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="url"
                          placeholder="https://drive.google.com/drive/folders/..."
                          value={masterRawLink}
                          onChange={(e) => setMasterRawLink(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-white border border-orange-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-orange-500"
                        />
                        <button
                          type="button"
                          onClick={handleApplyMasterLinkToAll}
                          title="Copy master drive link to all checked reels"
                          className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-bold rounded-xl shrink-0 cursor-pointer shadow-xs active:scale-95"
                        >
                          Apply All
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Master Video Editor (Assign same editor to all)
                      </label>
                      <select
                        value={masterEditor}
                        onChange={(e) => handleApplyMasterEditorToAll(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-orange-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-orange-500"
                      >
                        <option value="">-- Choose Common Editor --</option>
                        {teamMembers.map((m) => (
                          <option key={m.userId} value={m.userId}>
                            {m.name} ({m.position || m.role})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Card-wise / Video-wise Reel List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Reels to Handoff ({handoffSessionTasks.filter((t) => handoffCardData[t._id]?.selected).length} Selected)
                  </span>
                  {handoffSessionTasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const allSelected = handoffSessionTasks.every((t) => handoffCardData[t._id]?.selected);
                        setHandoffCardData((prev) => {
                          const next = { ...prev };
                          handoffSessionTasks.forEach((t) => {
                            if (next[t._id]) next[t._id] = { ...next[t._id], selected: !allSelected };
                          });
                          return next;
                        });
                      }}
                      className="text-[11px] font-bold text-orange-600 hover:underline cursor-pointer"
                    >
                      {handoffSessionTasks.every((t) => handoffCardData[t._id]?.selected) ? "Deselect All" : "Select All"}
                    </button>
                  )}
                </div>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {handoffSessionTasks.map((task) => {
                    const card = handoffCardData[task._id] || {
                      selected: true,
                      rawFootageLink: "",
                      editor: "",
                      editorNotes: "",
                    };
                    return (
                      <div
                        key={task._id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          card.selected
                            ? "bg-white border-orange-200 shadow-xs ring-1 ring-orange-100"
                            : "bg-slate-50 border-slate-200 opacity-60"
                        }`}
                      >
                        {/* Reel Header */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={Boolean(card.selected)}
                              onChange={(e) => {
                                const val = e.target.checked;
                                setHandoffCardData((prev) => ({
                                  ...prev,
                                  [task._id]: { ...prev[task._id], selected: val },
                                }));
                              }}
                              className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
                            />
                            <span className="px-2 py-0.5 bg-orange-600 text-white text-[10px] font-black rounded-md font-mono">
                              REEL #{task.reelNumber}
                            </span>
                            <span className="text-xs font-bold text-slate-900">
                              {task.title || "Untitled Reel"}
                            </span>
                          </label>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {task.goal || "Authority"}
                          </span>
                        </div>

                        {card.selected && (
                          <div className="space-y-2.5 pt-2 border-t border-slate-100">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {/* Raw Footage Link */}
                              <div>
                                <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center justify-between">
                                  <span>🔗 Raw Data Link (Drive) <span className="text-red-500">*</span></span>
                                  {masterRawLink && card.rawFootageLink !== masterRawLink && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setHandoffCardData((prev) => ({
                                          ...prev,
                                          [task._id]: { ...prev[task._id], rawFootageLink: masterRawLink },
                                        }));
                                      }}
                                      className="text-[10px] text-orange-600 font-bold hover:underline cursor-pointer"
                                    >
                                      Use Master
                                    </button>
                                  )}
                                </label>
                                <input
                                  type="url"
                                  required={card.selected}
                                  placeholder="https://drive.google.com/..."
                                  value={card.rawFootageLink || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setHandoffCardData((prev) => ({
                                      ...prev,
                                      [task._id]: { ...prev[task._id], rawFootageLink: val },
                                    }));
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-orange-500"
                                />
                              </div>

                              {/* Video Editor */}
                              <div>
                                <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center justify-between">
                                  <span>✂️ Video Editor <span className="text-red-500">*</span></span>
                                  {masterEditor && card.editor !== masterEditor && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setHandoffCardData((prev) => ({
                                          ...prev,
                                          [task._id]: { ...prev[task._id], editor: masterEditor },
                                        }));
                                      }}
                                      className="text-[10px] text-orange-600 font-bold hover:underline cursor-pointer"
                                    >
                                      Use Master
                                    </button>
                                  )}
                                </label>
                                <select
                                  required={card.selected}
                                  value={card.editor || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setHandoffCardData((prev) => ({
                                      ...prev,
                                      [task._id]: { ...prev[task._id], editor: val },
                                    }));
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:outline-orange-500"
                                >
                                  <option value="">-- Select Video Editor --</option>
                                  {teamMembers.map((m) => (
                                    <option key={m.userId} value={m.userId}>
                                      {m.name} ({m.position || m.role})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Reel Specific Editing Notes */}
                            <div>
                              <input
                                type="text"
                                placeholder="Reel editing notes / instructions (optional)..."
                                value={card.editorNotes || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setHandoffCardData((prev) => ({
                                    ...prev,
                                    [task._id]: { ...prev[task._id], editorNotes: val },
                                  }));
                                }}
                                className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-orange-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
                <span className="text-xs font-bold text-slate-500">
                  {handoffSessionTasks.filter((t) => handoffCardData[t._id]?.selected).length} of {handoffSessionTasks.length} Reels Ready
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowHandoffEditModal(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-[#FF5200] to-[#FC8019] hover:from-[#E04800] hover:to-[#EB7410] text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Send {handoffSessionTasks.filter((t) => handoffCardData[t._id]?.selected).length} Reels to Editor ➔</span>
                  </button>
                </div>
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
