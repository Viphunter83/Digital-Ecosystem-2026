"use client";
import { useState, useEffect } from 'react';
import { submitLead } from '@/lib/leadService';
import { fetchOffices, Office, fetchSiteContent } from '@/lib/api';

import dynamic from 'next/dynamic';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

// Dynamically import MapComponent to avoid SSR issues
const MapComponent = dynamic(
    () => import('@/components/MapComponent'),
    { ssr: false }
);

// Convert Office to map project format
const officeToMapProject = (office: Office) => ({
    id: office.id,
    title: office.name.toUpperCase(),
    client: { name: "ТД РУССТАНКОСБЫТ", industry: "Engineering", region: office.address || office.region },
    region: office.address || office.region || "МОСКВА, РОССИЯ",
    latitude: Number(office.latitude) || 55.790484,
    longitude: Number(office.longitude) || 37.467581,
    status: "ACTIVE",
    kpi: 100,
    description: office.description || "",
    isOffice: true // Flag to distinguish from projects
});

export default function ContactsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [offices, setOffices] = useState<Office[]>([]);
    const [agreed, setAgreed] = useState(false);
    const [siteContent, setSiteContent] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchOffices().then(setOffices);
        fetchSiteContent().then(setSiteContent);
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!agreed) {
            setStatus('error');
            return;
        }

        setIsLoading(true);
        setStatus('idle');

        const formData = new FormData(e.currentTarget);
        try {
            await submitLead({
                name: formData.get('name') as string,
                phone: formData.get('phone') as string,
                email: formData.get('email') as string,
                message: formData.get('message') as string,
                source: "site_contact_form"
            });
            setStatus('success');
            (e.target as HTMLFormElement).reset();
        } catch (err) {
            console.error(err);
            setStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

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
                            <div className="flex flex-col">
                                <h3 className="font-mono text-xs text-muted-foreground uppercase mb-1">E-mail</h3>
                                <a href="mailto:zakaz@td-rss.ru" className="text-lg font-bold hover:text-safety-orange transition-colors block break-all">
                                    zakaz@td-rss.ru
                                </a>
                            </div>
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
                            <a href="https://t.me/Russtanko2026_bot" target="_blank" rel="noopener noreferrer" className="text-lg font-bold hover:text-safety-orange transition-colors block">
                                @Russtanko2026_bot
                            </a>
                            <p className="text-sm text-gray-500 mt-1">Новости и спецпредложения</p>
                        </div>

                        <div className="bg-industrial-panel p-6 border border-industrial-border group hover:border-safety-orange transition-colors duration-300">
                            <MapPin className="w-6 h-6 text-safety-orange mb-4" />
                            <h3 className="font-mono text-xs text-muted-foreground uppercase mb-1">Офис</h3>
                            <p className="text-lg font-bold text-white line-clamp-2">
                                {siteContent.contact_address || "Москва, улица Берзарина, 36, стр. 2"}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">Центральный офис</p>
                        </div>
                    </div>

                    {/* Requisites Section */}
                    <div className="bg-industrial-panel/30 border border-white/5 p-8 font-mono text-xs space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-safety-orange" />
                            <h3 className="font-bold uppercase tracking-widest text-white">Реквизиты Компании</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-muted-foreground">
                            <div>
                                <span className="block text-white/40 mb-1">ИНН:</span>
                                <span className="text-white text-sm">{siteContent.company_inn || "7718986022"}</span>
                            </div>
                            <div>
                                <span className="block text-white/40 mb-1">КПП:</span>
                                <span className="text-white text-sm">{siteContent.company_kpp || "773401001"}</span>
                            </div>
                        </div>
                        <div className="space-y-3 pt-2 border-t border-white/5">
                            <div>
                                <span className="block text-safety-orange/70 mb-1 uppercase tracking-tighter">АО «АЛЬФА-БАНК»</span>
                                <p className="text-white/80 leading-relaxed">
                                    {siteContent.company_bank_alfa || "БИК: 44525593, Р/С: 40702810402020007936"}
                                </p>
                            </div>
                            <div>
                                <span className="block text-safety-orange/70 mb-1 uppercase tracking-tighter">АО КБ «МОДУЛЬБАНК»</span>
                                <p className="text-white/80 leading-relaxed">
                                    {siteContent.company_bank_modul || "БИК: 44525092, Р/С: 40702810370010439680"}
                                </p>
                            </div>
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
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-mono uppercase text-muted-foreground">ФИО / Компания</label>
                                    <input name="name" type="text" className="w-full bg-black/40 border border-white/10 p-3 text-sm text-white focus:border-safety-orange focus:outline-none transition-colors rounded-none placeholder:text-white/20" placeholder="ООО 'ТехноПром'" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-mono uppercase text-muted-foreground">Контактный Телефон</label>
                                    <input name="phone" type="tel" className="w-full bg-black/40 border border-white/10 p-3 text-sm text-white focus:border-safety-orange focus:outline-none transition-colors rounded-none placeholder:text-white/20" placeholder="+7 (___) ___-__-__" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono uppercase text-muted-foreground">Email</label>
                                <input name="email" type="email" className="w-full bg-black/40 border border-white/10 p-3 text-sm text-white focus:border-safety-orange focus:outline-none transition-colors rounded-none placeholder:text-white/20" placeholder="info@company.ru" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono uppercase text-muted-foreground">Суть Запроса</label>
                                <textarea name="message" rows={4} className="w-full bg-black/40 border border-white/10 p-3 text-sm text-white focus:border-safety-orange focus:outline-none transition-colors rounded-none placeholder:text-white/20" placeholder="Интересует поставка оборудования..." required />
                            </div>

                            <div className="flex items-start space-x-2 py-2">
                                <input
                                    type="checkbox"
                                    id="agreed-contacts"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="mt-1 h-4 w-4 rounded border-white/10 bg-black/40 text-safety-orange focus:ring-safety-orange"
                                    required
                                />
                                <label htmlFor="agreed-contacts" className="text-[10px] text-muted-foreground uppercase font-mono leading-tight">
                                    Я даю согласие на обработку <a href="/privacy" className="text-safety-orange underline">персональных данных</a> (152-ФЗ).
                                </label>
                            </div>

                            {status === 'success' && (
                                <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-bold">
                                    ✅ ЗАЯВКА ОТПРАВЛЕНА. МЕНЕДЖЕР СВЯЖЕТСЯ С ВАМИ.
                                </div>
                            )}
                            {status === 'error' && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                                    🛑 ОШИБКА ОТПРАВКИ. ПОПРОБУЙТЕ ПОЗЖЕ ИЛИ ПОЗВОНИТЕ НАМ.
                                </div>
                            )}

                            <button disabled={isLoading} type="submit" className="w-full sm:w-auto bg-safety-orange hover:bg-safety-orange-vivid text-white font-bold py-3 px-8 uppercase tracking-wider text-xs transition-all clip-path-slant hover:translate-x-1 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isLoading ? "ОТПРАВКА..." : "ОТПРАВИТЬ ЗАПРОС"}
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
                        <MapComponent projects={offices.length > 0 ? offices.map(officeToMapProject) : [officeToMapProject({ id: "default", name: "Офис", latitude: 55.790484, longitude: 37.467581, is_headquarters: true })]} />
                    </div>
                </div>

            </div>
        </div>
    );
}
