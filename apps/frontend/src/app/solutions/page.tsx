"use client";

import { Card } from "@/components/ui/card";
import { Settings, Truck, Code, Wrench, ShieldCheck, Cpu } from "lucide-react";
import { ShimmerButton } from "@/components/ShimmerButton";

const SOLUTIONS = [
    {
        title: "ПРОМЫШЛЕННЫЙ ЛИЗИНГ",
        description: "Гибкие финансовые инструменты для модернизации производства. Лизинг до 5 лет с минимальным авансом.",
        icon: Truck,
        id: "01"
    },
    {
        title: "СЕРВИСНОЕ ОБСЛУЖИВАНИЕ",
        description: "24/7 техническая поддержка и плановое обслуживание оборудования. Собственный штат сертифицированных инженеров.",
        icon: Wrench,
        id: "02"
    },
    {
        title: "ЦИФРОВИЗАЦИЯ (IIoT)",
        description: "Внедрение систем сбора данных и аналитики эффективности оборудования (OEE) на базе платформы PWA.",
        icon: Code,
        id: "03"
    },
    {
        title: "ИНЖИНИРИНГ",
        description: "Разработка технологических процессов и подбор оборудования под задачи вашего производства.",
        icon: Settings,
        id: "04"
    },
    {
        title: "АУДИТ БЕЗОПАСНОСТИ",
        description: "Комплексная проверка производственных линий на соответствие стандартам безопасности труда.",
        icon: ShieldCheck,
        id: "05"
    },
    {
        title: "АВТОМАТИЗАЦИЯ",
        description: "Проектирование и внедрение роботизированных комплексов для серийного производства.",
        icon: Cpu,
        id: "06"
    }
];

export default function SolutionsPage() {
    return (
        <div className="min-h-screen bg-industrial-surface text-white pt-24 pb-20 relative overflow-hidden">
            {/* Global Background Pattern for depth */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,61,0,0.05)_0%,transparent_40%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20" />

            {/* Header */}
            <div className="container mx-auto px-6 mb-16 relative z-10">
                <div className="border-b border-industrial-border pb-6">
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-white font-manrope">
                        Технологические <span className="text-safety-orange">Решения</span>
                    </h1>
                    <p className="text-muted-foreground font-mono text-sm max-w-2xl uppercase tracking-wider">
                        Комплексный подход к модернизации производства. От поставки оборудования до цифровой трансформации.
                    </p>
                </div>
            </div>

            {/* Grid */}
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {SOLUTIONS.map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <Card key={i} className="group bg-white/5 backdrop-blur-sm border border-white/10 p-8 relative overflow-hidden transition-all duration-500 hover:border-safety-orange hover:shadow-[0_0_50px_rgba(255,61,0,0.3)] rounded-none hover:bg-white/10">
                                {/* Technical background details */}
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/5 to-transparent -mr-8 -mt-8 rotate-45 group-hover:from-safety-orange/20 transition-colors" />
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative z-10">
                                    <div className="mb-6 flex items-start justify-between">
                                        <div className="p-4 bg-industrial-surface border border-industrial-border group-hover:border-safety-orange group-hover:bg-safety-orange/10 group-hover:text-safety-orange transition-all duration-300 shadow-[0_0_0_0_rgba(255,61,0,0)] group-hover:shadow-[0_0_20px_rgba(255,61,0,0.4)]">
                                            <Icon className="w-8 h-8" />
                                        </div>
                                        <span className="font-mono text-5xl font-black text-white/10 select-none group-hover:text-safety-orange/20 transition-colors duration-500">{item.id}</span>
                                    </div>

                                    <h3 className="text-xl font-bold uppercase tracking-wide text-white mb-4 font-manrope group-hover:text-safety-orange transition-colors group-hover:drop-shadow-[0_0_8px_rgba(255,61,0,0.5)]">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm leading-relaxed font-mono">
                                        {item.description}
                                    </p>
                                </div>

                                {/* Hover line at bottom */}
                                <div className="absolute bottom-0 left-0 w-0 h-1 bg-safety-orange group-hover:w-full transition-all duration-500 shadow-[0_0_20px_#ff3d00]" />
                            </Card>
                        )
                    })}
                </div>
            </div>

            {/* Call to Action */}
            <div className="container mx-auto px-6 mt-20">
                <div className="bg-gradient-to-r from-industrial-panel to-industrial-surface border border-industrial-border p-12 relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h2 className="text-3xl font-bold uppercase mb-2 font-manrope">Готовы обсудить проект?</h2>
                            <p className="text-muted-foreground font-mono text-sm">Наши инженеры подготовят техническое решение за 48 часов.</p>
                        </div>
                        <div className="w-full md:w-auto">
                            <ShimmerButton className="w-full md:w-auto px-8 h-14 text-sm font-bold tracking-wider">
                                СВЯЗАТЬСЯ С ИНЖЕНЕРОМ
                            </ShimmerButton>
                        </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-full bg-safety-orange/5 -skew-x-12 transform translate-x-32 group-hover:bg-safety-orange/10 transition-colors duration-500" />
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-safety-orange/50 to-transparent opacity-50" />
                </div>
            </div>
        </div>
    );
}
