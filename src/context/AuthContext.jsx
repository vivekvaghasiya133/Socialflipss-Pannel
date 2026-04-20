import { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("sf_token");
    if (token) {
      api.get("/auth/me")
        .then((res) => setUser(res.data))
        .catch(() => localStorage.removeItem("sf_token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("sf_token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("sf_token");
    setUser(null);
  };

  // Role helpers
  const isAdmin   = user?.role === "admin";
  const isManager = user?.role === "manager";
  const isTeam    = user?.role === "team";
  const canManage = isAdmin || isManager; // admin or manager

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isManager, isTeam, canManage }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
