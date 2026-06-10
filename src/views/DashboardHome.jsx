import { useAuth } from "../context/AuthContext";
import CeoDashboard from "./CeoDashboard";
import TeamDashboard from "./TeamDashboard";

export default function DashboardHome() {
  const { user } = useAuth();

  if (user?.role === "admin" || user?.role === "manager") {
    return <CeoDashboard />;
  }

  return <TeamDashboard />;
}

