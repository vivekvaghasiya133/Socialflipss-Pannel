// ─────────────────────────────────────────────────────────────────────────────
// UPDATED DashboardLayout.jsx — replace your existing one
// Adds HR section in sidebar: Staff, Attendance, Salary, Leaves
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItemButton,
  ListItemIcon, ListItemText, IconButton, Avatar, Menu, MenuItem,
  Divider, Tooltip, useTheme,
} from "@mui/material";
import DashboardIcon   from "@mui/icons-material/Dashboard";
import PeopleIcon      from "@mui/icons-material/People";
import MenuIcon        from "@mui/icons-material/Menu";
import LogoutIcon      from "@mui/icons-material/Logout";
import PersonIcon      from "@mui/icons-material/Person";
import OpenInNewIcon   from "@mui/icons-material/OpenInNew";
import GroupsIcon      from "@mui/icons-material/Groups";
import EventNoteIcon   from "@mui/icons-material/EventNote";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import { useAuth } from "../context/AuthContext";

const DRAWER_WIDTH = 248;

const NAV_SECTIONS = [
  {
    label: "Clients",
    items: [
      { label:"Dashboard",    icon:<DashboardIcon />,  path:"/admin" },
      { label:"All Clients",  icon:<PeopleIcon />,     path:"/admin/clients" },
    ],
  },
  {
    label: "HR & Team",
    items: [
      { label:"Staff",        icon:<GroupsIcon />,     path:"/admin/staff" },
      { label:"Attendance",   icon:<EventNoteIcon />,  path:"/admin/attendance" },
      { label:"Salary",       icon:<AccountBalanceWalletIcon />, path:"/admin/salary" },
      { label:"Leaves",       icon:<BeachAccessIcon />,path:"/admin/leaves" },
    ],
  },
];

export default function DashboardLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme    = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl]     = useState(null);

  const handleLogout = () => { logout(); navigate("/login"); };

  const isActive = (path) =>
    path === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(path);

  const drawer = (
    <Box sx={{ height:"100%", display:"flex", flexDirection:"column" }}>
      {/* Brand */}
      <Box sx={{ p:2.5, display:"flex", alignItems:"center", gap:1.5 }}>
        <Box sx={{
          width:38, height:38, borderRadius:"50%",
          background: theme.palette.primary.main,
          display:"flex", alignItems:"center", justifyContent:"center",
          color:"#fff", fontWeight:700, fontSize:14,
        }}>SF</Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} lineHeight={1}>SocialFlipss</Typography>
          <Typography variant="caption" color="text.secondary">Admin Panel</Typography>
        </Box>
      </Box>
      <Divider />

      {/* Nav sections */}
      <List sx={{ flex:1, px:1, pt:1 }}>
        {NAV_SECTIONS.map((section) => (
          <Box key={section.label}>
            <Typography variant="caption" sx={{ px:1.5, py:0.75, display:"block", color:"text.disabled", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", fontSize:10 }}>
              {section.label}
            </Typography>
            {section.items.map((item) => {
              const active = isActive(item.path);
              return (
                <ListItemButton
                  key={item.path}
                  component={Link}
                  to={item.path}
                  selected={active}
                  sx={{
                    borderRadius:2, mb:0.25,
                    "&.Mui-selected": {
                      background: theme.palette.primary.light,
                      color: theme.palette.primary.main,
                      "& .MuiListItemIcon-root": { color: theme.palette.primary.main },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth:34, color: active ? "primary.main" : "text.secondary" }}>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontWeight: active ? 600 : 400, fontSize:14 }}
                  />
                </ListItemButton>
              );
            })}
            <Box sx={{ mb:1 }} />
          </Box>
        ))}
      </List>

      {/* Client form link */}
      <Divider />
      <Box sx={{ p:1 }}>
        <ListItemButton component="a" href="/onboard" target="_blank" sx={{ borderRadius:2, color:"text.secondary" }}>
          <ListItemIcon sx={{ minWidth:34 }}><OpenInNewIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Client Form Link" primaryTypographyProps={{ fontSize:13 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display:"flex", minHeight:"100vh" }}>
      <Drawer variant="permanent" sx={{ width:DRAWER_WIDTH, flexShrink:0, display:{ xs:"none", md:"block" }, "& .MuiDrawer-paper":{ width:DRAWER_WIDTH, boxSizing:"border-box", borderRight:"1px solid #e5e7eb" } }}>
        {drawer}
      </Drawer>
      <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ display:{ xs:"block", md:"none" }, "& .MuiDrawer-paper":{ width:DRAWER_WIDTH } }}>
        {drawer}
      </Drawer>

      <Box sx={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom:"1px solid #e5e7eb", zIndex:1 }}>
          <Toolbar>
            <IconButton edge="start" sx={{ mr:1, display:{ md:"none" } }} onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Box sx={{ flex:1 }} />
            <Tooltip title="Account">
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <Avatar sx={{ width:34, height:34, bgcolor:"primary.main", fontSize:14 }}>
                  {admin?.name?.[0] || "A"}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem disabled><ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>{admin?.email}</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}><ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>Logout</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex:1, p:{ xs:2, md:3 }, background:"#f4f6fb" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
