import API from "../api/axios";

// ==================== AUTH API ====================
export const authAPI = {
  login: (payload) => API.post("/auth/login", payload),
  register: (payload) => API.post("/auth/register", payload),
  logout: () => API.post("/auth/logout"),
  getProfile: () => API.get("/auth/me"),
  me: () => API.get("/auth/me"),
  updateProfile: (payload) => API.put("/auth/profile", payload),
  changePassword: (payload) => API.put("/auth/password", payload),
  getStats: () => API.get("/auth/stats"), // ✅ Make sure this exists
};

// ==================== PROJECT API ====================
export const projectAPI = {
  list: (params) => API.get("/projects", { params }),
  detail: (id) => API.get(`/projects/${id}`),
  create: (payload) => API.post("/projects", payload),
  update: (id, payload) => API.put(`/projects/${id}`, payload),
  remove: (id) => API.delete(`/projects/${id}`),
  getTeamMembers: (id) => API.get(`/projects/${id}/members`),
  addTeamMember: (id, payload) => API.post(`/projects/${id}/members`, payload),
  removeTeamMember: (id, userId) =>
    API.delete(`/projects/${id}/members/${userId}`),
};

// ==================== SPRINT API ====================
export const sprintAPI = {
  list: (projectId) => API.get(`/sprints/project/${projectId}`), // ✅ Fixed route
  detail: (id) => API.get(`/sprints/${id}`),
  create: (payload) => API.post("/sprints", payload),
  update: (id, payload) => API.put(`/sprints/${id}`, payload),
  updateStatus: (id, status) => API.put(`/sprints/${id}/status`, { status }),
  remove: (id) => API.delete(`/sprints/${id}`),
  getActive: (projectId) => API.get(`/sprints/active/${projectId}`),
  getReport: (id) => API.get(`/sprints/${id}/report`),
};

// ==================== TICKET API ====================
export const ticketAPI = {
  list: (projectId, params) =>
    API.get(`/tickets/project/${projectId}`, { params }), // ✅ Fixed route
  listBySprint: (sprintId) => API.get(`/tickets/sprint/${sprintId}`),
  detail: (id) => API.get(`/tickets/${id}`),
  search: (params) => API.get("/tickets/search", { params }),
  create: (payload) => API.post("/tickets", payload),
  update: (id, payload) => API.put(`/tickets/${id}`, payload),
  updateStatus: (id, status) => API.put(`/tickets/${id}/status`, { status }),
  remove: (id) => API.delete(`/tickets/${id}`),
  getStats: (projectId) => API.get(`/tickets/stats/${projectId}`),
};

// ==================== COMMENT API ====================
export const commentAPI = {
  list: (ticketId) => API.get(`/comments/ticket/${ticketId}`),
  create: (payload) => API.post("/comments", payload),
  update: (id, payload) => API.put(`/comments/${id}`, payload),
  remove: (id) => API.delete(`/comments/${id}`),
};

// ==================== ACTIVITY API ====================
export const activityAPI = {
  list: (projectId) => API.get(`/activities/project/${projectId}`),
  listByTicket: (ticketId) => API.get(`/activities/ticket/${ticketId}`),
};

// ==================== NOTIFICATION API ====================
export const notificationAPI = {
  list: () => API.get("/notifications"),
  getUnreadCount: () => API.get("/notifications/unread/count"),
  markRead: (id) => API.put(`/notifications/${id}/read`),
  markAllRead: () => API.put("/notifications/read-all"),
  delete: (id) => API.delete(`/notifications/${id}`),
  deleteRead: () => API.delete("/notifications/read"),
};
// ==================== ATTACHMENT API ====================
export const attachmentAPI = {
  upload: (ticketId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("ticketId", ticketId);
    return API.post("/attachments", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  remove: (id) => API.delete(`/attachments/${id}`),
};

// ==================== DASHBOARD API ====================
export const dashboardAPI = {
  get: () => API.get("/dashboard"),
  getStats: () => API.get("/dashboard/stats"),
};

// ==================== USER API ====================
export const userAPI = {
  list: () => API.get("/auth/users"),
  detail: (id) => API.get(`/auth/users/${id}`),
  update: (id, payload) => API.put(`/auth/users/${id}`, payload),
  delete: (id) => API.delete(`/auth/users/${id}`),
};
// ==================== SEARCH API ====================
export const searchAPI = {
  searchUsers: (query, params = {}) =>
    API.get(`/search/users?query=${query}`, { params }),
  searchTickets: (params) => API.get("/search/tickets", { params }),
  searchProjects: (params) => API.get("/search/projects", { params }),
  followUser: (userId) => API.post("/search/follow", { userId }),
  getFollowers: (userId) => API.get(`/search/followers/${userId || ""}`),
  getFollowing: (userId) => API.get(`/search/following/${userId || ""}`),
};


// ==================== EXPORT ALL ====================
export default API;
