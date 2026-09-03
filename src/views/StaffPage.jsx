import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, MenuItem, Select,
  FormControl, InputLabel, Alert, Snackbar, Tooltip, Avatar,
} from "@mui/material";
import AddIcon         from "@mui/icons-material/Add";
import EditIcon        from "@mui/icons-material/Edit";
import BlockIcon       from "@mui/icons-material/Block";
import CalendarIcon    from "@mui/icons-material/CalendarMonth";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VpnKeyIcon      from "@mui/icons-material/VpnKey";
import PersonAddIcon   from "@mui/icons-material/PersonAdd";
import { getStaff, createStaff, updateStaff, deactivateStaff } from "../api/hrApi";
import { getUsers, createUser, updateUser } from "../api/leadsApi";

const DEPARTMENTS = ["Content", "SEO", "Design", "Video Production", "Ads / PPC", "Management", "Other"];
const EMPTY = { name: "", email: "", mobile: "", position: "", department: "", joiningDate: "", salary: "" };

const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || window.location.origin;

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function AvatarCell({ name }) {
  const colors = ["#1a56db", "#0e9f6e", "#8b5cf6", "#e02424", "#FF5200", "#0891b2"];
  const color  = colors[name.charCodeAt(0) % colors.length];
  return (
    <Avatar sx={{ width: 36, height: 36, bgcolor: color, fontSize: 13, fontWeight: 700 }}>
      {getInitials(name)}
    </Avatar>
  );
}

