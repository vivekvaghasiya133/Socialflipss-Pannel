"use client";

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

const TRANSLATIONS = {
  en: {
    steps: ["Business Info", "Goals & Services", "Content Preferences", "Final Details"],
    invalidLink: "Invalid Link",
    invalidLinkDesc: "This link is invalid. Please contact the administrator.",
    alreadyComplete: "Onboarding Already Complete!",
    alreadyCompleteDesc: "Your onboarding is already complete. The SocialFlipss team will contact you soon.",
    completeTitle: "Onboarding Complete! 🎉",
    completeDesc: (businessName) => `${businessName} — your onboarding has been successfully submitted! The SocialFlipss team will contact you within 24 hours. Welcome to the family! 🙌`,
    clientOnboarding: "Client Onboarding",
    welcome: (name, business) => `Welcome, ${name} — ${business}`,
    stepOf: (step, total) => `Step ${step} of ${total}`,
    agreementText: "I confirm that all information provided is accurate and SocialFlipss will keep it confidential.",
    agreementError: "Please accept the agreement to submit.",
    back: "← Back",
    next: "Next →",
    submit: "Submit ✓",
    saving: "Submitting...",
    
    // Step 0: Business Info
    step0Title: "Business Information",
    step0Desc: "Please provide the basic details of your business.",
    emailLabel: "Email Address",
    emailPlaceholder: "example@gmail.com",
    cityLabel: "City",
    cityPlaceholder: "Surat, Ahmedabad...",
    industryLabel: "Industry",
    industryPlaceholder: "Restaurant, Healthcare...",
    websiteLabel: "Website URL",
    websitePlaceholder: "https://...",
    instagramLabel: "Instagram Page",
    instagramPlaceholder: "@yourpage",
    descriptionLabel: "What does your business do?",
    descriptionPlaceholder: "Provide a brief description of your business...",
    audienceLabel: "Target Audience",
    audiencePlaceholder: "Describe your ideal clients (Age, gender, location...)",
    servicesLabel: "Main Services / Products offered",
    servicesPlaceholder: "List your top 3-5 services...",
    competitorsLabel: "Key Competitors",
    competitorsPlaceholder: "List local or major competitors...",
    uspLabel: "USP — What makes your business special?",
    uspPlaceholder: "Why should clients choose you over competitors?",
    
    // Step 1: Goals & Services
    step1Title: "Goals & Services",
    step1Desc: "Select your social media goals and the services you need.",
    platformsLabel: "Which platforms are you active on?",
    platformsOptions: ["Instagram", "Facebook", "YouTube", "Google Business Profile", "LinkedIn", "No presence yet"],
    goalsLabel: "What is your main goal?",
    goalsOptions: [
      "Increase brand awareness",
      "Generate leads / inquiries",
      "Build followers / community",
      "Sell products / services directly",
      "Build personal branding"
    ],
    servicesOptions: [
      "Social Media Management",
      "SEO",
      "Google Ads",
      "Meta Ads",
      "Content Creation",
      "Personal Branding",
      "Website Design"
    ],
    budgetLabel: "Monthly Budget",
    budgetPlaceholder: "Select budget range...",
    budgetOptions: ["Under ₹5k", "₹5k–₹15k", "₹15k–₹30k", "₹30k–₹50k", "₹50k+"],
    frequencyLabel: "Posting Frequency",
    frequencyPlaceholder: "Select frequency...",
    frequencyOptions: ["8–12 posts/month", "12–20 posts/month", "20–30 posts/month", "Daily"],
    
    // Step 2: Content Preferences
    step2Title: "Content Preferences",
    step2Desc: "Tell us about your content style and brand preferences.",
    toneLabel: "What is your brand's tone / vibe?",
    toneOptions: [
      "Professional / Corporate",
      "Friendly / Conversational",
      "Fun / Trendy / Youthful",
      "Educational / Informative",
      "Inspirational / Motivational"
    ],
    contentTypesLabel: "Content type preferences",
    contentTypesOptions: [
      "Reels / Short videos",
      "Static posts / Carousels",
      "Stories",
      "Testimonials / Reviews",
      "Behind the Scenes",
      "Before-After results"
    ],
    colorsLabel: "Brand colors / Logo details (Describe)",
    colorsPlaceholder: "Preferred colors, fonts, style ideas...",
    inspirationLabel: "Inspiration / References",
    inspirationPlaceholder: "Competitor profile links or reference URLs...",
    
    // Step 3: Final Details
    step3Title: "Final Details & Preferences",
    step3Desc: "Specify final notes, communication, and agreement.",
    prevExpLabel: "Have you worked with a marketing agency before?",
    prevExpOptions: [
      "No, this is my first time",
      "Yes, and it was a good experience",
      "Yes, but it was a poor experience"
    ],
    contactTimeLabel: "Best time for contact / meetings",
    contactTimeOptions: ["Morning (9 AM – 12 PM)", "Afternoon (12 PM – 4 PM)", "Evening (4 PM – 8 PM)"],
    reportingLabel: "Reporting preference",
    reportingOptions: ["Weekly WhatsApp updates", "Monthly PDF reports", "Video call presentations"],
    notesLabel: "Any other important notes or details?",
    notesPlaceholder: "Any special requirements or instructions..."
  },
  gu: {
    steps: ["વેપારની માહિતી", "ધ્યેય અને સેવાઓ", "કન્ટેન્ટ પસંદગી", "અંતિમ વિગતો"],
    invalidLink: "અમાન્ય લિંક",
    invalidLinkDesc: "આ લિંક અમાન્ય છે. કૃપા કરીને એડમિનનો સંપર્ક કરો.",
    alreadyComplete: "ઓનબોર્ડિંગ પહેલેથી પૂર્ણ છે!",
    alreadyCompleteDesc: "તમારું ઓનબોર્ડિંગ પહેલેથી પૂર્ણ થઈ ગયું છે. SocialFlipss ટીમ જલ્દી તમારો સંપર્ક કરશે.",
    completeTitle: "ઓનબોર્ડિંગ પૂર્ણ! 🎉",
    completeDesc: (businessName) => `${businessName} — તમારું ઓનબોર્ડિંગ સફળતાપૂર્વક સબમિટ થઈ ગયું છે! SocialFlipss ટીમ ૨૪ કલાકમાં તમારો સંપર્ક કરશે. પરિવારમાં આપનું સ્વાગત છે! 🙌`,
    clientOnboarding: "ક્લાયન્ટ ઓનબોર્ડિંગ",
    welcome: (name, business) => `સ્વાગત છે, ${name} — ${business}`,
    stepOf: (step, total) => `પગલું ${step} માંથી ${total}`,
    agreementText: "હું પુષ્ટિ કરું છું કે આપેલી બધી માહિતી સાચી છે અને SocialFlipss મારા ડેટાને ગુપ્ત રાખશે.",
    agreementError: "મહેરબાની કરીને સબમિટ કરવા માટે સંમતિ સ્વીકારો.",
    back: "← પાછા",
    next: "આગળ →",
    submit: "સબમિટ કરો ✓",
    saving: "સબમિટ થઈ રહ્યું છે...",
    
    // Step 0: Business Info
    step0Title: "વેપાર વિષે માહિતી",
    step0Desc: "કૃપા કરીને તમારા વેપારની પાયાની વિગતો આપો.",
    emailLabel: "ઈમેલ આઈડી",
    emailPlaceholder: "example@gmail.com",
    cityLabel: "શહેર",
    cityPlaceholder: "સુરત, અમદાવાદ...",
    industryLabel: "ઉદ્યોગ / વેપારનો પ્રકાર",
    industryPlaceholder: "રેસ્ટોરન્ટ, હેલ્થકેર...",
    websiteLabel: "વેબસાઈટ લિંક",
    websitePlaceholder: "https://...",
    instagramLabel: "ઇન્સ્ટાગ્રામ પેજ",
    instagramPlaceholder: "@yourpage",
    descriptionLabel: "તમારો વ્યવસાય શું કામ કરે છે?",
    descriptionPlaceholder: "તમારા વ્યવસાયનું ટૂંકું વર્ણન આપો...",
    audienceLabel: "લક્ષિત ગ્રાહકો (Target Audience)",
    audiencePlaceholder: "તમારા આદર્શ ગ્રાહકો કેવા છે? (ઉંમર, લિંગ, સ્થાન...)",
    servicesLabel: "મુખ્ય સેવાઓ / પ્રોડક્ટ્સ",
    servicesPlaceholder: "તમારી મુખ્ય ૩-૫ સેવાઓ લખો...",
    competitorsLabel: "હરીફો (Competitors)",
    competitorsPlaceholder: "તમારા સ્થાનિક કે મુખ્ય હરીફોના નામ લખો...",
    uspLabel: "USP — તમારા વ્યવસાયની खासિયત શું છે?",
    uspPlaceholder: "ગ્રાહકો બીજાની જગ્યાએ તમને કેમ પસંદ કરે?",
    
    // Step 1: Goals & Services
    step1Title: "ધ્યેય અને સેવાઓ",
    step1Desc: "તમારા સોશિયલ મીડિયા ધ્યેયો અને જરૂરી સેવાઓ પસંદ કરો.",
    platformsLabel: "તમે કયા પ્લેટફોર્મ પર એક્ટિવ છો?",
    platformsOptions: ["Instagram", "Facebook", "YouTube", "Google Business Profile", "LinkedIn", "No presence yet"], // Use English keys for storage, but we display them
    goalsLabel: "તમારો મુખ્ય ધ્યેય શું છે?",
    goalsOptions: [
      "Brand awareness vadharvanu chhe",
      "Leads / inquiries generate karvani chhe",
      "Followers / community banavvanu chhe",
      "Product / service directly vechavu chhe",
      "Personal branding karvanu chhe"
    ],
    servicesOptions: [
      "Social media management",
      "SEO",
      "Google Ads",
      "Meta Ads",
      "Content creation",
      "Personal branding",
      "Website design"
    ],
    budgetLabel: "માસિક બજેટ",
    budgetPlaceholder: "બજેટ રેન્જ પસંદ કરો...",
    budgetOptions: ["Under ₹5k", "₹5k–₹15k", "₹15k–₹30k", "₹30k–₹50k", "₹50k+"],
    frequencyLabel: "પોસ્ટિંગ ફ્રીક્વન્સી (આવર્તન)",
    frequencyPlaceholder: "પોસ્ટ્સની સંખ્યા પસંદ કરો...",
    frequencyOptions: ["8–12 posts/month", "12–20 posts/month", "20–30 posts/month", "Daily"],
    
    // Step 2: Content Preferences
    step2Title: "કન્ટેન્ટ પસંદગી",
    step2Desc: "તમારા બ્રાન્ડની શૈલી અને કન્ટેન્ટ પસંદગીઓ વિષે જણાવો.",
    toneLabel: "બ્રાન્ડનો ટોન / વાઇબ કેવો રાખવો છે?",
    toneOptions: [
      "Professional / corporate",
      "Friendly / conversational",
      "Fun / trendy / youthful",
      "Educational / informative",
      "Inspirational / motivational"
    ],
    contentTypesLabel: "કયા પ્રકારનું કન્ટેન્ટ પસંદ કરશો?",
    contentTypesOptions: [
      "Reels / short videos",
      "Static posts / carousel",
      "Stories",
      "Testimonials / reviews",
      "Behind the scenes",
      "Before–after results"
    ],
    colorsLabel: "બ્રાન્ડ કલર્સ / લોગોની વિગતો (વર્ણન કરો)",
    colorsPlaceholder: "પસંદગીના રંગો, ફોન્ટ્સ, શૈલીના વિચારો...",
    inspirationLabel: "પ્રેરણા લિંક્સ / રેફરન્સ (Inspiration)",
    inspirationPlaceholder: "હરીફ પેજ અથવા કોઈપણ સંદર્ભ લિંક્સ...",
    
    // Step 3: Final Details
    step3Title: "અંતિમ વિગતો અને પસંદગીઓ",
    step3Desc: "અંતિમ નોંધો, સંપર્ક સમય અને સંમતિ પત્ર.",
    prevExpLabel: "શું તમે પહેલાં કોઈ માર્કેટિંગ એજન્સી સાથે કામ કર્યું છે?",
    prevExpOptions: [
      "Nai, pehli var chhu",
      "Haa — saru anubhav",
      "Haa — saru notu"
    ],
    contactTimeLabel: "મીટિંગ / સંપર્ક કરવા માટેનો ઉત્તમ સમય",
    contactTimeOptions: ["Morning 9–12", "Afternoon 12–4", "Evening 4–8"],
    reportingLabel: "રિપોર્ટિંગ પસંદગી",
    reportingOptions: ["Weekly WhatsApp", "Monthly PDF", "Video call"],
    notesLabel: "કોઈ અન્ય મહત્વની વિગતો અથવા નોંધ?",
    notesPlaceholder: "કોઈ વિશેષ જરૂરિયાતો અથવા સૂચનાઓ..."
  }
};

