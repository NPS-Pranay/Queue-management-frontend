import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication APIs
export const loginApi = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerApi = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// Service APIs
export const getServicesApi = async () => {
  const response = await api.get('/services');
  return response.data;
};

export const createServiceApi = async (serviceData) => {
  const response = await api.post('/services', serviceData);
  return response.data;
};

export const updateServiceApi = async (id, serviceData) => {
  const response = await api.put(`/services/${id}`, serviceData);
  return response.data;
};

export const deleteServiceApi = async (id) => {
  const response = await api.delete(`/services/${id}`);
  return response.data;
};

// Counter APIs
export const getCountersApi = async () => {
  const response = await api.get('/counters');
  return response.data;
};

export const createCounterApi = async (counterData) => {
  const response = await api.post('/counters', counterData);
  return response.data;
};

export const updateCounterApi = async (id, counterData) => {
  const response = await api.put(`/counters/${id}`, counterData);
  return response.data;
};

export const deleteCounterApi = async (id) => {
  const response = await api.delete(`/counters/${id}`);
  return response.data;
};

// Token & Queue APIs
export const createTokenApi = async (tokenData) => {
  const response = await api.post('/tokens', tokenData);
  return response.data;
};

export const getTokenByIdApi = async (id) => {
  const response = await api.get(`/tokens/${id}`);
  return response.data;
};

export const getTokenPositionApi = async (id) => {
  const response = await api.get(`/tokens/${id}/position`);
  return response.data;
};

export const getUserTokensApi = async (userId) => {
  const response = await api.get(`/users/${userId}/tokens`);
  return response.data;
};

export const cancelTokenApi = async (id, userId) => {
  const response = await api.put(`/tokens/${id}/cancel?userId=${userId}`);
  return response.data;
};

// Staff APIs
export const getStaffQueueApi = async (serviceId) => {
  const response = await api.get(`/staff/queue/${serviceId}`);
  return response.data;
};

export const callNextTokenApi = async (serviceId, counterId) => {
  const url = counterId
    ? `/staff/queue/${serviceId}/next?counterId=${counterId}`
    : `/staff/queue/${serviceId}/next`;
  const response = await api.post(url);
  return response.data;
};

export const completeTokenApi = async (id) => {
  const response = await api.put(`/staff/tokens/${id}/complete`);
  return response.data;
};

export const skipTokenApi = async (id) => {
  const response = await api.put(`/staff/tokens/${id}/skip`);
  return response.data;
};

// User Admin APIs
export const getAllUsersApi = async () => {
  const response = await api.get('/users');
  return response.data;
};

export default api;
