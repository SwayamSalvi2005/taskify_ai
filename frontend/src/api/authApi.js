import api from './axiosInstance';

// all user/auth related API calls 
export const getMe = () =>
  api.get('/user/me');

export const registerUser = (name, email, password) =>
  api.post('/user/register', { name, email, password });

export const loginUser = (email, password) =>
  api.post('/user/login', { email, password });

export const verifyEmail = (token) =>
  api.get(`/user/verify-email?token=${token}`);

export const updateProfile = (name, email) =>
  api.put('/user/profile', { name, email });

export const updatePassword = (currentPassword, newPassword) =>
  api.put('/user/password', { currentPassword, newPassword });

export const deleteAccount = (currentPassword) =>
  api.delete('/user/delete', {
    data: { currentPassword, confirmMessage: 'DELETE' },
  });
