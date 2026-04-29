import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button, Divider,
  TextField, Select, MenuItem, FormControl, InputLabel, Alert,
  Snackbar, CircularProgress, IconButton, Tooltip, Table, TableBody,
  TableCell, TableHead, TableRow, TableContainer, Tabs, Tab,
  Switch, FormControlLabel, Dialog, DialogTitle, DialogContent,
  DialogActions,
} from "@mui/material";
import ArrowBackIcon   from "@mui/icons-material/ArrowBack";
import WhatsAppIcon    from "@mui/icons-material/WhatsApp";
import ReceiptIcon     from "@mui/icons-material/Receipt";
import PersonIcon      from "@mui/icons-material/PersonAdd";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AutoIcon        from "@mui/icons-material/Autorenew";
import CalendarIcon    from "@mui/icons-material/CalendarMonth";
import NotifIcon       from "@mui/icons-material/NotificationsActive";
import { getClientById, updateClient, getInvoices } from "../../api/clientsApi";
import { setupPortalAccess, setupAutoInvoice, getAutoInvoiceConfig, generateAutoInvoice, sendPaymentReminders } from "../../api/portalApi";
import { useAuth } from "../../context/AuthContext";

const STATUS_OPTIONS = ["onboarding","active","paused","churned"];
const STATUS_CONFIG  = {
  onboarding:{ label:"Onboarding", color:"info" },
  active:    { label:"Active",     color:"success" },
  paused:    { label:"Paused",     color:"warning" },
  churned:   { label:"Churned",    color:"error" },
};
const PAY_COLOR = { pending:"warning", partial:"info", paid:"success" };

function InfoRow({ label, value }) {
  if (!value || (Array.isArray(value) && !value.length)) return null;
  return (
    <Box sx={{ mb:1.5 }}>
      <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{Array.isArray(value)?value.join(", "):value}</Typography>
    </Box>
  );
}

function SectionCard({ title, children, action }) {
  return (
    <Card sx={{ mb:2 }}>
      <CardContent>
        <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:1.5 }}>
          <Typography variant="h6">{title}</Typography>
          {action}
        </Box>
        <Divider sx={{ mb:2 }}/>
        {children}
      </CardContent>
    </Card>
  );
}

