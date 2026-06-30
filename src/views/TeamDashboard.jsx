import { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Card, Grid, Table, TableBody, TableCell,
  TableHead, TableRow, TableContainer, IconButton, Button,
  FormControlLabel, Switch, CircularProgress, Alert, Paper,
  Chip, Tooltip, Tabs, Tab, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Divider
} from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckIcon from "@mui/icons-material/CheckCircle";
import LinkIcon from "@mui/icons-material/Link";
import { useAuth } from "../context/AuthContext";
import api from "../api";

const SECTION_CONFIG = {
  script:          { title: "✍️ Writers Section",     stage: "script",          label: "Tasks in Script Stage", color: "info" },
  shoot:           { title: "🎥 Shooters Section",    stage: "shoot",           label: "Tasks in Shoot Stage",  color: "secondary" },
  edit:            { title: "🎬 Editors Section",     stage: "edit",            label: "Tasks in Edit Stage",   color: "warning" },
  qc:              { title: "✅ QC Section",          stage: "qc",              label: "Tasks in QC Stage",     color: "success" },
  client_approval: { title: "👤 Account Managers",    stage: "client_approval", label: "Client Approval Stage", color: "primary" }
};

function TaskRow({ task, showClient = true }) {
  return (
    <TableRow hover>
      <TableCell sx={{ py: 1.5 }}>
        <Typography variant="body2" fontWeight={600}>{task.title}</Typography>
        <Typography variant="caption" color="text.secondary">Goal: {task.reelGoal || "Authority"}</Typography>
      </TableCell>
      {showClient && (
        <TableCell sx={{ py: 1.5 }}>
          {task.clientId?.businessName || "Unknown Client"}
        </TableCell>
      )}
      <TableCell sx={{ py: 1.5 }}>
        {task.postDate ? new Date(task.postDate).toLocaleDateString("en-IN") : "No Due Date"}
      </TableCell>
      <TableCell sx={{ py: 1.5 }}>
        {task.stage === "shoot" ? (task.shooterId?.name || <Typography variant="caption" color="text.disabled">Unassigned</Typography>) :
         (task.stage === "edit" || task.stage === "qc") ? (task.editorId?.name || <Typography variant="caption" color="text.disabled">Unassigned</Typography>) :
         (task.assignedTo?.name || <Typography variant="caption" color="text.disabled">Unassigned</Typography>)}
      </TableCell>
      <TableCell sx={{ py: 1.5 }} align="right">
        {task.driveLink && (
          <Tooltip title="Google Drive Link">
            <IconButton size="small" component="a" href={task.driveLink} target="_blank">
              <LinkIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
        {task.clientApproved && (
          <Chip label="Client Approved" color="success" size="small" sx={{ height: 18, fontSize: 9, ml: 1 }} />
        )}
      </TableCell>
    </TableRow>
  );
}

function ScriptTaskRow({ task, onEdit }) {
  const getStatusColor = (status) => {
    if (status === "approved") return "success";
    if (status === "changes_requested") return "error";
    if (status === "pending" && task.scriptText) return "warning";
    return "default";
  };

  const getStatusLabel = (status) => {
    if (status === "approved") return "Approved";
    if (status === "changes_requested") return "Revision Requested";
    if (status === "pending" && task.scriptText) return "In Review";
    return "Not Written";
  };

  return (
    <TableRow hover>
      <TableCell sx={{ py: 1.5 }}>
        <Typography variant="body2" fontWeight={600}>{task.title}</Typography>
        {task.description && (
          <Typography variant="caption" color="text.secondary" display="block">
            Brief: {task.description}
          </Typography>
        )}
        {task.scriptApprovalStatus === "changes_requested" && task.scriptApprovalNote && (
          <Box sx={{ mt: 1, p: 1, bgcolor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 1.5 }}>
            <Typography variant="caption" color="error.main" fontWeight={600} display="block">
              💬 Revision requested by Client:
            </Typography>
            <Typography variant="caption" color="text.primary">
              {task.scriptApprovalNote}
            </Typography>
          </Box>
        )}
      </TableCell>
      <TableCell sx={{ py: 1.5 }}>
        {task.clientId?.businessName || "Unknown Client"}
      </TableCell>
      <TableCell sx={{ py: 1.5 }}>
        {task.postDate ? new Date(task.postDate).toLocaleDateString("en-IN") : "No Due Date"}
      </TableCell>
      <TableCell sx={{ py: 1.5 }}>
        <Chip
          label={getStatusLabel(task.scriptApprovalStatus)}
          color={getStatusColor(task.scriptApprovalStatus)}
          size="small"
          sx={{ fontWeight: 600, fontSize: 10 }}
        />
      </TableCell>
      <TableCell sx={{ py: 1.5 }} align="right">
        <Button
          size="small"
          variant="contained"
          color={task.scriptApprovalStatus === "changes_requested" ? "error" : "primary"}
          onClick={() => onEdit(task)}
        >
          {task.scriptText ? "Edit Script" : "Write Script"}
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function TeamDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [myTasksOnly, setMyTasksOnly] = useState(false);

  // Script writer tabs & edit states
  const [scriptTab, setScriptTab] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [scriptForm, setScriptForm] = useState({ scriptText: "" });

  const handleOpenEditScript = (task) => {
    setEditingTask(task);
    setScriptForm({ scriptText: task.scriptText || "" });
    setEditDialogOpen(true);
  };

  const handleSaveScript = async () => {
    try {
      const payload = {
        scriptText: scriptForm.scriptText,
        scriptApprovalStatus: "pending",
        scriptApproved: false,
        scriptApprovalNote: "" // clear previous changes request notes
      };
      
      await api.put(`/content/${editingTask._id}`, payload);
      setEditDialogOpen(false);
      loadTasks();
    } catch (err) {
      setError("Failed to save script.");
    }
  };

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/content", { params: { type: "reel", limit: 300 } });
      setTasks(res.data.content || []);
    } catch (err) {
      setError("Failed to load team tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Filter tasks assigned to me or all
  const filteredTasks = tasks.filter(task => {
    if (myTasksOnly) {
      const isAssigned = task.assignedTo?._id === user?._id || task.assignedTo === user?._id;
      const isShooter  = task.shooterId?._id === user?._id || task.shooterId === user?._id;
      const isEditor   = task.editorId?._id === user?._id || task.editorId === user?._id;
      return isAssigned || isShooter || isEditor;
    }
    return true;
  });

  const getTasksByStage = (stageKey) => {
    return filteredTasks.filter(task => task.stage === stageKey);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            👨‍💼 Team Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Operational dashboard organized by operational stages. Zero confusion, fast execution.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FormControlLabel
            control={
              <Switch 
                checked={myTasksOnly} 
                onChange={(e) => setMyTasksOnly(e.target.checked)} 
                color="primary"
              />
            }
            label={<Typography variant="body2" fontWeight={600}>Show My Tasks Only</Typography>}
          />
          <Button variant="outlined" size="small" onClick={loadTasks}>
            Refresh
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Grid of Sections */}
      <Grid container spacing={3}>
        {Object.entries(SECTION_CONFIG).map(([key, config]) => {
          const stageTasks = getTasksByStage(config.stage);

          if (config.stage === "script") {
            const pendingTasks = stageTasks.filter(t => !t.scriptText);
            const revisionTasks = stageTasks.filter(t => t.scriptApprovalStatus === "changes_requested");
            const reviewTasks = stageTasks.filter(t => t.scriptText && t.scriptApprovalStatus === "pending");
            const approvedTasks = stageTasks.filter(t => t.scriptApprovalStatus === "approved" || t.scriptApproved);
            
            const tabTasks = [pendingTasks, revisionTasks, reviewTasks, approvedTasks][scriptTab];
            
            return (
              <Grid item xs={12} key={key}>
                <Card sx={{ border: "1px solid #e5e7eb", borderRadius: 2 }}>
                  <Box sx={{ p: 2, bgcolor: "#f9fafb", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {config.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {config.label}
                      </Typography>
                    </Box>
                    <Chip 
                      label={`${stageTasks.length} active`} 
                      color={config.color} 
                      size="small" 
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                  
                  {/* Tab Selector */}
                  <Tabs value={scriptTab} onChange={(e, val) => setScriptTab(val)} variant="scrollable" scrollButtons="auto" sx={{ px: 2, borderBottom: "1px solid #e5e7eb" }}>
                    <Tab label={`📝 Pending Script (${pendingTasks.length})`} sx={{ fontSize: 12, fontWeight: 600 }} />
                    <Tab label={`⚠️ Revisions (${revisionTasks.length})`} sx={{ fontSize: 12, fontWeight: 600, color: revisionTasks.length > 0 ? "error.main" : "inherit" }} />
                    <Tab label={`👀 In Review (${reviewTasks.length})`} sx={{ fontSize: 12, fontWeight: 600 }} />
                    <Tab label={`✅ Approved (${approvedTasks.length})`} sx={{ fontSize: 12, fontWeight: 600 }} />
                  </Tabs>
                  
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, fontSize: 11, color: "text.secondary" }}>Reel Details</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: 11, color: "text.secondary" }}>Client</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: 11, color: "text.secondary" }}>Due Date</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: 11, color: "text.secondary" }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: 11, color: "text.secondary" }} align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tabTasks.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.disabled", fontSize: 12 }}>
                              No tasks in this category.
                            </TableCell>
                          </TableRow>
                        ) : (
                          tabTasks.map(task => (
                            <ScriptTaskRow key={task._id} task={task} onEdit={handleOpenEditScript} />
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Grid>
            );
          }

          return (
            <Grid item xs={12} key={key}>
              <Card sx={{ border: "1px solid #e5e7eb", borderRadius: 2 }}>
                <Box sx={{ p: 2, bgcolor: "#f9fafb", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {config.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {config.label}
                    </Typography>
                  </Box>
                  <Chip 
                    label={`${stageTasks.length} active`} 
                    color={config.color} 
                    size="small" 
                    sx={{ fontWeight: 700 }}
                  />
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, fontSize: 11, color: "text.secondary" }}>Reel Details</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 11, color: "text.secondary" }}>Client</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 11, color: "text.secondary" }}>Due Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 11, color: "text.secondary" }}>Assigned To</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 11, color: "text.secondary" }} align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stageTasks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 3, color: "text.disabled", fontSize: 12 }}>
                            No active tasks in this stage.
                          </TableCell>
                        </TableRow>
                      ) : (
                        stageTasks.map(task => (
                          <TaskRow key={task._id} task={task} />
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Edit Script Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingTask?.scriptText ? "Edit Reel Script" : "Write Reel Script"}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={700}>Reel Title / Concept:</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>{editingTask?.title}</Typography>
            
            {editingTask?.description && (
              <>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>Brief Outline:</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>{editingTask?.description}</Typography>
              </>
            )}
            
            {editingTask?.scriptApprovalStatus === "changes_requested" && editingTask?.scriptApprovalNote && (
              <Box sx={{ p: 1.5, bgcolor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 2, mt: 1.5 }}>
                <Typography variant="subtitle2" color="error.main" fontWeight={700}>
                  💬 Client Revision Feedback:
                </Typography>
                <Typography variant="body2" color="text.primary">
                  {editingTask?.scriptApprovalNote}
                </Typography>
              </Box>
            )}
          </Box>
          <Divider sx={{ my: 2 }} />
          <TextField
            fullWidth
            label="Script Text"
            multiline
            rows={10}
            placeholder="Write your script hooks, visual scenes, and call-to-actions here..."
            value={scriptForm.scriptText}
            onChange={e => setScriptForm({ ...scriptForm, scriptText: e.target.value })}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleSaveScript}>
            Submit Script for Review
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
