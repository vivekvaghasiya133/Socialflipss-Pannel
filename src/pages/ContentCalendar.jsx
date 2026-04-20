import { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent, Chip, Button, Select,
  MenuItem, FormControl, InputLabel, CircularProgress, Tooltip,
  Grid, Divider, Avatar,
} from "@mui/material";
import ArrowLeftIcon  from "@mui/icons-material/ChevronLeft";
import ArrowRightIcon from "@mui/icons-material/ChevronRight";
import { getContent, getContentStats } from "../api/projectsApi";
import { getClients }  from "../api/clientsApi";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const STAGE_STYLE = {
  idea:     { bg:"#f3f4f6", color:"#374151",  label:"Idea",     border:"#d1d5db" },
  approved: { bg:"#e0f2fe", color:"#0369a1",  label:"Approved", border:"#7dd3fc" },
  shooting: { bg:"#ede9fe", color:"#6d28d9",  label:"Shooting", border:"#c4b5fd" },
  editing:  { bg:"#fef3c7", color:"#92400e",  label:"Editing",  border:"#fcd34d" },
  posted:   { bg:"#d1fae5", color:"#065f46",  label:"Posted",   border:"#6ee7b7" },
};

const TYPE_EMOJI = { reel:"🎬", post:"📸", story:"📖", carousel:"🖼️", youtube:"▶️", other:"📄" };

function monthStr(year, month) {
  return `${year}-${String(month + 1).padStart(2,"0")}`;
}

