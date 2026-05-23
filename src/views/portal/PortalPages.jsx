// PortalInvoices.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography, Card, Chip, CircularProgress, Alert, Divider, Grid, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getPortalInvoices, getPortalInvoiceById } from "../../api/portalApi";

const PAY_COLOR = { pending:"warning", partial:"info", paid:"success" };
const PAY_LABEL = { pending:"Pending", partial:"Partial", paid:"Paid ✓" };

export function PortalInvoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    getPortalInvoices().then(r=>setInvoices(r.data)).finally(()=>setLoading(false));
  }, []);

  const totalPaid    = invoices.reduce((s,i)=>s+i.paidAmount,0);
  const totalPending = invoices.reduce((s,i)=>s+i.pendingAmount,0);

  return (
    <Box>
      <Typography variant="h5" mb={0.5}>Invoices</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>{invoices.length} total invoices</Typography>

      <Grid container spacing={2} mb={3}>
        {[
          { label:"Total Paid",    value:`₹${totalPaid.toLocaleString("en-IN")}`,    color:"#0e9f6e" },
          { label:"Total Pending", value:`₹${totalPending.toLocaleString("en-IN")}`, color:"#e02424" },
        ].map(c=>(
          <Grid item xs={6} key={c.label}>
            <Card><Box sx={{ p:2 }}>
              <Typography variant="body2" color="text.secondary">{c.label}</Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color:c.color }}>{c.value}</Typography>
            </Box></Card>
          </Grid>
        ))}
      </Grid>

      {loading ? <Box sx={{ display:"flex", justifyContent:"center", pt:4 }}><CircularProgress/></Box> : (
        <Card>
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
                  <TableRow key={inv._id} hover sx={{ cursor:"pointer" }} onClick={()=>navigate(`/portal/invoices/${inv._id}`)}>
                    <TableCell sx={{ fontFamily:"monospace", fontSize:12, color:"#1a56db", fontWeight:600 }}>{inv.invoiceNumber}</TableCell>
                    <TableCell>{inv.month||"—"}</TableCell>
                    <TableCell sx={{ fontWeight:600 }}>₹{Number(inv.totalAmount).toLocaleString("en-IN")}</TableCell>
                    <TableCell sx={{ color:"#0e9f6e", fontWeight:600 }}>₹{Number(inv.paidAmount).toLocaleString("en-IN")}</TableCell>
                    <TableCell sx={{ color:inv.pendingAmount>0?"#e02424":"text.secondary", fontWeight:600 }}>
                      ₹{Number(inv.pendingAmount).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell><Chip label={PAY_LABEL[inv.paymentStatus]} color={PAY_COLOR[inv.paymentStatus]} size="small"/></TableCell>
                  </TableRow>
                ))}
                {invoices.length===0 && <TableRow><TableCell colSpan={6} align="center" sx={{ py:5, color:"text.secondary" }}>Koi invoice nathi yet.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
}

export function PortalInvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ getPortalInvoiceById(id).then(r=>setInvoice(r.data)).finally(()=>setLoading(false)); },[id]);

  if (loading) return <Box sx={{ display:"flex", justifyContent:"center", pt:6 }}><CircularProgress/></Box>;
  if (!invoice) return <Alert severity="error">Invoice not found</Alert>;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon/>} onClick={()=>navigate("/portal/invoices")} sx={{ mb:2 }}>Back</Button>
      <Box sx={{ display:"flex", justifyContent:"space-between", mb:3, flexWrap:"wrap", gap:1 }}>
        <Box>
          <Typography variant="h5" fontFamily="monospace">{invoice.invoiceNumber}</Typography>
          <Typography variant="body2" color="text.secondary">{invoice.month}</Typography>
        </Box>
        <Chip label={invoice.paymentStatus.toUpperCase()} color={PAY_COLOR[invoice.paymentStatus]} sx={{ fontWeight:700 }}/>
      </Box>
      <Card>
        <Box sx={{ p:3 }}>
          <TableContainer sx={{ mb:2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ background:"#f9fafb" }}>
                  {["Description","Qty","Rate","Amount"].map(h=><TableCell key={h} sx={{ fontWeight:600, fontSize:12 }}>{h}</TableCell>)}
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.items.map((item,i)=>(
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
          <Box sx={{ display:"flex", justifyContent:"flex-end" }}>
            <Box sx={{ width:240 }}>
              <Box sx={{ display:"flex", justifyContent:"space-between", mb:0.75 }}>
                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                <Typography variant="body2">₹{Number(invoice.subtotal).toLocaleString("en-IN")}</Typography>
              </Box>
              {invoice.gstAmount>0 && (
                <Box sx={{ display:"flex", justifyContent:"space-between", mb:0.75 }}>
                  <Typography variant="body2" color="text.secondary">GST ({invoice.gstPercent}%)</Typography>
                  <Typography variant="body2">₹{Number(invoice.gstAmount).toLocaleString("en-IN")}</Typography>
                </Box>
              )}
              <Divider sx={{ my:1 }}/>
              <Box sx={{ display:"flex", justifyContent:"space-between", mb:0.75 }}>
                <Typography fontWeight={700}>Total</Typography>
                <Typography fontWeight={700} color="primary">₹{Number(invoice.totalAmount).toLocaleString("en-IN")}</Typography>
              </Box>
              <Box sx={{ display:"flex", justifyContent:"space-between", mb:0.75 }}>
                <Typography variant="body2" color="#0e9f6e" fontWeight={600}>Paid</Typography>
                <Typography variant="body2" color="#0e9f6e" fontWeight={600}>₹{Number(invoice.paidAmount).toLocaleString("en-IN")}</Typography>
              </Box>
              {invoice.pendingAmount>0 && (
                <Box sx={{ display:"flex", justifyContent:"space-between", p:1.5, background:"#fee2e2", borderRadius:2 }}>
                  <Typography fontWeight={700} color="#991b1b">Balance Due</Typography>
                  <Typography fontWeight={700} color="#991b1b">₹{Number(invoice.pendingAmount).toLocaleString("en-IN")}</Typography>
                </Box>
              )}
            </Box>
          </Box>
          {invoice.pendingAmount>0 && (
            <Alert severity="info" sx={{ mt:2 }}>Payment maate SocialFlipss team ne contact karo. 📞</Alert>
          )}
        </Box>
      </Card>
    </Box>
  );
}

