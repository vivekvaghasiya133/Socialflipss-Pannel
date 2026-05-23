import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, MenuItem, Select,
  FormControl, InputLabel, Alert, Snackbar, Tooltip, Avatar,
} from "@mui/material";
import AddIcon         from "@mui/icons-material/Add";
import EditIcon        from "@mui/icons-material/Edit";
import BlockIcon       from "@mui/icons-material/Block";
import CalendarIcon    from "@mui/icons-material/CalendarMonth";
import LinkIcon        from "@mui/icons-material/Link";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { getStaff, createStaff, updateStaff, deactivateStaff } from "../api/hrApi";

const DEPARTMENTS = ["Content","SEO","Design","Ads / PPC","Personal Branding","Management","Other"];
const EMPTY = { name:"", email:"", mobile:"", position:"", department:"", joiningDate:"", salary:"" };

const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || window.location.origin;

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function AvatarCell({ name }) {
  const colors = ["#1a56db","#0e9f6e","#8b5cf6","#e02424","#ff8800","#0891b2"];
  const color  = colors[name.charCodeAt(0) % colors.length];
  return (
    <Avatar sx={{ width:34, height:34, bgcolor: color, fontSize:13, fontWeight:600 }}>
      {getInitials(name)}
    </Avatar>
  );
}

