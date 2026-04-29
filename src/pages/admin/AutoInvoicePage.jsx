import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, Alert, Snackbar, Grid,
  CircularProgress, Divider,
} from "@mui/material";
import AutoIcon    from "@mui/icons-material/Autorenew";
import NotifIcon   from "@mui/icons-material/NotificationsActive";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { runAutoInvoices, sendPaymentReminders } from "../../api/portalApi";
import api from "../../api";

export default function AutoInvoicePage() {
  const navigate    = useNavigate();
  const [configs, setConfigs]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [running, setRunning]     = useState(false);
  const [reminding, setReminding] = useState(false);
  const [toast, setToast]         = useState("");
  const [result, setResult]       = useState(null);

  useEffect(() => {
    api.get("/auto-invoice/all").then(r => setConfigs(r.data||[])).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const handleRunAuto = async () => {
    setRunning(true); setResult(null);
    try {
      const res = await runAutoInvoices();
      setResult(res.data);
      setToast(`✅ ${res.data.results?.filter(r=>!r.error).length||0} invoices generated!`);
    } catch (err) {
      setToast(err.response?.data?.message || "Run failed.");
    } finally { setRunning(false); }
  };

  const handleReminders = async () => {
    setReminding(true);
    try {
      const res = await sendPaymentReminders();
      setToast(res.data.message);
    } catch { setToast("Reminder send failed."); }
    finally { setReminding(false); }
  };

  return (
    <Box>
      <Typography variant="h5" mb={0.5}>Auto Invoice Management</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Automatically generate invoices on client onboarding anniversary date
      </Typography>

      {/* Action cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p:2.5, border:"1px solid #e5e7eb" }}>
            <Typography variant="h6" mb={0.5}>🤖 Run Auto Invoice</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Aaj jeni onboarding anniversary chhe aena badha clients maate automatically invoice generate karo.
            </Typography>
            <Button fullWidth variant="contained" startIcon={<AutoIcon/>}
              onClick={handleRunAuto} disabled={running}>
              {running ? <CircularProgress size={20} color="inherit"/> : "Run Now"}
            </Button>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p:2.5, border:"1px solid #e5e7eb" }}>
            <Typography variant="h6" mb={0.5}>⚠️ Send Payment Reminders</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              5, 10, 15 din thi pending invoices maate automatic email reminders moko.
            </Typography>
            <Button fullWidth variant="outlined" color="warning" startIcon={<NotifIcon/>}
              onClick={handleReminders} disabled={reminding}>
              {reminding ? <CircularProgress size={20} color="inherit"/> : "Send Reminders"}
            </Button>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p:2.5, border:"1px solid #e5e7eb" }}>
            <Typography variant="h6" mb={0.5}>📅 Daily Cron Setup</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Server par daily ek vaar aa API call karo — auto invoice + reminders banne chalshhe.
            </Typography>
            <Box sx={{ bgcolor:"#1e1e1e", borderRadius:1.5, p:1.5, fontFamily:"monospace", fontSize:11, color:"#4ade80" }}>
              # crontab -e<br/>
              0 9 * * * curl -X POST<br/>
              https://socialflipss-backend.onrender.com/api/<br/>
              auto-invoice/run-auto<br/>
              -H "Authorization: Bearer TOKEN"
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Run result */}
      {result && (
        <Alert severity="success" sx={{ mb:2 }} onClose={()=>setResult(null)}>
          <Typography variant="body2" fontWeight={600}>{result.message}</Typography>
          {result.results?.map((r,i)=>(
            <Typography key={i} variant="caption" display="block">
              {r.error ? `❌ Error: ${r.error}` : `✅ ${r.client} — ${r.invoice} — ₹${r.amount?.toLocaleString("en-IN")}`}
            </Typography>
          ))}
        </Alert>
      )}

      {/* Config list */}
      <Card>
        <Box sx={{ p:2.5, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <Typography variant="h6">Configured Clients ({configs.length})</Typography>
        </Box>
        <Divider/>
        {loading ? (
          <Box sx={{ display:"flex", justifyContent:"center", py:4 }}><CircularProgress/></Box>
        ) : configs.length === 0 ? (
          <Box sx={{ py:5, textAlign:"center" }}>
            <Typography color="text.secondary">Koi client configured nathi yet.</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>Client detail page par jaaine "Auto Invoice" tab configure karo.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ background:"#f9fafb" }}>
                  {["Client","Package","Amount","Day","Last Generated","Status","Action"].map(h=>(
                    <TableCell key={h} sx={{ fontWeight:600, fontSize:12, color:"text.secondary", py:1.5 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {configs.map(c=>(
                  <TableRow key={c._id} hover>
                    <TableCell sx={{ fontWeight:500 }}>{c.clientId?.businessName||"—"}</TableCell>
                    <TableCell sx={{ fontSize:12 }}>{c.packageName||"—"}</TableCell>
                    <TableCell sx={{ fontWeight:600, color:"#0e9f6e" }}>₹{Number(c.packageAmount).toLocaleString("en-IN")}</TableCell>
                    <TableCell sx={{ fontSize:12 }}>{c.dayOfMonth} of every month</TableCell>
                    <TableCell sx={{ fontSize:12, color:"text.secondary" }}>{c.lastGeneratedMonth||"Never"}</TableCell>
                    <TableCell>
                      <Chip label={c.enabled?"Active":"Disabled"} color={c.enabled?"success":"default"} size="small"/>
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" startIcon={<ReceiptIcon/>}
                        onClick={()=>navigate(`/admin/clients/${c.clientId?._id}?tab=2`)}>
                        Configure
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Snackbar open={Boolean(toast)} autoHideDuration={4000} onClose={()=>setToast("")} message={toast}/>
    </Box>
  );
}
