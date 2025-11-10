import { getHeaders, BASE_URL } from './config';

export const api = {
    async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
        const url = new URL(`${BASE_URL}${endpoint}`);
        if (params) {
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        }

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    async post<T>(endpoint: string, data?: any): Promise<T> {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: data ? JSON.stringify(data) : undefined
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    async put<T>(endpoint: string, data: any): Promise<T> {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    async patch<T>(endpoint: string, data: any): Promise<T> {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    }
};