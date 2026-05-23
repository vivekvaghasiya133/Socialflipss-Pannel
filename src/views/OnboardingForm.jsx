import { useState } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Select, MenuItem, FormControl, InputLabel, Checkbox,
  FormControlLabel, FormGroup, Radio, RadioGroup,
  FormLabel, Divider, Alert, CircularProgress, Stepper,
  Step, StepLabel, Grid, LinearProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { submitClientForm } from "../api";

const STEPS = [
  "Basic Info",
  "Business Details",
  "Goals & Services",
  "Content & Budget",
  "Final Details",
];

const INDUSTRIES = [
  { value: "healthcare",  label: "Healthcare / Clinic / Doctor" },
  { value: "retail",      label: "Retail / Shop" },
  { value: "restaurant",  label: "Restaurant / Food" },
  { value: "realestate",  label: "Real Estate" },
  { value: "education",   label: "Education / Coaching" },
  { value: "automobile",  label: "Automobile / Motor Parts" },
  { value: "fashion",     label: "Fashion / Clothing" },
  { value: "beauty",      label: "Beauty / Salon" },
  { value: "finance",     label: "Finance / Insurance" },
  { value: "other",       label: "Other" },
];

const PLATFORMS    = ["Instagram","Facebook","YouTube","Google Business Profile","LinkedIn","No presence yet"];
const GOALS        = ["Brand awareness vadharvanu chhe","Leads / inquiries generate karvani chhe","Followers / community banavvanu chhe","Product / service directly vechavu chhe","Personal branding karvanu chhe"];
const SERVICES     = ["Social media management (posts, reels, stories)","SEO (Google par rank karvu)","Google Ads / Meta Ads","Content creation (photos / video shooting)","Personal branding","Website design / development"];
const TONES        = ["Professional / corporate","Friendly / conversational","Fun / trendy / youthful","Educational / informative","Inspirational / motivational"];
const CONTENT_TYPES= ["Reels / short videos","Static posts / carousel","Stories","Testimonials / reviews","Behind the scenes / team content","Before–after results"];
const PREV_EXP     = ["Nai, aa pehli var chhu","Haa — saru anubhav hato","Haa — saru noto, isliye change karyo"];
const CONTACT_TIME = ["Morning 9am – 12pm","Afternoon 12pm – 4pm","Evening 4pm – 8pm"];
const REPORTING    = ["Weekly WhatsApp report","Monthly PDF report","Video call meeting","Jyare jari padhe tyare"];

const INIT = {
  businessName:"", ownerName:"", mobile:"", email:"", city:"", industry:"", website:"",
  description:"", targetAudience:"", services:"", competitors:"", usp:"", revenue:"",
  platforms:[], goal:"", selectedServices:[], expectations:"",
  tone:"", contentTypes:[], postFrequency:"", budget:"", brandColors:"", inspirationLink:"",
  prevExp:"", prevProblem:"", contactTime:"", reporting:"", notes:"", referral:"", agreed:false,
};

function SField({ label, required, hint, children }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography variant="body2" fontWeight={500} mb={0.75} color="text.primary">
        {label}{required && <span style={{ color:"#e02424", marginLeft:3 }}>*</span>}
      </Typography>
      {children}
      {hint && <Typography variant="caption" color="text.secondary" mt={0.5} display="block">{hint}</Typography>}
    </Box>
  );
}

function CheckList({ options, selected, onChange }) {
  const toggle = (val) =>
    onChange(selected.includes(val) ? selected.filter((x) => x !== val) : [...selected, val]);
  return (
    <FormGroup>
      {options.map((o) => (
        <FormControlLabel
          key={o} control={<Checkbox size="small" checked={selected.includes(o)} onChange={() => toggle(o)} />}
          label={<Typography variant="body2">{o}</Typography>}
        />
      ))}
    </FormGroup>
  );
}

function RadioList({ options, value, onChange, name }) {
  return (
    <RadioGroup name={name} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => (
        <FormControlLabel
          key={o} value={o} control={<Radio size="small" />}
          label={<Typography variant="body2">{o}</Typography>}
        />
      ))}
    </RadioGroup>
  );
}

