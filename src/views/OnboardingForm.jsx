"use client";

import { useState } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Select, MenuItem, FormControl, InputLabel, Checkbox,
  FormControlLabel, FormGroup, Radio, RadioGroup,
  Divider, Alert, CircularProgress, Grid, LinearProgress, Chip
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { submitClientForm } from "../api";

const TRANSLATIONS = {
  en: {
    steps: ["Basic Info", "Business Details", "Goals & Services", "Content & Budget", "Final Details"],
    completeTitle: "Form Submitted Successfully! 🎉",
    completeDesc: "Thank you! The SocialFlipss team will contact you within 24 hours to discuss your marketing strategy. 🙌",
    formTitle: "Business Inquiry Form",
    formSubtitle: "Tell us about your brand and requirements",
    stepOf: (step, total) => `Step ${step} of ${total}`,
    agreementText: "I confirm that all information provided is accurate and SocialFlipss will keep it confidential.",
    agreementError: "Please accept the agreement to submit.",
    back: "← Back",
    next: "Next →",
    submit: "Submit Inquiry ✓",
    saving: "Submitting...",
    
    // Step 0: Basic Info
    step0Title: "Business Basic Information",
    step0Desc: "Please enter your brand's primary details — name, contact, location.",
    businessLabel: "Business / Brand Name",
    businessPlaceholder: "e.g. Raj Motors, Desi Clinic",
    ownerLabel: "Owner / Contact Person",
    ownerPlaceholder: "Full name",
    mobileLabel: "WhatsApp / Mobile Number",
    mobilePlaceholder: "+91 XXXXX XXXXX",
    emailLabel: "Email Address",
    emailPlaceholder: "example@gmail.com",
    cityLabel: "City / Location",
    cityPlaceholder: "Ahmedabad, Surat...",
    industryLabel: "Industry / Business Type",
    industryPlaceholder: "Select industry...",
    websiteLabel: "Website / Existing Social Media Link",
    websitePlaceholder: "https://instagram.com/yourpage",
    
    // Step 1: Business Details
    step1Title: "Business Description & Audience",
    step1Desc: "Help us understand your business — products, audience, USP.",
    descriptionLabel: "What does your business do? (2-3 lines)",
    descriptionPlaceholder: "Brief description of your business...",
    audienceLabel: "Target Audience",
    audiencePlaceholder: "Describe your ideal clients (Age group, gender, location, profession...)",
    servicesLabel: "Main Products / Services offered",
    servicesPlaceholder: "Top 3-5 products or services...",
    competitorsLabel: "Key Competitors (if known)",
    competitorsPlaceholder: "Local or major competitors...",
    uspLabel: "USP — What makes your business special?",
    uspPlaceholder: "Why should clients choose you over competitors?",
    revenueLabel: "Average Monthly Revenue (optional)",
    revenuePlaceholder: "Prefer not to say",
    
    // Step 2: Goals & Services
    step2Title: "Social Media Goals & Services",
    step2Desc: "Tell us about your current online presence and marketing goals.",
    platformsLabel: "Which platforms are you active on?",
    goalsLabel: "What is your main marketing goal?",
    servicesOptionsLabel: "Which services are you interested in?",
    expectationsLabel: "What results do you expect in 6 months?",
    expectationsPlaceholder: "Followers count, leads per month, sales target...",
    
    // Step 3: Content & Budget
    step3Title: "Content Preferences & Budget",
    step3Desc: "Specify your preferred content style, frequency, and monthly budget.",
    toneLabel: "What is your brand's preferred tone / vibe?",
    contentTypesLabel: "Which content types do you prefer?",
    frequencyLabel: "Posting Frequency",
    frequencyPlaceholder: "Select frequency...",
    budgetLabel: "Monthly Marketing Budget",
    budgetPlaceholder: "Select budget range...",
    colorsLabel: "Preferred brand colors / Logo (describe)",
    colorsPlaceholder: "Colors, fonts, logo style ideas...",
    inspirationLabel: "Competitor page / Inspiration links",
    inspirationPlaceholder: "Competitor profile links or reference URLs...",
    
    // Step 4: Final Details
    step4Title: "Final Details & Agreement",
    step4Desc: "Provide final details, preferences, and submit your inquiry.",
    prevExpLabel: "Have you worked with a marketing agency / freelancer before?",
    prevProblemLabel: "If you had a poor experience before, what was the main issue?",
    prevProblemPlaceholder: "Reason for switching or previous complaints...",
    contactTimeLabel: "Best time for the SocialFlipss team to contact you",
    reportingLabel: "How do you prefer to receive updates / reports?",
    notesLabel: "Any other important notes or expectations?",
    notesPlaceholder: "Any special requirements or notes for our team...",
    referralLabel: "How did you hear about SocialFlipss?",
    referralPlaceholder: "Select source..."
  },
  gu: {
    steps: ["મૂળભૂત માહિતી", "વ્યવસાયની વિગતો", "ધ્યેય અને સેવાઓ", "કન્ટેન્ટ અને બજેટ", "અંતિમ વિગતો"],
    completeTitle: "ફોર્મ સફળતાપૂર્વક સબમિટ થયું! 🎉",
    completeDesc: "આભાર! તમારી માર્કેટિંગ વ્યૂહરચના અંગે ચર્ચા કરવા માટે SocialFlipss ટીમ ૨૪ કલાકની અંદર તમારો સંપર્ક કરશે. 🙌",
    formTitle: "વ્યવસાય પૂછપરછ પત્રક",
    formSubtitle: "તમારી બ્રાન્ડ અને જરૂરિયાતો વિશે અમને જણાવો",
    stepOf: (step, total) => `પગલું ${step} માંથી ${total}`,
    agreementText: "હું પુષ્ટિ કરું છું કે આપેલી બધી માહિતી સાચી છે અને SocialFlipss મારા ડેટાને ગુપ્ત રાખશે.",
    agreementError: "મહેરબાની કરીને સબમિટ કરવા માટે સંમતિ સ્વીકારો.",
    back: "← પાછા",
    next: "આગળ →",
    submit: "પૂછપરછ સબમિટ કરો ✓",
    saving: "સબમિટ થઈ રહ્યું છે...",
    
    // Step 0: Basic Info
    step0Title: "વ્યવસાયની પ્રાથમિક વિગતો",
    step0Desc: "તમારી બ્રાન્ડની મુખ્ય વિગતો દાખલ કરો — નામ, સંપર્ક, સ્થાન.",
    businessLabel: "વ્યવસાય / બ્રાન્ડનું નામ",
    businessPlaceholder: "દા.ત. રાજ મોટર્સ, દેશી ક્લિનિક",
    ownerLabel: "માલિક / સંપર્ક વ્યક્તિ",
    ownerPlaceholder: "આખું નામ",
    mobileLabel: "WhatsApp / મોબાઈલ નંબર",
    mobilePlaceholder: "+91 XXXXX XXXXX",
    emailLabel: "ઈમેલ આઈડી",
    emailPlaceholder: "example@gmail.com",
    cityLabel: "શહેર / સ્થાન",
    cityPlaceholder: "સુરત, અમદાવાદ...",
    industryLabel: "ઉદ્યોગ / વ્યવસાયનો પ્રકાર",
    industryPlaceholder: "ઉદ્યોગ પસંદ કરો...",
    websiteLabel: "વેબસાઇટ / ઇન્સ્ટાગ્રામ લિંક",
    websitePlaceholder: "https://instagram.com/yourpage",
    
    // Step 1: Business Details
    step1Title: "વ્યવસાયનું વર્ણન અને ગ્રાહકો",
    step1Desc: "તમારા વ્યવસાયને સમજવામાં અમારી મદદ કરો — ઉત્પાદનો, ગ્રાહકો, USP.",
    descriptionLabel: "તમારો વ્યવસાય શું કામ કરે છે? (૨-૩ લાઈન)",
    descriptionPlaceholder: "તમારા વ્યવસાયનું ટૂંકું વર્ણન લખો...",
    audienceLabel: "લક્ષિત ગ્રાહકો (Target Audience)",
    audiencePlaceholder: "તમારા આદર્શ ગ્રાહકો કેવા છે? (ઉંમર, લિંગ, સ્થાન, વ્યવસાય...)",
    servicesLabel: "મુખ્ય સેવાઓ / ઉત્પાદનો (Products)",
    servicesPlaceholder: "તમારી મુખ્ય ૩-૫ પ્રોડક્ટ્સ કે સેવાઓ લખો...",
    competitorsLabel: "હરીફો (Competitors)",
    competitorsPlaceholder: "સ્થાનિક કે મુખ્ય હરીફોના નામ લખો...",
    uspLabel: "USP — તમારા વ્યવસાયની ખાસિયત શું છે?",
    uspPlaceholder: "ગ્રાહકો બીજાની જગ્યાએ તમને કેમ પસંદ કરે?",
    revenueLabel: "સરેરાશ માસિક આવક (વૈકલ્પિક)",
    revenuePlaceholder: "જાહેર કરવા નથી માંગતા",
    
    // Step 2: Goals & Services
    step2Title: "સોશિયલ મીડિયા ધ્યેય અને સેવાઓ",
    step2Desc: "તમારી વર્તમાન ઓનલાઇન હાજરી અને માર્કેટિંગ ધ્યેયો જણાવો.",
    platformsLabel: "તમે કયા પ્લેટફોર્મ પર એક્ટિવ છો?",
    goalsLabel: "તમારો મુખ્ય માર્કેટિંગ ધ્યેય શું છે?",
    servicesOptionsLabel: "તમને કઈ સેવાઓમાં રસ છે?",
    expectationsLabel: "૬ મહિનામાં તમે કેવા પરિણામની અપેક્ષા રાખો છો?",
    expectationsPlaceholder: "ફોલોઅર્સની સંખ્યા, દર મહિને લીડ્સ, વેચાણનો ટાર્ગેટ...",
    
    // Step 3: Content & Budget
    step3Title: "કન્ટેન્ટ પસંદગી અને બજેટ",
    step3Desc: "તમારા બ્રાન્ડની શૈલી, ફ્રીક્વન્સી અને માસિક બજેટ નક્કી કરો.",
    toneLabel: "બ્રાન્ડનો ટોન / વાઇબ કેવો રાખવો છે?",
    contentTypesLabel: "કયા પ્રકારનું કન્ટેન્ટ પસંદ કરશો?",
    frequencyLabel: "પોસ્ટિંગ ફ્રીક્વન્સી (આવર્તન)",
    frequencyPlaceholder: "પોસ્ટ્સની સંખ્યા પસંદ કરો...",
    budgetLabel: "માસિક માર્કેટિંગ બજેટ",
    budgetPlaceholder: "બજેટ રેન્જ પસંદ કરો...",
    colorsLabel: "પસંદગીના રંગો / લોગો (વર્ણન કરો)",
    colorsPlaceholder: "બ્રાન્ડ કલર્સ, ફોન્ટ્સ, લોગો શૈલી...",
    inspirationLabel: "હરીફ પેજ / પ્રેરણા લિંક્સ (Inspiration)",
    inspirationPlaceholder: "હરીફ પેજ અથવા કોઈપણ સંદર્ભ લિંક્સ...",
    
    // Step 4: Final Details
    step4Title: "અંતિમ વિગતો અને સંમતિ પત્ર",
    step4Desc: "અંતિમ નોંધો, સંપર્ક કરવા માટેનો સમય અને સબમિટ કરો.",
    prevExpLabel: "શું તમે પહેલાં કોઈ માર્કેટિંગ એજન્સી / ફ્રીલાન્સર સાથે કામ કર્યું છે?",
    prevProblemLabel: "જો ભૂતકાળમાં અનુભવ સારો ન હતો, તો મુખ્ય સમસ્યા શું હતી?",
    prevProblemPlaceholder: "બદલવાનું કારણ અથવા અગાઉની ફરિયાદો...",
    contactTimeLabel: "SocialFlipss ટીમ સંપર્ક કરે તેના માટે ઉત્તમ સમય",
    reportingLabel: "તમે અપડેટ્સ / રિપોર્ટિંગ કેવી રીતે મેળવવા માંગો છો?",
    notesLabel: "કોઈ અન્ય મહત્વની વિગતો અથવા અપેક્ષાઓ?",
    notesPlaceholder: "અમારી ટીમ માટે કોઈ વિશેષ જરૂરિયાતો અથવા નોંધ...",
    referralLabel: "તમને SocialFlipss વિશે ક્યાંથી ખબર પડી?",
    referralPlaceholder: "પસંદ કરો..."
  }
};

