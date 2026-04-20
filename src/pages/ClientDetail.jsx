import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button, Divider,
  TextField, Select, MenuItem, FormControl, InputLabel, Alert,
  Snackbar, CircularProgress, IconButton, Tooltip, Table, TableBody,
  TableCell, TableHead, TableRow, TableContainer,
} from "@mui/material";
import ArrowBackIcon  from "@mui/icons-material/ArrowBack";
import WhatsAppIcon   from "@mui/icons-material/WhatsApp";
import AddIcon        from "@mui/icons-material/Add";
import DeleteIcon     from "@mui/icons-material/Delete";
import ReceiptIcon    from "@mui/icons-material/Receipt";
import { getClientById, updateClient, getInvoices } from "../api/clientsApi";
import { useAuth } from "../context/AuthContext";

const STATUS_OPTIONS = ["onboarding","active","paused","churned"];
const STATUS_CONFIG  = {
  onboarding:{ label:"Onboarding", color:"info" },
  active:    { label:"Active",     color:"success" },
  paused:    { label:"Paused",     color:"warning" },
  churned:   { label:"Churned",    color:"error" },
};

const PAYMENT_STATUS_COLOR = { pending:"warning", partial:"info", paid:"success" };

function InfoRow({ label, value }) {
  if (!value || (Array.isArray(value) && !value.length)) return null;
  return (
    <Box sx={{ mb:1.5 }}>
      <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
      <Typography variant="body2" fontWeight={500}>
        {Array.isArray(value) ? value.join(", ") : value}
      </Typography>
    </Box>
  );
}

function Section({ title, children, action }) {
  return (
    <Card sx={{ mb:2 }}>
      <CardContent>
        <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:1.5 }}>
          <Typography variant="h6">{title}</Typography>
          {action}
        </Box>
        <Divider sx={{ mb:2 }} />
        {children}
      </CardContent>
    </Card>
  );
}

