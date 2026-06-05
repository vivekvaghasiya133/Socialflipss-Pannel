import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button, Divider,
  TextField, Select, MenuItem, FormControl, InputLabel, Alert,
  Snackbar, CircularProgress, IconButton, Tooltip, Table, TableBody,
  TableCell, TableHead, TableRow, TableContainer, Dialog, DialogTitle,
  DialogContent, DialogActions, ToggleButton, ToggleButtonGroup,
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
  const logoUrl = window.location.origin + "/logo.jpg";
  const rows = inv.items.map(i => `
    <tr>
      <td class="item-desc">${i.description}</td>
      <td style="text-align:center">${i.quantity}</td>
      <td style="text-align:right">₹${Number(i.rate).toLocaleString("en-IN")}</td>
      <td style="text-align:right;font-weight:600">₹${Number(i.amount).toLocaleString("en-IN")}</td>
    </tr>`).join("");

  win.document.write(`<!DOCTYPE html><html><head>
    <title>Invoice - ${inv.invoiceNumber}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
      body { padding: 40px; color: #1f2937; background: #fff; line-height: 1.5; font-size: 13px; }
      
      .top-bar { height: 6px; background: linear-gradient(90deg, #7c3aed, #5b21b6); margin: -40px -40px 30px -40px; }
      
      .header-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; margin-bottom: 30px; }
      .logo-container img { height: 65px; object-fit: contain; }
      
      .invoice-meta { text-align: right; }
      .invoice-title { font-size: 26px; font-weight: 800; color: #5b21b6; letter-spacing: -0.02em; margin-bottom: 5px; }
      .invoice-number { font-family: monospace; font-size: 15px; font-weight: 700; color: #4b5563; }
      
      .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 35px; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; padding: 20px 0; }
      .details-box h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 8px; font-weight: 700; }
      .company-name { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 4px; }
      .client-name { font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 4px; }
      .info-text { color: #4b5563; margin-bottom: 2px; }
      
      .dates-box { display: flex; flex-direction: column; align-items: flex-end; justify-content: flex-end; }
      .date-row { display: flex; justify-content: space-between; width: 220px; margin-bottom: 6px; }
      .date-label { color: #6b7280; font-weight: 500; }
      .date-value { font-weight: 600; color: #1f2937; }

      table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
      th { background: #f9fafb; padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #4b5563; border-bottom: 2px solid #e5e7eb; }
      th:last-child, th:nth-child(3), th:nth-child(2) { text-align: right; }
      td { padding: 12px 16px; border-bottom: 1px solid #f3f4f6; color: #374151; font-size: 13px; }
      td:last-child, td:nth-child(3), td:nth-child(2) { text-align: right; }
      .item-desc { font-weight: 500; color: #111827; }
      
      .summary-grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 40px; margin-bottom: 40px; align-items: start; }
      
      .payment-instructions { background: #f9fafb; border-radius: 8px; padding: 16px; border: 1px dashed #d1d5db; }
      .payment-instructions h4 { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #374151; margin-bottom: 8px; letter-spacing: 0.02em; }
      .payment-row { display: flex; margin-bottom: 4px; font-size: 12px; }
      .payment-label { color: #6b7280; width: 100px; font-weight: 500; }
      .payment-value { color: #1f2937; font-weight: 600; }

      .totals-box { margin-left: auto; width: 100%; }
      .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #4b5563; }
      .total-row.final { border-top: 1px solid #e5e7eb; margin-top: 8px; padding-top: 12px; font-size: 16px; font-weight: 800; color: #5b21b6; }
      .total-row.paid { color: #0e9f6e; font-weight: 600; }
      .total-row.balance { background: #fee2e2; border-radius: 6px; padding: 8px 12px; margin-top: 6px; font-weight: 700; color: #b91c1c; }

      .footer-section { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 40px; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 25px; }
      .terms-box h4 { font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 6px; }
      .terms-text { color: #6b7280; font-size: 11px; line-height: 1.6; }
      
      .signature-box { text-align: right; display: flex; flex-direction: column; align-items: flex-end; justify-content: flex-end; }
      .signature-line { width: 180px; border-bottom: 1px solid #9ca3af; margin-bottom: 8px; margin-top: 60px; }
      .signature-title { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }

      @media print {
        body { padding: 20px 0; }
        .top-bar { margin: -20px 0 20px 0; }
        .payment-instructions { background: none; border: 1px solid #e5e7eb; page-break-inside: avoid; }
        .footer-section { page-break-inside: avoid; }
      }
    </style></head><body>
    <div class="top-bar"></div>
    
    <div class="header-grid">
      <div class="logo-container">
        <img src="${logoUrl}" alt="SocialFlipss Logo" />
        <div style="font-size: 11px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px;">Flip The Game</div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-title">TAX INVOICE</div>
        <div class="invoice-number">NO: ${inv.invoiceNumber}</div>
      </div>
    </div>

    <div class="details-grid">
      <div class="details-box">
        <h3>Billed To</h3>
        <div class="client-name">${inv.clientId?.businessName || inv.clientBusiness || "One-off Client"}</div>
        ${(inv.clientId?.ownerName || inv.clientName) ? `<div class="info-text">Attn: ${inv.clientId?.ownerName || inv.clientName}</div>` : ""}
        ${(inv.clientId?.mobile || inv.clientMobile) ? `<div class="info-text">Phone: +91 ${inv.clientId?.mobile || inv.clientMobile}</div>` : ""}
        ${(inv.clientId?.email || inv.clientEmail) ? `<div class="info-text">Email: ${inv.clientId?.email || inv.clientEmail}</div>` : ""}
        ${(inv.clientId?.city || inv.clientCity) ? `<div class="info-text">City: ${inv.clientId?.city || inv.clientCity}</div>` : ""}
      </div>
      
      <div class="details-box" style="text-align: right; display: flex; flex-direction: column; align-items: flex-end;">
        <h3>Billed From</h3>
        <div class="company-name">SocialFlipss</div>
        <div class="info-text">Digital Marketing Agency</div>
        <div class="info-text">Surat, Gujarat, India</div>
        <div class="info-text">Email: socialflipsswork@gmail.com</div>
        <div class="info-text">Phone: +91 76006 00816</div>
        <div class="info-text">Contact: +91 80001 33106</div>
      </div>
    </div>

    <div style="display: flex; justify-content: flex-end; margin-top: -20px; margin-bottom: 25px;">
      <div class="dates-box">
        <div class="date-row">
          <span class="date-label">Invoice Date:</span>
          <span class="date-value">${new Date(inv.issueDate).toLocaleDateString("en-IN", {day: 'numeric', month: 'short', year: 'numeric'})}</span>
        </div>
        ${inv.dueDate ? `
        <div class="date-row">
          <span class="date-label">Due Date:</span>
          <span class="date-value">${new Date(inv.dueDate).toLocaleDateString("en-IN", {day: 'numeric', month: 'short', year: 'numeric'})}</span>
        </div>` : ""}
        ${inv.month ? `
        <div class="date-row">
          <span class="date-label">Billing Period:</span>
          <span class="date-value">${inv.month}</span>
        </div>` : ""}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 50%;">Description</th>
          <th style="text-align: center; width: 15%;">Quantity</th>
          <th style="text-align: right; width: 15%;">Rate</th>
          <th style="text-align: right; width: 20%;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <div class="summary-grid">
      <div class="payment-instructions">
        <h4>Payment Information</h4>
        <div class="payment-row">
          <span class="payment-label">UPI ID:</span>
          <span class="payment-value">vivekvaghasiya133-1@oksbi</span>
        </div>
        <div class="payment-row" style="margin-top: 8px;">
          <span class="payment-label">Bank Name:</span>
          <span class="payment-value">SBI Bank</span>
        </div>
        <div class="payment-row">
          <span class="payment-label">Account No:</span>
          <span class="payment-value">43591183670</span>
        </div>
        <div class="payment-row">
          <span class="payment-label">IFSC Code:</span>
          <span class="payment-value">SBIN0064547</span>
        </div>
        <div class="payment-row">
          <span class="payment-label">Contact:</span>
          <span class="payment-value">8000133106</span>
        </div>
      </div>
      
      <div class="totals-box">
        <div class="total-row">
          <span>Subtotal</span>
          <span>₹${Number(inv.subtotal).toLocaleString("en-IN", {minimumFractionDigits: 2})}</span>
        </div>
        ${inv.discount > 0 ? `
        <div class="total-row">
          <span>Discount</span>
          <span>−₹${Number(inv.discount).toLocaleString("en-IN", {minimumFractionDigits: 2})}</span>
        </div>` : ""}
        ${inv.gstAmount > 0 ? `
        <div class="total-row">
          <span>GST (${inv.gstPercent}%)</span>
          <span>₹${Number(inv.gstAmount).toLocaleString("en-IN", {minimumFractionDigits: 2})}</span>
        </div>` : ""}
        <div class="total-row final">
          <span>Total</span>
          <span>₹${Number(inv.totalAmount).toLocaleString("en-IN", {minimumFractionDigits: 2})}</span>
        </div>
        <div class="total-row paid">
          <span>Amount Paid</span>
          <span>₹${Number(inv.paidAmount).toLocaleString("en-IN", {minimumFractionDigits: 2})}</span>
        </div>
        ${inv.pendingAmount > 0 ? `
        <div class="total-row balance">
          <span>Balance Due</span>
          <span>₹${Number(inv.pendingAmount).toLocaleString("en-IN", {minimumFractionDigits: 2})}</span>
        </div>` : ""}
      </div>
    </div>

    <div class="footer-section">
      <div class="terms-box">
        <h4>Terms & Conditions</h4>
        <p class="terms-text">1. 50% advance payment required before work.</p>
        <p class="terms-text">2. Remaining 50% to be paid on final delivery.</p>
        <p class="terms-text">3. Cancellation 48 hrs before — full refund.</p>
        <p class="terms-text">4. Content rights belong to Social Flipss until full payment.</p>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-title">Authorized Signatory</div>
        <div style="font-size: 10px; color: #9ca3af; margin-top: 4px;">SocialFlipss Digital Marketing</div>
      </div>
    </div>
  </body></html>`);
  win.document.close();
  setTimeout(() => {
    try { win.print(); } catch (e) {}
  }, 500);
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
  const [payForm, setPayForm]     = useState({ amount:"", method:"upi", note:"", date:"", collectedBy:"vivek", collectedByCustom:"" });
  const [payError, setPayError]   = useState("");

  // New invoice form
  const [newForm, setNewForm] = useState({
    clientId:       searchParams.get("clientId") || "",
    clientName:     "",
    clientBusiness: "",
    clientMobile:   "",
    clientEmail:    "",
    clientCity:     "",
    month:          "",
    issueDate:      new Date().toISOString().slice(0,10),
    dueDate:        "",
    items:          [{ description:"", quantity:1, rate:"" }],
    discount:       0,
    gstPercent:     0,
    notes:          "",
  });
  const [isManualClient, setIsManualClient] = useState(false);
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
    const { clientId, clientBusiness, items } = newForm;
    if (!isManualClient && !clientId) { setCreateError("Client select karo."); return; }
    if (isManualClient && !clientBusiness) { setCreateError("Client Business Name (પેઢીનું નામ) required chhe."); return; }
    if (!items.length || !items[0].description) { setCreateError("Kam se kam ek item required chhe."); return; }
    setCreating(true); setCreateError("");
    try {
      const payload = {
        ...newForm,
        clientId: isManualClient ? "" : clientId,
      };
      const inv = await createInvoice(payload);
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
    if (payForm.collectedBy === "other" && !payForm.collectedByCustom?.trim()) { setPayError("Collector's name is required."); return; }
    setPayError("");
    try {
      await recordPayment(id, payForm);
      setPayDialog(false);
      setPayForm({ amount:"", method:"upi", note:"", date:"", collectedBy:"vivek", collectedByCustom:"" });
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
    const clientName = invoice.clientId?.ownerName || invoice.clientName || "Client";
    const total = Number(invoice.totalAmount).toLocaleString("en-IN");
    const paid = Number(invoice.paidAmount).toLocaleString("en-IN");
    const pending = Number(invoice.pendingAmount).toLocaleString("en-IN");

    const msg = encodeURIComponent(
      `Hi ${clientName} 👋\n\n` +
      `*SocialFlipss — Invoice ${invoice.invoiceNumber}*\n\n` +
      `Amount: ₹${total}\n` +
      `Paid: ₹${paid}\n` +
      `Pending: ₹${pending}\n\n` +
      `Please complete the payment. Thank you! 🙏\n\n` +
      `---\n\n` +
      `નમસ્તે ${clientName} 👋\n\n` +
      `*સોશિયલફ્લિપ્સ — ઇન્વોઇસ ${invoice.invoiceNumber}*\n\n` +
      `રકમ: ₹${total}\n` +
      `ચૂકવેલ: ₹${paid}\n` +
      `બાકી: ₹${pending}\n\n` +
      `કૃપા કરીને બાકી ચૂકવણી પૂર્ણ કરવા વિનંતી. આભાર! 🙏\n\n` +
      `– SocialFlipss Team`
    );
    window.open(`https://wa.me/91${(invoice.clientId?.mobile || invoice.clientMobile || "").replace(/\D/g,"")}?text=${msg}`, "_blank");
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
              <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:2, flexWrap:"wrap", gap:1 }}>
                <Typography variant="h6">Invoice Details</Typography>
                <ToggleButtonGroup
                  value={isManualClient ? "manual" : "registered"}
                  exclusive
                  onChange={(_, val) => { if (val) setIsManualClient(val === "manual"); }}
                  size="small"
                >
                  <ToggleButton value="registered" sx={{ fontSize: 11, fontWeight: 600 }}>Registered Client</ToggleButton>
                  <ToggleButton value="manual" sx={{ fontSize: 11, fontWeight: 600 }}>Manual / One-off Details</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Grid container spacing={2}>
                {!isManualClient ? (
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small" required>
                      <InputLabel>Client *</InputLabel>
                      <Select value={newForm.clientId} label="Client *"
                        onChange={e => setNewForm({...newForm, clientId:e.target.value})}>
                        {clients.map(c => <MenuItem key={c._id} value={c._id}>{c.businessName}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                ) : (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth size="small" label="Business / Work Name *" placeholder="Client Business Name" required
                        value={newForm.clientBusiness} onChange={e => setNewForm({...newForm, clientBusiness:e.target.value})} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth size="small" label="Owner Name" placeholder="Client Owner Name"
                        value={newForm.clientName} onChange={e => setNewForm({...newForm, clientName:e.target.value})} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField fullWidth size="small" label="Mobile" placeholder="Mobile Number"
                        value={newForm.clientMobile} onChange={e => setNewForm({...newForm, clientMobile:e.target.value})} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField fullWidth size="small" label="Email" type="email" placeholder="Email Address"
                        value={newForm.clientEmail} onChange={e => setNewForm({...newForm, clientEmail:e.target.value})} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField fullWidth size="small" label="City" placeholder="City"
                        value={newForm.clientCity} onChange={e => setNewForm({...newForm, clientCity:e.target.value})} />
                    </Grid>
                  </>
                )}

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
            {invoice.clientId?.businessName || invoice.clientBusiness || "One-off Client"} · {invoice.month || new Date(invoice.issueDate).toLocaleDateString("en-IN")}
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
                      {["Date","Amount","Method","Collected By","Note","By",""].map(h => (
                        <TableCell key={h} sx={{ fontWeight:600, fontSize:12 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoice.payments.map(p => {
                      const collectorName = p.collectedBy === "other"
                        ? (p.collectedByCustom || "Other")
                        : (p.collectedBy === "kuldeep" ? "Kuldeep" : "Vivek");
                      return (
                        <TableRow key={p._id}>
                          <TableCell sx={{ fontSize:12 }}>{new Date(p.date).toLocaleDateString("en-IN")}</TableCell>
                          <TableCell sx={{ fontWeight:600, color:"#0e9f6e" }}>₹{Number(p.amount).toLocaleString("en-IN")}</TableCell>
                          <TableCell><Chip label={p.method.toUpperCase()} size="small" variant="outlined" sx={{ fontSize:10 }} /></TableCell>
                          <TableCell sx={{ fontSize:12, fontWeight:500 }}>{collectorName}</TableCell>
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
                      );
                    })}
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
              <Typography fontWeight={600}>{invoice.clientId?.businessName || invoice.clientBusiness || "Manual Client"}</Typography>
              <Typography variant="body2" color="text.secondary">{invoice.clientId?.ownerName || invoice.clientName || "—"}</Typography>
              <Typography variant="body2" color="text.secondary">{invoice.clientId?.mobile || invoice.clientMobile || "—"}</Typography>
              <Typography variant="body2" color="text.secondary">{invoice.clientId?.email || invoice.clientEmail || "—"}</Typography>
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
              <FormControl fullWidth size="small">
                <InputLabel>Collected By</InputLabel>
                <Select value={payForm.collectedBy || "vivek"} label="Collected By"
                  onChange={e => setPayForm({...payForm, collectedBy:e.target.value})}>
                  <MenuItem value="vivek">Vivek</MenuItem>
                  <MenuItem value="kuldeep">Kuldeep</MenuItem>
                  <MenuItem value="other">Other (Other Name)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {(payForm.collectedBy === "other") && (
              <Grid item xs={12}>
                <TextField fullWidth size="small" label="Collector's Name *"
                  value={payForm.collectedByCustom || ""} onChange={e => setPayForm({...payForm, collectedByCustom:e.target.value})} />
              </Grid>
            )}
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
