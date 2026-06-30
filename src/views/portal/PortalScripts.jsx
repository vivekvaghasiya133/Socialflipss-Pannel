import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box, Typography, Card, Grid, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, Snackbar, CircularProgress,
  Divider,
} from "@mui/material";
import CheckIcon    from "@mui/icons-material/CheckCircle";
import RejectIcon   from "@mui/icons-material/Cancel";
import ChangeIcon   from "@mui/icons-material/Edit";
import { getPortalContent, approvePortalScript } from "../../api/portalApi";

const PRIORITY_COLORS = { high:"error", medium:"warning", low:"default" };

function ScriptCard({ item, onApprove }) {
  const needsApproval = !item.scriptApproved && item.stage === "script" && item.scriptText;

  return (
    <Card sx={{ border: needsApproval ? "2px solid #0891b2" : "1px solid #e5e7eb", position:"relative" }}>
      {needsApproval && (
        <Box sx={{ position:"absolute", top:-10, right:12, zIndex:1 }}>
          <Chip label="✍️ Script Approval Needed" color="info" size="small" sx={{ fontWeight:700 }} />
        </Box>
      )}
      <Box sx={{ p:2 }}>
        {/* Header */}
        <Box sx={{ display:"flex", justifyContent:"space-between", mb:1, alignItems:"center" }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            🎬 REEL SCRIPT
          </Typography>
          <Chip label={item.priority || "medium"} color={PRIORITY_COLORS[item.priority || "medium"]} size="small" sx={{ fontSize:9, height:18 }} />
        </Box>

        {/* Title */}
        <Typography variant="body1" fontWeight={700} mb={0.5}>{item.title}</Typography>

        {/* Description / Brief */}
        {item.description && (
          <Typography variant="body2" color="text.secondary" mb={1.5} sx={{ fontStyle: "italic" }}>
            Brief: {item.description}
          </Typography>
        )}

        <Divider sx={{ my: 1.5 }} />

        {/* Drafted Script Display */}
        {item.scriptText ? (
          <Box sx={{ p: 2, bgcolor: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 2, mb: 2 }}>
            <Typography variant="caption" fontWeight={700} color="#0369a1" display="block" sx={{ mb: 1, textTransform: "uppercase", letterSpacing: 0.5 }}>
              📝 DRAFTED SCRIPT OUTLINE
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-line", color: "#0f172a", fontFamily: "monospace", fontSize: 12.5, lineHeight: 1.6 }}>
              {item.scriptText}
            </Typography>
          </Box>
        ) : (
          <Alert severity="info" sx={{ mb: 2, py: 0 }}>
            Script is being drafted by our creative writer.
          </Alert>
        )}

        {/* Script approval feedback note */}
        {item.scriptApprovalNote && (
          <Box sx={{ bgcolor:"#fffbeb", border:"1px solid #fef3c7", borderRadius:1.5, p:1, mb:1.5 }}>
            <Typography variant="caption" color="warning.dark" display="block" fontWeight={600}>
              Last Script Feedback:
            </Typography>
            <Typography variant="caption" color="text.secondary">{item.scriptApprovalNote}</Typography>
          </Box>
        )}

        {/* Approval buttons */}
        {needsApproval && item.scriptText && (
          <Box sx={{ display:"flex", gap:1, mt: 1 }}>
            <Button size="small" variant="contained" color="success" startIcon={<CheckIcon />}
              onClick={()=>onApprove(item,"approved")} sx={{ flex:1 }}>
              Approve Script
            </Button>
            <Button size="small" variant="outlined" color="warning" startIcon={<ChangeIcon />}
              onClick={()=>onApprove(item,"changes_requested")} sx={{ flex:1 }}>
              Request Revisions
            </Button>
            <Button size="small" variant="outlined" color="error" startIcon={<RejectIcon />}
              onClick={()=>onApprove(item,"rejected")} sx={{ flex:1 }}>
              Reject
            </Button>
          </Box>
        )}

        {/* Approved status badge */}
        {item.scriptApproved && (
          <Chip label="✓ Script Approved" color="success" variant="outlined" size="small" sx={{ mt:0.5, fontWeight:700 }} />
        )}
      </Box>
    </Card>
  );
}

export default function PortalScripts() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState(1); // Default to Pending (1), All (0)
  const [toast, setToast]     = useState("");
  const [error, setError]     = useState("");

  // Approval dialog
  const [approvalItem, setApprovalItem] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState("");
  const [comment, setComment]             = useState("");
  const [approving, setApproving]         = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getPortalContent()
      .then(r => setContent(r.data.content || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openApproval = (item, status) => {
    setApprovalItem(item);
    setApprovalStatus(status);
    setComment("");
  };

  const handleApprove = async () => {
    setApproving(true);
    try {
      await approvePortalScript(approvalItem._id, { status: approvalStatus, comment });
      setApprovalItem(null);
      setToast(approvalStatus === "approved" ? "Script approved! ✍️" : "Revisions requested.");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed");
    } finally {
      setApproving(false);
    }
  };

  // Filter scripts
  // Scripts are items that have scriptText drafted, or in stage: script
  const scriptItems = content.filter(c => c.stage === "script" || c.scriptApproved || c.scriptText);

  const displayScripts = tab === 1
    ? scriptItems.filter(c => !c.scriptApproved && c.scriptText)
    : scriptItems;

  const pendingCount = scriptItems.filter(c => !c.scriptApproved && c.scriptText).length;

  return (
    <Box>
      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>✍️ Script Approvals</Typography>
          <Typography variant="body2" color="text.secondary">
            Review and approve script outlines before shooting.
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb:2 }} onClose={()=>setError("")}>{error}</Alert>}

      {pendingCount > 0 && (
        <Alert severity="info" sx={{ mb:2 }}>
          You have <strong>{pendingCount} script{pendingCount>1?"s":""}</strong> awaiting your approval!
        </Alert>
      )}

      <Card sx={{ mb:3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex' }}>
          <Button 
            onClick={() => setTab(1)} 
            variant={tab === 1 ? "text" : "text"} 
            sx={{ 
              px: 3, py: 1.5, 
              borderBottom: tab === 1 ? "2px solid #0891b2" : "none",
              color: tab === 1 ? "#0891b2" : "text.secondary",
              fontWeight: 700,
              borderRadius: 0,
            }}
          >
            Pending Script Approvals ({pendingCount})
          </Button>
          <Button 
            onClick={() => setTab(0)} 
            variant={tab === 0 ? "text" : "text"} 
            sx={{ 
              px: 3, py: 1.5, 
              borderBottom: tab === 0 ? "2px solid #0891b2" : "none",
              color: tab === 0 ? "#0891b2" : "text.secondary",
              fontWeight: 700,
              borderRadius: 0,
            }}
          >
            All Scripts ({scriptItems.length})
          </Button>
        </Box>
      </Card>

      {loading ? (
        <Box sx={{ display:"flex", justifyContent:"center", pt:6 }}><CircularProgress /></Box>
      ) : displayScripts.length === 0 ? (
        <Card><Box sx={{ py:6, textAlign:"center", color:"text.secondary" }}>
          <Typography>No scripts found.</Typography>
        </Box></Card>
      ) : (
        <Grid container spacing={2}>
          {displayScripts.map(item => (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
              <ScriptCard item={item} onApprove={openApproval} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Approval Dialog */}
      <Dialog open={Boolean(approvalItem)} onClose={()=>setApprovalItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {approvalStatus === "approved" ? "✅ Approve Script Outline" : "🔄 Request Script Revisions"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            "{approvalItem?.title}"
          </Typography>
          <TextField fullWidth multiline rows={3} label="Comment (optional)"
            placeholder={
              approvalStatus === "approved" ? "Write any feedback or suggestions..." :
              "Detail the revisions required in the script outline..."
            }
            value={comment} onChange={e=>setComment(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2 }}>
          <Button onClick={()=>setApprovalItem(null)}>Cancel</Button>
          <Button
            variant="contained"
            color={approvalStatus==="approved"?"success":"warning"}
            onClick={handleApprove} disabled={approving}>
            {approving ? <CircularProgress size={20} color="inherit"/> :
             approvalStatus==="approved" ? "Approve Script" : "Send Revision Request"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(toast)} autoHideDuration={3000} onClose={()=>setToast("")} message={toast} />
    </Box>
  );
}
