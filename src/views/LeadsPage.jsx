import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, FormControl,
  InputLabel, Alert, Snackbar, Tooltip, Grid, InputAdornment,
  Divider, Badge,
} from "@mui/material";
import AddIcon          from "@mui/icons-material/Add";
import SearchIcon       from "@mui/icons-material/Search";
import VisibilityIcon   from "@mui/icons-material/Visibility";
import DeleteIcon       from "@mui/icons-material/Delete";
import WhatsAppIcon     from "@mui/icons-material/WhatsApp";
import NotifIcon        from "@mui/icons-material/NotificationsActive";
import { getLeads, createLead, updateLead, deleteLead, getLeadStats } from "../api/leadsApi";
import { useAuth } from "../context/AuthContext";

const STATUS_OPTIONS = ["new","follow_up","converted","not_interested"];
const STATUS_CONFIG  = {
  new:            { label:"New",            color:"info" },
  follow_up:      { label:"Follow Up",      color:"warning" },
  converted:      { label:"Converted",      color:"success" },
  not_interested: { label:"Not Interested", color:"default" },
};

const SOURCE_OPTIONS = ["instagram","facebook","referral","google","walk_in","cold_call","other"];
const SOURCE_LABELS  = {
  instagram:"Instagram", facebook:"Facebook", referral:"Referral",
  google:"Google", walk_in:"Walk In", cold_call:"Cold Call", other:"Other",
};

const SERVICES = [
  "Social Media Management","SEO","Google Ads","Meta Ads",
  "Content Creation","Personal Branding","Website","Other",
];

const EMPTY_FORM = {
  businessName:"", contactName:"", mobile:"", email:"", city:"",
  industry:"", source:"instagram", status:"new", budget:"",
  interestedServices:[], notes:"", nextFollowUp:"", assignedTo:"",
};

function StatCard({ label, value, color, onClick }) {
  return (
    <Card onClick={onClick} sx={{ cursor: onClick ? "pointer" : "default", "&:hover": onClick ? { boxShadow:3 } : {} }}>
      <Box sx={{ p:2 }}>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="h4" fontWeight={700} sx={{ color }}>{value}</Typography>
      </Box>
    </Card>
  );
}

