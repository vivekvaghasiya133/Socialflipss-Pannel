import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Card, CardContent, Button, CircularProgress,
  Tooltip, Chip, Grid, Divider, Avatar, TableContainer, Table, TableHead, TableBody, TableRow, TableCell
} from "@mui/material";
import ArrowBackIcon  from "@mui/icons-material/ArrowBack";
import ArrowLeftIcon  from "@mui/icons-material/ChevronLeft";
import ArrowRightIcon from "@mui/icons-material/ChevronRight";
import { getStaffById }  from "../api/hrApi";
import { getAttendance } from "../api/hrApi";
import { getWorkLogs, getWorkLogStats } from "../api/analyticsApi";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const STATUS_STYLE = {
  present:  { bg:"#dcfce7", color:"#166534", label:"Present",  border:"#86efac" },
  absent:   { bg:"#fee2e2", color:"#991b1b", label:"Absent",   border:"#fca5a5" },
  half_day: { bg:"#fef3c7", color:"#92400e", label:"Half Day", border:"#fcd34d" },
  leave:    { bg:"#dbeafe", color:"#1e40af", label:"Leave",    border:"#93c5fd" },
  holiday:  { bg:"#f3e8ff", color:"#6b21a8", label:"Holiday",  border:"#c4b5fd" },
};