const DISPLAY_OPTIONS = {
  en: {
    platforms: ["Instagram", "Facebook", "YouTube", "Google Business Profile", "LinkedIn", "No presence yet"],
    goals: ["Increase brand awareness", "Generate leads / inquiries", "Build followers / community", "Sell products / services directly", "Build personal branding"],
    services: ["Social Media Management", "SEO", "Google Ads", "Meta Ads", "Content Creation", "Personal Branding", "Website Design"],
    budget: ["Under ₹5k", "₹5k–₹15k", "₹15k–₹30k", "₹30k–₹50k", "₹50k+"],
    frequency: ["8–12 posts/month", "12–20 posts/month", "20–30 posts/month", "Daily"],
    tone: ["Professional / Corporate", "Friendly / Conversational", "Fun / Trendy / Youthful", "Educational / Informative", "Inspirational / Motivational"],
    contentTypes: ["Reels / Short videos", "Static posts / Carousels", "Stories", "Testimonials / Reviews", "Behind the Scenes", "Before-After results"],
    prevExp: ["No, this is my first time", "Yes, and it was a good experience", "Yes, but it was a poor experience"],
    contactTime: ["Morning (9 AM – 12 PM)", "Afternoon (12 PM – 4 PM)", "Evening (4 PM – 8 PM)"],
    reporting: ["Weekly WhatsApp updates", "Monthly PDF reports", "Video call presentations"]
  },
  gu: {
    platforms: ["ઇન્સ્ટાગ્રામ", "ફેસબુક", "યુટ્યુબ", "ગૂગલ બિઝનેસ પ્રોફાઇલ", "લિંક્ડઇન", "હજુ સુધી કોઈ હાજરી નથી"],
    goals: ["બ્રાન્ડ જાગૃતિ (Awareness) વધારવી છે", "લીડ્સ / પૂછપરછ (Inquiries) મેળવવી છે", "ફોલોઅર્સ / કોમ્યુનિટી બનાવવી છે", "પ્રોડક્ટ્સ / સેવાઓ સીધી વેચવી છે", "પર્સનલ બ્રાન્ડિંગ કરવું છે"],
    services: ["સોશિયલ મીડિયા મેનેજમેન્ટ", "SEO", "ગૂગલ એડ્સ", "મેટા (ફેસબુક) એડ્સ", "કન્ટેન્ટ ક્રિએશન", "પર્સનલ બ્રાન્ડિંગ", "વેબસાઇટ ડિઝાઇન"],
    budget: ["₹5k થી ઓછું", "₹5k–₹15k", "₹15k–₹30k", "₹30k–₹50k", "₹50k+"],
    frequency: ["8–12 પોસ્ટ્સ/મહિનો", "12–20 પોસ્ટ્સ/મહિનો", "20–30 પોસ્ટ્સ/મહિનો", "દરરોજ (Daily)"],
    tone: ["પ્રોફેશનલ / કોર્પોરેટ", "ફ્રેન્ડલી / વાતચીત જેવો", "મનોરંજક / ટ્રેન્ડી / યુવા", "શિક્ષણપ્રદ / માહિતીપ્રદ", "પ્રેરણાદાયી / ઉત્સાહ વધારનાર"],
    contentTypes: ["રીલ્સ / ટૂંકી વિડિઓઝ", "સ્ટેટિક પોસ્ટ્સ / કેરોયુઝલ", "સ્ટોરીઝ", "ગ્રાહકોના અભિપ્રાયો (Testimonials)", "બિહાઇન્ડ ધ સિન્સ (પડદા પાછળનું)", "પહેલા-પછીનું પરિણામ (Before-After)"],
    prevExp: ["ના, આ મારી પહેલી વાર છે", "હા, અને સારો અનુભવ હતો", "હા, પણ અનુભવ સારો ન હતો"],
    contactTime: ["સવારે (9 AM – 12 PM)", "બપોરે (12 PM – 4 PM)", "સાંજે (4 PM – 8 PM)"],
    reporting: ["દર અઠવાડિયે વોટ્સએપ અપડેટ્સ", "માસિક પીડીએફ રિપોર્ટ્સ", "વિડિઓ કોલ પ્રેઝન્ટેશન"]
  }
};

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

