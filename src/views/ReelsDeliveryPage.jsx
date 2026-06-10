import { useEffect, useState } from "react";
import {
  Box, Typography, Card, Grid, Table, TableBody, TableCell,
  TableHead, TableRow, TableContainer, IconButton, Button,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert, Select, MenuItem, FormControl,
  InputLabel, Tooltip, Chip, Paper
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import HistoryIcon from "@mui/icons-material/History";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import { getReelsDelivery } from "../api/clientsApi";

export default function ReelsDeliveryPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // History Dialog State
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getReelsDelivery();
      setData(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reels delivery data.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenHistory = (client) => {
    setSelectedClient(client);
    setHistoryOpen(true);
  };

  const handleCloseHistory = () => {
    setHistoryOpen(false);
    setSelectedClient(null);
  };

  // Filter and Search logic
  const filteredData = data.filter(client => {
    const matchesSearch = 
      client.businessName?.toLowerCase().includes(search.toLowerCase()) ||
      client.ownerName?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            🎬 Reels Delivery Tracker
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor clients' monthly target, shot, edited, and pending reels with carry-over logic.
          </Typography>
        </Box>
        <Button variant="contained" size="small" onClick={fetchData}>
          Refresh Data
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Filters Bar */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by business or owner name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: "text.secondary", mr: 1, fontSize: 20 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="paused">Paused</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Clients Table */}
      <TableContainer component={Paper} sx={{ border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Table size="medium">
          <TableHead>
            <TableRow sx={{ background: "#f9fafb" }}>
              <TableCell sx={{ fontWeight: 700 }}>Client / Business</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Onboarding Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Current Cycle</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Base Target</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Carry Over</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Total Target</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Shot</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Edited</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Delivered</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Pending (Baki)</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">History</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 6, color: "text.secondary" }}>
                  No clients found.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((client) => {
                const current = client.currentCycle;
                const hasPackage = client.monthlyTarget > 0;
                
                return (
                  <TableRow key={client._id} hover sx={{ "&:hover": { bgcolor: "#f9fafb" } }}>
                    {/* Client Name */}
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {client.businessName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {client.ownerName}
                      </Typography>
                      {client.status === "paused" && (
                        <Chip label="Paused" color="warning" size="small" sx={{ ml: 1, height: 16, fontSize: 10 }} />
                      )}
                    </TableCell>

                    {/* Onboarding Date */}
                    <TableCell sx={{ fontSize: 13 }}>
                      {new Date(client.onboardingDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </TableCell>

                    {/* Current Cycle */}
                    <TableCell sx={{ fontSize: 13 }}>
                      {current ? (
                        <Chip 
                          label={current.label} 
                          variant="outlined" 
                          size="small" 
                          sx={{ fontSize: 11, fontWeight: 500, borderColor: "#e5e7eb" }} 
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">—</Typography>
                      )}
                    </TableCell>

                    {/* Base Target */}
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={600}>
                        {client.monthlyTarget}
                      </Typography>
                    </TableCell>

                    {/* Carry Over */}
                    <TableCell align="center">
                      <Typography 
                        variant="body2" 
                        fontWeight={600} 
                        color={current?.carryOver > 0 ? "warning.main" : "text.secondary"}
                      >
                        {current ? current.carryOver : 0}
                      </Typography>
                    </TableCell>

                    {/* Total Target */}
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={700}>
                        {current ? current.totalTarget : client.monthlyTarget}
                      </Typography>
                    </TableCell>

                    {/* Shot */}
                    <TableCell align="center">
                      <Chip 
                        label={current ? current.shot : 0} 
                        size="small"
                        sx={{ bgcolor: "#ede9fe", color: "#7c3aed", fontWeight: 600, minWidth: 32 }}
                      />
                    </TableCell>

                    {/* Edited */}
                    <TableCell align="center">
                      <Chip 
                        label={current ? current.edited : 0} 
                        size="small"
                        sx={{ bgcolor: "#fef3c7", color: "#d97706", fontWeight: 600, minWidth: 32 }}
                      />
                    </TableCell>

                    {/* Delivered */}
                    <TableCell align="center">
                      <Chip 
                        label={current ? current.delivered : 0} 
                        size="small"
                        sx={{ bgcolor: "#d1fae5", color: "#059669", fontWeight: 600, minWidth: 32 }}
                      />
                    </TableCell>

                    {/* Pending */}
                    <TableCell align="center">
                      {current ? (
                        current.pending <= 0 ? (
                          <Chip 
                            icon={<CheckIcon style={{ color: "#059669", fontSize: 16 }} />} 
                            label="Completed" 
                            size="small" 
                            sx={{ bgcolor: "#d1fae5", color: "#059669", fontWeight: 700 }}
                          />
                        ) : (
                          <Chip 
                            icon={<WarningIcon style={{ color: "#e02424", fontSize: 14 }} />}
                            label={`${current.pending} pending`} 
                            size="small" 
                            sx={{ bgcolor: "#fde8e8", color: "#e02424", fontWeight: 700 }}
                          />
                        )
                      ) : (
                        <Typography variant="caption" color="text.secondary">—</Typography>
                      )}
                    </TableCell>

                    {/* History Action */}
                    <TableCell align="center">
                      <Tooltip title="View Month History">
                        <IconButton 
                          color="primary" 
                          size="small" 
                          onClick={() => handleOpenHistory(client)}
                          disabled={!hasPackage}
                        >
                          <HistoryIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* History Drill-down Dialog */}
      <Dialog 
        open={historyOpen} 
        onClose={handleCloseHistory} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              📈 Reels Delivery History
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedClient?.businessName} ({selectedClient?.ownerName})
            </Typography>
          </Box>
          <IconButton onClick={handleCloseHistory} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          <TableContainer component={Paper} sx={{ border: "1px solid #e5e7eb", borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ background: "#f9fafb" }}>
                  <TableCell sx={{ fontWeight: 700 }}>Month / Cycle Period</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Base Target</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Carry Over</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Total Target</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Shot</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Edited</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Delivered</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Pending (Baki)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedClient?.history && selectedClient.history.length > 0 ? (
                  selectedClient.history.map((cycle, idx) => {
                    const isLast = idx === selectedClient.history.length - 1;
                    return (
                      <TableRow 
                        key={idx} 
                        sx={{ 
                          bgcolor: isLast ? "#e8f0fe" : "inherit",
                          fontWeight: isLast ? 600 : 400
                        }}
                      >
                        <TableCell sx={{ py: 1.5, fontWeight: isLast ? 700 : 500 }}>
                          {cycle.label} {isLast && <Chip label="Current Month" color="primary" size="small" sx={{ height: 16, fontSize: 9, ml: 1, fontWeight: 700 }} />}
                        </TableCell>
                        <TableCell align="center">{cycle.baseTarget}</TableCell>
                        <TableCell align="center" sx={{ color: cycle.carryOver > 0 ? "warning.main" : "text.secondary" }}>
                          {cycle.carryOver}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>{cycle.totalTarget}</TableCell>
                        <TableCell align="center">{cycle.shot}</TableCell>
                        <TableCell align="center">{cycle.edited}</TableCell>
                        <TableCell align="center">{cycle.delivered}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>
                          {cycle.pending <= 0 ? (
                            <span style={{ color: "#059669" }}>Completed</span>
                          ) : (
                            <span style={{ color: "#e02424" }}>{cycle.pending} pending</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      No history found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseHistory} variant="outlined" size="small">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
