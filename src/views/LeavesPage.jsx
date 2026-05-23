import { useEffect, useState } from "react";
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Select, FormControl,
  InputLabel, Alert, Snackbar, Tooltip, Grid,
} from "@mui/material";
import AddIcon      from "@mui/icons-material/Add";
import CheckIcon    from "@mui/icons-material/Check";
import CloseIcon    from "@mui/icons-material/Close";
import DeleteIcon   from "@mui/icons-material/Delete";
import { getLeaves, applyLeave, updateLeave, deleteLeave } from "../api/hrApi";
import { getStaff } from "../api/hrApi";

const STATUS_COLOR = { pending:"warning", approved:"success", rejected:"error" };

const EMPTY_FORM = { staffId:"", fromDate:"", toDate:"", leaveType:"full_day", reason:"" };

export default function LeavesPage() {
  const [leaves, setLeaves]   = useState([]);
  const [staff, setStaff]     = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [dialog, setDialog]   = useState(false);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [toast, setToast]     = useState("");
  const [error, setError]     = useState("");

  const loadLeaves = (status = filterStatus) => {
    const params = status ? { status } : {};
    getLeaves(params).then((r) => setLeaves(r.data));
  };

  useEffect(() => {
    getStaff({ status:"active" }).then((r) => setStaff(r.data));
    loadLeaves();
  }, []);

  useEffect(() => { loadLeaves(filterStatus); }, [filterStatus]);

  const handleApply = async () => {
    if (!form.staffId || !form.fromDate || !form.toDate || !form.reason) {
      setError("Badha required fields bharo."); return;
    }
    setError("");
    try {
      await applyLeave(form);
      setDialog(false); setForm(EMPTY_FORM);
      setToast("Leave applied!");
      loadLeaves();
    } catch (err) {
      setError(err.response?.data?.message || "Apply failed.");
    }
  };

  const handleStatus = async (id, status) => {
    await updateLeave(id, { status });
    setToast(`Leave ${status}!`);
    loadLeaves();
  };

  const handleDelete = async (id) => {
    await deleteLeave(id);
    setToast("Deleted.");
    loadLeaves();
  };

  const pending  = leaves.filter((l) => l.status === "pending").length;
  const approved = leaves.filter((l) => l.status === "approved").length;

  return (
    <Box>
      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:3, flexWrap:"wrap", gap:2 }}>
        <Box>
          <Typography variant="h5">Leave Requests</Typography>
          <Typography variant="body2" color="text.secondary">
            {pending} pending · {approved} approved
          </Typography>
        </Box>
        <Box sx={{ display:"flex", gap:1.5 }}>
          <FormControl size="small" sx={{ minWidth:140 }}>
            <InputLabel>Filter</InputLabel>
            <Select value={filterStatus} label="Filter" onChange={(e) => setFilterStatus(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm(EMPTY_FORM); setDialog(true); }}>
            Add Leave
          </Button>
        </Box>
      </Box>

      {/* Summary */}
      <Grid container spacing={2} mb={3}>
        {[
          { label:"Pending",  value: pending,  color:"#ff8800" },
          { label:"Approved", value: approved, color:"#0e9f6e" },
          { label:"Total",    value: leaves.length, color:"#1a56db" },
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
                {["Staff","From","To","Type","Reason","Status","Actions"].map((h) => (
                  <TableCell key={h} sx={{ fontWeight:600, fontSize:12, color:"text.secondary", py:1.5 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {leaves.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py:4, color:"text.secondary" }}>No leave requests.</TableCell></TableRow>
              ) : leaves.map((l) => (
                <TableRow key={l._id} hover>
                  <TableCell sx={{ fontWeight:500 }}>
                    {l.staffId?.name || "—"}
                    <Typography variant="caption" display="block" color="text.secondary">{l.staffId?.position}</Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize:13 }}>{l.fromDate}</TableCell>
                  <TableCell sx={{ fontSize:13 }}>{l.toDate}</TableCell>
                  <TableCell>
                    <Chip label={l.leaveType === "half_day" ? "Half Day" : "Full Day"} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell sx={{ maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:13 }}>
                    {l.reason}
                  </TableCell>
                  <TableCell>
                    <Chip label={l.status.charAt(0).toUpperCase() + l.status.slice(1)} color={STATUS_COLOR[l.status]} size="small" />
                  </TableCell>
                  <TableCell>
                    {l.status === "pending" && (
                      <>
                        <Tooltip title="Approve">
                          <IconButton size="small" color="success" onClick={() => handleStatus(l._id, "approved")}>
                            <CheckIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton size="small" color="error" onClick={() => handleStatus(l._id, "rejected")}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDelete(l._id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Apply Leave Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply Leave</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt:0.5 }}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Staff Member</InputLabel>
                <Select value={form.staffId} label="Staff Member" onChange={(e) => setForm({...form, staffId: e.target.value})}>
                  {staff.map((s) => <MenuItem key={s._id} value={s._id}>{s.name} — {s.position}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="From Date" type="date" InputLabelProps={{ shrink:true }}
                value={form.fromDate} onChange={(e) => setForm({...form, fromDate: e.target.value})} required />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="To Date" type="date" InputLabelProps={{ shrink:true }}
                value={form.toDate} onChange={(e) => setForm({...form, toDate: e.target.value})} required />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Leave Type</InputLabel>
                <Select value={form.leaveType} label="Leave Type" onChange={(e) => setForm({...form, leaveType: e.target.value})}>
                  <MenuItem value="full_day">Full Day</MenuItem>
                  <MenuItem value="half_day">Half Day</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Reason" multiline rows={2} required
                value={form.reason} onChange={(e) => setForm({...form, reason: e.target.value})} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2 }}>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleApply}>Apply Leave</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(toast)} autoHideDuration={3000} onClose={() => setToast("")} message={toast} />
    </Box>
  );
}