function CheckList({ options, labels, selected, onChange }) {
  const toggle = (v) => onChange(selected.includes(v) ? selected.filter(x=>x!==v) : [...selected,v]);
  return (
    <FormGroup>
      {options.map((o, idx) => (
        <FormControlLabel key={o} control={<Checkbox size="small" checked={selected.includes(o)} onChange={()=>toggle(o)} />}
          label={<Typography variant="body2">{labels[idx] || o}</Typography>} />
      ))}
    </FormGroup>
  );
}

function RadioList({ options, labels, value, onChange, name }) {
  return (
    <RadioGroup name={name} value={value} onChange={e=>onChange(e.target.value)}>
      {options.map((o, idx) => (
        <FormControlLabel key={o} value={o} control={<Radio size="small" />}
          label={<Typography variant="body2">{labels[idx] || o}</Typography>} />
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
  
  // Language State
  const [lang, setLang]         = useState("gu");

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

  const t = TRANSLATIONS[lang];
  const d = DISPLAY_OPTIONS[lang];

  const handleSubmit = async () => {
    if (!form.agreed) { setError(t.agreementError); return; }
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

  const progress = ((step) / t.steps.length) * 100;

  if (loading) return <Box sx={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f4f6fb" }}><CircularProgress /></Box>;

  if (notFound) return (
    <Box sx={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f4f6fb", p:2 }}>
      <Card sx={{ maxWidth:420, textAlign:"center" }}>
        <CardContent sx={{ p:4 }}>
          <Typography variant="h6" color="error" mb={1}>{t.invalidLink}</Typography>
          <Typography variant="body2" color="text.secondary">{t.invalidLinkDesc}</Typography>
        </CardContent>
      </Card>
    </Box>
  );

  if (alreadyDone) return (
    <Box sx={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f4f6fb", p:2 }}>
      <Card sx={{ maxWidth:440, textAlign:"center" }}>
        <CardContent sx={{ p:5 }}>
          <CheckCircleIcon sx={{ fontSize:56, color:"#0e9f6e", mb:2 }} />
          <Typography variant="h5" fontWeight={700} mb={1}>{t.alreadyComplete}</Typography>
          <Typography variant="body2" color="text.secondary">{t.alreadyCompleteDesc}</Typography>
        </CardContent>
      </Card>
    </Box>
  );

  if (submitted) return (
    <Box sx={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f4f6fb", p:2 }}>
      <Card sx={{ maxWidth:460, textAlign:"center" }}>
        <CardContent sx={{ p:5 }}>
          <CheckCircleIcon sx={{ fontSize:64, color:"#0e9f6e", mb:2 }} />
          <Typography variant="h5" fontWeight={700} mb={1}>{t.completeTitle}</Typography>
          <Typography variant="body2" color="text.secondary" lineHeight={1.8}>
            {t.completeDesc(client?.business)}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Box sx={{ minHeight:"100vh", background:"#f4f6fb", py:4, px:2 }}>
      {/* Header */}
      <Box sx={{ maxWidth:620, mx:"auto", mb:3, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <Box sx={{ display:"flex", alignItems:"center", gap:1.5 }}>
          <Box sx={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#1a56db,#0891b2)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:14 }}>SF</Box>
          <Box>
            <Typography variant="h6" lineHeight={1}>SocialFlipss</Typography>
            <Typography variant="caption" color="text.secondary">{t.clientOnboarding}</Typography>
          </Box>
        </Box>

        {/* Language Selector */}
        <Box sx={{ display:"flex", gap:0.5, bgcolor:"#e2e8f0", p:0.5, borderRadius:1.5 }}>
          <Button
            size="small"
            onClick={() => setLang("gu")}
            sx={{
              px:1.5, py:0.5, minWidth:0, fontSize:11, borderRadius:1,
              bgcolor: lang === "gu" ? "#fff" : "transparent",
              color: lang === "gu" ? "#1a56db" : "text.secondary",
              fontWeight: 600,
              boxShadow: lang === "gu" ? 1 : 0,
              textTransform: "none",
              "&:hover": { bgcolor: lang === "gu" ? "#fff" : "transparent" }
            }}
          >
            ગુજરાતી
          </Button>
          <Button
            size="small"
            onClick={() => setLang("en")}
            sx={{
              px:1.5, py:0.5, minWidth:0, fontSize:11, borderRadius:1,
              bgcolor: lang === "en" ? "#fff" : "transparent",
              color: lang === "en" ? "#1a56db" : "text.secondary",
              fontWeight: 600,
              boxShadow: lang === "en" ? 1 : 0,
              textTransform: "none",
              "&:hover": { bgcolor: lang === "en" ? "#fff" : "transparent" }
            }}
          >
            English
          </Button>
        </Box>
      </Box>

      {/* Welcome chip */}
      <Box sx={{ maxWidth:620, mx:"auto", mb:2 }}>
        <Chip label={t.welcome(client?.name, client?.business)} color="primary" variant="outlined" />
      </Box>

      {/* Progress */}
      <Box sx={{ maxWidth:620, mx:"auto", mb:2 }}>
        <LinearProgress variant="determinate" value={progress}
          sx={{ height:5, borderRadius:3, mb:1, bgcolor:"#e5e7eb", "& .MuiLinearProgress-bar":{ bgcolor:"#1a56db" } }} />
        <Box sx={{ display:"flex", justifyContent:"space-between" }}>
          {t.steps.map((s,i) => (
            <Typography key={s} variant="caption" sx={{ color: i===step?"#1a56db":i<step?"#0e9f6e":"#9ca3af", fontWeight:i===step?600:400, flex:1, textAlign:"center" }}>
              {s}
            </Typography>
          ))}
        </Box>
      </Box>

      <Card sx={{ maxWidth:620, mx:"auto" }}>
        <CardContent sx={{ p:{ xs:2.5, sm:4 } }}>
          <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1}>{t.stepOf(step+1, t.steps.length)}</Typography>
          <Typography variant="h6" mt={0.25} mb={0.5}>
            {step === 0 && t.step0Title}
            {step === 1 && t.step1Title}
            {step === 2 && t.step2Title}
            {step === 3 && t.step3Title}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {step === 0 && t.step0Desc}
            {step === 1 && t.step1Desc}
            {step === 2 && t.step2Desc}
            {step === 3 && t.step3Desc}
          </Typography>

          {error && <Alert severity="error" sx={{ mb:2 }} onClose={()=>setError("")}>{error}</Alert>}

          {/* STEP 1 */}
          {step===0 && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><SField label={t.emailLabel}><TextField {...tf("email")} type="email" placeholder={t.emailPlaceholder} /></SField></Grid>
                <Grid item xs={12} sm={6}><SField label={t.cityLabel}><TextField {...tf("city")} placeholder={t.cityPlaceholder} /></SField></Grid>
                <Grid item xs={12} sm={6}><SField label={t.industryLabel}><TextField {...tf("industry")} placeholder={t.industryPlaceholder} /></SField></Grid>
                <Grid item xs={12} sm={6}><SField label={t.websiteLabel}><TextField {...tf("website")} placeholder={t.websitePlaceholder} /></SField></Grid>
                <Grid item xs={12} sm={6}><SField label={t.instagramLabel}><TextField {...tf("instagramPage")} placeholder={t.instagramPlaceholder} /></SField></Grid>
              </Grid>
              <SField label={t.descriptionLabel} required>
                <TextField {...tf("description")} multiline rows={3} placeholder={t.descriptionPlaceholder} />
              </SField>
              <SField label={t.audienceLabel}><TextField {...tf("targetAudience")} multiline rows={2} placeholder={t.audiencePlaceholder} /></SField>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><SField label={t.servicesLabel} required><TextField {...tf("services")} multiline rows={2} placeholder={t.servicesPlaceholder} /></SField></Grid>
                <Grid item xs={12} sm={6}><SField label={t.competitorsLabel}><TextField {...tf("competitors")} multiline rows={2} placeholder={t.competitorsPlaceholder} /></SField></Grid>
              </Grid>
              <SField label={t.uspLabel}><TextField {...tf("usp")} multiline rows={2} placeholder={t.uspPlaceholder} /></SField>
            </>
          )}

          {/* STEP 2 */}
          {step===1 && (
            <>
              <SField label={t.platformsLabel} required>
                <CheckList options={TRANSLATIONS.gu.platformsOptions} labels={d.platforms} selected={form.platforms} onChange={v=>set("platforms",v)} />
              </SField>
              <Divider sx={{ my:2 }} />
              <SField label={t.goalsLabel} required>
                <RadioList options={TRANSLATIONS.gu.goalsOptions} labels={d.goals} value={form.goal} onChange={v=>set("goal",v)} name="goal" />
              </SField>
              <Divider sx={{ my:2 }} />
              <SField label={lang === "en" ? "Which services do you need?" : "કઈ કઈ સેવાઓ જોઈએ છે?"}>
                <CheckList options={TRANSLATIONS.gu.servicesOptions} labels={d.services} selected={form.services?.split(",")||[]} onChange={v=>set("services",v.join(","))} />
              </SField>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <SField label={t.budgetLabel}>
                    <FormControl fullWidth size="small">
                      <Select value={form.budget||""} onChange={e=>set("budget",e.target.value)} displayEmpty>
                        <MenuItem value=""><em>{lang === "en" ? "Select..." : "પસંદ કરો..."}</em></MenuItem>
                        {TRANSLATIONS.gu.budgetOptions.map((b, idx)=><MenuItem key={b} value={b}>{d.budget[idx]}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </SField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SField label={t.frequencyLabel}>
                    <FormControl fullWidth size="small">
                      <Select value={form.postFrequency||""} onChange={e=>set("postFrequency",e.target.value)} displayEmpty>
                        <MenuItem value=""><em>{lang === "en" ? "Select..." : "પસંદ કરો..."}</em></MenuItem>
                        {TRANSLATIONS.gu.frequencyOptions.map((p, idx)=><MenuItem key={p} value={p}>{d.frequency[idx]}</MenuItem>)}
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
              <SField label={t.toneLabel} required>
                <RadioList options={TRANSLATIONS.gu.toneOptions} labels={d.tone} value={form.tone} onChange={v=>set("tone",v)} name="tone" />
              </SField>
              <Divider sx={{ my:2 }} />
              <SField label={t.contentTypesLabel}>
                <CheckList options={TRANSLATIONS.gu.contentTypesOptions} labels={d.contentTypes} selected={form.contentTypes} onChange={v=>set("contentTypes",v)} />
              </SField>
              <SField label={t.colorsLabel}><TextField {...tf("brandColors")} multiline rows={2} placeholder={t.colorsPlaceholder} /></SField>
              <SField label={t.inspirationLabel}><TextField {...tf("inspirationLink")} placeholder={t.inspirationPlaceholder} /></SField>
            </>
          )}

          {/* STEP 4 */}
          {step===3 && (
            <>
              <SField label={t.prevExpLabel}>
                <RadioList options={TRANSLATIONS.gu.prevExpOptions} labels={d.prevExp} value={form.prevExp} onChange={v=>set("prevExp",v)} name="prev" />
              </SField>
              <SField label={t.contactTimeLabel}>
                <RadioList options={TRANSLATIONS.gu.contactTimeOptions} labels={d.contactTime} value={form.contactTime} onChange={v=>set("contactTime",v)} name="ct" />
              </SField>
              <SField label={t.reportingLabel}>
                <RadioList options={TRANSLATIONS.gu.reportingOptions} labels={d.reporting} value={form.reporting} onChange={v=>set("reporting",v)} name="rep" />
              </SField>
              <SField label={t.notesLabel}>
                <TextField {...tf("notes")} multiline rows={2} placeholder={t.notesPlaceholder} />
              </SField>
              <Divider sx={{ my:2 }} />
              <FormControlLabel
                control={<Checkbox checked={form.agreed} onChange={e=>set("agreed",e.target.checked)} />}
                label={<Typography variant="body2" color="text.secondary">{t.agreementText}</Typography>}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Box sx={{ maxWidth:620, mx:"auto", mt:2, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <Button variant="outlined" onClick={()=>setStep(s=>s-1)} disabled={step===0} sx={{ minWidth:100 }}>{t.back}</Button>
        <Typography variant="caption" color="text.secondary">{step+1} / {t.steps.length}</Typography>
        {step < t.steps.length-1
          ? <Button variant="contained" onClick={()=>setStep(s=>s+1)} sx={{ minWidth:100 }}>{t.next}</Button>
          : <Button variant="contained" color="success" onClick={handleSubmit} disabled={saving} sx={{ minWidth:120 }}>
              {saving ? t.saving : t.submit}
            </Button>
        }
      </Box>
    </Box>
  );
}
