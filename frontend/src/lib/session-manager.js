import { api } from './api';

export const createSession = async (userId) => {
  try {
    return await api.post('/sessions', { userId });
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};
