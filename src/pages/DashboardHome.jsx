import { useEffect, useState } from "react";
import {
  Box, Grid, Card, CardContent, Typography, Chip,
  CircularProgress, Alert, Divider,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { getClientStats } from "../api";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const INDUSTRY_LABELS = {
  healthcare: "Healthcare", retail: "Retail", restaurant: "Restaurant / Food",
  realestate: "Real Estate", education: "Education", automobile: "Automobile",
  fashion: "Fashion", beauty: "Beauty / Salon", finance: "Finance", other: "Other",
};

function StatCard({ icon, label, value, color, sub }) {
  return (
    <Card>
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{
          width: 50, height: 50, borderRadius: 2, display: "flex",
          alignItems: "center", justifyContent: "center",
          background: color + "18",
        }}>
          <Box sx={{ color }}>{icon}</Box>
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={700}>{value}</Typography>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
          {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
        </Box>
      </CardContent>
    </Card>
  );
}

function MiniBar({ label, count, max }) {
  const pct = max ? Math.round((count / max) * 100) : 0;
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2" fontWeight={600}>{count}</Typography>
      </Box>
      <Box sx={{ height: 6, borderRadius: 3, background: "#e5e7eb" }}>
        <Box sx={{ height: 6, borderRadius: 3, background: "#1a56db", width: `${pct}%`, transition: "width 0.6s" }} />
      </Box>
    </Box>
  );
}

export default function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getClientStats()
      .then((r) => setStats(r.data))
      .catch(() => setError("Stats load thaya nahi. Backend check karo."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  const maxIndustry = Math.max(...(stats.byIndustry || []).map((b) => b.count), 1);

  // Build monthly trend display
  const trendData = stats.monthlyTrend || [];

  return (
    <Box>
      <Typography variant="h5" mb={0.5}>Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        SocialFlipss — Client overview at a glance
      </Typography>

      {/* Stat cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<PeopleIcon />} label="Total Clients" value={stats.total} color="#1a56db" sub={`+${stats.recentSignups} this week`} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<FiberNewIcon />} label="New (Pending)" value={stats.newClients} color="#ff8800" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<TrendingUpIcon />} label="In Progress" value={stats.inProgress} color="#8b5cf6" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<CheckCircleIcon />} label="Active Clients" value={stats.active} color="#0e9f6e" />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Industry breakdown */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" mb={2}>Clients by Industry</Typography>
              <Divider sx={{ mb: 2 }} />
              {stats.byIndustry.length === 0
                ? <Typography color="text.secondary" variant="body2">No data yet</Typography>
                : stats.byIndustry.map((b) => (
                  <MiniBar
                    key={b._id}
                    label={INDUSTRY_LABELS[b._id] || b._id || "Unknown"}
                    count={b.count}
                    max={maxIndustry}
                  />
                ))
              }
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly trend */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Monthly Signups (last 6 months)</Typography>
              <Divider sx={{ mb: 2 }} />
              {trendData.length === 0
                ? <Typography color="text.secondary" variant="body2">No data yet</Typography>
                : (
                  <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1.5, height: 140, pt: 1 }}>
                    {trendData.map((d) => {
                      const maxCount = Math.max(...trendData.map((x) => x.count), 1);
                      const h = Math.max(Math.round((d.count / maxCount) * 110), 8);
                      return (
                        <Box key={`${d._id.year}-${d._id.month}`} sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                          <Typography variant="caption" fontWeight={600}>{d.count}</Typography>
                          <Box sx={{ width: "100%", height: h, background: "#1a56db", borderRadius: "4px 4px 0 0", opacity: 0.85 }} />
                          <Typography variant="caption" color="text.secondary">
                            {MONTHS[d._id.month - 1]}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                )
              }
            </CardContent>
          </Card>

          {/* Quick status summary */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Status Overview
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                {[
                  { label: "New", count: stats.newClients, color: "warning" },
                  { label: "In Progress", count: stats.inProgress, color: "secondary" },
                  { label: "Active", count: stats.active, color: "success" },
                  { label: "Total", count: stats.total, color: "primary" },
                ].map((s) => (
                  <Chip key={s.label} label={`${s.label}: ${s.count}`} color={s.color} variant="outlined" />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
