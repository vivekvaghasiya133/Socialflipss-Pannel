import { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, FormControl,
  InputLabel, Alert, Snackbar, Tooltip, Grid, Tabs, Tab,
} from "@mui/material";
import AddIcon       from "@mui/icons-material/Add";
import CheckIcon     from "@mui/icons-material/CheckCircle";
import DeleteIcon    from "@mui/icons-material/Delete";
import WhatsAppIcon  from "@mui/icons-material/WhatsApp";
import NotifIcon     from "@mui/icons-material/NotificationsActive";
import { getReminders, createReminder, markReminderDone, deleteReminder, getReminderStats } from "../api/analyticsApi";
import { getClients } from "../api/clientsApi";
import { getLeads }   from "../api/leadsApi";
import { useAuth }    from "../context/AuthContext";

const TYPE_CONFIG = {
  follow_up: { label:"Follow Up",  color:"info" },
  payment:   { label:"Payment",    color:"warning" },
  content:   { label:"Content",    color:"secondary" },
  meeting:   { label:"Meeting",    color:"primary" },
  other:     { label:"Other",      color:"default" },
};

const EMPTY = { title:"", description:"", type:"follow_up", dueDate:"", leadId:"", clientId:"", whatsappMessage:"" };

function isOverdue(dueDate) {
  return new Date(dueDate) < new Date();
}

