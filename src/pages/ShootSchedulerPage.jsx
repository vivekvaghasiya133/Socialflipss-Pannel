import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Card, CardContent, Grid, Button, TextField,
  Chip, Divider, Alert, Snackbar, CircularProgress, IconButton,
  Tooltip, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, FormControl, InputLabel, LinearProgress,
} from "@mui/material";
import ArrowBackIcon   from "@mui/icons-material/ArrowBack";
import WhatsAppIcon    from "@mui/icons-material/WhatsApp";
import RefreshIcon     from "@mui/icons-material/Refresh";
import CheckIcon       from "@mui/icons-material/CheckCircle";
import CalendarIcon    from "@mui/icons-material/CalendarMonth";
import EditIcon        from "@mui/icons-material/Edit";
import { getProjectById } from "../api/projectsApi";
import { getShootScheduleByProject, generateShootSchedule, updateShootSlot, deleteShootSchedule } from "../api/featuresApi";

const SLOT_COLORS = {
  morning:   { bg:"#fef3c7", color:"#92400e", label:"🌅 Morning",   time:"10:00 AM" },
  afternoon: { bg:"#dbeafe", color:"#1e40af", label:"☀️ Afternoon", time:"2:00 PM"  },
  evening:   { bg:"#ede9fe", color:"#6d28d9", label:"🌆 Evening",   time:"5:00 PM"  },
};

