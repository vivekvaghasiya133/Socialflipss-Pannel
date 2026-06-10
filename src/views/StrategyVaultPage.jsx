import { useEffect, useState } from "react";
import {
  Box, Typography, Card, Grid, Table, TableBody, TableCell,
  TableHead, TableRow, TableContainer, IconButton, Button,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert, Select, MenuItem, FormControl,
  InputLabel, Tooltip, Chip, Paper, Divider
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import { getStrategies, createStrategy, updateStrategy, deleteStrategy } from "../api/strategyApi";
import { getClients } from "../api/clientsApi";
import { useAuth } from "../context/AuthContext";

const STATUS_COLORS = {
  Draft: "default",
  Review: "warning",
  Approved: "success"
};

export default function StrategyVaultPage() {
  const { user } = useAuth();
  const [strategies, setStrategies] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  // Form State
  const [form, setForm] = useState({
    clientId: "",
    month: "",
    status: "Draft",
    businessGoal: "",
    targetAudience: "",
    contentPillars: "",
    competitors: "",
    monthlyPlan: "",
    reelTopics: [],
    notes: ""
  });

  const getReelsCountForClient = (clientId) => {
    const client = clients.find(c => c._id === clientId);
    let reelCount = 15; // default fallback if no reel deliverable
    if (client && client.package && client.package.deliverables) {
      const reelDel = client.package.deliverables.find(d =>
        d.type && d.type.toLowerCase().includes("reel")
      );
      if (reelDel && reelDel.quantity > 0) {
        reelCount = reelDel.quantity;
      }
    }
    return reelCount;
  };

  const handleClientChange = (selectedClientId) => {
    const targetReelCount = getReelsCountForClient(selectedClientId);
    setForm(prev => ({
      ...prev,
      clientId: selectedClientId,
      reelTopics: Array(targetReelCount).fill("")
    }));
  };

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [strRes, cliRes] = await Promise.all([
        getStrategies(),
        getClients({ limit: 100 })
      ]);
      setStrategies(strRes.data || []);
      setClients(cliRes.data.clients || []);
    } catch (err) {
      setError("Failed to load strategy vault data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditTarget(null);
    setForm({
      clientId: "",
      month: new Date().toISOString().slice(0, 7), // "YYYY-MM"
      status: "Draft",
      businessGoal: "",
      targetAudience: "",
      contentPillars: "",
      competitors: "",
      monthlyPlan: "",
      reelTopics: [],
      notes: ""
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (strat) => {
    setEditTarget(strat);
    const targetCid = strat.clientId?._id || strat.clientId || "";
    const targetReelCount = getReelsCountForClient(targetCid);
    const savedTopics = strat.reelTopics || [];
    let finalTopics = [...savedTopics];
    if (finalTopics.length < targetReelCount) {
      finalTopics = [...finalTopics, ...Array(targetReelCount - finalTopics.length).fill("")];
    } else if (finalTopics.length > targetReelCount) {
      finalTopics = finalTopics.slice(0, targetReelCount);
    }

    setForm({
      clientId: targetCid,
      month: strat.month,
      status: strat.status || "Draft",
      businessGoal: strat.businessGoal || "",
      targetAudience: strat.targetAudience || "",
      contentPillars: strat.contentPillars || "",
      competitors: strat.competitors || "",
      monthlyPlan: strat.monthlyPlan || "",
      reelTopics: finalTopics,
      notes: strat.notes || ""
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.clientId || !form.month) {
      setError("Client and Month are required.");
      return;
    }
    setError("");
    try {
      if (editTarget) {
        await updateStrategy(editTarget._id, form);
      } else {
        await createStrategy(form);
      }
      setDialogOpen(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save strategy.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this strategy?")) return;
    try {
      await deleteStrategy(id);
      loadData();
    } catch (err) {
      setError("Failed to delete strategy.");
    }
  };

  const handleTopicChange = (idx, value) => {
    const updatedTopics = [...form.reelTopics];
    updatedTopics[idx] = value;
    setForm({ ...form, reelTopics: updatedTopics });
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            🎯 Strategy Vault
          </Typography>
          <Typography variant="body2" color="text.secondary">
            "No Strategy = No Content". Lock down monthly target audience, pillars, and 15 reel topics.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          size="small"
          onClick={handleOpenAdd}
        >
          Add Strategy
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 6 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ border: "1px solid #e5e7eb", borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: "#f9fafb" }}>
                <TableCell sx={{ fontWeight: 700 }}>Client</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Month</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Strategist</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {strategies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: "text.secondary" }}>
                    No strategy records found. Click "Add Strategy" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                strategies.map((strat) => (
                  <TableRow key={strat._id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {strat.clientId?.businessName || "Unknown Client"}
                    </TableCell>
                    <TableCell>{strat.month}</TableCell>
                    <TableCell>{strat.strategist?.name || "Unassigned"}</TableCell>
                    <TableCell>
                      <Chip 
                        label={strat.status} 
                        color={STATUS_COLORS[strat.status] || "default"} 
                        size="small" 
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit Strategy">
                        <IconButton color="primary" onClick={() => handleOpenEdit(strat)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {["admin", "manager"].includes(user?.role) && (
                        <Tooltip title="Delete">
                          <IconButton color="error" onClick={() => handleDelete(strat._id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editTarget ? "Edit Monthly Strategy" : "New Client Strategy"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Meta */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Client</InputLabel>
                <Select
                  value={form.clientId}
                  label="Client"
                  onChange={e => handleClientChange(e.target.value)}
                  disabled={Boolean(editTarget)}
                >
                  {clients.map(c => (
                    <MenuItem key={c._id} value={c._id}>{c.businessName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Month (YYYY-MM)"
                type="month"
                required
                InputLabelProps={{ shrink: true }}
                value={form.month}
                onChange={e => setForm({ ...form, month: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={form.status}
                  label="Status"
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  {["Draft", "Review", "Approved"].map(s => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

            {/* Strategic Parameters */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Business Goal"
                multiline
                rows={2}
                placeholder="Authority building, organic sales, hybrid conversion..."
                value={form.businessGoal}
                onChange={e => setForm({ ...form, businessGoal: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Target Audience"
                multiline
                rows={2}
                placeholder="CEOs, tech professionals, local car buyers..."
                value={form.targetAudience}
                onChange={e => setForm({ ...form, targetAudience: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Content Pillars"
                multiline
                rows={2}
                placeholder="1. Educational, 2. Personal Story, 3. Call to Action..."
                value={form.contentPillars}
                onChange={e => setForm({ ...form, contentPillars: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Competitors"
                multiline
                rows={2}
                placeholder="List competitor links or profiles..."
                value={form.competitors}
                onChange={e => setForm({ ...form, competitors: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Monthly Plan Summary"
                multiline
                rows={2}
                placeholder="Describe execution timeline, hooks, styles to adopt..."
                value={form.monthlyPlan}
                onChange={e => setForm({ ...form, monthlyPlan: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

            {/* Reel Topics */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={700} color="primary" sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                <LightbulbIcon sx={{ fontSize: 18 }} /> {form.reelTopics.length} Reel Topics Outlines
              </Typography>
              {form.reelTopics.length === 0 && (
                <Alert severity="info" sx={{ mb: 1.5 }}>
                  Please select a client to load their package reels planning slots.
                </Alert>
              )}
              <Grid container spacing={1.5}>
                {form.reelTopics.map((topic, idx) => (
                  <Grid item xs={12} sm={6} key={idx}>
                    <TextField
                      fullWidth
                      size="small"
                      label={`Reel ${idx + 1} Topic Outline`}
                      placeholder={`Topic ${idx + 1} concept, hook, description...`}
                      value={topic}
                      onChange={e => handleTopicChange(idx, e.target.value)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="General Notes"
                multiline
                rows={2}
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save Strategy</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
