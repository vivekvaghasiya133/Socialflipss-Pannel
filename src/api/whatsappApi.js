import api from "./index";

export const getWhatsAppBotStatus = () => api.get("/whatsapp-bot/status");
export const connectWhatsAppBot = () => api.post("/whatsapp-bot/connect");
export const disconnectWhatsAppBot = () => api.post("/whatsapp-bot/disconnect");
export const sendTestWhatsAppMessage = (data) => api.post("/whatsapp-bot/send-test", data);
