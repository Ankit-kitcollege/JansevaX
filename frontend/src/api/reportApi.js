import API from './axios';

export const reportApi = {
  createReport: (data) => API.post('/reports', data),
  checkDuplicate: (data) => API.post('/reports/check-duplicate', data),
  getAllReports: (params) => API.get('/reports', { params }),
  getMyReports: () => API.get('/reports/my-reports'),
  getReportById: (id) => API.get(`/reports/${id}`),
  updateStatus: (id, data) => API.put(`/reports/${id}/status`, data),
  supportReport: (id) => API.post(`/reports/${id}/support`),
  addProgressUpdate: (id, data) => API.post(`/reports/${id}/progress`, data),
  verifyResolution: (id, data) => API.post(`/reports/${id}/verify`, data),
  analyzeTextWithAi: (data) => API.post('/ai/analyze-text', data),
  createResolutionLog: (data) => API.post('/resolution-logs', data),
  getResolutionLogs: (reportId) => API.get(`/resolution-logs/report/${reportId}`),
  checkResolutionLogStatus: (reportId) => API.get(`/resolution-logs/check/${reportId}`),
  getOfficerReports: () => API.get('/reports/officer'),
  getDepartmentReports: () => API.get('/reports/department'),
  deleteReport: (id) => API.delete(`/reports/${id}`),
  getClusters: () => API.get('/clusters'),
  triggerClustering: () => API.post('/clusters/analyze')
};
