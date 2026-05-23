import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, Alert, Snackbar, Grid,
  CircularProgress, Divider, Dialog, DialogTitle, DialogContent,
  DialogActions,
} from "@mui/material";
import AutoIcon     from "@mui/icons-material/Autorenew";
import NotifIcon    from "@mui/icons-material/NotificationsActive";
import ReceiptIcon  from "@mui/icons-material/Receipt";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import api from "../../api";

export default function AutoInvoicePage() {
  const navigate = useNavigate();
  const [configs, setConfigs]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [running, setRunning]       = useState(false);
  const [reminding, setReminding]   = useState(false);
  const [toast, setToast]           = useState("");
  const [resultDialog, setResultDialog] = useState(false);
  const [runResult, setRunResult]   = useState(null);
  const [remindResult, setRemindResult] = useState(null);
  const [genResult, setGenResult]   = useState(null);
  const [genLoading, setGenLoading] = useState({});

  const loadConfigs = () => {
    setLoading(true);
    api.get("/auto-invoice/all")
      .then(r => setConfigs(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { loadConfigs(); }, []);

  const closeDialog = () => {
    setResultDialog(false);
    setRunResult(null);
    setRemindResult(null);
    setGenResult(null);
  };

  const openWA = (link) => window.open(link, "_blank");

  const handleRunAuto = async () => {
    setRunning(true);
    try {
      const res = await api.post("/auto-invoice/run-auto");
      setRunResult(res.data);
      setResultDialog(true);
      setToast(`${res.data.results?.filter(r => !r.error).length || 0} invoices generated!`);
      loadConfigs();
    } catch (err) { setToast(err.response?.data?.message || "Run failed."); }
    finally { setRunning(false); }
  };

  const handleReminders = async () => {
    setReminding(true);
    try {
      const res = await api.post("/auto-invoice/send-reminders");
      setRemindResult(res.data);
      setResultDialog(true);
      setToast(res.data.message);
    } catch { setToast("Failed."); }
    finally { setReminding(false); }
  };

  const handleGenerateOne = async (clientId, clientName) => {
    setGenLoading(prev => ({ ...prev, [clientId]: true }));
    try {
      const res = await api.post(`/auto-invoice/generate/${clientId}`);
      setGenResult({ ...res.data, clientName });
      setResultDialog(true);
      setToast(`${clientName} no invoice generated!`);
      loadConfigs();
    } catch (err) { setToast(err.response?.data?.message || "Generate failed."); }
    finally { setGenLoading(prev => ({ ...prev, [clientId]: false })); }
  };

  return (
    <Box>
      <Typography variant="h5" mb={0.5}>Auto Invoice Management</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Client onboarding anniversary par auto invoice + WhatsApp send
      </Typography>

      {/* Action cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p:2.5, height:"100%", border:"1px solid #e5e7eb" }}>
            <Typography variant="h6" mb={1}>🤖 Run Auto Invoice</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Aaj jeni anniversary chhe aena badha clients ne invoice generate karo.
            </Typography>
            <Button fullWidth variant="contained" startIcon={<AutoIcon />}
              onClick={handleRunAuto} disabled={running}>
              {running ? <CircularProgress size={20} color="inherit" /> : "Run Now"}
            </Button>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p:2.5, height:"100%", border:"1px solid #e5e7eb" }}>
            <Typography variant="h6" mb={1}>⚠️ Payment Reminders</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              5/10/15 din thi pending invoices maate WhatsApp reminder moko.
            </Typography>
            <Button fullWidth variant="outlined" color="warning" startIcon={<NotifIcon />}
              onClick={handleReminders} disabled={reminding}>
              {reminding ? <CircularProgress size={20} color="inherit" /> : "Send Reminders"}
            </Button>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p:2.5, height:"100%", border:"1px solid #e5e7eb" }}>
            <Typography variant="h6" mb={1}>📅 Daily Cron Setup</Typography>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Server par daily 9am par auto-run karo.
            </Typography>
            <Box sx={{ bgcolor:"#1e1e1e", borderRadius:1.5, p:1.5, fontFamily:"monospace", fontSize:11, color:"#4ade80", lineHeight:1.8 }}>
              # crontab -e<br/>
              0 9 * * * curl -X POST \<br/>
              :5000/api/auto-invoice/run-auto \<br/>
              -H "Authorization: Bearer TOKEN"
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Clients table */}
      <Card>
        <Box sx={{ p:2.5, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <Typography variant="h6">Configured Clients ({configs.length})</Typography>
        </Box>
        <Divider />
        {loading ? (
          <Box sx={{ display:"flex", justifyContent:"center", py:4 }}><CircularProgress /></Box>
        ) : configs.length === 0 ? (
          <Box sx={{ py:5, textAlign:"center" }}>
            <Typography color="text.secondary">Koi client configured nathi.</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Client detail → "Auto Invoice" tab par configure karo.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ background:"#f9fafb" }}>
                  {["Client","Package","Amount","Bill Day","Last Generated","Status","Actions"].map(h => (
                    <TableCell key={h} sx={{ fontWeight:600, fontSize:12, color:"text.secondary", py:1.5 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {configs.map(c => (
                  <TableRow key={c._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{c.clientId?.businessName || "—"}</Typography>
                      <Typography variant="caption" color="text.secondary">{c.clientId?.ownerName}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize:12 }}>{c.packageName || "—"}</TableCell>
                    <TableCell sx={{ fontWeight:600, color:"#0e9f6e" }}>
                      ₹{Number(c.packageAmount).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Chip label={`${c.dayOfMonth} of month`} size="small" variant="outlined" sx={{ fontSize:11 }} />
                    </TableCell>
                    <TableCell sx={{ fontSize:12, color:"text.secondary" }}>
                      {c.lastGeneratedMonth || "Never"}
                      {c.totalGenerated > 0 && (
                        <Typography variant="caption" display="block" color="text.disabled">
                          Total: {c.totalGenerated}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={c.enabled ? "Active" : "Disabled"} color={c.enabled ? "success" : "default"} size="small" />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display:"flex", gap:0.5 }}>
                        <Button size="small" variant="contained"
                          startIcon={genLoading[c.clientId?._id] ? null : <ReceiptIcon sx={{ fontSize:"13px !important" }} />}
                          onClick={() => handleGenerateOne(c.clientId?._id, c.clientId?.businessName)}
                          disabled={genLoading[c.clientId?._id]}
                          sx={{ fontSize:11 }}>
                          {genLoading[c.clientId?._id] ? <CircularProgress size={14} color="inherit" /> : "Generate"}
                        </Button>
                        <Button size="small" variant="outlined"
                          onClick={() => navigate(`/admin/clients/${c.clientId?._id}`)}
                          sx={{ fontSize:11 }}>
                          Config
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* ── Result Dialog with WhatsApp buttons ── */}
      <Dialog open={resultDialog} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {genResult    ? "✅ Invoice Generated!" :
           runResult    ? "🤖 Auto Run Result"   :
           remindResult ? "📨 Reminders Result"  : "Result"}
        </DialogTitle>
        <DialogContent>
          {/* Single generate result */}
          {genResult && (
            <Box>
              <Alert severity="success" sx={{ mb:2 }}>
                Invoice <strong>{genResult.invoice?.invoiceNumber}</strong> — <strong>{genResult.clientName}</strong>
              </Alert>
              <Box sx={{ background:"#f9fafb", borderRadius:2, p:2, mb:2.5 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Month</Typography>
                    <Typography variant="body1" fontWeight={600}>{genResult.month}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Amount</Typography>
                    <Typography variant="h5" fontWeight={700} color="#1a56db">
                      ₹{Number(genResult.invoice?.totalAmount || 0).toLocaleString("en-IN")}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              {genResult.whatsappLink ? (
                <Button fullWidth variant="contained" color="success" size="large"
                  startIcon={<WhatsAppIcon />}
                  onClick={() => openWA(genResult.whatsappLink)}
                  sx={{ fontWeight:700, py:1.5 }}>
                  Send Invoice on WhatsApp to Client 📲
                </Button>
              ) : (
                <Alert severity="warning">
                  Client no mobile number nathi — WhatsApp unavailable. Client detail ma mobile add karo.
                </Alert>
              )}
            </Box>
          )}

          {/* Run-auto results */}
          {runResult && (
            <Box>
              <Alert severity={runResult.results?.filter(r=>!r.error).length > 0 ? "success" : "info"} sx={{ mb:2 }}>
                {runResult.message}
              </Alert>
              {runResult.results?.length === 0 ? (
                <Typography color="text.secondary" variant="body2">
                  Aaj koi anniversary nathi — koi invoice generate nathi thayo.
                </Typography>
              ) : runResult.results.map((r, i) => (
                <Box key={i} sx={{ mb:2, p:2, border:"1px solid #e5e7eb", borderRadius:2 }}>
                  {r.error ? (
                    <Alert severity="error">Error: {r.error}</Alert>
                  ) : (
                    <>
                      <Box sx={{ display:"flex", justifyContent:"space-between", mb:1 }}>
                        <Typography variant="body2" fontWeight={600}>{r.client}</Typography>
                        <Typography variant="body2" color="#0e9f6e" fontWeight={700}>
                          ₹{Number(r.amount).toLocaleString("en-IN")}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                        {r.invoice}
                      </Typography>
                      {r.whatsappLink ? (
                        <Button size="small" fullWidth variant="contained" color="success"
                          startIcon={<WhatsAppIcon />}
                          onClick={() => openWA(r.whatsappLink)}>
                          Send WhatsApp to {r.client}
                        </Button>
                      ) : (
                        <Typography variant="caption" color="text.secondary">Mobile nathi — WhatsApp unavailable</Typography>
                      )}
                    </>
                  )}
                </Box>
              ))}
            </Box>
          )}

          {/* Reminder results */}
          {remindResult && (
            <Box>
              <Alert severity="info" sx={{ mb:2 }}>{remindResult.message}</Alert>
              {!remindResult.reminderLinks?.length ? (
                <Typography color="text.secondary" variant="body2">Koi reminder due nathi haji.</Typography>
              ) : remindResult.reminderLinks.map((r, i) => (
                <Box key={i} sx={{ mb:1.5, p:2, border:"1px solid #e5e7eb", borderRadius:2 }}>
                  <Box sx={{ display:"flex", justifyContent:"space-between", mb:0.5 }}>
                    <Typography variant="body2" fontWeight={600}>{r.client}</Typography>
                    <Typography variant="body2" color="#e02424" fontWeight={600}>
                      ₹{Number(r.pending).toLocaleString("en-IN")} pending
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>{r.invoice}</Typography>
                  {r.whatsappLink && (
                    <Button size="small" fullWidth variant="contained" color="success"
                      startIcon={<WhatsAppIcon />}
                      onClick={() => openWA(r.whatsappLink)}>
                      Send Payment Reminder on WhatsApp
                    </Button>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2 }}>
          <Button onClick={closeDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(toast)} autoHideDuration={4000} onClose={() => setToast("")} message={toast} />
    </Box>
  );
}
