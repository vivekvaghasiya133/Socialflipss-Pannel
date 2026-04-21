import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, Checkbox,
  FormControlLabel, FormGroup, Radio, RadioGroup,
  Alert, CircularProgress, Divider, Grid, Chip, LinearProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { getOnboardingClient, submitOnboardingForm } from "../api/featuresApi";

const STEPS = ["Business Info","Goals & Services","Content Preferences","Final Details"];

const PLATFORMS    = ["Instagram","Facebook","YouTube","Google Business Profile","LinkedIn","No presence yet"];
const GOALS        = ["Brand awareness vadharvanu chhe","Leads / inquiries generate karvani chhe","Followers / community banavvanu chhe","Product / service directly vechavu chhe","Personal branding karvanu chhe"];
const SERVICES     = ["Social media management","SEO","Google Ads","Meta Ads","Content creation","Personal branding","Website design"];
const TONES        = ["Professional / corporate","Friendly / conversational","Fun / trendy / youthful","Educational / informative","Inspirational / motivational"];
const CONTENT_TYPES= ["Reels / short videos","Static posts / carousel","Stories","Testimonials / reviews","Behind the scenes","Before–after results"];

const INIT = {
  email:"", city:"", industry:"", website:"", instagramPage:"",
  description:"", targetAudience:"", services:"", competitors:"", usp:"",
  brandColors:"", tone:"", contentTypes:[], platforms:[], goal:"",
  inspirationLink:"", budget:"", postFrequency:"",
  prevExp:"", contactTime:"", reporting:"", notes:"", agreed:false,
};

function SField({ label, required, children }) {
  return (
    <Box sx={{ mb:2.5 }}>
      <Typography variant="body2" fontWeight={500} mb={0.75}>
        {label}{required && <span style={{ color:"#e02424", marginLeft:3 }}>*</span>}
      </Typography>
      {children}
    </Box>
  );
}

function CheckList({ options, selected, onChange }) {
  const toggle = (v) => onChange(selected.includes(v) ? selected.filter(x=>x!==v) : [...selected,v]);
  return (
    <FormGroup>
      {options.map(o => (
        <FormControlLabel key={o} control={<Checkbox size="small" checked={selected.includes(o)} onChange={()=>toggle(o)} />}
          label={<Typography variant="body2">{o}</Typography>} />
      ))}
    </FormGroup>
  );
}

function RadioList({ options, value, onChange, name }) {
  return (
    <RadioGroup name={name} value={value} onChange={e=>onChange(e.target.value)}>
      {options.map(o => (
        <FormControlLabel key={o} value={o} control={<Radio size="small" />}
          label={<Typography variant="body2">{o}</Typography>} />
      ))}
    </RadioGroup>
  );
}

