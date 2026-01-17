"use client";

import { Card } from "@/components/ui/card";
import { Settings, Truck, Code, Wrench, ShieldCheck, Cpu } from "lucide-react";

const SOLUTIONS = [
    {
        title: "ПРОМЫШЛЕННЫЙ ЛИЗИНГ",
        description: "Гибкие финансовые инструменты для модернизации производства. Лизинг до 5 лет с минимальным авансом.",
        icon: Truck,
        color: "text-safety-orange"
    },
    {
        title: "СЕРВИСНОЕ ОБСЛУЖИВАНИЕ",
        description: "24/7 техническая поддержка и плановое обслуживание оборудования. Собственный штат сертифицированных инженеров.",
        icon: Wrench,
        color: "text-blue-400"
    },
    {
        title: "ЦИФРОВИЗАЦИЯ (IIoT)",
        description: "Внедрение систем сбора данных и аналитики эффективности оборудования (OEE) на базе платформы PWA.",
        icon: Code,
        color: "text-green-400"
    },
    {
        title: "ИНЖИНИРИНГ",
        description: "Разработка технологических процессов и подбор оборудования под задачи вашего производства.",
        icon: Settings,
        color: "text-purple-400"
    },
    {
        title: "АУДИТ БЕЗОПАСНОСТИ",
        description: "Комплексная проверка производственных линий на соответствие стандартам безопасности труда.",
        icon: ShieldCheck,
        color: "text-red-400"
    },
    {
        title: "АВТОМАТИЗАЦИЯ",
        description: "Проектирование и внедрение роботизированных комплексов для серийного производства.",
        icon: Cpu,
        color: "text-yellow-400"
    }
];

export default function SolutionsPage() {
    return (
        <div className="min-h-screen bg-industrial-surface text-white pt-24 pb-20">
            {/* Header */}
            <div className="container mx-auto px-6 mb-16">
                <div className="border-b border-industrial-border pb-6">
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-white">
                        Технологические <span className="text-safety-orange">Решения</span>
                    </h1>
                    <p className="text-muted-foreground font-mono text-sm max-w-2xl">
                        КОМПЛЕКСНЫЙ ПОДХОД К МОДЕРНИЗАЦИИ ПРОИЗВОДСТВА. ОТ ПОСТАВКИ ОБОРУДОВАНИЯ ДО ЦИФРОВОЙ ТРАНСФОРМАЦИИ.
                    </p>
                </div>
            </div>

            {/* Grid */}
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {SOLUTIONS.map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <Card key={i} className="bg-industrial-panel border-industrial-border p-8 group hover:border-safety-orange/50 transition-all duration-300 hover:shadow-lg hover:shadow-safety-orange/5">
                                <div className="mb-6 flex items-center justify-between">
                                    <div className={`p-3 rounded-md bg-white/5 border border-white/10 ${item.color}`}>
                                        <Icon className="w-8 h-8" />
                                    </div>
                                    <span className="font-mono text-xs text-muted-foreground opacity-50">0{i + 1}</span>
                                </div>
                                <h3 className="text-xl font-bold uppercase tracking-wide text-white mb-3 group-hover:text-safety-orange transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {item.description}
                                </p>
                            </Card>
                        )
                    })}
                </div>
            </div>

            {/* Call to Action */}
            <div className="container mx-auto px-6 mt-20">
                <div className="bg-gradient-to-r from-industrial-panel to-industrial-surface border border-industrial-border p-12 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h2 className="text-3xl font-bold uppercase mb-2">Готовы обсудить проект?</h2>
                            <p className="text-muted-foreground">Наши инженеры подготовят техническое решение за 48 часов.</p>
                        </div>
                        <button className="bg-safety-orange hover:bg-safety-orange-vivid text-white font-bold py-4 px-8 uppercase tracking-wider text-sm transition-all shadow-[0_0_20px_rgba(255,61,0,0.2)] hover:shadow-[0_0_30px_rgba(255,61,0,0.4)]">
                            Связаться с инженером
                        </button>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-full bg-safety-orange/5 -skew-x-12 transform translate-x-32" />
                </div>
            </div>
        </div>
    );
}
