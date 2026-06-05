import api from "./index";

export const getHisabStats          = ()           => api.get("/hisab/stats");
export const getHisabPasswordStatus = ()           => api.get("/hisab/password/status");
export const verifyHisabPassword    = (password)   => api.post("/hisab/password/verify", { password });
export const setHisabPassword       = (data)       => api.post("/hisab/password/set", data); // password, currentPassword
export const createHisabTransaction = (data)       => api.post("/hisab/transaction", data);
export const deleteHisabTransaction = (id)         => api.delete(`/hisab/transaction/${id}`);
