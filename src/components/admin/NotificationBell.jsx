import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconButton, Badge, Popover, Box, Typography, Divider, Button,
  List, ListItem, ListItemText, Chip, CircularProgress,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { getAdminNotifications, markAdminNotifRead, markAllAdminRead } from "../../api/portalApi";

const TYPE_ICON = {
  content_approved:           "✅",
  content_rejected:           "❌",
  content_changes_requested:  "🔄",
  invoice_generated:          "🧾",
  invoice_paid:               "💰",
  payment_reminder:           "⚠️",
  shoot_reminder:             "📷",
  lead_converted:             "🎯",
  onboarding_complete:        "🎉",
  general:                    "🔔",
};

export default function NotificationBell() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl]     = useState(null);
  const [notifs, setNotifs]         = useState([]);
  const [unread, setUnread]         = useState(0);
  const [loading, setLoading]       = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getAdminNotifications({ limit: 20 });
      setNotifs(res.data.notifications || []);
      setUnread(res.data.unread || 0);
    } catch {}
    finally { if (!silent) setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    // Poll every 2 minutes
    const interval = setInterval(() => load(true), 120000);
    return () => clearInterval(interval);
  }, [load]);

  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
    load();
  };
  const handleClose = () => setAnchorEl(null);

  const handleClick = async (notif) => {
    if (!notif.read) {
      await markAdminNotifRead(notif._id);
      setNotifs(prev => prev.map(n => n._id === notif._id ? { ...n, read:true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    }
    if (notif.link) navigate(notif.link);
    handleClose();
  };

  const handleMarkAllRead = async () => {
    await markAllAdminRead();
    setNotifs(prev => prev.map(n => ({ ...n, read:true })));
    setUnread(0);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton onClick={handleOpen} sx={{ mr:0.5 }}>
        <Badge badgeContent={unread} color="error" max={9}>
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical:"bottom", horizontal:"right" }}
        transformOrigin={{ vertical:"top", horizontal:"right" }}
        PaperProps={{ sx:{ width:360, maxHeight:480, borderRadius:2, boxShadow:"0 8px 32px rgba(0,0,0,0.12)" } }}
      >
        {/* Header */}
        <Box sx={{ px:2, py:1.5, display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid #f3f4f6" }}>
          <Typography variant="h6" fontSize={15}>
            Notifications {unread > 0 && <Chip label={unread} color="error" size="small" sx={{ ml:0.5, height:18, fontSize:10 }}/>}
          </Typography>
          {unread > 0 && (
            <Button size="small" onClick={handleMarkAllRead} sx={{ fontSize:11 }}>
              Mark all read
            </Button>
          )}
        </Box>

        {/* List */}
        <Box sx={{ overflowY:"auto", maxHeight:380 }}>
          {loading ? (
            <Box sx={{ display:"flex", justifyContent:"center", py:3 }}><CircularProgress size={24}/></Box>
          ) : notifs.length === 0 ? (
            <Box sx={{ py:4, textAlign:"center" }}>
              <Typography variant="body2" color="text.secondary">Koi notification nathi</Typography>
            </Box>
          ) : notifs.map(n => (
            <Box
              key={n._id}
              onClick={() => handleClick(n)}
              sx={{
                px:2, py:1.5, cursor:"pointer", display:"flex", gap:1.5, alignItems:"flex-start",
                background: n.read ? "transparent" : "#f0f4ff",
                borderBottom:"0.5px solid #f3f4f6",
                "&:hover":{ background:"#f9fafb" },
                transition:"background 0.15s",
              }}
            >
              <Typography sx={{ fontSize:18, flexShrink:0, mt:0.25 }}>
                {TYPE_ICON[n.type] || "🔔"}
              </Typography>
              <Box sx={{ flex:1, minWidth:0 }}>
                <Typography variant="body2" fontWeight={n.read ? 400 : 600} sx={{ lineHeight:1.4 }}>
                  {n.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block"
                  sx={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {n.message}
                </Typography>
                <Typography variant="caption" color="text.disabled" display="block" mt={0.25}>
                  {new Date(n.createdAt).toLocaleString("en-IN", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" })}
                </Typography>
              </Box>
              {!n.read && (
                <Box sx={{ width:8, height:8, borderRadius:"50%", bgcolor:"#1a56db", flexShrink:0, mt:0.5 }}/>
              )}
            </Box>
          ))}
        </Box>
      </Popover>
    </>
  );
}
