"use client";

import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItemButton,
  ListItemIcon, ListItemText, IconButton, Avatar, Chip, Tooltip,
  Menu, MenuItem, Divider
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MovieFilterIcon from "@mui/icons-material/MovieFilter";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import BadgeIcon from "@mui/icons-material/Badge";
import TuneIcon from "@mui/icons-material/Tune";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import { changePassword } from "../../api/leadsApi";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import HandshakeIcon from "@mui/icons-material/Handshake";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import { useAuth } from "../../context/AuthContext";
import { getAgencyConfig } from "../../api/agencyOsApi";
import { useEffect } from "react";
import NotificationBell from "./../admin/NotificationBell";
import MobileBottomNav from "../navigation/MobileBottomNav";
import InstallAppPrompt from "../navigation/InstallAppPrompt";

const DRAWER_WIDTH = 260;

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [agencyBranding, setAgencyBranding] = useState(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const handleChangePasswordSubmit = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError("Please enter both current and new passwords.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match!");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    setPasswordLoading(true);
    setPasswordError("");
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordDialogOpen(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setToastMsg("Password changed successfully! ✨");
      setTimeout(() => setToastMsg(""), 3500);
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  useEffect(() => {
    getAgencyConfig()
      .then((res) => {
        if (res.data?.success && res.data.config) {
          const cfg = res.data.config;
          setAgencyBranding(cfg);
          if (cfg.faviconUrl && typeof document !== "undefined") {
            let link = document.querySelector("link[rel*='icon']");
            if (!link) {
              link = document.createElement("link");
              link.rel = "icon";
              document.head.appendChild(link);
            }
            link.href = cfg.faviconUrl;
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
  };

  const isActive = (path) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const NAV_SECTIONS = [
    {
      label: "Core Operations",
      items: [
        { label: "Executive Studio", icon: <DashboardIcon fontSize="small" />, path: "/admin", roles: ["admin", "manager"] },
        { label: "Production Hub", icon: <MovieFilterIcon fontSize="small" />, path: "/admin/production-hub", roles: ["admin", "manager", "team"], badge: "Active" },
        { label: "Punch & Time Desk", icon: <AccessTimeFilledIcon fontSize="small" />, path: "/admin/time-tracker", roles: ["admin", "manager", "team"] },
      ],
    },
    {
      label: "Creative Pipeline",
      items: [
        { label: "Content Pipeline", icon: <ViewKanbanIcon fontSize="small" />, path: "/admin/pipeline", roles: ["admin", "manager", "team"] },
        { label: "Shoot Calendar", icon: <CalendarMonthIcon fontSize="small" />, path: "/admin/calendar", roles: ["admin", "manager", "team"] },
      ],
    },
    {
      label: "Clients & Finance",
      items: [
        { label: "Active Clients", icon: <PeopleAltIcon fontSize="small" />, path: "/admin/clients", roles: ["admin", "manager"] },
        { label: "Invoices & Billing", icon: <ReceiptLongIcon fontSize="small" />, path: "/admin/invoices", roles: ["admin"] },
        { label: "Leads & Prospects", icon: <HandshakeIcon fontSize="small" />, path: "/admin/leads", roles: ["admin", "manager"] },
        { label: "Ledger / Hisab", icon: <AccountBalanceWalletIcon fontSize="small" />, path: "/admin/hisab", roles: ["admin"] },
      ],
    },
    {
      label: "Staff & Management",
      items: [
        { label: "Staff Directory", icon: <BadgeIcon fontSize="small" />, path: "/admin/staff", roles: ["admin", "manager"] },
        { label: "Live Attendance", icon: <HowToRegIcon fontSize="small" />, path: "/admin/attendance", roles: ["admin", "manager"] },
        { label: "Agency OS Settings", icon: <TuneIcon fontSize="small" />, path: "/admin/agency-settings", roles: ["admin"] },
      ],
    },
  ].map(section => ({
    ...section,
    items: section.items.filter(item => item.roles.includes(user?.role || "team")),
  })).filter(section => section.items.length > 0);

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "#FFFFFF" }}>
      {/* Swiggy-tier Brand Header */}
      <Box sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 1.5, borderBottom: "1px solid #F1F5F9" }}>
        <Box sx={{
          width: 42, height: 42, borderRadius: "14px",
          background: "linear-gradient(135deg, #FF5200 0%, #FC8019 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#FFFFFF", fontWeight: 900, fontSize: 16,
          boxShadow: "0 6px 16px rgba(255, 82, 0, 0.3)",
          overflow: "hidden",
          position: "relative"
        }}>
          <span style={{ position: "absolute", zIndex: 1 }}>SF</span>
          <img
            src={agencyBranding?.logoUrl || "/logo.jpg"}
            alt="Logo"
            style={{ width: "100%", height: "100%", objectFit: "cover", position: "relative", zIndex: 2 }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={900} sx={{ color: "#1E293B", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            {agencyBranding?.agencyName || "SocialFlipss"}
          </Typography>
          <Typography variant="caption" sx={{ color: "#FF5200", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Agency OS • Pro
          </Typography>
        </Box>
      </Box>

      {/* Navigation List */}
      <List sx={{
        flex: 1, px: 1.5, py: 1.5, overflowY: "auto",
        "&::-webkit-scrollbar": { width: 4 },
        "&::-webkit-scrollbar-thumb": { background: "#CBD5E1", borderRadius: 2 },
      }}>
        {NAV_SECTIONS.map(section => (
          <Box key={section.label} sx={{ mb: 1.5 }}>
            <Typography variant="caption" sx={{
              px: 1.5, py: 0.5, display: "block",
              color: "#94A3B8", fontWeight: 800,
              textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 9.5
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
                    borderRadius: "12px", mb: 0.5, py: 0.9, px: 1.5,
                    color: active ? "#FF5200" : "#475569",
                    background: active ? "linear-gradient(90deg, #FFF5ED 0%, #FFEFE6 100%)" : "transparent",
                    borderLeft: active ? "3px solid #FF5200" : "3px solid transparent",
                    "&:hover": {
                      background: active ? "linear-gradient(90deg, #FFF5ED 0%, #FFEFE6 100%)" : "#F8FAFC",
                      color: active ? "#FF5200" : "#0F172A",
                    },
                    transition: "all 0.15s ease",
                  }}
                >
                  <ListItemIcon sx={{
                    minWidth: 32,
                    color: active ? "#FF5200" : "#64748B",
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: active ? 800 : 600,
                      fontSize: 13,
                    }}
                  />
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black border border-emerald-200">
                      {item.badge}
                    </span>
                  )}
                </ListItemButton>
              );
            })}
          </Box>
        ))}
      </List>

      {/* Client Portal Link */}
      <Box sx={{ p: 1.5, borderTop: "1px solid #F1F5F9" }}>
        <ListItemButton
          component="a"
          href="/portal"
          target="_blank"
          sx={{
            borderRadius: "12px",
            color: "#059669",
            bgcolor: "#ECFDF5",
            py: 1,
            "&:hover": { bgcolor: "#D1FAE5" }
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: "#059669" }}>
            <OpenInNewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Client Portal" primaryTypographyProps={{ fontSize: 13, fontWeight: 700 }} />
        </ListItemButton>
        {/* ── CHANGE MY PASSWORD DIALOG ── */}
        <Dialog
          open={passwordDialogOpen}
          onClose={() => setPasswordDialogOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: "24px", p: 1 } }}
        >
          <DialogTitle sx={{ fontWeight: 800 }}>🔑 Change My Password</DialogTitle>
          <DialogContent>
            {passwordError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>
                {passwordError}
              </Alert>
            )}

            <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                size="small"
                type="password"
                label="Current Password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              />
              <TextField
                fullWidth
                size="small"
                type="password"
                label="New Password"
                required
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
              <TextField
                fullWidth
                size="small"
                type="password"
                label="Confirm New Password"
                required
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setPasswordDialogOpen(false)} sx={{ fontWeight: 700, color: "#64748B" }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={passwordLoading}
              onClick={handleChangePasswordSubmit}
              sx={{ bgcolor: "#FF5200", fontWeight: 800, borderRadius: "12px", "&:hover": { bgcolor: "#E04800" } }}
            >
              {passwordLoading ? "Updating..." : "Update Password ✓"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Floating Toast Notification */}
        {toastMsg && (
          <div className="fixed top-5 left-4 right-4 max-w-sm mx-auto z-50 py-3 px-4 rounded-2xl bg-slate-900/95 text-white shadow-2xl backdrop-blur-xl flex items-center gap-3 border border-slate-700/80 animate-slideDown pointer-events-none">
            <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-xs shrink-0">✓</span>
            <span className="text-xs font-black tracking-tight text-white">{toastMsg}</span>
          </div>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F4F6FB" }}>
      {/* Desktop Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            borderRight: "1px solid #E2E8F0",
            bgcolor: "#FFFFFF",
            boxShadow: "4px 0 20px rgba(0, 0, 0, 0.02)"
          }
        }}
      >
        {drawer}
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, bgcolor: "#FFFFFF", pt: { xs: "max(12px, env(safe-area-inset-top, 12px))", md: 0 } }
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top Header */}
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{
            borderBottom: "1px solid #E2E8F0",
            bgcolor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(12px)",
            color: "#1E293B",
            zIndex: 10,
            pt: { xs: "max(16px, env(safe-area-inset-top, 16px))", md: 0 },
          }}
        >
          <Toolbar sx={{ minHeight: "64px !important", px: { xs: 2, md: 3 } }}>
            <IconButton
              edge="start"
              sx={{ mr: 1, display: { md: "none" }, color: "#64748B" }}
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </IconButton>

            {/* Studio Status Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Surat Studio HQ • Live</span>
            </div>

            <Box sx={{ flex: 1 }} />

            {/* In-App Prompts */}
            <InstallAppPrompt />
            <NotificationBell />

            {/* Role Chip */}
            <Chip
              label={user?.role?.toUpperCase() || "ADMIN"}
              size="small"
              sx={{
                mr: 1.5,
                fontWeight: 800,
                fontSize: 10,
                bgcolor: "#FFF5ED",
                color: "#FF5200",
                border: "1px solid #FFD5B8"
              }}
            />

            {/* User Avatar */}
            <Tooltip title={`${user?.name} (${user?.email})`}>
              <IconButton onClick={e => setAnchorEl(e.currentTarget)} size="small">
                <Avatar sx={{
                  width: 36, height: 36,
                  bgcolor: "#FF5200",
                  fontSize: 14, fontWeight: 800,
                  boxShadow: "0 2px 8px rgba(255, 82, 0, 0.3)"
                }}>
                  {user?.name?.[0]?.toUpperCase() || "V"}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={{
                sx: { borderRadius: "16px", mt: 1, boxShadow: "0 10px 30px rgba(0,0,0,0.08)", minWidth: 200 }
              }}
            >
              <MenuItem disabled>
                <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                <Box>
                  <Typography variant="body2" fontWeight={700} color="#1E293B">{user?.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { setAnchorEl(null); setPasswordError(""); setPasswordDialogOpen(true); }}>
                <ListItemIcon><VpnKeyIcon fontSize="small" sx={{ color: "#FF5200" }} /></ListItemIcon>
                <Typography variant="body2" fontWeight={700} color="#1E293B">Change My Password</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: "#EF4444", fontWeight: 700 }}>
                <ListItemIcon sx={{ color: "#EF4444" }}><LogoutIcon fontSize="small" /></ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Page Content Container */}
        <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, bgcolor: "#F4F6FB", minHeight: 0, overflowY: "auto", pb: { xs: 12, md: 6 } }}>
          <Outlet />
        </Box>

        {/* Mobile Bottom Bar */}
        <MobileBottomNav />
      </Box>
    </Box>
  );
}
