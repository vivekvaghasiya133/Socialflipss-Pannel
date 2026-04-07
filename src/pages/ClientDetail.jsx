import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Divider, Alert, CircularProgress, Snackbar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getClientById, updateClient } from "../api";

const STATUS_OPTIONS = ["new","in_progress","active","paused","completed"];
const STATUS_COLORS  = { new:"warning", in_progress:"info", active:"success", paused:"default", completed:"secondary" };
const STATUS_LABELS  = { new:"New", in_progress:"In Progress", active:"Active", paused:"Paused", completed:"Completed" };

function InfoRow({ label, value }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <Box sx={{ mb:1.5 }}>
      <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
      <Typography variant="body2" fontWeight={500}>
        {Array.isArray(value) ? value.join(", ") : value}
      </Typography>
    </Box>
  );
}

function Section({ title, children }) {
  return (
    <Card sx={{ mb:2 }}>
      <CardContent>
        <Typography variant="h6" mb={1.5}>{title}</Typography>
        <Divider sx={{ mb:2 }} />
        {children}
      </CardContent>
    </Card>
  );
}

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState("");
  const [admin, setAdmin]     = useState({ status:"", assignedTo:"", internalNotes:"" });

  useEffect(() => {
    getClientById(id)
      .then((r) => {
        setClient(r.data);
        setAdmin({
          status: r.data.status || "new",
          assignedTo: r.data.assignedTo || "",
          internalNotes: r.data.internalNotes || "",
        });
      })
      .catch(() => navigate("/admin/clients"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateClient(id, admin);
      setToast("Changes saved!");
    } catch {
      setToast("Save failed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display:"flex", justifyContent:"center", pt:8 }}><CircularProgress /></Box>;
  if (!client) return <Alert severity="error">Client not found</Alert>;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/admin/clients")} sx={{ mb:2 }}>
        Back to Clients
      </Button>

      {/* Header */}
      <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", mb:3, flexWrap:"wrap", gap:1 }}>
        <Box>
          <Typography variant="h5">{client.businessName}</Typography>
          <Typography variant="body2" color="text.secondary">
            {client.ownerName} · {client.mobile} · {client.city}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Submitted: {new Date(client.createdAt).toLocaleString("en-IN")}
          </Typography>
        </Box>
        <Chip
          label={STATUS_LABELS[admin.status]}
          color={STATUS_COLORS[admin.status]}
          sx={{ fontWeight:600 }}
        />
      </Box>

      <Grid container spacing={2}>
        {/* LEFT — client data */}
        <Grid item xs={12} md={8}>
          <Section title="Basic Information">
            <Grid container spacing={1}>
              <Grid item xs={6}><InfoRow label="Business Name" value={client.businessName} /></Grid>
              <Grid item xs={6}><InfoRow label="Owner Name"    value={client.ownerName} /></Grid>
              <Grid item xs={6}><InfoRow label="Mobile"        value={client.mobile} /></Grid>
              <Grid item xs={6}><InfoRow label="Email"         value={client.email} /></Grid>
              <Grid item xs={6}><InfoRow label="City"          value={client.city} /></Grid>
              <Grid item xs={6}><InfoRow label="Industry"      value={client.industry} /></Grid>
              <Grid item xs={12}><InfoRow label="Website"      value={client.website} /></Grid>
            </Grid>
          </Section>

          <Section title="Business Details">
            <InfoRow label="Business Description" value={client.description} />
            <InfoRow label="Target Audience"       value={client.targetAudience} />
            <InfoRow label="Main Services / Products" value={client.services} />
            <InfoRow label="Competitors"           value={client.competitors} />
            <InfoRow label="USP"                   value={client.usp} />
            <InfoRow label="Revenue Range"         value={client.revenue} />
          </Section>

          <Section title="Goals & Social Media">
            <InfoRow label="Active Platforms"    value={client.platforms} />
            <InfoRow label="Main Goal"           value={client.goal} />
            <InfoRow label="Services Required"   value={client.selectedServices} />
            <InfoRow label="6-Month Expectations" value={client.expectations} />
          </Section>

          <Section title="Content & Budget">
            <Grid container spacing={1}>
              <Grid item xs={6}><InfoRow label="Brand Tone"      value={client.tone} /></Grid>
              <Grid item xs={6}><InfoRow label="Monthly Budget"  value={client.budget} /></Grid>
              <Grid item xs={6}><InfoRow label="Post Frequency"  value={client.postFrequency} /></Grid>
              <Grid item xs={6}><InfoRow label="Referral Source" value={client.referral} /></Grid>
            </Grid>
            <InfoRow label="Content Types"      value={client.contentTypes} />
            <InfoRow label="Brand Colors / Style" value={client.brandColors} />
            <InfoRow label="Inspiration Link"   value={client.inspirationLink} />
          </Section>

          <Section title="Additional Details">
            <InfoRow label="Previous Agency Experience" value={client.prevExp} />
            <InfoRow label="Previous Problem"           value={client.prevProblem} />
            <InfoRow label="Best Contact Time"          value={client.contactTime} />
            <InfoRow label="Preferred Reporting"        value={client.reporting} />
            <InfoRow label="Extra Notes from Client"    value={client.notes} />
          </Section>
        </Grid>

        {/* RIGHT — admin controls */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: { md:"sticky" }, top:80 }}>
            <CardContent>
              <Typography variant="h6" mb={2}>Admin Controls</Typography>
              <Divider sx={{ mb:2 }} />

              <FormControl fullWidth size="small" sx={{ mb:2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={admin.status} label="Status"
                  onChange={(e) => setAdmin({ ...admin, status: e.target.value })}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <MenuItem key={s} value={s}>
                      <Chip label={STATUS_LABELS[s]} color={STATUS_COLORS[s]} size="small" />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth size="small" label="Assigned To" sx={{ mb:2 }}
                placeholder="Team member name..."
                value={admin.assignedTo}
                onChange={(e) => setAdmin({ ...admin, assignedTo: e.target.value })}
              />

              <TextField
                fullWidth multiline rows={5}
                label="Internal Notes (team only)"
                placeholder="Strategy, client calls, important info..."
                value={admin.internalNotes}
                onChange={(e) => setAdmin({ ...admin, internalNotes: e.target.value })}
                sx={{ mb:2 }}
              />

              <Button
                fullWidth variant="contained" onClick={handleSave}
                disabled={saving}
              >
                {saving ? <CircularProgress size={20} color="inherit" /> : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={Boolean(toast)} autoHideDuration={3000}
        onClose={() => setToast("")} message={toast}
      />
    </Box>
  );
}
