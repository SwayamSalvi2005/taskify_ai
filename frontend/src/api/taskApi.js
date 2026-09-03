import api from './axiosInstance';

// all task & AI related API calls live here.
export const getTasks = (query = {}) => {
  const params = new URLSearchParams(query).toString();
  return api.get(`/tasks?${params}`);
};

export const getTaskStats = () =>
  api.get('/tasks/stats/summary');

export const createTask = (taskData) =>
  api.post('/tasks', taskData);

export const updateTask = (id, updates) =>
  api.put(`/tasks/${id}`, updates);

export const deleteTask = (id) =>
  api.delete(`/tasks/${id}`);

export const sendChatMessage = (message, history) =>
  api.post('/gemini/chat', { message, history });
