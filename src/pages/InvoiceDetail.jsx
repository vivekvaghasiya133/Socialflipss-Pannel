import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button, Divider,
  TextField, Select, MenuItem, FormControl, InputLabel, Alert,
  Snackbar, CircularProgress, IconButton, Tooltip, Table, TableBody,
  TableCell, TableHead, TableRow, TableContainer, Dialog, DialogTitle,
  DialogContent, DialogActions,
} from "@mui/material";
import ArrowBackIcon  from "@mui/icons-material/ArrowBack";
import AddIcon        from "@mui/icons-material/Add";
import DeleteIcon     from "@mui/icons-material/Delete";
import PrintIcon      from "@mui/icons-material/Print";
import WhatsAppIcon   from "@mui/icons-material/WhatsApp";
import { getInvoiceById, createInvoice, recordPayment, deletePayment } from "../api/clientsApi";
import { getClients } from "../api/clientsApi";
import { useAuth } from "../context/AuthContext";

const MONTHS_LIST = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const PAY_COLOR   = { pending:"warning", partial:"info", paid:"success" };
const METHOD_OPTS = ["upi","cash","bank","cheque","other"];

function printInvoice(inv) {
  const win = window.open("", "_blank");
  const rows = inv.items.map(i => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6">${i.description}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:center">${i.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:right">₹${Number(i.rate).toLocaleString("en-IN")}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:600">₹${Number(i.amount).toLocaleString("en-IN")}</td>
    </tr>`).join("");

  win.document.write(`<!DOCTYPE html><html><head>
    <title>${inv.invoiceNumber}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Segoe UI',sans-serif;padding:40px;color:#111;font-size:14px}
      .header{display:flex;justify-content:space-between;margin-bottom:32px;border-bottom:2px solid #1a56db;padding-bottom:16px}
      .brand{font-size:24px;font-weight:700;color:#1a56db}
      .brand-sub{font-size:12px;color:#6b7280;margin-top:4px}
      .inv-title{font-size:18px;font-weight:700;text-align:right}
      .inv-num{font-size:13px;color:#6b7280;text-align:right;margin-top:4px}
      .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px;padding:20px;background:#f9fafb;border-radius:8px}
      .info-label{font-size:11px;color:#6b7280;margin-bottom:4px;text-transform:uppercase;letter-spacing:.05em}
      .info-val{font-size:14px;font-weight:500}
      table{width:100%;border-collapse:collapse;margin-bottom:24px}
      th{background:#f3f4f6;padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600}
      th:last-child,th:nth-child(3),th:nth-child(2){text-align:right}
      .totals{margin-left:auto;width:280px}
      .total-row{display:flex;justify-content:space-between;padding:6px 0;font-size:14px}
      .total-row.final{border-top:2px solid #1a56db;margin-top:8px;padding-top:12px;font-size:16px;font-weight:700;color:#1a56db}
      .paid-row{color:#0e9f6e;font-weight:600}
      .pending-row{color:#e02424;font-weight:600}
      .footer{text-align:center;color:#9ca3af;font-size:11px;margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb}
      @media print{body{padding:20px}}
    </style></head><body>
    <div class="header">
      <div><div class="brand">SocialFlipss</div><div class="brand-sub">Digital Marketing Agency</div></div>
      <div><div class="inv-title">TAX INVOICE</div><div class="inv-num">${inv.invoiceNumber}</div></div>
    </div>
    <div class="info-grid">
      <div>
        <div class="info-label">Bill To</div>
        <div class="info-val">${inv.clientId?.businessName || ""}</div>
        <div style="color:#6b7280;font-size:13px">${inv.clientId?.ownerName || ""}</div>
        <div style="color:#6b7280;font-size:13px">${inv.clientId?.mobile || ""}</div>
      </div>
      <div>
        <div style="text-align:right">
          <div class="info-label">Invoice Date</div>
          <div class="info-val">${new Date(inv.issueDate).toLocaleDateString("en-IN")}</div>
          ${inv.dueDate ? `<div class="info-label" style="margin-top:8px">Due Date</div><div class="info-val">${new Date(inv.dueDate).toLocaleDateString("en-IN")}</div>` : ""}
          ${inv.month ? `<div class="info-label" style="margin-top:8px">Period</div><div class="info-val">${inv.month}</div>` : ""}
        </div>
      </div>
    </div>
    <table><thead><tr><th>Description</th><th style="text-align:center">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <div class="totals">
      <div class="total-row"><span>Subtotal</span><span>₹${Number(inv.subtotal).toLocaleString("en-IN")}</span></div>
      ${inv.discount > 0 ? `<div class="total-row"><span>Discount</span><span>−₹${Number(inv.discount).toLocaleString("en-IN")}</span></div>` : ""}
      ${inv.gstAmount > 0 ? `<div class="total-row"><span>GST (${inv.gstPercent}%)</span><span>₹${Number(inv.gstAmount).toLocaleString("en-IN")}</span></div>` : ""}
      <div class="total-row final"><span>Total</span><span>₹${Number(inv.totalAmount).toLocaleString("en-IN")}</span></div>
      <div class="total-row paid-row"><span>Paid</span><span>₹${Number(inv.paidAmount).toLocaleString("en-IN")}</span></div>
      ${inv.pendingAmount > 0 ? `<div class="total-row pending-row"><span>Balance Due</span><span>₹${Number(inv.pendingAmount).toLocaleString("en-IN")}</span></div>` : ""}
    </div>
    ${inv.notes ? `<div style="margin-top:24px;padding:14px;background:#f9fafb;border-radius:8px;font-size:13px;color:#6b7280"><strong>Notes:</strong> ${inv.notes}</div>` : ""}
    <div class="footer">Thank you for your business! · SocialFlipss · Surat, Gujarat</div>
    <script>window.onload=()=>window.print()</script>
    </body></html>`);
  win.document.close();
}

export default function InvoiceDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [searchParams] = useSearchParams();
  const isNew      = id === "new";
  const { canManage, isAdmin } = useAuth();

  const [invoice, setInvoice] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [toast, setToast]     = useState("");
  const [payDialog, setPayDialog] = useState(false);
  const [payForm, setPayForm]     = useState({ amount:"", method:"upi", note:"", date:"" });
  const [payError, setPayError]   = useState("");

  // New invoice form
  const [newForm, setNewForm] = useState({
    clientId:   searchParams.get("clientId") || "",
    month:      "",
    issueDate:  new Date().toISOString().slice(0,10),
    dueDate:    "",
    items:      [{ description:"", quantity:1, rate:"" }],
    discount:   0,
    gstPercent: 0,
    notes:      "",
  });
  const [createError, setCreateError] = useState("");
  const [creating, setCreating]       = useState(false);

  useEffect(() => {
    if (isNew) {
      getClients({ limit:100 }).then(r => setClients(r.data.clients));
      return;
    }
    setLoading(true);
    getInvoiceById(id).then(r => setInvoice(r.data))
      .catch(() => navigate("/admin/invoices"))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Create new invoice ──────────────────────────────────────────
  const handleCreate = async () => {
    const { clientId, items } = newForm;
    if (!clientId) { setCreateError("Client select karo."); return; }
    if (!items.length || !items[0].description) { setCreateError("Kam se kam ek item required chhe."); return; }
    setCreating(true); setCreateError("");
    try {
      const inv = await createInvoice(newForm);
      navigate(`/admin/invoices/${inv.data._id}`);
    } catch (err) {
      setCreateError(err.response?.data?.message || "Failed");
      setCreating(false);
    }
  };

  const addItem    = () => setNewForm({ ...newForm, items: [...newForm.items, { description:"", quantity:1, rate:"" }] });
  const removeItem = (i) => setNewForm({ ...newForm, items: newForm.items.filter((_,idx) => idx !== i) });
  const updateItem = (i, key, val) => {
    const items = [...newForm.items];
    items[i] = { ...items[i], [key]: val };
    setNewForm({ ...newForm, items });
  };

  // Live totals for new invoice
  const liveSubtotal = newForm.items.reduce((s,i) => s + (Number(i.quantity||0) * Number(i.rate||0)), 0);
  const liveDiscount = Number(newForm.discount || 0);
  const liveGST      = parseFloat(((liveSubtotal - liveDiscount) * Number(newForm.gstPercent||0) / 100).toFixed(2));
  const liveTotal    = parseFloat((liveSubtotal - liveDiscount + liveGST).toFixed(2));

  // ── Record payment ──────────────────────────────────────────────
  const handlePayment = async () => {
    if (!payForm.amount || Number(payForm.amount) <= 0) { setPayError("Valid amount enter karo."); return; }
    setPayError("");
    try {
      await recordPayment(id, payForm);
      setPayDialog(false);
      setPayForm({ amount:"", method:"upi", note:"", date:"" });
      setToast("Payment recorded!");
      getInvoiceById(id).then(r => setInvoice(r.data));
    } catch (err) {
      setPayError(err.response?.data?.message || "Failed");
    }
  };

  const handleDeletePayment = async (payId) => {
    await deletePayment(id, payId);
    setToast("Payment removed.");
    getInvoiceById(id).then(r => setInvoice(r.data));
  };

  const sendWhatsApp = () => {
    if (!invoice) return;
    const msg = encodeURIComponent(
      `Hi ${invoice.clientId?.ownerName}, SocialFlipss thi invoice ${invoice.invoiceNumber} share kar raha hun.\n` +
      `Amount: ₹${Number(invoice.totalAmount).toLocaleString("en-IN")}\n` +
      `Paid: ₹${Number(invoice.paidAmount).toLocaleString("en-IN")}\n` +
      `Pending: ₹${Number(invoice.pendingAmount).toLocaleString("en-IN")}\n` +
      `Please payment complete kar dijiye. Thank you! 🙏`
    );
    window.open(`https://wa.me/91${(invoice.clientId?.mobile||"").replace(/\D/g,"")}?text=${msg}`, "_blank");
  };

  // ── NEW INVOICE FORM ────────────────────────────────────────────
  if (isNew) return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/admin/invoices")} sx={{ mb:2 }}>Back</Button>
      <Typography variant="h5" mb={3}>Create Invoice</Typography>
      {createError && <Alert severity="error" sx={{ mb:2 }}>{createError}</Alert>}
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb:2 }}>
            <CardContent>
              <Typography variant="h6" mb={2}>Invoice Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small" required>
                    <InputLabel>Client *</InputLabel>
                    <Select value={newForm.clientId} label="Client *"
                      onChange={e => setNewForm({...newForm, clientId:e.target.value})}>
                      {clients.map(c => <MenuItem key={c._id} value={c._id}>{c.businessName}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Month / Period" placeholder="April 2026"
                    value={newForm.month} onChange={e => setNewForm({...newForm, month:e.target.value})} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Issue Date" type="date" InputLabelProps={{ shrink:true }}
                    value={newForm.issueDate} onChange={e => setNewForm({...newForm, issueDate:e.target.value})} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Due Date" type="date" InputLabelProps={{ shrink:true }}
                    value={newForm.dueDate} onChange={e => setNewForm({...newForm, dueDate:e.target.value})} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Line items */}
          <Card sx={{ mb:2 }}>
            <CardContent>
              <Box sx={{ display:"flex", justifyContent:"space-between", mb:2 }}>
                <Typography variant="h6">Items</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={addItem}>Add Item</Button>
              </Box>
              {newForm.items.map((item,i) => (
                <Box key={i} sx={{ display:"flex", gap:1, mb:1.5, alignItems:"center" }}>
                  <TextField size="small" label="Description" value={item.description}
                    onChange={e => updateItem(i,"description",e.target.value)} sx={{ flex:3 }} />
                  <TextField size="small" label="Qty" type="number" value={item.quantity}
                    onChange={e => updateItem(i,"quantity",e.target.value)} sx={{ width:70 }} />
                  <TextField size="small" label="Rate (₹)" type="number" value={item.rate}
                    onChange={e => updateItem(i,"rate",e.target.value)} sx={{ flex:1 }} />
                  <Typography variant="body2" sx={{ minWidth:80, textAlign:"right", fontWeight:600 }}>
                    ₹{(Number(item.quantity||0)*Number(item.rate||0)).toLocaleString("en-IN")}
                  </Typography>
                  {newForm.items.length > 1 && (
                    <IconButton size="small" onClick={() => removeItem(i)}><DeleteIcon fontSize="small" /></IconButton>
                  )}
                </Box>
              ))}
            </CardContent>
          </Card>

          <TextField fullWidth size="small" label="Notes (optional)" multiline rows={2}
            value={newForm.notes} onChange={e => setNewForm({...newForm, notes:e.target.value})} sx={{ mb:2 }} />
        </Grid>

        {/* Summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position:{ md:"sticky" }, top:80 }}>
            <CardContent>
              <Typography variant="h6" mb={2}>Summary</Typography>
              <Divider sx={{ mb:2 }} />
              <Grid container spacing={1.5} mb={2}>
                <Grid item xs={6}>
                  <TextField fullWidth size="small" label="Discount (₹)" type="number"
                    value={newForm.discount} onChange={e => setNewForm({...newForm, discount:e.target.value})} />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>GST %</InputLabel>
                    <Select value={newForm.gstPercent} label="GST %"
                      onChange={e => setNewForm({...newForm, gstPercent:e.target.value})}>
                      {[0,5,12,18].map(g => <MenuItem key={g} value={g}>{g}%</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              {[
                { label:"Subtotal",  value:`₹${liveSubtotal.toLocaleString("en-IN")}`,  bold:false },
                { label:`Discount`,  value:`−₹${liveDiscount.toLocaleString("en-IN")}`, bold:false, hide: !liveDiscount },
                { label:`GST (${newForm.gstPercent}%)`, value:`₹${liveGST.toLocaleString("en-IN")}`, bold:false, hide: !liveGST },
              ].filter(r => !r.hide).map(r => (
                <Box key={r.label} sx={{ display:"flex", justifyContent:"space-between", mb:0.75 }}>
                  <Typography variant="body2" color="text.secondary">{r.label}</Typography>
                  <Typography variant="body2" fontWeight={r.bold ? 700 : 400}>{r.value}</Typography>
                </Box>
              ))}
              <Box sx={{ display:"flex", justifyContent:"space-between", p:1.5, background:"#e8f0fe", borderRadius:2, mt:1 }}>
                <Typography fontWeight={700} color="#1a56db">Total</Typography>
                <Typography fontWeight={700} color="#1a56db" fontSize={18}>₹{liveTotal.toLocaleString("en-IN")}</Typography>
              </Box>
              <Button fullWidth variant="contained" sx={{ mt:2 }} onClick={handleCreate} disabled={creating}>
                {creating ? "Creating..." : "Create Invoice"}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // ── INVOICE DETAIL ──────────────────────────────────────────────
  if (loading) return <Box sx={{ display:"flex", justifyContent:"center", pt:8 }}><CircularProgress /></Box>;
  if (!invoice) return <Alert severity="error">Invoice not found</Alert>;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/admin/invoices")} sx={{ mb:2 }}>Back</Button>

      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", mb:3, flexWrap:"wrap", gap:2 }}>
        <Box>
          <Typography variant="h5" fontFamily="monospace">{invoice.invoiceNumber}</Typography>
          <Typography variant="body2" color="text.secondary">
            {invoice.clientId?.businessName} · {invoice.month || new Date(invoice.issueDate).toLocaleDateString("en-IN")}
          </Typography>
        </Box>
        <Box sx={{ display:"flex", gap:1, flexWrap:"wrap" }}>
          <Chip label={invoice.paymentStatus.toUpperCase()} color={PAY_COLOR[invoice.paymentStatus]} sx={{ fontWeight:700 }} />
          <Button variant="outlined" size="small" startIcon={<PrintIcon />} onClick={() => printInvoice(invoice)}>Print / PDF</Button>
          {invoice.paymentStatus !== "paid" && (
            <Button variant="outlined" size="small" color="success" startIcon={<WhatsAppIcon />} onClick={sendWhatsApp}>
              Send via WhatsApp
            </Button>
          )}
          {canManage && invoice.paymentStatus !== "paid" && (
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setPayDialog(true)}>
              Record Payment
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          {/* Items table */}
          <Card sx={{ mb:2 }}>
            <CardContent>
              <Typography variant="h6" mb={2}>Invoice Items</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ background:"#f9fafb" }}>
                      {["Description","Qty","Rate","Amount"].map(h => (
                        <TableCell key={h} sx={{ fontWeight:600, fontSize:12 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoice.items.map((item,i) => (
                      <TableRow key={i}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>₹{Number(item.rate).toLocaleString("en-IN")}</TableCell>
                        <TableCell sx={{ fontWeight:600 }}>₹{Number(item.amount).toLocaleString("en-IN")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ display:"flex", justifyContent:"flex-end", mt:2 }}>
                <Box sx={{ width:260 }}>
                  {[
                    { label:"Subtotal",          val:`₹${Number(invoice.subtotal).toLocaleString("en-IN")}` },
                    invoice.discount > 0 && { label:"Discount", val:`−₹${Number(invoice.discount).toLocaleString("en-IN")}` },
                    invoice.gstAmount > 0 && { label:`GST (${invoice.gstPercent}%)`, val:`₹${Number(invoice.gstAmount).toLocaleString("en-IN")}` },
                  ].filter(Boolean).map(r => (
                    <Box key={r.label} sx={{ display:"flex", justifyContent:"space-between", mb:0.75 }}>
                      <Typography variant="body2" color="text.secondary">{r.label}</Typography>
                      <Typography variant="body2">{r.val}</Typography>
                    </Box>
                  ))}
                  <Divider sx={{ my:1 }} />
                  <Box sx={{ display:"flex", justifyContent:"space-between", mb:0.75 }}>
                    <Typography fontWeight={700}>Total</Typography>
                    <Typography fontWeight={700} color="primary">₹{Number(invoice.totalAmount).toLocaleString("en-IN")}</Typography>
                  </Box>
                  <Box sx={{ display:"flex", justifyContent:"space-between", mb:0.75 }}>
                    <Typography variant="body2" color="#0e9f6e" fontWeight={600}>Paid</Typography>
                    <Typography variant="body2" color="#0e9f6e" fontWeight={600}>₹{Number(invoice.paidAmount).toLocaleString("en-IN")}</Typography>
                  </Box>
                  {invoice.pendingAmount > 0 && (
                    <Box sx={{ display:"flex", justifyContent:"space-between", p:1.5, background:"#fee2e2", borderRadius:2, mt:0.5 }}>
                      <Typography fontWeight={700} color="#991b1b">Balance Due</Typography>
                      <Typography fontWeight={700} color="#991b1b">₹{Number(invoice.pendingAmount).toLocaleString("en-IN")}</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Payment history */}
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Payment History</Typography>
              {invoice.payments.length === 0 ? (
                <Typography variant="body2" color="text.secondary">Haji koi payment recorded nathi.</Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ background:"#f9fafb" }}>
                      {["Date","Amount","Method","Note","By",""].map(h => (
                        <TableCell key={h} sx={{ fontWeight:600, fontSize:12 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoice.payments.map(p => (
                      <TableRow key={p._id}>
                        <TableCell sx={{ fontSize:12 }}>{new Date(p.date).toLocaleDateString("en-IN")}</TableCell>
                        <TableCell sx={{ fontWeight:600, color:"#0e9f6e" }}>₹{Number(p.amount).toLocaleString("en-IN")}</TableCell>
                        <TableCell><Chip label={p.method.toUpperCase()} size="small" variant="outlined" sx={{ fontSize:10 }} /></TableCell>
                        <TableCell sx={{ fontSize:12 }}>{p.note || "—"}</TableCell>
                        <TableCell sx={{ fontSize:12, color:"text.secondary" }}>{p.addedBy?.name || "—"}</TableCell>
                        <TableCell>
                          {isAdmin && (
                            <IconButton size="small" onClick={() => handleDeletePayment(p._id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Client info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={1.5}>Client</Typography>
              <Divider sx={{ mb:2 }} />
              <Typography fontWeight={600}>{invoice.clientId?.businessName}</Typography>
              <Typography variant="body2" color="text.secondary">{invoice.clientId?.ownerName}</Typography>
              <Typography variant="body2" color="text.secondary">{invoice.clientId?.mobile}</Typography>
              <Typography variant="body2" color="text.secondary">{invoice.clientId?.email}</Typography>
              {invoice.notes && (
                <>
                  <Divider sx={{ my:2 }} />
                  <Typography variant="caption" color="text.secondary">Notes</Typography>
                  <Typography variant="body2">{invoice.notes}</Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Record Payment Dialog */}
      <Dialog open={payDialog} onClose={() => setPayDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          {payError && <Alert severity="error" sx={{ mb:2 }}>{payError}</Alert>}
          <Typography variant="caption" color="text.secondary" display="block" mb={2}>
            Pending: ₹{Number(invoice.pendingAmount).toLocaleString("en-IN")}
          </Typography>
          <Grid container spacing={2} sx={{ mt:0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Amount (₹) *" type="number"
                value={payForm.amount} onChange={e => setPayForm({...payForm, amount:e.target.value})} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Payment Method</InputLabel>
                <Select value={payForm.method} label="Payment Method"
                  onChange={e => setPayForm({...payForm, method:e.target.value})}>
                  {METHOD_OPTS.map(m => <MenuItem key={m} value={m} sx={{ textTransform:"capitalize" }}>{m.toUpperCase()}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Payment Date" type="date" InputLabelProps={{ shrink:true }}
                value={payForm.date} onChange={e => setPayForm({...payForm, date:e.target.value})} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Note (optional)"
                value={payForm.note} onChange={e => setPayForm({...payForm, note:e.target.value})} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2 }}>
          <Button onClick={() => setPayDialog(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handlePayment}>Record Payment</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(toast)} autoHideDuration={3000} onClose={() => setToast("")} message={toast} />
    </Box>
  );
}
