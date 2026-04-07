import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, InputAdornment, IconButton, CircularProgress,
} from "@mui/material";
import VisibilityIcon     from "@mui/icons-material/Visibility";
import VisibilityOffIcon  from "@mui/icons-material/VisibilityOff";
import { loginAdmin }     from "../api";
import { useAuth }        from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm]     = useState({ email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginAdmin(form);
      login(res.data.token, res.data.admin);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg, #1a56db11 0%, #f4f6fb 100%)",
      p:2,
    }}>
      <Card sx={{ width:"100%", maxWidth:400 }}>
        <CardContent sx={{ p:4 }}>
          {/* Logo */}
          <Box sx={{ textAlign:"center", mb:4 }}>
            <Box sx={{
              width:52, height:52, borderRadius:"50%", background:"#1a56db",
              display:"inline-flex", alignItems:"center", justifyContent:"center",
              color:"#fff", fontWeight:700, fontSize:18, mb:1.5,
            }}>SF</Box>
            <Typography variant="h5">SocialFlipss</Typography>
            <Typography variant="body2" color="text.secondary">Admin Panel Login</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Email" type="email" margin="normal"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required autoFocus
            />
            <TextField
              fullWidth label="Password" margin="normal"
              type={showPass ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(!showPass)} edge="end">
                      {showPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit" fullWidth variant="contained" size="large"
              sx={{ mt:3 }} disabled={loading}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : "Login"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
