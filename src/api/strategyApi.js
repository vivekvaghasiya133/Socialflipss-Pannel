import api from "./index";

export const getStrategies   = (params) => api.get("/strategies", { params });
export const getStrategyById = (id)     => api.get(`/strategies/${id}`);
export const createStrategy  = (data)   => api.post("/strategies", data);
export const updateStrategy  = (id, data) => api.put(`/strategies/${id}`, data);
export const deleteStrategy  = (id)     => api.delete(`/strategies/${id}`);
