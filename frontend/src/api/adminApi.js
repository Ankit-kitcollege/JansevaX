import API from './axios';

export const adminApi = {
  getAnalytics: () => API.get('/admin/analytics'),
  getClusters: () => API.get('/admin/clusters'),
  getDepartments: () => API.get('/admin/departments'),
  getUsers: () => API.get('/admin/users'),
  getNotifications: () => API.get('/notifications'),
  markNotificationRead: (id) => API.put(`/notifications/${id}/read`)
};
