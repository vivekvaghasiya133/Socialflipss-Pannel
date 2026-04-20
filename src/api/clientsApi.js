import api from "./index";

// ── Clients ───────────────────────────────────────────────────────
export const getClientStats  = ()           => api.get("/clients/stats");
export const getClients      = (params)     => api.get("/clients", { params });
export const getClientById   = (id)         => api.get(`/clients/${id}`);
export const createClient    = (data)       => api.post("/clients", data);
export const updateClient    = (id, data)   => api.put(`/clients/${id}`, data);
export const deleteClient    = (id)         => api.delete(`/clients/${id}`);

// ── Invoices ──────────────────────────────────────────────────────
export const getInvoiceStats  = ()                    => api.get("/invoices/stats");
export const getInvoices      = (params)              => api.get("/invoices", { params });
export const getInvoiceById   = (id)                  => api.get(`/invoices/${id}`);
export const createInvoice    = (data)                => api.post("/invoices", data);
export const updateInvoice    = (id, data)            => api.put(`/invoices/${id}`, data);
export const deleteInvoice    = (id)                  => api.delete(`/invoices/${id}`);
export const recordPayment    = (id, data)            => api.post(`/invoices/${id}/payment`, data);
export const deletePayment    = (invoiceId, payId)    => api.delete(`/invoices/${invoiceId}/payment/${payId}`);
