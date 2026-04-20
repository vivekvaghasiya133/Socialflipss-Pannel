import axios from "axios";

const api = axios.create({
  // baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  baseURL: process.env.REACT_APP_API_URL || "https://socialflipss-backend.onrender.com/api",
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sf_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If 401 received, logout automatically
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("sf_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────
export const loginAdmin = (data) => api.post("/auth/login", data);
export const getMe = () => api.get("/auth/me");
export const changePassword = (data) => api.put("/auth/change-password", data);

// ── Clients ───────────────────────────────────────
export const submitClientForm = (data) => api.post("/clients/submit", data);
export const getClients = (params) => api.get("/clients", { params });
export const getClientStats = () => api.get("/clients/stats");
export const getClientById = (id) => api.get(`/clients/${id}`);
export const updateClient = (id, data) => api.put(`/clients/${id}`, data);
export const deleteClient = (id) => api.delete(`/clients/${id}`);

export default api;
