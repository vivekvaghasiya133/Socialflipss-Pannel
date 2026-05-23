import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button, Divider,
  TextField, Select, MenuItem, FormControl, InputLabel, Alert,
  Snackbar, CircularProgress, IconButton, Tooltip, Avatar, List,
  ListItem, ListItemText, ListItemAvatar, Paper, Dialog,
  DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import ArrowBackIcon   from "@mui/icons-material/ArrowBack";
import WhatsAppIcon    from "@mui/icons-material/WhatsApp";
import AddIcon         from "@mui/icons-material/Add";
import DeleteIcon      from "@mui/icons-material/Delete";
import CallIcon        from "@mui/icons-material/Call";
import MeetingIcon     from "@mui/icons-material/Groups";
import NoteIcon        from "@mui/icons-material/NoteAlt";
import EmailIcon       from "@mui/icons-material/Email";
import ConvertIcon     from "@mui/icons-material/PersonAdd";
import LinkIcon        from "@mui/icons-material/Link";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { getLeadById, updateLead, addActivity, deleteActivity } from "../api/leadsApi";
import { convertLeadToClient } from "../api/featuresApi";
import { useAuth } from "../context/AuthContext";

const STATUS_OPTIONS = ["new","follow_up","converted","not_interested"];
const STATUS_CONFIG  = {
  new:            { label:"New",            color:"info" },
  follow_up:      { label:"Follow Up",      color:"warning" },
  converted:      { label:"Converted",      color:"success" },
  not_interested: { label:"Not Interested", color:"default" },
};
const ACTIVITY_ICON  = { call:<CallIcon fontSize="small"/>, meeting:<MeetingIcon fontSize="small"/>, whatsapp:<WhatsAppIcon fontSize="small"/>, email:<EmailIcon fontSize="small"/>, note:<NoteIcon fontSize="small"/> };
const ACTIVITY_COLOR = { call:"#1a56db", meeting:"#8b5cf6", whatsapp:"#0e9f6e", email:"#ff8800", note:"#6b7280" };

function InfoRow({ label, value }) {
  if (!value || (Array.isArray(value) && !value.length)) return null;
  return (
    <Box sx={{ mb:1.5 }}>
      <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{Array.isArray(value) ? value.join(", ") : value}</Typography>
    </Box>
  );
}

