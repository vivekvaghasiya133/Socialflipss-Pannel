import { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Card, CardContent, Chip, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, Alert, Snackbar,
  CircularProgress, Tooltip, Avatar, Grid, Divider, Paper
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import CheckIcon from "@mui/icons-material/CheckCircle";
import FilterIcon from "@mui/icons-material/FilterList";
import api from "../api";
import { getClients } from "../api/clientsApi";

const STAGES = [
  { key:"idea",            label:"💡 Idea",            color:"#6b7280", bg:"#f3f4f6" },
  { key:"script",          label:"✍️ Script",          color:"#0891b2", bg:"#e0f2fe" },
  { key:"shoot",           label:"🎥 Shoot",           color:"#7c3aed", bg:"#ede9fe" },
  { key:"edit",            label:"🎬 Edit",            color:"#d97706", bg:"#fef3c7" },
  { key:"qc",              label:"✅ QC",              color:"#0e9f6e", bg:"#dcfce7" },
  { key:"client_approval", label:"👤 Client Approval", color:"#3f83f8", bg:"#e1effe" },
  { key:"posted",          label:"🚀 Posted",          color:"#059669", bg:"#d1fae5" },
];

const GOAL_COLORS = {
  Authority: "#7c3aed",
  Trust: "#0891b2",
  Sales: "#e02424",
  Awareness: "#d97706"
};

const PRIORITY_COLORS = { high:"error", medium:"warning", low:"default" };

const EMPTY_CONTENT = {
  title:"", type:"reel", description:"", platform:"instagram",
  assignedTo:"", shootDate:"", postDate:"", driveLink:"",
  instagramLink:"", priority:"medium", stage:"idea",
  reelGoal: "Authority", clientId: ""
};

function ContentCard({ item, onEdit, onDelete, onDragStart, onDragEnd, dragging }) {
  return (
    <Card
      draggable
      onDragStart={() => onDragStart(item)}
      onDragEnd={onDragEnd}
      sx={{
        mb: 1.5,
        cursor: "grab",
        opacity: dragging ? 0.5 : 1,
        border: "1px solid #e5e7eb",
        "&:hover": { boxShadow: 3 },
        transition: "box-shadow 0.15s",
      }}
    >
      <CardContent sx={{ p: "12px !important" }}>
        {/* Client & Goal */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, flexWrap: "wrap", gap: 0.5 }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary">
            🏢 {item.clientId?.businessName || "Unknown Client"}
          </Typography>
          <Chip 
            label={item.reelGoal || "Authority"} 
            size="small" 
            sx={{ 
              fontSize: 9, 
              height: 16, 
              bgcolor: (GOAL_COLORS[item.reelGoal] || "#7c3aed") + "18", 
              color: GOAL_COLORS[item.reelGoal] || "#7c3aed", 
              fontWeight: 700 
            }} 
          />
        </Box>

        {/* Title */}
        <Typography variant="body2" fontWeight={600} mb={0.5} sx={{ lineHeight: 1.4 }}>
          {item.title}
        </Typography>

        {/* Description/Script */}
        {item.description && (
          <Typography 
            variant="caption" 
            color="text.secondary" 
            display="block" 
            mb={1}
            sx={{ 
              overflow: "hidden", 
              textOverflow: "ellipsis", 
              display: "-webkit-box", 
              WebkitLineClamp: 2, 
              WebkitBoxOrient: "vertical" 
            }}
          >
            {item.description}
          </Typography>
        )}

        {/* Client Approval status badge */}
        {(item.clientApproved || item.clientApprovalStatus === "rejected" || item.clientApprovalStatus === "changes_requested") && (
          <Box sx={{ mb: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
            {item.clientApproved && (
              <Chip label="✓ Approved by Client" size="small"
                sx={{ fontSize: 9, height: 16, bgcolor: "#d1fae5", color: "#03543f", fontWeight: 700, width: "fit-content" }} />
            )}
            {item.clientApprovalStatus === "rejected" && (
              <Chip label="✕ Rejected by Client" size="small"
                sx={{ fontSize: 9, height: 16, bgcolor: "#fde8e8", color: "#9b1c1c", fontWeight: 700, width: "fit-content" }} />
            )}
            {item.clientApprovalStatus === "changes_requested" && (
              <Chip label="⚠ Changes Requested" size="small"
                sx={{ fontSize: 9, height: 16, bgcolor: "#fef3c7", color: "#92400e", fontWeight: 700, width: "fit-content" }} />
            )}
            {item.approvalNote && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontStyle: "italic", fontSize: 9, pl: 0.5 }}>
                Note: "{item.approvalNote}"
              </Typography>
            )}
          </Box>
        )}

        {/* Dates */}
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 1 }}>
          {item.shootDate && (
            <Chip 
              label={`📷 ${new Date(item.shootDate).toLocaleDateString("en-IN")}`}
              size="small" 
              variant="outlined" 
              sx={{ fontSize: 9, height: 16 }} 
            />
          )}
          {item.postDate && (
            <Chip 
              label={`📅 Due: ${new Date(item.postDate).toLocaleDateString("en-IN")}`}
              size="small" 
              variant="outlined" 
              sx={{ fontSize: 9, height: 16 }} 
            />
          )}
        </Box>

        {/* Links */}
        {(item.driveLink || item.instagramLink) && (
          <Box sx={{ display: "flex", gap: 0.5, mb: 0.5 }}>
            {item.driveLink && (
              <Tooltip title="Drive / Raw Video Link">
                <IconButton size="small" component="a" href={item.driveLink} target="_blank" sx={{ p: 0.25 }}>
                  <LinkIcon sx={{ fontSize: 13, color: "#1a56db" }} />
                </IconButton>
              </Tooltip>
            )}
            {item.instagramLink && (
              <Tooltip title="Instagram Link">
                <IconButton size="small" component="a" href={item.instagramLink} target="_blank" sx={{ p: 0.25 }}>
                  <CheckIcon sx={{ fontSize: 13, color: "#059669" }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}

        {/* Footer */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
          {item.assignedTo ? (
            <Tooltip title={item.assignedTo.name || "Owner"}>
              <Avatar sx={{ width: 20, height: 20, fontSize: 9, bgcolor: "primary.main", fontWeight: 700 }}>
                {item.assignedTo.name?.[0]?.toUpperCase()}
              </Avatar>
            </Tooltip>
          ) : (
            <Typography variant="caption" color="text.disabled">Unassigned</Typography>
          )}

          <Box sx={{ display: "flex" }}>
            <IconButton size="small" onClick={() => onEdit(item)} sx={{ p: 0.25 }}>
              <EditIcon sx={{ fontSize: 13 }} />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => onDelete(item._id)} sx={{ p: 0.25 }}>
              <DeleteIcon sx={{ fontSize: 13 }} />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function ContentPipelinePage() {
  const [content, setContent] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  // Filters
  const [selectedClient, setSelectedClient] = useState("all");

  // Drag and Drop
  const [draggingItem, setDraggingItem] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_CONTENT);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [contRes, cliRes, usrRes] = await Promise.all([
        api.get("/content", { params: { type: "reel", limit: 300 } }),
        getClients({ limit: 100 }),
        api.get("/auth/users").catch(() => ({ data: [] }))
      ]);
      setContent(contRes.data.content || []);
      setClients(cliRes.data.clients || []);
      setUsers(usrRes.data || []);
    } catch (err) {
      console.error("Pipeline load error:", err);
      setError("Failed to load pipeline data: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter content
  const filteredContent = content.filter(item => {
    if (selectedClient !== "all" && item.clientId?._id !== selectedClient) return false;
    return true;
  });

  // Kanban Columns
  const columns = STAGES.map(stage => ({
    ...stage,
    items: filteredContent.filter(item => item.stage === stage.key)
  }));

  // Drag and Drop Handlers
  const handleDragStart = (item) => setDraggingItem(item);
  const handleDragEnd = () => { setDraggingItem(null); setDragOverStage(null); };

  const handleDrop = async (stageKey) => {
    if (!draggingItem || draggingItem.stage === stageKey) return;
    try {
      const res = await api.put(`/content/${draggingItem._id}`, { stage: stageKey });
      setContent(prev => prev.map(c => c._id === draggingItem._id ? res.data : c));
      setToast(`Moved to ${STAGES.find(s => s.key === stageKey)?.label}`);
    } catch {
      setError("Failed to update status stage.");
    }
    setDraggingItem(null);
    setDragOverStage(null);
  };

  const handleOpenAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_CONTENT);
    setDialogOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditTarget(item);
    setForm({
      title: item.title || "",
      type: "reel",
      description: item.description || "",
      platform: item.platform || "instagram",
      assignedTo: item.assignedTo?._id || item.assignedTo || "",
      shootDate: item.shootDate ? item.shootDate.slice(0, 10) : "",
      postDate: item.postDate ? item.postDate.slice(0, 10) : "",
      driveLink: item.driveLink || "",
      instagramLink: item.instagramLink || "",
      priority: item.priority || "medium",
      stage: item.stage || "idea",
      reelGoal: item.reelGoal || "Authority",
      clientId: item.clientId?._id || item.clientId || ""
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.clientId) {
      setToast("Title and Client are required.");
      return;
    }
    try {
      if (editTarget) {
        const res = await api.put(`/content/${editTarget._id}`, form);
        setContent(prev => prev.map(c => c._id === editTarget._id ? res.data : c));
        setToast("Task updated successfully!");
      } else {
        const res = await api.post("/content", form);
        setContent(prev => [res.data, ...prev]);
        setToast("Reel task created in Idea!");
      }
      setDialogOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save task.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/content/${id}`);
      setContent(prev => prev.filter(c => c._id !== id));
      setToast("Task deleted.");
    } catch {
      setError("Delete failed.");
    }
  };

  const handleFormField = (key, val) => {
    setForm({ ...form, [key]: val });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", pb: 2 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            🚀 Content Pipeline
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Drag and drop reels between stages to coordinate scriptwriting, shooting, editing, and publishing.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          size="small"
          onClick={handleOpenAdd}
        >
          New Reel Task
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      {/* Filter and Overview */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <FilterIcon sx={{ color: "text.secondary" }} />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Client</InputLabel>
            <Select
              value={selectedClient}
              label="Filter by Client"
              onChange={e => setSelectedClient(e.target.value)}
            >
              <MenuItem value="all">All Clients</MenuItem>
              {clients.map(c => (
                <MenuItem key={c._id} value={c._id}>{c.businessName}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Card>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 6 }}><CircularProgress /></Box>
      ) : (
        /* Kanban Board Grid */
        <Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 2, flex: 1, minHeight: 450, alignItems: "flex-start" }}>
          {columns.map(col => (
            <Box
              key={col.key}
              onDragOver={e => { e.preventDefault(); setDragOverStage(col.key); }}
              onDrop={() => handleDrop(col.key)}
              sx={{
                minWidth: 260,
                flex: "0 0 260px",
                background: dragOverStage === col.key ? col.bg : "#f9fafb",
                borderRadius: 2,
                border: dragOverStage === col.key ? `2px dashed ${col.color}` : "2px solid #e5e7eb",
                p: 1.5,
                transition: "all 0.15s",
                maxHeight: "calc(100vh - 220px)",
                overflowY: "auto",
                "&::-webkit-scrollbar": { width: 4 },
                "&::-webkit-scrollbar-thumb": { background: "#e5e7eb", borderRadius: 2 }
              }}
            >
              {/* Header */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, position: "sticky", top: 0, bgcolor: dragOverStage === col.key ? col.bg : "#f9fafb", zIndex: 1, pb: 1 }}>
                <Typography variant="body2" fontWeight={700} sx={{ color: col.color }}>
                  {col.label}
                </Typography>
                <Chip 
                  label={col.items.length} 
                  size="small" 
                  sx={{ fontSize: 10, height: 18, bgcolor: col.color + "22", color: col.color, fontWeight: 700 }} 
                />
              </Box>

              {/* Cards list */}
              {col.items.map(item => (
                <ContentCard
                  key={item._id}
                  item={item}
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                  dragging={draggingItem?._id === item._id}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              ))}

              {col.items.length === 0 && (
                <Box sx={{ py: 4, textAlign: "center", color: "text.disabled", fontSize: 12, border: "1px dashed #e5e7eb", borderRadius: 2 }}>
                  Empty
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}

      {/* Edit Task Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editTarget ? "Edit Reel Task" : "Add New Task"}
        </DialogTitle>
        <DialogContent dividers sx={{ mt: 0.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Reel Name / Title *"
                value={form.title}
                onChange={e => handleFormField("title", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Client</InputLabel>
                <Select
                  value={form.clientId}
                  label="Client"
                  onChange={e => handleFormField("clientId", e.target.value)}
                >
                  {clients.map(c => (
                    <MenuItem key={c._id} value={c._id}>{c.businessName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Reel Goal</InputLabel>
                <Select
                  value={form.reelGoal}
                  label="Reel Goal"
                  onChange={e => handleFormField("reelGoal", e.target.value)}
                >
                  {["Authority", "Trust", "Sales", "Awareness"].map(g => (
                    <MenuItem key={g} value={g}>{g}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Assigned Owner</InputLabel>
                <Select
                  value={form.assignedTo}
                  label="Assigned Owner"
                  onChange={e => handleFormField("assignedTo", e.target.value)}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {users.map(u => (
                    <MenuItem key={u._id} value={u._id}>{u.name} ({u.role})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={form.priority}
                  label="Priority"
                  onChange={e => handleFormField("priority", e.target.value)}
                >
                  {["high", "medium", "low"].map(p => (
                    <MenuItem key={p} value={p}>{p.toUpperCase()}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {editTarget && (
              <Grid item xs={12} sm={6}>
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
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Due Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.postDate}
                onChange={e => handleFormField("postDate", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Shoot Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.shootDate}
                onChange={e => handleFormField("shootDate", e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Script Outline / Concept Outline"
                multiline
                rows={3}
                value={form.description}
                onChange={e => handleFormField("description", e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Google Drive Link"
                value={form.driveLink}
                onChange={e => handleFormField("driveLink", e.target.value)}
              />
            </Grid>
            {editTarget && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Instagram Live Link"
                  value={form.instagramLink}
                  onChange={e => handleFormField("instagramLink", e.target.value)}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save Task</Button>
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
