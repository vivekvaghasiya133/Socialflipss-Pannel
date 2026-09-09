"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Card, Grid, Table, TableBody, TableCell,
  TableHead, TableRow, TableContainer, IconButton, Button,
  FormControlLabel, Switch, CircularProgress, Alert, Paper,
  Chip, Tooltip, Tabs, Tab, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Divider
} from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckIcon from "@mui/icons-material/CheckCircle";
import LinkIcon from "@mui/icons-material/Link";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import RateReviewIcon from "@mui/icons-material/RateReview";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SendIcon from "@mui/icons-material/Send";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import {
  getProductionTasks,
  submitEditToQc,
  completeShoot,
  qcDecision,
  clientDecision
} from "../api/agencyOsApi";

const SECTION_CONFIG = {
  script:          { title: "✍️ Writers Section",     stage: "script",          label: "Tasks in Script Stage", color: "info" },
  shoot:           { title: "🎥 Shooters Section",    stage: "shoot",           label: "Tasks in Shoot Stage",  color: "secondary" },
  edit:            { title: "🎬 Editors Section",     stage: "edit",            label: "Tasks in Edit Stage",   color: "warning" },
  qc:              { title: "✅ QC Section",          stage: "qc",              label: "Tasks in QC Stage",     color: "success" },
  client_approval: { title: "👤 Account Managers",    stage: "client_approval", label: "Client Approval Stage", color: "primary" }
};

