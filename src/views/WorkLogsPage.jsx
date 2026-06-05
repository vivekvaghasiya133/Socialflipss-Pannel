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
  items: [{ name: "", videosCreated: 0, videosEdited: 0 }],
  userId:"",
};

export default function WorkLogsPage() {
  const { user, canManage, isAdmin } = useAuth();
  const [logs, setLogs]     = useState([]);
  const [stats, setStats]   = useState(null);
  const [month, setMonth]   = useState(monthOptions()[0].value);
  const [userFilter, setUserFilter] = useState("");
  const [clients, setClients]   = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers]       = useState([]);
  const [addDialog, setAddDialog] = useState(false);
  const [form, setForm]     = useState(EMPTY);
  const [formError, setFormError] = useState("");
  const [toast, setToast]   = useState("");

  const loadStats = useCallback(() => {
    getWorkLogStats({ month, userId: userFilter }).then(r => setStats(r.data));
  }, [month, userFilter]);

  const load = useCallback(() => {
    getWorkLogs({ month, userId: userFilter }).then(r => setLogs(r.data));
  }, [month, userFilter]);

  useEffect(() => {
    getClients({ limit:100 }).then(r => setClients(r.data.clients));
    getProjects({ limit:100 }).then(r => setProjects(r.data.projects));
    if (isAdmin || canManage) getUsers().then(r => setUsers(r.data));
  }, [isAdmin, canManage]);
  useEffect(() => { load(); loadStats(); }, [load, loadStats]);

  const handleAddItem = () => {
    setForm({
      ...form,
      items: [...form.items, { name: "", videosCreated: 0, videosEdited: 0 }]
    });
  };

  const handleRemoveItem = (index) => {
    const updated = form.items.filter((_, idx) => idx !== index);
    setForm({ ...form, items: updated });
  };

  const handleItemChange = (index, field, val) => {
    const updated = form.items.map((item, idx) => {
      if (idx === index) return { ...item, [field]: val };
      return item;
    });
    setForm({ ...form, items: updated });
  };

  const handleAdd = async () => {
    if (!form.description || !form.date) { setFormError("Date ane description required chhe."); return; }
    const hasEmptyName = form.items.some(item => !item.name.trim());
    if (hasEmptyName) { setFormError("Darek item ma Name / Client lakhvo jaruri chhe."); return; }

    setFormError("");
    try {
      const payload = { ...form, userId: form.userId || user._id };
      await createWorkLog(payload);
      setAddDialog(false); 
      setForm({ ...EMPTY, date: new Date().toISOString().slice(0,10) });
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
          {(isAdmin || canManage) && (
            <select value={userFilter} onChange={e => setUserFilter(e.target.value)}
              style={{ padding:"8px 12px", borderRadius:8, border:"1px solid #d1d5db", fontSize:14, fontFamily:"inherit", background:"#fff", cursor:"pointer" }}>
              <option value="">All Team Members</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          )}
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
            { label:"Videos Edited",   value:stats.totalVideosEdited || 0, color:"#ff8800", icon:"✍️" },
            { label:"Posts Designed",  value:stats.totalPosts,   color:"#0891b2", icon:"🎨" },
            { label:"Hours Worked",    value:stats.totalHours,   color:"#0e9f6e", icon:"⏱️" },
            { label:"Work Entries",    value:stats.totalLogs,    color:"#1a56db", icon:"📝" },
          ].map(c => (
            <Grid item xs={6} sm={4} md={2.4} key={c.label}>
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
                {["Date","Team Member","Work Type","Description","Work Items / Outputs","Actions"].map(h => (
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
                    <Box sx={{ display:"flex", flexWrap:"wrap", gap:0.5 }}>
                      {log.items && log.items.length > 0 ? (
                        log.items.map((item, idx) => (
                          <Chip
                            key={idx}
                            label={`${item.name}: 🎬 ${item.videosCreated || 0} / ✍️ ${item.videosEdited || 0}`}
                            size="small"
                            sx={{ fontSize: 10, bgcolor: "rgba(0, 0, 0, 0.04)" }}
                          />
                        ))
                      ) : (
                        <>
                          {log.videosCreated > 0 || log.videosEdited > 0 ? (
                            <Chip label={`🎬 ${log.videosCreated || 0} / ✍️ ${log.videosEdited || 0}`} size="small" sx={{ fontSize: 10 }} />
                          ) : null}
                          {log.postsDesigned > 0 ? (
                            <Chip label={`🎨 ${log.postsDesigned}`} size="small" sx={{ fontSize: 10 }} />
                          ) : null}
                          {log.hoursWorked > 0 ? (
                            <Chip label={`⏱️ ${log.hoursWorked}h`} size="small" sx={{ fontSize: 10 }} />
                          ) : null}
                          {log.clientId?.businessName ? (
                            <Chip label={`Client: ${log.clientId.businessName}`} size="small" sx={{ fontSize: 10 }} />
                          ) : null}
                          {!log.videosCreated && !log.videosEdited && !log.postsDesigned && !log.hoursWorked && !log.clientId && (
                            <Typography variant="caption" color="text.secondary">—</Typography>
                          )}
                        </>
                      )}
                    </Box>
                  </TableCell>
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
                <TableRow><TableCell colSpan={6} align="center" sx={{ py:5, color:"text.secondary" }}>
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
            {/* Dynamic Items List */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, mt: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Work Items (Clients / Videos)</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={handleAddItem} variant="outlined">
                  Add Item
                </Button>
              </Box>
              {form.items?.map((item, idx) => (
                <Grid container spacing={1} alignItems="center" key={idx} sx={{ mb: 1 }}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Client / Video Name *"
                      placeholder="e.g. Vivek / Client A"
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={2.5}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Videos Made"
                      type="number"
                      value={item.videosCreated || ""}
                      onChange={(e) => handleItemChange(idx, "videosCreated", parseInt(e.target.value) || 0)}
                    />
                  </Grid>
                  <Grid item xs={2.5}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Videos Edited"
                      type="number"
                      value={item.videosEdited || ""}
                      onChange={(e) => handleItemChange(idx, "videosEdited", parseInt(e.target.value) || 0)}
                    />
                  </Grid>
                  <Grid item xs={1} sx={{ textAlign: "center" }}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={form.items.length <= 1}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
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