export default function ClientDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { canManage, isAdmin } = useAuth();

  const [client, setClient]     = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState("");
  const [tab, setTab]           = useState(0);

  // Admin controls
  const [adminForm, setAdminForm] = useState({ status:"onboarding", internalNotes:"" });

  // Package
  const [pkgForm, setPkgForm]     = useState({ name:"", amount:"", startDate:"", endDate:"" });
  const [deliverables, setDeliverables] = useState([]);
  const [newDel, setNewDel]       = useState({ type:"", quantity:"", note:"" });

  // Portal access setup
  const [portalEmail, setPortalEmail]   = useState("");
  const [portalMobile, setPortalMobile] = useState("");
  const [portalPassword, setPortalPassword] = useState("");
  const [portalSaving, setPortalSaving] = useState(false);
  const [portalDone, setPortalDone]     = useState(false);

  // Auto invoice config
  const [autoConfig, setAutoConfig]     = useState(null);
  const [autoForm, setAutoForm]         = useState({
    packageAmount:"", packageName:"", gstPercent:"0",
    notes:"", enabled:true,
    reminders:{ day5:true, day10:true, day15:true },
  });
  const [autoSaving, setAutoSaving]     = useState(false);
  const [genLoading, setGenLoading]     = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [cr, ir, acr] = await Promise.all([
        getClientById(id),
        getInvoices({ clientId: id }),
        getAutoInvoiceConfig(id).catch(() => ({ data: null })),
      ]);
      const c = cr.data;
      setClient(c);
      setAdminForm({ status: c.status||"onboarding", internalNotes: c.internalNotes||"" });
      setPkgForm({
        name:      c.package?.name      || "",
        amount:    c.package?.amount    || "",
        startDate: c.package?.startDate ? c.package.startDate.slice(0,10) : "",
        endDate:   c.package?.endDate   ? c.package.endDate.slice(0,10)   : "",
      });
      setDeliverables(c.package?.deliverables || []);
      setInvoices(ir.data.invoices || []);

      // Auto invoice config
      if (acr.data) {
        setAutoConfig(acr.data);
        setAutoForm({
          packageAmount: acr.data.packageAmount || "",
          packageName:   acr.data.packageName   || "",
          gstPercent:    acr.data.gstPercent    || "0",
          notes:         acr.data.notes         || "",
          enabled:       acr.data.enabled ?? true,
          reminders:     acr.data.reminders || { day5:true, day10:true, day15:true },
        });
      } else {
        // Pre-fill from package
        setAutoForm(prev => ({
          ...prev,
          packageAmount: c.package?.amount || "",
          packageName:   c.package?.name   || "Monthly Digital Marketing Service",
        }));
      }

      // Pre-fill portal fields from client
      setPortalEmail(c.email   || "");
      setPortalMobile(c.mobile || "");
    } catch { navigate("/admin/clients"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateClient(id, { ...adminForm, package: { ...pkgForm, deliverables } });
      setToast("Saved!"); load();
    } catch { setToast("Save failed."); }
    finally { setSaving(false); }
  };

  // Setup portal access
  const handlePortalSetup = async () => {
    if (!portalEmail && !portalMobile) { setToast("Email ya mobile required chhe."); return; }
    setPortalSaving(true);
    try {
      await setupPortalAccess({ clientId: id, email: portalEmail, mobile: portalMobile, password: portalPassword || undefined });
      setPortalDone(true);
      setToast("Portal access setup done! Client ne login credentials moko. ✅");
    } catch (err) { setToast(err.response?.data?.message || "Setup failed."); }
    finally { setPortalSaving(false); }
  };

  const copyPortalLink = () => {
    const link = `${window.location.origin}/portal/login`;
    navigator.clipboard.writeText(link);
    setToast("Portal login link copied!");
  };

  const sendPortalWhatsApp = () => {
    if (!client) return;
    const link = `${window.location.origin}/portal/login`;
    const msg  = encodeURIComponent(
      `Hi ${client.ownerName} 👋\n\n` +
      `*SocialFlipss Client Portal Access* 🎉\n\n` +
      `Tamaro personal portal ready chhe! Tyaa tamne milshhe:\n` +
      `✅ Tamari reels ane content\n` +
      `🧾 Invoices ane payment history\n` +
      `📅 Shoot schedule\n` +
      `🔔 Updates ane notifications\n\n` +
      `Portal Link: ${link}\n` +
      `Email: ${portalEmail}\n` +
      (portalPassword ? `Password: ${portalPassword}\n` : "OTP login use karo.\n") +
      `\n– SocialFlipss Team 🙏`
    );
    window.open(`https://wa.me/91${client.mobile.replace(/\D/g,"")}?text=${msg}`, "_blank");
  };

  // Auto invoice
  const handleAutoInvoiceSave = async () => {
    setAutoSaving(true);
    try {
      await setupAutoInvoice({ clientId: id, ...autoForm });
      setToast("Auto invoice configured! ✅"); load();
    } catch (err) { setToast(err.response?.data?.message || "Failed."); }
    finally { setAutoSaving(false); }
  };

  const handleGenerateNow = async () => {
    setGenLoading(true);
    try {
      const res = await generateAutoInvoice(id);
      setToast(`Invoice generated! ${res.data.invoice.invoiceNumber} ✅`);
      load();
    } catch (err) { setToast(err.response?.data?.message || "Generate failed."); }
    finally { setGenLoading(false); }
  };

  const addDeliverable = () => {
    if (!newDel.type || !newDel.quantity) return;
    setDeliverables([...deliverables, { ...newDel, quantity: Number(newDel.quantity) }]);
    setNewDel({ type:"", quantity:"", note:"" });
  };

  const openWhatsApp = () => {
    if (!client) return;
    const msg = encodeURIComponent(`Hi ${client.ownerName}, SocialFlipss team thi update share karna tha.`);
    window.open(`https://wa.me/91${client.mobile.replace(/\D/g,"")}?text=${msg}`, "_blank");
  };

  if (loading) return <Box sx={{ display:"flex", justifyContent:"center", pt:8 }}><CircularProgress/></Box>;
  if (!client) return <Alert severity="error">Client not found</Alert>;

  const totalRevenue = invoices.reduce((s,i)=>s+i.totalAmount,0);
  const totalPaid    = invoices.reduce((s,i)=>s+i.paidAmount,0);
  const totalPending = invoices.reduce((s,i)=>s+i.pendingAmount,0);

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon/>} onClick={()=>navigate("/admin/clients")} sx={{ mb:2 }}>Back to Clients</Button>

      {/* Header */}
      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", mb:3, flexWrap:"wrap", gap:2 }}>
        <Box>
          <Typography variant="h5">{client.businessName}</Typography>
          <Typography variant="body2" color="text.secondary">
            {client.ownerName} · {client.mobile}{client.city?` · ${client.city}`:""}
          </Typography>
        </Box>
        <Box sx={{ display:"flex", gap:1, flexWrap:"wrap" }}>
          <Button variant="outlined" color="success" size="small" startIcon={<WhatsAppIcon/>} onClick={openWhatsApp}>WhatsApp</Button>
          <Button variant="outlined" size="small" startIcon={<ReceiptIcon/>} onClick={()=>navigate(`/admin/invoices?clientId=${id}`)}>
            Invoices ({invoices.length})
          </Button>
          <Button variant="outlined" size="small" startIcon={<CalendarIcon/>} onClick={()=>navigate(`/admin/projects`)}>
            Projects
          </Button>
          <Chip label={STATUS_CONFIG[client.status]?.label} color={STATUS_CONFIG[client.status]?.color} sx={{ fontWeight:600 }}/>
        </Box>
      </Box>

      {/* Revenue summary */}
      {invoices.length > 0 && (
        <Grid container spacing={2} mb={3}>
          {[
            { label:"Total Invoiced", value:`₹${totalRevenue.toLocaleString("en-IN")}`, color:"#1a56db" },
            { label:"Received",       value:`₹${totalPaid.toLocaleString("en-IN")}`,    color:"#0e9f6e" },
            { label:"Pending",        value:`₹${totalPending.toLocaleString("en-IN")}`, color:"#e02424" },
          ].map(c=>(
            <Grid item xs={12} sm={4} key={c.label}>
              <Card><Box sx={{ p:2 }}>
                <Typography variant="body2" color="text.secondary">{c.label}</Typography>
                <Typography variant="h5" fontWeight={700} sx={{ color:c.color }}>{c.value}</Typography>
              </Box></Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Tabs */}
      <Card sx={{ mb:2 }}>
        <Tabs value={tab} onChange={(_,v)=>setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label="📋 Info & Package" />
          <Tab label="🔐 Portal Access" />
          <Tab label="🧾 Auto Invoice" />
          <Tab label="📜 Invoice History" />
        </Tabs>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>

          {/* TAB 0 — Info & Package */}
          {tab === 0 && (
            <>
              <SectionCard title="Basic Information">
                <Grid container spacing={1}>
                  <Grid item xs={6}><InfoRow label="Business"   value={client.businessName}/></Grid>
                  <Grid item xs={6}><InfoRow label="Owner"      value={client.ownerName}/></Grid>
                  <Grid item xs={6}><InfoRow label="Mobile"     value={client.mobile}/></Grid>
                  <Grid item xs={6}><InfoRow label="Email"      value={client.email}/></Grid>
                  <Grid item xs={6}><InfoRow label="City"       value={client.city}/></Grid>
                  <Grid item xs={6}><InfoRow label="Industry"   value={client.industry}/></Grid>
                  <Grid item xs={6}><InfoRow label="Website"    value={client.website}/></Grid>
                  <Grid item xs={6}><InfoRow label="Instagram"  value={client.instagramPage}/></Grid>
                </Grid>
              </SectionCard>

              <SectionCard title="Onboarding Details">
                <InfoRow label="Description"    value={client.description}/>
                <InfoRow label="Target Audience" value={client.targetAudience}/>
                <InfoRow label="USP"            value={client.usp}/>
                <InfoRow label="Brand Tone"     value={client.tone}/>
                <InfoRow label="Content Types"  value={client.contentTypes}/>
                <InfoRow label="Platforms"      value={client.platforms}/>
                <InfoRow label="Goal"           value={client.goal}/>
                <InfoRow label="Brand Colors"   value={client.brandColors}/>
              </SectionCard>

              <SectionCard title="Package & Deliverables"
                action={canManage && <Button size="small" variant="outlined" onClick={handleSave} disabled={saving}>Save</Button>}
              >
                <Grid container spacing={2} mb={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth size="small" label="Package Name" value={pkgForm.name}
                      onChange={e=>setPkgForm({...pkgForm,name:e.target.value})}/>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth size="small" label="Monthly Amount (₹)" type="number" value={pkgForm.amount}
                      onChange={e=>setPkgForm({...pkgForm,amount:e.target.value})}/>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth size="small" label="Start Date" type="date" InputLabelProps={{ shrink:true }}
                      value={pkgForm.startDate} onChange={e=>setPkgForm({...pkgForm,startDate:e.target.value})}/>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth size="small" label="End Date" type="date" InputLabelProps={{ shrink:true }}
                      value={pkgForm.endDate} onChange={e=>setPkgForm({...pkgForm,endDate:e.target.value})}/>
                  </Grid>
                </Grid>
                {/* Deliverables */}
                {deliverables.map((d,i)=>(
                  <Box key={i} sx={{ display:"flex", alignItems:"center", gap:1, mb:1, p:1, bgcolor:"#f9fafb", borderRadius:1.5 }}>
                    <Chip label={d.type} size="small"/>
                    <Typography variant="body2">{d.quantity}/month</Typography>
                    {d.note && <Typography variant="caption" color="text.secondary">{d.note}</Typography>}
                    <IconButton size="small" onClick={()=>setDeliverables(deliverables.filter((_,idx)=>idx!==i))}>✕</IconButton>
                  </Box>
                ))}
                {canManage && (
                  <Box sx={{ display:"flex", gap:1, mt:1, flexWrap:"wrap" }}>
                    <TextField size="small" label="Type" placeholder="Reels" value={newDel.type}
                      onChange={e=>setNewDel({...newDel,type:e.target.value})} sx={{ flex:1, minWidth:100 }}/>
                    <TextField size="small" label="Qty" type="number" value={newDel.quantity}
                      onChange={e=>setNewDel({...newDel,quantity:e.target.value})} sx={{ width:70 }}/>
                    <TextField size="small" label="Note" value={newDel.note}
                      onChange={e=>setNewDel({...newDel,note:e.target.value})} sx={{ flex:1, minWidth:100 }}/>
                    <Button variant="outlined" size="small" onClick={addDeliverable}>Add</Button>
                  </Box>
                )}
              </SectionCard>
            </>
          )}

          {/* TAB 1 — Portal Access */}
          {tab === 1 && (
            <SectionCard title="🔐 Client Portal Access"
              action={portalDone && <Chip label="✅ Active" color="success" size="small"/>}
            >
              <Alert severity="info" sx={{ mb:2 }}>
                Client portal setup karva thi client khud login kari shake — apni reels approve kare, invoices dekhe, shoot schedule dekhe.
              </Alert>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Email" type="email" value={portalEmail}
                    onChange={e=>setPortalEmail(e.target.value)} placeholder="client@gmail.com"/>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Mobile (for OTP)" value={portalMobile}
                    onChange={e=>setPortalMobile(e.target.value)} placeholder="9876543210"/>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" label="Password (optional — OTP login pn available chhe)" type="password"
                    value={portalPassword} onChange={e=>setPortalPassword(e.target.value)}
                    placeholder="Leave blank for OTP-only login"/>
                </Grid>
              </Grid>
              <Box sx={{ display:"flex", gap:1.5, mt:2.5, flexWrap:"wrap" }}>
                <Button variant="contained" startIcon={<PersonIcon/>} onClick={handlePortalSetup} disabled={portalSaving}>
                  {portalSaving ? <CircularProgress size={20} color="inherit"/> : portalDone ? "Update Access" : "Setup Portal Access"}
                </Button>
                <Button variant="outlined" startIcon={<ContentCopyIcon/>} onClick={copyPortalLink}>
                  Copy Login Link
                </Button>
                <Button variant="contained" color="success" startIcon={<WhatsAppIcon/>} onClick={sendPortalWhatsApp}>
                  Send on WhatsApp
                </Button>
              </Box>
              {portalDone && (
                <Alert severity="success" sx={{ mt:2 }}>
                  Portal access ready! Client ne WhatsApp par credentials send karo. Portal link: <strong>{window.location.origin}/portal/login</strong>
                </Alert>
              )}
            </SectionCard>
          )}

          {/* TAB 2 — Auto Invoice */}
          {tab === 2 && (
            <SectionCard title="🧾 Auto Invoice Configuration">
              <Alert severity="info" sx={{ mb:2 }}>
                Client na onboarding date anniversary par ({client.onboardingDate ? new Date(client.onboardingDate).getDate() : "?"} tarikh) automatically invoice generate thashe.
                {autoConfig && <><br/><strong>Last generated: {autoConfig.lastGeneratedMonth || "Never"}</strong></>}
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Package Name" value={autoForm.packageName}
                    onChange={e=>setAutoForm({...autoForm,packageName:e.target.value})} placeholder="Monthly Social Media Management"/>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Monthly Amount (₹) *" type="number" value={autoForm.packageAmount}
                    onChange={e=>setAutoForm({...autoForm,packageAmount:e.target.value})}/>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>GST %</InputLabel>
                    <Select value={autoForm.gstPercent} label="GST %" onChange={e=>setAutoForm({...autoForm,gstPercent:e.target.value})}>
                      {[0,5,12,18].map(g=><MenuItem key={g} value={g}>{g}%</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={<Switch checked={autoForm.enabled} onChange={e=>setAutoForm({...autoForm,enabled:e.target.checked})} color="success"/>}
                    label="Auto invoice enabled"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" label="Invoice Notes" value={autoForm.notes}
                    onChange={e=>setAutoForm({...autoForm,notes:e.target.value})} placeholder="Payment info, bank details..."/>
                </Grid>
              </Grid>

              <Box sx={{ mt:2, p:2, bgcolor:"#f9fafb", borderRadius:2 }}>
                <Typography variant="body2" fontWeight={600} mb={1}>Payment Reminders (auto email)</Typography>
                <Box sx={{ display:"flex", gap:2, flexWrap:"wrap" }}>
                  {[["day5","5 days after"],["day10","10 days after"],["day15","15 days after"]].map(([key,label])=>(
                    <FormControlLabel key={key}
                      control={<Switch checked={autoForm.reminders[key]} onChange={e=>setAutoForm({...autoForm,reminders:{...autoForm.reminders,[key]:e.target.checked}})} size="small"/>}
                      label={<Typography variant="body2">{label}</Typography>}
                    />
                  ))}
                </Box>
              </Box>

              <Box sx={{ display:"flex", gap:1.5, mt:2.5, flexWrap:"wrap" }}>
                <Button variant="contained" startIcon={<AutoIcon/>} onClick={handleAutoInvoiceSave} disabled={autoSaving}>
                  {autoSaving ? <CircularProgress size={20} color="inherit"/> : autoConfig ? "Update Config" : "Save Config"}
                </Button>
                {autoConfig && (
                  <Button variant="outlined" color="success" onClick={handleGenerateNow} disabled={genLoading}>
                    {genLoading ? <CircularProgress size={20} color="inherit"/> : "Generate Invoice Now"}
                  </Button>
                )}
              </Box>
            </SectionCard>
          )}

          {/* TAB 3 — Invoice History */}
          {tab === 3 && (
            <SectionCard title="📜 Invoice History"
              action={<Button size="small" onClick={()=>navigate(`/admin/invoices/new?clientId=${id}`)}>+ New Invoice</Button>}
            >
              {invoices.length === 0
                ? <Typography color="text.secondary" variant="body2">Koi invoice nathi yet.</Typography>
                : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ background:"#f9fafb" }}>
                          {["Invoice #","Month","Total","Paid","Pending","Status"].map(h=>(
                            <TableCell key={h} sx={{ fontWeight:600, fontSize:12, color:"text.secondary" }}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {invoices.map(inv=>(
                          <TableRow key={inv._id} hover sx={{ cursor:"pointer" }}
                            onClick={()=>navigate(`/admin/invoices/${inv._id}`)}>
                            <TableCell sx={{ fontFamily:"monospace", fontSize:12, color:"#1a56db", fontWeight:600 }}>{inv.invoiceNumber}</TableCell>
                            <TableCell sx={{ fontSize:12 }}>{inv.month||"—"}</TableCell>
                            <TableCell sx={{ fontWeight:600 }}>₹{Number(inv.totalAmount).toLocaleString("en-IN")}</TableCell>
                            <TableCell sx={{ color:"#0e9f6e", fontWeight:600 }}>₹{Number(inv.paidAmount).toLocaleString("en-IN")}</TableCell>
                            <TableCell sx={{ color:inv.pendingAmount>0?"#e02424":"text.secondary", fontWeight:600 }}>
                              ₹{Number(inv.pendingAmount).toLocaleString("en-IN")}
                            </TableCell>
                            <TableCell>
                              <Chip label={inv.paymentStatus} color={PAY_COLOR[inv.paymentStatus]} size="small"/>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )
              }
            </SectionCard>
          )}
        </Grid>

        {/* RIGHT — Admin controls */}
        {canManage && (
          <Grid item xs={12} md={4}>
            <Card sx={{ position:{ md:"sticky" }, top:80 }}>
              <CardContent>
                <Typography variant="h6" mb={1.5}>Admin Controls</Typography>
                <Divider sx={{ mb:2 }}/>
                <FormControl fullWidth size="small" sx={{ mb:2 }}>
                  <InputLabel>Status</InputLabel>
                  <Select value={adminForm.status} label="Status"
                    onChange={e=>setAdminForm({...adminForm,status:e.target.value})}>
                    {STATUS_OPTIONS.map(s=>(
                      <MenuItem key={s} value={s}>
                        <Chip label={STATUS_CONFIG[s].label} color={STATUS_CONFIG[s].color} size="small"/>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField fullWidth size="small" label="Internal Notes" multiline rows={4} sx={{ mb:2 }}
                  value={adminForm.internalNotes}
                  onChange={e=>setAdminForm({...adminForm,internalNotes:e.target.value})}
                  placeholder="Team notes, strategy..."/>
                <Button fullWidth variant="contained" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>

                <Divider sx={{ my:2 }}/>

                {/* Quick actions */}
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>Quick Actions</Typography>
                <Box sx={{ display:"flex", flexDirection:"column", gap:1 }}>
                  <Button size="small" variant="outlined" startIcon={<ReceiptIcon/>}
                    onClick={()=>navigate(`/admin/invoices/new?clientId=${id}&clientName=${client.businessName}`)}>
                    Create Invoice
                  </Button>
                  <Button size="small" variant="outlined" startIcon={<PersonIcon/>}
                    onClick={()=>setTab(1)}>
                    Setup Portal Access
                  </Button>
                  <Button size="small" variant="outlined" startIcon={<AutoIcon/>}
                    onClick={()=>setTab(2)}>
                    Configure Auto Invoice
                  </Button>
                  <Button size="small" variant="outlined" color="success" startIcon={<WhatsAppIcon/>}
                    onClick={openWhatsApp}>
                    WhatsApp Client
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      <Snackbar open={Boolean(toast)} autoHideDuration={4000} onClose={()=>setToast("")} message={toast}/>
    </Box>
  );
}
