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
    id: string; // Changed to string for UUID support
    name: string;
    description?: string;
    category?: string;
    specs?: Record<string, any>;
    image_url?: string;
    price?: number;
}

export interface Article {
    id: string;
    title: string;
    summary?: string;
    content?: string;
    published_at?: string;
    author?: string;
    image_url?: string;
}

const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        // Client-side: use relative path or env var
        return process.env.NEXT_PUBLIC_API_URL || '/api';
    }
    // Server-side: use internal docker hostname
    // We can try to use an env var for internal URL if available, otherwise default to backend:8000
    // Note: 'localhost' won't work inside docker container unless using host network.
    // We should use 'backend' service name.
    return process.env.INTERNAL_API_URL || 'http://backend:8000';
};

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

export const fetchProjects = async (): Promise<Project[]> => {
    try {
        console.log('API Request:', api.defaults.baseURL, '/projects/');
        const response = await api.get('/projects');
        return response.data;
    } catch (error) {
        console.error('Error fetching projects:', error);
        return [];
    }
};

export const fetchProjectById = async (id: string): Promise<Project | undefined> => {
    try {
        const response = await api.get(`/projects/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching project:', error);
        return undefined;
    }
};

export const fetchCatalog = async (query?: string): Promise<Product[]> => {
    try {
        // Catalog search defined as @router.get("/search") -> /catalog/search (NO SLASH)
        const url = query ? `/catalog/search?q=${query}` : '/catalog/search';
        console.log(`Requesting URL: ${url}`);
        const response = await api.get(url);
        // The endpoint returns { results: Product[] }
        return response.data.results || [];
    } catch (error) {
        console.error('Error fetching catalog:', error);
        return [];
    }
};

export const fetchProductById = async (id: string): Promise<Product | undefined> => {
    try {
        // Defined as @router.get("/{product_id}") -> /catalog/{id} (NO SLASH)
        const response = await api.get(`/catalog/${id}`);
        if (response.data.error) return undefined;
        return response.data;
    } catch (error) {
        console.error('Error fetching product:', error);
        return undefined;
    }
};

export const fetchArticles = async (): Promise<Article[]> => {
    try {
        // Defined as @router.get("/") -> /journal/ (YES SLASH)
        const response = await api.get('/journal');
        // The endpoint returns { articles: Article[] } based on journal.py
        return response.data.articles || [];
    } catch (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
};

export const fetchArticleById = async (id: string): Promise<Article | undefined> => {
    try {
        // Defined as @router.get("/{article_id}") -> /journal/{id} (NO SLASH)
        const response = await api.get(`/journal/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching article:', error);
        return undefined;
    }
};

export default api;
