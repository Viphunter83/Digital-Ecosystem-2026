"use client";

import dynamic from 'next/dynamic';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

// Dynamically import MapComponent to avoid SSR issues
const MapComponent = dynamic(
    () => import('@/components/MapComponent'),
    { ssr: false }
);

// Mock project for map center
const OFFICE_LOCATION = [
    {
        id: "office-main",
        title: "ЦЕНТРАЛЬНЫЙ ОФИС",
        client: { name: "RUSSTANKOSBYT HQ", industry: "Engineering", region: "Moscow" },
        region: "МОСКВА, РОССИЯ",
        latitude: 55.7558,
        longitude: 37.6173,
        status: "ACTIVE",
        kpi: 100
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
                        СВЯЖИТЕСЬ С НАМИ ДЛЯ КОНСУЛЬТАЦИИ ИЛИ ПОДБОРА ОБОРУДОВАНИЯ.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Contact Info & Form */}
                <div className="space-y-12">

                    {/* Info Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-industrial-panel p-6 border border-industrial-border">
                            <Phone className="w-6 h-6 text-safety-orange mb-4" />
                            <h3 className="font-mono text-xs text-muted-foreground uppercase mb-1">Телефон</h3>
                            <p className="text-lg font-bold">+7 (495) 123-45-67</p>
                            <p className="text-sm text-gray-500">Пн-Пт: 09:00 - 19:00</p>
                        </div>
                        <div className="bg-industrial-panel p-6 border border-industrial-border">
                            <Mail className="w-6 h-6 text-safety-orange mb-4" />
                            <h3 className="font-mono text-xs text-muted-foreground uppercase mb-1">Email</h3>
                            <p className="text-lg font-bold">info@russtanko.ru</p>
                            <p className="text-sm text-gray-500">Отдел продаж</p>
                        </div>
                        <div className="bg-industrial-panel p-6 border border-industrial-border sm:col-span-2">
                            <MapPin className="w-6 h-6 text-safety-orange mb-4" />
                            <h3 className="font-mono text-xs text-muted-foreground uppercase mb-1">Адрес офиса</h3>
                            <p className="text-lg font-bold">123456, г. Москва, Пресненская наб., д. 12, Башня "Федерация"</p>
                        </div>
                    </div>

                    {/* Feedback Form */}
                    <div className="bg-industrial-panel/50 border border-industrial-border p-8 rounded-sm">
                        <h3 className="text-xl font-bold uppercase text-white mb-6">Обратная связь</h3>
                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Сообщение отправлено (демо)!"); }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-mono uppercase text-muted-foreground">Имя</label>
                                    <input type="text" className="w-full bg-black/20 border border-white/10 p-3 text-sm text-white focus:border-safety-orange focus:outline-none transition-colors" placeholder="Иван Иванов" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-mono uppercase text-muted-foreground">Телефон</label>
                                    <input type="tel" className="w-full bg-black/20 border border-white/10 p-3 text-sm text-white focus:border-safety-orange focus:outline-none transition-colors" placeholder="+7 (___) ___-__-__" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono uppercase text-muted-foreground">Email</label>
                                <input type="email" className="w-full bg-black/20 border border-white/10 p-3 text-sm text-white focus:border-safety-orange focus:outline-none transition-colors" placeholder="email@example.com" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono uppercase text-muted-foreground">Сообщение</label>
                                <textarea rows={4} className="w-full bg-black/20 border border-white/10 p-3 text-sm text-white focus:border-safety-orange focus:outline-none transition-colors" placeholder="Опишите вашу задачу..." required />
                            </div>
                            <button type="submit" className="w-full bg-safety-orange hover:bg-safety-orange-vivid text-white font-bold py-3 uppercase tracking-wider text-xs transition-colors">
                                Отправить
                            </button>
                        </form>
                    </div>

                </div>

                {/* Map Section */}
                <div className="h-full min-h-[500px] border border-industrial-border bg-black/50 overflow-hidden relative">
                    {/* Reuse MapComponent but point it to the office */}
                    <div className="absolute inset-0">
                        {/* @ts-ignore - Mocking project type for reuse */}
                        <MapComponent projects={OFFICE_LOCATION} />
                    </div>
                </div>

            </div>
        </div>
    );
}
