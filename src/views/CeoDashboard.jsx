import { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Card, Grid, CircularProgress, Alert, Paper,
  Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
  Chip, List, ListItem, ListItemText, Divider, Button
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import WorkIcon from "@mui/icons-material/Work";
import HourglassIcon from "@mui/icons-material/HourglassEmpty";
import ErrorIcon from "@mui/icons-material/ErrorOutline";
import EventIcon from "@mui/icons-material/EventNote";
import { getClients } from "../api/clientsApi";
import api from "../api";

export default function CeoDashboard() {
  const [clients, setClients] = useState([]);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [cliRes, contRes] = await Promise.all([
        getClients({ limit: 100 }),
        api.get("/content", { params: { type: "reel", limit: 300 } })
      ]);
      setClients(cliRes.data.clients || []);
      setContent(contRes.data.content || []);
    } catch (err) {
      setError("Failed to load CEO dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Operational calculations
  const todayStr = new Date().toISOString().slice(0, 10);
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

  // 1. Active Clients
  const activeClientsList = clients.filter(c => c.status === "active");
  const activeClientsCount = activeClientsList.length;

  // 2. Content in Progress (not in posted or idea stage)
  const inProgressList = content.filter(c => c.stage !== "posted" && c.stage !== "idea");
  const inProgressCount = inProgressList.length;

  // 3. Content Waiting for Approval (stage: client_approval)
  const waitingApprovalList = content.filter(c => c.stage === "client_approval");
  const waitingApprovalCount = waitingApprovalList.length;

  // 4. Delayed Tasks (due date in the past and not posted)
  const delayedList = content.filter(c => {
    if (!c.postDate || c.stage === "posted") return false;
    const dueDate = c.postDate.slice(0, 10);
    return dueDate < todayStr;
  });
  const delayedCount = delayedList.length;

  // 5. Renewals Due (renewal status OR renewalDate in the next 7 days)
  const renewalsList = clients.filter(c => {
    if (c.status === "renewal") return true;
    if (!c.renewalDate) return false;
    const renewalDateObj = new Date(c.renewalDate);
    const now = new Date();
    now.setHours(0,0,0,0);
    return renewalDateObj >= now && renewalDateObj <= sevenDaysLater;
  });
  const renewalsCount = renewalsList.length;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>🏢 CEO Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            SocialFlips OS central control panel. Critical metrics and bottlenecks.
          </Typography>
        </Box>
        <Button variant="outlined" size="small" onClick={loadData}>
          Refresh Dashboard
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderLeft: "4px solid #0e9f6e" }}>
            <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ p: 1, bgcolor: "#d1fae5", color: "#0e9f6e", borderRadius: 1.5, display: "flex" }}>
                <PeopleIcon />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Active Clients</Typography>
                <Typography variant="h5" fontWeight={700}>{activeClientsCount}</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderLeft: "4px solid #7c3aed" }}>
            <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ p: 1, bgcolor: "#ede9fe", color: "#7c3aed", borderRadius: 1.5, display: "flex" }}>
                <WorkIcon />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">In Progress</Typography>
                <Typography variant="h5" fontWeight={700}>{inProgressCount}</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderLeft: "4px solid #3f83f8" }}>
            <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ p: 1, bgcolor: "#e1effe", color: "#3f83f8", borderRadius: 1.5, display: "flex" }}>
                <HourglassIcon />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Waiting Approval</Typography>
                <Typography variant="h5" fontWeight={700}>{waitingApprovalCount}</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderLeft: "4px solid #e02424" }}>
            <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ p: 1, bgcolor: "#fde8e8", color: "#e02424", borderRadius: 1.5, display: "flex" }}>
                <ErrorIcon />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Delayed Tasks</Typography>
                <Typography variant="h5" fontWeight={700}>{delayedCount}</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderLeft: "4px solid #d97706" }}>
            <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ p: 1, bgcolor: "#fef3c7", color: "#d97706", borderRadius: 1.5, display: "flex" }}>
                <EventIcon />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Renewals Due</Typography>
                <Typography variant="h5" fontWeight={700}>{renewalsCount}</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Sections */}
      <Grid container spacing={3}>
        {/* Waiting for Approval Table */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%", border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Box sx={{ p: 2, borderBottom: "1px solid #e5e7eb", bgcolor: "#f9fafb" }}>
              <Typography variant="subtitle1" fontWeight={700}>👤 Reels Waiting for Approval</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Reel Title</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Client</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Owner</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {waitingApprovalList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 3, color: "text.disabled", fontSize: 12 }}>
                        No reels waiting for client approval.
                      </TableCell>
                    </TableRow>
                  ) : (
                    waitingApprovalList.map(item => (
                      <TableRow key={item._id} hover>
                        <TableCell sx={{ fontWeight: 500, py: 1.25 }}>{item.title}</TableCell>
                        <TableCell sx={{ py: 1.25 }}>{item.clientId?.businessName || "—"}</TableCell>
                        <TableCell sx={{ py: 1.25 }}>{item.assignedTo?.name || "—"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* Delayed Tasks Table */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%", border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Box sx={{ p: 2, borderBottom: "1px solid #e5e7eb", bgcolor: "#fde8e8" }}>
              <Typography variant="subtitle1" fontWeight={700} color="error.main">⚠️ Delayed Reels (Overdue)</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Reel Title</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Client</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Stage</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {delayedList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3, color: "text.disabled", fontSize: 12 }}>
                        No delayed tasks. Great job team! 🎉
                      </TableCell>
                    </TableRow>
                  ) : (
                    delayedList.map(item => (
                      <TableRow key={item._id} hover>
                        <TableCell sx={{ fontWeight: 500, py: 1.25 }}>{item.title}</TableCell>
                        <TableCell sx={{ py: 1.25 }}>{item.clientId?.businessName || "—"}</TableCell>
                        <TableCell sx={{ py: 1.25 }} color="error.main">
                          {new Date(item.postDate).toLocaleDateString("en-IN")}
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Chip label={item.stage} size="small" color="error" variant="outlined" sx={{ height: 18, fontSize: 9, fontWeight: 700 }} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* Renewals Due Table */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%", border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Box sx={{ p: 2, borderBottom: "1px solid #e5e7eb", bgcolor: "#fef3c7" }}>
              <Typography variant="subtitle1" fontWeight={700} color="warning.dark">📅 Upcoming Renewals</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Client</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Renewal Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {renewalsList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 3, color: "text.disabled", fontSize: 12 }}>
                        No clients up for renewal in the next 7 days.
                      </TableCell>
                    </TableRow>
                  ) : (
                    renewalsList.map(c => (
                      <TableRow key={c._id} hover>
                        <TableCell sx={{ fontWeight: 500, py: 1.25 }}>{c.businessName}</TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          {c.renewalDate ? new Date(c.renewalDate).toLocaleDateString("en-IN") : "Anniversary Plan"}
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Chip label={c.status} size="small" color="warning" sx={{ height: 18, fontSize: 9, fontWeight: 700 }} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* Active Clients List */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%", border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Box sx={{ p: 2, borderBottom: "1px solid #e5e7eb", bgcolor: "#f9fafb" }}>
              <Typography variant="subtitle1" fontWeight={700}>👥 Active Client Portfolio</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Client Business</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Industry</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Strategic Goal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeClientsList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 3, color: "text.disabled", fontSize: 12 }}>
                        No active clients.
                      </TableCell>
                    </TableRow>
                  ) : (
                    activeClientsList.map(c => (
                      <TableRow key={c._id} hover>
                        <TableCell sx={{ fontWeight: 500, py: 1.25 }}>{c.businessName}</TableCell>
                        <TableCell sx={{ py: 1.25 }}>{c.industry || "—"}</TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Chip label={c.clientGoal || "Authority"} size="small" color="info" sx={{ height: 18, fontSize: 9, fontWeight: 700 }} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
