import api from "./index";

// ── Staff ─────────────────────────────────────────────────────────
export const getStaff             = (params)         => api.get("/staff", { params });
export const getStaffById         = (id)             => api.get(`/staff/${id}`);
export const createStaff          = (data)           => api.post("/staff", data);
export const updateStaff          = (id, d)          => api.put(`/staff/${id}`, d);
export const deactivateStaff      = (id)             => api.delete(`/staff/${id}`);

// ── Attendance ────────────────────────────────────────────────────
export const getAttendance        = (params)         => api.get("/attendance", { params });
export const markAttendance       = (data)           => api.post("/attendance/mark", data);
export const bulkMarkAttendance   = (data)           => api.post("/attendance/bulk-mark", data);
export const getAttendanceSummary = (month)          => api.get("/attendance/summary", { params: { month } });
export const getSalarySlip        = (staffId, month) => api.get(`/attendance/slip/${staffId}`, { params: { month } });

// ── Leaves ────────────────────────────────────────────────────────
export const getLeaves            = (params)         => api.get("/leaves", { params });
export const applyLeave           = (data)           => api.post("/leaves", data);
export const updateLeave          = (id, d)          => api.put(`/leaves/${id}`, d);
export const deleteLeave          = (id)             => api.delete(`/leaves/${id}`);