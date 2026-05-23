import { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, FormControl,
  InputLabel, Alert, Snackbar, Tooltip, Grid, Avatar,
} from "@mui/material";
import AddIcon    from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import VideoIcon  from "@mui/icons-material/VideoLibrary";
import { getWorkLogs, createWorkLog, deleteWorkLog, getWorkLogStats } from "../api/analyticsApi";
import { getClients }  from "../api/clientsApi";
import { getProjects } from "../api/projectsApi";
import { getUsers }    from "../api/leadsApi";
import { useAuth }     from "../context/AuthContext";

const WORK_TYPES = [
  { value:"video_editing",    label:"Video Editing" },
  { value:"shooting",         label:"Shooting" },
  { value:"designing",        label:"Designing" },
  { value:"content_writing",  label:"Content Writing" },
  { value:"seo",              label:"SEO" },
  { value:"ads",              label:"Ads / PPC" },
  { value:"meeting",          label:"Meeting" },
  { value:"other",            label:"Other" },
];

const TYPE_COLOR = {
  video_editing:"#8b5cf6", shooting:"#e02424", designing:"#0891b2",
  content_writing:"#0e9f6e", seo:"#f59e0b", ads:"#1a56db",
  meeting:"#6b7280", other:"#9ca3af",
};

function monthOptions() {
  const opts = [];
  const now  = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    opts.push({
      value: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`,
      label: d.toLocaleString("en-IN", { month:"long", year:"numeric" }),
    });
  }
  return opts;
}

const EMPTY = {
  date: new Date().toISOString().slice(0,10),
  workType: "video_editing", description:"",
  videosCreated:0, postsDesigned:0, hoursWorked:0,
  clientId:"", projectId:"", userId:"",
};

export default function WorkLogsPage() {
  const { user, canManage, isAdmin } = useAuth();
  const [logs, setLogs]     = useState([]);
  const [stats, setStats]   = useState(null);
  const [month, setMonth]   = useState(monthOptions()[0].value);
  const [clients, setClients]   = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers]       = useState([]);
  const [addDialog, setAddDialog] = useState(false);
  const [form, setForm]     = useState(EMPTY);
  const [formError, setFormError] = useState("");
  const [toast, setToast]   = useState("");

  const loadStats = () => getWorkLogStats({ month }).then(r => setStats(r.data));

  const load = useCallback(() => {
    getWorkLogs({ month }).then(r => setLogs(r.data));
  }, [month]);

  useEffect(() => {
    getClients({ limit:100 }).then(r => setClients(r.data.clients));
    getProjects({ limit:100 }).then(r => setProjects(r.data.projects));
    if (isAdmin || canManage) getUsers().then(r => setUsers(r.data));
  }, []);
  useEffect(() => { load(); loadStats(); }, [load, month]);

  const handleAdd = async () => {
    if (!form.description || !form.date) { setFormError("Date ane description required chhe."); return; }
    setFormError("");
    try {
      const payload = { ...form, userId: form.userId || user._id };
      await createWorkLog(payload);
      setAddDialog(false); setForm({ ...EMPTY, date: new Date().toISOString().slice(0,10) });
      setToast("Work log added!"); load(); loadStats();
    } catch (err) { setFormError(err.response?.data?.message || "Failed"); }
  };

  const handleDelete = async (id) => {
    await deleteWorkLog(id);
    setToast("Deleted."); load(); loadStats();
  };

  const f = (key) => ({ fullWidth:true, size:"small", value:form[key]||"", onChange:(e) => setForm({...form,[key]:e.target.value}) });
  const monthOpts = monthOptions();

  return (
    <Box>
      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:3 }}>
        <Box>
          <Typography variant="h5">Work Logs</Typography>
          <Typography variant="body2" color="text.secondary">Daily team productivity tracking</Typography>
        </Box>
        <Box sx={{ display:"flex", gap:1.5, alignItems:"center" }}>
          <select value={month} onChange={e => setMonth(e.target.value)}
            style={{ padding:"8px 12px", borderRadius:8, border:"1px solid #d1d5db", fontSize:14, fontFamily:"inherit", background:"#fff", cursor:"pointer" }}>
            {monthOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm({ ...EMPTY, date: new Date().toISOString().slice(0,10) }); setAddDialog(true); }}>
            Add Log
          </Button>
        </Box>
      </Box>

      {/* Stats */}
      {stats && (
        <Grid container spacing={2} mb={3}>
          {[
            { label:"Total Videos",    value:stats.totalVideos,  color:"#8b5cf6", icon:"🎬" },
            { label:"Posts Designed",  value:stats.totalPosts,   color:"#0891b2", icon:"🎨" },
            { label:"Hours Worked",    value:stats.totalHours,   color:"#0e9f6e", icon:"⏱️" },
            { label:"Work Entries",    value:stats.totalLogs,    color:"#1a56db", icon:"📝" },
          ].map(c => (
            <Grid item xs={6} sm={3} key={c.label}>
              <Card><Box sx={{ p:2 }}>
                <Typography variant="body2" color="text.secondary">{c.icon} {c.label}</Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color:c.color }}>{c.value}</Typography>
              </Box></Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Logs table */}
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background:"#f9fafb" }}>
                {["Date","Team Member","Work Type","Description","Videos","Posts","Hours","Client","Actions"].map(h => (
                  <TableCell key={h} sx={{ fontWeight:600, fontSize:12, color:"text.secondary", py:1.5 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map(log => (
                <TableRow key={log._id} hover>
                  <TableCell sx={{ fontSize:12 }}>{new Date(log.date+"T00:00:00").toLocaleDateString("en-IN")}</TableCell>
                  <TableCell>
                    <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
                      <Avatar sx={{ width:24, height:24, fontSize:10, bgcolor:"#1a56db" }}>
                        {log.userId?.name?.[0]}
                      </Avatar>
                      <Typography variant="caption">{log.userId?.name || "—"}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={WORK_TYPES.find(t=>t.value===log.workType)?.label || log.workType}
                      size="small"
                      sx={{ fontSize:10, bgcolor:TYPE_COLOR[log.workType]+"18", color:TYPE_COLOR[log.workType], fontWeight:600 }}
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth:200, fontSize:12 }}>
                    <Typography variant="caption" sx={{ overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                      {log.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {log.videosCreated > 0
                      ? <Chip label={`🎬 ${log.videosCreated}`} size="small" sx={{ fontSize:11 }} />
                      : <Typography variant="caption" color="text.secondary">—</Typography>}
                  </TableCell>
                  <TableCell>
                    {log.postsDesigned > 0
                      ? <Chip label={`🎨 ${log.postsDesigned}`} size="small" sx={{ fontSize:11 }} />
                      : <Typography variant="caption" color="text.secondary">—</Typography>}
                  </TableCell>
                  <TableCell sx={{ fontSize:12 }}>{log.hoursWorked > 0 ? `${log.hoursWorked}h` : "—"}</TableCell>
                  <TableCell sx={{ fontSize:12, color:"text.secondary" }}>{log.clientId?.businessName || "—"}</TableCell>
                  <TableCell>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(log._id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow><TableCell colSpan={9} align="center" sx={{ py:5, color:"text.secondary" }}>
                  Aa month ma koi work log nathi.
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add Dialog */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Work Log</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb:2 }}>{formError}</Alert>}
          <Grid container spacing={2} sx={{ mt:0.5 }}>
            <Grid item xs={6}><TextField {...f("date")} label="Date *" type="date" InputLabelProps={{ shrink:true }} /></Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Work Type</InputLabel>
                <Select value={form.workType} label="Work Type" onChange={e => setForm({...form,workType:e.target.value})}>
                  {WORK_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            {(isAdmin || canManage) && (
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Team Member</InputLabel>
                  <Select value={form.userId} label="Team Member" onChange={e => setForm({...form,userId:e.target.value})}>
                    <MenuItem value="">Myself ({user?.name})</MenuItem>
                    {users.filter(u => u._id !== user?._id).map(u => <MenuItem key={u._id} value={u._id}>{u.name} ({u.role})</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField {...f("description")} label="Work Description *" multiline rows={2} placeholder="Aaj shu kaam karyu — video edit, reel banaya, client meeting..." />
            </Grid>
            <Grid item xs={4}><TextField {...f("videosCreated")} label="Videos Made" type="number" /></Grid>
            <Grid item xs={4}><TextField {...f("postsDesigned")} label="Posts Made" type="number" /></Grid>
            <Grid item xs={4}><TextField {...f("hoursWorked")}   label="Hours Worked" type="number" /></Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Client (optional)</InputLabel>
                <Select value={form.clientId} label="Client (optional)" onChange={e => setForm({...form,clientId:e.target.value})}>
                  <MenuItem value="">None</MenuItem>
                  {clients.map(c => <MenuItem key={c._id} value={c._id}>{c.businessName}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Project (optional)</InputLabel>
                <Select value={form.projectId} label="Project (optional)" onChange={e => setForm({...form,projectId:e.target.value})}>
                  <MenuItem value="">None</MenuItem>
                  {projects.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2 }}>
          <Button onClick={() => setAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Add Log</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(toast)} autoHideDuration={3000} onClose={() => setToast("")} message={toast} />
    </Box>
  );
}
