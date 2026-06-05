import { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent, Grid, Button, Divider,
  TextField, Select, MenuItem, FormControl, InputLabel, Alert,
  Snackbar, CircularProgress, IconButton, Table, TableBody,
  TableCell, TableHead, TableRow, TableContainer, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, Paper
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from "@mui/icons-material/Lock";
import KeyIcon from "@mui/icons-material/VpnKey";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/CheckCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import RefreshIcon from "@mui/icons-material/Refresh";

import {
  getHisabStats,
  getHisabPasswordStatus,
  verifyHisabPassword,
  setHisabPassword,
  createHisabTransaction,
  deleteHisabTransaction
} from "../api/hisabApi";

export default function HisabPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ people: [], transactions: [] });
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  // Password Protection State
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [pwError, setPwError] = useState("");

  // Setup / Change Password State
  const [showPwDialog, setShowPwDialog] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: "", password: "", confirmPassword: "" });

  // Draw/Settle Dialog State
  const [txDialog, setTxDialog] = useState(false);
  const [txForm, setTxForm] = useState({ type: "draw", person: "vivek", customPerson: "", amount: "", note: "", date: new Date().toISOString().slice(0, 10) });
  const [txError, setTxError] = useState("");
  const [savingTx, setSavingTx] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getHisabStats();
      setStats(res.data);
    } catch (err) {
      setError("Failed to load stats.");
    } finally {
      setLoading(false);
    }
  };

  const checkPasswordStatus = async () => {
    try {
      const res = await getHisabPasswordStatus();
      setIsPasswordSet(res.data.isSet);
    } catch (err) {
      setError("Failed to check password status.");
    }
  };

  useEffect(() => {
    checkPasswordStatus();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    setPwError("");
    try {
      const res = await verifyHisabPassword(passwordInput);
      if (res.data.success) {
        setIsAuthenticated(true);
        setToast("Access Granted");
      }
    } catch (err) {
      setPwError(err.response?.data?.message || "Incorrect password");
    }
  };

  const handleSetupPassword = async (e) => {
    e.preventDefault();
    setPwError("");
    if (pwForm.password !== pwForm.confirmPassword) {
      setPwError("Passwords do not match");
      return;
    }
    try {
      await setHisabPassword({ password: pwForm.password });
      setIsPasswordSet(true);
      setIsAuthenticated(true);
      setToast("Password set successfully! Access granted.");
    } catch (err) {
      setPwError(err.response?.data?.message || "Failed to set password");
    }
  };

  const handleChangePassword = async () => {
    setPwError("");
    if (pwForm.password !== pwForm.confirmPassword) {
      setPwError("Passwords do not match");
      return;
    }
    try {
      await setHisabPassword({
        currentPassword: pwForm.currentPassword,
        password: pwForm.password
      });
      setShowPwDialog(false);
      setPwForm({ currentPassword: "", password: "", confirmPassword: "" });
      setToast("Password changed successfully! ✓");
    } catch (err) {
      setPwError(err.response?.data?.message || "Failed to change password");
    }
  };

  const handleCreateTransaction = async () => {
    setTxError("");
    const targetPerson = txForm.person === "other" ? txForm.customPerson : txForm.person;
    if (!targetPerson?.trim()) {
      setTxError("Person name is required.");
      return;
    }
    if (!txForm.amount || Number(txForm.amount) <= 0) {
      setTxError("Valid amount is required.");
      return;
    }

    setSavingTx(true);
    try {
      await createHisabTransaction({
        type: txForm.type,
        person: targetPerson,
        amount: Number(txForm.amount),
        date: txForm.date,
        note: txForm.note
      });
      setTxDialog(false);
      setTxForm({ type: "draw", person: "vivek", customPerson: "", amount: "", note: "", date: new Date().toISOString().slice(0, 10) });
      setToast("Transaction logged! ✅");
      loadData();
    } catch (err) {
      setTxError(err.response?.data?.message || "Save failed.");
    } finally {
      setSavingTx(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm("Are you sure you want to delete this log entry?")) return;
    try {
      await deleteHisabTransaction(id);
      setToast("Transaction log deleted.");
      loadData();
    } catch (err) {
      setToast("Delete failed.");
    }
  };

  // Lock screen / Setup screen
  if (!isAuthenticated) {
    return (
      <Box sx={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
        <Paper elevation={4} sx={{ width: "100%", maxWidth: 400, p: 4, borderRadius: 3, textAlign: "center", background: "#ffffff" }}>
          <Box sx={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(109, 40, 217, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
            <LockIcon sx={{ fontSize: 32, color: "#6d28d9" }} />
          </Box>

          {!isPasswordSet ? (
            // Setup Screen
            <form onSubmit={handleSetupPassword}>
              <Typography variant="h5" fontWeight={700} gutterBottom>Set Access Password</Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Set a security password to protect the Hisab & Settlements dashboard. This is a one-time setup.
              </Typography>
              {pwError && <Alert severity="error" sx={{ mb: 2 }}>{pwError}</Alert>}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" type="password" label="New Password *" required
                    value={pwForm.password} onChange={e => setPwForm({ ...pwForm, password: e.target.value })} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" type="password" label="Confirm Password *" required
                    value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} />
                </Grid>
                <Grid item xs={12} sx={{ mt: 1 }}>
                  <Button fullWidth variant="contained" type="submit" color="primary" sx={{ background: "linear-gradient(135deg, #6d28d9, #7e22ce)" }}>
                    Setup Password & Unlock
                  </Button>
                </Grid>
              </Grid>
            </form>
          ) : (
            // Unlock Screen
            <form onSubmit={handleVerifyPassword}>
              <Typography variant="h5" fontWeight={700} gutterBottom>Hisab Dashboard locked</Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Please enter your settlement access password to view balances and transactions.
              </Typography>
              {pwError && <Alert severity="error" sx={{ mb: 2 }}>{pwError}</Alert>}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" type="password" label="Password" required autoFocus
                    value={passwordInput} onChange={e => setPasswordInput(e.target.value)} />
                </Grid>
                <Grid item xs={12} sx={{ mt: 1 }}>
                  <Button fullWidth variant="contained" type="submit" color="primary" sx={{ background: "linear-gradient(135deg, #6d28d9, #7e22ce)" }}>
                    Unlock Dashboard
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 5 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Hisab / Settlements Ledger</Typography>
          <Typography variant="body2" color="text.secondary">Manage payment collections, partner drawings, and settles</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={loadData}>
            Refresh
          </Button>
          <Button variant="outlined" size="small" color="secondary" startIcon={<SettingsIcon />} onClick={() => { setPwError(""); setShowPwDialog(true); }}>
            Password Settings
          </Button>
          <Button variant="contained" size="small" startIcon={<AddIcon />} sx={{ background: "linear-gradient(135deg, #6d28d9, #7e22ce)" }}
            onClick={() => { setTxError(""); setTxDialog(true); }}>
            New Draw / Settle
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}><CircularProgress /></Box>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} mb={4}>
            {stats.people.map(p => (
              <Grid item xs={12} sm={6} md={4} key={p.person}>
                <Card sx={{ borderLeft: `5px solid ${p.balance > 0 ? "#10b981" : p.balance < 0 ? "#ef4444" : "#6b7280"}` }}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                        {p.person}
                      </Typography>
                      <Chip label={`Collected: ₹${p.totalCollected.toLocaleString("en-IN")}`} size="small" variant="outlined" />
                    </Box>
                    <Typography variant="h4" fontWeight={700} sx={{ color: p.balance > 0 ? "#10b981" : p.balance < 0 ? "#ef4444" : "inherit" }}>
                      ₹{p.balance.toLocaleString("en-IN")}
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1.5, fontSize: 12, color: "text.secondary" }}>
                      <span>Draws: ₹{p.totalWithdrawn.toLocaleString("en-IN")}</span>
                      <span>Settled: ₹{p.totalSettled.toLocaleString("en-IN")}</span>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {stats.people.length === 0 && (
              <Grid item xs={12}>
                <Alert severity="info">No payments or transaction history available to display.</Alert>
              </Grid>
            )}
          </Grid>

          {/* Detailed collections tables per person */}
          <Typography variant="h6" fontWeight={700} mb={2}>Collection Details By Recipient</Typography>
          <Grid container spacing={3} mb={4}>
            {stats.people.map(p => (
              <Grid item xs={12} md={6} key={p.person + "_details"}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={700} color="primary" mb={1.5}>
                      {p.person}'s Cash/UPI Ledger
                    </Typography>
                    <Table size="small">
                      <TableHead sx={{ background: "#f9fafb" }}>
                        <TableRow>
                          <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>Payment Method</TableCell>
                          <TableCell sx={{ fontSize: 12, fontWeight: 600, textAlign: "right" }}>Collected Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(p.collected).map(([method, amount]) => (
                          <TableRow key={method} hover>
                            <TableCell sx={{ textTransform: "uppercase", fontSize: 12 }}>{method}</TableCell>
                            <TableCell sx={{ textAlign: "right", fontWeight: 600, fontSize: 12 }}>
                              ₹{amount.toLocaleString("en-IN")}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow sx={{ background: "#f8fafc" }}>
                          <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Total Collections</TableCell>
                          <TableCell sx={{ textAlign: "right", fontWeight: 700, fontSize: 12, color: "primary.main" }}>
                            ₹{p.totalCollected.toLocaleString("en-IN")}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontSize: 12, color: "text.secondary" }}>Total Draws (Withdrawals)</TableCell>
                          <TableCell sx={{ textAlign: "right", fontSize: 12, color: "#ef4444", fontWeight: 600 }}>
                            - ₹{p.totalWithdrawn.toLocaleString("en-IN")}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontSize: 12, color: "text.secondary" }}>Total Settled / Cleared</TableCell>
                          <TableCell sx={{ textAlign: "right", fontSize: 12, color: "#6b7280", fontWeight: 600 }}>
                            - ₹{p.totalSettled.toLocaleString("en-IN")}
                          </TableCell>
                        </TableRow>
                        <TableRow sx={{ background: "#f0fdf4" }}>
                          <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Net Cash Remaining</TableCell>
                          <TableCell sx={{ textAlign: "right", fontWeight: 700, fontSize: 13, color: p.balance > 0 ? "#10b981" : "inherit" }}>
                            ₹{p.balance.toLocaleString("en-IN")}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Transactions Log */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Date-Wise Settlement & Draw History</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ background: "#f9fafb" }}>
                    <TableRow>
                      {["Date", "Person", "Type", "Amount", "Note", "Action"].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 600, fontSize: 12 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.transactions.map(t => (
                      <TableRow key={t._id} hover>
                        <TableCell sx={{ fontSize: 12 }}>
                          {new Date(t.date).toLocaleDateString("en-IN")}
                        </TableCell>
                        <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>
                          {t.person}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={t.type === "draw" ? "DRAW / WITHDRAWAL" : "SETTLEMENT / CLEAR"}
                            color={t.type === "draw" ? "error" : "success"}
                            size="small"
                            sx={{ fontSize: 10, fontWeight: 700 }}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: t.type === "draw" ? "#e02424" : "#0e9f6e", fontSize: 12 }}>
                          ₹{t.amount.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell sx={{ fontSize: 12 }}>{t.note || "—"}</TableCell>
                        <TableCell>
                          <IconButton size="small" color="error" onClick={() => handleDeleteTransaction(t._id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {stats.transactions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                          No transactions recorded yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* Draw / Settle Popup Dialog */}
      <Dialog open={txDialog} onClose={() => setTxDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Log Transaction (Draw / Settle)</DialogTitle>
        <DialogContent>
          {txError && <Alert severity="error" sx={{ mb: 2 }}>{txError}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Transaction Type</InputLabel>
                <Select value={txForm.type} label="Transaction Type"
                  onChange={e => setTxForm({ ...txForm, type: e.target.value })}>
                  <MenuItem value="draw">DRAW (Partner Withdraws Cash)</MenuItem>
                  <MenuItem value="settle">SETTLE (Clear / Reset Balance)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Person</InputLabel>
                <Select value={txForm.person} label="Person"
                  onChange={e => setTxForm({ ...txForm, person: e.target.value })}>
                  <MenuItem value="vivek">Vivek</MenuItem>
                  <MenuItem value="kuldeep">Kuldeep</MenuItem>
                  <MenuItem value="other">Other Name</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {txForm.person === "other" && (
              <Grid item xs={12}>
                <TextField fullWidth size="small" label="Name *" required
                  value={txForm.customPerson} onChange={e => setTxForm({ ...txForm, customPerson: e.target.value })} />
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField fullWidth size="small" type="number" label="Amount (₹) *" required
                value={txForm.amount} onChange={e => setTxForm({ ...txForm, amount: e.target.value })} />
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth size="small" type="date" label="Date" InputLabelProps={{ shrink: true }}
                value={txForm.date} onChange={e => setTxForm({ ...txForm, date: e.target.value })} />
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Note (optional)" multiline rows={2}
                value={txForm.note} onChange={e => setTxForm({ ...txForm, note: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setTxDialog(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleCreateTransaction} disabled={savingTx}>
            {savingTx ? "Saving..." : "Log Transaction"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Settings Settings Dialog */}
      <Dialog open={showPwDialog} onClose={() => setShowPwDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Change Access Password</DialogTitle>
        <DialogContent>
          {pwError && <Alert severity="error" sx={{ mb: 2 }}>{pwError}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth size="small" type="password" label="Current Password *" required
                value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" type="password" label="New Password *" required
                value={pwForm.password} onChange={e => setPwForm({ ...pwForm, password: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" type="password" label="Confirm New Password *" required
                value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowPwDialog(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={handleChangePassword}>
            Update Password
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(toast)} autoHideDuration={3000} onClose={() => setToast("")} message={toast} />
    </Box>
  );
}