export default function OnboardingForm() {
  const [step, setStep]       = useState(0);
  const [form, setForm]       = useState(INIT);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const tf  = (key) => ({ fullWidth: true, size:"small", value: form[key], onChange:(e) => set(key, e.target.value) });

  const handleSubmit = async () => {
    if (!form.agreed) { setError("Please confirm the agreement before submitting."); return; }
    setLoading(true); setError("");
    try {
      await submitClientForm(form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Box sx={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f4f6fb", p:2 }}>
        <Card sx={{ maxWidth:440, width:"100%", textAlign:"center" }}>
          <CardContent sx={{ p:5 }}>
            <CheckCircleIcon sx={{ fontSize:64, color:"#0e9f6e", mb:2 }} />
            <Typography variant="h5" fontWeight={700} mb={1}>Form Submit Thayo!</Typography>
            <Typography variant="body2" color="text.secondary" lineHeight={1.8}>
              SocialFlipss team 24 kalaak ni andar tamne contact karshhe.<br />
              Koi sawaal hoy to WhatsApp karo anytime. 🙌
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const progress = ((step) / STEPS.length) * 100;

  return (
    <Box sx={{ minHeight:"100vh", background:"#f4f6fb", py:4, px:2 }}>
      {/* Header */}
      <Box sx={{ maxWidth:700, mx:"auto", mb:3, display:"flex", alignItems:"center", gap:1.5 }}>
        <Box sx={{ width:40, height:40, borderRadius:"50%", background:"#1a56db", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:14 }}>SF</Box>
        <Box>
          <Typography variant="h6" lineHeight={1}>SocialFlipss</Typography>
          <Typography variant="caption" color="text.secondary">Client Onboarding Form</Typography>
        </Box>
      </Box>

      {/* Progress */}
      <Box sx={{ maxWidth:700, mx:"auto", mb:2 }}>
        <LinearProgress variant="determinate" value={progress} sx={{ height:6, borderRadius:3, mb:1, backgroundColor:"#e5e7eb", "& .MuiLinearProgress-bar":{ backgroundColor:"#1a56db" } }} />
        <Box sx={{ display:"flex", justifyContent:"space-between" }}>
          {STEPS.map((s, i) => (
            <Typography key={s} variant="caption" sx={{ color: i === step ? "#1a56db" : i < step ? "#0e9f6e" : "#9ca3af", fontWeight: i === step ? 600 : 400, flex:1, textAlign:"center" }}>
              {s}
            </Typography>
          ))}
        </Box>
      </Box>

      {/* Card */}
      <Card sx={{ maxWidth:700, mx:"auto" }}>
        <CardContent sx={{ p: { xs:2.5, sm:4 } }}>
          <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1}>
            Step {step + 1} of {STEPS.length}
          </Typography>
          <Typography variant="h6" mt={0.25} mb={0.5}>
            {["Business Basic Information","Business Description & Audience","Social Media Goals & Services","Content Preferences & Budget","Final Details & Agreement"][step]}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {[
              "Client na business ni primary details — naam, contact, location.",
              "Tara business ne samajva maate — products, audience, USP.",
              "Current presence ane expectations — shu karvu chhe ane kyaathi sharu karvu chhe.",
              "Content style, posting frequency ane monthly budget.",
              "Final notes, preferences ane agreement.",
            ][step]}
          </Typography>

          {error && <Alert severity="error" sx={{ mb:2 }} onClose={() => setError("")}>{error}</Alert>}

          {/* ── STEP 1 ── */}
          {step === 0 && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <SField label="Business / Brand Name" required>
                    <TextField {...tf("businessName")} placeholder="e.g. Raj Motors, Desi Clinic" />
                  </SField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SField label="Owner / Contact Person" required>
                    <TextField {...tf("ownerName")} placeholder="Full name" />
                  </SField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SField label="WhatsApp / Mobile Number" required>
                    <TextField {...tf("mobile")} placeholder="+91 XXXXX XXXXX" />
                  </SField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SField label="Email Address">
                    <TextField {...tf("email")} type="email" placeholder="example@gmail.com" />
                  </SField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SField label="City / Location" required>
                    <TextField {...tf("city")} placeholder="Ahmedabad, Surat..." />
                  </SField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SField label="Industry / Business Type" required>
                    <FormControl fullWidth size="small">
                      <Select value={form.industry} onChange={(e) => set("industry", e.target.value)} displayEmpty>
                        <MenuItem value=""><em>Select industry...</em></MenuItem>
                        {INDUSTRIES.map((i) => <MenuItem key={i.value} value={i.value}>{i.label}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </SField>
                </Grid>
                <Grid item xs={12}>
                  <SField label="Website / Existing Social Media Link">
                    <TextField {...tf("website")} placeholder="https://instagram.com/yourpage" />
                  </SField>
                </Grid>
              </Grid>
            </>
          )}

          {/* ── STEP 2 ── */}
          {step === 1 && (
            <>
              <SField label="Business shu kare chhe? (2–3 lines)" required>
                <TextField {...tf("description")} multiline rows={3} placeholder="Tamara business ni brief description..." />
              </SField>
              <SField label="Target Audience" required>
                <TextField {...tf("targetAudience")} multiline rows={2} placeholder="Age group, gender, location, profession..." />
              </SField>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <SField label="Main Products / Services" required>
                    <TextField {...tf("services")} multiline rows={3} placeholder="Top 3–5 products ya services..." />
                  </SField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SField label="Competitors (if known)">
                    <TextField {...tf("competitors")} multiline rows={3} placeholder="Local ya national competitors..." />
                  </SField>
                </Grid>
              </Grid>
              <SField label="USP — Tara business ma shu special chhe?">
                <TextField {...tf("usp")} multiline rows={2} placeholder="Kem client tamne choose kare?" />
              </SField>
              <SField label="Average Monthly Revenue (optional)">
                <FormControl fullWidth size="small">
                  <Select value={form.revenue} onChange={(e) => set("revenue", e.target.value)} displayEmpty>
                    <MenuItem value=""><em>Prefer not to say</em></MenuItem>
                    {["Under ₹1 lakh","₹1 – ₹5 lakh","₹5 – ₹10 lakh","₹10 – ₹25 lakh","₹25 lakh+"].map((r) => (
                      <MenuItem key={r} value={r}>{r}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </SField>
            </>
          )}

          {/* ── STEP 3 ── */}
          {step === 2 && (
            <>
              <SField label="Kyaa platforms par active chho?" required>
                <CheckList options={PLATFORMS} selected={form.platforms} onChange={(v) => set("platforms", v)} />
              </SField>
              <Divider sx={{ my:2 }} />
              <SField label="Taro main goal shu chhe?" required>
                <RadioList options={GOALS} value={form.goal} onChange={(v) => set("goal", v)} name="goal" />
              </SField>
              <Divider sx={{ my:2 }} />
              <SField label="Kon kon si services joiye chhe?" required>
                <CheckList options={SERVICES} selected={form.selectedServices} onChange={(v) => set("selectedServices", v)} />
              </SField>
              <SField label="6 months ma shu result expect karo chho?">
                <TextField {...tf("expectations")} multiline rows={2} placeholder="Followers count, leads per month, sales target..." />
              </SField>
            </>
          )}

          {/* ── STEP 4 ── */}
          {step === 3 && (
            <>
              <SField label="Brand ni tone / vibe kevi hovi joiye?" required>
                <RadioList options={TONES} value={form.tone} onChange={(v) => set("tone", v)} name="tone" />
              </SField>
              <Divider sx={{ my:2 }} />
              <SField label="Kaevi content type prefer karo chho?">
                <CheckList options={CONTENT_TYPES} selected={form.contentTypes} onChange={(v) => set("contentTypes", v)} />
              </SField>
              <Divider sx={{ my:2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <SField label="Month ma ketla posts?">
                    <FormControl fullWidth size="small">
                      <Select value={form.postFrequency} onChange={(e) => set("postFrequency", e.target.value)} displayEmpty>
                        <MenuItem value=""><em>Select...</em></MenuItem>
                        {["8–12 posts/month","12–20 posts/month","20–30 posts/month","Daily posting"].map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </SField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SField label="Monthly marketing budget">
                    <FormControl fullWidth size="small">
                      <Select value={form.budget} onChange={(e) => set("budget", e.target.value)} displayEmpty>
                        <MenuItem value=""><em>Select...</em></MenuItem>
                        {["Under ₹5,000","₹5,000 – ₹15,000","₹15,000 – ₹30,000","₹30,000 – ₹50,000","₹50,000+"].map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </SField>
                </Grid>
              </Grid>
              <SField label="Brand colors / logo (describe karo)">
                <TextField {...tf("brandColors")} multiline rows={2} placeholder="Brand colors, fonts, logo style..." />
              </SField>
              <SField label="Competitor page / inspiration link" hint="Inspiration maate — kevi style gamti chhe te samajva.">
                <TextField {...tf("inspirationLink")} placeholder="https://instagram.com/competitorpage" />
              </SField>
            </>
          )}

          {/* ── STEP 5 ── */}
          {step === 4 && (
            <>
              <SField label="Pehla koi agency / freelancer sathe kaam karyu chhe?">
                <RadioList options={PREV_EXP} value={form.prevExp} onChange={(v) => set("prevExp", v)} name="prevExp" />
              </SField>
              <SField label="Jya vadhu kaam saru notu tyaa shu problem hati?">
                <TextField {...tf("prevProblem")} multiline rows={2} placeholder="Reason for switching..." />
              </SField>
              <Divider sx={{ my:2 }} />
              <SField label="SocialFlipss team ne contact karvano best time">
                <RadioList options={CONTACT_TIME} value={form.contactTime} onChange={(v) => set("contactTime", v)} name="contactTime" />
              </SField>
              <SField label="Reporting / updates kem leva gamshhe?">
                <RadioList options={REPORTING} value={form.reporting} onChange={(v) => set("reporting", v)} name="reporting" />
              </SField>
              <Divider sx={{ my:2 }} />
              <SField label="Koi biji important baat / expectation">
                <TextField {...tf("notes")} multiline rows={2} placeholder="Koi special requirement ya team maate notes..." />
              </SField>
              <SField label="Kai thi khaber padyu SocialFlipss badd?">
                <FormControl fullWidth size="small">
                  <Select value={form.referral} onChange={(e) => set("referral", e.target.value)} displayEmpty>
                    <MenuItem value=""><em>Select...</em></MenuItem>
                    {["Instagram / social media","Friend / family referral","Google search","Previous client","Other"].map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                  </Select>
                </FormControl>
              </SField>
              <Divider sx={{ my:2 }} />
              <FormControlLabel
                control={<Checkbox checked={form.agreed} onChange={(e) => set("agreed", e.target.checked)} />}
                label={
                  <Typography variant="body2" color="text.secondary">
                    Hu confirm karu chhu ke aapeli badhi information saachi chhe. SocialFlipss team mara data ne confidential rakhshe ane marketing purpose maate j use karashe.
                  </Typography>
                }
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Box sx={{ maxWidth:700, mx:"auto", mt:2, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <Button
          variant="outlined" onClick={() => setStep((s) => s - 1)}
          disabled={step === 0} sx={{ minWidth:100 }}
        >
          ← Back
        </Button>
        <Typography variant="caption" color="text.secondary">{step + 1} / {STEPS.length}</Typography>
        {step < STEPS.length - 1 ? (
          <Button variant="contained" onClick={() => setStep((s) => s + 1)} sx={{ minWidth:100 }}>
            Next →
          </Button>
        ) : (
          <Button
            variant="contained" color="success" onClick={handleSubmit}
            disabled={loading} sx={{ minWidth:120 }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Submit ✓"}
          </Button>
        )}
      </Box>
    </Box>
  );
}
