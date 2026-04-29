// FINAL App.jsx — Phase 5 complete with Client Portal
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline, CircularProgress, Box } from "@mui/material";
import { AuthProvider, useAuth } from "./context/AuthContext";
import theme from "./theme";

// Admin pages
import LoginPage            from "./pages/LoginPage";
import DashboardLayout      from "./components/admin/DashboardLayout";  // Phase 5b updated
import AutoInvoicePage      from "./pages/admin/AutoInvoicePage";        // NEW Phase 5b
import ClientDetail         from "./pages/admin/ClientDetail";           // NEW Phase 5b (overrides below)
import DashboardHome        from "./pages/DashboardHome";
import LeadsPage            from "./pages/LeadsPage";
import LeadDetail           from "./pages/LeadDetail";
import ClientsPage          from "./pages/ClientsPage";
// ClientDetail imported above from pages/admin/ClientDetail
import InvoicesPage         from "./pages/InvoicesPage";
import InvoiceDetail        from "./pages/InvoiceDetail";
import ProjectsPage         from "./pages/ProjectsPage";
import ProjectKanban        from "./pages/ProjectKanban";
import ContentCalendar      from "./pages/ContentCalendar";
import StaffPage            from "./pages/StaffPage";
import AttendancePage       from "./pages/AttendancePage";
import SalaryPage           from "./pages/SalaryPage";
import LeavesPage           from "./pages/LeavesPage";
import RemindersPage        from "./pages/RemindersPage";
import WorkLogsPage         from "./pages/WorkLogsPage";
import UsersPage            from "./pages/UsersPage";

// Public
import OnboardingForm       from "./pages/OnboardingForm";
import StaffLeaveForm       from "./pages/StaffLeaveForm";
import StaffCalendarView    from "./pages/StaffCalendarView";
import ClientOnboardingForm from "./pages/ClientOnboardingForm";
import ShootSchedulerPage   from "./pages/ShootSchedulerPage";

// ── Client Portal ─────────────────────────────────────────────────
import PortalLogin          from "./pages/portal/PortalLogin";
import PortalLayout         from "./components/portal/PortalLayout";
import PortalDashboard      from "./pages/portal/PortalDashboard";
import PortalContent        from "./pages/portal/PortalContent";
import {
  PortalInvoices, PortalInvoiceDetail,
  PortalSchedule, PortalNotifications,
} from "./pages/portal/PortalPages";

// ── Auth guards ───────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Box sx={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100vh" }}><CircularProgress/></Box>;
  return user ? children : <Navigate to="/login" replace/>;
}
function AdminRoute({ children }) {
  const { user, isAdmin } = useAuth();
  if (!user)    return <Navigate to="/login" replace/>;
  if (!isAdmin) return <Navigate to="/admin" replace/>;
  return children;
}
function PortalRoute({ children }) {
  const token = localStorage.getItem("sf_portal_token");
  return token ? children : <Navigate to="/portal/login" replace/>;
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Public ── */}
            <Route path="/login"                    element={<LoginPage/>}/>
            <Route path="/onboard"                  element={<OnboardingForm/>}/>
            <Route path="/leave-form/:token"        element={<StaffLeaveForm/>}/>
            <Route path="/onboard-client/:clientId" element={<ClientOnboardingForm/>}/>

            {/* ── Client Portal ── */}
            <Route path="/portal/login" element={<PortalLogin/>}/>
            <Route path="/portal" element={<PortalRoute><PortalLayout/></PortalRoute>}>
              <Route index                        element={<PortalDashboard/>}/>
              <Route path="content"               element={<PortalContent/>}/>
              <Route path="invoices"              element={<PortalInvoices/>}/>
              <Route path="invoices/:id"          element={<PortalInvoiceDetail/>}/>
              <Route path="schedule"              element={<PortalSchedule/>}/>
              <Route path="notifications"         element={<PortalNotifications/>}/>
            </Route>

            {/* ── Admin Panel ── */}
            <Route path="/admin" element={<ProtectedRoute><DashboardLayout/></ProtectedRoute>}>
              <Route index                          element={<DashboardHome/>}/>
              <Route path="leads"                   element={<LeadsPage/>}/>
              <Route path="leads/:id"               element={<LeadDetail/>}/>
              <Route path="clients"                 element={<ClientsPage/>}/>
              <Route path="clients/:id"             element={<ClientDetail/>}/>
              <Route path="invoices"                element={<InvoicesPage/>}/>
              <Route path="invoices/:id"            element={<InvoiceDetail/>}/>
              <Route path="projects"                element={<ProjectsPage/>}/>
              <Route path="projects/:projectId"     element={<ProjectKanban/>}/>
              <Route path="projects/:projectId/shoot" element={<ShootSchedulerPage/>}/>
              <Route path="content-calendar"        element={<ContentCalendar/>}/>
              <Route path="staff"                   element={<StaffPage/>}/>
              <Route path="staff/:id/calendar"      element={<StaffCalendarView/>}/>
              <Route path="attendance"              element={<AttendancePage/>}/>
              <Route path="salary"                  element={<SalaryPage/>}/>
              <Route path="leaves"                  element={<LeavesPage/>}/>
              <Route path="reminders"               element={<RemindersPage/>}/>
              <Route path="worklogs"                element={<WorkLogsPage/>}/>
              <Route path="auto-invoice"            element={<AutoInvoicePage/>}/>
              <Route path="users"                   element={<AdminRoute><UsersPage/></AdminRoute>}/>
            </Route>

            <Route path="/"  element={<Navigate to="/admin" replace/>}/>
            <Route path="*"  element={<Navigate to="/admin" replace/>}/>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
