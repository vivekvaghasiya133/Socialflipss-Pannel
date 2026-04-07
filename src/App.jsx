import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline, CircularProgress, Box } from "@mui/material";
import { AuthProvider, useAuth } from "./context/AuthContext";
import theme from "./theme";

import LoginPage       from "./pages/LoginPage";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome   from "./pages/DashboardHome";
import ClientsPage     from "./pages/ClientsPage";
import ClientDetail    from "./pages/ClientDetail";
import OnboardingForm  from "./pages/OnboardingForm";

function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return (
    <Box sx={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100vh" }}>
      <CircularProgress />
    </Box>
  );
  return admin ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/onboard"  element={<OnboardingForm />} />

      {/* Protected admin panel */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index           element={<DashboardHome />} />
        <Route path="clients"  element={<ClientsPage />} />
        <Route path="clients/:id" element={<ClientDetail />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
