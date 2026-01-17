"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Box, Cpu, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const SOLUTIONS = [
    {
        id: "turnkey",
        title: "Оснащение под ключ",
        description: "Комплексное техническое перевооружение предприятий. От аудита технологии до запуска производства.",
        icon: Box,
        gradient: "from-blue-900/20 to-black"
    },
    {
        id: "automation",
        title: "Автоматизация и Роботизация",
        description: "Внедрение роботизированных ячеек и автоматических линий для серийного производства.",
        icon: Zap,
        gradient: "from-purple-900/20 to-black"
    },
    {
        id: "digital",
        title: "Цифровой Двойник",
        description: "Разработка цифровых двойников производства для оптимизации процессов и предиктивного обслуживания.",
        icon: Cpu,
        gradient: "from-emerald-900/20 to-black"
    },
    {
        id: "service",
        title: "Сервис и Экспертиза",
        description: "24/7 техническая поддержка, обучение персонала и проведение пуско-наладочных работ.",
        icon: ShieldCheck,
        gradient: "from-orange-900/20 to-black"
    }
];

export default function SolutionsPage() {
    return (
        <div className="min-h-screen bg-industrial-surface text-white pt-24 pb-20">
            {/* Header */}
            <div className="container mx-auto px-6 mb-12">
                <div className="border-b border-industrial-border pb-6">
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-white">
                        Инженерные <span className="text-safety-orange">Решения</span>
                    </h1>
                    <p className="text-muted-foreground font-mono text-sm max-w-2xl">
                        КОМПЛЕКСНЫЕ ПОДХОДЫ К МОДЕРНИЗАЦИИ ПРОМЫШЛЕННЫХ ПРЕДПРИЯТИЙ РОССИИ.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {SOLUTIONS.map((solution, index) => (
                    <div key={solution.id} className="group relative bg-industrial-panel border border-industrial-border overflow-hidden min-h-[300px] flex flex-col justify-end p-8 transition-all duration-500 hover:border-safety-orange hover:shadow-[0_0_30px_rgba(255,61,0,0.15)]">
                        {/* Abstract Background Gradient */}
                        <div className={`absolute inset-0 z-0 bg-gradient-to-br ${solution.gradient} opacity-50 group-hover:opacity-100 transition-all duration-700`} />
                        <div className="absolute inset-0 bg-[url('/images/pattern_grid.png')] opacity-10 group-hover:opacity-20 transition-opacity" />

                        {/* Content */}
                        <div className="relative z-10">
                            <div className="mb-4">
                                <solution.icon className="w-10 h-10 text-safety-orange mb-4 opacity-80 group-hover:opacity-100 transition-opacity" />
                                <h3 className="text-2xl font-bold uppercase leading-tight mb-2 group-hover:text-safety-orange transition-colors">
                                    {solution.title}
                                </h3>
                                <p className="text-muted-foreground text-sm font-mono leading-relaxed mb-6">
                                    {solution.description}
                                </p>
                            </div>

                            <Link href={solution.id === 'digital' ? "/digital-twin" : "/contacts"}>
                                <Button variant="outline" className="border-white/20 text-white hover:bg-safety-orange hover:border-safety-orange hover:text-white uppercase text-xs font-bold tracking-wider rounded-none group-hover:px-6 transition-all">
                                    {solution.id === 'digital' ? "Запустить Демо" : "Обсудить Проект"}
                                    <ArrowRight className="w-3 h-3 ml-2 group-hover:ml-3 transition-all" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* CTA Section */}
            <div className="container mx-auto px-6 mt-20">
                <div className="bg-safety-orange text-white p-12 relative overflow-hidden clip-path-slant">
                    <div className="absolute inset-0 bg-[url('/images/pattern_grid.png')] opacity-10" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h2 className="text-3xl font-black uppercase mb-2">Готовы к модернизации?</h2>
                            <p className="font-mono text-white/80">Оставьте заявку на аудит вашего производства уже сегодня.</p>
                        </div>
                        <Link href="/contacts">
                            <Button className="bg-black text-white hover:bg-zinc-900 hover:text-white font-bold uppercase tracking-wider px-8 py-6 rounded-none transition-colors border-2 border-black hover:border-black">
                                Получить Консультацию
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
