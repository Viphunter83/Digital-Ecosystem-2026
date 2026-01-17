import axios from 'axios';

// Types derived from backend models
export interface Client {
    name: string;
}

export interface Project {
    id: string; // UUID is string in JS
    title: string;
    description?: string;
    client?: Client;
    year?: number;
    region?: string;
    latitude?: number;
    longitude?: number;
    image_url?: string;
}

export interface Product {
    id: number;
    name: string;
    description?: string;
    category?: string;
    specs?: Record<string, any>;
    image_url?: string;
}

export interface Article {
    id: number;
    title: string;
    summary?: string;
    content?: string;
    published_at?: string;
    author?: string;
    image_url?: string;
}

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const fetchProjects = async (): Promise<Project[]> => {
    try {
        const response = await api.get('/projects');
        return response.data;
    } catch (error) {
        console.error('Error fetching projects:', error);
        return [];
    }
};

export const fetchCatalog = async (query?: string): Promise<Product[]> => {
    try {
        const url = query ? `/catalog/search?q=${encodeURIComponent(query)}` : '/catalog/search'; // Assuming search endpoint returns all if no query or handles it
        // If /catalog/search requires a query, we might need a different endpoint for "all products" or handle empty query.
        // For now, assuming /catalog/search works or we fallback to mock/empty.
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching catalog:', error);
        return [];
    }
};

export const fetchArticles = async (): Promise<Article[]> => {
    try {
        const response = await api.get('/journal');
        return response.data;
    } catch (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
};

export default api;