export default function ContentCalendar() {
  const now   = new Date();
  const [year, setYear]     = useState(now.getFullYear());
  const [month, setMonth]   = useState(now.getMonth());
  const [clientId, setClientId] = useState("");
  const [clients, setClients]   = useState([]);
  const [content, setContent]   = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    getClients({ limit:100 }).then(r => setClients(r.data.clients));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { limit:200 };
    if (clientId) params.clientId = clientId;
    Promise.all([
      getContent(params),
      getContentStats(clientId ? { clientId } : {}),
    ]).then(([cr, sr]) => {
      setContent(cr.data.content);
      setStats(sr.data);
    }).finally(() => setLoading(false));
  }, [clientId, year, month]);

  const prevMonth = () => { if (month === 0) { setYear(y=>y-1); setMonth(11); } else setMonth(m=>m-1); };
  const nextMonth = () => { if (month === 11) { setYear(y=>y+1); setMonth(0); } else setMonth(m=>m+1); };

  // Build map of postDate → content items for current month
  const calMap = {};
  content.forEach(c => {
    const dateKey = c.postDate ? c.postDate.slice(0,10) : null;
    if (!dateKey) return;
    const [y,m] = dateKey.split("-");
    if (Number(y) === year && Number(m) === month + 1) {
      if (!calMap[dateKey]) calMap[dateKey] = [];
      calMap[dateKey].push(c);
    }
  });

  const firstDay  = new Date(year, month, 1).getDay();
  const daysCount = new Date(year, month + 1, 0).getDate();
  const todayStr  = new Date().toISOString().slice(0,10);

  // Content without post date (unscheduled)
  const unscheduled = content.filter(c => !c.postDate);

  // Selected day content
  const selectedDayStr  = selectedDay
    ? `${year}-${String(month+1).padStart(2,"0")}-${String(selectedDay).padStart(2,"0")}`
    : null;
  const selectedContent = selectedDayStr ? (calMap[selectedDayStr] || []) : [];

  return (
    <Box>
      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:3, flexWrap:"wrap", gap:2 }}>
        <Box>
          <Typography variant="h5">Content Calendar</Typography>
          <Typography variant="body2" color="text.secondary">Monthly content schedule — post date based</Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth:200 }}>
          <InputLabel>Filter by Client</InputLabel>
          <Select value={clientId} label="Filter by Client" onChange={e => setClientId(e.target.value)}>
            <MenuItem value="">All Clients</MenuItem>
            {clients.map(c => <MenuItem key={c._id} value={c._id}>{c.businessName}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {/* Stats */}
      {stats && (
        <Grid container spacing={1.5} mb={3}>
          {[
            { label:"Total",    value:stats.total,    color:"#1a56db" },
            { label:"Idea",     value:stats.idea,     color:"#6b7280" },
            { label:"Approved", value:stats.approved, color:"#0891b2" },
            { label:"Shooting", value:stats.shooting, color:"#7c3aed" },
            { label:"Editing",  value:stats.editing,  color:"#d97706" },
            { label:"Posted",   value:stats.posted,   color:"#059669" },
          ].map(s => (
            <Grid item xs={4} sm={2} key={s.label}>
              <Card><Box sx={{ p:1.5, textAlign:"center" }}>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                <Typography variant="h5" fontWeight={700} sx={{ color:s.color }}>{s.value}</Typography>
              </Box></Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Grid container spacing={2}>
        {/* Calendar */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              {/* Navigation */}
              <Box sx={{ display:"flex", alignItems:"center", justifyContent:"space-between", mb:2 }}>
                <Button size="small" onClick={prevMonth} startIcon={<ArrowLeftIcon />}>Prev</Button>
                <Typography variant="h6" fontWeight={600}>{MONTHS[month]} {year}</Typography>
                <Button size="small" onClick={nextMonth} endIcon={<ArrowRightIcon />}>Next</Button>
              </Box>

              {/* Day headers */}
              <Box sx={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:0.5, mb:0.5 }}>
                {DAYS.map(d => (
                  <Box key={d} sx={{ textAlign:"center", fontSize:11, fontWeight:600, color:"text.secondary", py:0.5 }}>{d}</Box>
                ))}
              </Box>

              {/* Calendar grid */}
              {loading ? (
                <Box sx={{ display:"flex", justifyContent:"center", py:6 }}><CircularProgress /></Box>
              ) : (
                <Box sx={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:0.5 }}>
                  {Array.from({ length: firstDay }).map((_,i) => <Box key={`e${i}`} />)}
                  {Array.from({ length: daysCount }).map((_,i) => {
                    const day     = i + 1;
                    const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                    const items   = calMap[dateStr] || [];
                    const isToday = dateStr === todayStr;
                    const isSun   = new Date(year, month, day).getDay() === 0;
                    const isSelected = selectedDay === day;

                    return (
                      <Box
                        key={day}
                        onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                        sx={{
                          minHeight:64, borderRadius:1.5, p:0.5, cursor:"pointer",
                          border: isSelected ? "2px solid #1a56db" : isToday ? "2px solid #93c5fd" : "1px solid #f3f4f6",
                          background: isSelected ? "#e8f0fe" : isSun ? "#f9fafb" : "#fff",
                          "&:hover":{ background:"#f0f4ff" },
                          transition:"background 0.1s",
                          overflow:"hidden",
                        }}
                      >
                        <Typography sx={{
                          fontSize:11, fontWeight: isToday ? 700 : 400,
                          color: isToday ? "#1a56db" : isSun ? "#d1d5db" : "#374151",
                          mb:0.25,
                        }}>
                          {day}
                        </Typography>
                        {items.slice(0,3).map(item => {
                          const s = STAGE_STYLE[item.stage];
                          return (
                            <Tooltip key={item._id} title={`${item.title} · ${item.stage}`} arrow>
                              <Box sx={{
                                fontSize:9, fontWeight:600, color:s.color, bgcolor:s.bg,
                                border:`1px solid ${s.border}`, borderRadius:0.75,
                                px:0.5, mb:0.25, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                              }}>
                                {TYPE_EMOJI[item.type]} {item.title}
                              </Box>
                            </Tooltip>
                          );
                        })}
                        {items.length > 3 && (
                          <Typography sx={{ fontSize:9, color:"text.secondary" }}>+{items.length-3} more</Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              )}

              {/* Legend */}
              <Box sx={{ display:"flex", gap:1, flexWrap:"wrap", mt:2, pt:2, borderTop:"1px solid #f3f4f6" }}>
                {Object.entries(STAGE_STYLE).map(([k,s]) => (
                  <Box key={k} sx={{ display:"flex", alignItems:"center", gap:0.5 }}>
                    <Box sx={{ width:10, height:10, borderRadius:1, bgcolor:s.bg, border:`1px solid ${s.border}` }} />
                    <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right panel */}
        <Grid item xs={12} md={4}>
          {/* Selected day detail */}
          {selectedDay && (
            <Card sx={{ mb:2 }}>
              <CardContent>
                <Typography variant="h6" mb={1.5}>
                  {MONTHS[month]} {selectedDay} — {selectedContent.length} content
                </Typography>
                <Divider sx={{ mb:1.5 }} />
                {selectedContent.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">Aa date par koi content schedule nathi.</Typography>
                ) : selectedContent.map(item => {
                  const s = STAGE_STYLE[item.stage];
                  return (
                    <Box key={item._id} sx={{ mb:1.5, p:1.5, bgcolor:s.bg, borderRadius:2, border:`1px solid ${s.border}` }}>
                      <Box sx={{ display:"flex", justifyContent:"space-between", mb:0.5 }}>
                        <Typography variant="body2" fontWeight={600}>{TYPE_EMOJI[item.type]} {item.title}</Typography>
                        <Chip label={s.label} size="small" sx={{ fontSize:10, height:18, color:s.color, bgcolor:"transparent", border:`1px solid ${s.border}` }} />
                      </Box>
                      {item.clientId?.businessName && (
                        <Typography variant="caption" color="text.secondary">{item.clientId.businessName}</Typography>
                      )}
                      {item.assignedTo && (
                        <Box sx={{ display:"flex", alignItems:"center", gap:0.5, mt:0.5 }}>
                          <Avatar sx={{ width:16, height:16, fontSize:8, bgcolor:"#1a56db" }}>{item.assignedTo.name?.[0]}</Avatar>
                          <Typography variant="caption" color="text.secondary">{item.assignedTo.name}</Typography>
                        </Box>
                      )}
                      {item.instagramLink && (
                        <Button size="small" href={item.instagramLink} target="_blank" sx={{ mt:0.5, p:0, fontSize:11 }}>View Post →</Button>
                      )}
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Unscheduled content */}
          <Card>
            <CardContent>
              <Typography variant="h6" mb={1.5}>
                Unscheduled ({unscheduled.length})
              </Typography>
              <Divider sx={{ mb:1.5 }} />
              {unscheduled.length === 0 ? (
                <Typography variant="body2" color="text.secondary">Badha content schedule thayi gaya!</Typography>
              ) : unscheduled.slice(0,8).map(item => {
                const s = STAGE_STYLE[item.stage];
                return (
                  <Box key={item._id} sx={{ display:"flex", alignItems:"center", gap:1, mb:1, p:1, bgcolor:"#f9fafb", borderRadius:1.5 }}>
                    <Typography sx={{ fontSize:14 }}>{TYPE_EMOJI[item.type]}</Typography>
                    <Box sx={{ flex:1, overflow:"hidden" }}>
                      <Typography variant="caption" fontWeight={600} display="block" sx={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{item.clientId?.businessName}</Typography>
                    </Box>
                    <Chip label={s.label} size="small" sx={{ fontSize:9, height:16, color:s.color, bgcolor:s.bg }} />
                  </Box>
                );
              })}
              {unscheduled.length > 8 && (
                <Typography variant="caption" color="text.secondary">+{unscheduled.length-8} more unscheduled</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
