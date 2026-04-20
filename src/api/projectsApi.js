import api from "./index";

// ── Projects ──────────────────────────────────────────────────────
export const getProjectStats = ()           => api.get("/projects/stats");
export const getProjects     = (params)     => api.get("/projects", { params });
export const getProjectById  = (id)         => api.get(`/projects/${id}`);
export const createProject   = (data)       => api.post("/projects", data);
export const updateProject   = (id, data)   => api.put(`/projects/${id}`, data);
export const deleteProject   = (id)         => api.delete(`/projects/${id}`);

// ── Content ───────────────────────────────────────────────────────
export const getContentStats = (params)        => api.get("/content/stats", { params });
export const getContent      = (params)        => api.get("/content", { params });
export const getContentById  = (id)            => api.get(`/content/${id}`);
export const createContent   = (data)          => api.post("/content", data);
export const updateContent   = (id, data)      => api.put(`/content/${id}`, data);
export const deleteContent   = (id)            => api.delete(`/content/${id}`);
export const addComment      = (id, text)      => api.post(`/content/${id}/comment`, { text });
export const deleteComment   = (id, commentId) => api.delete(`/content/${id}/comment/${commentId}`);
