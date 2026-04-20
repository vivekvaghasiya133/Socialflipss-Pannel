import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Card, CardContent, Chip, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, Alert, Snackbar,
  CircularProgress, Tooltip, Avatar, Grid, Divider, Badge,
} from "@mui/material";
import ArrowBackIcon  from "@mui/icons-material/ArrowBack";
import AddIcon        from "@mui/icons-material/Add";
import EditIcon       from "@mui/icons-material/Edit";
import DeleteIcon     from "@mui/icons-material/Delete";
import LinkIcon       from "@mui/icons-material/Link";
import CheckIcon      from "@mui/icons-material/CheckCircle";
import DragIcon       from "@mui/icons-material/DragIndicator";
import { getProjectById, updateProject } from "../api/projectsApi";
import { getContent, createContent, updateContent, deleteContent } from "../api/projectsApi";
import { getUsers } from "../api/leadsApi";
import { useAuth } from "../context/AuthContext";

const STAGES = [
  { key:"idea",     label:"💡 Idea",      color:"#6b7280", bg:"#f3f4f6" },
  { key:"approved", label:"✅ Approved",  color:"#0891b2", bg:"#e0f2fe" },
  { key:"shooting", label:"🎬 Shooting",  color:"#7c3aed", bg:"#ede9fe" },
  { key:"editing",  label:"✂️ Editing",   color:"#d97706", bg:"#fef3c7" },
  { key:"posted",   label:"🚀 Posted",    color:"#059669", bg:"#d1fae5" },
];

const TYPE_COLORS = {
  reel:"#1a56db", post:"#0891b2", story:"#8b5cf6",
  carousel:"#d97706", youtube:"#e02424", other:"#6b7280",
};

const PRIORITY_COLORS = { high:"error", medium:"warning", low:"default" };

const EMPTY_CONTENT = {
  title:"", type:"reel", description:"", platform:"instagram",
  assignedTo:"", shootDate:"", postDate:"", driveLink:"", priority:"medium",
};

