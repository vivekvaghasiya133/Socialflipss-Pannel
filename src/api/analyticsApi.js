import api from "./index";

// ── Analytics ─────────────────────────────────────────────────────
export const getDashboardAnalytics = () => api.get("/analytics/dashboard");

// ── Reminders ─────────────────────────────────────────────────────
export const getReminderStats = ()           => api.get("/reminders/stats");
export const getReminders     = (params)     => api.get("/reminders", { params });
export const createReminder   = (data)       => api.post("/reminders", data);
export const updateReminder   = (id, data)   => api.put(`/reminders/${id}`, data);
export const deleteReminder   = (id)         => api.delete(`/reminders/${id}`);
export const markReminderDone = (id)         => api.put(`/reminders/${id}`, { done: true });

// ── Work Logs ─────────────────────────────────────────────────────
export const getWorkLogStats = (params)      => api.get("/worklogs/stats", { params });
export const getWorkLogs     = (params)      => api.get("/worklogs", { params });
export const createWorkLog   = (data)        => api.post("/worklogs", data);
export const updateWorkLog   = (id, data)    => api.put(`/worklogs/${id}`, data);
export const deleteWorkLog   = (id)          => api.delete(`/worklogs/${id}`);
