import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Card, Grid, Chip, IconButton, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Select,
  MenuItem, FormControl, InputLabel, Alert, Snackbar, Tooltip,
  LinearProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow,
} from "@mui/material";
import AddIcon        from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon     from "@mui/icons-material/Delete";
import FolderIcon     from "@mui/icons-material/Folder";
import { getProjects, createProject, deleteProject, getProjectStats } from "../api/projectsApi";
import { getClients } from "../api/clientsApi";
import { useAuth } from "../context/AuthContext";

const STATUS_CONFIG = {
  planning:  { label:"Planning",   color:"info" },
  active:    { label:"Active",     color:"success" },
  completed: { label:"Completed",  color:"secondary" },
  on_hold:   { label:"On Hold",    color:"warning" },
};

const MONTHS_OPTS = () => {
  const opts = [];
  const now  = new Date();
  for (let i = -1; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    opts.push({
      value: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`,
      label: d.toLocaleString("en-IN", { month:"long", year:"numeric" }),
    });
  }
  return opts;
};

const EMPTY = { clientId:"", name:"", month:"", description:"", monthlyGoal:"", startDate:"", endDate:"", status:"planning", notes:"" };

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { canManage, isAdmin } = useAuth();

  const [projects, setProjects] = useState([]);
  const [stats, setStats]       = useState(null);
  const [clients, setClients]   = useState([]);
  const [total, setTotal]       = useState(0);
  const [statusFilter, setStatus] = useState("");
  const [addDialog, setAddDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [formError, setFormError] = useState("");
  const [toast, setToast]       = useState("");

  const loadStats = () => getProjectStats().then(r => setStats(r.data));

  const load = useCallback(() => {
    getProjects({ status: statusFilter })
      .then(r => { setProjects(r.data.projects); setTotal(r.data.total); });
  }, [statusFilter]);

  useEffect(() => {
    loadStats();
    getClients({ limit:100 }).then(r => setClients(r.data.clients));
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!form.clientId || !form.name) { setFormError("Client ane project name required chhe."); return; }
    setFormError("");
    try {
      await createProject(form);
      setAddDialog(false); setForm(EMPTY);
      setToast("Project created!"); load(); loadStats();
    } catch (err) { setFormError(err.response?.data?.message || "Failed"); }
  };

  const handleDelete = async () => {
    await deleteProject(deleteTarget._id);
    setDeleteTarget(null); setToast("Project deleted."); load(); loadStats();
  };

  const f = (key) => ({ fullWidth:true, size:"small", value:form[key]||"", onChange:(e) => setForm({...form,[key]:e.target.value}) });

  return (
    <Box>
      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:3 }}>
        <Box>
          <Typography variant="h5">Projects</Typography>
          <Typography variant="body2" color="text.secondary">{total} total projects</Typography>
        </Box>
        {canManage && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm(EMPTY); setAddDialog(true); }}>
            New Project
          </Button>
        )}
      </Box>

      {/* Stats */}
      {stats && (
        <Grid container spacing={2} mb={3}>
          {[
            { label:"Total",     value:stats.total,     color:"#1a56db", f:"" },
            { label:"Active",    value:stats.active,    color:"#0e9f6e", f:"active" },
            { label:"Planning",  value:stats.planning,  color:"#0891b2", f:"planning" },
            { label:"Completed", value:stats.completed, color:"#8b5cf6", f:"completed" },
          ].map(c => (
            <Grid item xs={6} sm={3} key={c.label}>
              <Card onClick={() => setStatus(c.f)} sx={{ cursor:"pointer", "&:hover":{ boxShadow:3 } }}>
                <Box sx={{ p:2 }}>
                  <Typography variant="body2" color="text.secondary">{c.label}</Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ color:c.color }}>{c.value}</Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Filter */}
      <Card sx={{ p:2, mb:2 }}>
        <FormControl size="small" sx={{ minWidth:160 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={e => setStatus(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {Object.entries(STATUS_CONFIG).map(([k,v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
          </Select>
        </FormControl>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background:"#f9fafb" }}>
                {["Project","Client","Month","Content Progress","Status","Dates","Actions"].map(h => (
                  <TableCell key={h} sx={{ fontWeight:600, fontSize:12, color:"text.secondary", py:1.5 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map(p => {
                const total   = p.contentStats?.total  || 0;
                const posted  = p.contentStats?.posted || 0;
                const pct     = total > 0 ? Math.round((posted / total) * 100) : 0;
                return (
                  <TableRow key={p._id} hover>
                    <TableCell>
                      <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
                        <FolderIcon sx={{ fontSize:16, color:"#1a56db" }} />
                        <Typography variant="body2" fontWeight={500}>{p.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize:13 }}>{p.clientId?.businessName || "—"}</TableCell>
                    <TableCell sx={{ fontSize:12, color:"text.secondary" }}>
                      {p.month ? new Date(p.month + "-01").toLocaleString("en-IN",{month:"short",year:"numeric"}) : "—"}
                    </TableCell>
                    <TableCell sx={{ minWidth:140 }}>
                      <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
                        <LinearProgress variant="determinate" value={pct} sx={{ flex:1, height:6, borderRadius:3, bgcolor:"#e5e7eb", "& .MuiLinearProgress-bar":{ bgcolor: pct===100?"#0e9f6e":"#1a56db" } }} />
                        <Typography variant="caption" color="text.secondary">{posted}/{total}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={STATUS_CONFIG[p.status]?.label} color={STATUS_CONFIG[p.status]?.color} size="small" />
                    </TableCell>
                    <TableCell sx={{ fontSize:11, color:"text.secondary" }}>
                      {p.startDate ? new Date(p.startDate).toLocaleDateString("en-IN") : "—"}{" "}
                      {p.endDate   ? `→ ${new Date(p.endDate).toLocaleDateString("en-IN")}` : ""}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View / Kanban">
                        <IconButton size="small" onClick={() => navigate(`/admin/projects/${p._id}`)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {isAdmin && (
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => setDeleteTarget(p)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {projects.length === 0 && (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py:5, color:"text.secondary" }}>Koi project nathi. "+ New Project" click karo.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add Dialog */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Project</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb:2 }}>{formError}</Alert>}
          <Grid container spacing={2} sx={{ mt:0.5 }}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Client *</InputLabel>
                <Select value={form.clientId} label="Client *" onChange={e => setForm({...form,clientId:e.target.value})}>
                  {clients.map(c => <MenuItem key={c._id} value={c._id}>{c.businessName}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={8}><TextField {...f("name")} label="Project Name *" placeholder="April 2026 Content Plan" /></Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Month</InputLabel>
                <Select value={form.month} label="Month" onChange={e => setForm({...form,month:e.target.value})}>
                  {MONTHS_OPTS().map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}><TextField {...f("monthlyGoal")} label="Monthly Goal" placeholder="20 reels, 12 posts..." /></Grid>
            <Grid item xs={12} sm={6}><TextField {...f("startDate")} label="Start Date" type="date" InputLabelProps={{ shrink:true }} /></Grid>
            <Grid item xs={12} sm={6}><TextField {...f("endDate")}   label="End Date"   type="date" InputLabelProps={{ shrink:true }} /></Grid>
            <Grid item xs={12}><TextField {...f("notes")} label="Notes" multiline rows={2} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2 }}>
          <Button onClick={() => setAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Create Project</Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <Typography><strong>{deleteTarget?.name}</strong> ane eni badhi content permanently delete thashe.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(toast)} autoHideDuration={3000} onClose={() => setToast("")} message={toast} />
    </Box>
  );
}
