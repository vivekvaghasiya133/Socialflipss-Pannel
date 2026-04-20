// Add these to your frontend/src/api/index.js or hrApi.js
import api from "./index";

// ── Leads ─────────────────────────────────────────────────────────
export const getLeadStats    = ()           => api.get("/leads/stats");
export const getLeads        = (params)     => api.get("/leads", { params });
export const getLeadById     = (id)         => api.get(`/leads/${id}`);
export const createLead      = (data)       => api.post("/leads", data);
export const updateLead      = (id, data)   => api.put(`/leads/${id}`, data);
export const deleteLead      = (id)         => api.delete(`/leads/${id}`);
export const addActivity     = (id, data)   => api.post(`/leads/${id}/activity`, data);
export const deleteActivity  = (id, actId) => api.delete(`/leads/${id}/activity/${actId}`);

// ── Users (admin only) ────────────────────────────────────────────
export const getUsers        = ()           => api.get("/auth/users");
export const createUser      = (data)       => api.post("/auth/users", data);
export const updateUser      = (id, data)   => api.put(`/auth/users/${id}`, data);
export const deactivateUser  = (id)         => api.delete(`/auth/users/${id}`);
