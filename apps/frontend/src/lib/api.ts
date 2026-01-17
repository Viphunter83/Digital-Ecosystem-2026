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
        // Real Data from "ТД РУССтанкоСбыт"
        return [
            {
                id: '1',
                title: 'ПЛОЩАДКА №1 - РЯЗАНЬ',
                client: { name: 'ТД РУССтанкоСбыт' },
                region: 'Рязанская обл.',
                latitude: 54.6269,
                longitude: 39.6916,
                image_url: '/images/backgrounds/bg_1.jpg',
                description: "Производство полного цикла токарных и трубонарезных станков. Участок зубчатых колес."
            },
            {
                id: '2',
                title: 'ПЛОЩАДКА №2 - ВОРОНЕЖ',
                client: { name: 'ТД РУССтанкоСбыт' },
                region: 'Воронежская обл.',
                latitude: 51.6720,
                longitude: 39.1843,
                image_url: '/images/backgrounds/bg_2.jpg',
                description: "Тяжелая обработка до 150т. Мостовой кран 160т."
            },
            {
                id: '3',
                title: 'ПЛОЩАДКА №3 - ИЖЕВСК',
                client: { name: 'ТД РУССтанкоСбыт' },
                region: 'Удмуртия',
                latitude: 56.8498,
                longitude: 53.2045,
                image_url: '/images/backgrounds/bg_3.jpg',
                description: "Производство конических зубчатых колес. Механическая обработка."
            },
            {
                id: '4',
                title: 'ПЛОЩАДКА №4 - БЕЛАРУСЬ',
                client: { name: 'Партнерское производство' },
                region: 'Минск',
                latitude: 53.9000,
                longitude: 27.5667,
                image_url: '/images/backgrounds/bg_4.jpg',
                description: "Партнерская производственная площадка."
            },
            // Major Clients (For lists/reference, coords approximate/faked for now or just omitted if not needed on map)
            { id: 'c1', title: 'АО "Завод "Сельмаш"', client: { name: 'Клиент' }, region: 'Киров', description: "Крупный заказчик" },
            { id: 'c2', title: 'АО "Таганрогский мет. завод"', client: { name: 'Клиент' }, region: 'Таганрог', description: "Крупный заказчик" },
            { id: 'c3', title: 'КАО "АЗОТ"', client: { name: 'Клиент' }, region: 'Кемерово', description: "Крупный заказчик" },
            { id: 'c4', title: 'АО "Туламашзавод"', client: { name: 'Клиент' }, region: 'Тула', description: "Крупный заказчик" }
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
