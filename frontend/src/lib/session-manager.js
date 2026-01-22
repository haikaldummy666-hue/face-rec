import { api } from './api';

export const createSession = async (userId = 1) => {
  try {
    // userId is auto-incremented number (1, 2, 3, ...)
    return await api.post('/sessions', { userId });
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};