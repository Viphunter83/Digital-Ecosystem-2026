"use client";

import dynamic from 'next/dynamic';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

// Dynamically import MapComponent to avoid SSR issues
const MapComponent = dynamic(
    () => import('@/components/MapComponent'),
    { ssr: false }
);

// Mock project for map center - General Moscow Location
const OFFICE_LOCATION = [
    {
        id: "office-main",
        title: "ЦЕНТРАЛЬНЫЙ ОФИС",
        client: { name: "ТД РУССтанкоСбыт", industry: "Engineering", region: "Moscow" },
        region: "МОСКВА, РОССИЯ",
        latitude: 55.751244,
        longitude: 37.618423,
        status: "ACTIVE",
        kpi: 100,
        description: "Центральный офис и инженерный центр."
    }
];

export default function ContactsPage() {
    return (
        <div className="min-h-screen bg-industrial-surface text-white pt-24 pb-20">
            {/* Header */}
            <div className="container mx-auto px-6 mb-12">
                <div className="border-b border-industrial-border pb-6">
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-white">
                        Контактная <span className="text-safety-orange">Информация</span>
                    </h1>
                    <p className="text-muted-foreground font-mono text-sm max-w-2xl">
                        СВЯЖИТЕСЬ С НАМИ ДЛЯ КОНСУЛЬТАЦИИ, ПОДБОРА ОБОРУДОВАНИЯ ИЛИ СОТРУДНИЧЕСТВА.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Contact Info & Form */}
                <div className="space-y-12">

                    {/* Info Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-industrial-panel p-6 border border-industrial-border group hover:border-safety-orange transition-colors duration-300">
                            <Phone className="w-6 h-6 text-safety-orange mb-4" />
                            <h3 className="font-mono text-xs text-muted-foreground uppercase mb-1">Отдел Продаж</h3>
                            <a href="tel:+74993908504" className="text-lg font-bold hover:text-safety-orange transition-colors block">
                                +7 (499) 390-85-04
                            </a>
                            <p className="text-sm text-gray-500 mt-1">Пн-Пт: 09:00 - 18:00 МСК</p>
                        </div>

                        <div className="bg-industrial-panel p-6 border border-industrial-border group hover:border-safety-orange transition-colors duration-300">
                            <Mail className="w-6 h-6 text-safety-orange mb-4" />
                            <h3 className="font-mono text-xs text-muted-foreground uppercase mb-1">Электронная Почта</h3>
                            <a href="mailto:zakaz@tdrusstankosbyt.ru" className="text-lg font-bold hover:text-safety-orange transition-colors block break-all">
                                zakaz@tdrusstankosbyt.ru
                            </a>
                            <p className="text-sm text-gray-500 mt-1">Для заявок и КП</p>
                        </div>

                        <div className="bg-industrial-panel p-6 border border-industrial-border group hover:border-safety-orange transition-colors duration-300">
                            <svg
                                className="w-6 h-6 text-safety-orange mb-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M12 0C5.37097 0 0 5.37097 0 12C0 18.629 5.37097 24 12 24C18.629 24 24 18.629 24 12C24 5.37097 18.629 0 12 0ZM17.6532 9.06452C17.4919 10.7742 16.7339 14.8629 16.3468 16.9274C16.1855 17.8145 15.8629 18.1048 15.5565 18.1371C14.879 18.1935 14.3629 17.6935 13.7097 17.2661C12.6935 16.5968 12.1129 16.1774 11.129 15.5323C10.0000 14.7823 10.7258 14.371 11.371 13.7016C11.5403 13.5242 14.4597 10.8629 14.5161 10.621C14.5242 10.5887 14.5323 10.4677 14.4597 10.4032C14.3871 10.3387 14.2823 10.3629 14.1935 10.379C14.0726 10.4113 12.129 11.6694 8.3629 14.2177C7.81452 14.6129 7.31452 14.8065 6.87097 14.7984C6.37903 14.7903 5.43548 14.5242 4.73387 14.2984C3.87903 14.0161 3.19355 13.8629 3.25 13.3871C3.28226 13.1371 3.62097 12.879 4.29032 12.6129C8.48387 10.6855 11.2823 9.48387 12.6855 8.90323C16.6855 7.24194 17.5161 6.95161 18.0565 6.95161C18.1774 6.95161 18.4435 6.98387 18.6129 7.12097C18.75 7.23387 18.7903 7.37903 18.7984 7.48387C18.8065 7.55645 18.8145 7.82258 17.6532 9.06452Z" />
                            </svg>
                            <h3 className="font-mono text-xs text-muted-foreground uppercase mb-1">Telegram Канал</h3>
                            <a href="https://t.me/tdrusstankosbyt" target="_blank" rel="noopener noreferrer" className="text-lg font-bold hover:text-safety-orange transition-colors block">
                                @tdrusstankosbyt
                            </a>
                            <p className="text-sm text-gray-500 mt-1">Новости и спецпредложения</p>
                        </div>

                        <div className="bg-industrial-panel p-6 border border-industrial-border group hover:border-safety-orange transition-colors duration-300">
                            <MapPin className="w-6 h-6 text-safety-orange mb-4" />
                            <h3 className="font-mono text-xs text-muted-foreground uppercase mb-1">Офис</h3>
                            <p className="text-lg font-bold text-white">г. Москва, Россия</p>
                            <p className="text-sm text-gray-500 mt-1">Центральный офис</p>
                        </div>
                    </div>

                    {/* Feedback Form */}
                    <div className="bg-industrial-panel/50 border border-industrial-border p-8 rounded-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <div className="w-32 h-32 border-4 border-white rounded-full"></div>
                        </div>
                        <h3 className="text-xl font-bold uppercase text-white mb-6 flex items-center">
                            <span className="w-2 h-2 bg-safety-orange mr-3"></span>
                            Обратная связь
                        </h3>
                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Ваша заявка принята в обработку. Менеджер свяжется с вами в ближайшее время."); }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-mono uppercase text-muted-foreground">ФИО / Компания</label>
                                    <input type="text" className="w-full bg-black/40 border border-white/10 p-3 text-sm text-white focus:border-safety-orange focus:outline-none transition-colors rounded-none placeholder:text-white/20" placeholder="ООО 'ТехноПром'" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-mono uppercase text-muted-foreground">Контактный Телефон</label>
                                    <input type="tel" className="w-full bg-black/40 border border-white/10 p-3 text-sm text-white focus:border-safety-orange focus:outline-none transition-colors rounded-none placeholder:text-white/20" placeholder="+7 (___) ___-__-__" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono uppercase text-muted-foreground">Email</label>
                                <input type="email" className="w-full bg-black/40 border border-white/10 p-3 text-sm text-white focus:border-safety-orange focus:outline-none transition-colors rounded-none placeholder:text-white/20" placeholder="info@company.ru" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono uppercase text-muted-foreground">Суть Запроса</label>
                                <textarea rows={4} className="w-full bg-black/40 border border-white/10 p-3 text-sm text-white focus:border-safety-orange focus:outline-none transition-colors rounded-none placeholder:text-white/20" placeholder="Интересует поставка оборудования..." required />
                            </div>
                            <button type="submit" className="w-full sm:w-auto bg-safety-orange hover:bg-safety-orange-vivid text-white font-bold py-3 px-8 uppercase tracking-wider text-xs transition-all clip-path-slant hover:translate-x-1">
                                Отправить Запрос
                            </button>
                        </form>
                    </div>

                </div>

                {/* Map Section - Integrated */}
                <div className="h-full min-h-[500px] border border-industrial-border bg-black/50 overflow-hidden relative group">
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-safety-orange z-20"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-safety-orange z-20"></div>

                    {/* Reuse MapComponent but point it to the office */}
                    <div className="absolute inset-0 grayscale group-hover:grayscale-0 transition-all duration-700">
                        {/* @ts-ignore - Mocking project type for reuse */}
                        <MapComponent projects={OFFICE_LOCATION} />
                    </div>
                </div>

            </div>
        </div>
    );
}