export default function LeadDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { canManage, isAdmin } = useAuth();

  const [lead, setLead]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState("");
  const [saving, setSaving]     = useState(false);
  const [adminForm, setAdminForm] = useState({ status:"new", nextFollowUp:"", notes:"" });
  const [actForm, setActForm]   = useState({ type:"call", note:"", date:"" });
  const [actError, setActError] = useState("");

  // Convert dialog
  const [convertDialog, setConvertDialog] = useState(false);
  const [convertForm, setConvertForm]     = useState({ packageName:"", packageAmount:"" });
  const [converting, setConverting]       = useState(false);
  const [onboardingLink, setOnboardingLink] = useState("");
  const [linkDialog, setLinkDialog]       = useState(false);

  const load = () => {
    setLoading(true);
    getLeadById(id)
      .then(r => {
        setLead(r.data);
        setAdminForm({
          status:       r.data.status || "new",
          nextFollowUp: r.data.nextFollowUp ? r.data.nextFollowUp.slice(0,10) : "",
          notes:        r.data.notes || "",
        });
      })
      .catch(()=>navigate("/admin/leads"))
      .finally(()=>setLoading(false));
  };
  useEffect(()=>{ load(); },[id]);

  const handleSave = async () => {
    setSaving(true);
    try { await updateLead(id, adminForm); setToast("Saved!"); load(); }
    catch { setToast("Save failed."); }
    finally { setSaving(false); }
  };

  const handleAddActivity = async () => {
    if (!actForm.note) { setActError("Note required."); return; }
    setActError("");
    try {
      await addActivity(id, actForm);
      setActForm({ type:"call", note:"", date:"" });
      setToast("Activity added!"); load();
    } catch { setToast("Failed."); }
  };

  const handleDeleteActivity = async (actId) => {
    await deleteActivity(id, actId);
    setToast("Deleted."); load();
  };

  // ── CONVERT TO CLIENT ─────────────────────────────────────────────────────
  const handleConvert = async () => {
    setConverting(true);
    try {
      const res = await convertLeadToClient(id, convertForm);
      setOnboardingLink(res.data.onboardingFormLink);
      setConvertDialog(false);
      setLinkDialog(true);
      load();
      setToast("Lead successfully converted to client! 🎉");
    } catch (err) {
      setToast(err.response?.data?.message || "Conversion failed.");
    } finally {
      setConverting(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(onboardingLink);
    setToast("Onboarding link copied! Client ne WhatsApp karo. 📋");
  };

  const sendOnboardingWhatsApp = () => {
    if (!lead) return;
    const msg = encodeURIComponent(
      `Hi ${lead.contactName} 👋\n\n` +
      `*SocialFlipss — Onboarding Form*\n\n` +
      `Congratulations! Tamne SocialFlipss Digital Marketing family ma welcome chhe! 🎉\n\n` +
      `Niche link par click kari ne tamaru onboarding form bharo:\n${onboardingLink}\n\n` +
      `Aa form ma tamara business ane goals badd basic info bharvu padshe jethhi aapde best strategy taiyar kari shakiye.\n\n` +
      `Koi sawaal hoy to reply karo! 🙏\n– SocialFlipss Team`
    );
    window.open(`https://wa.me/91${lead.mobile.replace(/\D/g,"")}?text=${msg}`, "_blank");
  };

  const openWhatsApp = () => {
    if (!lead) return;
    const msg = encodeURIComponent(`Hi ${lead.contactName}, SocialFlipss team thi baat kar rahe hain.`);
    window.open(`https://wa.me/91${lead.mobile.replace(/\D/g,"")}?text=${msg}`, "_blank");
  };

  if (loading) return <Box sx={{ display:"flex", justifyContent:"center", pt:8 }}><CircularProgress /></Box>;
  if (!lead)   return <Alert severity="error">Lead not found</Alert>;

  const isConverted = lead.status === "converted";

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={()=>navigate("/admin/leads")} sx={{ mb:2 }}>Back to Leads</Button>

      {/* Header */}
      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", mb:3, flexWrap:"wrap", gap:2 }}>
        <Box>
          <Typography variant="h5">{lead.businessName}</Typography>
          <Typography variant="body2" color="text.secondary">
            {lead.contactName} · {lead.mobile}{lead.city ? ` · ${lead.city}` : ""}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Added: {new Date(lead.createdAt).toLocaleDateString("en-IN")}
            {lead.createdBy ? ` by ${lead.createdBy.name}` : ""}
          </Typography>
        </Box>
        <Box sx={{ display:"flex", gap:1, flexWrap:"wrap" }}>
          <Button variant="outlined" color="success" size="small" startIcon={<WhatsAppIcon />} onClick={openWhatsApp}>
            WhatsApp
          </Button>
          {/* Convert button — only if not already converted */}
          {!isConverted && canManage && (
            <Button
              variant="contained" color="success" size="small"
              startIcon={<ConvertIcon />}
              onClick={()=>setConvertDialog(true)}
              sx={{ fontWeight:700 }}
            >
              Convert to Client
            </Button>
          )}
          {/* If converted — show client link */}
          {isConverted && lead.convertedToClient && (
            <Button variant="outlined" color="primary" size="small"
              onClick={()=>navigate(`/admin/clients/${lead.convertedToClient._id||lead.convertedToClient}`)}>
              View Client →
            </Button>
          )}
          <Chip label={STATUS_CONFIG[lead.status]?.label} color={STATUS_CONFIG[lead.status]?.color} sx={{ fontWeight:600 }} />
        </Box>
      </Box>

      {/* Converted banner */}
      {isConverted && (
        <Alert severity="success" sx={{ mb:2 }} icon={<ConvertIcon />}>
          Aa lead convert thayi chhe. <strong>{lead.convertedToClient?.businessName || "Client"}</strong> — onboarding in progress.
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* LEFT */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb:2 }}>
            <CardContent>
              <Typography variant="h6" mb={1.5}>Lead Information</Typography>
              <Divider sx={{ mb:2 }} />
              <Grid container spacing={1}>
                <Grid item xs={6}><InfoRow label="Business"   value={lead.businessName} /></Grid>
                <Grid item xs={6}><InfoRow label="Contact"    value={lead.contactName} /></Grid>
                <Grid item xs={6}><InfoRow label="Mobile"     value={lead.mobile} /></Grid>
                <Grid item xs={6}><InfoRow label="Email"      value={lead.email} /></Grid>
                <Grid item xs={6}><InfoRow label="City"       value={lead.city} /></Grid>
                <Grid item xs={6}><InfoRow label="Industry"   value={lead.industry} /></Grid>
                <Grid item xs={6}><InfoRow label="Source"     value={lead.source} /></Grid>
                <Grid item xs={6}><InfoRow label="Budget"     value={lead.budget} /></Grid>
                <Grid item xs={12}><InfoRow label="Services"  value={lead.interestedServices} /></Grid>
                <Grid item xs={12}><InfoRow label="Notes"     value={lead.notes} /></Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardContent>
              <Typography variant="h6" mb={1.5}>Activity Log</Typography>
              <Divider sx={{ mb:2 }} />
              {canManage && (
                <Paper variant="outlined" sx={{ p:2, mb:2, borderRadius:2 }}>
                  <Typography variant="body2" fontWeight={600} mb={1.5}>+ Add Activity</Typography>
                  {actError && <Alert severity="error" sx={{ mb:1 }}>{actError}</Alert>}
                  <Grid container spacing={1.5}>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Type</InputLabel>
                        <Select value={actForm.type} label="Type" onChange={e=>setActForm({...actForm,type:e.target.value})}>
                          {["call","meeting","whatsapp","email","note"].map(t=><MenuItem key={t} value={t} sx={{ textTransform:"capitalize" }}>{t}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField fullWidth size="small" type="date" label="Date" InputLabelProps={{ shrink:true }}
                        value={actForm.date} onChange={e=>setActForm({...actForm,date:e.target.value})} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Button fullWidth variant="outlined" startIcon={<AddIcon />} onClick={handleAddActivity} sx={{ height:40 }}>Add</Button>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth size="small" multiline rows={2} label="Note *"
                        value={actForm.note} onChange={e=>setActForm({...actForm,note:e.target.value})}
                        placeholder="Call ma shu vaat thi? Next step?" />
                    </Grid>
                  </Grid>
                </Paper>
              )}
              {(lead.activities||[]).length === 0
                ? <Typography variant="body2" color="text.secondary" sx={{ py:2, textAlign:"center" }}>Haji koi activity nathi.</Typography>
                : (
                  <List dense>
                    {[...lead.activities].reverse().map(act=>(
                      <ListItem key={act._id} alignItems="flex-start" sx={{ px:0, borderBottom:"0.5px solid #f3f4f6" }}
                        secondaryAction={isAdmin && (
                          <IconButton size="small" onClick={()=>handleDeleteActivity(act._id)}><DeleteIcon fontSize="small"/></IconButton>
                        )}>
                        <ListItemAvatar>
                          <Avatar sx={{ width:32, height:32, bgcolor:ACTIVITY_COLOR[act.type]+"22", color:ACTIVITY_COLOR[act.type] }}>
                            {ACTIVITY_ICON[act.type]}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
                              <Chip label={act.type} size="small" sx={{ fontSize:10, height:18, bgcolor:ACTIVITY_COLOR[act.type]+"18", color:ACTIVITY_COLOR[act.type] }} />
                              <Typography variant="caption" color="text.secondary">
                                {new Date(act.date).toLocaleDateString("en-IN")}
                                {act.addedBy ? ` · ${act.addedBy.name}` : ""}
                              </Typography>
                            </Box>
                          }
                          secondary={<Typography variant="body2" sx={{ mt:0.5 }}>{act.note}</Typography>}
                        />
                      </ListItem>
                    ))}
                  </List>
                )
              }
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT */}
        {canManage && (
          <Grid item xs={12} md={4}>
            <Card sx={{ position:{ md:"sticky" }, top:80 }}>
              <CardContent>
                <Typography variant="h6" mb={1.5}>Update Lead</Typography>
                <Divider sx={{ mb:2 }} />
                <FormControl fullWidth size="small" sx={{ mb:2 }}>
                  <InputLabel>Status</InputLabel>
                  <Select value={adminForm.status} label="Status" onChange={e=>setAdminForm({...adminForm,status:e.target.value})}>
                    {STATUS_OPTIONS.map(s=>(
                      <MenuItem key={s} value={s}>
                        <Chip label={STATUS_CONFIG[s].label} color={STATUS_CONFIG[s].color} size="small" />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField fullWidth size="small" type="date" label="Next Follow-up" InputLabelProps={{ shrink:true }}
                  value={adminForm.nextFollowUp} sx={{ mb:2 }}
                  onChange={e=>setAdminForm({...adminForm,nextFollowUp:e.target.value})} />
                <TextField fullWidth multiline rows={3} size="small" label="Notes"
                  value={adminForm.notes} sx={{ mb:2 }}
                  onChange={e=>setAdminForm({...adminForm,notes:e.target.value})} />
                <Button fullWidth variant="contained" onClick={handleSave} disabled={saving}>
                  {saving ? <CircularProgress size={20} color="inherit"/> : "Save Changes"}
                </Button>

                {!isConverted && (
                  <>
                    <Divider sx={{ my:2 }} />
                    <Button fullWidth variant="contained" color="success" startIcon={<ConvertIcon />}
                      onClick={()=>setConvertDialog(true)} sx={{ fontWeight:700 }}>
                      🎯 Convert to Client
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Convert Dialog */}
      <Dialog open={convertDialog} onClose={()=>setConvertDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Convert Lead to Client</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb:2 }}>
            <strong>{lead.businessName}</strong> ne client ma convert karvama avshhe. Ek unique onboarding form link generate thashe.
          </Alert>
          <Grid container spacing={2} sx={{ mt:0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Package Name (optional)"
                placeholder="Growth Plan, Starter..." value={convertForm.packageName}
                onChange={e=>setConvertForm({...convertForm,packageName:e.target.value})} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Monthly Amount (₹)" type="number"
                value={convertForm.packageAmount}
                onChange={e=>setConvertForm({...convertForm,packageAmount:e.target.value})} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2 }}>
          <Button onClick={()=>setConvertDialog(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleConvert} disabled={converting}>
            {converting ? <CircularProgress size={20} color="inherit"/> : "Convert & Generate Link"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Onboarding Link Dialog */}
      <Dialog open={linkDialog} onClose={()=>setLinkDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>🎉 Client Converted! Onboarding Link Ready</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb:2 }}>
            Lead successfully converted! Aa unique link client ne moko — te form bharshe aetle data automatically client record ma aavi jaashhe.
          </Alert>
          <Box sx={{ p:2, background:"#f9fafb", borderRadius:2, border:"1px solid #e5e7eb", mb:2 }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Onboarding Form Link:</Typography>
            <Typography variant="body2" sx={{ wordBreak:"break-all", fontFamily:"monospace", fontSize:12 }}>
              {onboardingLink}
            </Typography>
          </Box>
          <Box sx={{ display:"flex", gap:1 }}>
            <Button fullWidth variant="outlined" startIcon={<ContentCopyIcon />} onClick={copyLink}>
              Copy Link
            </Button>
            <Button fullWidth variant="contained" color="success" startIcon={<WhatsAppIcon />} onClick={sendOnboardingWhatsApp}>
              Send on WhatsApp
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2 }}>
          <Button onClick={()=>navigate(`/admin/clients`)}>View Clients</Button>
          <Button variant="contained" onClick={()=>setLinkDialog(false)}>Done</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(toast)} autoHideDuration={4000} onClose={()=>setToast("")} message={toast} />
    </Box>
  );
}
