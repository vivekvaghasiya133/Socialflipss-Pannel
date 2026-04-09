import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Box, Card, CardContent, Typography, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, Alert,
  CircularProgress, Divider, Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function StaffLeaveForm() {
  const { token } = useParams();
  const [staff, setStaff]   = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [form, setForm] = useState({
    fromDate: "", toDate: "", leaveType: "full_day", reason: "",
  });

  useEffect(() => {
    axios.get(`${API}/leaves/staff-form/${token}`)
      .then((r) => setStaff(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async () => {
    if (!form.fromDate || !form.toDate || !form.reason) {
      setError("Badha fields bharva jaruri chhe."); return;
    }
    if (form.toDate < form.fromDate) {
      setError("'To Date' 'From Date' pachhi hovi joiye."); return;
    }
    setSaving(true); setError("");
    try {
      await axios.post(`${API}/leaves/staff-form/${token}`, form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Submit failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <Box sx={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f4f6fb" }}>
      <CircularProgress />
    </Box>
  );

  if (notFound) return (
    <Box sx={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f4f6fb", p:2 }}>
      <Card sx={{ maxWidth:420, width:"100%", textAlign:"center" }}>
        <CardContent sx={{ p:4 }}>
          <Typography variant="h6" color="error" mb={1}>Invalid Link</Typography>
          <Typography variant="body2" color="text.secondary">
            Aa link invalid chhe ya expire thayi gayi chhe. Admin ne contact karo.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );

  if (submitted) return (
    <Box sx={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f4f6fb", p:2 }}>
      <Card sx={{ maxWidth:440, width:"100%", textAlign:"center" }}>
        <CardContent sx={{ p:5 }}>
          <CheckCircleIcon sx={{ fontSize:64, color:"#0e9f6e", mb:2 }} />
          <Typography variant="h5" fontWeight={700} mb={1}>Leave Request Submit Thayo!</Typography>
          <Typography variant="body2" color="text.secondary" lineHeight={1.8}>
            Tamari leave request admin ne meli gayi chhe.<br />
            Approve ya reject thayaa pachhi tamne email aavshhe. 📧
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Box sx={{ minHeight:"100vh", background:"#f4f6fb", py:4, px:2 }}>
      {/* Header */}
      <Box sx={{ maxWidth:560, mx:"auto", mb:3, display:"flex", alignItems:"center", gap:1.5 }}>
        <Box sx={{ width:40, height:40, borderRadius:"50%", background:"#1a56db", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:14 }}>SF</Box>
        <Box>
          <Typography variant="h6" lineHeight={1}>SocialFlipss</Typography>
          <Typography variant="caption" color="text.secondary">Leave Request Form</Typography>
        </Box>
      </Box>

      <Card sx={{ maxWidth:560, mx:"auto" }}>
        <CardContent sx={{ p:{ xs:2.5, sm:4 } }}>
          {/* Staff info */}
          <Box sx={{ display:"flex", alignItems:"center", gap:2, mb:3, p:2, background:"#f0f4ff", borderRadius:2 }}>
            <Box sx={{ width:44, height:44, borderRadius:"50%", background:"#1a56db", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:16, flexShrink:0 }}>
              {staff.name?.[0]?.toUpperCase()}
            </Box>
            <Box>
              <Typography fontWeight={600}>{staff.name}</Typography>
              <Typography variant="body2" color="text.secondary">{staff.position}</Typography>
            </Box>
            <Chip icon={<BeachAccessIcon />} label="Leave Request" size="small" color="primary" sx={{ ml:"auto" }} />
          </Box>

          <Divider sx={{ mb:3 }} />

          {error && <Alert severity="error" sx={{ mb:2 }} onClose={() => setError("")}>{error}</Alert>}

          {/* From - To dates */}
          <Box sx={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:2, mb:2.5 }}>
            <Box>
              <Typography variant="body2" fontWeight={500} mb={0.75}>
                From Date <span style={{ color:"#e02424" }}>*</span>
              </Typography>
              <TextField
                fullWidth size="small" type="date"
                InputLabelProps={{ shrink:true }}
                value={form.fromDate}
                onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                inputProps={{ min: new Date().toISOString().slice(0,10) }}
              />
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={500} mb={0.75}>
                To Date <span style={{ color:"#e02424" }}>*</span>
              </Typography>
              <TextField
                fullWidth size="small" type="date"
                InputLabelProps={{ shrink:true }}
                value={form.toDate}
                onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                inputProps={{ min: form.fromDate || new Date().toISOString().slice(0,10) }}
              />
            </Box>
          </Box>

          {/* Leave type */}
          <Box mb={2.5}>
            <Typography variant="body2" fontWeight={500} mb={0.75}>Leave Type</Typography>
            <FormControl fullWidth size="small">
              <Select value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })}>
                <MenuItem value="full_day">Full Day</MenuItem>
                <MenuItem value="half_day">Half Day</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Reason */}
          <Box mb={3}>
            <Typography variant="body2" fontWeight={500} mb={0.75}>
              Reason <span style={{ color:"#e02424" }}>*</span>
            </Typography>
            <TextField
              fullWidth multiline rows={4}
              placeholder="Leave nu karan lakhho — personal work, sick, family, etc..."
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </Box>

          <Button
            fullWidth variant="contained" size="large"
            onClick={handleSubmit} disabled={saving}
          >
            {saving ? <CircularProgress size={22} color="inherit" /> : "Submit Leave Request"}
          </Button>

          <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1.5}>
            Submit thaya pachhi admin ne notification jaashhe. Email par response aavshhe.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
