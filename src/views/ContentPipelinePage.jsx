"use client";

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Card, CardContent, Chip, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, Alert, Snackbar,
  CircularProgress, Tooltip, Avatar, Grid, Divider, InputAdornment, ListSubheader,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import VideocamIcon from "@mui/icons-material/Videocam";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LaunchIcon from "@mui/icons-material/Launch";
import SearchIcon from "@mui/icons-material/Search";
import FilterIcon from "@mui/icons-material/FilterList";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

import api from "../api";
import { getClients } from "../api/clientsApi";
import {
  getProductionTasks,
  createProductionTask,
  updateProductionTask,
  deleteProductionTask,
} from "../api/agencyOsApi";

const STAGES = [
  { key: "idea",            label: "💡 Idea",             color: "#4b5563", bg: "#f3f4f6", border: "#e5e7eb" },
  { key: "script",          label: "✍️ Script Vault",      color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd" },
  { key: "shoot",           label: "🎥 Shooting",         color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" },
  { key: "edit",            label: "🎬 Editing",          color: "#b45309", bg: "#fefce8", border: "#fef08a" },
  { key: "qc",              label: "✅ QC Review",        color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
  { key: "client_approval", label: "👤 Client Approval",  color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  { key: "posted",          label: "🚀 Posted",           color: "#047857", bg: "#f0fdf4", border: "#86efac" },
];

const GOAL_COLORS = {
  Authority: { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
  Trust:     { bg: "#ecfeff", color: "#0891b2", border: "#a5f3fc" },
  Sales:     { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  Awareness: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  Viral:     { bg: "#fdf2f8", color: "#db2777", border: "#fbcfe8" },
};

const PRIORITY_COLORS = {
  urgent: { bg: "#fee2e2", color: "#991b1b" },
  high:   { bg: "#ffedd5", color: "#c2410c" },
  medium: { bg: "#fef9c3", color: "#854d0e" },
  low:    { bg: "#f1f5f9", color: "#475569" },
};

const EMPTY_TASK = {
  clientId: "",
  title: "",
  goal: "Authority",
  priority: "medium",
  stage: "script",
  concept: "",
  hook: "",
  bodyText: "",
  cta: "",
  writer: "",
  shooter: "",
  shootDate: "",
  shootTime: "",
  location: "",
  editor: "",
  rawFootageLink: "",
  editedPreviewLink: "",
  serviceType: "full",
  videoPrice: "",
};

// ── TASK CARD COMPONENT ──
function PipelineTaskCard({
  task,
  onEdit,
  onDelete,
  onMoveStage,
  onDragStart,
  onDragEnd,
  dragging
}) {
  const navigate = useNavigate();
  const goalStyle = GOAL_COLORS[task.goal] || GOAL_COLORS.Authority;
  const priStyle = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
  const clientName = task.client?.businessName || task.clientId?.businessName || "Client";
  const stageIndex = STAGES.findIndex(s => s.key === task.stage);

  return (
    <Card
      draggable
      onDragStart={() => onDragStart(task)}
      onDragEnd={onDragEnd}
      sx={{
        mb: 1.5,
        cursor: "grab",
        opacity: dragging ? 0.45 : 1,
        borderRadius: 2,
        border: "1.5px solid #e2e8f0",
        bgcolor: "#ffffff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        transition: "all 0.15s ease",
        "&:hover": {
          boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
          borderColor: "#cbd5e1",
          transform: "translateY(-1px)"
        },
      }}
    >
      <CardContent sx={{ p: "12px !important" }}>
        {/* Top: Client & Goal Badge */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8, gap: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              color: "#0f172a",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 140,
              fontSize: 11
            }}
          >
            🏢 {clientName}
          </Typography>

          <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
            <Chip
              label={task.goal || "Authority"}
              size="small"
              sx={{
                fontSize: 9,
                height: 18,
                fontWeight: 800,
                bgcolor: goalStyle.bg,
                color: goalStyle.color,
                border: `1px solid ${goalStyle.border}`
              }}
            />
            {task.priority && task.priority !== "medium" && (
              <Chip
                label={task.priority.toUpperCase()}
                size="small"
                sx={{
                  fontSize: 8,
                  height: 16,
                  fontWeight: 900,
                  bgcolor: priStyle.bg,
                  color: priStyle.color,
                }}
              />
            )}
          </Box>
        </Box>

        {/* Service Scope & Rate Badges */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.8, alignItems: 'center' }}>
          {task.serviceType === 'only_editing' && (
            <Chip
              size="small"
              label={`✂️ Only Editing${task.videoPrice ? ` • ₹${task.videoPrice}` : ''}`}
              sx={{ fontSize: 9, height: 18, fontWeight: 800, bgcolor: '#f3e8ff', color: '#7e22ce', border: '1px solid #d8b4fe' }}
            />
          )}
          {task.serviceType === 'only_shooting' && (
            <Chip
              size="small"
              label={`🎥 Only Shooting${task.videoPrice ? ` • ₹${task.videoPrice}` : ''}`}
              sx={{ fontSize: 9, height: 18, fontWeight: 800, bgcolor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
            />
          )}
          {(!task.serviceType || task.serviceType === 'full') && task.videoPrice > 0 && (
            <Chip
              size="small"
              label={`🎬 Shoot+Edit • ₹${task.videoPrice}`}
              sx={{ fontSize: 9, height: 18, fontWeight: 800, bgcolor: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}
            />
          )}
          {task.billingStatus === 'billed' && (
            <Chip
              size="small"
              label="✓ Billed"
              sx={{ fontSize: 8, height: 16, fontWeight: 800, bgcolor: '#ecfdf5', color: '#047857' }}
            />
          )}
        </Box>

        {/* Title & Reel # */}
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 800,
            color: "#1e293b",
            lineHeight: 1.3,
            mb: 0.5,
            fontSize: 13
          }}
        >
          {task.reelNumber ? `Reel #${task.reelNumber}: ` : ""}{task.title}
        </Typography>

        {/* Hook / Concept snippet */}
        {(task.hook || task.concept || task.description) && (
          <Typography
            variant="caption"
            sx={{
              color: "#64748b",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              fontSize: 11,
              lineHeight: 1.35,
              mb: 1,
              fontStyle: task.hook ? "italic" : "normal"
            }}
          >
            {task.hook ? `🎯 Hook: "${task.hook}"` : (task.concept || task.description)}
          </Typography>
        )}

        {/* Team Assignments */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.4, mb: 1 }}>
          {task.writer && (
            <Typography variant="caption" sx={{ fontSize: 10.5, color: "#475569", fontWeight: 600 }}>
              ✍️ Writer: <strong>{task.writer.name || "Assigned"}</strong>
            </Typography>
          )}

          {task.shooter && (
            <Typography variant="caption" sx={{ fontSize: 10.5, color: "#ea580c", fontWeight: 700 }}>
              🎥 Shooter: <strong>{task.shooter.name || "Assigned"}</strong>
            </Typography>
          )}

          {task.editor && (
            <Typography variant="caption" sx={{ fontSize: 10.5, color: "#b45309", fontWeight: 700 }}>
              🎬 Editor: <strong>{task.editor.name || "Assigned"}</strong>
            </Typography>
          )}

          {task.qcReviewer && (
            <Typography variant="caption" sx={{ fontSize: 10.5, color: "#059669", fontWeight: 700 }}>
              ✅ QC: <strong>{task.qcReviewer.name || "Assigned"}</strong>
            </Typography>
          )}
        </Box>

        {/* Shoot Schedule Date & Time Badge */}
        {task.shootDate && (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              bgcolor: "#fff7ed",
              border: "1px solid #fed7aa",
              color: "#c2410c",
              px: 0.8,
              py: 0.3,
              borderRadius: 1,
              fontSize: 10,
              fontWeight: 800,
              mb: 1,
              width: "fit-content"
            }}
          >
            <AccessTimeIcon sx={{ fontSize: 12 }} />
            <span>{task.shootDate} {task.shootTime ? `• ${task.shootTime}` : ""}</span>
          </Box>
        )}

        {/* Quick Media Links */}
        {(task.rawFootageLink || task.editedPreviewLink || task.driveLink) && (
          <Box sx={{ display: "flex", gap: 0.6, mb: 1, flexWrap: "wrap" }}>
            {(task.rawFootageLink || task.driveLink) && (
              <Button
                size="small"
                variant="outlined"
                component="a"
                href={task.rawFootageLink || task.driveLink}
                target="_blank"
                startIcon={<LinkIcon sx={{ fontSize: 12 }} />}
                sx={{ fontSize: 9.5, py: 0.2, px: 0.8, height: 22, textTransform: "none", borderColor: "#93c5fd", color: "#1d4ed8" }}
              >
                Raw Drive
              </Button>
            )}

            {task.editedPreviewLink && (
              <Button
                size="small"
                variant="outlined"
                color="success"
                component="a"
                href={task.editedPreviewLink}
                target="_blank"
                startIcon={<PlayCircleOutlineIcon sx={{ fontSize: 12 }} />}
                sx={{ fontSize: 9.5, py: 0.2, px: 0.8, height: 22, textTransform: "none", fontWeight: 700 }}
              >
                Video Preview
              </Button>
            )}
          </Box>
        )}

        <Divider sx={{ my: 0.8 }} />

        {/* Card Footer: Quick Stage Arrow Buttons & Actions */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Stage Shift Buttons */}
          <Box sx={{ display: "flex", gap: 0.3 }}>
            <Tooltip title={stageIndex > 0 ? `Move back to ${STAGES[stageIndex - 1]?.label}` : ""}>
              <span>
                <IconButton
                  size="small"
                  disabled={stageIndex <= 0}
                  onClick={() => onMoveStage(task, STAGES[stageIndex - 1].key)}
                  sx={{ p: 0.25, width: 22, height: 22 }}
                >
                  <ArrowBackIosIcon sx={{ fontSize: 10 }} />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title={stageIndex < STAGES.length - 1 ? `Advance to ${STAGES[stageIndex + 1]?.label}` : ""}>
              <span>
                <IconButton
                  size="small"
                  disabled={stageIndex >= STAGES.length - 1}
                  onClick={() => onMoveStage(task, STAGES[stageIndex + 1].key)}
                  sx={{ p: 0.25, width: 22, height: 22 }}
                >
                  <ArrowForwardIosIcon sx={{ fontSize: 10 }} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          {/* Edit, Delete, Open in Hub */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.2 }}>
            <Tooltip title="Open in Production Hub">
              <IconButton
                size="small"
                onClick={() => navigate("/admin/production-hub")}
                sx={{ p: 0.3, color: "#64748b" }}
              >
                <LaunchIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Edit Task">
              <IconButton
                size="small"
                onClick={() => onEdit(task)}
                sx={{ p: 0.3, color: "#475569" }}
              >
                <EditIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete Task">
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(task._id)}
                sx={{ p: 0.3 }}
              >
                <DeleteIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// ── MAIN CONTENT PIPELINE PAGE ──
export default function ContentPipelinePage() {
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  // Filters & Search
  const [selectedClient, setSelectedClient] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Drag and Drop
  const [draggingItem, setDraggingItem] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_TASK);

  // Load all tasks (ProductionTask + legacy content merged)
  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [prodRes, legacyRes, cliRes, usrRes] = await Promise.allSettled([
        getProductionTasks(selectedClient !== "all" ? { clientId: selectedClient } : {}),
        api.get("/content", { params: { type: "reel", limit: 300 } }),
        getClients({ limit: 300, all: "true" }),
        api.get("/auth/users"),
      ]);

      let allTasks = [];
      if (prodRes.status === "fulfilled" && prodRes.value.data?.tasks) {
        allTasks = [...prodRes.value.data.tasks];
      }

      // Merge legacy content if any exist and not already in tasks
      if (legacyRes.status === "fulfilled" && legacyRes.value.data?.content) {
        const legacyItems = legacyRes.value.data.content.map(c => ({
          ...c,
          isLegacy: true,
          client: c.clientId,
          goal: c.reelGoal || "Authority",
          writer: c.assignedTo,
        }));
        // Only add if not duplicates
        legacyItems.forEach(leg => {
          if (!allTasks.some(t => String(t._id) === String(leg._id))) {
            allTasks.push(leg);
          }
        });
      }

      setTasks(allTasks);

      if (cliRes.status === "fulfilled" && cliRes.value.data?.clients) {
        setClients(cliRes.value.data.clients);
      }
      if (usrRes.status === "fulfilled" && usrRes.value.data) {
        setUsers(Array.isArray(usrRes.value.data) ? usrRes.value.data : (usrRes.value.data.users || []));
      }
    } catch (err) {
      console.error("Pipeline load error:", err);
      setError("Failed to load pipeline data: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [selectedClient]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter tasks by client and search query
  const filteredTasks = tasks.filter(task => {
    if (selectedClient !== "all") {
      const cId = task.client?._id || task.client || task.clientId?._id || task.clientId;
      if (String(cId) !== String(selectedClient)) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = (task.title || "").toLowerCase();
      const client = (task.client?.businessName || task.clientId?.businessName || "").toLowerCase();
      const shooter = (task.shooter?.name || "").toLowerCase();
      const editor = (task.editor?.name || "").toLowerCase();
      const writer = (task.writer?.name || "").toLowerCase();
      if (!title.includes(q) && !client.includes(q) && !shooter.includes(q) && !editor.includes(q) && !writer.includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Kanban Columns
  const columns = STAGES.map(stage => ({
    ...stage,
    items: filteredTasks.filter(item => {
      // Map "completed" to posted column
      if (stage.key === "posted") {
        return item.stage === "posted" || item.stage === "completed";
      }
      return item.stage === stage.key;
    })
  }));

  // Drag and Drop Handlers
  const handleDragStart = (item) => setDraggingItem(item);
  const handleDragEnd = () => { setDraggingItem(null); setDragOverStage(null); };

  const handleDrop = async (stageKey) => {
    if (!draggingItem || draggingItem.stage === stageKey) {
      setDraggingItem(null);
      setDragOverStage(null);
      return;
    }
    await applyStageChange(draggingItem, stageKey);
    setDraggingItem(null);
    setDragOverStage(null);
  };

  const applyStageChange = async (taskItem, newStage) => {
    try {
      if (taskItem.isLegacy) {
        await api.put(`/content/${taskItem._id}`, { stage: newStage });
      } else {
        await updateProductionTask(taskItem._id, { stage: newStage });
      }
      setTasks(prev => prev.map(t => t._id === taskItem._id ? { ...t, stage: newStage } : t));
      const targetLabel = STAGES.find(s => s.key === newStage)?.label || newStage;
      setToast(`Moved "${taskItem.title}" to ${targetLabel} 🚀`);
    } catch (err) {
      console.error("Stage update error:", err);
      setError("Failed to update stage: " + (err.response?.data?.message || err.message));
    }
  };

    const handleCloseDialog = () => {
    setForm(EMPTY_TASK);
    setEditTarget(null);
    setDialogOpen(false);
  };

  const handleOpenAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_TASK);
    setDialogOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditTarget(item);
    setForm({
      clientId: item.client?._id || item.client || item.clientId?._id || item.clientId || "",
      title: item.title || "",
      goal: item.goal || "Authority",
      priority: item.priority || "medium",
      stage: item.stage || "script",
      concept: item.concept || item.description || "",
      hook: item.hook || "",
      bodyText: item.bodyText || "",
      cta: item.cta || "",
      writer: item.writer?._id || item.writer || "",
      shooter: item.shooter?._id || item.shooter || "",
      shootDate: item.shootDate ? item.shootDate.slice(0, 10) : "",
      shootTime: item.shootTime || "",
      location: item.location || "",
      editor: item.editor?._id || item.editor || "",
      rawFootageLink: item.rawFootageLink || item.driveLink || "",
      editedPreviewLink: item.editedPreviewLink || "",
      serviceType: item.serviceType || "full",
      videoPrice: item.videoPrice || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.clientId) {
      setToast("Please select a Client and enter a Reel Title.");
      return;
    }

    try {
      if (editTarget) {
        if (editTarget.isLegacy) {
          const res = await api.put(`/content/${editTarget._id}`, {
            title: form.title,
            clientId: form.clientId,
            stage: form.stage,
            reelGoal: form.goal,
            priority: form.priority,
            description: form.concept,
            driveLink: form.rawFootageLink,
          });
          setTasks(prev => prev.map(t => t._id === editTarget._id ? { ...t, ...res.data } : t));
        } else {
          const res = await updateProductionTask(editTarget._id, {
            client: form.clientId,
            title: form.title,
            goal: form.goal,
            priority: form.priority,
            stage: form.stage,
            concept: form.concept,
            hook: form.hook,
            bodyText: form.bodyText,
            cta: form.cta,
            writer: form.writer || null,
            shooter: form.shooter || null,
            shootDate: form.shootDate,
            shootTime: form.shootTime,
            location: form.location,
            editor: form.editor || null,
          serviceType: form.serviceType || "full",
          videoPrice: Number(form.videoPrice) || 0,
            rawFootageLink: form.rawFootageLink,
            editedPreviewLink: form.editedPreviewLink,
            serviceType: form.serviceType || "full",
            videoPrice: Number(form.videoPrice) || 0,
          });
          const updated = res.data?.task;
          if (updated) {
            setTasks(prev => prev.map(t => t._id === editTarget._id ? updated : t));
          }
        }
        setToast("Task updated successfully! ✨");
      } else {
        // Create new Production Task
        const res = await createProductionTask({
          client: form.clientId,
          title: form.title,
          goal: form.goal,
          priority: form.priority,
          stage: form.stage,
          concept: form.concept,
          hook: form.hook,
          bodyText: form.bodyText,
          cta: form.cta,
          writer: form.writer || null,
          shooter: form.shooter || null,
          shootDate: form.shootDate,
          shootTime: form.shootTime,
          location: form.location,
          editor: form.editor || null,
        });

        const created = res.data?.task;
        if (created) {
          setTasks(prev => [created, ...prev]);
        }
        setToast(`Reel Task created successfully in ${STAGES.find(s => s.key === form.stage)?.label || "Pipeline"}! 🚀`);
      }
      handleCloseDialog();
    } catch (err) {
      console.error("Save task error:", err);
      setError(err.response?.data?.message || "Failed to save task.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Reel Task?")) return;
    try {
      const target = tasks.find(t => t._id === id);
      if (target?.isLegacy) {
        await api.delete(`/content/${id}`);
      } else {
        await deleteProductionTask(id);
      }
      setTasks(prev => prev.filter(t => t._id !== id));
      setToast("Task deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed.");
    }
  };

  const handleFormField = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
  };

    // Separate Direct Clients and Agency Partners
  const directClients = clients.filter(c =>
    c.clientType !== 'agency' &&
    !c.isQuickClient &&
    !c.businessName?.toLowerCase().includes('agency') &&
    !c.businessName?.toLowerCase().includes('vardhate') &&
    !c.businessName?.toLowerCase().includes('patel media') &&
    !c.businessName?.toLowerCase().includes('chhutak')
  );

  const agencyClients = clients.filter(c =>
    c.clientType === 'agency' ||
    c.isQuickClient ||
    c.businessName?.toLowerCase().includes('agency') ||
    c.businessName?.toLowerCase().includes('vardhate') ||
    c.businessName?.toLowerCase().includes('patel media') ||
    c.businessName?.toLowerCase().includes('chhutak')
  );

  // Quick Writers, Shooters, Editors from loaded users
  const writers = users.filter(u => u.role === "writer" || u.role === "admin" || u.role === "manager");
  const shooters = users.filter(u => u.role === "shooter" || u.role === "admin" || u.role === "manager");
  const editors = users.filter(u => u.role === "editor" || u.role === "admin" || u.role === "manager");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            🚀 Content Pipeline
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Drag and drop reels between stages to coordinate scriptwriting, shooting, editing, and publishing.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="medium"
          onClick={handleOpenAdd}
          sx={{
            fontWeight: 800,
            textTransform: "none",
            bgcolor: "#1a56db",
            borderRadius: 2,
            px: 2.5,
            boxShadow: "0 2px 6px rgba(26, 86, 219, 0.25)"
          }}
        >
          New Reel Task
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      {/* Filter & Search Bar */}
      <Card sx={{ p: 1.5, mb: 2.5, borderRadius: 2.5, border: "1px solid #e2e8f0" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          {/* Client Filter */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 260 }}>
            <FilterIcon sx={{ color: "text.secondary", fontSize: 20 }} />
            <FormControl size="small" fullWidth>
              <InputLabel>Filter by Client</InputLabel>
              <Select
                value={selectedClient}
                label="Filter by Client"
                onChange={e => setSelectedClient(e.target.value)}
              >
                <MenuItem value="all">All Clients ({clients.length})</MenuItem>
                {clients.map(c => (
                  <MenuItem key={c._id} value={c._id}>{c.businessName}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Quick Search */}
          <TextField
            size="small"
            placeholder="Search reel title, client, shooter, editor..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 280, flex: 1 }}
          />

          {/* Total Tasks Counter */}
          <Chip
            label={`🎯 ${filteredTasks.length} Total Reel${filteredTasks.length === 1 ? "" : "s"}`}
            size="small"
            sx={{ fontWeight: 800, bgcolor: "#f1f5f9", color: "#334155" }}
          />
        </Box>
      </Card>

      {/* Kanban Board */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 12 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ width: "100%", overflowX: "auto", pb: 2, flex: 1, minHeight: 480 }}>
          <Box sx={{ display: "flex", gap: 2, pb: 2, alignItems: "flex-start", width: "max-content", minWidth: "100%" }}>
            {columns.map(col => (
              <Box
                key={col.key}
                onDragOver={e => { e.preventDefault(); setDragOverStage(col.key); }}
                onDrop={() => handleDrop(col.key)}
                sx={{
                  minWidth: 275,
                  width: 275,
                  flex: "0 0 275px",
                  bgcolor: dragOverStage === col.key ? col.bg : "#f8fafc",
                  borderRadius: 3,
                  border: dragOverStage === col.key ? `2.5px dashed ${col.color}` : "1.5px solid #e2e8f0",
                  p: 1.5,
                  transition: "all 0.15s ease",
                  maxHeight: "calc(100vh - 220px)",
                  overflowY: "auto",
                  "&::-webkit-scrollbar": { width: 4 },
                  "&::-webkit-scrollbar-thumb": { background: "#cbd5e1", borderRadius: 2 }
                }}
              >
                {/* Column Header */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5, pb: 1, borderBottom: "1px solid #e2e8f0" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: col.color, fontSize: 13 }}>
                    {col.label}
                  </Typography>
                  <Chip
                    label={col.items.length}
                    size="small"
                    sx={{
                      fontWeight: 900,
                      fontSize: 11,
                      height: 20,
                      bgcolor: col.bg,
                      color: col.color,
                      border: `1px solid ${col.border}`
                    }}
                  />
                </Box>

                {/* Cards List */}
                {col.items.length === 0 ? (
                  <Box
                    sx={{
                      p: 3,
                      textAlign: "center",
                      color: "#94a3b8",
                      border: "1.5px dashed #e2e8f0",
                      borderRadius: 2,
                      bgcolor: "#ffffff"
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600, display: "block" }}>
                      No reels in this stage
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: 10, color: "#cbd5e1" }}>
                      Drop reels here
                    </Typography>
                  </Box>
                ) : (
                  col.items.map(item => (
                    <PipelineTaskCard
                      key={item._id}
                      task={item}
                      onEdit={handleOpenEdit}
                      onDelete={handleDelete}
                      onMoveStage={applyStageChange}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      dragging={draggingItem?._id === item._id}
                    />
                  ))
                )}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* ── CREATE / EDIT TASK DIALOG ── */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          {editTarget ? "✏️ Edit Reel Task" : "🚀 Create New Reel Task"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Client Selection */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Client</InputLabel>
                <Select
                  value={form.clientId}
                  label="Client"
                  onChange={e => {
                    const selectedId = e.target.value;
                    const found = clients.find(c => c._id === selectedId);
                    const isAg = found?.clientType === 'agency' || found?.isQuickClient || found?.businessName?.toLowerCase().includes('agency');
                    setForm(prev => ({
                      ...prev,
                      clientId: selectedId,
                      videoPrice: (isAg && found?.agencyRates?.defaultShootRate) ? found.agencyRates.defaultShootRate : prev.videoPrice
                    }));
                  }}
                >
                  <ListSubheader sx={{ fontWeight: 900, color: '#1e293b', bgcolor: '#f8fafc', fontSize: 11 }}>
                    🏢 DIRECT BRAND CLIENTS (બધા ક્લાયન્ટ્સ)
                  </ListSubheader>
                  {directClients.map(c => (
                    <MenuItem key={c._id} value={c._id}>
                      🏢 {c.businessName}
                    </MenuItem>
                  ))}

                  <Divider sx={{ my: 1 }} />
                  <ListSubheader sx={{ fontWeight: 900, color: '#c2410c', bgcolor: '#fff7ed', fontSize: 11 }}>
                    ──────── 🤝 AGENCY PARTNERS (એજન્સી વર્ક - Vardhate, etc.) ────────
                  </ListSubheader>
                  {agencyClients.map(c => (
                    <MenuItem key={c._id} value={c._id} sx={{ fontWeight: 800, color: '#9a3412' }}>
                      🤝 {c.businessName} (Agency Work)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Reel Title */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Reel Title / Concept Name"
                placeholder="e.g. 3 Tax Hacks Every Business Owner Ignores"
                value={form.title}
                onChange={e => handleFormField("title", e.target.value)}
                required
              />
            </Grid>

            {/* Service Scope Selection (Only Editing / Only Shooting / Full) */}
            <Grid item xs={12} sm={8}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569' }}>
                  Service Scope / કામનો પ્રકાર:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant={form.serviceType === 'only_editing' ? 'contained' : 'outlined'}
                    onClick={() => {
                      setForm(prev => ({ ...prev, serviceType: 'only_editing', stage: 'edit' }));
                    }}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 800,
                      borderRadius: 2,
                      fontSize: 11,
                      bgcolor: form.serviceType === 'only_editing' ? '#7e22ce' : 'transparent',
                      color: form.serviceType === 'only_editing' ? '#fff' : '#7e22ce',
                      borderColor: '#c084fc',
                      '&:hover': { bgcolor: form.serviceType === 'only_editing' ? '#6b21a8' : '#f3e8ff' }
                    }}
                  >
                    ✂️ Only Editing
                  </Button>

                  <Button
                    size="small"
                    variant={form.serviceType === 'only_shooting' ? 'contained' : 'outlined'}
                    onClick={() => {
                      setForm(prev => ({ ...prev, serviceType: 'only_shooting', stage: 'shoot' }));
                    }}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 800,
                      borderRadius: 2,
                      fontSize: 11,
                      bgcolor: form.serviceType === 'only_shooting' ? '#1d4ed8' : 'transparent',
                      color: form.serviceType === 'only_shooting' ? '#fff' : '#1d4ed8',
                      borderColor: '#93c5fd',
                      '&:hover': { bgcolor: form.serviceType === 'only_shooting' ? '#1e40af' : '#eff6ff' }
                    }}
                  >
                    🎥 Only Shooting
                  </Button>

                  <Button
                    size="small"
                    variant={form.serviceType === 'full' || !form.serviceType ? 'contained' : 'outlined'}
                    onClick={() => {
                      setForm(prev => ({ ...prev, serviceType: 'full', stage: prev.stage === 'edit' || prev.stage === 'shoot' ? 'script' : prev.stage }));
                    }}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 800,
                      borderRadius: 2,
                      fontSize: 11,
                      bgcolor: (form.serviceType === 'full' || !form.serviceType) ? '#ea580c' : 'transparent',
                      color: (form.serviceType === 'full' || !form.serviceType) ? '#fff' : '#ea580c',
                      borderColor: '#fdba74',
                      '&:hover': { bgcolor: (form.serviceType === 'full' || !form.serviceType) ? '#c2410c' : '#fff7ed' }
                    }}
                  >
                    🎬 Shooting + Editing
                  </Button>
                </Box>
              </Box>
            </Grid>

            {/* Video Price / Rate */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Video Rate / Price (₹)"
                placeholder="e.g. 600"
                value={form.videoPrice}
                onChange={e => handleFormField('videoPrice', e.target.value)}
                helperText="Custom price for this reel (Agency Billing)"
              />
            </Grid>

            {/* Stage */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Pipeline Stage</InputLabel>
                <Select
                  value={form.stage}
                  label="Pipeline Stage"
                  onChange={e => handleFormField("stage", e.target.value)}
                >
                  {STAGES.map(s => (
                    <MenuItem key={s.key} value={s.key}>{s.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Reel Goal */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Reel Goal</InputLabel>
                <Select
                  value={form.goal}
                  label="Reel Goal"
                  onChange={e => handleFormField("goal", e.target.value)}
                >
                  <MenuItem value="Authority">Authority</MenuItem>
                  <MenuItem value="Trust">Trust</MenuItem>
                  <MenuItem value="Sales">Sales</MenuItem>
                  <MenuItem value="Awareness">Awareness</MenuItem>
                  <MenuItem value="Viral">Viral</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Priority */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={form.priority}
                  label="Priority"
                  onChange={e => handleFormField("priority", e.target.value)}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Script Details */}
            <Grid item xs={12}>
              <Divider sx={{ my: 0.5 }}>
                <Chip label="✍️ Script / Concept Details" size="small" sx={{ fontSize: 11, fontWeight: 700 }} />
              </Divider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Assigned Script Writer</InputLabel>
                <Select
                  value={form.writer}
                  label="Assigned Script Writer"
                  onChange={e => handleFormField("writer", e.target.value)}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {writers.map(u => (
                    <MenuItem key={u._id} value={u._id}>{u.name} ({u.role})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Hook (First 3-5 seconds)"
                placeholder="Attention grabbing opening hook..."
                value={form.hook}
                onChange={e => handleFormField("hook", e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Concept / Body Script Notes"
                multiline
                rows={3}
                placeholder="Bullet points, script breakdown, key talking points..."
                value={form.concept}
                onChange={e => handleFormField("concept", e.target.value)}
              />
            </Grid>

            {/* Shoot Details (Hidden if Only Editing) */}
            {form.serviceType !== 'only_editing' && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 0.5 }}>
                    <Chip label="🎥 Shoot Assignment & Scheduling" size="small" sx={{ fontSize: 11, fontWeight: 700 }} />
                  </Divider>
                </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Assigned Shooter</InputLabel>
                <Select
                  value={form.shooter}
                  label="Assigned Shooter"
                  onChange={e => handleFormField("shooter", e.target.value)}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {shooters.map(u => (
                    <MenuItem key={u._id} value={u._id}>{u.name} ({u.role})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Shoot Date"
                InputLabelProps={{ shrink: true }}
                value={form.shootDate}
                onChange={e => handleFormField("shootDate", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Shoot Time"
                placeholder="e.g. 03:00 PM"
                value={form.shootTime}
                onChange={e => handleFormField("shootTime", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Shoot Location"
                placeholder="e.g. Surat HQ Studio / Client Office"
                value={form.location}
                onChange={e => handleFormField("location", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Raw Footage Drive Link"
                placeholder="https://drive.google.com/..."
                value={form.rawFootageLink}
                onChange={e => handleFormField("rawFootageLink", e.target.value)}
              />
            </Grid>

            </>
            )}

            {/* Edit Details (Hidden if Only Shooting) */}
            {form.serviceType !== 'only_shooting' && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 0.5 }}>
                    <Chip label="🎬 Video Editing Assignment" size="small" sx={{ fontSize: 11, fontWeight: 700 }} />
                  </Divider>
                </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Assigned Video Editor</InputLabel>
                <Select
                  value={form.editor}
                  label="Assigned Video Editor"
                  onChange={e => handleFormField("editor", e.target.value)}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {editors.map(u => (
                    <MenuItem key={u._id} value={u._id}>{u.name} ({u.role})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Edited Video Preview Link (Drive / Dropbox)"
                placeholder="https://drive.google.com/..."
                value={form.editedPreviewLink}
                onChange={e => handleFormField("editedPreviewLink", e.target.value)}
              />
            </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{ fontWeight: 800, px: 3, bgcolor: "#1a56db" }}
          >
            Save Task
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3000}
        onClose={() => setToast("")}
        message={toast}
      />
    </Box>
  );
}
