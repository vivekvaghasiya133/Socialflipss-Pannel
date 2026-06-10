import { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Card, Grid, Table, TableBody, TableCell,
  TableHead, TableRow, TableContainer, IconButton, Button,
  FormControlLabel, Switch, CircularProgress, Alert, Paper,
  Chip, Tooltip
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
        {task.assignedTo?.name || (
          <Typography variant="caption" color="text.disabled">Unassigned</Typography>
        )}
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

export default function TeamDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [myTasksOnly, setMyTasksOnly] = useState(false);

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
    if (myTasksOnly && task.assignedTo?._id !== user?._id) return false;
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
    </Box>
  );
}