export default function LeadsPage() {
  const navigate = useNavigate();
  const { canManage, isAdmin } = useAuth();

  const [leads, setLeads]       = useState([]);
  const [stats, setStats]       = useState(null);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(0);

  // Filters
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dueSoon, setDueSoon]         = useState(false);

  // Dialogs
  const [addDialog, setAddDialog]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [formError, setFormError]     = useState("");
  const [toast, setToast]             = useState("");

  const loadStats = () => getLeadStats().then((r) => setStats(r.data));

  const loadLeads = useCallback(() => {
    setLoading(true);
    getLeads({ search, status: statusFilter, dueSoon, page: page + 1, limit: 20 })
      .then((r) => { setLeads(r.data.leads); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [search, statusFilter, dueSoon, page]);

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { loadLeads(); }, [loadLeads]);

  const handleAdd = async () => {
    console.log(form);
    
    if (!form.businessName || !form.contactName || !form.mobile) {
      setFormError("Business name, contact name ane mobile required chhe."); return;
    }
    setFormError("");
    try {
      await createLead(form);
      setAddDialog(false);
      setForm(EMPTY_FORM);
      setToast("Lead added!");
      loadLeads(); loadStats();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed");
    }
  };

  const handleStatusChange = async (id, status) => {
    await updateLead(id, { status });
    loadLeads(); loadStats();
    setToast("Status updated!");
  };

  const handleDelete = async () => {
    await deleteLead(deleteTarget._id);
    setDeleteTarget(null);
    setToast("Lead deleted.");
    loadLeads(); loadStats();
  };

  const openWhatsApp = (mobile, name) => {
    const msg = encodeURIComponent(`Hi ${name}, SocialFlipss team thi baat kari raha hain. Aapko digital marketing services ke baare mein discuss karna tha.`);
    window.open(`https://wa.me/91${mobile.replace(/\D/g,"")}?text=${msg}`, "_blank");
  };

  const toggleService = (svc) => {
    const arr = form.interestedServices;
    setForm({ ...form, interestedServices: arr.includes(svc) ? arr.filter(x => x !== svc) : [...arr, svc] });
  };

  const isOverdue = (lead) => {
    if (!lead.nextFollowUp || !["new","follow_up"].includes(lead.status)) return false;
    return new Date(lead.nextFollowUp) < new Date();
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:3 }}>
        <Box>
          <Typography variant="h5">Lead Management</Typography>
          <Typography variant="body2" color="text.secondary">{total} total leads</Typography>
        </Box>
        {canManage && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm(EMPTY_FORM); setAddDialog(true); }}>
            Add Lead
          </Button>
        )}
      </Box>

      {/* Stats */}
      {stats && (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} sm={3}>
            <StatCard label="Total Leads"    value={stats.total}         color="#1a56db" onClick={() => setStatusFilter("")} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="New"            value={stats.newLeads}      color="#0891b2" onClick={() => setStatusFilter("new")} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="Follow Up"      value={stats.followUp}      color="#ff8800" onClick={() => setStatusFilter("follow_up")} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="Converted"      value={stats.converted}     color="#0e9f6e" onClick={() => setStatusFilter("converted")} />
          </Grid>
        </Grid>
      )}

      {/* Due today alert */}
      {stats?.dueTodayOrOverdue > 0 && (
        <Alert
          severity="warning" sx={{ mb:2, cursor:"pointer" }}
          icon={<NotifIcon />}
          onClick={() => setDueSoon(!dueSoon)}
          action={<Button size="small" color="inherit">{dueSoon ? "Show All" : "Show Due"}</Button>}
        >
          <strong>{stats.dueTodayOrOverdue} follow-up{stats.dueTodayOrOverdue > 1 ? "s" : ""}</strong> due today ya overdue chhe!
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ p:2, mb:2 }}>
        <Box sx={{ display:"flex", gap:2, flexWrap:"wrap" }}>
          <TextField
            size="small" placeholder="Search business, contact, mobile..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            sx={{ flex:1, minWidth:200 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          />
          <FormControl size="small" sx={{ minWidth:150 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
              <MenuItem value="">All Status</MenuItem>
              {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{STATUS_CONFIG[s].label}</MenuItem>)}
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
                {["Business","Contact","Mobile","Source","Budget","Next Follow-up","Status","Actions"].map((h) => (
                  <TableCell key={h} sx={{ fontWeight:600, fontSize:12, color:"text.secondary", py:1.5 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {leads.map((lead) => (
                <TableRow
                  key={lead._id} hover
                  sx={{ background: isOverdue(lead) ? "#fff7ed" : "inherit" }}
                >
                  <TableCell sx={{ fontWeight:500 }}>
                    {isOverdue(lead) && <NotifIcon sx={{ fontSize:14, color:"#ff8800", mr:0.5, verticalAlign:"middle" }} />}
                    {lead.businessName}
                  </TableCell>
                  <TableCell>{lead.contactName}</TableCell>
                  <TableCell sx={{ fontSize:13 }}>{lead.mobile}</TableCell>
                  <TableCell>
                    <Chip label={SOURCE_LABELS[lead.source] || lead.source} size="small" variant="outlined" sx={{ fontSize:11 }} />
                  </TableCell>
                  <TableCell sx={{ fontSize:13, color:"text.secondary" }}>{lead.budget || "—"}</TableCell>
                  <TableCell sx={{ fontSize:12, color: isOverdue(lead) ? "#e02424" : "text.secondary" }}>
                    {lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleDateString("en-IN") : "—"}
                  </TableCell>
                  <TableCell>
                    {canManage ? (
                      <Select
                        size="small" value={lead.status}
                        onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                        sx={{ fontSize:12, "& .MuiSelect-select":{ py:0.5, px:1 } }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <MenuItem key={s} value={s}>
                            <Chip label={STATUS_CONFIG[s].label} color={STATUS_CONFIG[s].color} size="small" />
                          </MenuItem>
                        ))}
                      </Select>
                    ) : (
                      <Chip label={STATUS_CONFIG[lead.status]?.label} color={STATUS_CONFIG[lead.status]?.color} size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => navigate(`/admin/leads/${lead._id}`)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="WhatsApp">
                      <IconButton size="small" color="success" onClick={() => openWhatsApp(lead.mobile, lead.contactName)}>
                        <WhatsAppIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {isAdmin && (
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => setDeleteTarget(lead)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!loading && leads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py:5, color:"text.secondary" }}>
                    Koi lead nathi. "+ Add Lead" click karo.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add Lead Dialog */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Lead</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb:2 }}>{formError}</Alert>}
          <Grid container spacing={2} sx={{ mt:0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Business Name *" value={form.businessName} onChange={(e) => setForm({...form, businessName: e.target.value})} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Contact Person *" value={form.contactName} onChange={(e) => setForm({...form, contactName: e.target.value})} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Mobile *" value={form.mobile} onChange={(e) => setForm({...form, mobile: e.target.value})} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="City" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Industry" value={form.industry} onChange={(e) => setForm({...form, industry: e.target.value})} placeholder="Restaurant, Clinic, Retail..." />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Source</InputLabel>
                <Select value={form.source} label="Source" onChange={(e) => setForm({...form, source: e.target.value})}>
                  {SOURCE_OPTIONS.map((s) => <MenuItem key={s} value={s}>{SOURCE_LABELS[s]}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Budget Range" value={form.budget} onChange={(e) => setForm({...form, budget: e.target.value})} placeholder="₹5k–₹15k/month" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Next Follow-up Date" type="date" value={form.nextFollowUp} onChange={(e) => setForm({...form, nextFollowUp: e.target.value})} InputLabelProps={{ shrink:true }} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" fontWeight={500} mb={1}>Interested Services</Typography>
              <Box sx={{ display:"flex", flexWrap:"wrap", gap:1 }}>
                {SERVICES.map((s) => (
                  <Chip
                    key={s} label={s} size="small"
                    onClick={() => toggleService(s)}
                    color={form.interestedServices.includes(s) ? "primary" : "default"}
                    variant={form.interestedServices.includes(s) ? "filled" : "outlined"}
                    sx={{ cursor:"pointer" }}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Initial Notes" multiline rows={2} value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} placeholder="Pehli vaat thi notes..." />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2 }}>
          <Button onClick={() => setAddDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Add Lead</Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Lead</DialogTitle>
        <DialogContent>
          <Typography><strong>{deleteTarget?.businessName}</strong> ne delete karvu chhe?</Typography>
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