export default function ClientDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { canManage, isAdmin } = useAuth();

  const [client, setClient]   = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState("");

  const [adminForm, setAdminForm] = useState({
    status:"onboarding", assignedTo:"", internalNotes:"",
  });
  const [pkgForm, setPkgForm] = useState({
    name:"", amount:"", startDate:"", endDate:"",
  });
  const [deliverables, setDeliverables] = useState([]);
  const [newDel, setNewDel] = useState({ type:"", quantity:"", note:"" });

  const load = () => {
    setLoading(true);
    Promise.all([
      getClientById(id),
      getInvoices({ clientId: id }),
    ]).then(([cr, ir]) => {
      const c = cr.data;
      setClient(c);
      setAdminForm({ status: c.status || "onboarding", assignedTo: c.assignedTo?._id || "", internalNotes: c.internalNotes || "" });
      setPkgForm({
        name:      c.package?.name      || "",
        amount:    c.package?.amount    || "",
        startDate: c.package?.startDate ? c.package.startDate.slice(0,10) : "",
        endDate:   c.package?.endDate   ? c.package.endDate.slice(0,10)   : "",
      });
      setDeliverables(c.package?.deliverables || []);
      setInvoices(ir.data.invoices || []);
    }).catch(() => navigate("/admin/clients"))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateClient(id, {
        ...adminForm,
        package: { ...pkgForm, deliverables },
      });
      setToast("Saved!");
      load();
    } catch { setToast("Save failed."); }
    finally { setSaving(false); }
  };

  const addDeliverable = () => {
    if (!newDel.type || !newDel.quantity) return;
    setDeliverables([...deliverables, { ...newDel, quantity: Number(newDel.quantity) }]);
    setNewDel({ type:"", quantity:"", note:"" });
  };

  const removeDeliverable = (i) => setDeliverables(deliverables.filter((_, idx) => idx !== i));

  const openWhatsApp = () => {
    if (!client) return;
    const msg = encodeURIComponent(`Hi ${client.ownerName}, SocialFlipss team thi update share karna tha.`);
    window.open(`https://wa.me/91${client.mobile.replace(/\D/g,"")}?text=${msg}`, "_blank");
  };

  if (loading) return <Box sx={{ display:"flex", justifyContent:"center", pt:8 }}><CircularProgress /></Box>;
  if (!client) return <Alert severity="error">Client not found</Alert>;

  const totalRevenue = invoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalPaid    = invoices.reduce((s, i) => s + i.paidAmount, 0);
  const totalPending = invoices.reduce((s, i) => s + i.pendingAmount, 0);

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/admin/clients")} sx={{ mb:2 }}>
        Back to Clients
      </Button>

      {/* Header */}
      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", mb:3, flexWrap:"wrap", gap:2 }}>
        <Box>
          <Typography variant="h5">{client.businessName}</Typography>
          <Typography variant="body2" color="text.secondary">
            {client.ownerName} · {client.mobile} {client.city ? `· ${client.city}` : ""}
          </Typography>
          {client.instagramPage && (
            <Typography variant="caption" color="primary">@{client.instagramPage}</Typography>
          )}
        </Box>
        <Box sx={{ display:"flex", gap:1, flexWrap:"wrap" }}>
          <Button variant="outlined" color="success" size="small" startIcon={<WhatsAppIcon />} onClick={openWhatsApp}>
            WhatsApp
          </Button>
          <Button variant="outlined" size="small" startIcon={<ReceiptIcon />}
            onClick={() => navigate(`/admin/invoices?clientId=${id}`)}>
            Invoices ({invoices.length})
          </Button>
          <Chip label={STATUS_CONFIG[client.status]?.label} color={STATUS_CONFIG[client.status]?.color} sx={{ fontWeight:600 }} />
        </Box>
      </Box>

      {/* Revenue summary */}
      {invoices.length > 0 && (
        <Grid container spacing={2} mb={3}>
          {[
            { label:"Total Invoiced", value:`₹${totalRevenue.toLocaleString("en-IN")}`,  color:"#1a56db" },
            { label:"Received",       value:`₹${totalPaid.toLocaleString("en-IN")}`,     color:"#0e9f6e" },
            { label:"Pending",        value:`₹${totalPending.toLocaleString("en-IN")}`,  color:"#e02424" },
          ].map(c => (
            <Grid item xs={12} sm={4} key={c.label}>
              <Card><Box sx={{ p:2 }}>
                <Typography variant="body2" color="text.secondary">{c.label}</Typography>
                <Typography variant="h5" fontWeight={700} sx={{ color:c.color }}>{c.value}</Typography>
              </Box></Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Grid container spacing={2}>
        {/* LEFT */}
        <Grid item xs={12} md={8}>
          {/* Basic info */}
          <Section title="Basic Information">
            <Grid container spacing={1}>
              <Grid item xs={6}><InfoRow label="Business"    value={client.businessName} /></Grid>
              <Grid item xs={6}><InfoRow label="Owner"       value={client.ownerName} /></Grid>
              <Grid item xs={6}><InfoRow label="Mobile"      value={client.mobile} /></Grid>
              <Grid item xs={6}><InfoRow label="Email"       value={client.email} /></Grid>
              <Grid item xs={6}><InfoRow label="City"        value={client.city} /></Grid>
              <Grid item xs={6}><InfoRow label="Industry"    value={client.industry} /></Grid>
              <Grid item xs={6}><InfoRow label="Website"     value={client.website} /></Grid>
              <Grid item xs={6}><InfoRow label="Instagram"   value={client.instagramPage} /></Grid>
            </Grid>
          </Section>

          {/* Onboarding data */}
          <Section title="Onboarding Details">
            <InfoRow label="Business Description"  value={client.description} />
            <InfoRow label="Target Audience"       value={client.targetAudience} />
            <InfoRow label="Services"              value={client.services} />
            <InfoRow label="USP"                   value={client.usp} />
            <InfoRow label="Brand Tone"            value={client.tone} />
            <InfoRow label="Content Types"         value={client.contentTypes} />
            <InfoRow label="Platforms"             value={client.platforms} />
            <InfoRow label="Goal"                  value={client.goal} />
            <InfoRow label="Brand Colors"          value={client.brandColors} />
            <InfoRow label="Inspiration"           value={client.inspirationLink} />
          </Section>

          {/* Package & Deliverables */}
          <Section title="Package & Deliverables"
            action={canManage && <Button size="small" variant="outlined" onClick={handleSave} disabled={saving}>Save Package</Button>}
          >
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" label="Package Name" value={pkgForm.name}
                  onChange={e => setPkgForm({...pkgForm, name:e.target.value})} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" label="Monthly Amount (₹)" type="number" value={pkgForm.amount}
                  onChange={e => setPkgForm({...pkgForm, amount:e.target.value})} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" label="Start Date" type="date" InputLabelProps={{ shrink:true }}
                  value={pkgForm.startDate} onChange={e => setPkgForm({...pkgForm, startDate:e.target.value})} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" label="End Date" type="date" InputLabelProps={{ shrink:true }}
                  value={pkgForm.endDate} onChange={e => setPkgForm({...pkgForm, endDate:e.target.value})} />
              </Grid>
            </Grid>

            <Typography variant="body2" fontWeight={600} mb={1}>Deliverables</Typography>
            {deliverables.length > 0 && (
              <TableContainer sx={{ mb:2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ background:"#f9fafb" }}>
                      <TableCell sx={{ fontWeight:600, fontSize:12 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight:600, fontSize:12 }}>Qty/Month</TableCell>
                      <TableCell sx={{ fontWeight:600, fontSize:12 }}>Note</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deliverables.map((d,i) => (
                      <TableRow key={i}>
                        <TableCell><Chip label={d.type} size="small" /></TableCell>
                        <TableCell sx={{ fontWeight:600 }}>{d.quantity}</TableCell>
                        <TableCell sx={{ fontSize:12, color:"text.secondary" }}>{d.note || "—"}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => removeDeliverable(i)}><DeleteIcon fontSize="small" /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {canManage && (
              <Box sx={{ display:"flex", gap:1, flexWrap:"wrap", alignItems:"center" }}>
                <TextField size="small" label="Type" placeholder="Reels, Posts..." value={newDel.type}
                  onChange={e => setNewDel({...newDel, type:e.target.value})} sx={{ flex:1, minWidth:120 }} />
                <TextField size="small" label="Qty" type="number" value={newDel.quantity}
                  onChange={e => setNewDel({...newDel, quantity:e.target.value})} sx={{ width:80 }} />
                <TextField size="small" label="Note" value={newDel.note}
                  onChange={e => setNewDel({...newDel, note:e.target.value})} sx={{ flex:1, minWidth:120 }} />
                <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={addDeliverable}>Add</Button>
              </Box>
            )}
          </Section>

          {/* Recent Invoices */}
          {invoices.length > 0 && (
            <Section title="Recent Invoices"
              action={<Button size="small" component={Link} to={`/admin/invoices?clientId=${id}`}>View All</Button>}
            >
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ background:"#f9fafb" }}>
                      {["Invoice #","Month","Total","Paid","Pending","Status"].map(h => (
                        <TableCell key={h} sx={{ fontWeight:600, fontSize:12, color:"text.secondary" }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoices.slice(0,5).map(inv => (
                      <TableRow key={inv._id} hover sx={{ cursor:"pointer" }}
                        onClick={() => navigate(`/admin/invoices/${inv._id}`)}>
                        <TableCell sx={{ fontSize:12, fontFamily:"monospace" }}>{inv.invoiceNumber}</TableCell>
                        <TableCell sx={{ fontSize:12 }}>{inv.month || "—"}</TableCell>
                        <TableCell sx={{ fontWeight:600 }}>₹{Number(inv.totalAmount).toLocaleString("en-IN")}</TableCell>
                        <TableCell sx={{ color:"#0e9f6e", fontWeight:600 }}>₹{Number(inv.paidAmount).toLocaleString("en-IN")}</TableCell>
                        <TableCell sx={{ color: inv.pendingAmount > 0 ? "#e02424" : "text.secondary", fontWeight:600 }}>
                          ₹{Number(inv.pendingAmount).toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell>
                          <Chip label={inv.paymentStatus} color={PAYMENT_STATUS_COLOR[inv.paymentStatus]} size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Section>
          )}
        </Grid>

        {/* RIGHT — admin controls */}
        {canManage && (
          <Grid item xs={12} md={4}>
            <Card sx={{ position:{ md:"sticky" }, top:80 }}>
              <CardContent>
                <Typography variant="h6" mb={1.5}>Admin Controls</Typography>
                <Divider sx={{ mb:2 }} />
                <FormControl fullWidth size="small" sx={{ mb:2 }}>
                  <InputLabel>Status</InputLabel>
                  <Select value={adminForm.status} label="Status"
                    onChange={e => setAdminForm({...adminForm, status:e.target.value})}>
                    {STATUS_OPTIONS.map(s => (
                      <MenuItem key={s} value={s}>
                        <Chip label={STATUS_CONFIG[s].label} color={STATUS_CONFIG[s].color} size="small" />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField fullWidth size="small" label="Internal Notes" multiline rows={4} sx={{ mb:2 }}
                  value={adminForm.internalNotes}
                  onChange={e => setAdminForm({...adminForm, internalNotes:e.target.value})}
                  placeholder="Team notes, strategy, client behaviour..."
                />
                <Button fullWidth variant="contained" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Divider sx={{ my:2 }} />
                <Button fullWidth variant="outlined" color="primary" startIcon={<ReceiptIcon />}
                  onClick={() => navigate(`/admin/invoices/new?clientId=${id}&clientName=${client.businessName}`)}>
                  Create Invoice
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      <Snackbar open={Boolean(toast)} autoHideDuration={3000} onClose={() => setToast("")} message={toast} />
    </Box>
  );
}
