import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, FormControl,
  InputLabel, Alert, Snackbar, Tooltip, Grid, InputAdornment,
} from "@mui/material";
import AddIcon        from "@mui/icons-material/Add";
import SearchIcon     from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon     from "@mui/icons-material/Delete";
import WhatsAppIcon   from "@mui/icons-material/WhatsApp";
import { getClients, createClient, deleteClient, getClientStats } from "../api/clientsApi";
import { useAuth } from "../context/AuthContext";

const STATUS_CONFIG = {
  onboarding: { label:"Onboarding", color:"info" },
  active:     { label:"Active",     color:"success" },
  paused:     { label:"Paused",     color:"warning" },
  churned:    { label:"Churned",    color:"error" },
};

const INDUSTRIES = ["Healthcare","Retail","Restaurant","Real Estate","Education","Automobile","Fashion","Beauty","Finance","Other"];

const EMPTY = {
  businessName:"", ownerName:"", mobile:"", email:"", city:"",
  industry:"", website:"", instagramPage:"", notes:"",
  package: { name:"", amount:"", deliverables:[] },
};

export default function ClientsPage() {
  const navigate = useNavigate();
  const { canManage, isAdmin } = useAuth();

  const [clients, setClients]   = useState([]);
  const [stats, setStats]       = useState(null);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatus] = useState("");
  const [page, setPage]         = useState(0);
  const [addDialog, setAddDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [formError, setFormError] = useState("");
  const [toast, setToast]       = useState("");

  const loadStats = () => getClientStats().then(r => setStats(r.data));

  const load = useCallback(() => {
    setLoading(true);
    getClients({ search, status: statusFilter, page: page + 1, limit: 20 })
      .then(r => { setClients(r.data.clients); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [search, statusFilter, page]);

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!form.businessName || !form.ownerName || !form.mobile) {
      setFormError("Business name, owner name ane mobile required chhe."); return;
    }
    setFormError("");
    try {
      await createClient(form);
      setAddDialog(false);
      setForm(EMPTY);
      setToast("Client added!");
      load(); loadStats();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed");
    }
  };

  const handleDelete = async () => {
    await deleteClient(deleteTarget._id);
    setDeleteTarget(null);
    setToast("Client deleted.");
    load(); loadStats();
  };

  const openWhatsApp = (mobile, name) => {
    const msg = encodeURIComponent(`Hi ${name}, SocialFlipss team thi update share karna tha.`);
    window.open(`https://wa.me/91${mobile.replace(/\D/g,"")}?text=${msg}`, "_blank");
  };

  const f = (key) => ({
    fullWidth:true, size:"small",
    value: form[key] ?? "",
    onChange: (e) => setForm({...form, [key]: e.target.value}),
  });

  return (
    <Box>
      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:3 }}>
        <Box>
          <Typography variant="h5">Clients</Typography>
          <Typography variant="body2" color="text.secondary">{total} total clients</Typography>
        </Box>
        {canManage && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm(EMPTY); setAddDialog(true); }}>
            Add Client
          </Button>
        )}
      </Box>

      {/* Stats */}
      {stats && (
        <Grid container spacing={2} mb={3}>
          {[
            { label:"Total",      value: stats.total,      color:"#1a56db", filter:"" },
            { label:"Active",     value: stats.active,     color:"#0e9f6e", filter:"active" },
            { label:"Onboarding", value: stats.onboarding, color:"#0891b2", filter:"onboarding" },
            { label:"Paused",     value: stats.paused,     color:"#ff8800", filter:"paused" },
          ].map(c => (
            <Grid item xs={6} sm={3} key={c.label}>
              <Card onClick={() => setStatus(c.filter)} sx={{ cursor:"pointer", "&:hover":{ boxShadow:3 } }}>
                <Box sx={{ p:2 }}>
                  <Typography variant="body2" color="text.secondary">{c.label}</Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ color:c.color }}>{c.value}</Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Filters */}
      <Card sx={{ p:2, mb:2 }}>
        <Box sx={{ display:"flex", gap:2, flexWrap:"wrap" }}>
          <TextField
            size="small" placeholder="Search business, owner, mobile..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            sx={{ flex:1, minWidth:200 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          />
          <FormControl size="small" sx={{ minWidth:150 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
              <MenuItem value="">All Status</MenuItem>
              {Object.entries(STATUS_CONFIG).map(([k,v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background:"#f9fafb" }}>
                {["Business","Owner","Mobile","City","Industry","Package","Status","Onboarded","Actions"].map(h => (
                  <TableCell key={h} sx={{ fontWeight:600, fontSize:12, color:"text.secondary", py:1.5 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map(c => (
                <TableRow key={c._id} hover>
                  <TableCell sx={{ fontWeight:500 }}>{c.businessName}</TableCell>
                  <TableCell>{c.ownerName}</TableCell>
                  <TableCell sx={{ fontSize:12 }}>{c.mobile}</TableCell>
                  <TableCell sx={{ fontSize:12 }}>{c.city || "—"}</TableCell>
                  <TableCell><Chip label={c.industry || "—"} size="small" variant="outlined" sx={{ fontSize:11 }} /></TableCell>
                  <TableCell>
                    {c.package?.name ? (
                      <Box>
                        <Typography variant="caption" fontWeight={600}>{c.package.name}</Typography>
                        {c.package.amount > 0 && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            ₹{Number(c.package.amount).toLocaleString("en-IN")}/mo
                          </Typography>
                        )}
                      </Box>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    <Chip label={STATUS_CONFIG[c.status]?.label} color={STATUS_CONFIG[c.status]?.color} size="small" />
                  </TableCell>
                  <TableCell sx={{ fontSize:12, color:"text.secondary" }}>
                    {new Date(c.onboardingDate || c.createdAt).toLocaleDateString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => navigate(`/admin/clients/${c._id}`)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="WhatsApp">
                      <IconButton size="small" color="success" onClick={() => openWhatsApp(c.mobile, c.ownerName)}>
                        <WhatsAppIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {isAdmin && (
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => setDeleteTarget(c)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!loading && clients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py:5, color:"text.secondary" }}>
                    Koi client nathi.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add Client Dialog */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Client</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb:2 }}>{formError}</Alert>}
          <Grid container spacing={2} sx={{ mt:0.5 }}>
            <Grid item xs={12} sm={6}><TextField {...f("businessName")} label="Business Name *" /></Grid>
            <Grid item xs={12} sm={6}><TextField {...f("ownerName")}   label="Owner Name *" /></Grid>
            <Grid item xs={12} sm={6}><TextField {...f("mobile")}      label="Mobile *" /></Grid>
            <Grid item xs={12} sm={6}><TextField {...f("email")}       label="Email" type="email" /></Grid>
            <Grid item xs={12} sm={6}><TextField {...f("city")}        label="City" /></Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Industry</InputLabel>
                <Select value={form.industry} label="Industry" onChange={(e) => setForm({...form, industry:e.target.value})}>
                  {INDUSTRIES.map(i => <MenuItem key={i} value={i}>{i}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}><TextField {...f("website")}      label="Website" /></Grid>
            <Grid item xs={12} sm={6}><TextField {...f("instagramPage")} label="Instagram Page" /></Grid>

            {/* Package */}
            <Grid item xs={12}><Typography variant="subtitle2" fontWeight={600} mt={1}>Package Details</Typography></Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Package Name" placeholder="Growth Plan, Starter..."
                value={form.package.name} onChange={(e) => setForm({...form, package:{...form.package, name:e.target.value}})} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Monthly Amount (₹)" type="number"
                value={form.package.amount} onChange={(e) => setForm({...form, package:{...form.package, amount:e.target.value}})} />
            </Grid>
            <Grid item xs={12}>
              <TextField {...f("notes")} label="Notes" multiline rows={2} placeholder="Initial notes..." />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2 }}>
          <Button onClick={() => setAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Add Client</Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Client</DialogTitle>
        <DialogContent>
          <Typography><strong>{deleteTarget?.businessName}</strong> ne permanently delete karvu chhe?</Typography>
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