export default function RemindersPage() {
  const { canManage } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [stats, setStats]         = useState(null);
  const [tab, setTab]             = useState(0); // 0=pending, 1=done
  const [clients, setClients]     = useState([]);
  const [leads, setLeads]         = useState([]);
  const [addDialog, setAddDialog] = useState(false);
  const [form, setForm]           = useState(EMPTY);
  const [formError, setFormError] = useState("");
  const [toast, setToast]         = useState("");

  const loadStats = () => getReminderStats().then(r => setStats(r.data));

  const load = useCallback(() => {
    getReminders({ done: tab === 1 })
      .then(r => setReminders(r.data));
  }, [tab]);

  useEffect(() => {
    loadStats();
    getClients({ limit:100 }).then(r => setClients(r.data.clients));
    getLeads({ limit:100 }).then(r => setLeads(r.data.leads));
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!form.title || !form.dueDate) { setFormError("Title ane due date required chhe."); return; }
    setFormError("");
    try {
      await createReminder(form);
      setAddDialog(false); setForm(EMPTY);
      setToast("Reminder added!"); load(); loadStats();
    } catch (err) { setFormError(err.response?.data?.message || "Failed"); }
  };

  const handleDone = async (id) => {
    await markReminderDone(id);
    setToast("Reminder completed! ✓"); load(); loadStats();
  };

  const handleDelete = async (id) => {
    await deleteReminder(id);
    setToast("Deleted."); load(); loadStats();
  };

  const openWhatsApp = (reminder) => {
    const mobile = reminder.clientId?.mobile || reminder.leadId?.mobile;
    const name   = reminder.clientId?.ownerName || reminder.leadId?.contactName || "";
    if (!mobile) { setToast("Mobile number nathi milo."); return; }
    const msg = encodeURIComponent(reminder.whatsappMessage || `Hi ${name}, SocialFlipss team thi yaad dila raha hun.`);
    window.open(`https://wa.me/91${mobile.replace(/\D/g,"")}?text=${msg}`, "_blank");
  };

  const f = (key) => ({ fullWidth:true, size:"small", value:form[key]||"", onChange:(e) => setForm({...form,[key]:e.target.value}) });

  return (
    <Box>
      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:3 }}>
        <Box>
          <Typography variant="h5">Reminders</Typography>
          <Typography variant="body2" color="text.secondary">Follow-ups, payment reminders, meetings</Typography>
        </Box>
        {canManage && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm(EMPTY); setAddDialog(true); }}>
            Add Reminder
          </Button>
        )}
      </Box>

      {/* Stats */}
      {stats && (
        <Grid container spacing={2} mb={3}>
          {[
            { label:"Pending",    value:stats.total,     color:"#1a56db" },
            { label:"Overdue",    value:stats.overdue,   color:"#e02424" },
            { label:"Due Today",  value:stats.dueToday,  color:"#ff8800" },
            { label:"Completed",  value:stats.done,      color:"#0e9f6e" },
          ].map(c => (
            <Grid item xs={6} sm={3} key={c.label}>
              <Card><Box sx={{ p:2 }}>
                <Typography variant="body2" color="text.secondary">{c.label}</Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color:c.color }}>{c.value}</Typography>
              </Box></Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Overdue alert */}
      {stats?.overdue > 0 && tab === 0 && (
        <Alert severity="error" sx={{ mb:2 }} icon={<NotifIcon />}>
          <strong>{stats.overdue} reminder{stats.overdue>1?"s":""}</strong> overdue chhe — turant action lo!
        </Alert>
      )}

      {/* Tabs */}
      <Card>
        <Tabs value={tab} onChange={(_,v) => setTab(v)} sx={{ px:2, borderBottom:"1px solid #f3f4f6" }}>
          <Tab label={`Pending (${stats?.total||0})`} />
          <Tab label={`Done (${stats?.done||0})`} />
        </Tabs>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background:"#f9fafb" }}>
                {["Title","Type","Due Date","Client / Lead","Actions"].map(h => (
                  <TableCell key={h} sx={{ fontWeight:600, fontSize:12, color:"text.secondary", py:1.5 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {reminders.map(r => {
                const overdue = !r.done && isOverdue(r.dueDate);
                return (
                  <TableRow key={r._id} hover sx={{ background: overdue ? "#fff7ed" : "inherit" }}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500} sx={{ color: overdue ? "#e02424" : "inherit" }}>
                          {overdue && <NotifIcon sx={{ fontSize:12, mr:0.5, verticalAlign:"middle" }} />}
                          {r.title}
                        </Typography>
                        {r.description && (
                          <Typography variant="caption" color="text.secondary">{r.description}</Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={TYPE_CONFIG[r.type]?.label} color={TYPE_CONFIG[r.type]?.color} size="small" />
                    </TableCell>
                    <TableCell sx={{ fontSize:12, color: overdue ? "#e02424" : "text.secondary", fontWeight: overdue ? 700 : 400 }}>
                      {new Date(r.dueDate).toLocaleDateString("en-IN")}
                      {overdue && " ⚠️"}
                    </TableCell>
                    <TableCell sx={{ fontSize:12 }}>
                      {r.clientId?.businessName && <Chip label={r.clientId.businessName} size="small" variant="outlined" sx={{ mr:0.5, fontSize:11 }} />}
                      {r.leadId?.businessName   && <Chip label={r.leadId.businessName}   size="small" variant="outlined" sx={{ fontSize:11 }} />}
                      {!r.clientId && !r.leadId && "—"}
                    </TableCell>
                    <TableCell>
                      {/* WhatsApp */}
                      {(r.clientId?.mobile || r.leadId?.mobile) && (
                        <Tooltip title="Send WhatsApp">
                          <IconButton size="small" color="success" onClick={() => openWhatsApp(r)}>
                            <WhatsAppIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {/* Mark done */}
                      {!r.done && canManage && (
                        <Tooltip title="Mark Done">
                          <IconButton size="small" color="success" onClick={() => handleDone(r._id)}>
                            <CheckIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {/* Delete */}
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(r._id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {reminders.length === 0 && (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py:5, color:"text.secondary" }}>
                  {tab === 0 ? "Koi pending reminder nathi. 🎉" : "Koi completed reminder nathi."}
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add Dialog */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Reminder</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb:2 }}>{formError}</Alert>}
          <Grid container spacing={2} sx={{ mt:0.5 }}>
            <Grid item xs={12}><TextField {...f("title")} label="Title *" placeholder="Follow up with client / Payment due..." /></Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select value={form.type} label="Type" onChange={e => setForm({...form,type:e.target.value})}>
                  {Object.entries(TYPE_CONFIG).map(([k,v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}><TextField {...f("dueDate")} label="Due Date *" type="date" InputLabelProps={{ shrink:true }} /></Grid>
            <Grid item xs={12}><TextField {...f("description")} label="Description" multiline rows={2} /></Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Link to Client (optional)</InputLabel>
                <Select value={form.clientId} label="Link to Client (optional)" onChange={e => setForm({...form,clientId:e.target.value})}>
                  <MenuItem value="">None</MenuItem>
                  {clients.map(c => <MenuItem key={c._id} value={c._id}>{c.businessName}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Link to Lead (optional)</InputLabel>
                <Select value={form.leadId} label="Link to Lead (optional)" onChange={e => setForm({...form,leadId:e.target.value})}>
                  <MenuItem value="">None</MenuItem>
                  {leads.map(l => <MenuItem key={l._id} value={l._id}>{l.businessName}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField {...f("whatsappMessage")} label="WhatsApp Message Template" multiline rows={2}
                placeholder="Hi {name}, SocialFlipss thi payment reminder hai..." />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2 }}>
          <Button onClick={() => setAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Add Reminder</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(toast)} autoHideDuration={3000} onClose={() => setToast("")} message={toast} />
    </Box>
  );
}
