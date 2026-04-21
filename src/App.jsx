// FINAL App.jsx — All features including shoot scheduler and client onboarding
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline, CircularProgress, Box } from "@mui/material";
import { AuthProvider, useAuth } from "./context/AuthContext";
import theme from "./theme";

import LoginPage            from "./pages/LoginPage";
import DashboardLayout      from "./components/DashboardLayout";
import DashboardHome        from "./pages/DashboardHome";
import LeadsPage            from "./pages/LeadsPage";
import LeadDetail           from "./pages/LeadDetail";           // updated with convert
import ClientsPage          from "./pages/ClientsPage";
import ClientDetail         from "./pages/ClientDetail";
import InvoicesPage         from "./pages/InvoicesPage";
import InvoiceDetail        from "./pages/InvoiceDetail";
import ProjectsPage         from "./pages/ProjectsPage";
import ProjectKanban        from "./pages/ProjectKanban";
import ContentCalendar      from "./pages/ContentCalendar";
import StaffPage            from "./pages/StaffPage";
import AttendancePage       from "./pages/AttendancePage";
import SalaryPage           from "./pages/SalaryPage";
import LeavesPage           from "./pages/LeavesPage";
import StaffLeaveForm       from "./pages/StaffLeaveForm";
import StaffCalendarView    from "./pages/StaffCalendarView";
import RemindersPage        from "./pages/RemindersPage";
import WorkLogsPage         from "./pages/WorkLogsPage";
import UsersPage            from "./pages/UsersPage";

// Public forms
import OnboardingForm       from "./pages/OnboardingForm";          // original generic form
import ClientOnboardingForm from "./pages/ClientOnboardingForm";    // NEW — lead converted form

// NEW — Shoot Scheduler
import ShootSchedulerPage   from "./pages/ShootSchedulerPage";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Box sx={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100vh" }}><CircularProgress /></Box>;
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
      {/* ── Public ── */}
      <Route path="/login"                    element={<LoginPage />} />
      <Route path="/onboard"                  element={<OnboardingForm />} />
      <Route path="/leave-form/:token"        element={<StaffLeaveForm />} />
      {/* NEW — unique client onboarding link after lead conversion */}
      <Route path="/onboard-client/:clientId" element={<ClientOnboardingForm />} />

      {/* ── Protected Admin ── */}
      <Route path="/admin" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index                          element={<DashboardHome />} />

        {/* CRM */}
        <Route path="leads"                   element={<LeadsPage />} />
        <Route path="leads/:id"               element={<LeadDetail />} />
        <Route path="clients"                 element={<ClientsPage />} />
        <Route path="clients/:id"             element={<ClientDetail />} />
        <Route path="invoices"                element={<InvoicesPage />} />
        <Route path="invoices/:id"            element={<InvoiceDetail />} />

        {/* Production */}
        <Route path="projects"                element={<ProjectsPage />} />
        <Route path="projects/:projectId"     element={<ProjectKanban />} />
        {/* NEW — shoot scheduler per project */}
        <Route path="projects/:projectId/shoot" element={<ShootSchedulerPage />} />
        <Route path="content-calendar"        element={<ContentCalendar />} />

        {/* HR */}
        <Route path="staff"                   element={<StaffPage />} />
        <Route path="staff/:id/calendar"      element={<StaffCalendarView />} />
        <Route path="attendance"              element={<AttendancePage />} />
        <Route path="salary"                  element={<SalaryPage />} />
        <Route path="leaves"                  element={<LeavesPage />} />

        {/* Tools */}
        <Route path="reminders"               element={<RemindersPage />} />
        <Route path="worklogs"                element={<WorkLogsPage />} />

        {/* Settings */}
        <Route path="users"                   element={<AdminRoute><UsersPage /></AdminRoute>} />
      </Route>

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
