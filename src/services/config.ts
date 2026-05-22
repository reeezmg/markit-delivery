import { Preferences } from '@capacitor/preferences';

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005/api';

export const getHeaders = async () => {
    let token = '';
    try {
        const stored = await Preferences.get({ key: 'token' });
        token = stored.value || '';
    } catch {
        token = '';
    }

    if (!token) {
        token = localStorage.getItem('CapacitorStorage.token') || '';
    }

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
};
