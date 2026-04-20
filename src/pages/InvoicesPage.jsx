import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Button, Select, MenuItem,
  FormControl, InputLabel, Alert, Snackbar, Tooltip, Grid,
} from "@mui/material";
import AddIcon        from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon     from "@mui/icons-material/Delete";
import { getInvoices, deleteInvoice, getInvoiceStats } from "../api/clientsApi";
import { useAuth } from "../context/AuthContext";

const PAY_COLOR  = { pending:"warning", partial:"info", paid:"success" };
const PAY_LABEL  = { pending:"Pending", partial:"Partial", paid:"Paid" };

export default function InvoicesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientIdFilter = searchParams.get("clientId") || "";
  const { canManage, isAdmin } = useAuth();

  const [invoices, setInvoices] = useState([]);
  const [stats, setStats]       = useState(null);
  const [total, setTotal]       = useState(0);
  const [statusFilter, setStatus] = useState("");
  const [toast, setToast]       = useState("");

  const loadStats = () => getInvoiceStats().then(r => setStats(r.data));

  const load = useCallback(() => {
    getInvoices({ paymentStatus: statusFilter, clientId: clientIdFilter })
      .then(r => { setInvoices(r.data.invoices); setTotal(r.data.total); });
  }, [statusFilter, clientIdFilter]);

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this invoice?")) return;
    await deleteInvoice(id);
    setToast("Invoice deleted.");
    load(); loadStats();
  };

  return (
    <Box>
      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:3 }}>
        <Box>
          <Typography variant="h5">Invoices & Payments</Typography>
          <Typography variant="body2" color="text.secondary">{total} total invoices</Typography>
        </Box>
        {canManage && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/admin/invoices/new")}>
            Create Invoice
          </Button>
        )}
      </Box>

      {/* Revenue stats */}
      {stats && (
        <Grid container spacing={2} mb={3}>
          {[
            { label:"Total Revenue",    value:`₹${Number(stats.totalRevenue).toLocaleString("en-IN")}`,  color:"#1a56db" },
            { label:"Total Received",   value:`₹${Number(stats.totalPaid).toLocaleString("en-IN")}`,     color:"#0e9f6e" },
            { label:"Total Pending",    value:`₹${Number(stats.totalPending).toLocaleString("en-IN")}`,  color:"#e02424" },
            { label:"Pending Invoices", value: stats.countPending,                                        color:"#ff8800" },
          ].map(c => (
            <Grid item xs={6} sm={3} key={c.label}>
              <Card><Box sx={{ p:2 }}>
                <Typography variant="body2" color="text.secondary">{c.label}</Typography>
                <Typography variant="h5" fontWeight={700} sx={{ color:c.color }}>{c.value}</Typography>
              </Box></Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Filter */}
      <Card sx={{ p:2, mb:2 }}>
        <FormControl size="small" sx={{ minWidth:160 }}>
          <InputLabel>Payment Status</InputLabel>
          <Select value={statusFilter} label="Payment Status" onChange={e => setStatus(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="partial">Partial</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
          </Select>
        </FormControl>
      </Card>

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background:"#f9fafb" }}>
                {["Invoice #","Client","Month","Total","Paid","Pending","Status","Date","Actions"].map(h => (
                  <TableCell key={h} sx={{ fontWeight:600, fontSize:12, color:"text.secondary", py:1.5 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map(inv => (
                <TableRow key={inv._id} hover>
                  <TableCell sx={{ fontSize:12, fontFamily:"monospace", fontWeight:600, color:"#1a56db" }}>
                    {inv.invoiceNumber}
                  </TableCell>
                  <TableCell sx={{ fontWeight:500 }}>{inv.clientId?.businessName || "—"}</TableCell>
                  <TableCell sx={{ fontSize:12 }}>{inv.month || "—"}</TableCell>
                  <TableCell sx={{ fontWeight:600 }}>₹{Number(inv.totalAmount).toLocaleString("en-IN")}</TableCell>
                  <TableCell sx={{ color:"#0e9f6e", fontWeight:600 }}>₹{Number(inv.paidAmount).toLocaleString("en-IN")}</TableCell>
                  <TableCell sx={{ color: inv.pendingAmount > 0 ? "#e02424" : "text.secondary", fontWeight:600 }}>
                    ₹{Number(inv.pendingAmount).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Chip label={PAY_LABEL[inv.paymentStatus]} color={PAY_COLOR[inv.paymentStatus]} size="small" />
                  </TableCell>
                  <TableCell sx={{ fontSize:12, color:"text.secondary" }}>
                    {new Date(inv.createdAt).toLocaleDateString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View / Record Payment">
                      <IconButton size="small" onClick={() => navigate(`/admin/invoices/${inv._id}`)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {isAdmin && (
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(inv._id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py:5, color:"text.secondary" }}>
                    Koi invoice nathi. "+ Create Invoice" click karo.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Snackbar open={Boolean(toast)} autoHideDuration={3000} onClose={() => setToast("")} message={toast} />
    </Box>
  );
}
