export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005/api';

export const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('CapacitorStorage.token') || ''}`,
});