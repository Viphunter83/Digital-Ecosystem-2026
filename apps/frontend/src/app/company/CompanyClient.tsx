"use client";

import { useEffect, useState } from "react";
import { ProductionSite } from "@/lib/api";

interface CompanyClientProps {
    initialContent: Record<string, string>;
    initialSites: ProductionSite[];
}

export default function CompanyClient({ initialContent, initialSites }: CompanyClientProps) {
    const [content] = useState<Record<string, string>>(initialContent);
    const [sites] = useState<ProductionSite[]>(initialSites);

    // Parse comma-separated values
    const values = content.company_values?.split(',') || [
        "Честность и прозрачность",
        "Технологическая независимость",
        "Ответственность за результат",
        "Долгосрочное партнерство"
    ];

    // Fallback content
    const aboutTitle = content.company_about_title || "О Нас";
    const aboutText = content.company_about_text || "Торговый Дом «РУССтанкоСбыт» — это современный инженерный центр, специализирующийся на подборе и поставке металлообрабатывающего оборудования.";
    const aboutText2 = content.company_about_text2 || "Мы не просто продаем станки — мы внедряем технологии, которые повышают эффективность вашего производства.";

    // Stats with fallbacks
    const stats = [
        { value: content.company_stat_years || "12", label: "Лет успеха на рынке" },
        { value: content.company_stat_sites || "4", label: "Производственных площадки" },
        { value: content.company_stat_area || "15 000", label: "Кв.м. площадей" },
        { value: content.company_stat_employees || "200+", label: "Квалифицированных сотрудников" },
    ];

    // Fallback sites if API didn't return any
    const displaySites = sites.length > 0 ? sites : [
        { id: "1", site_number: 1, city: "РЯЗАНЬ", description: "Производство полного цикла токарных станков с ЧПУ и трубонарезных станков." },
        { id: "2", site_number: 2, city: "ВОРОНЕЖ", description: "Тяжелая механическая обработка деталей массой до 150 тонн." },
        { id: "3", site_number: 3, city: "ИЖЕВСК", description: "Производство конических зубчатых колес с круговым зубом." },
        { id: "4", site_number: 4, city: "БЕЛАРУСЬ", description: "Партнерская производственная площадка. Литье станин." },
    ];

    return (
        <div className="container mx-auto px-6 space-y-24">

            {/* Section 1: About & Mission */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
                <div className="space-y-6">
                    <div className="prose prose-invert max-w-none">
                        <h3 className="text-2xl font-bold uppercase text-white mb-4 border-l-4 border-safety-orange pl-4">
                            {aboutTitle}
                        </h3>
                        <p className="text-gray-300 leading-relaxed text-lg">
                            {aboutText}
                        </p>
                        <p className="text-gray-400 leading-relaxed">
                            {aboutText2}
                        </p>
                    </div>
                </div>

                {/* Key Stats Grid */}
                <div className="grid grid-cols-2 gap-8 bg-industrial-panel p-8 border border-industrial-border">
                    {stats.map((stat, i) => (
                        <div key={i}>
                            <div className="text-4xl font-black text-safety-orange mb-1">{stat.value}</div>
                            <div className="text-xs font-mono text-muted-foreground uppercase">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Section 2: Production Geography */}
            <div>
                <h2 className="text-3xl font-black uppercase text-white mb-8 flex items-center gap-4">
                    <span className="w-12 h-1 bg-safety-orange" />
                    География Производства
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displaySites.map((site) => (
                        <div key={site.id} className="bg-industrial-panel border border-industrial-border p-6 hover:border-safety-orange transition-colors group">
                            <div className="text-safety-orange text-sm font-mono mb-2">ПЛОЩАДКА №{site.site_number}</div>
                            <h4 className="text-xl font-bold text-white mb-4">{site.city}</h4>
                            <p className="text-sm text-gray-400">{site.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Section 3: Values */}
            <div className="border-t border-industrial-border pt-16">
                <h3 className="text-xl font-bold uppercase text-white mb-8 text-center">Наши Ценности</h3>
                <div className="flex flex-wrap justify-center gap-4">
                    {values.map((val, i) => (
                        <div key={i} className="px-6 py-3 bg-white/5 border border-white/10 rounded-full font-mono text-sm uppercase hover:bg-safety-orange hover:text-white transition-colors cursor-default">
                            {val.trim()}
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