const DISPLAY_OPTIONS = {
  en: {
    industries: [
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
    ],
    platforms: ["Instagram", "Facebook", "YouTube", "Google Business Profile", "LinkedIn", "No presence yet"],
    goals: ["Increase brand awareness", "Generate leads / inquiries", "Build followers / community", "Sell products / services directly", "Build personal branding"],
    services: ["Social Media Management", "SEO", "Google Ads / Meta Ads", "Content Creation (Shooting)", "Personal Branding", "Website Design"],
    revenue: ["Under ₹1 lakh", "₹1 – ₹5 lakh", "₹5 – ₹10 lakh", "₹10 – ₹25 lakh", "₹25 lakh+"],
    budget: ["Under ₹5,000", "₹5,000 – ₹15,000", "₹15,000 – ₹30,000", "₹30,000 – ₹50,000", "₹50,000+"],
    frequency: ["8–12 posts/month", "12–20 posts/month", "20–30 posts/month", "Daily posting"],
    tone: ["Professional / Corporate", "Friendly / Conversational", "Fun / Trendy / Youthful", "Educational / Informative", "Inspirational / Motivational"],
    contentTypes: ["Reels / Short videos", "Static posts / Carousels", "Stories", "Testimonials / Reviews", "Behind the Scenes", "Before-After results"],
    prevExp: ["No, this is my first time", "Yes, and it was a good experience", "Yes, but it was a poor experience"],
    contactTime: ["Morning (9 AM – 12 PM)", "Afternoon (12 PM – 4 PM)", "Evening (4 PM – 8 PM)"],
    reporting: ["Weekly WhatsApp updates", "Monthly PDF reports", "Video call presentations", "As needed"],
    referral: ["Instagram / social media", "Friend / family referral", "Google search", "Previous client", "Other"]
  },
  gu: {
    industries: [
      { value: "healthcare",  label: "હેલ્થકેર / ક્લિનિક / ડૉક્ટર" },
      { value: "retail",      label: "રિટેલ / દુકાન" },
      { value: "restaurant",  label: "રેસ્ટોરન્ટ / ફૂડ" },
      { value: "realestate",  label: "રિયલ એસ્ટેટ" },
      { value: "education",   label: "શિક્ષણ / કોચિંગ" },
      { value: "automobile",  label: "ઓટોમોબાઇલ / મોટર પાર્ટ્સ" },
      { value: "fashion",     label: "ફેશન / કપડાં" },
      { value: "beauty",      label: "બ્યુટી / સલૂન" },
      { value: "finance",     label: "ફાઇનાન્સ / વીમો" },
      { value: "other",       label: "અન્ય" },
    ],
    platforms: ["ઇન્સ્ટાગ્રામ", "ફેસબુક", "યુટ્યુબ", "ગૂગલ બિઝનેસ પ્રોફાઇલ", "લિંક્ડઇન", "હજુ સુધી કોઈ હાજરી નથી"],
    goals: ["બ્રાન્ડ જાગૃતિ (Awareness) વધારવી છે", "લીડ્સ / પૂછપરછ (Inquiries) મેળવવી છે", "ફોલોઅર્સ / કોમ્યુનિટી બનાવવી છે", "પ્રોડક્ટ્સ / સેવાઓ સીધી વેચવી છે", "પર્સનલ બ્રાન્ડિંગ કરવું છે"],
    services: ["સોશિયલ મીડિયા મેનેજમેન્ટ", "SEO", "ગૂગલ એડ્સ / ફેસબુક એડ્સ", "કન્ટેન્ટ ક્રિએશન (શૂટિંગ)", "પર્સનલ બ્રાન્ડિંગ", "વેબસાઇટ ડિઝાઇન"],
    revenue: ["₹૧ લાખથી ઓછી", "₹૧ – ₹૫ લાખ", "₹૫ – ₹૧૦ લાખ", "₹૧૦ – ₹૨૫ લાખ", "₹૨૫ લાખથી વધુ"],
    budget: ["₹૫,૦૦૦ થી ઓછું", "₹૫,૦૦૦ – ₹૧૫,૦૦૦", "₹૧૫,૦૦૦ – ₹૩૦,૦૦૦", "₹૩૦,૦૦૦ – ₹૫૦,૦૦૦", "₹૫૦,૦૦૦+"],
    frequency: ["8–12 પોસ્ટ્સ/મહિનો", "12–20 પોસ્ટ્સ/મહિનો", "20–30 પોસ્ટ્સ/મહિનો", "દરરોજ પોસ્ટિંગ"],
    tone: ["પ્રોફેશનલ / કોર્પોરેટ", "ફ્રેન્ડલી / વાતચીત જેવો", "મનોરંજક / ટ્રેન્ડી / યુવા", "શિક્ષણપ્રદ / માહિતીપ્રદ", "પ્રેરણાદાયી / ઉત્સાહ વધારનાર"],
    contentTypes: ["રીલ્સ / ટૂંકી વિડિઓઝ", "સ્ટેટિક પોસ્ટ્સ / કેરોયુઝલ", "સ્ટોરીઝ", "ગ્રાહકોના અભિપ્રાયો (Testimonials)", "બિહાઇન્ડ ધ સિન્સ (પડદા પાછળનું)", "પહેલા-પછીનું પરિણામ (Before-After)"],
    prevExp: ["ના, આ મારી પહેલી વાર છે", "હા, અને સારો અનુભવ હતો", "હા, પણ અનુભવ સારો ન હતો"],
    contactTime: ["સવારે (9 AM – 12 PM)", "બપોરે (12 PM – 4 PM)", "સાંજે (4 PM – 8 PM)"],
    reporting: ["દર અઠવાડિયે વોટ્સએપ અપડેટ્સ", "માસિક પીડીએફ રિપોર્ટ્સ", "વિડિઓ કોલ પ્રેઝન્ટેશન", "જરૂરિયાત મુજબ"],
    referral: ["ઇન્સ્ટાગ્રામ / સોશિયલ મીડિયા", "મિત્ર / પરિવાર સંદર્ભ", "ગૂગલ સર્ચ", "અગાઉના ગ્રાહક", "અન્ય"]
  }
};

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

