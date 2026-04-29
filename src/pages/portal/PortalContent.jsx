import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box, Typography, Card, Grid, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, FormControl,
  InputLabel, Alert, Snackbar, CircularProgress, Tabs, Tab, Avatar,
  IconButton, Tooltip, Divider,
} from "@mui/material";
import CheckIcon    from "@mui/icons-material/CheckCircle";
import RejectIcon   from "@mui/icons-material/Cancel";
import ChangeIcon   from "@mui/icons-material/Edit";
import LinkIcon     from "@mui/icons-material/OpenInNew";
import { getPortalContent, approvePortalContent } from "../../api/portalApi";

const STAGE_STYLE = {
  idea:     { bg:"#f3f4f6", color:"#374151",  label:"Idea" },
  approved: { bg:"#e0f2fe", color:"#0369a1",  label:"Approved" },
  shooting: { bg:"#ede9fe", color:"#6d28d9",  label:"Shooting" },
  editing:  { bg:"#fef3c7", color:"#92400e",  label:"Editing" },
  posted:   { bg:"#d1fae5", color:"#065f46",  label:"Posted ✓" },
};

const TYPE_EMOJI = { reel:"🎬", post:"📸", story:"📖", carousel:"🖼️", youtube:"▶️", other:"📄" };

function ContentCard({ item, onApprove }) {
  const stage = STAGE_STYLE[item.stage] || STAGE_STYLE.idea;
  const needsApproval = !item.clientApproved && ["approved","editing"].includes(item.stage);

  return (
    <Card sx={{ border: needsApproval ? "2px solid #d97706" : "1px solid #e5e7eb", position:"relative" }}>
      {needsApproval && (
        <Box sx={{ position:"absolute", top:-10, right:12, zIndex:1 }}>
          <Chip label="⚠️ Approval Needed" color="warning" size="small" sx={{ fontWeight:700 }} />
        </Box>
      )}
      <Box sx={{ p:2 }}>
        {/* Header */}
        <Box sx={{ display:"flex", justifyContent:"space-between", mb:1 }}>
          <Chip label={`${TYPE_EMOJI[item.type]} ${item.type.toUpperCase()}`} size="small"
            sx={{ fontSize:10, fontWeight:700 }} />
          <Chip label={stage.label} size="small" sx={{ bgcolor:stage.bg, color:stage.color, fontWeight:600, fontSize:10 }} />
        </Box>

        {/* Title */}
        <Typography variant="body1" fontWeight={600} mb={0.5}>{item.title}</Typography>

        {/* Description */}
        {item.description && (
          <Typography variant="body2" color="text.secondary" mb={1}
            sx={{ overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
            {item.description}
          </Typography>
        )}

        {/* Dates */}
        <Box sx={{ display:"flex", gap:1, flexWrap:"wrap", mb:1.5 }}>
          {item.shootDate && <Chip label={`📷 ${new Date(item.shootDate).toLocaleDateString("en-IN")}`} size="small" variant="outlined" sx={{ fontSize:10 }} />}
          {item.postDate  && <Chip label={`📅 ${new Date(item.postDate).toLocaleDateString("en-IN")}` } size="small" variant="outlined" sx={{ fontSize:10 }} />}
        </Box>

        {/* Drive / IG links */}
        <Box sx={{ display:"flex", gap:0.5, mb:1.5 }}>
          {item.driveLink && (
            <Button size="small" variant="outlined" href={item.driveLink} target="_blank" startIcon={<LinkIcon sx={{ fontSize:"12px !important" }} />} sx={{ fontSize:11 }}>
              View File
            </Button>
          )}
          {item.instagramLink && (
            <Button size="small" variant="contained" color="success" href={item.instagramLink} target="_blank" startIcon={<LinkIcon sx={{ fontSize:"12px !important" }} />} sx={{ fontSize:11 }}>
              View Post
            </Button>
          )}
        </Box>

        {/* Approval note */}
        {item.approvalNote && (
          <Box sx={{ bgcolor:"#f9fafb", borderRadius:1.5, p:1, mb:1.5 }}>
            <Typography variant="caption" color="text.secondary">Your note: {item.approvalNote}</Typography>
          </Box>
        )}

        {/* Approval buttons */}
        {needsApproval && (
          <Box sx={{ display:"flex", gap:1, flexWrap:"wrap" }}>
            <Button size="small" variant="contained" color="success" startIcon={<CheckIcon />}
              onClick={()=>onApprove(item,"approved")} sx={{ flex:1 }}>
              Approve
            </Button>
            <Button size="small" variant="outlined" color="warning" startIcon={<ChangeIcon />}
              onClick={()=>onApprove(item,"changes_requested")} sx={{ flex:1 }}>
              Request Changes
            </Button>
            <Button size="small" variant="outlined" color="error" startIcon={<RejectIcon />}
              onClick={()=>onApprove(item,"rejected")} sx={{ flex:1 }}>
              Reject
            </Button>
          </Box>
        )}

        {/* Approved badge */}
        {item.clientApproved && item.stage !== "posted" && (
          <Chip label="✅ You approved this" color="success" variant="outlined" size="small" sx={{ mt:0.5 }} />
        )}
      </Box>
    </Card>
  );
}

export default function PortalContent() {
  const [searchParams] = useSearchParams();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState(0); // 0=all, 1=pending, 2=posted
  const [toast, setToast]     = useState("");
  const [error, setError]     = useState("");

  // Approval dialog
  const [approvalItem, setApprovalItem] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState("");
  const [comment, setComment]             = useState("");
  const [approving, setApproving]         = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (tab === 1) { /* pending — load all and filter */ }
    if (tab === 2) params.stage = "posted";
    getPortalContent(params)
      .then(r => setContent(r.data.content))
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const openApproval = (item, status) => {
    setApprovalItem(item);
    setApprovalStatus(status);
    setComment("");
  };

  const handleApprove = async () => {
    setApproving(true);
    try {
      await approvePortalContent(approvalItem._id, { status: approvalStatus, comment });
      setApprovalItem(null);
      setToast(approvalStatus === "approved" ? "Content approved! ✅" : approvalStatus === "rejected" ? "Content rejected." : "Changes requested!");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed");
    } finally {
      setApproving(false);
    }
  };

  // Filter content by tab
  const displayContent = tab === 1
    ? content.filter(c => !c.clientApproved && ["approved","editing"].includes(c.stage))
    : tab === 2
      ? content.filter(c => c.stage === "posted")
      : content;

  const pendingCount = content.filter(c => !c.clientApproved && ["approved","editing"].includes(c.stage)).length;

  return (
    <Box>
      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:3 }}>
        <Box>
          <Typography variant="h5">My Content</Typography>
          <Typography variant="body2" color="text.secondary">
            {content.length} total · {content.filter(c=>c.stage==="posted").length} posted
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb:2 }} onClose={()=>setError("")}>{error}</Alert>}

      {pendingCount > 0 && (
        <Alert severity="warning" sx={{ mb:2 }} action={<Button size="small" color="inherit" onClick={()=>setTab(1)}>View →</Button>}>
          <strong>{pendingCount} content{pendingCount>1?"s":""}</strong> tamari approval maagi rahya chhe!
        </Alert>
      )}

      <Card sx={{ mb:2 }}>
        <Tabs value={tab} onChange={(_,v)=>setTab(v)}>
          <Tab label={`All (${content.length})`} />
          <Tab label={`Pending Approval (${pendingCount})`} sx={{ color: pendingCount>0?"#d97706":"inherit" }} />
          <Tab label={`Posted (${content.filter(c=>c.stage==="posted").length})`} />
        </Tabs>
      </Card>

      {loading ? (
        <Box sx={{ display:"flex", justifyContent:"center", pt:6 }}><CircularProgress /></Box>
      ) : displayContent.length === 0 ? (
        <Card><Box sx={{ py:6, textAlign:"center", color:"text.secondary" }}>
          <Typography>Koi content nathi.</Typography>
        </Box></Card>
      ) : (
        <Grid container spacing={2}>
          {displayContent.map(item => (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
              <ContentCard item={item} onApprove={openApproval} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Approval Dialog */}
      <Dialog open={Boolean(approvalItem)} onClose={()=>setApprovalItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {approvalStatus === "approved" ? "✅ Approve Content" :
           approvalStatus === "rejected" ? "❌ Reject Content" : "🔄 Request Changes"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            "{approvalItem?.title}"
          </Typography>
          <TextField fullWidth multiline rows={3} label="Comment (optional)"
            placeholder={
              approvalStatus === "approved" ? "Koi positive feedback..." :
              approvalStatus === "rejected" ? "Kem reject karu chhu — reason..." :
              "Shu change joiye chhe exactly..."
            }
            value={comment} onChange={e=>setComment(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2 }}>
          <Button onClick={()=>setApprovalItem(null)}>Cancel</Button>
          <Button
            variant="contained"
            color={approvalStatus==="approved"?"success":approvalStatus==="rejected"?"error":"warning"}
            onClick={handleApprove} disabled={approving}>
            {approving ? <CircularProgress size={20} color="inherit"/> :
             approvalStatus==="approved" ? "Confirm Approve" :
             approvalStatus==="rejected" ? "Confirm Reject" : "Send Request"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(toast)} autoHideDuration={3000} onClose={()=>setToast("")} message={toast} />
    </Box>
  );
}
