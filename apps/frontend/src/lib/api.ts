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
    isOffice?: boolean; // New flag for offices
}

export interface Product {
    id: string; // Changed to string for UUID support
    name: string;
    slug?: string;
    description?: string;
    category?: string;
    specs?: Record<string, any> | string;
    image_url?: string;
    image_file?: string;
    price?: number;
    manufacturer?: string;
}

export interface Article {
    id: string;
    title: string;
    slug?: string;
    summary?: string;
    content?: string;
    published_at?: string;
    author?: string;
    image_url?: string;
    image_file?: string;
}

// Shared Constants for Specs
export const SPEC_MAP: Record<string, string> = {
    'TRAVEL_X': 'ХОД ПО ОСИ X',
    'TABLE_SIZE': 'РАЗМЕР СТОЛА',
    'SPINDLE_SPEED': 'ОБОРОТЫ',
    'FORCE': 'УСИЛИЕ',
    'SPEED': 'СКОРОСТЬ',
    'STROKE': 'ХОД ПОЛЗУНА',
    'POWER': 'МОЩНОСТЬ',
    'ACCURACY': 'ТОЧНОСТЬ',
    'MAX_LENGTH': 'МАКС. ДЛИНА',
    'MAX_DIAMETER': 'МАКС. ДИАМЕТР',
    'DIAMETER': 'ДИАМЕТР',
    'WEIGHT': 'ВЕС',
    'AXIS': 'ОСИ',
    'SPINDLE': 'ШПИНДЕЛЬ',
    'WORKSPACE': 'РАБ. ЗОНА',
    'MAIN': 'ОСНОВНОЕ',
    'MODEL': 'МОДЕЛЬ',
    'DESCRIPTION': 'ОПИСАНИЕ',
    'power': 'МОЩНОСТЬ',
    'accuracy': 'ТОЧНОСТЬ',
    'max_length': 'МАКС. ДЛИНА',
    'max_diameter': 'МАКС. ДИАМЕТР',
    'travel_x': 'ХОД ПО X',
    'travel_y': 'ХОД ПО Y',
    'travel_z': 'ХОД ПО Z',
    'table_size': 'РАЗМЕР СТОЛА',
    'spindle_speed': 'ОБ/МИН',
    'force': 'УСИЛИЕ',
    'speed': 'СКОРОСТЬ',
    'stroke': 'ХОД ПОЛЗУНА',
    'rpm': 'ОБ/МИН',
    'torque': 'КРУТЯЩИЙ МОМЕНТ',
    'weight': 'ВЕС',
    'diameter': 'ДИАМЕТР',
};

export const UNIT_MAP: Record<string, string> = {
    'mm': 'мм',
    'mm/s': 'мм/с',
    'rpm': 'об/мин',
    'ton': 'т',
    'kW': 'кВт',
    'kg': 'кг',
};

export function formatSpecValue(value: string): string {
    let formatted = value;
    Object.entries(UNIT_MAP).forEach(([en, ru]) => {
        formatted = formatted.replace(new RegExp(en, 'g'), ru);
    });
    return formatted;
}

export interface ParsedSpec {
    originalKey: string;
    parameter: string;
    value: string;
}

export function parseSpecs(specs: Record<string, any> | string | undefined | null): ParsedSpec[] {
    if (!specs) return [];

    if (typeof specs === 'string') {
        try {
            const parsed = JSON.parse(specs);
            if (typeof parsed === 'object' && parsed !== null) {
                return parseSpecs(parsed);
            }
        } catch (e) {
            // Line-by-line parsing
            return specs.split('\n')
                .filter(line => line.trim().includes(':') || line.trim().includes('-'))
                .map((line, idx) => {
                    const separator = line.includes(':') ? ':' : '-';
                    const [key, ...valParts] = line.split(separator);
                    const value = valParts.join(separator).trim();
                    return {
                        originalKey: `manual-${idx}`,
                        parameter: key.trim(),
                        value: formatSpecValue(value)
                    };
                });
        }
    } else {
        // It's an object
        return Object.entries(specs)
            .filter(([key, value]) => {
                const k = key.toUpperCase();
                return k !== 'DESCRIPTION' && value && String(value).trim() !== '';
            })
            .map(([key, value]) => ({
                originalKey: key,
                parameter: SPEC_MAP[key] || SPEC_MAP[key.toUpperCase()] || key,
                value: formatSpecValue(String(value))
            }));
    }

    return [];
}

/**
 * Generates a full URL for a Directus asset
 * @param fileId Directus file UUID
 * @returns Full URL to the asset or undefined
 */
export function getAssetUrl(fileId: string | undefined | null): string | undefined {
    if (!fileId) return undefined;
    const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.td-rss.ru';
    return `${baseUrl}/assets/${fileId}`;
}

/**
 * Returns the best available image URL for a product or article
 * @param item An object with image_file and/or image_url
 * @returns Best image URL or undefined
 */
export function getImageUrl(item: { image_file?: string; image_url?: string } | undefined | null): string | undefined {
    if (!item) return undefined;
    return getAssetUrl(item.image_file) || item.image_url;
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

// Add Response Interceptor for Auth Errors (401)
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('accessToken');
                // Optional: window.location.href = '/'; 
                // Or let the useTelegramAuth hook handle it on next refresh
            }
        }
        return Promise.reject(error);
    }
);

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

export const fetchProductById = async (idOrSlug: string): Promise<Product | undefined> => {
    try {
        const response = await api.get(`/catalog/${idOrSlug}`);
        if (response.data.error) return undefined;
        return response.data;
    } catch (error) {
        console.error('Error fetching product:', error);
        return undefined;
    }
};

export const fetchArticles = async (): Promise<Article[]> => {
    try {
        const response = await api.get('/journal');
        return response.data.articles || [];
    } catch (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
};

export const fetchArticleById = async (idOrSlug: string): Promise<Article | undefined> => {
    try {
        const response = await api.get(`/journal/${idOrSlug}`);
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
