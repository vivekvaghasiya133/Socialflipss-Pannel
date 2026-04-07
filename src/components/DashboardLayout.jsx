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
import { useAuth } from "../context/AuthContext";

const DRAWER_WIDTH = 240;

const NAV = [
  { label: "Dashboard",  icon: <DashboardIcon />, path: "/admin" },
  { label: "All Clients",icon: <PeopleIcon />,    path: "/admin/clients" },
];

export default function DashboardLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl]     = useState(null);

  const handleLogout = () => { logout(); navigate("/login"); };

  const drawer = (
    <Box sx={{ height:"100%", display:"flex", flexDirection:"column" }}>
      {/* Brand */}
      <Box sx={{ p: 2.5, display:"flex", alignItems:"center", gap:1.5 }}>
        <Box sx={{
          width:36, height:36, borderRadius:"50%",
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

      {/* Nav links */}
      <List sx={{ flex:1, px:1, pt:1 }}>
        {NAV.map((item) => {
          const active = location.pathname === item.path ||
            (item.path !== "/admin" && location.pathname.startsWith(item.path));
          return (
            <ListItemButton
              key={item.path}
              component={Link}
              to={item.path}
              selected={active}
              sx={{
                borderRadius:2, mb:0.5,
                "&.Mui-selected": {
                  background: theme.palette.primary.light,
                  color: theme.palette.primary.main,
                  "& .MuiListItemIcon-root": { color: theme.palette.primary.main },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth:36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: active ? 600 : 400, fontSize:14 }} />
            </ListItemButton>
          );
        })}
      </List>

      {/* Onboarding form link */}
      <Divider />
      <Box sx={{ p:1.5 }}>
        <ListItemButton
          component="a"
          href="/onboard"
          target="_blank"
          sx={{ borderRadius:2, color:"text.secondary" }}
        >
          <ListItemIcon sx={{ minWidth:36 }}><OpenInNewIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Client Form Link" primaryTypographyProps={{ fontSize:13 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display:"flex", minHeight:"100vh" }}>
      {/* Sidebar Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH, flexShrink:0,
          display: { xs:"none", md:"block" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing:"border-box", borderRight:"1px solid #e5e7eb" },
        }}
      >
        {drawer}
      </Drawer>

      {/* Sidebar Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs:"block", md:"none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main content */}
      <Box sx={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        {/* Top AppBar */}
        <AppBar position="sticky" color="inherit" elevation={0}
          sx={{ borderBottom:"1px solid #e5e7eb", zIndex:1 }}>
          <Toolbar>
            <IconButton edge="start" sx={{ mr:1, display:{ md:"none" } }}
              onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Box sx={{ flex:1 }} />
            <Tooltip title="Account">
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <Avatar sx={{ width:34, height:34, bgcolor: "primary.main", fontSize:14 }}>
                  {admin?.name?.[0] || "A"}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem disabled>
                <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                {admin?.email}
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box sx={{ flex:1, p: { xs:2, md:3 }, background:"#f4f6fb" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
