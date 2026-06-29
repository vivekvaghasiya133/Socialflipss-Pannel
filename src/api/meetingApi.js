import api from "./index";

export const getMeetings = (params) => api.get("/meetings", { params });
export const createMeeting = (data) => api.post("/meetings", data);
export const deleteMeeting = (id) => api.delete(`/meetings/${id}`);
export const uploadMeetingImage = (data) => api.post("/meetings/upload", data);
