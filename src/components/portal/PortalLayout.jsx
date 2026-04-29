import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItemButton,
  ListItemIcon, ListItemText, IconButton, Avatar, Menu, MenuItem,
  Divider, Badge, Chip, useTheme,
} from "@mui/material";
import DashboardIcon  from "@mui/icons-material/Dashboard";
import VideoIcon      from "@mui/icons-material/VideoLibrary";
import ReceiptIcon    from "@mui/icons-material/Receipt";
import CalendarIcon   from "@mui/icons-material/CalendarMonth";
import NotifIcon      from "@mui/icons-material/Notifications";
import MenuIcon       from "@mui/icons-material/Menu";
import LogoutIcon     from "@mui/icons-material/Logout";
import PersonIcon     from "@mui/icons-material/Person";
import { getPortalNotifications } from "../../api/portalApi";

const DRAWER_WIDTH = 240;

const NAV = [
  { label:"Dashboard",      icon:<DashboardIcon />, path:"/portal" },
  { label:"My Content",     icon:<VideoIcon />,     path:"/portal/content" },
  { label:"Invoices",       icon:<ReceiptIcon />,   path:"/portal/invoices" },
  { label:"Shoot Schedule", icon:<CalendarIcon />,  path:"/portal/schedule" },
  { label:"Notifications",  icon:<NotifIcon />,     path:"/portal/notifications" },
];

export default function PortalLayout() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const theme       = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl]     = useState(null);
  const [unread, setUnread]         = useState(0);

  const client = (() => {
    try { return JSON.parse(localStorage.getItem("sf_portal_client") || "{}"); } catch { return {}; }
  })();

  const handleLogout = () => {
    localStorage.removeItem("sf_portal_token");
    localStorage.removeItem("sf_portal_client");
    navigate("/portal/login");
  };

  useEffect(() => {
    getPortalNotifications()
      .then(r => setUnread(r.data.filter(n => !n.read).length))
      .catch(() => {});
    const interval = setInterval(() => {
      getPortalNotifications()
        .then(r => setUnread(r.data.filter(n => !n.read).length))
        .catch(() => {});
    }, 60000); // refresh every 1 min
    return () => clearInterval(interval);
  }, [location.pathname]);

  const isActive = (path) =>
    path === "/portal"
      ? location.pathname === "/portal"
      : location.pathname.startsWith(path);

  const drawer = (
    <Box sx={{ height:"100%", display:"flex", flexDirection:"column" }}>
      {/* Brand */}
      <Box sx={{ p:2.5, display:"flex", alignItems:"center", gap:1.5 }}>
        <Box sx={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#1a56db,#0891b2)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:14 }}>SF</Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} lineHeight={1}>SocialFlipss</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize:10 }}>Client Portal</Typography>
        </Box>
      </Box>

      {/* Client info */}
      <Box sx={{ mx:1.5, mb:1, p:1.5, background:"#f0f4ff", borderRadius:2 }}>
        <Typography variant="body2" fontWeight={600} color="primary">{client.businessName}</Typography>
        <Typography variant="caption" color="text.secondary">{client.ownerName}</Typography>
      </Box>

      <Divider />

      <List sx={{ flex:1, px:1, pt:1 }}>
        {NAV.map(item => {
          const active = isActive(item.path);
          return (
            <ListItemButton key={item.path} component={Link} to={item.path} selected={active}
              sx={{ borderRadius:2, mb:0.25, "&.Mui-selected":{ background:theme.palette.primary.light, color:theme.palette.primary.main, "& .MuiListItemIcon-root":{ color:theme.palette.primary.main } } }}>
              <ListItemIcon sx={{ minWidth:34, color:active?"primary.main":"text.secondary" }}>
                {item.label === "Notifications"
                  ? <Badge badgeContent={unread} color="error" max={9}>{item.icon}</Badge>
                  : item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight:active?600:400, fontSize:14 }} />
            </ListItemButton>
          );
        })}
      </List>

      <Divider />
      <Box sx={{ p:1.5 }}>
        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
          🔒 Powered by SocialFlipss
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display:"flex", minHeight:"100vh" }}>
      <Drawer variant="permanent" sx={{ width:DRAWER_WIDTH, flexShrink:0, display:{ xs:"none", md:"block" }, "& .MuiDrawer-paper":{ width:DRAWER_WIDTH, boxSizing:"border-box", borderRight:"1px solid #e5e7eb" } }}>
        {drawer}
      </Drawer>
      <Drawer variant="temporary" open={mobileOpen} onClose={()=>setMobileOpen(false)} sx={{ display:{ xs:"block", md:"none" }, "& .MuiDrawer-paper":{ width:DRAWER_WIDTH } }}>
        {drawer}
      </Drawer>

      <Box sx={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom:"1px solid #e5e7eb", zIndex:1 }}>
          <Toolbar sx={{ minHeight:"56px !important" }}>
            <IconButton edge="start" sx={{ mr:1, display:{ md:"none" } }} onClick={()=>setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Box sx={{ flex:1 }} />
            <IconButton component={Link} to="/portal/notifications" sx={{ mr:1 }}>
              <Badge badgeContent={unread} color="error" max={9}><NotifIcon /></Badge>
            </IconButton>
            <IconButton onClick={e=>setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width:32, height:32, bgcolor:"primary.main", fontSize:13, fontWeight:700 }}>
                {client.ownerName?.[0]?.toUpperCase() || "C"}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={()=>setAnchorEl(null)}>
              <MenuItem disabled>
                <ListItemIcon><PersonIcon fontSize="small"/></ListItemIcon>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{client.ownerName}</Typography>
                  <Typography variant="caption" color="text.secondary">{client.businessName}</Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon><LogoutIcon fontSize="small"/></ListItemIcon>Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Box sx={{ flex:1, p:{ xs:2, md:3 }, background:"#f4f6fb", overflowY:"auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
