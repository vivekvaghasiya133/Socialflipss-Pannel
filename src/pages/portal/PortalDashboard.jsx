import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box, Typography, Card, Grid, Chip, CircularProgress, Alert,
  Button, Divider, Avatar,
} from "@mui/material";
import VideoIcon     from "@mui/icons-material/VideoLibrary";
import ReceiptIcon   from "@mui/icons-material/Receipt";
import CheckIcon     from "@mui/icons-material/CheckCircle";
import CalendarIcon  from "@mui/icons-material/CalendarMonth";
import PendingIcon   from "@mui/icons-material/Pending";
import NotifIcon     from "@mui/icons-material/NotificationsActive";
import { getPortalDashboard } from "../../api/portalApi";

const PAY_COLOR = { pending:"warning", partial:"info", paid:"success" };

function StatCard({ icon, label, value, color, to }) {
  return (
    <Card component={to ? Link : "div"} to={to}
      sx={{ textDecoration:"none", cursor:to?"pointer":"default", "&:hover":to?{ boxShadow:4 }:{} }}>
      <Box sx={{ p:2.5, display:"flex", alignItems:"center", gap:2 }}>
        <Box sx={{ width:44, height:44, borderRadius:2, bgcolor:color+"18", display:"flex", alignItems:"center", justifyContent:"center", color, flexShrink:0 }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
          <Typography variant="h4" fontWeight={700} sx={{ color }}>{value}</Typography>
        </Box>
      </Box>
    </Card>
  );
}

export default function PortalDashboard() {
  const navigate = useNavigate();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  const client = (() => {
    try { return JSON.parse(localStorage.getItem("sf_portal_client") || "{}"); } catch { return {}; }
  })();

  useEffect(() => {
    getPortalDashboard()
      .then(r => setData(r.data))
      .catch(() => setError("Dashboard load thayo nahi."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display:"flex", justifyContent:"center", pt:8 }}><CircularProgress /></Box>;
  if (error)   return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      {/* Welcome */}
      <Box sx={{ mb:3 }}>
        <Typography variant="h5" fontWeight={700}>Welcome, {client.ownerName}! 👋</Typography>
        <Typography variant="body2" color="text.secondary">{client.businessName} — Your content dashboard</Typography>
      </Box>

      {/* Pending approval alert */}
      {data.pendingApproval > 0 && (
        <Alert severity="warning" sx={{ mb:2, cursor:"pointer" }} icon={<PendingIcon />}
          onClick={() => navigate("/portal/content?filter=pending")}
          action={<Button size="small" color="inherit">Review →</Button>}>
          <strong>{data.pendingApproval} content{data.pendingApproval>1?"s":""}</strong> tamari approval ni wait kar chhe!
        </Alert>
      )}

      {data.unreadNotifs > 0 && (
        <Alert severity="info" sx={{ mb:2, cursor:"pointer" }} icon={<NotifIcon />}
          onClick={() => navigate("/portal/notifications")}
          action={<Button size="small" color="inherit">View →</Button>}>
          <strong>{data.unreadNotifs} unread notification{data.unreadNotifs>1?"s":""}</strong>
        </Alert>
      )}

      {/* Stats */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<VideoIcon />}  label="Total Content"     value={data.totalContent}   color="#1a56db" to="/portal/content" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<CheckIcon />}  label="Posted"            value={data.postedContent}  color="#0e9f6e" to="/portal/content?stage=posted" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<PendingIcon />}label="Need Approval"     value={data.pendingApproval} color="#d97706" to="/portal/content" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<ReceiptIcon />}label="Pending Payment"   value={`₹${Number(data.totalPending).toLocaleString("en-IN")}`} color="#e02424" to="/portal/invoices" />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Upcoming shoot */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height:"100%" }}>
            <Box sx={{ p:2.5 }}>
              <Typography variant="h6" mb={1.5}>📸 Next Shoot</Typography>
              <Divider sx={{ mb:2 }} />
              {data.upcomingShoot ? (
                <Box sx={{ background:"#f0fdf4", borderRadius:2, p:2 }}>
                  <Typography variant="h6" fontWeight={700} color="#065f46">
                    📅 {new Date(data.upcomingShoot.date+"T00:00:00").toLocaleDateString("en-IN",{ weekday:"long", day:"numeric", month:"long" })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    ⏰ {data.upcomingShoot.time} ({data.upcomingShoot.timeSlot})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    🎬 {data.upcomingShoot.reelCount} reel{data.upcomingShoot.reelCount>1?"s":""}
                  </Typography>
                  {data.upcomingShoot.note && (
                    <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                      📝 {data.upcomingShoot.note}
                    </Typography>
                  )}
                  <Button size="small" component={Link} to="/portal/schedule" sx={{ mt:1.5 }}>View Full Schedule →</Button>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">Koi upcoming shoot schedule nathi.</Typography>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Recent invoices */}
        <Grid item xs={12} md={6}>
          <Card>
            <Box sx={{ p:2.5 }}>
              <Box sx={{ display:"flex", justifyContent:"space-between", mb:1.5 }}>
                <Typography variant="h6">🧾 Recent Invoices</Typography>
                <Button size="small" component={Link} to="/portal/invoices">View All</Button>
              </Box>
              <Divider sx={{ mb:2 }} />
              {data.recentInvoices.length === 0
                ? <Typography variant="body2" color="text.secondary">Koi invoice nathi yet.</Typography>
                : data.recentInvoices.map(inv => (
                  <Box key={inv._id} component={Link} to={`/portal/invoices/${inv._id}`}
                    sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", py:1.25, borderBottom:"0.5px solid #f3f4f6", textDecoration:"none", "&:hover":{ background:"#f9fafb" }, px:0.5, borderRadius:1 }}>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{inv.month || "Invoice"}</Typography>
                      <Typography variant="caption" color="text.secondary">₹{Number(inv.totalAmount).toLocaleString("en-IN")}</Typography>
                    </Box>
                    <Box sx={{ textAlign:"right" }}>
                      <Chip label={inv.paymentStatus} color={PAY_COLOR[inv.paymentStatus]} size="small" />
                      {inv.pendingAmount > 0 && (
                        <Typography variant="caption" display="block" color="error">
                          ₹{Number(inv.pendingAmount).toLocaleString("en-IN")} due
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
