// FINAL DashboardLayout.jsx — All 4 parts combined
import { useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItemButton,
  ListItemIcon, ListItemText, IconButton, Avatar, Menu, MenuItem,
  Divider, Tooltip, useTheme, Chip,
} from "@mui/material";
import DashboardIcon  from "@mui/icons-material/Dashboard";
import PeopleIcon     from "@mui/icons-material/People";
import MenuIcon       from "@mui/icons-material/Menu";
import LogoutIcon     from "@mui/icons-material/Logout";
import PersonIcon     from "@mui/icons-material/Person";
import OpenInNewIcon  from "@mui/icons-material/OpenInNew";
import GroupsIcon     from "@mui/icons-material/Groups";
import EventNoteIcon  from "@mui/icons-material/EventNote";
import WalletIcon     from "@mui/icons-material/AccountBalanceWallet";
import BeachIcon      from "@mui/icons-material/BeachAccess";
import LeadsIcon      from "@mui/icons-material/TrendingUp";
import UsersIcon      from "@mui/icons-material/ManageAccounts";
import ReceiptIcon    from "@mui/icons-material/Receipt";
import FolderIcon     from "@mui/icons-material/Folder";
import CalendarIcon   from "@mui/icons-material/CalendarMonth";
import NotifIcon      from "@mui/icons-material/NotificationsActive";
import WorkIcon       from "@mui/icons-material/WorkHistory";
import { useAuth } from "../context/AuthContext";

const DRAWER_WIDTH = 256;

