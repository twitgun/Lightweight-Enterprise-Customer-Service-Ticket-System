import http from './http'

export const api = {
  // 认证
  login: (data) => http.post('/auth/login', data),
  register: (data) => http.post('/auth/register', data),
  me: () => http.get('/auth/me'),
  // 分类
  categories: () => http.get('/categories'),
  allCategories: () => http.get('/categories/all'),
  createCategory: (data) => http.post('/categories', data),
  updateCategory: (id, data) => http.put(`/categories/${id}`, data),
  deleteCategory: (id) => http.delete(`/categories/${id}`),
  // 工单
  tickets: (params) => http.get('/tickets', { params }),
  staffFeed: () => http.get('/tickets/staff-feed'),
  ticket: (id) => http.get(`/tickets/${id}`),
  createTicket: (data) => http.post('/tickets', data),
  replyTicket: (id, content) => http.post(`/tickets/${id}/messages`, { content }),
  updateTicketStatus: (id, data) => http.put(`/tickets/${id}/status`, data),
  assignTicket: (id, staffId) => http.put(`/tickets/${id}/assign`, { staffId }),
  confirmTicket: (id) => http.put(`/tickets/${id}/confirm`),
  // 用户
  users: (params) => http.get('/users', { params }),
  createUser: (data) => http.post('/users', data),
  updateUser: (id, data) => http.put(`/users/${id}`, data),
  staffList: () => http.get('/users/staff'),
  // 基础数据
  faqs: () => http.get('/faqs'),
  allFaqs: () => http.get('/faqs/all'),
  createFaq: (data) => http.post('/faqs', data),
  updateFaq: (id, data) => http.put(`/faqs/${id}`, data),
  deleteFaq: (id) => http.delete(`/faqs/${id}`),
  bulletins: () => http.get('/bulletins'),
  allBulletins: () => http.get('/bulletins/all'),
  createBulletin: (data) => http.post('/bulletins', data),
  updateBulletin: (id, data) => http.put(`/bulletins/${id}`, data),
  deleteBulletin: (id) => http.delete(`/bulletins/${id}`),
  phrases: () => http.get('/phrases'),
  allPhrases: () => http.get('/phrases/all'),
  createPhrase: (data) => http.post('/phrases', data),
  updatePhrase: (id, data) => http.put(`/phrases/${id}`, data),
  deletePhrase: (id) => http.delete(`/phrases/${id}`),
  // 统计
  dashboardStats: () => http.get('/stats/dashboard'),
  myStats: () => http.get('/stats/my'),
  // AI
  aiReply: (data) => http.post('/ai/reply', data),
  aiSummarize: (data) => http.post('/ai/summarize', data),
  aiClassify: (data) => http.post('/ai/classify', data),
  aiAsk: (question) => http.post('/ai/ask', { question }),
  aiConfig: () => http.get('/ai/config'),
  saveAiConfig: (data) => http.put('/ai/config', data),
  // 通知
  notifications: () => http.get('/notifications'),
  notifUnread: () => http.get('/notifications/unread-count'),
  notifReadAll: () => http.put('/notifications/read'),
  notifRead: (id) => http.put(`/notifications/read/${id}`),
  // 渠道
  channels: () => http.get('/channels'),
  updateChannel: (type, data) => http.put(`/channels/${type}`, data),
  channelInbound: (type, data) => http.post(`/channels/inbound/${type}`, data),
  // 自定义表单
  formFields: () => http.get('/forms'),
  allFormFields: () => http.get('/forms/all'),
  createFormField: (data) => http.post('/forms', data),
  updateFormField: (id, data) => http.put(`/forms/${id}`, data),
  deleteFormField: (id) => http.delete(`/forms/${id}`),
  // 满意度
  rateTicket: (id, data) => http.post(`/satisfactions/tickets/${id}`, data),
  ticketSatisfaction: (id) => http.get(`/satisfactions/tickets/${id}`),
  // 系统设置
  slaPolicies: () => http.get('/system/sla'),
  updateSla: (priority, data) => http.put(`/system/sla/${priority}`, data)
}
