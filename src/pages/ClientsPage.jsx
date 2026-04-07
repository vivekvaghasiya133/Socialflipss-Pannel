import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Chip, IconButton, TextField,
  Select, MenuItem, FormControl, InputLabel, InputAdornment,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Tooltip, CircularProgress,
} from "@mui/material";
import SearchIcon  from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon  from "@mui/icons-material/Delete";
import { getClients, deleteClient, updateClient } from "../api";

const STATUS_OPTIONS = ["new","in_progress","active","paused","completed"];
const STATUS_COLORS  = { new:"warning", in_progress:"info", active:"success", paused:"default", completed:"secondary" };
const STATUS_LABELS  = { new:"New", in_progress:"In Progress", active:"Active", paused:"Paused", completed:"Completed" };

const INDUSTRY_LABELS = {
  healthcare:"Healthcare", retail:"Retail", restaurant:"Restaurant",
  realestate:"Real Estate", education:"Education", automobile:"Automobile",
  fashion:"Fashion", beauty:"Beauty", finance:"Finance", other:"Other",
};

export default function ClientsPage() {
  const navigate = useNavigate();
  const [data, setData]         = useState({ clients:[], total:0, pages:1 });
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage]         = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getClients({
        search, status: statusFilter, page: page + 1, limit: 15,
      });
      setData(res.data);
    } catch {
      setError("Clients load thaya nahi.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const handleDelete = async () => {
    try {
      await deleteClient(deleteTarget._id);
      setDeleteTarget(null);
      fetchClients();
    } catch {
      setError("Delete failed.");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateClient(id, { status: newStatus });
      fetchClients();
    } catch {
      setError("Status update failed.");
    }
  };

  return (
    <Box>
      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:3 }}>
        <Box>
          <Typography variant="h5">All Clients</Typography>
          <Typography variant="body2" color="text.secondary">
            Total {data.total} clients
          </Typography>
        </Box>
        <Button variant="contained" href="/onboard" target="_blank">
          + Share Onboarding Form
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb:2 }} onClose={() => setError("")}>{error}</Alert>}

      {/* Filters */}
      <Card sx={{ p:2, mb:2 }}>
        <Box sx={{ display:"flex", gap:2, flexWrap:"wrap" }}>
          <TextField
            size="small" placeholder="Search by name, mobile, city..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            sx={{ flex:1, minWidth:200 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          />
          <FormControl size="small" sx={{ minWidth:160 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status"
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
              <MenuItem value="">All Status</MenuItem>
              {STATUS_OPTIONS.map((s) => (
                <MenuItem key={s} value={s}>{STATUS_LABELS[s]}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background:"#f9fafb" }}>
                {["Business", "Owner", "Mobile", "City", "Industry", "Budget", "Status", "Submitted", "Actions"].map((h) => (
                  <TableCell key={h} sx={{ fontWeight:600, fontSize:12, color:"text.secondary", py:1.5 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py:4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : data.clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py:4, color:"text.secondary" }}>
                    No clients found
                  </TableCell>
                </TableRow>
              ) : data.clients.map((c) => (
                <TableRow key={c._id} hover>
                  <TableCell sx={{ fontWeight:500 }}>{c.businessName}</TableCell>
                  <TableCell>{c.ownerName}</TableCell>
                  <TableCell>{c.mobile}</TableCell>
                  <TableCell>{c.city}</TableCell>
                  <TableCell>
                    <Chip label={INDUSTRY_LABELS[c.industry] || c.industry} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{c.budget || "—"}</TableCell>
                  <TableCell>
                    <Select
                      size="small" value={c.status}
                      onChange={(e) => handleStatusChange(c._id, e.target.value)}
                      sx={{ fontSize:12, "& .MuiSelect-select": { py:0.5, px:1 } }}
                      variant="outlined"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <MenuItem key={s} value={s} sx={{ fontSize:12 }}>
                          <Chip label={STATUS_LABELS[s]} color={STATUS_COLORS[s]} size="small" />
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell sx={{ fontSize:12, color:"text.secondary" }}>
                    {new Date(c.createdAt).toLocaleDateString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => navigate(`/admin/clients/${c._id}`)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(c)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={data.total}
          rowsPerPage={15}
          rowsPerPageOptions={[15]}
          page={page}
          onPageChange={(_, p) => setPage(p)}
        />
      </Card>

      {/* Delete Confirm Dialog */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Client</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{deleteTarget?.businessName}</strong> ne delete karvu chhe? Aa action undo nahi thay.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