export default function DashboardLayout() {
  const { user, logout, isAdmin, canManage } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const theme     = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl]     = useState(null);

  const handleLogout = () => { logout(); navigate("/login"); };

  const isActive = (path) =>
    path === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(path);

  const NAV_SECTIONS = [
    {
      label: "Overview",
      items: [
        { label:"Dashboard",        icon:<DashboardIcon />, path:"/admin",                  roles:["admin","manager","team"] },
      ],
    },
    {
      label: "CRM",
      items: [
        { label:"Leads",            icon:<LeadsIcon />,     path:"/admin/leads",            roles:["admin","manager"] },
        { label:"Clients",          icon:<PeopleIcon />,    path:"/admin/clients",          roles:["admin","manager","team"] },
        { label:"Invoices",         icon:<ReceiptIcon />,   path:"/admin/invoices",         roles:["admin","manager"] },
      ],
    },
    {
      label: "Production",
      items: [
        { label:"Projects",         icon:<FolderIcon />,    path:"/admin/projects",         roles:["admin","manager","team"] },
        { label:"Content Calendar", icon:<CalendarIcon />,  path:"/admin/content-calendar", roles:["admin","manager","team"] },
      ],
    },
    {
      label: "HR & Team",
      items: [
        { label:"Staff",            icon:<GroupsIcon />,    path:"/admin/staff",            roles:["admin","manager"] },
        { label:"Attendance",       icon:<EventNoteIcon />, path:"/admin/attendance",       roles:["admin","manager"] },
        { label:"Salary",           icon:<WalletIcon />,    path:"/admin/salary",           roles:["admin"] },
        { label:"Leaves",           icon:<BeachIcon />,     path:"/admin/leaves",           roles:["admin","manager"] },
        { label:"Work Logs",        icon:<WorkIcon />,      path:"/admin/worklogs",         roles:["admin","manager","team"] },
      ],
    },
    {
      label: "Tools",
      items: [
        { label:"Reminders",        icon:<NotifIcon />,     path:"/admin/reminders",        roles:["admin","manager"] },
        { label:"Users",            icon:<UsersIcon />,     path:"/admin/users",            roles:["admin"] },
      ],
    },
  ].map(section => ({
    ...section,
    items: section.items.filter(item => item.roles.includes(user?.role || "team")),
  })).filter(section => section.items.length > 0);

  const ROLE_COLOR = { admin:"error", manager:"warning", team:"info" };

  const drawer = (
    <Box sx={{ height:"100%", display:"flex", flexDirection:"column" }}>
      {/* Brand */}
      <Box sx={{ p:2.5, display:"flex", alignItems:"center", gap:1.5 }}>
        <Box sx={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#1a56db,#0891b2)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:15 }}>
          SF
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} lineHeight={1.1}>SocialFlipss</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize:10 }}>Management System v1.0</Typography>
        </Box>
      </Box>
      <Divider />

      {/* Nav */}
      <List sx={{ flex:1, px:1, pt:1, overflowY:"auto",
        "&::-webkit-scrollbar":{ width:4 },
        "&::-webkit-scrollbar-thumb":{ background:"#e5e7eb", borderRadius:2 },
      }}>
        {NAV_SECTIONS.map(section => (
          <Box key={section.label}>
            <Typography variant="caption" sx={{
              px:1.5, py:0.75, display:"block",
              color:"text.disabled", fontWeight:700,
              textTransform:"uppercase", letterSpacing:"0.07em", fontSize:9.5,
            }}>
              {section.label}
            </Typography>
            {section.items.map(item => {
              const active = isActive(item.path);
              return (
                <ListItemButton
                  key={item.path}
                  component={Link}
                  to={item.path}
                  selected={active}
                  sx={{
                    borderRadius:2, mb:0.25, py:0.75,
                    "&.Mui-selected": {
                      background: theme.palette.primary.light,
                      color: theme.palette.primary.main,
                      "& .MuiListItemIcon-root": { color: theme.palette.primary.main },
                    },
                    "&:hover": { background: active ? theme.palette.primary.light : "#f3f4f6" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth:34, color: active ? "primary.main" : "text.secondary" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontWeight: active ? 600 : 400, fontSize:13.5 }}
                  />
                </ListItemButton>
              );
            })}
            <Box sx={{ mb:0.75 }} />
          </Box>
        ))}
      </List>

      {/* Bottom */}
      <Divider />
      <Box sx={{ p:1 }}>
        <ListItemButton
          component="a" href="/onboard" target="_blank"
          sx={{ borderRadius:2, color:"text.secondary", py:0.75 }}
        >
          <ListItemIcon sx={{ minWidth:34 }}><OpenInNewIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Client Form Link" primaryTypographyProps={{ fontSize:13 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display:"flex", minHeight:"100vh" }}>
      {/* Desktop */}
      <Drawer variant="permanent" sx={{
        width:DRAWER_WIDTH, flexShrink:0,
        display:{ xs:"none", md:"block" },
        "& .MuiDrawer-paper":{ width:DRAWER_WIDTH, boxSizing:"border-box", borderRight:"1px solid #e5e7eb" },
      }}>
        {drawer}
      </Drawer>

      {/* Mobile */}
      <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{
        display:{ xs:"block", md:"none" },
        "& .MuiDrawer-paper":{ width:DRAWER_WIDTH },
      }}>
        {drawer}
      </Drawer>

      {/* Main */}
      <Box sx={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom:"1px solid #e5e7eb", zIndex:1 }}>
          <Toolbar sx={{ minHeight:"56px !important" }}>
            <IconButton edge="start" sx={{ mr:1, display:{ md:"none" } }} onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Box sx={{ flex:1 }} />
            <Chip
              label={user?.role?.toUpperCase()}
              color={ROLE_COLOR[user?.role] || "default"}
              size="small"
              sx={{ mr:2, fontWeight:700, fontSize:10 }}
            />
            <Tooltip title={`${user?.name} (${user?.email})`}>
              <IconButton onClick={e => setAnchorEl(e.currentTarget)} size="small">
                <Avatar sx={{ width:32, height:32, bgcolor:"primary.main", fontSize:13, fontWeight:700 }}>
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal:"right", vertical:"top" }}
              anchorOrigin={{ horizontal:"right", vertical:"bottom" }}>
              <MenuItem disabled>
                <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{user?.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex:1, p:{ xs:2, md:3 }, background:"#f4f6fb", minHeight:0, overflowY:"auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