export default function StaffPage() {
  const navigate = useNavigate();
  const [staff, setStaff]             = useState([]);
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [dialog, setDialog]           = useState(false);
  const [editTarget, setEdit]         = useState(null);
  const [form, setForm]               = useState(EMPTY);
  const [toast, setToast]             = useState("");
  const [error, setError]             = useState("");
  const [deactivateTarget, setDeactivateTarget] = useState(null);

  // Portal login setup & reset password state
  const [portalDialog, setPortalDialog]   = useState(false);
  const [portalStaff, setPortalStaff]     = useState(null);
  const [portalForm, setPortalForm]       = useState({ password: "", role: "team" });
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [targetUserId, setTargetUserId]   = useState(null);

  // Direct User Creation state
  const [directUserDialog, setDirectUserDialog] = useState(false);
  const [directUserForm, setDirectUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "team",
    position: "Team Member",
  });

  const load = () => {
    setLoading(true);
    Promise.all([getStaff(), getUsers()])
      .then(([staffRes, usersRes]) => {
        setStaff(staffRes.data || []);
        setUsers(usersRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const hasUserAccount = (email) => {
    if (!email) return false;
    return users.some((u) => u.email?.toLowerCase() === email.toLowerCase());
  };

  const getUserAccount = (email) => {
    if (!email) return null;
    return users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) || null;
  };

  const openPortalDialog = (s) => {
    setPortalStaff(s);
    setError("");
    const existing = getUserAccount(s.email);

    if (existing) {
      setIsEditingUser(true);
      setTargetUserId(existing._id);
      setPortalForm({ password: "", role: existing.role || "team" });
    } else {
      setIsEditingUser(false);
      setTargetUserId(null);

      // Auto-suggest role based on staff position
      let suggestedRole = "team";
      const pos = (s.position || "").toLowerCase();
      if (pos.includes("admin") || pos.includes("owner")) suggestedRole = "admin";
      else if (pos.includes("manager")) suggestedRole = "manager";
      else if (pos.includes("edit")) suggestedRole = "editor";
      else if (pos.includes("shoot") || pos.includes("video")) suggestedRole = "shooter";
      else if (pos.includes("write") || pos.includes("content")) suggestedRole = "writer";

      setPortalForm({ password: "", role: suggestedRole });
    }
    setPortalDialog(true);
  };

  const handleCreateOrUpdatePortal = async () => {
    if (!isEditingUser && !portalForm.password) {
      setError("Password is required for creating an account.");
      return;
    }
    setError("");
    try {
      if (isEditingUser) {
        const payload = { role: portalForm.role };
        if (portalForm.password.trim()) {
          payload.password = portalForm.password.trim();
        }
        await updateUser(targetUserId, payload);
        setToast(portalForm.password.trim()
          ? `Password & Role updated for ${portalStaff.name}! 🔑`
          : `Role updated for ${portalStaff.name}! ✨`
        );
      } else {
        await createUser({
          name: portalStaff.name,
          email: portalStaff.email,
          mobile: portalStaff.mobile || "",
          position: portalStaff.position,
          role: portalForm.role,
          password: portalForm.password,
        });
        setToast(`Login portal created for ${portalStaff.name}! 🚀`);
      }
      setPortalDialog(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save portal login.");
    }
  };

  const handleCreateDirectUser = async (e) => {
    e.preventDefault();
    if (!directUserForm.name || !directUserForm.email || !directUserForm.password) {
      setError("Name, Email and Password are required.");
      return;
    }
    setError("");
    try {
      await createUser(directUserForm);
      setToast(`New user account created for ${directUserForm.name}! 🚀`);
      setDirectUserDialog(false);
      setDirectUserForm({ name: "", email: "", password: "", role: "team", position: "Team Member" });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user account.");
    }
  };

  const openAdd  = () => { setEdit(null); setForm(EMPTY); setDialog(true); };
  const openEdit = (s) => {
    setEdit(s);
    setForm({
      name: s.name,
      email: s.email || "",
      mobile: s.mobile || "",
      position: s.position,
      department: s.department || "",
      joiningDate: s.joiningDate ? s.joiningDate.slice(0, 10) : "",
      salary: s.salary,
    });
    setDialog(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.position || !form.salary) {
      setError("Name, Position, and Salary are required.");
      return;
    }
    setError("");
    try {
      if (editTarget) await updateStaff(editTarget._id, form);
      else            await createStaff(form);
      setDialog(false);
      setToast(editTarget ? "Staff updated!" : "Staff added!");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed.");
    }
  };

  const handleDeactivate = async () => {
    await deactivateStaff(deactivateTarget._id);
    setDeactivateTarget(null);
    setToast("Staff deactivated.");
    load();
  };

  const copyLeaveLink = (leaveToken) => {
    const link = `${FRONTEND_URL}/leave-form/${leaveToken}`;
    navigator.clipboard.writeText(link);
    setToast("Leave form link copied! Send to staff via WhatsApp. 📋");
  };

  const f = (k) => ({
    value: form[k],
    onChange: (e) => setForm({ ...form, [k]: e.target.value }),
    fullWidth: true,
    size: "small",
  });

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={900} color="#0F172A">
            👥 Staff Directory & User Access Desk
          </Typography>
          <Typography variant="body2" color="#64748B">
            Manage agency team members, assign access roles (Admin, Editor, Shooter, Manager), and reset login passwords.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            startIcon={<PersonAddIcon />}
            onClick={() => { setError(""); setDirectUserDialog(true); }}
            sx={{
              borderColor: "#CBD5E1",
              color: "#334155",
              fontWeight: 800,
              borderRadius: "14px",
              textTransform: "none",
              px: 2.5,
              "&:hover": { borderColor: "#94A3B8", bgcolor: "#F8FAFC" },
            }}
          >
            + Direct User Login
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openAdd}
            sx={{
              bgcolor: "#FF5200",
              fontWeight: 800,
              borderRadius: "14px",
              textTransform: "none",
              px: 3,
              boxShadow: "0 4px 14px rgba(255, 82, 0, 0.3)",
              "&:hover": { bgcolor: "#E04800" },
            }}
          >
            + Add Staff Member
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <Card sx={{ borderRadius: "24px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <TableContainer>
          <Table size="medium">
            <TableHead sx={{ bgcolor: "#F8FAFC" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: 12 }}>MEMBER</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: 12 }}>NAME</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: 12 }}>POSITION</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: 12 }}>LOGIN ROLE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: 12 }}>DEPARTMENT</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: 12 }}>MOBILE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: 12 }}>EMAIL</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: 12 }}>SALARY</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: 12 }}>STATUS</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: 12, textAlign: "center" }}>PORTAL & ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staff.map((s) => {
                const userAcc = getUserAccount(s.email);
                const isLoginActive = Boolean(userAcc);

                return (
                  <TableRow key={s._id} hover sx={{ opacity: s.status === "inactive" ? 0.5 : 1 }}>
                    <TableCell sx={{ width: 50 }}><AvatarCell name={s.name} /></TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>{s.name}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#334155" }}>{s.position}</TableCell>
                    <TableCell>
                      {isLoginActive ? (
                        <Tooltip title="Click to manage role or reset password">
                          <Chip
                            label={userAcc.role?.toUpperCase()}
                            size="small"
                            onClick={() => openPortalDialog(s)}
                            sx={{
                              fontWeight: 800,
                              fontSize: 10,
                              cursor: "pointer",
                              bgcolor: userAcc.role === "admin" ? "#FEF2F2" : userAcc.role === "manager" ? "#EFF6FF" : "#F0FDF4",
                              color: userAcc.role === "admin" ? "#DC2626" : userAcc.role === "manager" ? "#2563EB" : "#16A34A",
                              border: `1px solid ${userAcc.role === "admin" ? "#FECACA" : userAcc.role === "manager" ? "#BFDBFE" : "#BBF7D0"}`,
                              "&:hover": { opacity: 0.8 },
                            }}
                          />
                        </Tooltip>
                      ) : (
                        <Tooltip title={s.email ? "Click to generate login password" : "Add email first via Edit (✏️)"}>
                          <span>
                            <Button
                              size="small"
                              onClick={() => openPortalDialog(s)}
                              disabled={!s.email}
                              sx={{
                                textTransform: "none",
                                fontSize: 11,
                                fontWeight: 800,
                                color: s.email ? "#FF5200" : "#94A3B8",
                                bgcolor: s.email ? "#FFF5ED" : "#F1F5F9",
                                border: `1px dashed ${s.email ? "#FFD5B8" : "#CBD5E1"}`,
                                borderRadius: "8px",
                                px: 1.2,
                                py: 0.2,
                                "&:hover": { bgcolor: "#FFEFE6" },
                              }}
                            >
                              {s.email ? "+ Create Login" : "Add Email ✏️"}
                            </Button>
                          </span>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, color: "text.secondary" }}>{s.department || "—"}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{s.mobile || "—"}</TableCell>
                    <TableCell sx={{ fontSize: 12, color: "text.secondary" }}>{s.email || "—"}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#0e9f6e" }}>
                      ₹{Number(s.salary).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={s.status === "active" ? "Active" : "Inactive"}
                        color={s.status === "active" ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      {/* Manage Login / Reset Password or Create Portal Login */}
                      {s.status === "active" && (
                        <Tooltip title={isLoginActive ? "🔑 Reset Password or Change Role" : "✨ Create Portal Login"}>
                          <IconButton
                            size="small"
                            onClick={() => openPortalDialog(s)}
                            disabled={!s.email}
                            sx={{
                              bgcolor: isLoginActive ? "#F0FDF4" : "#FFF7ED",
                              color: isLoginActive ? "#16A34A" : "#FF5200",
                              border: `1px solid ${isLoginActive ? "#BBF7D0" : "#FFEDD5"}`,
                              mr: 0.5,
                              "&:hover": { bgcolor: isLoginActive ? "#DCFCE7" : "#FFEDD5" },
                            }}
                          >
                            <VpnKeyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Calendar view */}
                      <Tooltip title="Monthly Timesheet Calendar">
                        <IconButton size="small" color="primary" onClick={() => navigate(`/admin/staff/${s._id}/calendar`)}>
                          <CalendarIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {/* Copy leave form link */}
                      {s.status === "active" && s.leaveToken && (
                        <Tooltip title="Copy Leave Form Link">
                          <IconButton size="small" color="secondary" onClick={() => copyLeaveLink(s.leaveToken)}>
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Edit Staff Record */}
                      <Tooltip title="Edit Details">
                        <IconButton size="small" onClick={() => openEdit(s)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {/* Deactivate */}
                      {s.status === "active" && (
                        <Tooltip title="Deactivate">
                          <IconButton size="small" color="error" onClick={() => setDeactivateTarget(s)}>
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {!loading && staff.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    No staff members found. Click + Add Staff.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ── DIALOG 1: ADD/EDIT STAFF HR RECORD ── */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "24px" } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editTarget ? "Edit Staff Details" : "Add New Staff Member"}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}><TextField {...f("name")} label="Full Name" required /></Grid>
            <Grid item xs={12} sm={6}><TextField {...f("position")} label="Position / Title" required placeholder="e.g. Senior Video Editor" /></Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select value={form.department} label="Department" onChange={(e) => setForm({ ...form, department: e.target.value })}>
                  {DEPARTMENTS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}><TextField {...f("mobile")} label="Mobile Number" /></Grid>
            <Grid item xs={12} sm={6}><TextField {...f("email")} label="Email (Login & Notifications)" type="email" /></Grid>
            <Grid item xs={12} sm={6}><TextField {...f("joiningDate")} label="Joining Date" type="date" InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6}>
              <TextField {...f("salary")} label="Monthly Salary (₹)" type="number" required />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialog(false)} sx={{ fontWeight: 700, color: "#64748B" }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: "#FF5200", fontWeight: 800, "&:hover": { bgcolor: "#E04800" }, borderRadius: "12px" }}>
            {editTarget ? "Save Changes" : "Add Staff"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── DIALOG 2: CREATE OR RESET PORTAL LOGIN (PASSWORD & ROLE) ── */}
      <Dialog open={portalDialog} onClose={() => setPortalDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "24px" } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {isEditingUser ? "🔑 Reset Password & Role" : "✨ Create Portal Login"}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>{error}</Alert>}
          <Typography variant="body2" color="text.secondary" mb={2} sx={{ mt: 1 }}>
            {isEditingUser
              ? `Manage login credentials for ${portalStaff?.name} (${portalStaff?.email}).`
              : `Create new login credentials for ${portalStaff?.name} (${portalStaff?.email}).`
            }
          </Typography>

          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label={isEditingUser ? "New Password (Leave blank to keep unchanged)" : "Set Login Password"}
                type="password"
                required={!isEditingUser}
                value={portalForm.password}
                onChange={(e) => setPortalForm({ ...portalForm, password: e.target.value })}
                placeholder={isEditingUser ? "•••••••• (Only if resetting)" : "Enter password"}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Access Role & Permissions</InputLabel>
                <Select
                  value={portalForm.role}
                  label="Access Role & Permissions"
                  onChange={(e) => setPortalForm({ ...portalForm, role: e.target.value })}
                >
                  <MenuItem value="admin">👑 Admin / Founder (Full Master Access)</MenuItem>
                  <MenuItem value="manager">💼 Manager (Operations & Approvals)</MenuItem>
                  <MenuItem value="editor">🎬 Video Editor (Reel Production)</MenuItem>
                  <MenuItem value="shooter">🎥 Shooter / Videographer (Shoots Desk)</MenuItem>
                  <MenuItem value="writer">✍️ Content Writer (Script Vault)</MenuItem>
                  <MenuItem value="team">👥 Team Member (Standard Portal Access)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setPortalDialog(false)} sx={{ fontWeight: 700, color: "#64748B" }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateOrUpdatePortal}
            sx={{
              bgcolor: isEditingUser ? "#16A34A" : "#FF5200",
              fontWeight: 800,
              borderRadius: "12px",
              "&:hover": { bgcolor: isEditingUser ? "#15803D" : "#E04800" },
            }}
          >
            {isEditingUser ? "Update Password & Role ✓" : "Create Login Account"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── DIALOG 3: DIRECT USER CREATION (WITHOUT HR RECORD) ── */}
      <Dialog open={directUserDialog} onClose={() => setDirectUserDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "24px" } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>+ Create User Account Directly</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>{error}</Alert>}
          <Typography variant="body2" color="text.secondary" mb={2} sx={{ mt: 1 }}>
            Add any team member directly with a custom role and login password.
          </Typography>

          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Full Name"
                required
                value={directUserForm.name}
                onChange={(e) => setDirectUserForm({ ...directUserForm, name: e.target.value })}
                placeholder="e.g. Rahul Patel"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Email Address (Login Username)"
                type="email"
                required
                value={directUserForm.email}
                onChange={(e) => setDirectUserForm({ ...directUserForm, email: e.target.value })}
                placeholder="rahul@socialflipss.com"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Login Password"
                type="password"
                required
                value={directUserForm.password}
                onChange={(e) => setDirectUserForm({ ...directUserForm, password: e.target.value })}
                placeholder="••••••••"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Access Role</InputLabel>
                <Select
                  value={directUserForm.role}
                  label="Access Role"
                  onChange={(e) => setDirectUserForm({ ...directUserForm, role: e.target.value })}
                >
                  <MenuItem value="admin">👑 Admin / Founder (Full Master Access)</MenuItem>
                  <MenuItem value="manager">💼 Manager (Operations & Approvals)</MenuItem>
                  <MenuItem value="editor">🎬 Video Editor (Reel Production)</MenuItem>
                  <MenuItem value="shooter">🎥 Shooter / Videographer (Shoots Desk)</MenuItem>
                  <MenuItem value="writer">✍️ Content Writer (Script Vault)</MenuItem>
                  <MenuItem value="team">👥 Team Member (Standard Access)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Position / Designation"
                value={directUserForm.position}
                onChange={(e) => setDirectUserForm({ ...directUserForm, position: e.target.value })}
                placeholder="e.g. Lead Video Editor"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDirectUserDialog(false)} sx={{ fontWeight: 700, color: "#64748B" }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateDirectUser}
            sx={{ bgcolor: "#FF5200", fontWeight: 800, borderRadius: "12px", "&:hover": { bgcolor: "#E04800" } }}
          >
            Create User Account ✓
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deactivate confirm */}
      <Dialog open={Boolean(deactivateTarget)} onClose={() => setDeactivateTarget(null)} PaperProps={{ sx: { borderRadius: "20px" } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Deactivate Staff</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to deactivate <strong>{deactivateTarget?.name}</strong>?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeactivateTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeactivate} sx={{ borderRadius: "12px" }}>Deactivate</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(toast)} autoHideDuration={4000} onClose={() => setToast("")} message={toast} />
    </Box>
  );
}
