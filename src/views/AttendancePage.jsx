import { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, ToggleButton, ToggleButtonGroup, Button,
  Avatar, Chip, Alert, Snackbar, TextField, CircularProgress,
  Tooltip, Grid,
} from "@mui/material";
import CheckIcon        from "@mui/icons-material/Check";
import CloseIcon        from "@mui/icons-material/Close";
import HalfDayIcon      from "@mui/icons-material/Brightness5";
import BeachAccessIcon  from "@mui/icons-material/BeachAccess";
import EventBusyIcon    from "@mui/icons-material/EventBusy";
import SaveIcon         from "@mui/icons-material/Save";
import { getStaff }           from "../api/hrApi";
import { getAttendance, bulkMarkAttendance } from "../api/hrApi";

const STATUS_CONFIG = {
  present:  { label:"Present",  color:"success", icon:<CheckIcon sx={{ fontSize:14 }} /> },
  absent:   { label:"Absent",   color:"error",   icon:<CloseIcon sx={{ fontSize:14 }} /> },
  half_day: { label:"Half Day", color:"warning",  icon:<HalfDayIcon sx={{ fontSize:14 }} /> },
  leave:    { label:"Leave",    color:"info",     icon:<BeachAccessIcon sx={{ fontSize:14 }} /> },
  holiday:  { label:"Holiday",  color:"secondary",icon:<EventBusyIcon sx={{ fontSize:14 }} /> },
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function AttendancePage() {
  const [date, setDate]         = useState(todayStr());
  const [staff, setStaff]       = useState([]);
  const [marks, setMarks]       = useState({}); // { staffId: status }
  const [notes, setNotes]       = useState({}); // { staffId: note }
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState("");
  const [error, setError]       = useState("");

  // Load staff list
  useEffect(() => {
    getStaff({ status:"active" }).then((r) => setStaff(r.data));
  }, []);

  // Load existing attendance for selected date
  const loadAttendance = useCallback(() => {
    setLoading(true);
    getAttendance({ date }).then((r) => {
      const m = {}, n = {};
      r.data.forEach((rec) => {
        m[rec.staffId._id || rec.staffId] = rec.status;
        n[rec.staffId._id || rec.staffId] = rec.note || "";
      });
      setMarks(m);
      setNotes(n);
    }).finally(() => setLoading(false));
  }, [date]);

  useEffect(() => { loadAttendance(); }, [loadAttendance]);

  const handleMark = (staffId, status) => {
    setMarks((prev) => ({ ...prev, [staffId]: status }));
  };

  // Mark all present at once
  const markAllPresent = () => {
    const m = {};
    staff.forEach((s) => { m[s._id] = "present"; });
    setMarks(m);
  };

  const handleSave = async () => {
    const records = staff.map((s) => ({
      staffId: s._id,
      status:  marks[s._id] || "absent",
      note:    notes[s._id] || "",
    }));
    setSaving(true);
    try {
      await bulkMarkAttendance({ date, records });
      setToast(`Attendance saved for ${date}!`);
    } catch {
      setError("Save failed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  // Summary counts
  const counts = { present:0, absent:0, half_day:0, leave:0, holiday:0 };
  staff.forEach((s) => {
    const st = marks[s._id] || "absent";
    counts[st] = (counts[st] || 0) + 1;
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:3, flexWrap:"wrap", gap:2 }}>
        <Box>
          <Typography variant="h5">Daily Attendance</Typography>
          <Typography variant="body2" color="text.secondary">Admin — date select karo ane attendance mark karo</Typography>
        </Box>
        <Box sx={{ display:"flex", gap:1.5, alignItems:"center" }}>
          <TextField
            type="date" size="small" value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink:true }}
          />
          <Button variant="outlined" size="small" onClick={markAllPresent}>All Present</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={18} color="inherit" /> : "Save"}
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb:2 }} onClose={() => setError("")}>{error}</Alert>}

      {/* Summary chips */}
      <Grid container spacing={1.5} mb={3}>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <Grid item key={key}>
            <Card sx={{ px:2, py:1 }}>
              <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
                <Chip label={counts[key] || 0} color={cfg.color} size="small" />
                <Typography variant="body2">{cfg.label}</Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Attendance table */}
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background:"#f9fafb" }}>
                <TableCell sx={{ fontWeight:600, fontSize:12, color:"text.secondary" }}></TableCell>
                <TableCell sx={{ fontWeight:600, fontSize:12, color:"text.secondary" }}>Staff</TableCell>
                <TableCell sx={{ fontWeight:600, fontSize:12, color:"text.secondary" }}>Position</TableCell>
                <TableCell sx={{ fontWeight:600, fontSize:12, color:"text.secondary" }}>Status</TableCell>
                <TableCell sx={{ fontWeight:600, fontSize:12, color:"text.secondary" }}>Note (optional)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py:4 }}><CircularProgress size={28} /></TableCell></TableRow>
              ) : staff.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py:4, color:"text.secondary" }}>Koi staff nahi. Pehla Staff page par add karo.</TableCell></TableRow>
              ) : staff.map((s) => {
                const currentStatus = marks[s._id] || "";
                const colors = ["#1a56db","#0e9f6e","#8b5cf6","#e02424","#ff8800","#0891b2"];
                const color  = colors[s.name.charCodeAt(0) % colors.length];
                return (
                  <TableRow key={s._id} hover>
                    <TableCell sx={{ width:50 }}>
                      <Avatar sx={{ width:32, height:32, bgcolor: color, fontSize:12, fontWeight:600 }}>
                        {getInitials(s.name)}
                      </Avatar>
                    </TableCell>
                    <TableCell sx={{ fontWeight:500 }}>{s.name}</TableCell>
                    <TableCell sx={{ color:"text.secondary", fontSize:13 }}>{s.position}</TableCell>
                    <TableCell sx={{ minWidth:380 }}>
                      <ToggleButtonGroup
                        exclusive value={currentStatus}
                        onChange={(_, val) => { if (val) handleMark(s._id, val); }}
                        size="small"
                      >
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                          <Tooltip key={key} title={cfg.label}>
                            <ToggleButton
                              value={key}
                              sx={{
                                px:1.5, py:0.5, fontSize:11, fontWeight:600,
                                "&.Mui-selected": {
                                  background:
                                    key === "present"  ? "#dcfce7" :
                                    key === "absent"   ? "#fee2e2" :
                                    key === "half_day" ? "#fef3c7" :
                                    key === "leave"    ? "#dbeafe" : "#f3e8ff",
                                  color:
                                    key === "present"  ? "#166534" :
                                    key === "absent"   ? "#991b1b" :
                                    key === "half_day" ? "#92400e" :
                                    key === "leave"    ? "#1e40af" : "#6b21a8",
                                },
                              }}
                            >
                              {cfg.label}
                            </ToggleButton>
                          </Tooltip>
                        ))}
                      </ToggleButtonGroup>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small" placeholder="Note..."
                        value={notes[s._id] || ""}
                        onChange={(e) => setNotes((p) => ({ ...p, [s._id]: e.target.value }))}
                        sx={{ minWidth:180 }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Snackbar open={Boolean(toast)} autoHideDuration={3000} onClose={() => setToast("")} message={toast} />
    </Box>
  );
}
