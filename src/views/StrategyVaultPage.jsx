import { useEffect, useState } from "react";
import {
  Box, Typography, Card, Grid, Table, TableBody, TableCell,
  TableHead, TableRow, TableContainer, IconButton, Button,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert, Select, MenuItem, FormControl,
  InputLabel, Tooltip, Chip, Paper, Divider, Checkbox, FormControlLabel
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
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

  // PDF Export State
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportTarget, setExportTarget] = useState(null);
  const [selectedExportIndexes, setSelectedExportIndexes] = useState([]);

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
    let totalCount = 0;
    if (client && client.package && client.package.deliverables) {
      client.package.deliverables.forEach(d => {
        const typeLower = (d.type || "").toLowerCase();
        if (
          typeLower.includes("reel") ||
          typeLower.includes("ugc") ||
          typeLower.includes("video") ||
          typeLower.includes("post") ||
          typeLower.includes("carousel") ||
          typeLower.includes("youtube")
        ) {
          totalCount += d.quantity || 0;
        }
      });
    }
    return totalCount;
  };

  const getTopicLabel = (idx, clientId) => {
    const client = clients.find(c => c._id === clientId);
    if (!client || !client.package || !client.package.deliverables) {
      return `Reel ${idx + 1}`;
    }
    
    let currentIdx = 0;
    for (const d of client.package.deliverables) {
      const typeLower = (d.type || "").toLowerCase();
      if (
        typeLower.includes("reel") ||
        typeLower.includes("ugc") ||
        typeLower.includes("video") ||
        typeLower.includes("post") ||
        typeLower.includes("carousel") ||
        typeLower.includes("youtube")
      ) {
        if (idx >= currentIdx && idx < currentIdx + d.quantity) {
          const itemNumberInType = idx - currentIdx + 1;
          return `${d.type} ${itemNumberInType}`;
        }
        currentIdx += d.quantity;
      }
    }
    
    return `Reel ${idx + 1}`;
  };



  const handleClientChange = (selectedClientId) => {
    const targetReelCount = getReelsCountForClient(selectedClientId);
    setForm(prev => ({
      ...prev,
      clientId: selectedClientId,
      reelTopics: Array(targetReelCount).fill(null).map(() => ({
        title: "", brief: "", scriptText: "", status: "Draft", approvedBy: "", feedback: "", contentId: null
      }))
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
    const savedTopics = (strat.reelTopics || []).map(topic => {
      if (typeof topic === "string") {
        return { title: topic, brief: "", scriptText: "", status: "Draft", approvedBy: "", feedback: "", contentId: null };
      }
      return {
        title: topic.title || "",
        brief: topic.brief || "",
        scriptText: topic.scriptText || "",
        status: topic.status || "Draft",
        approvedBy: topic.approvedBy || "",
        feedback: topic.feedback || "",
        contentId: topic.contentId || null
      };
    });
    let finalTopics = [...savedTopics];
    if (finalTopics.length < targetReelCount) {
      finalTopics = [
        ...finalTopics,
        ...Array(targetReelCount - finalTopics.length).fill(null).map(() => ({
          title: "", brief: "", scriptText: "", status: "Draft", approvedBy: "", feedback: "", contentId: null
        }))
      ];
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

  const handleOpenPdfExport = (strat) => {
    setExportTarget(strat);
    // Auto-select all topics that have titles
    const indexesWithTitles = (strat.reelTopics || [])
      .map((topic, idx) => {
        const title = typeof topic === "string" ? topic : (topic?.title || "");
        return title.trim() ? idx : -1;
      })
      .filter(idx => idx !== -1);
    
    setSelectedExportIndexes(indexesWithTitles);
    setExportDialogOpen(true);
  };

  const handleToggleExportIndex = (idx) => {
    setSelectedExportIndexes(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const handleSelectAllExport = () => {
    if (!exportTarget) return;
    const allIdx = (exportTarget.reelTopics || [])
      .map((topic, idx) => {
        const title = typeof topic === "string" ? topic : (topic?.title || "");
        return title.trim() ? idx : -1;
      })
      .filter(idx => idx !== -1);
    setSelectedExportIndexes(allIdx);
  };

  const handleSelectNoneExport = () => {
    setSelectedExportIndexes([]);
  };

  const handleGeneratePdf = () => {
    if (!exportTarget) return;
    
    const clientName = exportTarget.clientId?.businessName || "Client";
    const selectedTopics = (exportTarget.reelTopics || [])
      .map((topic, idx) => {
        const isString = typeof topic === "string";
        return {
          index: idx,
          title: isString ? topic : (topic.title || ""),
          brief: isString ? "" : (topic.brief || ""),
          scriptText: isString ? "" : (topic.scriptText || "")
        };
      })
      .filter(t => selectedExportIndexes.includes(t.index));

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Strategy Export - ${clientName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
            body { font-family: 'Outfit', sans-serif; color: #1e293b; padding: 20px; background: #ffffff; margin-bottom: 60px; position: relative; }
            
            /* Watermark style */
            body::before {
              content: 'SOCIALFLIPSS';
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-30deg);
              font-size: 90px;
              font-weight: 900;
              color: rgba(59, 130, 246, 0.035);
              z-index: -1000;
              pointer-events: none;
              white-space: nowrap;
              letter-spacing: 0.15em;
            }

            .branding-bar {
              height: 4px;
              background: linear-gradient(90deg, #3b82f6, #1d4ed8);
              margin-bottom: 15px;
              border-radius: 2px;
            }

            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-end; 
              margin-bottom: 25px; 
              border-bottom: 2px solid #f1f5f9; 
              padding-bottom: 15px; 
            }
            .title { font-size: 22px; font-weight: 800; color: #0f172a; }
            .meta { font-size: 13px; color: #64748b; margin-top: 4px; font-weight: 500; }
            
            .brand-logo-text {
              font-size: 14px;
              font-weight: 800;
              color: #1e3a8a;
              letter-spacing: 0.05em;
              display: flex;
              align-items: center;
              gap: 4px;
            }
            .brand-badge {
              font-size: 9px;
              background: #eff6ff;
              color: #1d4ed8;
              padding: 2px 8px;
              border-radius: 12px;
              font-weight: 700;
              border: 1px solid #bfdbfe;
              margin-top: 4px;
              display: inline-block;
            }

            .topic-card { 
              border: 1px solid #e2e8f0; 
              border-top: 3px solid #3b82f6; 
              border-radius: 10px; 
              padding: 20px; 
              margin-bottom: 25px; 
              background: #f8fafc; 
              box-shadow: 0 1px 3px rgba(0,0,0,0.01);
            }
            .topic-header { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
            .section-title { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #2563eb; margin-top: 14px; margin-bottom: 4px; letter-spacing: 0.05em; }
            .section-content { font-size: 13px; line-height: 1.6; color: #334155; white-space: pre-line; }
            .script-box { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #0f172a; margin-top: 4px; line-height: 1.5; }
            
            /* Print running footer */
            .print-footer {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              display: flex;
              justify-content: space-between;
              font-size: 9px;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 8px;
              font-weight: 500;
              background: #ffffff;
            }
            
            @media print {
              body { margin-bottom: 50px; }
              .topic-card { page-break-inside: auto; background: #fafafa !important; }
              .print-footer { position: fixed; bottom: 0; }
            }
          </style>
        </head>
        <body>
          <div class="branding-bar"></div>
          <div class="header">
            <div>
              <div class="title">${clientName} - Content Strategy</div>
              <div class="meta">Month: ${exportTarget.month} | Total Selected: ${selectedTopics.length}</div>
            </div>
            <div style="text-align: right;">
              <div class="brand-logo-text">⚡ SOCIALFLIPSS</div>
              <div class="brand-badge">CREATIVE CONTENT AGENCY</div>
            </div>
          </div>
          ${selectedTopics.map((topic) => `
            <div class="topic-card">
              <div class="topic-header">Reel ${topic.index + 1}: ${topic.title || "Untitled Concept"}</div>
              
              <div class="section-title">Concept / Idea Brief</div>
              <div class="section-content">${topic.brief || "No brief description provided."}</div>
              
              ${topic.scriptText ? `
                <div class="section-title">Script Draft</div>
                <div class="script-box section-content">${topic.scriptText}</div>
              ` : ""}
            </div>
          `).join("")}
          
          <div class="print-footer">
            <span>socialflipss.com | Creative Content Management System</span>
            <span>Generated by SocialFlipss Team</span>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setExportDialogOpen(false);
  };

  const handleTopicFieldChange = (idx, field, value) => {
    const updatedTopics = [...form.reelTopics];
    updatedTopics[idx] = {
      ...updatedTopics[idx],
      [field]: value
    };
    setForm({ ...form, reelTopics: updatedTopics });
  };

  const handleTopicStatusChange = (idx, newStatus) => {
    const updatedTopics = [...form.reelTopics];
    const oldTopic = updatedTopics[idx];
    updatedTopics[idx] = {
      ...oldTopic,
      status: newStatus,
      approvedBy: newStatus === "Approved" ? (oldTopic.approvedBy || "admin") : ""
    };
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
                      <Tooltip title="Download PDF">
                        <IconButton color="info" onClick={() => handleOpenPdfExport(strat)} sx={{ mr: 0.5 }}>
                          <PictureAsPdfIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Strategy">
                        <IconButton color="primary" onClick={() => handleOpenEdit(strat)} sx={{ mr: 0.5 }}>
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
                <LightbulbIcon sx={{ fontSize: 18 }} /> {form.reelTopics.length} Content / Reel Topics Outlines
              </Typography>
              {!form.clientId && (
                <Alert severity="info" sx={{ mb: 1.5 }}>
                  Please select a client to load their package reels planning slots.
                </Alert>
              )}
              {form.clientId && form.reelTopics.length === 0 && (
                <Alert severity="warning" sx={{ mb: 1.5 }}>
                  No deliverables configured for this client. Please set package deliverables in Client Details first.
                </Alert>
              )}
              <Grid container spacing={2}>
                {form.reelTopics.map((topic, idx) => {
                  const topicVal = typeof topic === "string" ? { title: topic, brief: "", scriptText: "", status: "Draft", approvedBy: "", feedback: "" } : (topic || { title: "", brief: "", scriptText: "", status: "Draft", approvedBy: "", feedback: "" });
                  return (
                    <Grid item xs={12} key={idx}>
                      <Box sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2, bgcolor: "#f9fafb" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                          <Typography variant="subtitle2" fontWeight={700}>{getTopicLabel(idx, form.clientId)}</Typography>
                          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                            <FormControl size="small" sx={{ minWidth: 140 }}>
                              <Select
                                value={topicVal.status || "Draft"}
                                onChange={e => handleTopicStatusChange(idx, e.target.value)}
                                sx={{ fontSize: 11, height: 26, fontWeight: 700, bgcolor: "#fff" }}
                              >
                                <MenuItem value="Draft" sx={{ fontSize: 11, fontWeight: 600 }}>Draft</MenuItem>
                                <MenuItem value="Review" sx={{ fontSize: 11, fontWeight: 600 }}>Review</MenuItem>
                                <MenuItem value="Approved" sx={{ fontSize: 11, fontWeight: 600 }}>
                                  {topicVal.approvedBy === "admin" ? "Approved (SF) ✓" : topicVal.approvedBy === "client" ? "Approved (Client) ✓" : "Approved ✓"}
                                </MenuItem>
                                <MenuItem value="Changes Requested" sx={{ fontSize: 11, fontWeight: 600 }}>Changes Requested</MenuItem>
                              </Select>
                            </FormControl>
                            {topicVal.status === "Approved" && topicVal.approvedBy && (
                              <Typography variant="caption" sx={{ fontSize: 9, color: "text.secondary", mt: 0.5, fontWeight: 500 }}>
                                {topicVal.approvedBy === "admin" ? "Approved by SocialFlipss" : "Approved by Client"}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <Grid container spacing={1.5}>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Concept Title"
                              placeholder="e.g., Hook + Topic Idea"
                              value={topicVal.title || ""}
                              onChange={e => handleTopicFieldChange(idx, "title", e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12} sm={8}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Content Brief / Angle"
                              placeholder="Describe hooks, call-to-action, or details about this reel..."
                              multiline
                              rows={1.5}
                              value={topicVal.brief || ""}
                              onChange={e => handleTopicFieldChange(idx, "brief", e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Script (Optional)"
                              placeholder="Write the full script draft here if preparing scripting together with concept..."
                              multiline
                              rows={2.5}
                              value={topicVal.scriptText || ""}
                              onChange={e => handleTopicFieldChange(idx, "scriptText", e.target.value)}
                            />
                          </Grid>
                        </Grid>
                        {topicVal.status === "Changes Requested" && topicVal.feedback && (
                          <Box sx={{ mt: 1.5, p: 1, bgcolor: "#fffbeb", border: "1px solid #fef3c7", borderRadius: 1.5 }}>
                            <Typography variant="caption" color="warning.dark" sx={{ fontWeight: 600 }}>
                              💬 Client Feedback: {topicVal.feedback}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  );
                })}
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

      {/* PDF Export Dialog */}
      <Dialog 
        open={exportDialogOpen} 
        onClose={() => setExportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          📄 Export Strategy to PDF
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" gutterBottom>
            Client: <strong>{exportTarget?.clientId?.businessName || "Client"}</strong> ({exportTarget?.month})
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Select the concept/reels topics you want to include in the PDF export.
          </Typography>
          
          <Box sx={{ mb: 2, display: "flex", gap: 1.5 }}>
            <Button size="small" variant="outlined" onClick={handleSelectAllExport}>
              Select All
            </Button>
            <Button size="small" variant="outlined" onClick={handleSelectNoneExport}>
              Clear All
            </Button>
          </Box>

          <Box sx={{ maxHeight: 350, overflowY: "auto", pr: 1 }}>
            {exportTarget && (exportTarget.reelTopics || []).filter(topic => {
              const title = typeof topic === "string" ? topic : (topic?.title || "");
              return title.trim() !== "";
            }).length === 0 ? (
              <Alert severity="info">No active topics with titles found in this strategy.</Alert>
            ) : (
              (exportTarget?.reelTopics || []).map((topic, idx) => {
                const topicTitle = typeof topic === "string" ? topic : (topic?.title || "");
                if (!topicTitle.trim()) return null;

                const isChecked = selectedExportIndexes.includes(idx);
                return (
                  <Box 
                    key={idx} 
                    sx={{ 
                      display: "flex", 
                      alignItems: "center", 
                      p: 1, 
                      borderBottom: "1px solid #f3f4f6",
                      "&:hover": { bgcolor: "#f9fafb" } 
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={isChecked} 
                          onChange={() => handleToggleExportIndex(idx)} 
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            Reel {idx + 1}: {topicTitle}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {typeof topic !== "string" && topic.brief ? (topic.brief.slice(0, 80) + (topic.brief.length > 80 ? "..." : "")) : "No brief description"}
                          </Typography>
                        </Box>
                      }
                      sx={{ flexGrow: 1, m: 0 }}
                    />
                  </Box>
                );
              })
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleGeneratePdf}
            disabled={selectedExportIndexes.length === 0}
          >
            Generate PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
