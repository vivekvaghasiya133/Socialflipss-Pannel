import { useEffect, useState } from "react";
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, FormControl,
  InputLabel, Alert, Snackbar, Tooltip, Avatar, Grid,
} from "@mui/material";
import AddIcon    from "@mui/icons-material/Add";
import EditIcon   from "@mui/icons-material/Edit";
import BlockIcon  from "@mui/icons-material/Block";
import { getUsers, createUser, updateUser, deactivateUser } from "../api/leadsApi";

const ROLES = ["manager","team"];
const ROLE_COLORS = { admin:"error", manager:"warning", team:"info" };

const EMPTY = { name:"", email:"", password:"", role:"team", position:"", mobile:"" };

function getInitials(name = "") {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2);
}

export default function UsersPage() {
  const [users, setUsers]     = useState([]);
  const [dialog, setDialog]   = useState(false);
  const [editTarget, setEdit] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [toast, setToast]     = useState("");
  const [error, setError]     = useState("");

  const load = () => getUsers().then(r => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setEdit(null); setForm(EMPTY); setDialog(true); };
  const openEdit = (u) => {
    setEdit(u);
    setForm({ name:u.name, email:u.email, password:"", role:u.role, position:u.position||"", mobile:u.mobile||"" });
    setDialog(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email || (!editTarget && !form.password)) {
      setError("Name, email ane password required chhe."); return;
    }
    setError("");
    try {
      const payload = { ...form };
      if (editTarget && !payload.password) delete payload.password;
      if (editTarget) await updateUser(editTarget._id, payload);
      else            await createUser(payload);
      setDialog(false);
      setToast(editTarget ? "User updated!" : "User created!");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed.");
    }
  };

  const handleDeactivate = async (id) => {
    await deactivateUser(id);
    setToast("User deactivated.");
    load();
  };

  const f = (key) => ({
    fullWidth: true, size:"small",
    value: form[key],
    onChange: (e) => setForm({...form, [key]: e.target.value}),
  });

  const colors = ["#1a56db","#0e9f6e","#8b5cf6","#e02424","#ff8800"];

  return (
    <Box>
      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:3 }}>
        <Box>
          <Typography variant="h5">User Management</Typography>
          <Typography variant="body2" color="text.secondary">Admin can add managers and team members</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add User</Button>
      </Box>

      {/* Role summary */}
      <Grid container spacing={2} mb={3}>
        {["admin","manager","team"].map((role) => {
          const count = users.filter(u => u.role === role && u.status === "active").length;
          return (
            <Grid item xs={12} sm={4} key={role}>
              <Card><Box sx={{ p:2 }}>
                <Typography variant="body2" color="text.secondary" textTransform="capitalize">{role}s</Typography>
                <Typography variant="h4" fontWeight={700}>{count}</Typography>
              </Box></Card>
            </Grid>
          );
        })}
      </Grid>

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background:"#f9fafb" }}>
                {["","Name","Email","Role","Position","Mobile","Status","Actions"].map(h => (
                  <TableCell key={h} sx={{ fontWeight:600, fontSize:12, color:"text.secondary", py:1.5 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u._id} hover sx={{ opacity: u.status === "inactive" ? 0.5 : 1 }}>
                  <TableCell sx={{ width:50 }}>
                    <Avatar sx={{ width:32, height:32, bgcolor: colors[u.name.charCodeAt(0) % colors.length], fontSize:12, fontWeight:700 }}>
                      {getInitials(u.name)}
                    </Avatar>
                  </TableCell>
                  <TableCell sx={{ fontWeight:500 }}>{u.name}</TableCell>
                  <TableCell sx={{ fontSize:12, color:"text.secondary" }}>{u.email}</TableCell>
                  <TableCell>
                    <Chip label={u.role.toUpperCase()} color={ROLE_COLORS[u.role]} size="small" />
                  </TableCell>
                  <TableCell sx={{ fontSize:13 }}>{u.position || "—"}</TableCell>
                  <TableCell sx={{ fontSize:13 }}>{u.mobile || "—"}</TableCell>
                  <TableCell>
                    <Chip label={u.status === "active" ? "Active" : "Inactive"} color={u.status === "active" ? "success" : "default"} size="small" />
                  </TableCell>
                  <TableCell>
                    {u.role !== "admin" && (
                      <>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(u)}><EditIcon fontSize="small" /></IconButton>
                        </Tooltip>
                        {u.status === "active" && (
                          <Tooltip title="Deactivate">
                            <IconButton size="small" color="error" onClick={() => handleDeactivate(u._id)}><BlockIcon fontSize="small" /></IconButton>
                          </Tooltip>
                        )}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editTarget ? "Edit User" : "Add New User"}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt:0.5 }}>
            <Grid item xs={12} sm={6}><TextField {...f("name")} label="Full Name *" /></Grid>
            <Grid item xs={12} sm={6}><TextField {...f("email")} label="Email *" type="email" /></Grid>
            <Grid item xs={12} sm={6}>
              <TextField {...f("password")} label={editTarget ? "New Password (blank = no change)" : "Password *"} type="password" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Role</InputLabel>
                <Select value={form.role} label="Role" onChange={(e) => setForm({...form, role: e.target.value})}>
                  {ROLES.map(r => <MenuItem key={r} value={r} sx={{ textTransform:"capitalize" }}>{r}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}><TextField {...f("position")} label="Position" placeholder="Video Editor, SEO Manager..." /></Grid>
            <Grid item xs={12} sm={6}><TextField {...f("mobile")} label="Mobile" /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2 }}>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{editTarget ? "Save Changes" : "Create User"}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(toast)} autoHideDuration={3000} onClose={() => setToast("")} message={toast} />
    </Box>
  );
}