export default function TeamDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [myTasksOnly, setMyTasksOnly] = useState(false);

  // Script writer tab state
  const [scriptTab, setScriptTab] = useState(0);

  // Modals state
  const [editScriptDialog, setEditScriptDialog] = useState({ open: false, task: null, hook: "", bodyText: "", concept: "", cta: "" });
  const [submitQcDialog, setSubmitQcDialog] = useState({ open: false, task: null, previewLink: "", notes: "", loading: false });
  const [completeShootDialog, setCompleteShootDialog] = useState({ open: false, task: null, rawFootageLink: "", completedReels: 1, shootNote: "", loading: false });
  const [qcDecisionDialog, setQcDecisionDialog] = useState({ open: false, task: null, decision: "approve", notes: "", loading: false });

  // ── 1. LOAD TASKS (ProductionTask pipeline + legacy content) ──
  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [prodRes, legacyRes] = await Promise.allSettled([
        getProductionTasks(),
        api.get("/content", { params: { type: "reel", limit: 300 } })
      ]);

      const combined = [];

      // Add modern production tasks (from ProductionHub)
      if (prodRes.status === "fulfilled" && prodRes.value.data?.tasks) {
        prodRes.value.data.tasks.forEach(t => {
          combined.push({
            _id: t._id,
            title: t.title,
            reelNumber: t.reelNumber || 1,
            stage: t.stage, // script | shoot | edit | qc | client_approval | posted | completed
            client: t.client,
            clientId: t.client,
            goal: t.goal || "Authority",
            priority: t.priority || "medium",
            shooter: t.shooter,
            shooterId: t.shooter,
            editor: t.editor,
            editorId: t.editor,
            writer: t.writer,
            assignedTo: t.writer,
            rawFootageLink: t.rawFootageLink || "",
            driveLink: t.rawFootageLink || "",
            editedPreviewLink: t.editedPreviewLink || "",
            postDate: t.editorDeadline || t.shootDate || t.createdAt,
            shootDate: t.shootDate || "",
            shootTime: t.shootTime || "",
            location: t.location || "",
            targetReels: t.targetReels || 1,
            completedReels: t.completedReels || 0,
            shootStatus: t.shootStatus || "scheduled",
            editingStatus: t.editingStatus || "assigned",
            editorNotes: t.editorNotes || "",
            concept: t.concept || "",
            hook: t.hook || "",
            bodyText: t.bodyText || "",
            cta: t.cta || "",
            scriptText: t.bodyText || t.concept || "",
            scriptApprovalStatus: t.scriptStatus || "pending",
            scriptApproved: t.scriptStatus === "approved",
            scriptNotes: t.scriptNotes || "",
            qcStatus: t.qcStatus || "pending",
            qcNotes: t.qcNotes || "",
            clientApprovalStatus: t.clientApprovalStatus || "pending",
            clientFeedback: t.clientFeedback || "",
            isProductionTask: true,
            createdAt: t.createdAt
          });
        });
      }

      // Merge legacy content tasks if any
      if (legacyRes.status === "fulfilled" && legacyRes.value.data?.content) {
        legacyRes.value.data.content.forEach(c => {
          if (!combined.some(t => String(t._id) === String(c._id))) {
            combined.push({
              ...c,
              client: c.clientId,
              editor: c.editorId,
              shooter: c.shooterId,
              rawFootageLink: c.driveLink || "",
              isProductionTask: false
            });
          }
        });
      }

      setTasks(combined);
    } catch (err) {
      console.error("TeamDashboard loadTasks error:", err);
      setError("Failed to load team tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // ── 2. FILTER TASKS ──
  const filteredTasks = tasks.filter(task => {
    if (myTasksOnly) {
      const myId = String(user?._id || "");
      const isShooter = String(task.shooter?._id || task.shooter || task.shooterId?._id || task.shooterId || "") === myId;
      const isEditor  = String(task.editor?._id || task.editor || task.editorId?._id || task.editorId || "") === myId;
      const isWriter  = String(task.writer?._id || task.writer || task.assignedTo?._id || task.assignedTo || "") === myId;
      return isShooter || isEditor || isWriter;
    }
    return true;
  });

  const getTasksByStage = (stageKey) => {
    return filteredTasks.filter(task => task.stage === stageKey);
  };

  const showToast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // ── 3. ACTIONS & SUBMITS ──
  // A. Editor submits video to QC
  const handleOpenSubmitQc = (task) => {
    setSubmitQcDialog({
      open: true,
      task,
      previewLink: task.editedPreviewLink || "",
      notes: task.editorNotes || "",
      loading: false
    });
  };

  const handleSubmitQcConfirm = async () => {
    if (!submitQcDialog.previewLink.trim()) {
      alert("Please provide the edited video preview link!");
      return;
    }
    setSubmitQcDialog(prev => ({ ...prev, loading: true }));
    try {
      if (submitQcDialog.task.isProductionTask) {
        await submitEditToQc(submitQcDialog.task._id, {
          editedPreviewLink: submitQcDialog.previewLink.trim(),
          editorNotes: submitQcDialog.notes.trim()
        });
      } else {
        await api.put(`/content/${submitQcDialog.task._id}`, {
          stage: "qc",
          driveLink: submitQcDialog.previewLink.trim()
        });
      }
      setSubmitQcDialog({ open: false, task: null, previewLink: "", notes: "", loading: false });
      showToast("🎉 Video successfully submitted for QC review!");
      loadTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit video to QC.");
      setSubmitQcDialog(prev => ({ ...prev, loading: false }));
    }
  };

  // B. Shooter marks shoot complete
  const handleOpenCompleteShoot = (task) => {
    setCompleteShootDialog({
      open: true,
      task,
      rawFootageLink: task.rawFootageLink || "",
      completedReels: task.completedReels || task.targetReels || 1,
      shootNote: "",
      loading: false
    });
  };

  const handleCompleteShootConfirm = async () => {
    setCompleteShootDialog(prev => ({ ...prev, loading: true }));
    try {
      if (completeShootDialog.task.isProductionTask) {
        await completeShoot(completeShootDialog.task._id, {
          completedReels: completeShootDialog.completedReels,
          rawFootageLink: completeShootDialog.rawFootageLink,
          shootNote: completeShootDialog.shootNote
        });
      } else {
        await api.put(`/content/${completeShootDialog.task._id}`, {
          stage: "edit",
          driveLink: completeShootDialog.rawFootageLink
        });
      }
      setCompleteShootDialog({ open: false, task: null, rawFootageLink: "", completedReels: 1, shootNote: "", loading: false });
      showToast("🎬 Shoot marked as completed successfully!");
      loadTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to complete shoot.");
      setCompleteShootDialog(prev => ({ ...prev, loading: false }));
    }
  };

  // C. QC Decision (Approve / Changes)
  const handleOpenQcDecision = (task, decision) => {
    setQcDecisionDialog({
      open: true,
      task,
      decision,
      notes: "",
      loading: false
    });
  };

  const handleQcDecisionConfirm = async () => {
    setQcDecisionDialog(prev => ({ ...prev, loading: true }));
    try {
      if (qcDecisionDialog.task.isProductionTask) {
        await qcDecision(qcDecisionDialog.task._id, {
          decision: qcDecisionDialog.decision,
          qcNotes: qcDecisionDialog.notes
        });
      } else {
        await api.put(`/content/${qcDecisionDialog.task._id}`, {
          stage: qcDecisionDialog.decision === "approve" ? "client_approval" : "edit"
        });
      }
      setQcDecisionDialog({ open: false, task: null, decision: "approve", notes: "", loading: false });
      showToast(qcDecisionDialog.decision === "approve" ? "✅ Reel approved and moved to Client Approval!" : "⚠️ Changes requested — moved back to Editor!");
      loadTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit QC decision.");
      setQcDecisionDialog(prev => ({ ...prev, loading: false }));
    }
  };

  // D. Writer edits script
  const handleOpenEditScript = (task) => {
    setEditScriptDialog({
      open: true,
      task,
      concept: task.concept || "",
      hook: task.hook || "",
      bodyText: task.bodyText || task.scriptText || "",
      cta: task.cta || ""
    });
  };

  const handleSaveScriptConfirm = async () => {
    try {
      if (editScriptDialog.task.isProductionTask) {
        await api.put(`/production/tasks/${editScriptDialog.task._id}`, {
          concept: editScriptDialog.concept,
          hook: editScriptDialog.hook,
          bodyText: editScriptDialog.bodyText,
          cta: editScriptDialog.cta,
          scriptStatus: "pending"
        });
      } else {
        await api.put(`/content/${editScriptDialog.task._id}`, {
          scriptText: editScriptDialog.bodyText,
          scriptApprovalStatus: "pending"
        });
      }
      setEditScriptDialog({ open: false, task: null, hook: "", bodyText: "", concept: "", cta: "" });
      showToast("📝 Script updated successfully!");
      loadTasks();
    } catch (err) {
      alert("Failed to save script.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            👨‍💻 Team Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Operational dashboard organized by operational stages. Real-time tasks & instant submissions.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <FormControlLabel
            control={
              <Switch 
                checked={myTasksOnly} 
                onChange={(e) => setMyTasksOnly(e.target.checked)} 
                color="primary"
              />
            }
            label={<Typography variant="body2" fontWeight={700}>Show My Tasks Only</Typography>}
          />
          <Button variant="outlined" size="small" onClick={loadTasks} sx={{ fontWeight: 700, borderRadius: 2 }}>
            🔄 Refresh
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}>{successMsg}</Alert>}

      {/* Grid of Operational Sections */}
      <Grid container spacing={3}>
        {Object.entries(SECTION_CONFIG).map(([key, config]) => {
          const stageTasks = getTasksByStage(config.stage);

          // ── SECTION 1: WRITERS ──
          if (config.stage === "script") {
            const pendingTasks  = stageTasks.filter(t => !t.scriptText && !t.bodyText);
            const revisionTasks = stageTasks.filter(t => t.scriptApprovalStatus === "changes_requested" || t.scriptStatus === "changes_needed");
            const reviewTasks   = stageTasks.filter(t => (t.scriptText || t.bodyText) && (t.scriptApprovalStatus === "pending" || t.scriptStatus === "drafted"));
            const approvedTasks = stageTasks.filter(t => t.scriptApprovalStatus === "approved" || t.scriptApproved || t.scriptStatus === "approved");
            
            const tabTasks = [pendingTasks, revisionTasks, reviewTasks, approvedTasks][scriptTab] || [];
            
            return (
              <Grid item xs={12} key={key}>
                <Card sx={{ border: "1px solid #e2e8f0", borderRadius: 3, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                  <Box sx={{ p: 2, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={800}>
                        {config.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {config.label}
                      </Typography>
                    </Box>
                    <Chip 
                      label={`${stageTasks.length} active`} 
                      color={config.color} 
                      size="small" 
                      sx={{ fontWeight: 800 }}
                    />
                  </Box>
                  
                  {/* Tabs */}
                  <Tabs value={scriptTab} onChange={(e, val) => setScriptTab(val)} variant="scrollable" scrollButtons="auto" sx={{ px: 2, borderBottom: "1px solid #e2e8f0" }}>
                    <Tab label={`📝 Pending (${pendingTasks.length})`} sx={{ fontSize: 12, fontWeight: 700 }} />
                    <Tab label={`⚠️ Revisions (${revisionTasks.length})`} sx={{ fontSize: 12, fontWeight: 700, color: revisionTasks.length > 0 ? "error.main" : "inherit" }} />
                    <Tab label={`👀 In Review (${reviewTasks.length})`} sx={{ fontSize: 12, fontWeight: 700 }} />
                    <Tab label={`✅ Approved (${approvedTasks.length})`} sx={{ fontSize: 12, fontWeight: 700 }} />
                  </Tabs>
                  
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ background: "#f8fafc" }}>
                          <TableCell sx={{ fontWeight: 700, fontSize: 11, color: "text.secondary" }}>Reel Details</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: 11, color: "text.secondary" }}>Client</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: 11, color: "text.secondary" }}>Due Date</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: 11, color: "text.secondary" }}>Writer</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: 11, color: "text.secondary" }} align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tabTasks.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.disabled", fontSize: 12 }}>
                              No tasks in this category.
                            </TableCell>
                          </TableRow>
                        ) : (
                          tabTasks.map(task => (
                            <TableRow key={task._id} hover>
                              <TableCell sx={{ py: 1.5 }}>
                                <Typography variant="body2" fontWeight={700}>
                                  Reel #{task.reelNumber || 1}: {task.title}
                                </Typography>
                                {task.concept && (
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Concept: {task.concept}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell sx={{ py: 1.5, fontWeight: 600 }}>
                                {task.client?.businessName || task.clientId?.businessName || "Unknown Client"}
                              </TableCell>
                              <TableCell sx={{ py: 1.5, fontSize: 12 }}>
                                {task.postDate ? new Date(task.postDate).toLocaleDateString("en-IN") : "—"}
                              </TableCell>
                              <TableCell sx={{ py: 1.5, fontSize: 12 }}>
                                {task.writer?.name || task.assignedTo?.name || "Unassigned"}
                              </TableCell>
                              <TableCell sx={{ py: 1.5 }} align="right">
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="primary"
                                  onClick={() => handleOpenEditScript(task)}
                                  sx={{ fontWeight: 700, fontSize: 11, textTransform: "none", borderRadius: 1.5 }}
                                >
                                  {task.bodyText || task.scriptText ? "Edit Script" : "Write Script"}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Grid>
            );
          }

          // ── SECTION 2, 3, 4, 5: SHOOT, EDIT, QC, CLIENT APPROVAL ──
          return (
            <Grid item xs={12} key={key}>
              <Card sx={{ border: "1px solid #e2e8f0", borderRadius: 3, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <Box sx={{ p: 2, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={800}>
                      {config.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {config.label}
                    </Typography>
                  </Box>
                  <Chip 
                    label={`${stageTasks.length} active`} 
                    color={config.color} 
                    size="small" 
                    sx={{ fontWeight: 800 }}
                  />
                </Box>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ background: "#f8fafc" }}>
                        <TableCell sx={{ fontWeight: 700, fontSize: 11, color: "text.secondary" }}>Reel Details</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 11, color: "text.secondary" }}>Client</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 11, color: "text.secondary" }}>
                          {config.stage === "shoot" ? "Shoot Date / Info" : config.stage === "edit" ? "Raw Footage Drive" : "Preview Link"}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 11, color: "text.secondary" }}>Assigned Person</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: 11, color: "text.secondary" }} align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stageTasks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 3.5, color: "text.disabled", fontSize: 12 }}>
                            No active tasks in this stage.
                          </TableCell>
                        </TableRow>
                      ) : (
                        stageTasks.map(task => {
                          const clientName = task.client?.businessName || task.clientId?.businessName || "Unknown Client";

                          // 🎬 EDITORS SECTION ROW
                          if (config.stage === "edit") {
                            return (
                              <TableRow key={task._id} hover>
                                <TableCell sx={{ py: 1.5 }}>
                                  <Typography variant="body2" fontWeight={700}>
                                    Reel #{task.reelNumber || 1}: {task.title}
                                  </Typography>
                                  <Box sx={{ display: "flex", gap: 0.5, mt: 0.25 }}>
                                    <Chip label={`Goal: ${task.goal || "Authority"}`} size="small" sx={{ fontSize: 9, height: 18 }} />
                                    {task.editingStatus && (
                                      <Chip 
                                        label={task.editingStatus.toUpperCase()} 
                                        size="small" 
                                        color={task.editingStatus === "completed" ? "success" : "warning"}
                                        sx={{ fontSize: 9, height: 18, fontWeight: 700 }} 
                                      />
                                    )}
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ py: 1.5, fontWeight: 600 }}>
                                  {clientName}
                                </TableCell>
                                <TableCell sx={{ py: 1.5 }}>
                                  {task.rawFootageLink ? (
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      startIcon={<LaunchIcon sx={{ fontSize: 14 }} />}
                                      component="a"
                                      href={task.rawFootageLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      sx={{ fontSize: 11, fontWeight: 700, textTransform: "none", bgcolor: "#eff6ff", color: "#1d4ed8", borderColor: "#93c5fd" }}
                                    >
                                      Open Raw Drive
                                    </Button>
                                  ) : (
                                    <Typography variant="caption" color="text.disabled">No Drive link provided</Typography>
                                  )}
                                </TableCell>
                                <TableCell sx={{ py: 1.5 }}>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                    <Chip 
                                      label={task.editor?.name || task.editorId?.name || "Unassigned"} 
                                      size="small" 
                                      sx={{ fontWeight: 700, bgcolor: "#ede9fe", color: "#5b21b6" }}
                                    />
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ py: 1.5 }} align="right">
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="warning"
                                    startIcon={<CheckIcon sx={{ fontSize: 16 }} />}
                                    onClick={() => handleOpenSubmitQc(task)}
                                    sx={{ fontWeight: 800, fontSize: 11, textTransform: "none", borderRadius: 2, boxShadow: "none" }}
                                  >
                                    ✂️ Submit Video for QC
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          }

                          // 🎥 SHOOTERS SECTION ROW
                          if (config.stage === "shoot") {
                            return (
                              <TableRow key={task._id} hover>
                                <TableCell sx={{ py: 1.5 }}>
                                  <Typography variant="body2" fontWeight={700}>
                                    Reel #{task.reelNumber || 1}: {task.title}
                                  </Typography>
                                  {task.location && (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      📍 {task.location}
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell sx={{ py: 1.5, fontWeight: 600 }}>
                                  {clientName}
                                </TableCell>
                                <TableCell sx={{ py: 1.5 }}>
                                  <Typography variant="body2" fontWeight={600} fontSize={12}>
                                    📅 {task.shootDate || "Date TBD"} {task.shootTime ? `(${task.shootTime})` : ""}
                                  </Typography>
                                  {task.rawFootageLink && (
                                    <Button
                                      size="small"
                                      variant="text"
                                      component="a"
                                      href={task.rawFootageLink}
                                      target="_blank"
                                      sx={{ fontSize: 10, p: 0, minWidth: "auto", textTransform: "none" }}
                                    >
                                      Raw Link ➔
                                    </Button>
                                  )}
                                </TableCell>
                                <TableCell sx={{ py: 1.5 }}>
                                  <Chip 
                                    label={task.shooter?.name || task.shooterId?.name || "Unassigned"} 
                                    size="small" 
                                    sx={{ fontWeight: 700, bgcolor: "#ecfdf5", color: "#065f46" }}
                                  />
                                </TableCell>
                                <TableCell sx={{ py: 1.5 }} align="right">
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => handleOpenCompleteShoot(task)}
                                    sx={{ fontWeight: 800, fontSize: 11, textTransform: "none", borderRadius: 2 }}
                                  >
                                    📸 Complete Shoot
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          }

                          // ✅ QC SECTION ROW
                          if (config.stage === "qc") {
                            return (
                              <TableRow key={task._id} hover>
                                <TableCell sx={{ py: 1.5 }}>
                                  <Typography variant="body2" fontWeight={700}>
                                    Reel #{task.reelNumber || 1}: {task.title}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Editor: {task.editor?.name || "Editor"}
                                  </Typography>
                                </TableCell>
                                <TableCell sx={{ py: 1.5, fontWeight: 600 }}>
                                  {clientName}
                                </TableCell>
                                <TableCell sx={{ py: 1.5 }}>
                                  {task.editedPreviewLink ? (
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      startIcon={<PlayCircleOutlineIcon sx={{ fontSize: 14 }} />}
                                      component="a"
                                      href={task.editedPreviewLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      sx={{ fontSize: 11, fontWeight: 700, textTransform: "none", color: "#059669", borderColor: "#a7f3d0", bgcolor: "#ecfdf5" }}
                                    >
                                      🎬 View Preview
                                    </Button>
                                  ) : (
                                    <Typography variant="caption" color="text.disabled">—</Typography>
                                  )}
                                </TableCell>
                                <TableCell sx={{ py: 1.5 }}>
                                  <Chip label="Ready for QC" size="small" color="success" sx={{ fontWeight: 700, fontSize: 10 }} />
                                </TableCell>
                                <TableCell sx={{ py: 1.5 }} align="right">
                                  <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="error"
                                      onClick={() => handleOpenQcDecision(task, "changes_needed")}
                                      sx={{ fontSize: 10, fontWeight: 700, textTransform: "none" }}
                                    >
                                      Changes
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="success"
                                      onClick={() => handleOpenQcDecision(task, "approve")}
                                      sx={{ fontSize: 10, fontWeight: 700, textTransform: "none" }}
                                    >
                                      Approve ➔
                                    </Button>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            );
                          }

                          // 👤 CLIENT APPROVAL ROW
                          return (
                            <TableRow key={task._id} hover>
                              <TableCell sx={{ py: 1.5 }}>
                                <Typography variant="body2" fontWeight={700}>
                                  Reel #{task.reelNumber || 1}: {task.title}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ py: 1.5, fontWeight: 600 }}>
                                {clientName}
                              </TableCell>
                              <TableCell sx={{ py: 1.5 }}>
                                {task.editedPreviewLink ? (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    component="a"
                                    href={task.editedPreviewLink}
                                    target="_blank"
                                    sx={{ fontSize: 11, fontWeight: 600, textTransform: "none" }}
                                  >
                                    Preview ➔
                                  </Button>
                                ) : "—"}
                              </TableCell>
                              <TableCell sx={{ py: 1.5 }}>
                                <Chip label="Awaiting Client" size="small" color="primary" sx={{ fontSize: 10, fontWeight: 700 }} />
                              </TableCell>
                              <TableCell sx={{ py: 1.5 }} align="right">
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  onClick={async () => {
                                    if (window.confirm(`Mark Reel #${task.reelNumber} as approved by ${clientName}?`)) {
                                      await clientDecision(task._id, { decision: "approved" });
                                      showToast("🎉 Reel approved and marked Ready to Post!");
                                      loadTasks();
                                    }
                                  }}
                                  sx={{ fontSize: 10, fontWeight: 700, textTransform: "none" }}
                                >
                                  Client Approved ✓
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* ── MODAL 1: SUBMIT VIDEO LINK FOR QC (FOR EDITORS) ── */}
      <Dialog 
        open={submitQcDialog.open} 
        onClose={() => !submitQcDialog.loading && setSubmitQcDialog(prev => ({ ...prev, open: false }))} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1 }}>
          ✂️ Submit Edited Video for QC Review
        </DialogTitle>
        <DialogContent dividers>
          {submitQcDialog.task && (
            <Box sx={{ mb: 2, p: 2, bgcolor: "#fffbeb", border: "1px solid #fde68a", borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} color="#92400e">
                {submitQcDialog.task.client?.businessName || submitQcDialog.task.clientId?.businessName}
              </Typography>
              <Typography variant="body2" fontWeight={700} color="#78350f">
                Reel #{submitQcDialog.task.reelNumber || 1}: {submitQcDialog.task.title}
              </Typography>
              {submitQcDialog.task.rawFootageLink && (
                <Button
                  size="small"
                  startIcon={<LaunchIcon sx={{ fontSize: 13 }} />}
                  component="a"
                  href={submitQcDialog.task.rawFootageLink}
                  target="_blank"
                  sx={{ mt: 1, fontSize: 11, textTransform: "none", fontWeight: 700 }}
                >
                  View Source Raw Footage
                </Button>
              )}
            </Box>
          )}

          <TextField
            label="Edited Video Preview Link (Google Drive / Dropbox / Vimeo / YouTube) *"
            fullWidth
            required
            placeholder="https://drive.google.com/file/d/..."
            value={submitQcDialog.previewLink}
            onChange={(e) => setSubmitQcDialog(prev => ({ ...prev, previewLink: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Editor Notes / Comments (Optional)"
            fullWidth
            multiline
            rows={3}
            placeholder="e.g. Added sound effects, color graded, first cut completed..."
            value={submitQcDialog.notes}
            onChange={(e) => setSubmitQcDialog(prev => ({ ...prev, notes: e.target.value }))}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setSubmitQcDialog(prev => ({ ...prev, open: false }))} 
            disabled={submitQcDialog.loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            disabled={submitQcDialog.loading || !submitQcDialog.previewLink.trim()}
            onClick={handleSubmitQcConfirm}
            sx={{ fontWeight: 800, borderRadius: 2, px: 3 }}
          >
            {submitQcDialog.loading ? <CircularProgress size={20} /> : "🚀 Submit to QC"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── MODAL 2: COMPLETE SHOOT (FOR SHOOTERS) ── */}
      <Dialog 
        open={completeShootDialog.open} 
        onClose={() => !completeShootDialog.loading && setCompleteShootDialog(prev => ({ ...prev, open: false }))} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>📸 Mark Shoot as Complete</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Completed Reels Count *"
            type="number"
            fullWidth
            value={completeShootDialog.completedReels}
            onChange={(e) => setCompleteShootDialog(prev => ({ ...prev, completedReels: Number(e.target.value) }))}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Raw Footage Drive Link (Cloud / Google Drive)"
            fullWidth
            placeholder="https://drive.google.com/drive/folders/..."
            value={completeShootDialog.rawFootageLink}
            onChange={(e) => setCompleteShootDialog(prev => ({ ...prev, rawFootageLink: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Shoot Remarks / Note"
            fullWidth
            multiline
            rows={2}
            value={completeShootDialog.shootNote}
            onChange={(e) => setCompleteShootDialog(prev => ({ ...prev, shootNote: e.target.value }))}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCompleteShootDialog(prev => ({ ...prev, open: false }))}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={handleCompleteShootConfirm} sx={{ fontWeight: 800 }}>
            {completeShootDialog.loading ? <CircularProgress size={20} /> : "Confirm Shoot Complete ✓"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── MODAL 3: QC DECISION ── */}
      <Dialog open={qcDecisionDialog.open} onClose={() => setQcDecisionDialog(prev => ({ ...prev, open: false }))} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {qcDecisionDialog.decision === "approve" ? "✅ Approve Reel for Client" : "⚠️ Request Changes from Editor"}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            label={qcDecisionDialog.decision === "approve" ? "QC Approval Note (Optional)" : "Required Changes Description *"}
            fullWidth
            multiline
            rows={4}
            value={qcDecisionDialog.notes}
            onChange={(e) => setQcDecisionDialog(prev => ({ ...prev, notes: e.target.value }))}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setQcDecisionDialog(prev => ({ ...prev, open: false }))}>Cancel</Button>
          <Button 
            variant="contained" 
            color={qcDecisionDialog.decision === "approve" ? "success" : "error"} 
            onClick={handleQcDecisionConfirm}
            sx={{ fontWeight: 800 }}
          >
            Confirm Decision
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── MODAL 4: EDIT SCRIPT (FOR WRITERS) ── */}
      <Dialog open={editScriptDialog.open} onClose={() => setEditScriptDialog(prev => ({ ...prev, open: false }))} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>📝 Script Vault — Edit Concept & Script</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Hook / First 3 Seconds"
            fullWidth
            value={editScriptDialog.hook}
            onChange={(e) => setEditScriptDialog(prev => ({ ...prev, hook: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Concept / Angle"
            fullWidth
            value={editScriptDialog.concept}
            onChange={(e) => setEditScriptDialog(prev => ({ ...prev, concept: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Full Script Body"
            fullWidth
            multiline
            rows={8}
            value={editScriptDialog.bodyText}
            onChange={(e) => setEditScriptDialog(prev => ({ ...prev, bodyText: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Call to Action (CTA)"
            fullWidth
            value={editScriptDialog.cta}
            onChange={(e) => setEditScriptDialog(prev => ({ ...prev, cta: e.target.value }))}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditScriptDialog(prev => ({ ...prev, open: false }))}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSaveScriptConfirm} sx={{ fontWeight: 800 }}>
            Save Script
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