export default function StaffPage() {
  const navigate = useNavigate();
  const [staff, setStaff]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [dialog, setDialog]     = useState(false);
  const [editTarget, setEdit]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [toast, setToast]       = useState("");
  const [error, setError]       = useState("");
  const [deactivateTarget, setDeactivateTarget] = useState(null);

  const load = () => {
    setLoading(true);
    getStaff().then((r) => setStaff(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openAdd  = () => { setEdit(null); setForm(EMPTY); setDialog(true); };
  const openEdit = (s) => {
    setEdit(s);
    setForm({
      name: s.name, email: s.email || "", mobile: s.mobile || "",
      position: s.position, department: s.department || "",
      joiningDate: s.joiningDate ? s.joiningDate.slice(0,10) : "",
      salary: s.salary,
    });
    setDialog(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.position || !form.salary) {
      setError("Name, Position ane Salary required chhe."); return;
    }
    setError("");
    try {
      if (editTarget) await updateStaff(editTarget._id, form);
      else            await createStaff(form);
      setDialog(false);
      setToast(editTarget ? "Staff updated!" : "Staff added!");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed.");
    }
  };

  const handleDeactivate = async () => {
    await deactivateStaff(deactivateTarget._id);
    setDeactivateTarget(null);
    setToast("Staff deactivated.");
    load();
  };

  const copyLeaveLink = (leaveToken) => {
    const link = `${FRONTEND_URL}/leave-form/${leaveToken}`;
    navigator.clipboard.writeText(link);
    setToast("Leave form link copied! Staff ne WhatsApp karo. 📋");
  };

  const f = (key) => ({
    fullWidth: true, size:"small",
    value: form[key],
    onChange: (e) => setForm({ ...form, [key]: e.target.value }),
  });

  const active      = staff.filter((s) => s.status === "active");
  const inactive    = staff.filter((s) => s.status === "inactive");
  const totalSalary = active.reduce((sum, s) => sum + (s.salary || 0), 0);

  return (
    <Box>
      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:3 }}>
        <Box>
          <Typography variant="h5">Team / Staff</Typography>
          <Typography variant="body2" color="text.secondary">
            {active.length} active · Monthly payroll ₹{totalSalary.toLocaleString("en-IN")}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Staff</Button>
      </Box>

      {/* Summary */}
      <Grid container spacing={2} mb={3}>
        {[
          { label:"Total Staff",     value: active.length,                            color:"#1a56db" },
          { label:"Monthly Payroll", value:`₹${totalSalary.toLocaleString("en-IN")}`, color:"#0e9f6e" },
          { label:"Inactive",        value: inactive.length,                          color:"#9ca3af" },
        ].map((c) => (
          <Grid item xs={12} sm={4} key={c.label}>
            <Card><Box sx={{ p:2 }}>
              <Typography variant="body2" color="text.secondary">{c.label}</Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color:c.color }}>{c.value}</Typography>
            </Box></Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background:"#f9fafb" }}>
                {["","Name","Position","Dept","Mobile","Email","Joining","Salary","Status","Actions"].map((h) => (
                  <TableCell key={h} sx={{ fontWeight:600, fontSize:12, color:"text.secondary", py:1.5 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {staff.map((s) => (
                <TableRow key={s._id} hover sx={{ opacity: s.status === "inactive" ? 0.5 : 1 }}>
                  <TableCell sx={{ width:50 }}><AvatarCell name={s.name} /></TableCell>
                  <TableCell sx={{ fontWeight:500 }}>{s.name}</TableCell>
                  <TableCell>{s.position}</TableCell>
                  <TableCell sx={{ fontSize:12, color:"text.secondary" }}>{s.department || "—"}</TableCell>
                  <TableCell sx={{ fontSize:12 }}>{s.mobile || "—"}</TableCell>
                  <TableCell sx={{ fontSize:12, color:"text.secondary" }}>{s.email || "—"}</TableCell>
                  <TableCell sx={{ fontSize:12 }}>
                    {s.joiningDate ? new Date(s.joiningDate).toLocaleDateString("en-IN") : "—"}
                  </TableCell>
                  <TableCell sx={{ fontWeight:600, color:"#0e9f6e" }}>
                    ₹{Number(s.salary).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={s.status === "active" ? "Active" : "Inactive"}
                      color={s.status === "active" ? "success" : "default"} size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {/* Calendar view */}
                    <Tooltip title="Monthly Calendar View">
                      <IconButton size="small" color="primary" onClick={() => navigate(`/admin/staff/${s._id}/calendar`)}>
                        <CalendarIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {/* Copy leave form link */}
                    {s.status === "active" && s.leaveToken && (
                      <Tooltip title="Leave Form Link Copy Karo (Staff ne moko)">
                        <IconButton size="small" color="secondary" onClick={() => copyLeaveLink(s.leaveToken)}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {/* Edit */}
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(s)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {/* Deactivate */}
                    {s.status === "active" && (
                      <Tooltip title="Deactivate">
                        <IconButton size="small" color="error" onClick={() => setDeactivateTarget(s)}>
                          <BlockIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!loading && staff.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py:4, color:"text.secondary" }}>
                    Koi staff nathi. + Add Staff click karo.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editTarget ? "Edit Staff" : "Add New Staff"}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt:0.5 }}>
            <Grid item xs={12} sm={6}><TextField {...f("name")} label="Full Name" required /></Grid>
            <Grid item xs={12} sm={6}><TextField {...f("position")} label="Position / Role" required placeholder="Social Media Manager" /></Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select value={form.department} label="Department" onChange={(e) => setForm({...form, department: e.target.value})}>
                  {DEPARTMENTS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}><TextField {...f("mobile")} label="Mobile Number" /></Grid>
            <Grid item xs={12} sm={6}><TextField {...f("email")} label="Email (for notifications)" type="email" /></Grid>
            <Grid item xs={12} sm={6}><TextField {...f("joiningDate")} label="Joining Date" type="date" InputLabelProps={{ shrink:true }} /></Grid>
            <Grid item xs={12} sm={6}>
              <TextField {...f("salary")} label="Monthly Salary (₹)" type="number" required />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2 }}>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{editTarget ? "Save Changes" : "Add Staff"}</Button>
        </DialogActions>
      </Dialog>

      {/* Deactivate confirm */}
      <Dialog open={Boolean(deactivateTarget)} onClose={() => setDeactivateTarget(null)}>
        <DialogTitle>Deactivate Staff</DialogTitle>
        <DialogContent>
          <Typography><strong>{deactivateTarget?.name}</strong> ne deactivate karvu chhe?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeactivateTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeactivate}>Deactivate</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(toast)} autoHideDuration={4000} onClose={() => setToast("")} message={toast} />
    </Box>
  );
}
