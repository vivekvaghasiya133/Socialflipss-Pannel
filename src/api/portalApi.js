import axios from "axios";

const BASE = process.env.REACT_APP_API_URL || "https://socialflipss-backend.onrender.com/api";

// Client portal uses separate token
const portalApi = axios.create({ baseURL: BASE });

portalApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("sf_portal_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

portalApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("sf_portal_token");
      localStorage.removeItem("sf_portal_client");
      window.location.href = "/portal/login";
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────
export const portalLogin       = (data)        => portalApi.post("/portal/auth/login", data);
export const portalSendOTP     = (data)        => portalApi.post("/portal/auth/otp/send", data);
export const portalVerifyOTP   = (data)        => portalApi.post("/portal/auth/otp/verify", data);
export const portalGetMe       = ()            => portalApi.get("/portal/auth/me");
export const portalChangePass  = (data)        => portalApi.put("/portal/auth/change-password", data);
export const setupPortalAccess = (data)        => portalApi.post("/portal/auth/setup", data);

// ── Dashboard ─────────────────────────────────────────────────────
export const getPortalDashboard    = ()            => portalApi.get("/portal/dashboard");

// ── Content ───────────────────────────────────────────────────────
export const getPortalContent      = (params)      => portalApi.get("/portal/content", { params });
export const approvePortalContent  = (id, data)    => portalApi.put(`/portal/content/${id}/approve`, data);

// ── Invoices ──────────────────────────────────────────────────────
export const getPortalInvoices     = ()            => portalApi.get("/portal/invoices");
export const getPortalInvoiceById  = (id)          => portalApi.get(`/portal/invoices/${id}`);

// ── Shoot Schedule ────────────────────────────────────────────────
export const getPortalSchedule     = ()            => portalApi.get("/portal/shoot-schedule");

// ── Notifications ─────────────────────────────────────────────────
export const getPortalNotifications = ()           => portalApi.get("/portal/notifications");
export const markPortalNotifRead    = (id)         => portalApi.put(`/portal/notifications/${id}/read`);
export const markAllPortalNotifRead = ()           => portalApi.put("/portal/notifications/read-all");

// ── Admin: Auto Invoice ───────────────────────────────────────────
import api from "./index";
export const setupAutoInvoice    = (data)        => api.post("/auto-invoice/setup", data);
export const getAutoInvoiceConfig= (clientId)    => api.get(`/auto-invoice/${clientId}`);
export const generateAutoInvoice = (clientId)    => api.post(`/auto-invoice/generate/${clientId}`);
export const runAutoInvoices     = ()            => api.post("/auto-invoice/run-auto");
export const sendPaymentReminders= ()            => api.post("/auto-invoice/send-reminders");

// ── Admin: Notifications ──────────────────────────────────────────
export const getAdminNotifications = (params)    => api.get("/notifications", { params });
export const markAdminNotifRead    = (id)        => api.put(`/notifications/${id}/read`);
export const markAllAdminRead      = ()          => api.put("/notifications/read-all");

export default portalApi;
