import api from "./index";

// ── Lead Convert ──────────────────────────────────────────────────
export const convertLeadToClient = (id, data) => api.post(`/leads/${id}/convert`, data);

// ── Client Onboarding (public - no auth) ─────────────────────────
import axios from "axios";
const BASE = process.env.REACT_APP_API_URL || "https://socialflipss-backend.onrender.com/api";
export const getOnboardingClient = (clientId)       => axios.get(`${BASE}/clients/onboard/${clientId}`);
export const submitOnboardingForm = (clientId, data) => axios.post(`${BASE}/clients/onboard/${clientId}`, data);

// ── Shoot Schedule ────────────────────────────────────────────────
export const getShootScheduleByProject = (projectId) => api.get(`/shoot-schedule/project/${projectId}`);
export const generateShootSchedule     = (data)      => api.post("/shoot-schedule/generate", data);
export const updateShootSlot           = (scheduleId, slotId, data) => api.put(`/shoot-schedule/${scheduleId}/slot/${slotId}`, data);
export const deleteShootSchedule       = (id)        => api.delete(`/shoot-schedule/${id}`);
