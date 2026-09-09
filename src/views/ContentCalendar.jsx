"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Card, CardContent, Chip, Button, Select,
  MenuItem, FormControl, InputLabel, CircularProgress, Tooltip,
  Grid, Divider, Avatar,
} from "@mui/material";
import ArrowLeftIcon      from "@mui/icons-material/ChevronLeft";
import ArrowRightIcon     from "@mui/icons-material/ChevronRight";
import VideocamIcon       from "@mui/icons-material/Videocam";
import AccessTimeIcon     from "@mui/icons-material/AccessTime";
import PlaceIcon          from "@mui/icons-material/Place";
import MovieIcon          from "@mui/icons-material/Movie";
import LaunchIcon         from "@mui/icons-material/Launch";
import { getContent, getContentStats } from "../api/projectsApi";
import { getClients }                  from "../api/clientsApi";
import { getProductionTasks }          from "../api/agencyOsApi";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const STAGE_STYLE = {
  idea:            { bg:"#f3f4f6", color:"#374151", label:"Idea",             border:"#d1d5db" },
  script:          { bg:"#e0f2fe", color:"#0369a1", label:"Script Outlines",  border:"#7dd3fc" },
  shoot:           { bg:"#ffedd5", color:"#c2410c", label:"Shooting Scheduled", border:"#fdba74" },
  edit:            { bg:"#fef3c7", color:"#92400e", label:"Editing",          border:"#fcd34d" },
  qc:              { bg:"#dcfce7", color:"#03543f", label:"QC Check",         border:"#6ee7b7" },
  client_approval: { bg:"#e1effe", color:"#1e40af", label:"Waiting Approval", border:"#3f83f8" },
  posted:          { bg:"#d1fae5", color:"#065f46", label:"Posted ✓",         border:"#6ee7b7" },
};

const TYPE_EMOJI = { reel:"🎬", post:"📸", story:"📖", carousel:"🖼️", youtube:"▶️", other:"📄" };

