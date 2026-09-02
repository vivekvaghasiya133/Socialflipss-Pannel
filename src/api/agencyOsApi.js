import api from "./index";

// ── PRODUCTION PIPELINE APIs ──
export const getProductionTasks = (params) => api.get("/production/tasks", { params });
export const getProductionOverview = () => api.get("/production/overview");
export const createProductionTask = (data) => api.post("/production/tasks", data);
export const updateScriptStage = (id, data) => api.put(`/production/tasks/${id}/script`, data);
export const updateShootStage = (id, data) => api.put(`/production/tasks/${id}/shoot`, data);
export const assignEditor = (id, data) => api.put(`/production/tasks/${id}/assign-editor`, data);
export const completeEdit = (id, data) => api.put(`/production/tasks/${id}/complete-edit`, data);
export const deliverTask = (id, data) => api.put(`/production/tasks/${id}/deliver`, data);
export const deleteProductionTask = (id) => api.delete(`/production/tasks/${id}`);

// ── TIME TRACKING & HRMS APIs ──
export const getTimeStatus = () => api.get("/time-tracking/status");
export const punchIn = (data) => api.post("/time-tracking/punch-in", data || {});
export const startBreak = (data) => api.post("/time-tracking/start-break", data || {});
export const endBreak = () => api.post("/time-tracking/end-break");
export const punchOut = (data) => api.post("/time-tracking/punch-out", data || {});
export const getTeamTimeOverview = (params) => api.get("/time-tracking/team-overview", { params });

// ── DYNAMIC CONFIG & NO-CODE MASTER APIs ──
export const getAgencyConfig = () => api.get("/agency-config");
export const updateBranding = (data) => api.put("/agency-config/branding", data);
export const addServicePackage = (data) => api.post("/agency-config/services", data);
export const updateServicePackage = (id, data) => api.put(`/agency-config/services/${id}`, data);
export const deleteServicePackage = (id) => api.delete(`/agency-config/services/${id}`);
export const updateRolesPermissions = (rolesPermissions) => api.put("/agency-config/roles", { rolesPermissions });
export const updateWhatsAppTemplates = (whatsAppTemplates) => api.put("/agency-config/whatsapp-templates", { whatsAppTemplates });