export default function ClientOnboardingForm() {
  const { clientId } = useParams();
  const [client, setClient]     = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [step, setStep]         = useState(0);
  const [form, setForm]         = useState(INIT);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    getOnboardingClient(clientId)
      .then(r => setClient(r.data))
      .catch(err => {
        if (err.response?.data?.alreadyDone) setAlreadyDone(true);
        else setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [clientId]);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const tf  = (key) => ({ fullWidth:true, size:"small", value:form[key]||"", onChange:(e)=>set(key,e.target.value) });

  const handleSubmit = async () => {
    if (!form.agreed) { setError("Agreement confirm karo."); return; }
    setSaving(true); setError("");
    try {
      await submitOnboardingForm(clientId, form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Submit failed.");
    } finally {
      setSaving(false);
    }
  };

  const progress = ((step) / STEPS.length) * 100;

  if (loading) return <Box sx={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f4f6fb" }}><CircularProgress /></Box>;

  if (notFound) return (
    <Box sx={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f4f6fb", p:2 }}>
      <Card sx={{ maxWidth:420, textAlign:"center" }}>
        <CardContent sx={{ p:4 }}>
          <Typography variant="h6" color="error" mb={1}>Invalid Link</Typography>
          <Typography variant="body2" color="text.secondary">Aa link invalid chhe. Admin ne contact karo.</Typography>
        </CardContent>
      </Card>
    </Box>
  );

  if (alreadyDone) return (
    <Box sx={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f4f6fb", p:2 }}>
      <Card sx={{ maxWidth:440, textAlign:"center" }}>
        <CardContent sx={{ p:5 }}>
          <CheckCircleIcon sx={{ fontSize:56, color:"#0e9f6e", mb:2 }} />
          <Typography variant="h5" fontWeight={700} mb={1}>Onboarding Already Complete!</Typography>
          <Typography variant="body2" color="text.secondary">Tamaru onboarding already thayi gayu chhe. SocialFlipss team soon contact karshhe.</Typography>
        </CardContent>
      </Card>
    </Box>
  );

  if (submitted) return (
    <Box sx={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f4f6fb", p:2 }}>
      <Card sx={{ maxWidth:460, textAlign:"center" }}>
        <CardContent sx={{ p:5 }}>
          <CheckCircleIcon sx={{ fontSize:64, color:"#0e9f6e", mb:2 }} />
          <Typography variant="h5" fontWeight={700} mb={1}>Onboarding Complete! 🎉</Typography>
          <Typography variant="body2" color="text.secondary" lineHeight={1.8}>
            {client?.business} — tamaro onboarding successfully submit thayo!<br />
            SocialFlipss team 24 kalaak ma tamne contact karshhe.<br />
            Welcome to the family! 🙌
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Box sx={{ minHeight:"100vh", background:"#f4f6fb", py:4, px:2 }}>
      {/* Header */}
      <Box sx={{ maxWidth:620, mx:"auto", mb:3, display:"flex", alignItems:"center", gap:1.5 }}>
        <Box sx={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#1a56db,#0891b2)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:14 }}>SF</Box>
        <Box>
          <Typography variant="h6" lineHeight={1}>SocialFlipss</Typography>
          <Typography variant="caption" color="text.secondary">Client Onboarding</Typography>
        </Box>
      </Box>

      {/* Welcome chip */}
      <Box sx={{ maxWidth:620, mx:"auto", mb:2 }}>
        <Chip label={`Welcome, ${client?.name} — ${client?.business}`} color="primary" variant="outlined" />
      </Box>

      {/* Progress */}
      <Box sx={{ maxWidth:620, mx:"auto", mb:2 }}>
        <LinearProgress variant="determinate" value={progress}
          sx={{ height:5, borderRadius:3, mb:1, bgcolor:"#e5e7eb", "& .MuiLinearProgress-bar":{ bgcolor:"#1a56db" } }} />
        <Box sx={{ display:"flex", justifyContent:"space-between" }}>
          {STEPS.map((s,i) => (
            <Typography key={s} variant="caption" sx={{ color: i===step?"#1a56db":i<step?"#0e9f6e":"#9ca3af", fontWeight:i===step?600:400, flex:1, textAlign:"center" }}>
              {s}
            </Typography>
          ))}
        </Box>
      </Box>

      <Card sx={{ maxWidth:620, mx:"auto" }}>
        <CardContent sx={{ p:{ xs:2.5, sm:4 } }}>
          <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1}>Step {step+1} of {STEPS.length}</Typography>
          <Typography variant="h6" mt={0.25} mb={0.5}>
            {["Business Information","Goals & Services","Content Preferences","Final Details"][step]}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {["Tamara business ni basic details bharjo.","Social media goals ane required services nakho.","Content style ane preferences nakho.","Final notes ane agreement confirm karo."][step]}
          </Typography>

          {error && <Alert severity="error" sx={{ mb:2 }} onClose={()=>setError("")}>{error}</Alert>}

          {/* STEP 1 */}
          {step===0 && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><SField label="Email"><TextField {...tf("email")} type="email" placeholder="example@gmail.com" /></SField></Grid>
                <Grid item xs={12} sm={6}><SField label="City"><TextField {...tf("city")} placeholder="Surat, Ahmedabad..." /></SField></Grid>
                <Grid item xs={12} sm={6}><SField label="Industry"><TextField {...tf("industry")} placeholder="Restaurant, Healthcare..." /></SField></Grid>
                <Grid item xs={12} sm={6}><SField label="Website"><TextField {...tf("website")} placeholder="https://..." /></SField></Grid>
                <Grid item xs={12} sm={6}><SField label="Instagram Page"><TextField {...tf("instagramPage")} placeholder="@yourpage" /></SField></Grid>
              </Grid>
              <SField label="Business shu kare chhe?" required>
                <TextField {...tf("description")} multiline rows={3} placeholder="Tamara business ni brief description..." />
              </SField>
              <SField label="Target Audience"><TextField {...tf("targetAudience")} multiline rows={2} placeholder="Age, gender, location..." /></SField>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><SField label="Main Services / Products" required><TextField {...tf("services")} multiline rows={2} placeholder="Top 3-5 services..." /></SField></Grid>
                <Grid item xs={12} sm={6}><SField label="Competitors"><TextField {...tf("competitors")} multiline rows={2} placeholder="Local competitors..." /></SField></Grid>
              </Grid>
              <SField label="USP — Tamara business ma shu special chhe?"><TextField {...tf("usp")} multiline rows={2} placeholder="Kem client tamne choose kare?" /></SField>
            </>
          )}

          {/* STEP 2 */}
          {step===1 && (
            <>
              <SField label="Kyaa platforms par active chho?" required>
                <CheckList options={PLATFORMS} selected={form.platforms} onChange={v=>set("platforms",v)} />
              </SField>
              <Divider sx={{ my:2 }} />
              <SField label="Main goal shu chhe?" required>
                <RadioList options={GOALS} value={form.goal} onChange={v=>set("goal",v)} name="goal" />
              </SField>
              <Divider sx={{ my:2 }} />
              <SField label="Kon kon si services joiye chhe?">
                <CheckList options={SERVICES} selected={form.services?.split(",")||[]} onChange={v=>set("services",v.join(","))} />
              </SField>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <SField label="Monthly Budget">
                    <FormControl fullWidth size="small">
                      <Select value={form.budget||""} onChange={e=>set("budget",e.target.value)} displayEmpty>
                        <MenuItem value=""><em>Select...</em></MenuItem>
                        {["Under ₹5k","₹5k–₹15k","₹15k–₹30k","₹30k–₹50k","₹50k+"].map(b=><MenuItem key={b} value={b}>{b}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </SField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SField label="Post Frequency">
                    <FormControl fullWidth size="small">
                      <Select value={form.postFrequency||""} onChange={e=>set("postFrequency",e.target.value)} displayEmpty>
                        <MenuItem value=""><em>Select...</em></MenuItem>
                        {["8–12 posts/month","12–20 posts/month","20–30 posts/month","Daily"].map(p=><MenuItem key={p} value={p}>{p}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </SField>
                </Grid>
              </Grid>
            </>
          )}

          {/* STEP 3 */}
          {step===2 && (
            <>
              <SField label="Brand ni tone / vibe?" required>
                <RadioList options={TONES} value={form.tone} onChange={v=>set("tone",v)} name="tone" />
              </SField>
              <Divider sx={{ my:2 }} />
              <SField label="Content type preferences">
                <CheckList options={CONTENT_TYPES} selected={form.contentTypes} onChange={v=>set("contentTypes",v)} />
              </SField>
              <SField label="Brand colors / logo (describe karo)"><TextField {...tf("brandColors")} multiline rows={2} placeholder="Colors, fonts, style..." /></SField>
              <SField label="Inspiration link (competitor / reference)"><TextField {...tf("inspirationLink")} placeholder="https://instagram.com/..." /></SField>
            </>
          )}

          {/* STEP 4 */}
          {step===3 && (
            <>
              <SField label="Pehla koi agency sathe kaam karyu chhe?">
                <RadioList options={["Nai, pehli var chhu","Haa — saru anubhav","Haa — saru notu"]} value={form.prevExp} onChange={v=>set("prevExp",v)} name="prev" />
              </SField>
              <SField label="Best contact time">
                <RadioList options={["Morning 9–12","Afternoon 12–4","Evening 4–8"]} value={form.contactTime} onChange={v=>set("contactTime",v)} name="ct" />
              </SField>
              <SField label="Reporting preference">
                <RadioList options={["Weekly WhatsApp","Monthly PDF","Video call"]} value={form.reporting} onChange={v=>set("reporting",v)} name="rep" />
              </SField>
              <SField label="Koi biji important baat">
                <TextField {...tf("notes")} multiline rows={2} placeholder="Koi special requirement..." />
              </SField>
              <Divider sx={{ my:2 }} />
              <FormControlLabel
                control={<Checkbox checked={form.agreed} onChange={e=>set("agreed",e.target.checked)} />}
                label={<Typography variant="body2" color="text.secondary">Hu confirm karu chhu ke badhi information saachi chhe. SocialFlipss team mara data ne confidential rakhshe.</Typography>}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Box sx={{ maxWidth:620, mx:"auto", mt:2, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <Button variant="outlined" onClick={()=>setStep(s=>s-1)} disabled={step===0} sx={{ minWidth:100 }}>← Back</Button>
        <Typography variant="caption" color="text.secondary">{step+1} / {STEPS.length}</Typography>
        {step < STEPS.length-1
          ? <Button variant="contained" onClick={()=>setStep(s=>s+1)} sx={{ minWidth:100 }}>Next →</Button>
          : <Button variant="contained" color="success" onClick={handleSubmit} disabled={saving} sx={{ minWidth:120 }}>
              {saving ? <CircularProgress size={20} color="inherit" /> : "Submit ✓"}
            </Button>
        }
      </Box>
    </Box>
  );
}
