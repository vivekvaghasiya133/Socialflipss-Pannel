import api from "./index";

// ── PRODUCTION PIPELINE APIs ──
export const getProductionTasks = (params) => api.get("/production/tasks", { params });
export const getProductionOverview = () => api.get("/production/overview");
export const createProductionTask = (data) => api.post("/production/tasks", data);

// Step 1: Script pass ➔ Shoot person assignment
export const passScriptToShoot = (id, data) => api.put(`/production/tasks/${id}/pass-script-to-shoot`, data);

// Step 2: Shoot info edit & completion
export const updateShootInfo = (id, data) => api.put(`/production/tasks/${id}/update-shoot-info`, data);
export const completeShoot = (id, data) => api.put(`/production/tasks/${id}/complete-shoot`, data);

// Step 3: Raw data link & Editor assignment (Strict Gate)
export const handoffToEdit = (id, data) => api.put(`/production/tasks/${id}/handoff-to-edit`, data);

// Step 4: Editor submits edited video link ➔ Moves to QC
export const submitEditToQc = (id, data) => api.put(`/production/tasks/${id}/submit-edit-to-qc`, data);

// Step 5: QC Decision (Changes needed ➔ Back to Edit | Approved ➔ Client Approval)
export const qcDecision = (id, data) => api.put(`/production/tasks/${id}/qc-decision`, data);

// Step 6: Client Decision (Changes needed ➔ Back to Edit | Approved ➔ Ready to Post)
export const clientDecision = (id, data) => api.put(`/production/tasks/${id}/client-decision`, data);

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

// ── STAFF ATTENDANCE HISTORY & LEAVE PORTAL ──
export const getMyTimeHistory = (params) => api.get("/time-tracking/my-history", { params });
export const getMyLeaves = () => api.get("/leaves/my-leaves");
export const applyMyLeave = (data) => api.post("/leaves/apply-my-leave", data);
