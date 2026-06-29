import { useEffect, useState } from "react";
import {
  Box, Typography, Card, Grid, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, FormControl,
  InputLabel, Select, Alert, CircularProgress, Paper, IconButton,
  Divider, Tooltip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EventNoteIcon from "@mui/icons-material/EventNote";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { getMeetings, createMeeting, uploadMeetingImage, deleteMeeting } from "../api/meetingApi";
import { getClients } from "../api/clientsApi";
import { useAuth } from "../context/AuthContext";

export default function MeetingsPage() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Dialog state
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [form, setForm] = useState({
    clientId: "",
    title: "",
    purpose: "Onboarding Meeting",
    date: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:MM
    notes: "",
    images: []
  });

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [meetRes, cliRes] = await Promise.all([
        getMeetings(),
        getClients({ limit: 100 })
      ]);
      setMeetings(meetRes.data || []);
      setClients(cliRes.data.clients || []);
    } catch (err) {
      setError("Failed to load meetings history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpen = () => {
    setForm({
      clientId: "",
      title: "",
      purpose: "Onboarding Meeting",
      date: new Date().toISOString().slice(0, 16),
      notes: "",
      images: []
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Base64 file reader and uploader
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    setError("");

    try {
      const uploadPromises = files.map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = async () => {
            try {
              const res = await uploadMeetingImage({ image: reader.result });
              resolve(res.data.url);
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = error => reject(error);
        });
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setForm(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
      setSuccess("Images uploaded successfully!");
    } catch (err) {
      setError("Failed to upload one or more images. Make sure they are not too large.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (urlIdx) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== urlIdx)
    }));
  };

  const handleSubmit = async () => {
    if (!form.clientId || !form.title || !form.purpose || !form.date) {
      setError("Please fill out all required fields.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await createMeeting(form);
      setOpen(false);
      setSuccess("Meeting log saved successfully!");
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save meeting log.");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this meeting log?")) return;
    try {
      await deleteMeeting(id);
      setSuccess("Meeting log deleted.");
      loadData();
    } catch (err) {
      setError("Failed to delete meeting log.");
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            🤝 Meeting Logs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Document onboarding/alignment calls and upload offline/whiteboard sketches.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
          size="small"
        >
          Add Meeting Log
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 6 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {meetings.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: "center", border: "1px solid #e5e7eb" }}>
                <Typography variant="body1" color="text.secondary">
                  No meetings logged yet. Click "Add Meeting Log" to record your first onboarding session.
                </Typography>
              </Paper>
            </Grid>
          ) : (
            meetings.map((meet) => (
              <Grid item xs={12} key={meet._id}>
                <Card sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}>
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1, mb: 2 }}>
                      <Box>
                        <Chip label={meet.purpose} color="primary" size="small" sx={{ fontWeight: 700, mb: 1 }} />
                        <Typography variant="h6" fontWeight={700}>{meet.title}</Typography>
                        <Typography variant="body2" color="text.secondary" mt={0.5}>
                          Client: <strong>{meet.clientId?.businessName || "Unknown"}</strong> ({meet.clientId?.ownerName})
                        </Typography>
                        <Typography variant="caption" color="text.disabled" display="block" mt={0.5}>
                          📅 {new Date(meet.date).toLocaleString("en-IN")} · Logged by: {meet.createdBy?.name || "System"}
                        </Typography>
                      </Box>
                      {["admin", "manager"].includes(user?.role) && (
                        <Tooltip title="Delete Log">
                          <IconButton color="error" onClick={() => handleDelete(meet._id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="subtitle2" color="primary" fontWeight={700} gutterBottom>Meeting Notes / Discussed Points:</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line", bgcolor: "#f9fafb", p: 2, borderRadius: 2, border: "1px solid #f3f4f6" }}>
                      {meet.notes || "No text notes entered."}
                    </Typography>

                    {meet.images && meet.images.length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" color="primary" fontWeight={700} mb={1.5}>📷 Uploaded Offline Notes / Sketches:</Typography>
                        <Grid container spacing={2}>
                          {meet.images.map((img, i) => (
                            <Grid item xs={6} sm={4} md={3} key={i}>
                              <Box
                                component="a"
                                href={`http://localhost:5000${img}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                  display: "block",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: 2,
                                  overflow: "hidden",
                                  height: 120,
                                  bgcolor: "#eaeaea",
                                  "&:hover": { boxShadow: 3 }
                                }}
                              >
                                <img
                                  src={`http://localhost:5000${img}`}
                                  alt="meeting note"
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </Box>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Add Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Log Client Meeting Details</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Client</InputLabel>
                <Select
                  value={form.clientId}
                  label="Client"
                  onChange={e => setForm({ ...form, clientId: e.target.value })}
                >
                  {clients.map(c => (
                    <MenuItem key={c._id} value={c._id}>{c.businessName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Meeting Date & Time"
                type="datetime-local"
                required
                InputLabelProps={{ shrink: true }}
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Meeting Title"
                placeholder="e.g. Onboarding Brand Strategy Discussion"
                required
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Purpose</InputLabel>
                <Select
                  value={form.purpose}
                  label="Purpose"
                  onChange={e => setForm({ ...form, purpose: e.target.value })}
                >
                  {["Onboarding Meeting", "Monthly Planning", "Follow Up", "Revisions & Feedback", "General Alignment"].map(p => (
                    <MenuItem key={p} value={p}>{p}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Notes / Discussed Points"
                placeholder="Write down meeting minutes, deliverables agreed, hooks discussed..."
                multiline
                rows={4}
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
              />
            </Grid>
            
            {/* Image Uploader */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>📷 Upload Sketches / Offline Notes</Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCameraIcon />}
                disabled={uploading}
                size="small"
              >
                {uploading ? "Uploading..." : "Select Images"}
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
              
              {/* Thumbnails preview */}
              {form.images.length > 0 && (
                <Grid container spacing={1} sx={{ mt: 1.5 }}>
                  {form.images.map((url, i) => (
                    <Grid item key={i} sx={{ position: "relative" }}>
                      <Box sx={{ width: 80, height: 80, border: "1px solid #ccc", borderRadius: 2, overflow: "hidden" }}>
                        <img src={`http://localhost:5000${url}`} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </Box>
                      <IconButton
                        size="small"
                        sx={{ position: "absolute", top: -5, right: -5, bgcolor: "rgba(255,255,255,0.8)", border: "1px solid #ccc" }}
                        onClick={() => removeImage(i)}
                      >
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} disabled={uploading}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={uploading}>Save Meeting Log</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
