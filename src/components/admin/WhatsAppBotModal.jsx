import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography,
  Button, TextField, Chip, Alert, CircularProgress, Divider, Grid, IconButton, Tooltip
} from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import RefreshIcon from "@mui/icons-material/Refresh";
import SendIcon from "@mui/icons-material/Send";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import CloseIcon from "@mui/icons-material/Close";
import { getWhatsAppBotStatus, connectWhatsAppBot, disconnectWhatsAppBot, sendTestWhatsAppMessage } from "../../api/whatsappApi";

export default function WhatsAppBotModal({ open, onClose }) {
  const [botStatus, setBotStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testMobile, setTestMobile] = useState("");
  const [testText, setTestText] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  const fetchStatus = useCallback(async () => {
    try {
      const res = await getWhatsAppBotStatus();
      setBotStatus(res.data);
    } catch (err) {
      console.warn("Failed to fetch WhatsApp bot status:", err);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchStatus();
      // Poll every 4 seconds while modal is open to auto-detect QR scan
      const interval = setInterval(fetchStatus, 4000);
      return () => clearInterval(interval);
    }
  }, [open, fetchStatus]);

  const handleConnect = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await connectWhatsAppBot();
      setBotStatus(res.data);
      setToast("Connecting to WhatsApp... Scan the QR code!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to initiate WhatsApp connection");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm("Are you sure you want to disconnect WhatsApp bot?")) return;
    setLoading(true);
    try {
      await disconnectWhatsAppBot();
      setToast("WhatsApp Bot disconnected.");
      fetchStatus();
    } catch (err) {
      setError("Failed to disconnect bot");
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testMobile) {
      setError("Please enter a mobile number");
      return;
    }

    setTestSending(true);
    setError("");
    try {
      const res = await sendTestWhatsAppMessage({
        mobile: testMobile,
        text: testText || undefined
      });

      if (res.data?.success) {
        setToast(`✅ Message sent successfully to ${testMobile}!`);
      } else {
        setError(res.data?.message || "Failed to send message");
        if (res.data?.waLink) {
          window.open(res.data.waLink, "_blank");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error sending test message");
    } finally {
      setTestSending(false);
    }
  };

  const isConnected = botStatus?.status === "connected";
  const isQrReady = botStatus?.status === "qr_ready" && botStatus?.qrCode;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3.5 } }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: "50%", bgcolor: "#25D366",
            display: "flex", alignItems: "center", justifyContent: "center", color: "white"
          }}>
            <WhatsAppIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, fontSize: 17, color: "#0f172a" }}>
              Free WhatsApp Auto-Bot (સાવ ફ્રી ઓટોમેશન)
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
              ₹0 Cost • Open-Source Multi-Device Integration
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Tooltip title="Refresh Status">
            <IconButton size="small" onClick={fetchStatus}>
              <RefreshIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {toast && (
          <Alert severity="success" onClose={() => setToast("")} sx={{ mb: 2, fontWeight: 700, borderRadius: 2 }}>
            {toast}
          </Alert>
        )}
        {error && (
          <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2, fontWeight: 700, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* ── STATUS CARD ── */}
        <Box sx={{
          p: 2.5,
          borderRadius: 3,
          border: isConnected ? "2px solid #86efac" : isQrReady ? "2px solid #fde047" : "1px solid #e2e8f0",
          bgcolor: isConnected ? "#f0fdf4" : isQrReady ? "#fefce8" : "#f8fafc",
          mb: 3
        }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
              {isConnected ? (
                <CheckCircleIcon sx={{ color: "#16a34a", fontSize: 28 }} />
              ) : isQrReady ? (
                <QrCodeScannerIcon sx={{ color: "#ca8a04", fontSize: 28 }} />
              ) : (
                <PowerSettingsNewIcon sx={{ color: "#94a3b8", fontSize: 28 }} />
              )}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "#0f172a" }}>
                  {isConnected
                    ? `🟢 Connected: +${botStatus?.user?.phone || ""}`
                    : isQrReady
                    ? "🟡 Scan QR Code (તમારા ફોનમાંથી સ્કેન કરો)"
                    : "⚪ Disconnected (કનેક્ટ કરો)"}
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                  {isConnected
                    ? "ટાસ્ક સ્ક્રિપ્ટમાંથી શૂટ કે એડિટમાં જતાં જ આ નંબર પરથી ઓટોમેટિક WhatsApp મેસેજ જશે!"
                    : "તમારા ફોનમાં WhatsApp Web ની જેમ આ QR કોડ સ્કેન કરી લિંક કરો."}
                </Typography>
              </Box>
            </Box>

            {isConnected && (
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={handleDisconnect}
                sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2, fontSize: 11 }}
              >
                Disconnect / Logout
              </Button>
            )}
          </Box>
        </Box>

        {/* ── QR CODE DISPLAY IF NOT CONNECTED ── */}
        {!isConnected && (
          <Box sx={{ textAlign: "center", my: 2 }}>
            {isQrReady ? (
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 800, color: "#1e293b", mb: 1.5 }}>
                  📲 નીચેના ૩ સ્ટેપ્સ અનુસરો:
                </Typography>
                <Box sx={{ maxWidth: 380, mx: "auto", textAlign: "left", bgcolor: "#f1f5f9", p: 1.8, borderRadius: 2.5, mb: 2, fontSize: 12, color: "#334155" }}>
                  1. તમારા ફોનમાં <b>WhatsApp</b> ખોલો.<br />
                  2. <b>Settings ➔ Linked Devices (લિંક કરેલ ડિવાઇસ)</b> પર જાઓ.<br />
                  3. <b>Link a Device</b> દબાવી નીચેનો QR કોડ સ્કેન કરો.
                </Box>

                <Box sx={{
                  display: "inline-block", p: 1.5, bgcolor: "white", borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0"
                }}>
                  <img
                    src={botStatus.qrCode}
                    alt="Scan WhatsApp QR"
                    style={{ width: 220, height: 220, display: "block" }}
                  />
                </Box>

                <Typography variant="caption" sx={{ display: "block", color: "#64748b", mt: 1.5, fontWeight: 700 }}>
                  સ્કેન થતાં જ ૨ સેકન્ડમાં આપોઆપ 🟢 Connected થઈ જશે.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ py: 3 }}>
                <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
                  WhatsApp કનેક્ટ કરવા માટે નીચેનું બટન દબાવી QR કોડ જનરેટ કરો:
                </Typography>
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <QrCodeScannerIcon />}
                  onClick={handleConnect}
                  disabled={loading}
                  sx={{
                    bgcolor: "#25D366", "&:hover": { bgcolor: "#1ebc59" },
                    fontWeight: 800, textTransform: "none", borderRadius: 2.5, px: 3, py: 1
                  }}
                >
                  Generate QR Code (QR કોડ લાવો)
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* ── TEST MESSAGE FORM ── */}
        <Divider sx={{ my: 2.5 }}>
          <Chip label="Test Free Message (ચકાસણી માટે મેસેજ મોકલો)" size="small" sx={{ fontSize: 11, fontWeight: 700 }} />
        </Divider>

        <form onSubmit={handleSendTest}>
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Mobile Number"
                placeholder="e.g. 9714475159 or 8000133106"
                value={testMobile}
                onChange={(e) => setTestMobile(e.target.value)}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Custom Message (Optional)"
                placeholder="Hello from SocialFlipss!"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={testSending || !testMobile}
                startIcon={testSending ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                sx={{
                  bgcolor: "#0f172a", "&:hover": { bgcolor: "#1e293b" },
                  fontWeight: 800, textTransform: "none", borderRadius: 2, py: 0.9
                }}
              >
                {testSending ? "Sending..." : "Send Test WhatsApp Message 🚀"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
        <Typography variant="caption" sx={{ color: "#16a34a", fontWeight: 800 }}>
          ✓ 100% Free • No Meta API Fees • No Monthly Charge
        </Typography>

        <Button onClick={onClose} sx={{ fontWeight: 800, textTransform: "none" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
