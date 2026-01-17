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
        // Fallback Mock Data
        return [
            { id: '1', title: 'Гигафабрика Берлин', client: { name: 'Tesla Inc.' }, region: 'Европа', latitude: 52.3906, longitude: 13.7936, image_url: '/images/backgrounds/bg_1.jpg' },
            { id: '2', title: 'Завод Полупроводников', client: { name: 'TSMC' }, region: 'Азия', latitude: 24.8138, longitude: 121.0074, image_url: '/images/backgrounds/bg_2.jpg' },
            { id: '3', title: 'Литиевый Рудник Невада', client: { name: 'Albemarle' }, region: 'Северная Америка', latitude: 37.9577, longitude: -117.5445, image_url: '/images/backgrounds/bg_3.jpg' },
            { id: '4', title: 'Офшорная Ветроэлектростанция', client: { name: 'Ørsted' }, region: 'Северное Море', latitude: 54.5, longitude: 5.5, image_url: '/images/backgrounds/bg_4.jpg' },
            { id: '5', title: 'Комплекс Солнечных Батарей', client: { name: 'NextEra Energy' }, region: 'Северная Америка', latitude: 35.0, longitude: -115.0, image_url: '/images/backgrounds/bg_1.jpg' },
            { id: '6', title: 'Модернизация Сталелитейного Завода', client: { name: 'ArcelorMittal' }, region: 'Европа', latitude: 49.6116, longitude: 6.1319, image_url: '/images/backgrounds/bg_2.jpg' },
            { id: '7', title: 'СПГ Терминал', client: { name: 'QatarEnergy' }, region: 'Ближний Восток', latitude: 25.9, longitude: 51.5, image_url: '/images/backgrounds/bg_3.jpg' }
        ];
    } catch (error) {
        console.error('Error fetching projects:', error);
        return [];
    }
};

export const fetchCatalog = async (query?: string): Promise<Product[]> => {
    try {
        // Mock Data for specific display
        const products: Product[] = [
            {
                id: 1001,
                name: "ОБРАБАТЫВАЮЩИЙ ЦЕНТР X5",
                description: "5-осевой синхронный обрабатывающий центр для аэрокосмических деталей.",
                image_url: "/images/product_cnc.png",
                category: "МЕХАНООБРАБОТКА",
                specs: { "Мощность": "15 кВт", "Обороты": "12000 об/мин" }
            },
            {
                id: 1002,
                name: "РОБОТИЗИРОВАННАЯ РУКА A-500",
                description: "Высокоточный манипулятор для автоматизированных сборочных линий.",
                image_url: "/images/journal_robotics.png",
                category: "АВТОМАТИЗАЦИЯ",
                specs: { "Нагрузка": "50 кг", "Вылет": "2.5 м" }
            },
            {
                id: 1003,
                name: "ГИДРАВЛИЧЕСКИЙ ПРЕСС H-200",
                description: "200-тонный гидравлический пресс для формовки тяжелого металла.",
                image_url: "/images/product_press.png",
                category: "ФОРМОВКА",
                specs: { "Усилие": "200 Т", "Площадь": "1.5x1.5 м" }
            },
            {
                id: 1004,
                name: "ЛАЗЕРНЫЙ СТАНОК L-3000",
                description: "Высокоскоростной оптоволоконный станок для лазерной резки.",
                image_url: "/images/product_laser.png",
                category: "РЕЗКА",
                specs: { "Мощность": "3 кВт", "Стол": "3x1.5 м" }
            },
            {
                id: 1005,
                name: "ПРОМЫШЛЕННЫЙ 3D ПРИНТЕР",
                description: "Крупномасштабная система аддитивного производства.",
                image_url: "/images/product_3d_printer.png",
                category: "АДДИТИВНЫЕ",
                specs: { "Объем": "1 м³", "Материал": "Полимер" }
            },
            {
                id: 1006,
                name: "КОНВЕЙЕРНАЯ СИСТЕМА C-10",
                description: "Модульная конвейерная система для автоматизированного склада.",
                image_url: "/images/product_conveyor.png",
                category: "ЛОГИСТИКА",
                specs: { "Скорость": "2 м/с", "Нагрузка": "100 кг/м" }
            }
        ];
        return products;
    } catch (error) {
        console.error('Error fetching catalog:', error);
        return [];
    }
};

export const fetchArticles = async (): Promise<Article[]> => {
    try {
        // Fallback Mock Data
        return [
            {
                id: 1,
                title: "РЕВОЛЮЦИЯ АВТОМАТИЗИРОВАННОЙ СВАРКИ",
                summary: "Как робототехника на базе ИИ трансформирует точность аэрокосмического производства.",
                image_url: "/images/journal_robotics.png",
                published_at: "2026-04-12",
                author: "Д-р А. Петров"
            },
            {
                id: 2,
                title: "АНАЛИТИКА ЦИФРОВЫХ ДВОЙНИКОВ",
                summary: "Визуализация данных в реальном времени для предиктивного обслуживания в тяжелой промышленности.",
                image_url: "/images/journal_analytics.png",
                published_at: "2026-04-10",
                author: "Сара Коннор"
            },
            {
                id: 3,
                title: "ЭКОЛОГИЧЕСКАЯ СТАЛЬ",
                summary: "Новые процессы восстановления на основе водорода для производства стали с нулевым углеродным следом.",
                image_url: "/images/journal_steel.png",
                published_at: "2026-04-05",
                author: "М. Кусанаги"
            }
        ];
    } catch (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
};

export default api;
