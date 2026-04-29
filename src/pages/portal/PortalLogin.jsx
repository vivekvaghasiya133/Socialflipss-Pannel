import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Tab, Tabs, Alert, CircularProgress, InputAdornment, IconButton, Divider,
} from "@mui/material";
import VisibilityIcon    from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { portalLogin, portalSendOTP, portalVerifyOTP } from "../../api/portalApi";

export default function PortalLogin() {
  const navigate = useNavigate();
  const [tab, setTab]         = useState(0); // 0=password, 1=OTP
  const [step, setStep]       = useState(1); // OTP: step1=enter email, step2=enter OTP
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [info, setInfo]       = useState("");
  const [showPass, setShowPass] = useState(false);

  // Password login
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");

  // OTP login
  const [otpContact, setOtpContact] = useState(""); // email or mobile
  const [otp, setOtp]               = useState("");

  const saveAndRedirect = (data) => {
    localStorage.setItem("sf_portal_token",  data.token);
    localStorage.setItem("sf_portal_client", JSON.stringify(data.client));
    navigate("/portal");
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await portalLogin({ email, password });
      saveAndRedirect(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    setLoading(true); setError(""); setInfo("");
    const isEmail = otpContact.includes("@");
    try {
      const res = await portalSendOTP(isEmail ? { email: otpContact } : { mobile: otpContact });
      setInfo(res.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "OTP send failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true); setError("");
    const isEmail = otpContact.includes("@");
    try {
      const res = await portalVerifyOTP(isEmail ? { email: otpContact, otp } : { mobile: otpContact, otp });
      saveAndRedirect(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#f0f4ff 0%,#f9fafb 100%)", p:2,
    }}>
      <Card sx={{ width:"100%", maxWidth:420, borderRadius:3 }}>
        <CardContent sx={{ p:4 }}>
          {/* Logo */}
          <Box sx={{ textAlign:"center", mb:3 }}>
            <Box sx={{ width:52, height:52, borderRadius:"50%", background:"linear-gradient(135deg,#1a56db,#0891b2)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:18, mb:1.5 }}>
              SF
            </Box>
            <Typography variant="h5" fontWeight={700}>SocialFlipss</Typography>
            <Typography variant="body2" color="text.secondary">Client Portal</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb:2 }} onClose={()=>setError("")}>{error}</Alert>}
          {info  && <Alert severity="success" sx={{ mb:2 }}>{info}</Alert>}

          <Tabs value={tab} onChange={(_,v)=>{ setTab(v); setStep(1); setError(""); setInfo(""); }}
            variant="fullWidth" sx={{ mb:3 }}>
            <Tab label="Password Login" />
            <Tab label="OTP Login" />
          </Tabs>

          {/* Password Login */}
          {tab === 0 && (
            <Box component="form" onSubmit={handlePasswordLogin}>
              <TextField fullWidth label="Email" type="email" margin="normal" value={email}
                onChange={e=>setEmail(e.target.value)} required autoFocus />
              <TextField fullWidth label="Password" margin="normal" required
                type={showPass?"text":"password"} value={password}
                onChange={e=>setPassword(e.target.value)}
                InputProps={{ endAdornment:(
                  <InputAdornment position="end">
                    <IconButton onClick={()=>setShowPass(!showPass)} edge="end">
                      {showPass?<VisibilityOffIcon/>:<VisibilityIcon/>}
                    </IconButton>
                  </InputAdornment>
                )}}
              />
              <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt:2.5 }} disabled={loading}>
                {loading ? <CircularProgress size={22} color="inherit"/> : "Login"}
              </Button>
            </Box>
          )}

          {/* OTP Login */}
          {tab === 1 && (
            <Box>
              {step === 1 ? (
                <>
                  <TextField fullWidth label="Email or Mobile Number" margin="normal" autoFocus
                    value={otpContact} onChange={e=>setOtpContact(e.target.value)}
                    placeholder="your@email.com or 9876543210"
                    helperText="Tamara registered email ya mobile number nakho" />
                  <Button fullWidth variant="contained" size="large" sx={{ mt:2.5 }}
                    onClick={handleSendOTP} disabled={loading || !otpContact}>
                    {loading ? <CircularProgress size={22} color="inherit"/> : "Send OTP"}
                  </Button>
                </>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {otpContact} par OTP mokyun chhe.
                  </Typography>
                  <TextField fullWidth label="Enter 6-digit OTP" margin="normal" autoFocus
                    value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))}
                    inputProps={{ inputMode:"numeric", maxLength:6 }}
                    sx={{ "& input":{ fontSize:24, letterSpacing:8, textAlign:"center", fontWeight:700 } }}
                  />
                  <Button fullWidth variant="contained" size="large" sx={{ mt:2.5 }}
                    onClick={handleVerifyOTP} disabled={loading || otp.length !== 6}>
                    {loading ? <CircularProgress size={22} color="inherit"/> : "Verify & Login"}
                  </Button>
                  <Button fullWidth sx={{ mt:1 }} onClick={()=>setStep(1)}>← Change contact</Button>
                </>
              )}
            </Box>
          )}

          <Divider sx={{ my:2.5 }} />
          <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
            Access is provided by SocialFlipss team only.<br/>Contact us if you need help logging in.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