const STATUS_CONFIG = {
  scheduled:   { color:"info",      label:"Scheduled" },
  done:        { color:"success",   label:"Done ✓" },
  cancelled:   { color:"error",     label:"Cancelled" },
  rescheduled: { color:"warning",   label:"Rescheduled" },
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function buildWhatsAppMessage(slot, client, projectName) {
  const dateObj  = new Date(slot.date + "T00:00:00");
  const dateStr  = dateObj.toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long" });
  const slotInfo = SLOT_COLORS[slot.timeSlot];

  return `Hi ${client?.ownerName} 👋

*SocialFlipss — Shoot Schedule*

📅 Date: *${dateStr}*
⏰ Time: *${slotInfo.time} (${slot.timeSlot.charAt(0).toUpperCase()+slot.timeSlot.slice(1)})*
🎬 Reels: *${slot.reelCount} reel${slot.reelCount>1?"s":""}*
📁 Project: ${projectName}

Aapde aa date ane time par shoot karishhu. Please available rahejo! 🙏

${slot.note ? `📝 Note: ${slot.note}\n` : ""}
– SocialFlipss Team`;
}

export default function ShootSchedulerPage() {
  const { projectId } = useParams();
  const navigate      = useNavigate();

  const [project, setProject]   = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast]       = useState("");
  const [error, setError]       = useState("");

  // Generate form
  const [showGenForm, setShowGenForm] = useState(false);
  const [genForm, setGenForm] = useState({
    totalReels: "", startDate:"", endDate:"",
  });

  // Edit slot dialog
  const [editSlot, setEditSlot] = useState(null);
  const [editForm, setEditForm] = useState({ status:"", note:"", timeSlot:"" });

  const load = async () => {
    setLoading(true);
    try {
      const [pr, sr] = await Promise.all([
        getProjectById(projectId),
        getShootScheduleByProject(projectId),
      ]);
      setProject(pr.data);
      setSchedule(sr.data);

      // Pre-fill gen form from project
      if (pr.data.startDate && pr.data.endDate) {
        setGenForm(prev => ({
          ...prev,
          startDate: pr.data.startDate.slice(0,10),
          endDate:   pr.data.endDate.slice(0,10),
        }));
      }
    } catch {
      setError("Load failed.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [projectId]);

  const handleGenerate = async () => {
    if (!genForm.totalReels || !genForm.startDate || !genForm.endDate) {
      setError("Total reels, start date ane end date required chhe."); return;
    }
    setGenerating(true); setError("");
    try {
      const res = await generateShootSchedule({
        projectId,
        clientId:   project?.clientId?._id || project?.clientId,
        totalReels: Number(genForm.totalReels),
        startDate:  genForm.startDate,
        endDate:    genForm.endDate,
        workDays:   [1,2,3,4,5,6], // Mon-Sat
      });
      setSchedule(res.data);
      setShowGenForm(false);
      setToast(`✅ ${res.data.slots.length} shoot slots generated!`);
    } catch (err) {
      setError(err.response?.data?.message || "Generate failed.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSlotStatus = async (slotId, status) => {
    try {
      const res = await updateShootSlot(schedule._id, slotId, { status });
      setSchedule(res.data);
      setToast(`Slot marked as ${status}!`);
    } catch { setError("Update failed."); }
  };

  const handleEditSave = async () => {
    try {
      const res = await updateShootSlot(schedule._id, editSlot._id, editForm);
      setSchedule(res.data);
      setEditSlot(null);
      setToast("Slot updated!");
    } catch { setError("Update failed."); }
  };

  const sendWhatsApp = (slot) => {
    const client  = schedule?.clientId;
    const mobile  = client?.mobile;
    if (!mobile) { setToast("Client mobile number nathi."); return; }
    const msg = encodeURIComponent(buildWhatsAppMessage(slot, client, project?.name || ""));
    window.open(`https://wa.me/91${mobile.replace(/\D/g,"")}?text=${msg}`, "_blank");
    // Mark as whatsapp sent
    updateShootSlot(schedule._id, slot._id, { whatsappSent: true })
      .then(res => setSchedule(res.data));
  };

  const openEdit = (slot) => {
    setEditSlot(slot);
    setEditForm({ status: slot.status, note: slot.note||"", timeSlot: slot.timeSlot });
  };

  if (loading) return <Box sx={{ display:"flex", justifyContent:"center", pt:8 }}><CircularProgress /></Box>;

  // Stats
  const totalSlots  = schedule?.slots?.length || 0;
  const doneSlots   = schedule?.slots?.filter(s=>s.status==="done").length || 0;
  const totalReels  = schedule?.slots?.reduce((sum,s)=>sum+s.reelCount,0) || 0;
  const doneReels   = schedule?.slots?.filter(s=>s.status==="done").reduce((sum,s)=>sum+s.reelCount,0) || 0;
  const pct         = totalReels > 0 ? Math.round((doneReels/totalReels)*100) : 0;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={()=>navigate(`/admin/projects/${projectId}`)} sx={{ mb:2 }}>
        Back to Project
      </Button>

      {/* Header */}
      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", mb:3, flexWrap:"wrap", gap:2 }}>
        <Box>
          <Box sx={{ display:"flex", alignItems:"center", gap:1, mb:0.5 }}>
            <CalendarIcon sx={{ color:"#1a56db" }} />
            <Typography variant="h5">Shoot Schedule</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {project?.name} · {schedule?.clientId?.businessName || project?.clientId?.businessName}
          </Typography>
        </Box>
        <Box sx={{ display:"flex", gap:1 }}>
          {schedule && (
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={()=>setShowGenForm(true)}>
              Regenerate
            </Button>
          )}
          <Button variant="contained" startIcon={<CalendarIcon />} onClick={()=>setShowGenForm(true)}>
            {schedule ? "Update Schedule" : "Generate Schedule"}
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb:2 }} onClose={()=>setError("")}>{error}</Alert>}

      {/* Generate form */}
      {showGenForm && (
        <Card sx={{ mb:3, border:"2px solid #1a56db" }}>
          <CardContent>
            <Typography variant="h6" mb={2}>🗓️ Auto-Generate Shoot Schedule</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Total reels, start date ane end date nakho — baaki automatic schedule thaashhe. Mon–Sat working days, Morning/Afternoon/Evening slots ma evenly distribute thashe.
            </Typography>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={3}>
                <TextField fullWidth size="small" label="Total Reels *" type="number"
                  value={genForm.totalReels}
                  onChange={e=>setGenForm({...genForm,totalReels:e.target.value})}
                  placeholder="e.g. 10" />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField fullWidth size="small" label="Start Date *" type="date" InputLabelProps={{ shrink:true }}
                  value={genForm.startDate}
                  onChange={e=>setGenForm({...genForm,startDate:e.target.value})} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField fullWidth size="small" label="End Date *" type="date" InputLabelProps={{ shrink:true }}
                  value={genForm.endDate}
                  onChange={e=>setGenForm({...genForm,endDate:e.target.value})} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ display:"flex", gap:1 }}>
                  <Button variant="contained" onClick={handleGenerate} disabled={generating} fullWidth>
                    {generating ? <CircularProgress size={20} color="inherit" /> : "Generate ✨"}
                  </Button>
                  <Button variant="outlined" onClick={()=>setShowGenForm(false)}>Cancel</Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {!schedule && !showGenForm && (
        <Card>
          <CardContent sx={{ textAlign:"center", py:6 }}>
            <CalendarIcon sx={{ fontSize:48, color:"#d1d5db", mb:2 }} />
            <Typography variant="h6" color="text.secondary" mb={1}>Koi schedule nathi yet</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Total reels ane date range nakho — automatic shoot schedule generate thashe.
            </Typography>
            <Button variant="contained" onClick={()=>setShowGenForm(true)}>Generate Schedule</Button>
          </CardContent>
        </Card>
      )}

      {schedule && (
        <>
          {/* Stats */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={6} sm={3}>
              <Card><Box sx={{ p:2 }}>
                <Typography variant="body2" color="text.secondary">Total Slots</Typography>
                <Typography variant="h4" fontWeight={700} color="#1a56db">{totalSlots}</Typography>
              </Box></Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card><Box sx={{ p:2 }}>
                <Typography variant="body2" color="text.secondary">Total Reels</Typography>
                <Typography variant="h4" fontWeight={700} color="#8b5cf6">{totalReels}</Typography>
              </Box></Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card><Box sx={{ p:2 }}>
                <Typography variant="body2" color="text.secondary">Completed</Typography>
                <Typography variant="h4" fontWeight={700} color="#0e9f6e">{doneReels} reels</Typography>
              </Box></Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card><Box sx={{ p:2 }}>
                <Typography variant="body2" color="text.secondary">Progress</Typography>
                <Typography variant="h4" fontWeight={700} color={pct===100?"#0e9f6e":"#ff8800"}>{pct}%</Typography>
              </Box></Card>
            </Grid>
          </Grid>

          {/* Progress bar */}
          <Card sx={{ mb:3 }}>
            <CardContent sx={{ pb:"16px !important" }}>
              <Box sx={{ display:"flex", justifyContent:"space-between", mb:1 }}>
                <Typography variant="body2" fontWeight={600}>Overall Progress</Typography>
                <Typography variant="body2" color="text.secondary">{doneReels} / {totalReels} reels done</Typography>
              </Box>
              <LinearProgress variant="determinate" value={pct}
                sx={{ height:10, borderRadius:5, bgcolor:"#e5e7eb", "& .MuiLinearProgress-bar":{ bgcolor: pct===100?"#0e9f6e":"#1a56db", borderRadius:5 } }} />
            </CardContent>
          </Card>

          {/* Slots table */}
          <Card>
            <CardContent sx={{ pb:"0 !important" }}>
              <Typography variant="h6" mb={2}>Shoot Slots</Typography>
            </CardContent>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ background:"#f9fafb" }}>
                    {["Date","Day","Time Slot","Reels","Status","WhatsApp","Actions"].map(h=>(
                      <TableCell key={h} sx={{ fontWeight:600, fontSize:12, color:"text.secondary", py:1.5 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schedule.slots.map((slot) => {
                    const dateObj  = new Date(slot.date+"T00:00:00");
                    const dayName  = dateObj.toLocaleDateString("en-IN",{weekday:"short"});
                    const dateDisp = dateObj.toLocaleDateString("en-IN",{day:"numeric",month:"short"});
                    const slotStyle = SLOT_COLORS[slot.timeSlot];
                    const isPast   = dateObj < new Date() && slot.status === "scheduled";

                    return (
                      <TableRow key={slot._id} hover
                        sx={{ background: slot.status==="done" ? "#f0fdf4" : isPast ? "#fff7ed" : "inherit" }}>
                        <TableCell sx={{ fontWeight:600 }}>
                          {isPast && "⚠️ "}{dateDisp}, {dateObj.getFullYear()}
                        </TableCell>
                        <TableCell>
                          <Chip label={dayName} size="small" variant="outlined" sx={{ fontSize:11 }} />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${slotStyle.label} · ${slot.time}`}
                            size="small"
                            sx={{ bgcolor:slotStyle.bg, color:slotStyle.color, fontWeight:600, fontSize:11 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip label={`🎬 ${slot.reelCount} reel${slot.reelCount>1?"s":""}`} size="small"
                            sx={{ bgcolor:"#ede9fe", color:"#6d28d9", fontWeight:600 }} />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={STATUS_CONFIG[slot.status]?.label}
                            color={STATUS_CONFIG[slot.status]?.color}
                            size="small"
                          />
                          {slot.note && (
                            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt:0.25 }}>
                              {slot.note}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Tooltip title={slot.whatsappSent ? "WhatsApp sent ✓" : "Send shoot reminder on WhatsApp"}>
                            <Button
                              size="small"
                              variant={slot.whatsappSent ? "outlined" : "contained"}
                              color="success"
                              startIcon={<WhatsAppIcon sx={{ fontSize:"14px !important" }} />}
                              onClick={()=>sendWhatsApp(slot)}
                              sx={{ fontSize:11, py:0.5, px:1.5 }}
                            >
                              {slot.whatsappSent ? "Resend" : "Send"}
                            </Button>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {slot.status !== "done" && (
                            <Tooltip title="Mark as Done">
                              <IconButton size="small" color="success" onClick={()=>handleSlotStatus(slot._id,"done")}>
                                <CheckIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Edit slot">
                            <IconButton size="small" onClick={()=>openEdit(slot)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </>
      )}

      {/* Edit Slot Dialog */}
      <Dialog open={Boolean(editSlot)} onClose={()=>setEditSlot(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Shoot Slot</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt:0.5 }}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={editForm.status} label="Status" onChange={e=>setEditForm({...editForm,status:e.target.value})}>
                  {Object.entries(STATUS_CONFIG).map(([k,v])=><MenuItem key={k} value={k}>{v.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Time Slot</InputLabel>
                <Select value={editForm.timeSlot} label="Time Slot" onChange={e=>setEditForm({...editForm,timeSlot:e.target.value})}>
                  {Object.entries(SLOT_COLORS).map(([k,v])=><MenuItem key={k} value={k}>{v.label} · {v.time}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Note (optional)" value={editForm.note}
                onChange={e=>setEditForm({...editForm,note:e.target.value})}
                placeholder="Koi special note for client..." />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2 }}>
          <Button onClick={()=>setEditSlot(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(toast)} autoHideDuration={3500} onClose={()=>setToast("")} message={toast} />
    </Box>
  );
}
