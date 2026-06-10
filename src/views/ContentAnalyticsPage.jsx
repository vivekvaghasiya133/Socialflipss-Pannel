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
import { getAnalyticsList, createAnalytics, updateAnalytics, deleteAnalytics } from "../api/analyticsApi";
import { getClients } from "../api/clientsApi";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

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
      const [anRes, cliRes] = await Promise.all([
        getAnalyticsList(),
        getClients({ limit: 100 })
      ]);
      setAnalytics(anRes.data || []);
      setClients(cliRes.data.clients || []);
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
    // Fetch all content for this client of type "reel"
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

  const handleSave = async () => {
    if (!form.clientId || !form.contentId) {
      setError("Client and Reel are required.");
      return;
    }
    setError("");
    try {
      const dataToSave = {
        ...form,
        views: Number(form.views),
        saves: Number(form.saves),
        shares: Number(form.shares),
        leads: Number(form.leads)
      };

      if (editTarget) {
        await updateAnalytics(editTarget._id, dataToSave);
      } else {
        await createAnalytics(dataToSave);
      }
      setDialogOpen(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save analytics.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await deleteAnalytics(id);
      loadData();
    } catch (err) {
      setError("Failed to delete record.");
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            📊 Content Performance Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Log and review views, saves, shares, and leads to identify your content Winner and Loser patterns.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          size="small"
          onClick={handleOpenAdd}
        >
          Log Performance
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
                <TableCell sx={{ fontWeight: 700 }}>Reel / Content</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Client</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Views</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Saves</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Shares</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Leads</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Result Classification</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analytics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, color: "text.secondary" }}>
                    No performance records logged yet. Click "Log Performance" to record metrics.
                  </TableCell>
                </TableRow>
              ) : (
                analytics.map((record) => (
                  <TableRow key={record._id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {record.contentId?.title || "Unknown Reel"}
                    </TableCell>
                    <TableCell>{record.clientId?.businessName || "Unknown Client"}</TableCell>
                    <TableCell align="center">{record.views?.toLocaleString("en-IN") || 0}</TableCell>
                    <TableCell align="center">{record.saves?.toLocaleString("en-IN") || 0}</TableCell>
                    <TableCell align="center">{record.shares?.toLocaleString("en-IN") || 0}</TableCell>
                    <TableCell align="center">{record.leads?.toLocaleString("en-IN") || 0}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={RESULT_LABELS[record.result] || record.result} 
                        color={RESULT_COLORS[record.result] || "default"} 
                        size="small" 
                        sx={{ fontWeight: 700 }}
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
                ))
              )}
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
    </Box>
  );
}
