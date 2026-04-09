import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Card, CardContent, Button, CircularProgress,
  Tooltip, Chip, Grid, Divider, Avatar,
} from "@mui/material";
import ArrowBackIcon  from "@mui/icons-material/ArrowBack";
import ArrowLeftIcon  from "@mui/icons-material/ChevronLeft";
import ArrowRightIcon from "@mui/icons-material/ChevronRight";
import { getStaffById }  from "../api/hrApi";
import { getAttendance } from "../api/hrApi";

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
    const key = typeof r.staffId === "object" ? r.date : r.date;
    recordMap[r.date] = { status: r.status, note: r.note || "" };
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
              <Typography variant="body2" color="text.secondary">{staff.position} {staff.department ? `· ${staff.department}` : ""}</Typography>
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
                    const isToday = dateStr === todayStr;
                    const style   = rec ? STATUS_STYLE[rec.status] : null;
                    const isSunday = new Date(year, month, day).getDay() === 0;

                    return (
                      <Tooltip
                        key={day}
                        title={
                          rec ? (
                            <Box>
                              <strong>{style?.label}</strong>
                              {rec.note && <Box sx={{ mt:0.5, fontSize:11 }}>📝 {rec.note}</Box>}
                            </Box>
                          ) : isSunday ? "Sunday" : "No record"
                        }
                        arrow
                      >
                        <Box sx={{
                          aspectRatio:"1",
                          borderRadius:1.5,
                          display:"flex",
                          flexDirection:"column",
                          alignItems:"center",
                          justifyContent:"center",
                          cursor: rec ? "pointer" : "default",
                          border: isToday
                            ? "2px solid #1a56db"
                            : rec ? `1px solid ${style.border}` : "1px solid #f3f4f6",
                          background: rec
                            ? style.bg
                            : isSunday ? "#f9fafb" : "#fff",
                          transition:"transform 0.1s",
                          "&:hover": rec ? { transform:"scale(1.05)" } : {},
                          minHeight:36,
                        }}>
                          <Typography sx={{
                            fontSize: { xs:10, sm:12 },
                            fontWeight: isToday ? 700 : rec ? 600 : 400,
                            color: rec ? style.color : isSunday ? "#d1d5db" : isToday ? "#1a56db" : "#374151",
                            lineHeight:1,
                          }}>
                            {day}
                          </Typography>
                          {rec && (
                            <Typography sx={{ fontSize:7, color: style.color, lineHeight:1, mt:0.25, fontWeight:600 }}>
                              {style.label.slice(0,3).toUpperCase()}
                            </Typography>
                          )}
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Box>
              )}

              {/* Legend */}
              <Box sx={{ display:"flex", flexWrap:"wrap", gap:1, mt:2.5, pt:2, borderTop:"1px solid #f3f4f6" }}>
                {Object.entries(STATUS_STYLE).map(([key, s]) => (
                  <Box key={key} sx={{ display:"flex", alignItems:"center", gap:0.5 }}>
                    <Box sx={{ width:12, height:12, borderRadius:2, background:s.bg, border:`1px solid ${s.border}` }} />
                    <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                  </Box>
                ))}
                <Box sx={{ display:"flex", alignItems:"center", gap:0.5 }}>
                  <Box sx={{ width:12, height:12, borderRadius:2, background:"#fff", border:"2px solid #1a56db" }} />
                  <Typography variant="caption" color="text.secondary">Today</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Summary sidebar */}
        <Grid item xs={12} md={4}>
          {/* Attendance summary */}
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
    </Box>
  );
}
