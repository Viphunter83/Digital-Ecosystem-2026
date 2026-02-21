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

export interface ProductImage {
    url: string;
    directus_id?: string;
    image_file?: string;
    is_primary?: boolean;
    order?: number;
}

export interface Product {
    id: string; // Changed to string for UUID support
    name: string;
    slug?: string;
    description?: string;
    category?: string;
    specs?: Record<string, any>;
    image_url?: string;
    image_file?: string;
    images?: ProductImage[]; // Added for gallery support
    price?: number;
    manufacturer?: string;
    product_type?: 'machine' | 'spare';
    compatible_parts?: Product[];
    compatible_products?: Product[];
    video_url?: string; // New field for video support
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
    video_url?: string; // New field for video support
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

export function parseSpecs(specs: any | undefined | null): ParsedSpec[] {
    if (!specs) return [];

    // Case 1: Array of Objects (Directus input-repeater format)
    if (Array.isArray(specs)) {
        return specs
            .filter(item => item && typeof item === 'object' && item.key && item.value)
            .map(item => ({
                originalKey: item.key,
                parameter: SPEC_MAP[item.key] || SPEC_MAP[item.key.toUpperCase()] || item.key,
                value: formatSpecValue(String(item.value))
            }));
    }

    // Case 2: Structured Object (Old Format)
    if (typeof specs === 'object' && specs !== null) {
        return Object.entries(specs)
            .filter(([key, value]) => {
                const k = key.toUpperCase();
                return k !== 'DESCRIPTION' && value !== null && value !== undefined && String(value).trim() !== '';
            })
            .map(([key, value]) => ({
                originalKey: key,
                parameter: SPEC_MAP[key] || SPEC_MAP[key.toUpperCase()] || key,
                value: formatSpecValue(String(value))
            }));
    }

    // Case 2: String (Legacy Format or JSON string)
    if (typeof specs === 'string' && specs.trim() !== '') {
        // Try to parse as JSON first (Directus cast-json might return stringified JSON)
        try {
            const parsed = JSON.parse(specs);
            if (typeof parsed === 'object' && parsed !== null) {
                return parseSpecs(parsed);
            }
        } catch (e) {
            // Not valid JSON, process as legacy text
        }

        // Process line by line: "Key: Value" or "Value"
        return specs.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map((line, index) => {
                const colonIndex = line.indexOf(':');
                if (colonIndex > -1) {
                    const key = line.substring(0, colonIndex).trim();
                    const value = line.substring(colonIndex + 1).trim();
                    return {
                        originalKey: `legacy_${index}`,
                        parameter: SPEC_MAP[key] || SPEC_MAP[key.toUpperCase()] || key,
                        value: formatSpecValue(value)
                    };
                }
                return {
                    originalKey: `legacy_${index}`,
                    parameter: 'Характеристика',
                    value: formatSpecValue(line)
                };
            });
    }

    return [];
}

/**
 * Sanitizes a URL by converting internal Directus hostnames to public ones 
 * and ensuring HTTPS for security and browser compatibility (Mixed Content).
 */
export function sanitizeUrl(url: string | undefined | null): string | null {
    if (!url) return null;

    // Hardcoded public domain for Directus to avoid environment-specific failures
    const publicDirectusUrl = 'https://admin.td-rss.ru';

    // Convert to string in case it's somehow not (though type says string)
    let sanitized = String(url);

    // Resolve internal Docker URLs to public ones
    // We check for both with and without protocol and port
    if (sanitized.includes('directus:8055')) {
        sanitized = sanitized.replace(/https?:\/\/directus:8055/g, publicDirectusUrl);
        sanitized = sanitized.replace(/directus:8055/g, publicDirectusUrl);
    }

    // Ensure HTTPS if it's on the main domains but comes as HTTP from DB
    if (sanitized.startsWith('http://td-rss.ru') ||
        sanitized.startsWith('http://admin.td-rss.ru') ||
        sanitized.startsWith('http://api.td-rss.ru')) {
        sanitized = sanitized.replace('http://', 'https://');
    }

    // Convert Directus Admin UI links to direct asset links
    // From: https://admin.td-rss.ru/admin/files/ID
    // To:   https://admin.td-rss.ru/assets/ID
    if (sanitized.includes('/admin/files/')) {
        sanitized = sanitized.replace('/admin/files/', '/assets/');
    }

    return sanitized;
}

/**
 * Returns the best available image URL for a product or article
 * @param item An object with image_file and/or image_url
 * @returns Best image URL or undefined
 */
export function getImageUrl(item: Product | Project | Article | ProductImage | undefined | null): string | null {
    if (!item) return null;

    const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.td-rss.ru';
    const cleanedBaseUrl = baseUrl.replace(/\/$/, '');

    // Explicitly handle ProductImage / SparePartImage object
    if ('image_file' in item || 'directus_id' in item) {
        if ('image_file' in item && item.image_file) return sanitizeUrl(`/assets/${item.image_file}`);
        if ('directus_id' in item && item.directus_id) return sanitizeUrl(`/assets/${item.directus_id}`);
    }

    // Handle legacy 'url' property if present
    if ('url' in item && item.url) {
        return sanitizeUrl(item.url);
    }

    // Handle other types (Product, Project, Article)
    // Prioritize image_url if it's a full URL
    if ('image_url' in item && item.image_url) {
        return sanitizeUrl(item.image_url);
    }

    // Then check for image_file (Directus asset ID)
    if ('image_file' in item && item.image_file) {
        return sanitizeUrl(`/assets/${item.image_file}`);
    }

    return null;
}

/**
 * Returns the best available video URL for a product or article
 */
export function getVideoUrl(item: Product | Article | undefined | null): string | null {
    if (!item || !item.video_url) return null;

    const url = item.video_url.trim();

    // Check if it's a UUID (Directus file ID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(url)) {
        return sanitizeUrl(`/assets/${url}`);
    }

    return sanitizeUrl(url);
}

const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        // Client-side: use explicitly set public API URL or fallback to relative /api
        // This ensures the browser doesn't try to use internal Docker hostnames
        const publicUrl = process.env.NEXT_PUBLIC_API_URL;
        if (publicUrl && publicUrl.startsWith('http')) {
            return publicUrl;
        }
        return '/api';
    }
    // Server-side: use internal docker hostname for direct communication
    return process.env.INTERNAL_API_URL || process.env.BACKEND_URL || 'http://backend:8000';
};

export const API_URL = getBaseUrl();
if (typeof window !== 'undefined') {
    console.log('[API] Client-side Base URL:', API_URL);
}

const api = axios.create({
    baseURL: API_URL,
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
        console.log(`[API] fetchCatalog Request: type=${type}, category=${category}, limit=${limit}`);
        // Catalog search defined as @router.get("/search") -> /catalog/search
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        params.append('type', type);
        params.append('limit', limit.toString());
        params.append('offset', offset.toString());
        if (category) params.append('category', category);

        const url = `/catalog/search?${params.toString()}`;
        const response = await api.get(url);
        console.log(`[API] fetchCatalog Success: ${response.data.results?.length || 0} items found`);

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

export const fetchArticles = async (): Promise<Article[]> => {
    try {
        console.log(`[API] fetchArticles Request: /journal`);
        const response = await api.get('/journal');
        console.log(`[API] fetchArticles Success: ${response.data.articles?.length || 0} articles found`);
        return response.data.articles || [];
    } catch (error) {
        console.error('Error fetching articles:', error);
        return [];
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
