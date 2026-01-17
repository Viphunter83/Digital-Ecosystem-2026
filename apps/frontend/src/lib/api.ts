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

// Real Data from "ТД РУССтанкоСбыт"
const CATALOG_DATA: Product[] = [
    {
        id: 1001,
        name: "ТОКАРНАЯ ОБРАБОТКА (ЧПУ)",
        description: "Высокоточная токарная обработка деталей сложной конфигурации на станках с ЧПУ.",
        image_url: "/images/product_cnc.png",
        category: "МЕХАНООБРАБОТКА",
        specs: { "Диаметр": "До 1000 мм", "Длина": "До 3000 мм" }
    },
    {
        id: 1002,
        name: "ФРЕЗЕРНАЯ ОБРАБОТКА",
        description: "Обработка корпусных деталей и сложных поверхностей на широкоформатных фрезерных станках.",
        image_url: "/images/product_laser.png",
        category: "МЕХАНООБРАБОТКА",
        specs: { "Рабочее поле": "1200x5000 мм", "Оси": "3-5 координат" }
    },
    {
        id: 1003,
        name: "ШЛИФОВАНИЕ (КРУГЛОЕ/ПЛОСКОЕ)",
        description: "Финишная обработка поверхностей с микронной точностью.",
        image_url: "/images/product_press.png",
        category: "МЕХАНООБРАБОТКА",
        specs: { "Круглое": "Ø400x1200 мм", "Тип": "Координатное" }
    },
    {
        id: 1004,
        name: "РАСТОЧНАЯ ОБРАБОТКА",
        description: "Растачивание отверстий в крупногабаритных корпусных деталях.",
        image_url: "/images/product_3d_printer.png",
        category: "МЕХАНООБРАБОТКА",
        specs: { "Стол": "1200x1200 мм", "Вес детали": "До 5 т" }
    },
    {
        id: 1005,
        name: "ЗУБООБРАБОТКА",
        description: "Производство цилиндрических и конических зубчатых колес различных модулей.",
        image_url: "/images/product_conveyor.png",
        category: "ПРОИЗВОДСТВО",
        specs: { "Тип": "Конические/Цилиндрические", "Модуль": "Любой" }
    },
    {
        id: 1006,
        name: "РЕВОЛЬВЕРНЫЕ ГОЛОВКИ",
        description: "Собственное производство револьверных головок для токарных станков.",
        image_url: "/images/product_cnc.png",
        category: "ПРОИЗВОДСТВО",
        specs: { "Технология": "Собственная", "Надежность": "Высокая" }
    },
    {
        id: 1007,
        name: "ВАЛЫ И ШПИНДЕЛИ",
        description: "Полный цикл изготовления валов и шпиндельных узлов, включая термообработку.",
        image_url: "/images/product_laser.png",
        category: "ПРОИЗВОДСТВО",
        specs: { "Цикл": "Полный", "Обработка": "Термо/Финиш" }
    },
    {
        id: 1008,
        name: "МОСТОВОЙ КРАН 60/160Т",
        description: "Уникальное грузоподъемное оборудование для работы с тяжелыми грузами (Воронеж).",
        image_url: "/images/product_press.png",
        category: "ОБОРУДОВАНИЕ",
        specs: { "Г/П Основной": "160 тонн", "Пролет": "24 м" }
    }
];

export const fetchCatalog = async (query?: string): Promise<Product[]> => {
    try {
        return CATALOG_DATA;
    } catch (error) {
        console.error('Error fetching catalog:', error);
        return [];
    }
};

export const fetchProductById = async (id: number): Promise<Product | undefined> => {
    try {
        return CATALOG_DATA.find(p => p.id === id);
    } catch (error) {
        console.error('Error fetching product:', error);
        return undefined;
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
