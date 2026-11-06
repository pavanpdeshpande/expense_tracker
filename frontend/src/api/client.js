import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const dashboardApi = {
  getSummary: (filter = 'this_month', startDate, endDate) => {
    const params = { filter };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return api.get('/dashboard/summary', { params });
  },
  getCharts: (filter = 'this_month', startDate, endDate) => {
    const params = { filter };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return api.get('/dashboard/charts', { params });
  },
  getInsights: () => api.get('/dashboard/insights'),
};

export const transactionsApi = {
  list: (params) => api.get('/transactions', { params }),
  get: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  checkDuplicate: (data) => api.post('/transactions/check-duplicate', data),
};

export const categoriesApi = {
  list: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  addSubcategory: (catId, data) => api.post(`/categories/${catId}/subcategories`, data),
  delete: (id) => api.delete(`/categories/${id}`),
  deleteSubcategory: (subId) => api.delete(`/categories/subcategories/${subId}`),
};

export const budgetsApi = {
  list: (month) => api.get('/budgets', { params: { month } }),
  set: (data) => api.post('/budgets', data),
  delete: (id) => api.delete(`/budgets/${id}`),
};

export const savingsApi = {
  getOverview: (year) => api.get('/savings/overview', { params: { year } }),
};

export const donationsApi = {
  getSummary: (year) => api.get('/donations/summary', { params: { year } }),
};

export const recurringApi = {
  list: () => api.get('/recurring'),
  create: (data) => api.post('/recurring', data),
  toggle: (id) => api.post(`/recurring/${id}/toggle`),
  delete: (id) => api.delete(`/recurring/${id}`),
  processDue: () => api.post('/recurring/process-due'),
};

export const reportsApi = {
  getAnalytics: (year, month) => api.get('/reports/analytics', { params: { year, month } }),
};

export const dataApi = {
  importFile: (formData) => api.post('/data/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  exportCsvUrl: (params) => {
    const query = new URLSearchParams(params).toString();
    return `/api/data/export/csv?${query}`;
  },
  exportExcelUrl: (params) => {
    const query = new URLSearchParams(params).toString();
    return `/api/data/export/excel?${query}`;
  },
  exportPdfUrl: (params) => {
    const query = new URLSearchParams(params).toString();
    return `/api/data/export/pdf?${query}`;
  },
};

export const backupApi = {
  downloadUrl: '/api/backup/download',
  restore: (formData) => api.post('/backup/restore', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  clearData: () => api.post('/backup/clear-data'),
};

export const sampleDataApi = {
  generate: () => api.post('/sample-data/generate'),
  remove: () => api.delete('/sample-data/remove'),
};

export default api;
