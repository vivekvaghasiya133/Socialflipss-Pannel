import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Card, Grid, Chip, CircularProgress,
  Alert, Divider, Button, LinearProgress, Avatar, List,
  ListItem, ListItemText, ListItemAvatar, Tooltip,
} from "@mui/material";
import TrendingUpIcon   from "@mui/icons-material/TrendingUp";
import PeopleIcon       from "@mui/icons-material/People";
import ReceiptIcon      from "@mui/icons-material/Receipt";
import VideoIcon        from "@mui/icons-material/VideoLibrary";
import FolderIcon       from "@mui/icons-material/Folder";
import NotifIcon        from "@mui/icons-material/NotificationsActive";
import WhatsAppIcon     from "@mui/icons-material/WhatsApp";
import ArrowRightIcon   from "@mui/icons-material/ArrowForwardIos";
import { getDashboardAnalytics } from "../api/analyticsApi";
import { useAuth } from "../context/AuthContext";

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function StatCard({ icon, label, value, sub, color, onClick, alert }) {
  return (
    <Card onClick={onClick} sx={{ cursor: onClick ? "pointer" : "default", "&:hover": onClick ? { boxShadow:4 } : {}, position:"relative", overflow:"hidden" }}>
      <Box sx={{ p:2.5 }}>
        <Box sx={{ display:"flex", alignItems:"center", gap:1.5 }}>
          <Box sx={{ width:44, height:44, borderRadius:2, bgcolor:color+"18", display:"flex", alignItems:"center", justifyContent:"center", color, flexShrink:0 }}>
            {icon}
          </Box>
          <Box sx={{ flex:1 }}>
            <Typography variant="body2" color="text.secondary" mb={0.25}>{label}</Typography>
            <Typography variant="h4" fontWeight={700} sx={{ color }}>{value}</Typography>
            {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
          </Box>
          {alert && <Chip label={alert} color="error" size="small" sx={{ fontWeight:700 }} />}
        </Box>
      </Box>
    </Card>
  );
}

function MiniBarChart({ data, valueKey, labelFn, color = "#1a56db", height = 100 }) {
  if (!data?.length) return <Typography variant="body2" color="text.secondary" sx={{ py:2, textAlign:"center" }}>No data</Typography>;
  const max = Math.max(...data.map(d => d[valueKey] || 0), 1);
  return (
    <Box sx={{ display:"flex", alignItems:"flex-end", gap:1, height, pt:1 }}>
      {data.map((d, i) => {
        const h = Math.max(Math.round(((d[valueKey] || 0) / max) * (height - 24)), 4);
        return (
          <Tooltip key={i} title={`${labelFn(d)}: ${d[valueKey] || 0}`} arrow>
            <Box sx={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:0.5 }}>
              <Typography variant="caption" sx={{ fontSize:9, color:"text.secondary" }}>{d[valueKey] || 0}</Typography>
              <Box sx={{ width:"100%", height:h, bgcolor:color, borderRadius:"3px 3px 0 0", opacity:0.85, transition:"height 0.3s" }} />
              <Typography variant="caption" sx={{ fontSize:9, color:"text.secondary" }}>{labelFn(d)}</Typography>
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}

function PipelineBar({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <Box sx={{ mb:1.5 }}>
      <Box sx={{ display:"flex", justifyContent:"space-between", mb:0.5 }}>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="body2" fontWeight={600}>{value} <Typography component="span" variant="caption" color="text.secondary">({pct}%)</Typography></Typography>
      </Box>
      <LinearProgress variant="determinate" value={pct} sx={{ height:6, borderRadius:3, bgcolor:"#e5e7eb", "& .MuiLinearProgress-bar":{ bgcolor:color } }} />
    </Box>
  );
}

export default function DashboardHome() {
  const navigate = useNavigate();
  const { isAdmin, canManage, user } = useAuth();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    getDashboardAnalytics()
      .then(r => setData(r.data))
      .catch(() => setError("Dashboard load thayo nahi. Backend check karo."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display:"flex", justifyContent:"center", pt:8 }}><CircularProgress /></Box>;
  if (error)   return <Alert severity="error">{error}</Alert>;

  const { counts, revenue, charts } = data;

  const leadFunnelMap = {};
  charts.leadFunnel?.forEach(f => { leadFunnelMap[f._id] = f.count; });

  const contentStageMap = {};
  charts.contentThisMonth?.forEach(c => { contentStageMap[c._id] = c.count; });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back, {user?.name}! Here's your agency overview.
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
        </Typography>
      </Box>

      {/* Alerts */}
      {counts.overdueReminders > 0 && (
        <Alert severity="warning" sx={{ mb:2, cursor:"pointer" }} icon={<NotifIcon />}
          onClick={() => navigate("/admin/reminders")}
          action={<Button size="small" color="inherit" endIcon={<ArrowRightIcon sx={{ fontSize:12 }} />}>View</Button>}>
          <strong>{counts.overdueReminders} reminder{counts.overdueReminders>1?"s":""}</strong> overdue chhe!
        </Alert>
      )}
      {counts.pendingInvoices > 0 && (
        <Alert severity="info" sx={{ mb:2, cursor:"pointer" }}
          onClick={() => navigate("/admin/invoices?paymentStatus=pending")}
          action={<Button size="small" color="inherit" endIcon={<ArrowRightIcon sx={{ fontSize:12 }} />}>View</Button>}>
          <strong>{counts.pendingInvoices} invoice{counts.pendingInvoices>1?"s":""}</strong> payment pending chhe —
          ₹{Number(revenue.pending).toLocaleString("en-IN")} outstanding
        </Alert>
      )}

      {/* Top stat cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard icon={<TrendingUpIcon />} label="Total Leads"    value={counts.totalLeads}    color="#1a56db" onClick={() => navigate("/admin/leads")} sub={`${counts.newLeads} new`} />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard icon={<PeopleIcon />}    label="Active Clients" value={counts.activeClients}  color="#0e9f6e" onClick={() => navigate("/admin/clients")} sub={`${counts.totalClients} total`} />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard icon={<ReceiptIcon />}   label="Revenue"        value={`₹${Math.round(revenue.paid/1000)}k`} color="#8b5cf6" onClick={() => navigate("/admin/invoices")} sub={`₹${Math.round(revenue.pending/1000)}k pending`} alert={counts.pendingInvoices > 0 ? `${counts.pendingInvoices}` : null} />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard icon={<VideoIcon />}     label="Content Posted" value={counts.postedContent}   color="#f59e0b" onClick={() => navigate("/admin/content-calendar")} sub={`${counts.pendingContent} in pipeline`} />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard icon={<FolderIcon />}    label="Active Projects" value={counts.activeProjects} color="#06b6d4" onClick={() => navigate("/admin/projects")} sub={`${counts.totalProjects} total`} />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard icon={<NotifIcon />}     label="Due Reminders"  value={counts.overdueReminders} color="#e02424" onClick={() => navigate("/admin/reminders")} sub="action needed" alert={counts.overdueReminders > 0 ? "!" : null} />
        </Grid>
      </Grid>

      {/* Revenue cards */}
      <Grid container spacing={2} mb={3}>
        {[
          { label:"Total Revenue",    value:`₹${Number(revenue.total).toLocaleString("en-IN")}`,              color:"#1a56db" },
          { label:"Total Collected",  value:`₹${Number(revenue.paid).toLocaleString("en-IN")}`,               color:"#0e9f6e" },
          { label:"Pending",          value:`₹${Number(revenue.pending).toLocaleString("en-IN")}`,            color:"#e02424" },
          { label:"This Month",       value:`₹${Number(revenue.thisMonth?.total||0).toLocaleString("en-IN")}`, color:"#8b5cf6" },
        ].map(c => (
          <Grid item xs={6} sm={3} key={c.label}>
            <Card><Box sx={{ p:2 }}>
              <Typography variant="caption" color="text.secondary">{c.label}</Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color:c.color }}>{c.value}</Typography>
            </Box></Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} mb={3}>
        {/* Monthly Revenue Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height:"100%" }}>
            <CardContent>
              <Typography variant="h6" mb={0.5}>Monthly Revenue</Typography>
              <Typography variant="caption" color="text.secondary">Last 6 months</Typography>
              <Divider sx={{ my:1.5 }} />
              <MiniBarChart
                data={charts.monthlyRevenue}
                valueKey="paid"
                labelFn={d => MONTHS_SHORT[(d._id?.m||1)-1]}
                color="#1a56db"
                height={120}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Leads Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height:"100%" }}>
            <CardContent>
              <Typography variant="h6" mb={0.5}>Monthly Leads</Typography>
              <Typography variant="caption" color="text.secondary">Last 6 months</Typography>
              <Divider sx={{ my:1.5 }} />
              <MiniBarChart
                data={charts.monthlyLeads}
                valueKey="count"
                labelFn={d => MONTHS_SHORT[(d._id?.m||1)-1]}
                color="#0e9f6e"
                height={120}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} mb={3}>
        {/* Lead Funnel */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height:"100%" }}>
            <CardContent>
              <Typography variant="h6" mb={1.5}>Lead Funnel</Typography>
              <Divider sx={{ mb:2 }} />
              <PipelineBar label="New"           value={leadFunnelMap["new"]||0}            total={counts.totalLeads} color="#0891b2" />
              <PipelineBar label="Follow Up"     value={leadFunnelMap["follow_up"]||0}      total={counts.totalLeads} color="#f59e0b" />
              <PipelineBar label="Converted"     value={leadFunnelMap["converted"]||0}      total={counts.totalLeads} color="#0e9f6e" />
              <PipelineBar label="Not Interested" value={leadFunnelMap["not_interested"]||0} total={counts.totalLeads} color="#9ca3af" />
            </CardContent>
          </Card>
        </Grid>

        {/* Content Pipeline This Month */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height:"100%" }}>
            <CardContent>
              <Typography variant="h6" mb={1.5}>Content This Month</Typography>
              <Divider sx={{ mb:2 }} />
              {[
                { label:"💡 Idea",     key:"idea",     color:"#6b7280" },
                { label:"✅ Approved", key:"approved", color:"#0891b2" },
                { label:"🎬 Shooting", key:"shooting", color:"#7c3aed" },
                { label:"✂️ Editing",  key:"editing",  color:"#d97706" },
                { label:"🚀 Posted",   key:"posted",   color:"#059669" },
              ].map(s => (
                <Box key={s.key} sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:1.25 }}>
                  <Typography variant="body2">{s.label}</Typography>
                  <Chip label={contentStageMap[s.key]||0} size="small" sx={{ bgcolor:s.color+"18", color:s.color, fontWeight:700, minWidth:36 }} />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Clients */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height:"100%" }}>
            <CardContent>
              <Typography variant="h6" mb={1.5}>Top Clients by Revenue</Typography>
              <Divider sx={{ mb:1 }} />
              {charts.topClients?.length === 0 && (
                <Typography variant="body2" color="text.secondary">No invoice data yet.</Typography>
              )}
              {charts.topClients?.map((c, i) => (
                <Box key={c._id} sx={{ display:"flex", alignItems:"center", gap:1.5, py:1, borderBottom:"0.5px solid #f3f4f6" }}>
                  <Avatar sx={{ width:28, height:28, fontSize:12, bgcolor:["#1a56db","#0e9f6e","#8b5cf6","#f59e0b","#e02424"][i]+"22", color:["#1a56db","#0e9f6e","#8b5cf6","#f59e0b","#e02424"][i], fontWeight:700 }}>
                    {i+1}
                  </Avatar>
                  <Box sx={{ flex:1 }}>
                    <Typography variant="body2" fontWeight={500}>{c.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      ₹{Number(c.totalPaid).toLocaleString("en-IN")} collected
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600} color="#0e9f6e">
                    ₹{Math.round(c.totalPaid/1000)}k
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lead Sources */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={1.5}>Lead Sources</Typography>
              <Divider sx={{ mb:2 }} />
              {charts.leadSources?.map(s => (
                <PipelineBar
                  key={s._id}
                  label={s._id?.replace("_"," ")?.toUpperCase() || "Unknown"}
                  value={s.count}
                  total={counts.totalLeads}
                  color="#1a56db"
                />
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={1.5}>Quick Actions</Typography>
              <Divider sx={{ mb:2 }} />
              <Grid container spacing={1.5}>
                {[
                  { label:"Add Lead",        path:"/admin/leads",           color:"#1a56db", emoji:"➕" },
                  { label:"Add Client",      path:"/admin/clients",         color:"#0e9f6e", emoji:"👤" },
                  { label:"Create Invoice",  path:"/admin/invoices/new",    color:"#8b5cf6", emoji:"🧾" },
                  { label:"Mark Attendance", path:"/admin/attendance",      color:"#f59e0b", emoji:"✅" },
                  { label:"New Project",     path:"/admin/projects",        color:"#06b6d4", emoji:"📁" },
                  { label:"Reminders",       path:"/admin/reminders",       color:"#e02424", emoji:"🔔" },
                  { label:"Work Logs",       path:"/admin/worklogs",        color:"#6b7280", emoji:"📝" },
                  { label:"Content Calendar",path:"/admin/content-calendar",color:"#d97706", emoji:"📅" },
                ].map(a => (
                  <Grid item xs={6} key={a.label}>
                    <Button
                      fullWidth variant="outlined"
                      onClick={() => navigate(a.path)}
                      sx={{ justifyContent:"flex-start", gap:1, py:1.25, borderColor:"#e5e7eb", color:a.color, "&:hover":{ borderColor:a.color, bgcolor:a.color+"08" } }}
                    >
                      <span style={{ fontSize:16 }}>{a.emoji}</span>
                      <Typography variant="body2" fontWeight={500}>{a.label}</Typography>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// Need to import CardContent separately since it's used inside
import { CardContent } from "@mui/material";