export default function ContentCalendar() {
  const navigate = useNavigate();
  const now   = new Date();
  const [year, setYear]         = useState(now.getFullYear());
  const [month, setMonth]       = useState(now.getMonth());
  const [clientId, setClientId] = useState("");
  const [clients, setClients]   = useState([]);
  const [content, setContent]   = useState([]);
  const [productionTasks, setProductionTasks] = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [selectedDay, setSelectedDay] = useState(now.getDate());

  useEffect(() => {
    getClients({ limit: 100 }).then(r => setClients(r.data?.clients || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { limit: 300 };
    if (clientId) params.clientId = clientId;

    Promise.allSettled([
      getProductionTasks(clientId ? { clientId } : {}),
      getContent(params),
      getContentStats(clientId ? { clientId } : {}),
    ]).then(([prodRes, cr, sr]) => {
      if (prodRes.status === "fulfilled" && prodRes.value.data?.tasks) {
        setProductionTasks(prodRes.value.data.tasks);
      } else {
        setProductionTasks([]);
      }
      if (cr.status === "fulfilled" && cr.value.data?.content) {
        setContent(cr.value.data.content);
      } else {
        setContent([]);
      }
      if (sr.status === "fulfilled" && sr.value.data) {
        setStats(sr.value.data);
      }
    }).finally(() => setLoading(false));
  }, [clientId, year, month]);

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  // ── BUILD SHOOT SCHEDULE MAP (shootDate ➔ Tasks with time & shooter) ──
  const shootsMap = {};
  let totalShootsInMonth = 0;
  let totalReelsToShootInMonth = 0;
  let completedShootsInMonth = 0;

  productionTasks.forEach(task => {
    // If client filter is set
    if (clientId && String(task.client?._id || task.client) !== String(clientId)) return;

    // Check shootDate
    const sDate = task.shootDate ? task.shootDate.slice(0, 10) : "";
    if (sDate) {
      const [y, m] = sDate.split("-");
      if (Number(y) === year && Number(m) === month + 1) {
        if (!shootsMap[sDate]) shootsMap[sDate] = [];
        shootsMap[sDate].push(task);
        totalShootsInMonth++;
        totalReelsToShootInMonth += (task.targetReels || 1);
        if (task.shootStatus === "done" || task.stage !== "shoot" && task.stage !== "script") {
          completedShootsInMonth++;
        }
      }
    }
  });

  // Build map of postDate ➔ legacy content items for current month
  const calMap = {};
  content.forEach(c => {
    const dateKey = c.postDate ? c.postDate.slice(0, 10) : null;
    if (!dateKey) return;
    const [y, m] = dateKey.split("-");
    if (Number(y) === year && Number(m) === month + 1) {
      if (!calMap[dateKey]) calMap[dateKey] = [];
      calMap[dateKey].push(c);
    }
  });

  const firstDay  = new Date(year, month, 1).getDay();
  const daysCount = new Date(year, month + 1, 0).getDate();
  const todayStr  = new Date().toISOString().slice(0, 10);

  // Content without post date (unscheduled)
  const unscheduled = content.filter(c => !c.postDate);

  // Selected day items
  const selectedDayStr  = selectedDay
    ? `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
    : null;
  const selectedShoots  = selectedDayStr ? (shootsMap[selectedDayStr] || []) : [];
  const selectedContent = selectedDayStr ? (calMap[selectedDayStr] || []) : [];

  return (
    <Box sx={{ pb: 6 }}>
      {/* Page Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <span>📅 Shoot & Content Calendar</span>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Live schedule highlighting shooting dates, time slots, locations, and reel deliveries.
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Filter by Client</InputLabel>
          <Select value={clientId} label="Filter by Client" onChange={e => setClientId(e.target.value)}>
            <MenuItem value="">All Clients</MenuItem>
            {clients.map(c => <MenuItem key={c._id} value={c._id}>{c.businessName}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {/* ── HIGHLIGHTED STATS CHIPS ── */}
      <Grid container spacing={1.5} mb={3}>
        <Grid item xs={6} sm={3} md={2.4}>
          <Card sx={{ p: 2, borderRadius: 2.5, border: "1.5px solid #fdba74", bgcolor: "#fff7ed", boxShadow: "0 2px 6px rgba(249, 115, 22, 0.08)" }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: "#c2410c", textTransform: "uppercase", fontSize: 10 }}>
              🎥 Shoots Scheduled
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: "#9a3412", mt: 0.5 }}>
              {totalShootsInMonth}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3} md={2.4}>
          <Card sx={{ p: 2, borderRadius: 2.5, border: "1.5px solid #fed7aa", bgcolor: "#fffaf5" }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: "#ea580c", textTransform: "uppercase", fontSize: 10 }}>
              🎯 Target Reels To Shoot
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: "#c2410c", mt: 0.5 }}>
              {totalReelsToShootInMonth}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3} md={2.4}>
          <Card sx={{ p: 2, borderRadius: 2.5, border: "1.5px solid #bbf7d0", bgcolor: "#f0fdf4" }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: "#166534", textTransform: "uppercase", fontSize: 10 }}>
              ✓ Shoots Completed
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: "#15803d", mt: 0.5 }}>
              {completedShootsInMonth}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3} md={2.4}>
          <Card sx={{ p: 2, borderRadius: 2.5, border: "1px solid #e2e8f0", bgcolor: "#fff" }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", fontSize: 10 }}>
              🎬 Editing Stage
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: "#334155", mt: 0.5 }}>
              {productionTasks.filter(t => t.stage === "edit").length}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3} md={2.4}>
          <Card sx={{ p: 2, borderRadius: 2.5, border: "1px solid #e2e8f0", bgcolor: "#fff" }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", fontSize: 10 }}>
              🚀 Ready / Posted
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: "#059669", mt: 0.5 }}>
              {productionTasks.filter(t => t.stage === "posted" || t.stage === "completed").length}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        {/* ── CALENDAR GRID ── */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              {/* Navigation */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
                <Button size="small" onClick={prevMonth} startIcon={<ArrowLeftIcon />} sx={{ fontWeight: 700 }}>
                  Prev
                </Button>
                <Typography variant="h6" fontWeight={800} sx={{ color: "#0f172a" }}>
                  {MONTHS[month]} {year}
                </Typography>
                <Button size="small" onClick={nextMonth} endIcon={<ArrowRightIcon />} sx={{ fontWeight: 700 }}>
                  Next
                </Button>
              </Box>

              {/* Day headers */}
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5, mb: 1 }}>
                {DAYS.map(d => (
                  <Box key={d} sx={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "text.secondary", py: 0.5 }}>
                    {d}
                  </Box>
                ))}
              </Box>

              {/* Calendar grid */}
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.75 }}>
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <Box key={`empty-${i}`} sx={{ minHeight: { xs: 68, sm: 84 } }} />
                  ))}

                  {Array.from({ length: daysCount }).map((_, i) => {
                    const day       = i + 1;
                    const dateStr   = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const dayShoots = shootsMap[dateStr] || [];
                    const items     = calMap[dateStr] || [];
                    const isToday   = dateStr === todayStr;
                    const isSun     = new Date(year, month, day).getDay() === 0;
                    const isSelected= selectedDay === day;
                    const hasShoots = dayShoots.length > 0;

                    return (
                      <Box
                        key={day}
                        onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                        sx={{
                          minHeight: { xs: 72, sm: 90 },
                          borderRadius: 2,
                          p: 0.75,
                          cursor: "pointer",
                          // 🌟 VIBRANT HIGHLIGHTING WHEN SHOOTS ARE SCHEDULED 🌟
                          border: isSelected
                            ? "2.5px solid #ea580c"
                            : hasShoots
                            ? "2px solid #f97316"
                            : isToday
                            ? "2px solid #3b82f6"
                            : "1px solid #e2e8f0",
                          background: isSelected
                            ? "#fff7ed"
                            : hasShoots
                            ? "linear-gradient(180deg, #fffbf5 0%, #fff7ed 100%)"
                            : isSun
                            ? "#f8fafc"
                            : "#ffffff",
                          boxShadow: hasShoots
                            ? "0 4px 12px rgba(249, 115, 22, 0.16)"
                            : isSelected
                            ? "0 4px 12px rgba(234, 88, 12, 0.2)"
                            : "none",
                          transition: "all 0.15s ease",
                          "&:hover": {
                            transform: "scale(1.02)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            zIndex: 2
                          },
                          overflow: "hidden",
                          display: "flex",
                          flexDirection: "column"
                        }}
                      >
                        {/* Day Number Header */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                          <Typography sx={{
                            fontSize: { xs: 11, sm: 12 },
                            fontWeight: (hasShoots || isToday || isSelected) ? 900 : 600,
                            color: hasShoots ? "#ea580c" : isToday ? "#2563eb" : isSun ? "#94a3b8" : "#334155",
                            lineHeight: 1,
                          }}>
                            {day}
                          </Typography>
                          {hasShoots && (
                            <Box sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: "#ea580c",
                              boxShadow: "0 0 6px #ea580c"
                            }} />
                          )}
                        </Box>

                        {/* 🎥 SCHEDULED SHOOTS PILL (PROMINENTLY HIGHLIGHTED WITH TIME) */}
                        {dayShoots.map(shoot => (
                          <Tooltip
                            key={shoot._id}
                            title={
                              <Box sx={{ p: 0.5 }}>
                                <Typography variant="subtitle2" fontWeight={800} color="#fed7aa">
                                  🎥 Shoot Scheduled • {shoot.shootTime || "Time TBD"}
                                </Typography>
                                <Typography variant="body2" fontWeight={700}>
                                  🏢 {shoot.client?.businessName}
                                </Typography>
                                <Typography variant="caption" sx={{ display: "block", color: "rgba(255,255,255,0.9)" }}>
                                  Reel #{shoot.reelNumber}: {shoot.title}
                                </Typography>
                                <Typography variant="caption" sx={{ display: "block", color: "#fdba74" }}>
                                  Shooter: {shoot.shooter?.name || "TBD"}
                                </Typography>
                                {shoot.location && (
                                  <Typography variant="caption" sx={{ display: "block", color: "rgba(255,255,255,0.7)" }}>
                                    📍 {shoot.location}
                                  </Typography>
                                )}
                              </Box>
                            }
                            arrow
                          >
                            <Box sx={{
                              background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
                              border: "1px solid #fdba74",
                              borderRadius: 1.5,
                              p: 0.5,
                              mb: 0.4,
                              boxShadow: "0 1px 2px rgba(249, 115, 22, 0.12)"
                            }}>
                              {/* Time Tag */}
                              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 0.5 }}>
                                <Box sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 0.3,
                                  bgcolor: "#ea580c",
                                  color: "#ffffff",
                                  px: 0.5,
                                  py: 0.15,
                                  borderRadius: 0.75,
                                  fontSize: { xs: 8, sm: 9 },
                                  fontWeight: 900,
                                  letterSpacing: "0.2px"
                                }}>
                                  <span>⏰</span>
                                  <span>{shoot.shootTime || "Time TBD"}</span>
                                </Box>
                                <Typography sx={{ fontSize: 8.5, fontWeight: 800, color: "#c2410c" }}>
                                  🎯 {shoot.targetReels || 1}R
                                </Typography>
                              </Box>

                              {/* Client Name */}
                              <Typography sx={{
                                fontSize: { xs: 9, sm: 10 },
                                fontWeight: 800,
                                color: "#9a3412",
                                mt: 0.25,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                lineHeight: 1.2
                              }}>
                                {shoot.client?.businessName || "Client"}
                              </Typography>

                              {/* Reel title / Shooter */}
                              <Typography sx={{
                                fontSize: { xs: 8, sm: 8.5 },
                                fontWeight: 600,
                                color: "#b45309",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                mt: 0.1
                              }}>
                                {shoot.shooter?.name ? `🎥 ${shoot.shooter.name.split(" ")[0]}` : `Reel #${shoot.reelNumber}`}
                              </Typography>
                            </Box>
                          </Tooltip>
                        ))}

                        {/* Legacy content items (if any) */}
                        {items.slice(0, 2).map(item => {
                          const s = STAGE_STYLE[item.stage] || STAGE_STYLE.idea;
                          return (
                            <Tooltip key={item._id} title={`${item.title} · ${s.label}`} arrow>
                              <Box sx={{
                                fontSize: 9, fontWeight: 700, color: s.color, bgcolor: s.bg,
                                border: `1px solid ${s.border}`, borderRadius: 0.75,
                                px: 0.5, py: 0.2, mb: 0.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                              }}>
                                {TYPE_EMOJI[item.type]} {item.title}
                              </Box>
                            </Tooltip>
                          );
                        })}
                      </Box>
                    );
                  })}
                </Box>
              )}

              {/* Legend */}
              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 2.5, pt: 2, borderTop: "1px solid #f1f5f9", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, p: 0.5, px: 1, bgcolor: "#fff7ed", border: "1.5px solid #f97316", borderRadius: 1.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#ea580c" }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "#9a3412", fontSize: 11 }}>
                    ⏰ 🎥 Scheduled Shoot with Time
                  </Typography>
                </Box>
                {Object.entries(STAGE_STYLE).map(([k, s]) => (
                  <Box key={k} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: s.bg, border: `1px solid ${s.border}` }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>{s.label}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ── RIGHT PANEL (SELECTED DAY SHOOTS & SESSIONS) ── */}
        <Grid item xs={12} md={4}>
          {selectedDay && (
            <Card sx={{ mb: 2.5, borderRadius: 3, border: "1.5px solid #fdba74", bgcolor: "#fffaf5", boxShadow: "0 2px 8px rgba(249, 115, 22, 0.08)" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={900} color="#9a3412">
                      📅 {selectedDay} {MONTHS[month]} {year}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedShoots.length} shoot session(s) scheduled
                    </Typography>
                  </Box>
                  {selectedShoots.length > 0 && (
                    <Chip
                      label={`🎥 ${selectedShoots.length} Shoot${selectedShoots.length > 1 ? "s" : ""}`}
                      size="small"
                      sx={{ fontWeight: 800, bgcolor: "#ea580c", color: "#fff" }}
                    />
                  )}
                </Box>

                <Divider sx={{ mb: 2, borderColor: "#fed7aa" }} />

                {/* List of Shoots on this date */}
                {selectedShoots.length === 0 ? (
                  <Box sx={{ py: 3, textAlign: "center", color: "text.secondary" }}>
                    <VideocamIcon sx={{ fontSize: 32, opacity: 0.3, mb: 1 }} />
                    <Typography variant="body2" fontWeight={600}>No shoot scheduled for this date.</Typography>
                    <Typography variant="caption" color="text.disabled">Click on highlighted dates (e.g. Day 10) to see shoots.</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {selectedShoots.map(shoot => (
                      <Box
                        key={shoot._id}
                        sx={{
                          p: 2,
                          bgcolor: "#ffffff",
                          borderRadius: 2.5,
                          border: "1.5px solid #fed7aa",
                          boxShadow: "0 2px 6px rgba(249, 115, 22, 0.08)"
                        }}
                      >
                        {/* Time Banner */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                          <Box sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            bgcolor: "#ea580c",
                            color: "#fff",
                            px: 1,
                            py: 0.3,
                            borderRadius: 1.5,
                            fontSize: 11,
                            fontWeight: 900
                          }}>
                            <AccessTimeIcon sx={{ fontSize: 13 }} />
                            <span>{shoot.shootTime || "Time TBD"}</span>
                          </Box>
                          <Chip
                            label={shoot.shootStatus === "done" ? "Shoot Completed" : "Scheduled"}
                            size="small"
                            color={shoot.shootStatus === "done" ? "success" : "warning"}
                            sx={{ fontWeight: 800, fontSize: 10, height: 20 }}
                          />
                        </Box>

                        {/* Client & Reel Info */}
                        <Typography variant="subtitle2" fontWeight={900} color="#9a3412" gutterBottom>
                          🏢 {shoot.client?.businessName || "Client"}
                        </Typography>

                        <Typography variant="body2" fontWeight={700} color="#1e293b" sx={{ mb: 0.5 }}>
                          Reel #{shoot.reelNumber}: {shoot.title}
                        </Typography>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 1, pt: 1, borderTop: "1px dashed #fed7aa" }}>
                          {/* Shooter */}
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: 12 }}>
                            <VideocamIcon sx={{ fontSize: 16, color: "#ea580c" }} />
                            <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155" }}>
                              Shooter: <strong>{shoot.shooter?.name || "Not assigned"}</strong>
                            </Typography>
                          </Box>

                          {/* Location */}
                          {shoot.location && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: 12 }}>
                              <PlaceIcon sx={{ fontSize: 16, color: "#dc2626" }} />
                              <Typography variant="caption" sx={{ fontWeight: 600, color: "#475569" }}>
                                Location: {shoot.location}
                              </Typography>
                            </Box>
                          )}

                          {/* Target Reels */}
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: 12 }}>
                            <MovieIcon sx={{ fontSize: 16, color: "#0284c7" }} />
                            <Typography variant="caption" sx={{ fontWeight: 600, color: "#475569" }}>
                              Target Output: <strong>{shoot.targetReels || 1} Reel(s)</strong>
                            </Typography>
                          </Box>
                        </Box>

                        {/* Action Link */}
                        <Box sx={{ mt: 1.5, pt: 1, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end" }}>
                          <Button
                            size="small"
                            variant="text"
                            endIcon={<LaunchIcon sx={{ fontSize: 13 }} />}
                            onClick={() => navigate("/admin/production-hub")}
                            sx={{ fontSize: 11, fontWeight: 800, textTransform: "none", color: "#ea580c" }}
                          >
                            Open in Production Hub
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Unscheduled content (if any) */}
          {unscheduled.length > 0 && (
            <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" fontWeight={800} mb={1}>
                  Unscheduled Items ({unscheduled.length})
                </Typography>
                <Divider sx={{ mb: 1.5 }} />
                {unscheduled.slice(0, 5).map(item => {
                  const s = STAGE_STYLE[item.stage] || STAGE_STYLE.idea;
                  return (
                    <Box key={item._id} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, p: 1, bgcolor: "#f8fafc", borderRadius: 1.5 }}>
                      <Typography sx={{ fontSize: 14 }}>{TYPE_EMOJI[item.type]}</Typography>
                      <Box sx={{ flex: 1, overflow: "hidden" }}>
                        <Typography variant="caption" fontWeight={700} display="block" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{item.clientId?.businessName}</Typography>
                      </Box>
                      <Chip label={s.label} size="small" sx={{ fontSize: 9, height: 16, color: s.color, bgcolor: s.bg }} />
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