function ContentCard({ item, onEdit, onDelete, onStageChange, stages, canManage, dragging, onDragStart, onDragEnd }) {
  return (
    <Card
      draggable={canManage}
      onDragStart={() => onDragStart(item)}
      onDragEnd={onDragEnd}
      sx={{
        mb:1.5, cursor: canManage ? "grab" : "default",
        opacity: dragging ? 0.5 : 1,
        border:"1px solid #e5e7eb",
        "&:hover":{ boxShadow:3 },
        transition:"box-shadow 0.15s",
      }}
    >
      <CardContent sx={{ p:"12px !important" }}>
        {/* Type + Priority */}
        <Box sx={{ display:"flex", justifyContent:"space-between", mb:1 }}>
          <Chip label={item.type.toUpperCase()} size="small"
            sx={{ fontSize:10, height:18, bgcolor: TYPE_COLORS[item.type]+"18", color: TYPE_COLORS[item.type], fontWeight:700 }} />
          <Chip label={item.priority} color={PRIORITY_COLORS[item.priority]} size="small" sx={{ fontSize:10, height:18 }} />
        </Box>

        {/* Title */}
        <Typography variant="body2" fontWeight={600} mb={0.5} sx={{ lineHeight:1.4 }}>{item.title}</Typography>

        {/* Description */}
        {item.description && (
          <Typography variant="caption" color="text.secondary" display="block" mb={1}
            sx={{ overflow:"hidden", textOverflow:"ellipsis", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
            {item.description}
          </Typography>
        )}

        {/* Dates */}
        <Box sx={{ display:"flex", gap:1, flexWrap:"wrap", mb:1 }}>
          {item.shootDate && (
            <Chip label={`📷 ${new Date(item.shootDate).toLocaleDateString("en-IN")}`} size="small" variant="outlined" sx={{ fontSize:10, height:18 }} />
          )}
          {item.postDate && (
            <Chip label={`📅 ${new Date(item.postDate).toLocaleDateString("en-IN")}`} size="small" variant="outlined" sx={{ fontSize:10, height:18 }} />
          )}
        </Box>

        {/* Links */}
        {(item.driveLink || item.instagramLink) && (
          <Box sx={{ display:"flex", gap:0.5, mb:1 }}>
            {item.driveLink && (
              <Tooltip title="Drive Link"><IconButton size="small" component="a" href={item.driveLink} target="_blank"><LinkIcon sx={{ fontSize:14, color:"#1a56db" }} /></IconButton></Tooltip>
            )}
            {item.instagramLink && (
              <Tooltip title="Instagram Post"><IconButton size="small" component="a" href={item.instagramLink} target="_blank"><CheckIcon sx={{ fontSize:14, color:"#059669" }} /></IconButton></Tooltip>
            )}
          </Box>
        )}

        {/* Bottom row */}
        <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          {item.assignedTo ? (
            <Tooltip title={item.assignedTo.name}>
              <Avatar sx={{ width:22, height:22, fontSize:10, bgcolor:"#1a56db" }}>
                {item.assignedTo.name?.[0]}
              </Avatar>
            </Tooltip>
          ) : <Box />}

          {canManage && (
            <Box sx={{ display:"flex", gap:0.25 }}>
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => onEdit(item)}><EditIcon sx={{ fontSize:14 }} /></IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton size="small" color="error" onClick={() => onDelete(item._id)}><DeleteIcon sx={{ fontSize:14 }} /></IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default function ProjectKanban() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { canManage, isAdmin } = useAuth();

  const [project, setProject]   = useState(null);
  const [content, setContent]   = useState([]);
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState("");
  const [error, setError]       = useState("");

  // Add/Edit dialog
  const [dialog, setDialog]     = useState(false);
  const [editTarget, setEdit]   = useState(null);
  const [form, setForm]         = useState(EMPTY_CONTENT);
  const [formError, setFormError] = useState("");

  // Drag state
  const [draggingItem, setDraggingItem] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  // Project edit
  const [projDialog, setProjDialog] = useState(false);
  const [projForm, setProjForm]     = useState({});

  const load = () => {
    Promise.all([
      getProjectById(id),
      getContent({ projectId: id, limit: 200 }),
      getUsers(),
    ]).then(([pr, cr, ur]) => {
      setProject(pr.data);
      setContent(cr.data.content);
      setUsers(ur.data);
      setProjForm({
        name: pr.data.name, status: pr.data.status,
        monthlyGoal: pr.data.monthlyGoal || "",
        notes: pr.data.notes || "",
        advancePaid: pr.data.advancePaid,
        advanceAmount: pr.data.advanceAmount || 0,
      });
    }).catch(() => navigate("/admin/projects"))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [id]);

  // Kanban columns
  const columns = STAGES.map(s => ({
    ...s,
    items: content.filter(c => c.stage === s.key),
  }));

  // Drag handlers
  const handleDragStart = (item) => setDraggingItem(item);
  const handleDragEnd   = ()     => { setDraggingItem(null); setDragOverStage(null); };
  const handleDrop      = async (stageKey) => {
    if (!draggingItem || draggingItem.stage === stageKey) return;
    try {
      await updateContent(draggingItem._id, { stage: stageKey });
      setContent(prev => prev.map(c => c._id === draggingItem._id ? { ...c, stage: stageKey } : c));
      setToast(`Moved to ${STAGES.find(s=>s.key===stageKey)?.label}`);
    } catch { setError("Stage update failed."); }
    setDraggingItem(null); setDragOverStage(null);
  };

  // Add / Edit content
  const openAdd  = ()    => { setEdit(null); setForm(EMPTY_CONTENT); setDialog(true); };
  const openEdit = (item) => {
    setEdit(item);
    setForm({
      title:      item.title,
      type:       item.type,
      description:item.description || "",
      platform:   item.platform || "instagram",
      assignedTo: item.assignedTo?._id || "",
      shootDate:  item.shootDate  ? item.shootDate.slice(0,10)  : "",
      postDate:   item.postDate   ? item.postDate.slice(0,10)   : "",
      driveLink:  item.driveLink  || "",
      instagramLink: item.instagramLink || "",
      priority:   item.priority   || "medium",
      stage:      item.stage,
      clientApproved: item.clientApproved || false,
    });
    setDialog(true);
  };

  const handleSave = async () => {
    if (!form.title) { setFormError("Title required chhe."); return; }
    setFormError("");
    try {
      if (editTarget) {
        const updated = await updateContent(editTarget._id, form);
        setContent(prev => prev.map(c => c._id === editTarget._id ? updated.data : c));
        setToast("Content updated!");
      } else {
        const created = await createContent({ ...form, projectId: id, clientId: project.clientId._id || project.clientId });
        setContent(prev => [...prev, created.data]);
        setToast("Content added!");
      }
      setDialog(false);
    } catch (err) { setFormError(err.response?.data?.message || "Failed"); }
  };

  const handleDelete = async (contentId) => {
    await deleteContent(contentId);
    setContent(prev => prev.filter(c => c._id !== contentId));
    setToast("Content deleted.");
  };

  const handleProjSave = async () => {
    await updateProject(id, projForm);
    setProject(prev => ({ ...prev, ...projForm }));
    setProjDialog(false);
    setToast("Project updated!");
  };

  const f = (key) => ({ fullWidth:true, size:"small", value:form[key]||"", onChange:(e)=>setForm({...form,[key]:e.target.value}) });

  if (loading) return <Box sx={{ display:"flex", justifyContent:"center", pt:8 }}><CircularProgress /></Box>;

  const totalContent  = content.length;
  const postedContent = content.filter(c => c.stage === "posted").length;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/admin/projects")} sx={{ mb:2 }}>Back to Projects</Button>

      {/* Header */}
      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", mb:3, flexWrap:"wrap", gap:2 }}>
        <Box>
          <Typography variant="h5">{project?.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {project?.clientId?.businessName} · {postedContent}/{totalContent} content posted
          </Typography>
          {project?.monthlyGoal && (
            <Typography variant="caption" color="text.secondary">Goal: {project.monthlyGoal}</Typography>
          )}
        </Box>
        <Box sx={{ display:"flex", gap:1, flexWrap:"wrap" }}>
          <Chip
            label={project?.status?.replace("_"," ").toUpperCase()}
            color={{ planning:"info", active:"success", completed:"secondary", on_hold:"warning" }[project?.status]}
            sx={{ fontWeight:700 }}
          />
          {canManage && (
            <>
              <Button size="small" variant="outlined" onClick={() => setProjDialog(true)}>Edit Project</Button>
              <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Content</Button>
            </>
          )}
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb:2 }} onClose={() => setError("")}>{error}</Alert>}

      {/* Kanban Board */}
      <Box sx={{ display:"flex", gap:2, overflowX:"auto", pb:2, alignItems:"flex-start" }}>
        {columns.map(col => (
          <Box
            key={col.key}
            onDragOver={e => { e.preventDefault(); setDragOverStage(col.key); }}
            onDrop={() => handleDrop(col.key)}
            sx={{
              minWidth:260, flex:"0 0 260px",
              background: dragOverStage === col.key ? col.bg : "#f9fafb",
              borderRadius:2,
              border: dragOverStage === col.key ? `2px dashed ${col.color}` : "2px solid transparent",
              p:1.5,
              transition:"border 0.15s, background 0.15s",
            }}
          >
            {/* Column header */}
            <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:1.5 }}>
              <Typography variant="body2" fontWeight={700} sx={{ color:col.color }}>{col.label}</Typography>
              <Chip label={col.items.length} size="small"
                sx={{ fontSize:11, height:20, bgcolor:col.color+"22", color:col.color, fontWeight:700 }} />
            </Box>

            {/* Cards */}
            {col.items.map(item => (
              <ContentCard
                key={item._id}
                item={item}
                onEdit={openEdit}
                onDelete={handleDelete}
                onStageChange={handleDrop}
                stages={STAGES}
                canManage={canManage}
                dragging={draggingItem?._id === item._id}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
            ))}

            {col.items.length === 0 && (
              <Box sx={{ py:3, textAlign:"center", color:"text.disabled", fontSize:12 }}>
                No content
              </Box>
            )}
          </Box>
        ))}
      </Box>

      {/* Add/Edit Content Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editTarget ? "Edit Content" : "Add Content"}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb:2 }}>{formError}</Alert>}
          <Grid container spacing={2} sx={{ mt:0.5 }}>
            <Grid item xs={12}><TextField {...f("title")} label="Title *" placeholder="Reel on product benefits..." /></Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select value={form.type} label="Type" onChange={e => setForm({...form,type:e.target.value})}>
                  {["reel","post","story","carousel","youtube","other"].map(t => <MenuItem key={t} value={t} sx={{ textTransform:"capitalize" }}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select value={form.priority} label="Priority" onChange={e => setForm({...form,priority:e.target.value})}>
                  {["high","medium","low"].map(p => <MenuItem key={p} value={p} sx={{ textTransform:"capitalize" }}>{p}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField {...f("description")} label="Caption / Concept" multiline rows={2} placeholder="Idea, caption draft, hook..." />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Assigned To</InputLabel>
                <Select value={form.assignedTo} label="Assigned To" onChange={e => setForm({...form,assignedTo:e.target.value})}>
                  <MenuItem value="">Unassigned</MenuItem>
                  {users.map(u => <MenuItem key={u._id} value={u._id}>{u.name} ({u.role})</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            {editTarget && (
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Stage</InputLabel>
                  <Select value={form.stage} label="Stage" onChange={e => setForm({...form,stage:e.target.value})}>
                    {STAGES.map(s => <MenuItem key={s.key} value={s.key}>{s.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={6}><TextField {...f("shootDate")} label="Shoot Date" type="date" InputLabelProps={{ shrink:true }} /></Grid>
            <Grid item xs={6}><TextField {...f("postDate")}  label="Post Date"  type="date" InputLabelProps={{ shrink:true }} /></Grid>
            <Grid item xs={12}><TextField {...f("driveLink")} label="Drive Link (raw files)" placeholder="https://drive.google.com/..." /></Grid>
            {editTarget && (
              <Grid item xs={12}><TextField {...f("instagramLink")} label="Instagram Link (after posting)" placeholder="https://instagram.com/p/..." /></Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2 }}>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{editTarget ? "Save Changes" : "Add Content"}</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={projDialog} onClose={() => setProjDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt:0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Project Name" value={projForm.name||""}
                onChange={e => setProjForm({...projForm,name:e.target.value})} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={projForm.status||"planning"} label="Status"
                  onChange={e => setProjForm({...projForm,status:e.target.value})}>
                  {Object.entries({ planning:"Planning", active:"Active", completed:"Completed", on_hold:"On Hold" }).map(([k,v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Monthly Goal" value={projForm.monthlyGoal||""}
                onChange={e => setProjForm({...projForm,monthlyGoal:e.target.value})} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Notes" multiline rows={2} value={projForm.notes||""}
                onChange={e => setProjForm({...projForm,notes:e.target.value})} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2 }}>
          <Button onClick={() => setProjDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleProjSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(toast)} autoHideDuration={3000} onClose={() => setToast("")} message={toast} />
    </Box>
  );
}