// PortalSchedule.jsx
export function PortalSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(()=>{
    import("../../api/portalApi").then(m=>m.getPortalSchedule()).then(r=>setSchedules(r.data)).finally(()=>setLoading(false));
  },[]);

  const SLOT_COLOR = { morning:"#fef3c7", afternoon:"#dbeafe", evening:"#ede9fe" };
  const SLOT_TEXT  = { morning:"#92400e", afternoon:"#1e40af", evening:"#6d28d9" };
  const STATUS_CLR = { scheduled:"info", done:"success", cancelled:"error", rescheduled:"warning" };

  return (
    <Box>
      <Typography variant="h5" mb={0.5}>Shoot Schedule</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>Tamara upcoming ane past shoot sessions</Typography>
      {loading ? <Box sx={{ display:"flex", justifyContent:"center", pt:4 }}><CircularProgress/></Box> :
       schedules.length===0 ? <Card><Box sx={{ py:6, textAlign:"center", color:"text.secondary" }}>Koi schedule nathi yet.</Box></Card> :
       schedules.map(sch=>(
        <Card key={sch._id} sx={{ mb:2 }}>
          <Box sx={{ p:2.5 }}>
            <Typography variant="h6">{sch.projectId?.name||"Project"}</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>{sch.totalReels} reels · {sch.startDate} to {sch.endDate}</Typography>
            {sch.slots.map(slot=>{
              const dateObj = new Date(slot.date+"T00:00:00");
              const isPast  = dateObj < new Date();
              return (
                <Box key={slot._id} sx={{ display:"flex", alignItems:"center", gap:2, py:1, borderBottom:"0.5px solid #f3f4f6", opacity: isPast&&slot.status==="scheduled"?0.5:1 }}>
                  <Box sx={{ minWidth:100 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {dateObj.toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})}
                    </Typography>
                  </Box>
                  <Chip label={slot.time} size="small" sx={{ bgcolor:SLOT_COLOR[slot.timeSlot], color:SLOT_TEXT[slot.timeSlot], fontWeight:600, fontSize:11 }}/>
                  <Chip label={`🎬 ${slot.reelCount}`} size="small" sx={{ bgcolor:"#ede9fe", color:"#6d28d9" }}/>
                  <Chip label={slot.status} color={STATUS_CLR[slot.status]||"default"} size="small"/>
                  {slot.note && <Typography variant="caption" color="text.secondary">📝 {slot.note}</Typography>}
                </Box>
              );
            })}
          </Box>
        </Card>
      ))}
    </Box>
  );
}

// PortalNotifications.jsx
export function PortalNotifications() {
  const [notifs, setNotifs]   = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    import("../../api/portalApi").then(m=>Promise.all([m.getPortalNotifications(), m.markAllPortalNotifRead()]))
      .then(([r])=>setNotifs(r.data)).finally(()=>setLoading(false));
  };
  useEffect(()=>{ load(); },[]);

  const TYPE_ICON = {
    content_approved:"✅", content_rejected:"❌", content_changes_requested:"🔄",
    invoice_generated:"🧾", payment_reminder:"⚠️", shoot_reminder:"📷",
    general:"🔔",
  };

  return (
    <Box>
      <Typography variant="h5" mb={0.5}>Notifications</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>Tamara badha updates</Typography>
      {loading ? <Box sx={{ display:"flex", justifyContent:"center", pt:4 }}><CircularProgress/></Box> :
       notifs.length===0 ? <Card><Box sx={{ py:6, textAlign:"center", color:"text.secondary" }}>Koi notification nathi yet.</Box></Card> :
       notifs.map(n=>(
        <Card key={n._id} sx={{ mb:1.5, opacity:n.read?0.7:1, border:n.read?"1px solid #e5e7eb":"1px solid #1a56db" }}>
          <Box sx={{ p:2, display:"flex", gap:2, alignItems:"flex-start" }}>
            <Typography sx={{ fontSize:22, flexShrink:0 }}>{TYPE_ICON[n.type]||"🔔"}</Typography>
            <Box sx={{ flex:1 }}>
              <Typography variant="body2" fontWeight={n.read?400:600}>{n.title}</Typography>
              <Typography variant="caption" color="text.secondary">{n.message}</Typography>
              <Typography variant="caption" display="block" color="text.disabled" mt={0.25}>
                {new Date(n.createdAt).toLocaleString("en-IN")}
              </Typography>
            </Box>
            {!n.read && <Box sx={{ width:8, height:8, borderRadius:"50%", bgcolor:"#1a56db", flexShrink:0, mt:0.75 }}/>}
          </Box>
        </Card>
      ))}
    </Box>
  );
}
