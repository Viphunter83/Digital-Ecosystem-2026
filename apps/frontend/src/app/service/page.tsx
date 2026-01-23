"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, Wrench, ShieldCheck, Zap, Cog, History, ArrowRight, Check } from "lucide-react";
import { fetchServiceBySlug, fetchFeaturedInstance, Service, MachineInstance } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Icon mapping for dynamic icons from service history
const ICON_MAP: Record<string, any> = {
    CheckCircle2,
    Clock,
    Wrench,
};

export default function ServicePage() {
    const [service, setService] = useState<Service | null>(null);
    const [featuredMachine, setFeaturedMachine] = useState<MachineInstance | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const [serviceData, machineData] = await Promise.all([
                fetchServiceBySlug('remont-i-modernizatsiya'),
                fetchFeaturedInstance()
            ]);
            if (serviceData) setService(serviceData);
            if (machineData) setFeaturedMachine(machineData);
            setLoading(false);
        };
        loadData();
    }, []);

    // Use dynamic steps from featured machine, or fallback
    const steps = featuredMachine?.service_history?.map(step => ({
        title: step.title,
        date: step.date,
        active: step.status === 'active' || step.status === 'done',
        done: step.status === 'done',
        icon: ICON_MAP[step.icon] || CheckCircle2
    })) || [
            { title: "Заявка принята", date: "—", active: false, done: false, icon: CheckCircle2 },
            { title: "Дефектовка", date: "—", active: false, done: false, icon: Wrench },
            { title: "Ремонт", date: "—", active: false, done: false, icon: Clock },
            { title: "Готово", date: "—", active: false, done: false, icon: CheckCircle2 },
        ];

    // Dynamic machine data
    const machineSerial = featuredMachine?.serial_number || "CNC-2026-X";
    const machineInventory = featuredMachine?.inventory_number || "#000000";
    const machineUrl = `https://td-rss.ru/service/${machineSerial}`;

    if (loading) {
        return (
            <div className="container mx-auto py-24 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-safety-orange"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent text-white">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden border-b border-white/5">
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-safety-orange/10 border border-safety-orange/20 text-safety-orange text-xs font-mono uppercase tracking-widest mb-6">
                            <Wrench size={14} />
                            Industrial Service & Upgrade
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tight leading-none">
                            {service?.title || "РЕМОНТ И МОДЕРНИЗАЦИЯ"}
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                            {service?.description || "Комплексное техническое обслуживание и обновление станочного парка."}
                        </p>
                    </motion.div>
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-safety-orange/5 to-transparent -z-10" />
                <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-10 pointer-events-none">
                    <Cog size={400} className="animate-[spin_20s_linear_infinite]" />
                </div>
            </section>

            <div className="container mx-auto py-12 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Column: Technical Content */}
                    <div className="lg:col-span-8 space-y-16">

                        {/* Checklist Section */}
                        <div className="space-y-8">
                            <h2 className="text-2xl font-bold uppercase tracking-widest border-l-4 border-safety-orange pl-4">
                                {service?.content?.checklist_title || "Регламент работ"}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {service?.content?.checklist.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="flex items-start gap-3 p-4 bg-white/5 border border-white/5 hover:border-safety-orange/30 transition-colors group"
                                    >
                                        <div className="mt-1 bg-safety-orange/10 p-1 rounded group-hover:bg-safety-orange/20 transition-colors">
                                            <Check size={14} className="text-safety-orange" />
                                        </div>
                                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{item}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Cases Section */}
                        <div className="space-y-8">
                            <h2 className="text-2xl font-bold uppercase tracking-widest border-l-4 border-safety-orange pl-4">
                                Кейсы модернизации
                            </h2>
                            <div className="space-y-6">
                                {service?.content?.cases.map((project, idx) => (
                                    <Card key={idx} className="bg-industrial-panel border-white/10 overflow-hidden group">
                                        <div className="grid grid-cols-1 md:grid-cols-3">
                                            <div className="relative h-48 md:h-full overflow-hidden">
                                                <img
                                                    src={
                                                        project.image_url ||
                                                        (project.model.toLowerCase().includes('16к20') ? '/images/cases/case_16k20.png' :
                                                            project.model.toLowerCase().includes('6р12') ? '/images/cases/case_6r12.png' :
                                                                project.model.toLowerCase().includes('1м63') ? '/images/cases/case_1m63.png' :
                                                                    `https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400&h=300`)
                                                    }
                                                    alt={project.model}
                                                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                                                    <span className="text-[10px] font-mono text-safety-orange uppercase tracking-widest mb-1">Объект</span>
                                                    <h3 className="text-lg font-bold text-white uppercase">{project.model}</h3>
                                                </div>
                                            </div>
                                            <div className="md:col-span-2 p-6 space-y-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    <div>
                                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Проблема</h4>
                                                        <p className="text-sm text-gray-300">{project.problem}</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Что сделали</h4>
                                                        <p className="text-sm text-gray-300">{project.solution}</p>
                                                    </div>
                                                </div>
                                                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                                    <div>
                                                        <h4 className="text-xs font-bold text-safety-orange uppercase mb-1">Результат</h4>
                                                        <p className="text-sm font-bold text-white">{project.result}</p>
                                                    </div>
                                                    <ArrowRight size={16} className="text-safety-orange opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Passport & USP */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Equipment Status Lookup - Makes Business Sense */}
                        <Card className="bg-gradient-to-br from-deep-graphite to-black border-safety-orange/30 text-white overflow-hidden sticky top-24">
                            <CardHeader className="pb-2 border-b border-white/5 bg-white/5">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm uppercase tracking-[0.2em] text-safety-orange flex items-center gap-2">
                                        <History size={16} />
                                        Статус Оборудования
                                    </CardTitle>
                                    <div className="w-2 h-2 bg-safety-orange rounded-full animate-pulse" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {/* S/N Lookup Form */}
                                <div className="space-y-4">
                                    <div className="text-center space-y-2">
                                        <h3 className="font-bold text-lg uppercase tracking-wider">Проверить Статус</h3>
                                        <p className="text-xs text-gray-400">Введите серийный номер станка</p>
                                    </div>

                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            const form = e.target as HTMLFormElement;
                                            const input = form.elements.namedItem('serial') as HTMLInputElement;
                                            if (input.value.trim()) {
                                                window.location.href = `/service/${input.value.trim()}`;
                                            }
                                        }}
                                        className="space-y-3"
                                    >
                                        <input
                                            name="serial"
                                            type="text"
                                            placeholder="Например: CNC-2026-X"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-safety-orange focus:outline-none font-mono text-sm uppercase"
                                        />
                                        <Button type="submit" className="w-full bg-white/10 hover:bg-white/20 text-white font-bold h-11 uppercase tracking-widest transition-all border border-white/10">
                                            Найти
                                        </Button>
                                    </form>
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-deep-graphite px-2 text-gray-500">или</span>
                                    </div>
                                </div>

                                {/* Direct Contact CTA */}
                                <div className="space-y-3">
                                    <Link href="https://t.me/Russtanko2026_bot" target="_blank" className="block w-full">
                                        <Button className="w-full bg-safety-orange hover:bg-white hover:text-black text-white font-black h-12 uppercase tracking-widest transition-all">
                                            Связаться с Инженером
                                        </Button>
                                    </Link>
                                    <p className="text-[10px] text-center text-gray-500">
                                        Telegram: @Russtanko2026_bot
                                    </p>
                                </div>
                            </CardContent>
                        </Card>


                        {/* USP Section */}
                        <div className="space-y-4">
                            {service?.content?.usp.map((item, idx) => (
                                <Card key={idx} className="bg-white/5 border-white/5 hover:border-white/10 transition-all p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-safety-orange/10 rounded-lg">
                                            {idx === 0 && <ShieldCheck size={18} className="text-safety-orange" />}
                                            {idx === 1 && <Clock size={18} className="text-safety-orange" />}
                                            {idx === 2 && <Zap size={18} className="text-safety-orange" />}
                                            {idx >= 3 && <Cog size={18} className="text-safety-orange" />}
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold text-white uppercase">{item.title}</h4>
                                            <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