function monthStr(year, month) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function StaffCalendarView() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const now       = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [staff, setStaff]       = useState(null);
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [workLogs, setWorkLogs] = useState([]);
  const [workStats, setWorkStats] = useState(null);

  // Load staff info
  useEffect(() => {
    getStaffById(id).then((r) => setStaff(r.data)).catch(() => navigate("/admin/staff"));
  }, [id]);

  // Load attendance for selected month
  useEffect(() => {
    setLoading(true);
    getAttendance({ staffId: id, month: monthStr(year, month) })
      .then((r) => setRecords(r.data))
      .finally(() => setLoading(false));
  }, [id, year, month]);

  // Load work logs & daily video production for selected month
  useEffect(() => {
    if (staff) {
      const targetMonth = monthStr(year, month);
      getWorkLogs({ staffId: staff._id, email: staff.email, name: staff.name, month: targetMonth })
        .then((r) => setWorkLogs(r.data || []))
        .catch(() => {});
      getWorkLogStats({ staffId: staff._id, email: staff.email, name: staff.name, month: targetMonth })
        .then((r) => setWorkStats(r.data))
        .catch(() => {});
    }
  }, [staff, year, month]);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  // Build record map { "YYYY-MM-DD": { status, note } }
  const recordMap = {};
  records.forEach((r) => {
    recordMap[r.date] = { status: r.status, note: r.note || "" };
  });

  // Build daily video map { "YYYY-MM-DD": { videosCreated, videosEdited, details: [] } }
  const dailyVideoMap = {};
  if (workStats?.byDate) {
    Object.keys(workStats.byDate).forEach((d) => {
      dailyVideoMap[d] = { ...workStats.byDate[d] };
    });
  }
  workLogs.forEach((log) => {
    if (!log.date) return;
    const d = log.date.slice(0, 10);
    if (!dailyVideoMap[d]) {
      dailyVideoMap[d] = { date: d, videosCreated: 0, videosEdited: 0, totalVideos: 0, details: [] };
    }
    if (!workStats?.byDate?.[d]) {
      dailyVideoMap[d].videosCreated += (log.videosCreated || 0);
      dailyVideoMap[d].videosEdited += (log.videosEdited || 0);
      dailyVideoMap[d].totalVideos += ((log.videosCreated || 0) + (log.videosEdited || 0));
    }
    if (log.description && !dailyVideoMap[d].details?.includes(log.description)) {
      if (!dailyVideoMap[d].details) dailyVideoMap[d].details = [];
      dailyVideoMap[d].details.push(log.description);
    }
  });

  // Build calendar days
  const firstDay  = new Date(year, month, 1).getDay();
  const daysCount = new Date(year, month + 1, 0).getDate();
  const todayStr  = new Date().toISOString().slice(0, 10);

  // Summary counts
  const counts = { present:0, absent:0, half_day:0, leave:0, holiday:0 };
  Object.values(recordMap).forEach((r) => { if (counts[r.status] !== undefined) counts[r.status]++; });

  // Salary calculation preview
  const perDay      = staff ? staff.salary / 26 : 0;
  const deductDays  = counts.absent + counts.half_day * 0.5;
  const deduction   = parseFloat((deductDays * perDay).toFixed(2));
  const netSalary   = staff ? parseFloat((staff.salary - deduction).toFixed(2)) : 0;

  const colors = ["#1a56db","#0e9f6e","#8b5cf6","#e02424","#ff8800","#0891b2"];
  const avatarColor = staff ? colors[staff.name.charCodeAt(0) % colors.length] : "#1a56db";

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/admin/staff")} sx={{ mb:2 }}>
        Back to Staff
      </Button>

      {/* Staff header */}
      {staff && (
        <Card sx={{ mb:3 }}>
          <CardContent sx={{ display:"flex", alignItems:"center", gap:2, flexWrap:"wrap" }}>
            <Avatar sx={{ width:52, height:52, bgcolor: avatarColor, fontSize:18, fontWeight:700 }}>
              {getInitials(staff.name)}
            </Avatar>
            <Box sx={{ flex:1 }}>
              <Typography variant="h6" fontWeight={700}>{staff.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {staff.position} {staff.department ? `· ${staff.department}` : ""}
              </Typography>
            </Box>
            <Box sx={{ textAlign:"right" }}>
              <Typography variant="caption" color="text.secondary">Monthly Salary</Typography>
              <Typography variant="h6" fontWeight={700} color="primary">₹{Number(staff.salary).toLocaleString("en-IN")}</Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={2}>
        {/* Calendar */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              {/* Month navigation */}
              <Box sx={{ display:"flex", alignItems:"center", justifyContent:"space-between", mb:3 }}>
                <Button size="small" onClick={prevMonth} startIcon={<ArrowLeftIcon />}>Prev</Button>
                <Typography variant="h6" fontWeight={600}>
                  {MONTHS[month]} {year}
                </Typography>
                <Button size="small" onClick={nextMonth} endIcon={<ArrowRightIcon />}>Next</Button>
              </Box>

              {/* Day headers */}
              <Box sx={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:0.5, mb:0.5 }}>
                {DAYS.map((d) => (
                  <Box key={d} sx={{ textAlign:"center", fontSize:11, fontWeight:600, color:"text.secondary", py:0.5 }}>
                    {d}
                  </Box>
                ))}
              </Box>

              {/* Calendar grid */}
              {loading ? (
                <Box sx={{ display:"flex", justifyContent:"center", py:6 }}><CircularProgress size={32} /></Box>
              ) : (
                <Box sx={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:0.5 }}>
                  {/* Empty cells before first day */}
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <Box key={`empty-${i}`} />
                  ))}

                  {/* Day cells */}
                  {Array.from({ length: daysCount }).map((_, i) => {
                    const day     = i + 1;
                    const dateStr = `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                    const rec     = recordMap[dateStr];
                    const vData   = dailyVideoMap[dateStr] || { videosCreated: 0, videosEdited: 0, totalVideos: 0, details: [] };
                    const isToday = dateStr === todayStr;
                    const style   = rec ? STATUS_STYLE[rec.status] : null;
                    const isSunday = new Date(year, month, day).getDay() === 0;
                    const hasVideos = (vData.videosCreated > 0 || vData.videosEdited > 0);

                    return (
                      <Tooltip
                        key={day}
                        title={
                          <Box sx={{ p: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#fff" }}>
                              {day} {MONTHS[month]} {year}
                            </Typography>
                            {rec && (
                              <Box sx={{ mt: 0.5, fontSize: 11, color: style?.border || "#93c5fd" }}>
                                <strong>Attendance:</strong> {style?.label} {rec.note ? `• ${rec.note}` : ""}
                              </Box>
                            )}
                            {hasVideos && (
                              <Box sx={{ mt: 1, pt: 0.75, borderTop: "1px solid rgba(255,255,255,0.2)" }}>
                                <Box sx={{ fontWeight: 800, fontSize: 12, color: "#fef08a", mb: 0.5, display: "flex", gap: 1 }}>
                                  {vData.videosCreated > 0 && <span>🎬 {vData.videosCreated} Video(s) Shot / Made</span>}
                                  {vData.videosEdited > 0 && <span>✍️ {vData.videosEdited} Video(s) Edited</span>}
                                </Box>
                                {vData.details?.map((d, dIdx) => (
                                  <Typography key={dIdx} variant="caption" sx={{ display: "block", color: "rgba(255,255,255,0.85)", fontSize: 10, lineHeight: 1.3 }}>
                                    • {d}
                                  </Typography>
                                ))}
                              </Box>
                            )}
                            {!rec && !hasVideos && (
                              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
                                {isSunday ? "Sunday (Weekend)" : "No attendance or video records"}
                              </Typography>
                            )}
                          </Box>
                        }
                        arrow
                      >
                        <Box sx={{
                          aspectRatio: "1",
                          borderRadius: 2,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "space-between",
                          p: 0.75,
                          cursor: (rec || hasVideos) ? "pointer" : "default",
                          border: isToday
                            ? "2.5px solid #2563eb"
                            : hasVideos
                            ? "1.5px solid #f59e0b"
                            : rec ? `1px solid ${style.border}` : "1px solid #f3f4f6",
                          background: rec
                            ? style.bg
                            : hasVideos ? "#fffbeb" : (isSunday ? "#f9fafb" : "#fff"),
                          boxShadow: hasVideos ? "0 2px 6px rgba(245, 158, 11, 0.15)" : "none",
                          transition: "all 0.15s ease",
                          "&:hover": { transform: "scale(1.04)", zIndex: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
                          minHeight: { xs: 44, sm: 64 },
                        }}>
                          {/* Top: Day Number & Status */}
                          <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography sx={{
                              fontSize: { xs: 11, sm: 13 },
                              fontWeight: isToday ? 800 : (rec || hasVideos) ? 700 : 500,
                              color: isToday ? "#1d4ed8" : (rec ? style.color : (isSunday ? "#9ca3af" : "#1f2937")),
                              lineHeight: 1,
                            }}>
                              {day}
                            </Typography>
                            {rec && (
                              <Typography sx={{ fontSize: { xs: 7, sm: 9 }, color: style.color, lineHeight: 1, fontWeight: 700 }}>
                                {style.label.slice(0, 3).toUpperCase()}
                              </Typography>
                            )}
                          </Box>

                          {/* Middle/Bottom: Daily Video Output Badges */}
                          <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 0.3, alignItems: "center", mt: "auto" }}>
                            {vData.videosCreated > 0 && (
                              <Box sx={{
                                width: "100%",
                                textAlign: "center",
                                py: 0.2,
                                px: 0.3,
                                borderRadius: 1,
                                bgcolor: "#fef3c7",
                                color: "#92400e",
                                fontSize: { xs: 8, sm: 10 },
                                fontWeight: 800,
                                lineHeight: 1.1,
                                border: "1px solid #fde68a",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 0.3
                              }}>
                                <span>🎬</span>
                                <span>{vData.videosCreated}</span>
                              </Box>
                            )}
                            {vData.videosEdited > 0 && (
                              <Box sx={{
                                width: "100%",
                                textAlign: "center",
                                py: 0.2,
                                px: 0.3,
                                borderRadius: 1,
                                bgcolor: "#ede9fe",
                                color: "#5b21b6",
                                fontSize: { xs: 8, sm: 10 },
                                fontWeight: 800,
                                lineHeight: 1.1,
                                border: "1px solid #ddd6fe",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 0.3
                              }}>
                                <span>✍️</span>
                                <span>{vData.videosEdited}</span>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Box>
              )}

              {/* Legend */}
              <Box sx={{ display:"flex", flexWrap:"wrap", gap:1.5, mt:2.5, pt:2, borderTop:"1px solid #f3f4f6" }}>
                {Object.entries(STATUS_STYLE).map(([key, s]) => (
                  <Box key={key} sx={{ display:"flex", alignItems:"center", gap:0.5 }}>
                    <Box sx={{ width:12, height:12, borderRadius:1, background:s.bg, border:`1px solid ${s.border}` }} />
                    <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                  </Box>
                ))}
                <Box sx={{ display:"flex", alignItems:"center", gap:0.5 }}>
                  <Box sx={{ width:12, height:12, borderRadius:1, border:"2px solid #2563eb" }} />
                  <Typography variant="caption" color="text.secondary">Today</Typography>
                </Box>
                <Box sx={{ display:"flex", alignItems:"center", gap:0.5, ml: "auto" }}>
                  <Box sx={{ px: 0.8, py: 0.2, borderRadius: 1, bgcolor: "#fef3c7", border: "1px solid #fde68a", fontSize: 11, fontWeight: 700, color: "#92400e" }}>
                    🎬 Videos Made
                  </Box>
                  <Box sx={{ px: 0.8, py: 0.2, borderRadius: 1, bgcolor: "#ede9fe", border: "1px solid #ddd6fe", fontSize: 11, fontWeight: 700, color: "#5b21b6" }}>
                    ✍️ Videos Edited
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar Summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb:2 }}>
            <CardContent>
              <Typography variant="h6" mb={1.5}>
                {MONTHS[month]} Summary
              </Typography>
              <Divider sx={{ mb:2 }} />
              {Object.entries(STATUS_STYLE).map(([key, s]) => (
                <Box key={key} sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:1.25 }}>
                  <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
                    <Box sx={{ width:10, height:10, borderRadius:1, background:s.bg, border:`1px solid ${s.border}` }} />
                    <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                  </Box>
                  <Chip
                    label={key === "half_day" ? `${counts[key]} (=${counts[key]*0.5}d)` : counts[key]}
                    size="small"
                    sx={{ background:s.bg, color:s.color, fontWeight:600, fontSize:11 }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* Salary preview */}
          {staff && (
            <Card>
              <CardContent>
                <Typography variant="h6" mb={1.5}>Salary Preview</Typography>
                <Divider sx={{ mb:2 }} />
                <Box sx={{ display:"flex", justifyContent:"space-between", mb:1 }}>
                  <Typography variant="body2" color="text.secondary">Gross Salary</Typography>
                  <Typography variant="body2" fontWeight={500}>₹{Number(staff.salary).toLocaleString("en-IN")}</Typography>
                </Box>
                <Box sx={{ display:"flex", justifyContent:"space-between", mb:1 }}>
                  <Typography variant="body2" color="text.secondary">Per Day (÷26)</Typography>
                  <Typography variant="body2">₹{perDay.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display:"flex", justifyContent:"space-between", mb:1 }}>
                  <Typography variant="body2" color="text.secondary">Deduct Days</Typography>
                  <Typography variant="body2" color={deductDays > 0 ? "error" : "text.secondary"}>{deductDays} days</Typography>
                </Box>
                <Box sx={{ display:"flex", justifyContent:"space-between", mb:2 }}>
                  <Typography variant="body2" color="text.secondary">Deduction</Typography>
                  <Typography variant="body2" color={deduction > 0 ? "error.main" : "text.secondary"} fontWeight={600}>
                    {deduction > 0 ? `−₹${deduction.toLocaleString("en-IN")}` : "—"}
                  </Typography>
                </Box>
                <Divider sx={{ mb:1.5 }} />
                <Box sx={{ display:"flex", justifyContent:"space-between", p:1.5, background:"#dcfce7", borderRadius:2 }}>
                  <Typography fontWeight={700} color="#166534" fontSize={14}>Net Salary</Typography>
                  <Typography fontWeight={700} color="#166534" fontSize={16}>₹{netSalary.toLocaleString("en-IN")}</Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Monthly Work Logs Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>📝 Month Work Logs & Production</Typography>
              <Typography variant="caption" color="text.secondary">Daily video production & work records for {MONTHS[month]} {year}</Typography>
            </Box>
            {workStats && (
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  icon={<span style={{ fontSize: 14 }}>🎬</span>}
                  label={`Videos Made: ${workStats.totalVideos || 0}`}
                  sx={{ fontWeight: 700, bgcolor: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}
                  size="small"
                />
                <Chip
                  icon={<span style={{ fontSize: 14 }}>✍️</span>}
                  label={`Videos Edited: ${workStats.totalVideosEdited || 0}`}
                  sx={{ fontWeight: 700, bgcolor: "#ede9fe", color: "#5b21b6", border: "1px solid #ddd6fe" }}
                  size="small"
                />
                {workStats.totalShoots > 0 && (
                  <Chip
                    icon={<span style={{ fontSize: 14 }}>📸</span>}
                    label={`Shoots: ${workStats.totalShoots}`}
                    sx={{ fontWeight: 700, bgcolor: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0" }}
                    size="small"
                  />
                )}
                <Chip
                  icon={<span style={{ fontSize: 14 }}>🎨</span>}
                  label={`Posts Designed: ${workStats.totalPosts || 0}`}
                  variant="outlined"
                  size="small"
                />
                <Chip
                  icon={<span style={{ fontSize: 14 }}>⏱️</span>}
                  label={`Hours: ${workStats.totalHours || 0}h`}
                  variant="outlined"
                  size="small"
                />
              </Box>
            )}
          </Box>
          <Divider sx={{ mb: 2 }} />

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ background: "#f9fafb" }}>
                  {["Date", "Work Type", "Description", "Work Items / Outputs"].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 600, fontSize: 12, color: "text.secondary", py: 1.5 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {workLogs.map((log) => {
                  const isShoot = log.workType === "shooting";
                  const isEdit  = log.workType === "video_editing";
                  const isScript = log.workType === "content_writing";
                  
                  return (
                    <TableRow key={log._id} hover>
                      <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>
                        {new Date(log.date + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            isShoot ? "🎬 SHOOTING" :
                            isEdit  ? "✍️ VIDEO EDITING" :
                            isScript ? "📝 SCRIPT WRITING" :
                            (log.workType?.replace("_", " ")?.toUpperCase() || "GENERAL")
                          }
                          size="small"
                          sx={{
                            fontSize: 10,
                            fontWeight: 700,
                            bgcolor: isShoot ? "#fef3c7" : isEdit ? "#ede9fe" : isScript ? "#e0f2fe" : "#f1f5f9",
                            color: isShoot ? "#92400e" : isEdit ? "#5b21b6" : isScript ? "#0369a1" : "#475569",
                            border: isShoot ? "1px solid #fde68a" : isEdit ? "1px solid #ddd6fe" : "none"
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: 12, maxWidth: 320 }}>
                        <Typography variant="body2" sx={{ fontSize: 12, fontWeight: 500, color: "text.primary" }}>
                          {log.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, alignItems: "center" }}>
                          {log.items && log.items.length > 0 ? (
                            log.items.map((item, idx) => (
                              <Box key={idx} sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                                {item.videosCreated > 0 && (
                                  <Chip
                                    label={`🎬 ${item.videosCreated} Video${item.videosCreated > 1 ? "s" : ""} Shot`}
                                    size="small"
                                    sx={{ fontSize: 11, fontWeight: 700, bgcolor: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}
                                  />
                                )}
                                {item.videosEdited > 0 && (
                                  <Chip
                                    label={`✍️ ${item.videosEdited} Video${item.videosEdited > 1 ? "s" : ""} Edited`}
                                    size="small"
                                    sx={{ fontSize: 11, fontWeight: 700, bgcolor: "#ede9fe", color: "#5b21b6", border: "1px solid #ddd6fe" }}
                                  />
                                )}
                                {item.name && (
                                  <Chip
                                    label={item.name}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: 10, fontWeight: 600 }}
                                  />
                                )}
                              </Box>
                            ))
                          ) : (
                            <>
                              {log.videosCreated > 0 && (
                                <Chip
                                  label={`🎬 ${log.videosCreated} Video${log.videosCreated > 1 ? "s" : ""} Shot`}
                                  size="small"
                                  sx={{ fontSize: 11, fontWeight: 700, bgcolor: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}
                                />
                              )}
                              {log.videosEdited > 0 && (
                                <Chip
                                  label={`✍️ ${log.videosEdited} Video${log.videosEdited > 1 ? "s" : ""} Edited`}
                                  size="small"
                                  sx={{ fontSize: 11, fontWeight: 700, bgcolor: "#ede9fe", color: "#5b21b6", border: "1px solid #ddd6fe" }}
                                />
                              )}
                              {log.postsDesigned > 0 && (
                                <Chip label={`🎨 ${log.postsDesigned} Posts`} size="small" sx={{ fontSize: 10 }} />
                              )}
                              {log.hoursWorked > 0 && (
                                <Chip label={`⏱️ ${log.hoursWorked}h`} size="small" variant="outlined" sx={{ fontSize: 10 }} />
                              )}
                              {log.clientId?.businessName && (
                                <Chip label={`Client: ${log.clientId.businessName}`} size="small" variant="outlined" sx={{ fontSize: 10 }} />
                              )}
                              {!log.videosCreated && !log.videosEdited && !log.postsDesigned && !log.hoursWorked && !log.clientId && (
                                <Typography variant="caption" color="text.secondary">—</Typography>
                              )}
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {workLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      No video production or work records found for this month.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
