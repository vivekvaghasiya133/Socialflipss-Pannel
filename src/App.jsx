// FINAL App.jsx — All 4 parts combined
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline, CircularProgress, Box } from "@mui/material";
import { AuthProvider, useAuth } from "./context/AuthContext";
import theme from "./theme";

// Auth & Layout
import LoginPage         from "./pages/LoginPage";
import DashboardLayout   from "./components/DashboardLayout";

// Dashboard (Part 4 — analytics)
import DashboardHome     from "./pages/DashboardHome";

// CRM (Part 1 + 2)
import LeadsPage         from "./pages/LeadsPage";
import LeadDetail        from "./pages/LeadDetail";
import ClientsPage       from "./pages/ClientsPage";
import ClientDetail      from "./pages/ClientDetail";
import InvoicesPage      from "./pages/InvoicesPage";
import InvoiceDetail     from "./pages/InvoiceDetail";

// Production (Part 3)
import ProjectsPage      from "./pages/ProjectsPage";
import ProjectKanban     from "./pages/ProjectKanban";
import ContentCalendar   from "./pages/ContentCalendar";

// HR (existing)
import StaffPage         from "./pages/StaffPage";
import AttendancePage    from "./pages/AttendancePage";
import SalaryPage        from "./pages/SalaryPage";
import LeavesPage        from "./pages/LeavesPage";
import StaffLeaveForm    from "./pages/StaffLeaveForm";
import StaffCalendarView from "./pages/StaffCalendarView";

// Part 4 — NEW
import RemindersPage     from "./pages/RemindersPage";
import WorkLogsPage      from "./pages/WorkLogsPage";

// Settings
import UsersPage         from "./pages/UsersPage";

// Public
import OnboardingForm    from "./pages/OnboardingForm";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <Box sx={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100vh" }}>
      <CircularProgress />
    </Box>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, isAdmin } = useAuth();
  if (!user)    return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/admin" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"             element={<LoginPage />} />
      <Route path="/onboard"           element={<OnboardingForm />} />
      <Route path="/leave-form/:token" element={<StaffLeaveForm />} />

      {/* Protected Admin Panel */}
      <Route path="/admin" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        {/* Dashboard */}
        <Route index                      element={<DashboardHome />} />

        {/* CRM */}
        <Route path="leads"               element={<LeadsPage />} />
        <Route path="leads/:id"           element={<LeadDetail />} />
        <Route path="clients"             element={<ClientsPage />} />
        <Route path="clients/:id"         element={<ClientDetail />} />
        <Route path="invoices"            element={<InvoicesPage />} />
        <Route path="invoices/:id"        element={<InvoiceDetail />} />

        {/* Production */}
        <Route path="projects"            element={<ProjectsPage />} />
        <Route path="projects/:id"        element={<ProjectKanban />} />
        <Route path="content-calendar"    element={<ContentCalendar />} />

        {/* HR */}
        <Route path="staff"               element={<StaffPage />} />
        <Route path="staff/:id/calendar"  element={<StaffCalendarView />} />
        <Route path="attendance"          element={<AttendancePage />} />
        <Route path="salary"              element={<SalaryPage />} />
        <Route path="leaves"              element={<LeavesPage />} />

        {/* Part 4 — NEW */}
        <Route path="reminders"           element={<RemindersPage />} />
        <Route path="worklogs"            element={<WorkLogsPage />} />

        {/* Settings */}
        <Route path="users"               element={<AdminRoute><UsersPage /></AdminRoute>} />
      </Route>

      {/* Redirects */}
      <Route path="/"  element={<Navigate to="/admin" replace />} />
      <Route path="*"  element={<Navigate to="/admin" replace />} />
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