function CheckList({ options, labels, selected, onChange }) {
  const toggle = (val) =>
    onChange(selected.includes(val) ? selected.filter((x) => x !== val) : [...selected, val]);
  return (
    <FormGroup>
      {options.map((o, idx) => (
        <FormControlLabel
          key={o} control={<Checkbox size="small" checked={selected.includes(o)} onChange={() => toggle(o)} />}
          label={<Typography variant="body2">{labels[idx] || o}</Typography>}
        />
      ))}
    </FormGroup>
  );
}

function RadioList({ options, labels, value, onChange, name }) {
  return (
    <RadioGroup name={name} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o, idx) => (
        <FormControlLabel
          key={o} value={o} control={<Radio size="small" />}
          label={<Typography variant="body2">{labels[idx] || o}</Typography>}
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
  const [lang, setLang]       = useState("gu");

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const tf  = (key) => ({ fullWidth: true, size:"small", value: form[key], onChange:(e) => set(key, e.target.value) });

  const t = TRANSLATIONS[lang];
  const d = DISPLAY_OPTIONS[lang];

  const handleSubmit = async () => {
    if (!form.agreed) { setError(t.agreementError); return; }
    setLoading(true); setError("");

    // Map referral to source enum
    let source = "other";
    const refLower = String(form.referral || "").toLowerCase();
    if (refLower.includes("instagram") || refLower.includes("social")) source = "instagram";
    else if (refLower.includes("facebook")) source = "facebook";
    else if (refLower.includes("referral") || refLower.includes("friend")) source = "referral";
    else if (refLower.includes("google")) source = "google";

    // Combine services into interestedServices array
    const interestedServices = [...(form.selectedServices || [])];
    if (form.services) {
      interestedServices.push(form.services);
    }

    // Combine all detailed answers into the notes string
    const notesSummary = `
Business Description: ${form.description || "N/A"}
Target Audience: ${form.targetAudience || "N/A"}
USP: ${form.usp || "N/A"}
Average Revenue: ${form.revenue || "N/A"}
Active Platforms: ${(form.platforms || []).join(", ") || "None"}
Main Goal: ${form.goal || "N/A"}
Expectations (6 Months): ${form.expectations || "N/A"}
Brand Tone/Vibe: ${form.tone || "N/A"}
Content Preferences: ${(form.contentTypes || []).join(", ") || "None"}
Posting Frequency: ${form.postFrequency || "N/A"}
Brand Colors/Logo: ${form.brandColors || "N/A"}
Inspiration Link: ${form.inspirationLink || "N/A"}
Previous Agency Experience: ${form.prevExp || "N/A"}
Previous Agency Problems: ${form.prevProblem || "N/A"}
Best Contact Time: ${form.contactTime || "N/A"}
Reporting Preference: ${form.reporting || "N/A"}
Additional Notes: ${form.notes || "None"}
Referral: ${form.referral || "N/A"}
`;

    const payload = {
      businessName: form.businessName,
      contactName: form.ownerName,
      mobile: form.mobile,
      email: form.email || undefined,
      city: form.city,
      industry: form.industry,
      source,
      interestedServices,
      budget: form.budget || "",
      notes: notesSummary.trim(),
    };

    try {
      await submitClientForm(payload);
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
            <Typography variant="h5" fontWeight={700} mb={1}>{t.completeTitle}</Typography>
            <Typography variant="body2" color="text.secondary" lineHeight={1.8}>
              {t.completeDesc}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const progress = ((step) / t.steps.length) * 100;

  return (
    <Box sx={{ minHeight:"100vh", background:"#f4f6fb", py:4, px:2 }}>
      {/* Header */}
      <Box sx={{ maxWidth:700, mx:"auto", mb:3, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <Box sx={{ display:"flex", alignItems:"center", gap:1.5 }}>
          <Box sx={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#1a56db,#0891b2)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:14 }}>SF</Box>
          <Box>
            <Typography variant="h6" lineHeight={1}>SocialFlipss</Typography>
            <Typography variant="caption" color="text.secondary">{t.formTitle}</Typography>
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

      {/* Progress */}
      <Box sx={{ maxWidth:700, mx:"auto", mb:2 }}>
        <LinearProgress variant="determinate" value={progress} sx={{ height:6, borderRadius:3, mb:1, backgroundColor:"#e5e7eb", "& .MuiLinearProgress-bar":{ backgroundColor:"#1a56db" } }} />
        <Box sx={{ display:"flex", justifyContent:"space-between" }}>
          {t.steps.map((s, i) => (
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
            {t.stepOf(step + 1, t.steps.length)}
          </Typography>
          <Typography variant="h6" mt={0.25} mb={0.5}>
            {step === 0 && t.step0Title}
            {step === 1 && t.step1Title}
            {step === 2 && t.step2Title}
            {step === 3 && t.step3Title}
            {step === 4 && t.step4Title}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {step === 0 && t.step0Desc}
            {step === 1 && t.step1Desc}
            {step === 2 && t.step2Desc}
            {step === 3 && t.step3Desc}
            {step === 4 && t.step4Desc}
          </Typography>

          {error && <Alert severity="error" sx={{ mb:2 }} onClose={() => setError("")}>{error}</Alert>}

          {/* ── STEP 1 ── */}
          {step === 0 && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <SField label={t.businessLabel} required>
                    <TextField {...tf("businessName")} placeholder={t.businessPlaceholder} />
                  </SField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SField label={t.ownerLabel} required>
                    <TextField {...tf("ownerName")} placeholder={t.ownerPlaceholder} />
                  </SField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SField label={t.mobileLabel} required>
                    <TextField {...tf("mobile")} placeholder={t.mobilePlaceholder} />
                  </SField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SField label={t.emailLabel}>
                    <TextField {...tf("email")} type="email" placeholder={t.emailPlaceholder} />
                  </SField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SField label={t.cityLabel} required>
                    <TextField {...tf("city")} placeholder={t.cityPlaceholder} />
                  </SField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SField label={t.industryLabel} required>
                    <FormControl fullWidth size="small">
                      <Select value={form.industry} onChange={(e) => set("industry", e.target.value)} displayEmpty>
                        <MenuItem value=""><em>{t.industryPlaceholder}</em></MenuItem>
                        {d.industries.map((i) => <MenuItem key={i.value} value={i.value}>{i.label}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </SField>
                </Grid>
                <Grid item xs={12}>
                  <SField label={t.websiteLabel}>
                    <TextField {...tf("website")} placeholder={t.websitePlaceholder} />
                  </SField>
                </Grid>
              </Grid>
            </>
          )}

          {/* ── STEP 2 ── */}
          {step === 1 && (
            <>
              <SField label={t.descriptionLabel} required>
                <TextField {...tf("description")} multiline rows={3} placeholder={t.descriptionPlaceholder} />
              </SField>
              <SField label={t.audienceLabel} required>
                <TextField {...tf("targetAudience")} multiline rows={2} placeholder={t.audiencePlaceholder} />
              </SField>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <SField label={t.servicesLabel} required>
                    <TextField {...tf("services")} multiline rows={3} placeholder={t.servicesPlaceholder} />
                  </SField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SField label={t.competitorsLabel}>
                    <TextField {...tf("competitors")} multiline rows={3} placeholder={t.competitorsPlaceholder} />
                  </SField>
                </Grid>
              </Grid>
              <SField label={t.uspLabel}>
                <TextField {...tf("usp")} multiline rows={2} placeholder={t.uspPlaceholder} />
              </SField>
              <SField label={t.revenueLabel}>
                <FormControl fullWidth size="small">
                  <Select value={form.revenue} onChange={(e) => set("revenue", e.target.value)} displayEmpty>
                    <MenuItem value=""><em>{t.revenuePlaceholder}</em></MenuItem>
                    {TRANSLATIONS.gu.revenueOptions.map((r, idx) => (
                      <MenuItem key={r} value={r}>{d.revenue[idx]}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </SField>
            </>
          )}

          {/* ── STEP 3 ── */}
          {step === 2 && (
            <>
              <SField label={t.platformsLabel} required>
                <CheckList options={TRANSLATIONS.gu.platformsOptions} labels={d.platforms} selected={form.platforms} onChange={(v) => set("platforms", v)} />
              </SField>
              <Divider sx={{ my:2 }} />
              <SField label={t.goalsLabel} required>
                <RadioList options={TRANSLATIONS.gu.goalsOptions} labels={d.goals} value={form.goal} onChange={(v) => set("goal", v)} name="goal" />
              </SField>
              <Divider sx={{ my:2 }} />
              <SField label={t.servicesOptionsLabel} required>
                <CheckList options={TRANSLATIONS.gu.servicesOptions} labels={d.services} selected={form.selectedServices} onChange={(v) => set("selectedServices", v)} />
              </SField>
              <SField label={t.expectationsLabel}>
                <TextField {...tf("expectations")} multiline rows={2} placeholder={t.expectationsPlaceholder} />
              </SField>
            </>
          )}

          {/* ── STEP 4 ── */}
          {step === 3 && (
            <>
              <SField label={t.toneLabel} required>
                <RadioList options={TRANSLATIONS.gu.toneOptions} labels={d.tone} value={form.tone} onChange={(v) => set("tone", v)} name="tone" />
              </SField>
              <Divider sx={{ my:2 }} />
              <SField label={t.contentTypesLabel}>
                <CheckList options={TRANSLATIONS.gu.contentTypesOptions} labels={d.contentTypes} selected={form.contentTypes} onChange={(v) => set("contentTypes", v)} />
              </SField>
              <Divider sx={{ my:2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <SField label={t.frequencyLabel}>
                    <FormControl fullWidth size="small">
                      <Select value={form.postFrequency} onChange={(e) => set("postFrequency", e.target.value)} displayEmpty>
                        <MenuItem value=""><em>{lang === "en" ? "Select..." : "પસંદ કરો..."}</em></MenuItem>
                        {TRANSLATIONS.gu.frequencyOptions.map((p, idx) => <MenuItem key={p} value={p}>{d.frequency[idx]}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </SField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SField label={t.budgetLabel}>
                    <FormControl fullWidth size="small">
                      <Select value={form.budget} onChange={(e) => set("budget", e.target.value)} displayEmpty>
                        <MenuItem value=""><em>{lang === "en" ? "Select..." : "પસંદ કરો..."}</em></MenuItem>
                        {TRANSLATIONS.gu.budgetOptions.map((b, idx) => <MenuItem key={b} value={b}>{d.budget[idx]}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </SField>
                </Grid>
              </Grid>
              <SField label={t.colorsLabel}>
                <TextField {...tf("brandColors")} multiline rows={2} placeholder={t.colorsPlaceholder} />
              </SField>
              <SField label={t.inspirationLabel} hint={lang === "en" ? "To help us understand your design style." : "ડિઝાઇન શૈલી સમજવામાં મદદ માટે લિંક્સ."}>
                <TextField {...tf("inspirationLink")} placeholder={t.inspirationPlaceholder} />
              </SField>
            </>
          )}

          {/* ── STEP 5 ── */}
          {step === 4 && (
            <>
              <SField label={t.prevExpLabel}>
                <RadioList options={TRANSLATIONS.gu.prevExpOptions} labels={d.prevExp} value={form.prevExp} onChange={(v) => set("prevExp", v)} name="prevExp" />
              </SField>
              <SField label={t.prevProblemLabel}>
                <TextField {...tf("prevProblem")} multiline rows={2} placeholder={t.prevProblemPlaceholder} />
              </SField>
              <Divider sx={{ my:2 }} />
              <SField label={t.contactTimeLabel}>
                <RadioList options={TRANSLATIONS.gu.contactTimeOptions} labels={d.contactTime} value={form.contactTime} onChange={(v) => set("contactTime", v)} name="contactTime" />
              </SField>
              <SField label={t.reportingLabel}>
                <RadioList options={TRANSLATIONS.gu.reportingOptions} labels={d.reporting} value={form.reporting} onChange={(v) => set("reporting", v)} name="reporting" />
              </SField>
              <Divider sx={{ my:2 }} />
              <SField label={t.notesLabel}>
                <TextField {...tf("notes")} multiline rows={2} placeholder={t.notesPlaceholder} />
              </SField>
              <SField label={t.referralLabel}>
                <FormControl fullWidth size="small">
                  <Select value={form.referral} onChange={(e) => set("referral", e.target.value)} displayEmpty>
                    <MenuItem value=""><em>{t.referralPlaceholder}</em></MenuItem>
                    {TRANSLATIONS.gu.referralOptions.map((r, idx) => <MenuItem key={r} value={r}>{d.referral[idx]}</MenuItem>)}
                  </Select>
                </FormControl>
              </SField>
              <Divider sx={{ my:2 }} />
              <FormControlLabel
                control={<Checkbox checked={form.agreed} onChange={(e) => set("agreed", e.target.checked)} />}
                label={<Typography variant="body2" color="text.secondary">{t.agreementText}</Typography>}
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
          {t.back}
        </Button>
        <Typography variant="caption" color="text.secondary">{step + 1} / {t.steps.length}</Typography>
        {step < t.steps.length - 1 ? (
          <Button variant="contained" onClick={() => setStep((s) => s + 1)} sx={{ minWidth:100 }}>
            {t.next}
          </Button>
        ) : (
          <Button
            variant="contained" color="success" onClick={handleSubmit}
            disabled={loading} sx={{ minWidth:120 }}
          >
            {loading ? t.saving : t.submit}
          </Button>
        )}
      </Box>
    </Box>
  );
}
