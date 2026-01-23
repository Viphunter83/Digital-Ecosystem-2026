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
    slug?: string;
    description?: string;
    category?: string;
    specs?: Record<string, any>;
    image_url?: string;
    price?: number;
    manufacturer?: string;
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

export const API_URL = getBaseUrl();

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add Request Interceptor for Auth
api.interceptors.request.use(config => {
    if (typeof window !== 'undefined') {
        const token = sessionStorage.getItem('accessToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, error => {
    return Promise.reject(error);
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

export const fetchCatalog = async (
    query?: string,
    type: 'machines' | 'spares' = 'machines',
    limit: number = 20,
    offset: number = 0,
    category?: string
): Promise<{ results: Product[], total: number }> => {
    try {
        // Catalog search defined as @router.get("/search") -> /catalog/search
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        params.append('type', type);
        params.append('limit', limit.toString());
        params.append('offset', offset.toString());
        if (category) params.append('category', category);

        const url = `/catalog/search?${params.toString()}`;
        const response = await api.get(url);

        // Response format: { results: Product[], total: number }
        return {
            results: response.data.results || [],
            total: response.data.total || 0
        };
    } catch (error) {
        console.error('[API] Error fetching catalog:', error);
        return { results: [], total: 0 };
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

export const fetchSiteContent = async (): Promise<Record<string, string>> => {
    try {
        const response = await api.get('/content/');
        return response.data || {};
    } catch (error) {
        console.error('Error fetching site content:', error);
        return {};
    }
};

// Solutions interface
export interface Solution {
    id: string;
    slug: string;
    title: string;
    description?: string;
    icon?: string;
    gradient?: string;
    link_url?: string;
    link_text?: string;
}

export const fetchSolutions = async (): Promise<Solution[]> => {
    try {
        const response = await api.get('/content/solutions');
        return response.data || [];
    } catch (error) {
        console.error('Error fetching solutions:', error);
        return [];
    }
};

// Offices interface
export interface Office {
    id: string;
    name: string;
    city?: string;
    region?: string;
    address?: string;
    phone?: string;
    email?: string;
    latitude?: number;
    longitude?: number;
    is_headquarters: boolean;
    description?: string;
    working_hours?: string;
}

export const fetchOffices = async (): Promise<Office[]> => {
    try {
        const response = await api.get('/content/offices');
        return response.data || [];
    } catch (error) {
        console.error('Error fetching offices:', error);
        return [];
    }
};

export interface Category {
    name: string;
    slug: string;
    filter_group: string;
}

export interface FilterGroup {
    group: string;
    categories: Category[];
}

export interface FiltersResponse {
    groups: FilterGroup[];
}

export const fetchFilters = async (): Promise<FiltersResponse> => {
    try {
        const response = await api.get('/catalog/filters');
        return response.data;
    } catch (error) {
        console.error('Error fetching filters:', error);
        return { groups: [] };
    }
};

// Production Sites interface
export interface ProductionSite {
    id: string;
    site_number: number;
    city: string;
    description?: string;
    sort_order?: number;
}

export const fetchProductionSites = async (): Promise<ProductionSite[]> => {
    try {
        const response = await api.get('/content/production-sites');
        return response.data || [];
    } catch (error) {
        console.error('Error fetching production sites:', error);
        return [];
    }
};

// Services interface
export interface Service {
    id: string;
    slug: string;
    title: string;
    description?: string;
    content?: {
        checklist_title: string;
        checklist: string[];
        cases: Array<{
            model: string;
            problem: string;
            solution: string;
            result: string;
            image_url?: string;
        }>;
        usp: Array<{
            title: string;
            description: string;
        }>;
    };
    sort_order: number;
}

export const fetchServices = async (): Promise<Service[]> => {
    try {
        const response = await api.get('/services');
        return response.data || [];
    } catch (error) {
        console.error('Error fetching services:', error);
        return [];
    }
};

export const fetchServiceBySlug = async (slug: string): Promise<Service | undefined> => {
    try {
        const response = await api.get(`/services/${slug}`);
        if (response.data.error) return undefined;
        return response.data;
    } catch (error) {
        console.error(`Error fetching service ${slug}:`, error);
        return undefined;
    }
};

export interface MachineInstance {
    id: string;
    serial_number: string;
    inventory_number?: string;
    status: string;
    service_history: Array<{
        date: string;
        title: string;
        description: string;
        status: string;
        icon: string;
    }>;
    telemetry_summary: Record<string, any>;
    product?: Product;
    next_maintenance_date?: string;
}

export const fetchMachineInstance = async (serialNumber: string): Promise<MachineInstance | undefined> => {
    try {
        const response = await api.get(`/catalog/instances/${serialNumber}`);
        if (response.data.error) return undefined;
        return response.data;
    } catch (error) {
        console.error(`Error fetching machine instance ${serialNumber}:`, error);
        return undefined;
    }
};

export const fetchFeaturedInstance = async (): Promise<MachineInstance | undefined> => {
    try {
        const response = await api.get('/catalog/instances-featured');
        if (response.data.error) return undefined;
        return response.data;
    } catch (error) {
        console.error('Error fetching featured instance:', error);
        return undefined;
    }
};

export const fetchRecommendedSpares = async (serialNumber: string): Promise<Product[]> => {
    try {
        const response = await api.get(`/catalog/instances/${serialNumber}/recommended-spares`);
        return response.data || [];
    } catch (error) {
        console.error(`Error fetching recommended spares for ${serialNumber}:`, error);
        return [];
    }
};

export default api;
