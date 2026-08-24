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
import BarChartIcon from "@mui/icons-material/BarChart";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { getAnalyticsList, createAnalytics, updateAnalytics, deleteAnalytics } from "../api/analyticsApi";
import { getClients } from "../api/clientsApi";
import { updateContent } from "../api/projectsApi";
import api from "../api";

const RESULT_COLORS = {
  Winner: "success",
  Average: "info",
  Loser: "error"
};

const RESULT_LABELS = {
  Winner: "🏆 Winner",
  Average: "😐 Average",
  Loser: "❌ Loser"
};

export default function ContentAnalyticsPage() {
  const [analytics, setAnalytics] = useState([]);
  const [clients, setClients] = useState([]);
  const [contentList, setContentList] = useState([]);
  const [editorProductivity, setEditorProductivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [dailyDetailsEditor, setDailyDetailsEditor] = useState(null);

  // Editing revision note state
  const [editingRevisionId, setEditingRevisionId] = useState(null);
  const [editingRevisionText, setEditingRevisionText] = useState("");
  const [savingRevision, setSavingRevision] = useState(false);

  // Form State
  const [form, setForm] = useState({
    contentId: "",
    clientId: "",
    views: "",
    saves: "",
    shares: "",
    leads: "",
    result: "Average"
  });

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [anRes, cliRes, prodRes] = await Promise.all([
        getAnalyticsList(),
        getClients({ limit: 100 }),
        api.get("/content/editor-productivity").catch(() => ({ data: [] }))
      ]);
      setAnalytics(anRes.data || []);
      setClients(cliRes.data.clients || []);
      setEditorProductivity(prodRes.data || []);
    } catch (err) {
      setError("Failed to load content analytics data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When client changes in form, fetch their reels
  useEffect(() => {
    if (!form.clientId) {
      setContentList([]);
      return;
    }
    api.get("/content", { params: { clientId: form.clientId, type: "reel", limit: 200 } })
      .then(res => {
        setContentList(res.data.content || []);
      })
      .catch(() => {
        setError("Failed to fetch client reels.");
      });
  }, [form.clientId]);

  const handleOpenAdd = () => {
    setEditTarget(null);
    setForm({
      contentId: "",
      clientId: "",
      views: 0,
      saves: 0,
      shares: 0,
      leads: 0,
      result: "Average"
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditTarget(record);
    setForm({
      contentId: record.contentId?._id || record.contentId || "",
      clientId: record.clientId?._id || record.clientId || "",
      views: record.views || 0,
      saves: record.saves || 0,
      shares: record.shares || 0,
      leads: record.leads || 0,
      result: record.result || "Average"
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await deleteAnalytics(id);
      loadData();
    } catch {
      setError("Failed to delete record.");
    }
  };

  const handleSave = async () => {
    if (!form.clientId || !form.contentId) {
      setError("Client and Reel are required.");
      return;
    }
    try {
      if (editTarget) {
        await updateAnalytics(editTarget._id, form);
      } else {
        await createAnalytics(form);
      }
      setDialogOpen(false);
      loadData();
    } catch {
      setError("Failed to save analytics record.");
    }
  };

  // Start editing revision note inline
  const handleStartEditRevision = (rev) => {
    setEditingRevisionId(rev._id);
    setEditingRevisionText(rev.feedbackText);
  };

  // Save updated revision note to database
  const handleSaveRevision = async (reelId, revId) => {
    setSavingRevision(true);
    setError("");
    try {
      const reelRes = await api.get(`/content/${reelId}`);
      const reel = reelRes.data;

      const updatedList = (reel.revisionsList || []).map(r => {
        if (r._id === revId) {
          return { ...r, feedbackText: editingRevisionText };
        }
        return r;
      });

      await updateContent(reelId, { revisionsList: updatedList });

      // Update both local state lists in real-time
      setEditorProductivity(prev => prev.map(row => {
        if (row.editor._id === dailyDetailsEditor.editor._id) {
          const updatedDays = { ...row.days };
          for (let date in updatedDays) {
            updatedDays[date].revisions = updatedDays[date].revisions.map(rev => {
              if (rev._id === revId) {
                return { ...rev, feedbackText: editingRevisionText };
              }
              return rev;
            });
          }
          return { ...row, days: updatedDays };
        }
        return row;
      }));

      setDailyDetailsEditor(prev => {
        const updatedDays = { ...prev.days };
        for (let date in updatedDays) {
          updatedDays[date].revisions = updatedDays[date].revisions.map(rev => {
            if (rev._id === revId) {
              return { ...rev, feedbackText: editingRevisionText };
            }
            return rev;
          });
        }
        return { ...prev, days: updatedDays };
      });

      setEditingRevisionId(null);
    } catch (err) {
      setError("Failed to save revision note.");
    } finally {
      setSavingRevision(false);
    }
  };

  // Get all unique month keys across all editors to draw columns
  const allMonths = Array.from(new Set(
    editorProductivity.flatMap(e => Object.keys(e.months || {}))
  )).sort((a, b) => b.localeCompare(a)); // Sort descending (newest first)

  // Map Month Key (YYYY-MM) to human readable (e.g. August 2026)
  const formatMonthKey = (key) => {
    const [year, month] = key.split("-");
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 6 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            📊 Content Analytics & Editor Performance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            રીલ્સની ઓર્ગેનિક પરફોર્મન્સ ટ્રેકિંગ અને એડિટર વાઇઝ મંથલી પ્રોડક્ટિવિટી રીપોર્ટ.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ borderRadius: 2 }}
        >
          Log Reel Performance
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>{error}</Alert>}

      {/* Editor Productivity Section */}
      <Card sx={{ border: "1px solid #e5e7eb", borderRadius: 3, mb: 5, boxShadow: "none" }}>
        <Box sx={{ p: 3, borderBottom: "1px solid #e5e7eb", bgcolor: "#f9fafb" }}>
          <Typography variant="subtitle1" fontWeight={700}>
            🎬 Editor Monthly Productivity Report (એડિટર વાઇઝ મંથલી વિડિયો કાઉન્ટ)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            કયા એડિટરે કયા મહિનામાં કુલ કેટલા વિડિયો એડિટ કર્યા તેની લાઈવ ગણતરી. ડેઇલી રિપોર્ટ જોવા માટે નામની બાજુમાં ક્લિક કરો.
          </Typography>
        </Box>
        
        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Editor Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                {allMonths.length === 0 ? (
                  <TableCell sx={{ fontWeight: 700 }} align="center">No Completed Edits Yet</TableCell>
                ) : (
                  allMonths.map(month => (
                    <TableCell key={month} align="center" sx={{ fontWeight: 700 }}>
                      {formatMonthKey(month)}
                    </TableCell>
                  ))
                )}
                <TableCell align="center" sx={{ fontWeight: 700 }}>Revisions Done</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Total Edited</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {editorProductivity.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={allMonths.length + 4} align="center" sx={{ py: 3, color: "text.secondary" }}>
                    No team members found.
                  </TableCell>
                </TableRow>
              ) : (
                editorProductivity.map(row => {
                  const total = Object.values(row.months || {}).reduce((sum, val) => sum + val, 0);
                  
                  return (
                    <TableRow key={row.editor._id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <span>👤 {row.editor.name}</span>
                          <Button 
                            size="small" 
                            variant="text" 
                            onClick={() => setDailyDetailsEditor(row)}
                            sx={{ textTransform: "none", fontSize: 11, py: 0 }}
                          >
                            📅 Daily Report
                          </Button>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ textTransform: "capitalize" }}>
                        <Chip label={row.editor.role} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                      </TableCell>
                      {allMonths.length === 0 ? (
                        <TableCell align="center" color="text.secondary">-</TableCell>
                      ) : (
                        allMonths.map(month => (
                          <TableCell key={month} align="center" sx={{ fontWeight: 700 }}>
                            {row.months[month] ? (
                              <Chip 
                                label={`${row.months[month]} Videos`} 
                                color="primary" 
                                size="small" 
                                sx={{ fontWeight: 700, borderRadius: 1.5 }} 
                              />
                            ) : (
                              <span style={{ color: "#9ca3af" }}>0</span>
                            )}
                          </TableCell>
                        ))
                      )}
                      <TableCell align="center" sx={{ fontWeight: 700, color: "warning.main" }}>
                        {row.revisions || 0}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800, color: "primary.main" }}>
                        {total}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
        📈 Organic Reels Metrics (રીલ્સ પર્ફોર્મન્સ લૉગ)
      </Typography>

      {analytics.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", color: "text.secondary", border: "1px solid #e5e7eb", borderRadius: 3 }}>
          No analytics logs found. Log a reel performance to get started.
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ border: "1px solid #e5e7eb", borderRadius: 3, boxShadow: "none", overflow: "hidden" }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f9fafb" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Reel / Concept Title</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Client</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Views</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Saves</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Shares</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Leads</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Result</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analytics.map((record) => (
                <TableRow key={record._id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {record.contentId?.title || "Deleted Reel"}
                  </TableCell>
                  <TableCell>
                    {record.clientId?.businessName || "Deleted Client"}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{record.views?.toLocaleString() || 0}</TableCell>
                  <TableCell align="right">{record.saves?.toLocaleString() || 0}</TableCell>
                  <TableCell align="right">{record.shares?.toLocaleString() || 0}</TableCell>
                  <TableCell align="right" sx={{ color: "success.main", fontWeight: 700 }}>{record.leads || 0}</TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={RESULT_LABELS[record.result] || record.result} 
                      color={RESULT_COLORS[record.result] || "default"} 
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton color="primary" onClick={() => handleOpenEdit(record)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDelete(record._id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Log Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editTarget ? "Edit Analytics Record" : "Log Reel Performance"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Client</InputLabel>
                <Select
                  value={form.clientId}
                  label="Client"
                  onChange={e => setForm({ ...form, clientId: e.target.value, contentId: "" })}
                >
                  {clients.map(c => (
                    <MenuItem key={c._id} value={c._id}>{c.businessName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small" required disabled={!form.clientId}>
                <InputLabel>Reel / Task</InputLabel>
                <Select
                  value={form.contentId}
                  label="Reel / Task"
                  onChange={e => setForm({ ...form, contentId: e.target.value })}
                >
                  {contentList.length === 0 ? (
                    <MenuItem value="" disabled>No reels found for this client</MenuItem>
                  ) : (
                    contentList.map(c => (
                      <MenuItem key={c._id} value={c._id}>{c.title}</MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="Views Count"
                type="number"
                value={form.views}
                onChange={e => setForm({ ...form, views: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="Saves Count"
                type="number"
                value={form.saves}
                onChange={e => setForm({ ...form, saves: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="Shares Count"
                type="number"
                value={form.shares}
                onChange={e => setForm({ ...form, shares: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="Leads Generated"
                type="number"
                value={form.leads}
                onChange={e => setForm({ ...form, leads: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Result Classification</InputLabel>
                <Select
                  value={form.result}
                  label="Result Classification"
                  onChange={e => setForm({ ...form, result: e.target.value })}
                >
                  <MenuItem value="Winner">🏆 Winner</MenuItem>
                  <MenuItem value="Average">😐 Average</MenuItem>
                  <MenuItem value="Loser">❌ Loser</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save Record</Button>
        </DialogActions>
      </Dialog>

      {/* Daily Details Dialog */}
      <Dialog
        open={Boolean(dailyDetailsEditor)}
        onClose={() => setDailyDetailsEditor(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          📅 Daily Report: {dailyDetailsEditor?.editor?.name}
        </DialogTitle>
        <DialogContent dividers>
          {dailyDetailsEditor && Object.keys(dailyDetailsEditor.days || {}).length === 0 ? (
            <Typography color="text.secondary" align="center" py={2}>
              No daily edits or revisions recorded yet.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Edits Done</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Revisions Made</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dailyDetailsEditor && Object.entries(dailyDetailsEditor.days || {})
                    .sort((a, b) => b[0].localeCompare(a[0])) // Newest date first
                    .map(([date, dayData]) => {
                      const formattedDate = new Date(date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      });
                      return (
                        <TableRow key={date} hover sx={{ verticalAlign: "top" }}>
                          <TableCell sx={{ fontWeight: 600, pt: 1.5 }}>{formattedDate}</TableCell>
                          <TableCell align="center" sx={{ pt: 1.5 }}>
                            {dayData.edits > 0 ? (
                              <Chip label={`${dayData.edits} Edits`} color="primary" size="small" sx={{ fontWeight: 700 }} />
                            ) : (
                              <span style={{ color: "#9ca3af" }}>0</span>
                            )}
                          </TableCell>
                          <TableCell sx={{ py: 1.5 }}>
                            {dayData.revisions && dayData.revisions.length > 0 ? (
                              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                {dayData.revisions.map((rev, rIdx) => (
                                  <Box key={rIdx} sx={{ p: 1, bgcolor: "#fffbeb", border: "1px solid #fde68a", borderRadius: 1.5 }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                                      <Typography variant="caption" fontWeight={700} color="warning.dark">
                                        🎬 {rev.reelTitle}
                                      </Typography>
                                      {editingRevisionId === rev._id ? (
                                        <Box>
                                          <IconButton 
                                            size="small" 
                                            color="success" 
                                            disabled={savingRevision}
                                            onClick={() => handleSaveRevision(rev.reelId, rev._id)}
                                            sx={{ p: 0.2 }}
                                          >
                                            <SaveIcon sx={{ fontSize: 14 }} />
                                          </IconButton>
                                          <IconButton 
                                            size="small" 
                                            color="error" 
                                            onClick={() => setEditingRevisionId(null)}
                                            sx={{ p: 0.2, ml: 0.5 }}
                                          >
                                            <CloseIcon sx={{ fontSize: 14 }} />
                                          </IconButton>
                                        </Box>
                                      ) : (
                                        <Button 
                                          size="small" 
                                          variant="text" 
                                          onClick={() => handleStartEditRevision(rev)}
                                          sx={{ fontSize: 10, minWidth: 0, p: 0, textTransform: "none" }}
                                        >
                                          Edit Note
                                        </Button>
                                      )}
                                    </Box>
                                    
                                    {editingRevisionId === rev._id ? (
                                      <TextField
                                        fullWidth
                                        multiline
                                        size="small"
                                        value={editingRevisionText}
                                        onChange={e => setEditingRevisionText(e.target.value)}
                                        sx={{ 
                                          "& .MuiOutlinedInput-root": { fontSize: 11, bgcolor: "#fff", borderRadius: 1 } 
                                        }}
                                      />
                                    ) : (
                                      <Typography variant="caption" color="text.primary">
                                        💬 {rev.feedbackText}
                                      </Typography>
                                    )}
                                  </Box>
                                ))}
                              </Box>
                            ) : (
                              <span style={{ color: "#9ca3af" }}>0 revisions</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="contained" onClick={() => setDailyDetailsEditor(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
