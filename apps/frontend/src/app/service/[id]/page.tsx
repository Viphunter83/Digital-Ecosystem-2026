"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchMachineInstance, MachineInstance, fetchRecommendedSpares, Product } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle2,
    Clock,
    Wrench,
    ShieldCheck,
    Zap,
    Cog,
    History,
    ArrowLeft,
    Activity,
    Cpu,
    Settings,
    FileText,
    Download,
    ShoppingCart,
    Plus,
    Package
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { DigitalTwinViewer } from "@/components/DigitalTwinViewer";
import { useCartStore } from "@/lib/stores/useCartStore";

// Icon mapping for status steps
const STATUS_ICON_MAP: Record<string, any> = {
    CheckCircle2,
    Clock,
    Wrench,
};

export default function MachinePassportPage() {
    const params = useParams();
    const id = params.id as string;
    const [instance, setInstance] = useState<MachineInstance | null>(null);
    const [recommendedSpares, setRecommendedSpares] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"passport" | "twin" | "docs">("passport");

    const addItem = useCartStore(state => state.addItem);

    useEffect(() => {
        const loadData = async () => {
            if (id) {
                const data = await fetchMachineInstance(id);
                if (data) {
                    setInstance(data);
                    const spares = await fetchRecommendedSpares(data.serial_number);
                    setRecommendedSpares(spares);
                }
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const handleAddToCart = (product: Product) => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price || 0,
            image_url: product.image_url,
            slug: product.slug || ''
        });
        toast.success(`Добавлено: ${product.name}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-safety-orange"></div>
            </div>
        );
    }

    if (!instance) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-6">
                <h1 className="text-2xl font-black uppercase mb-4">Паспорт не найден</h1>
                <p className="text-gray-500 mb-8 font-mono">ID: {id}</p>
                <Link href="/service">
                    <Button variant="outline" className="border-white/10 hover:bg-white/5">
                        <ArrowLeft size={16} className="mr-2" /> Назад в Сервис
                    </Button>
                </Link>
            </div>
        );
    }

    const productNames = instance.product?.name.replace(/^ТД РУССтанкоСбыт\s*-\s*/i, "") || "Оборудование";

    return (
        <div className="min-h-screen bg-black text-white selection:bg-safety-orange/30">
            {/* Context Header */}
            <div className="bg-industrial-surface border-b border-white/5 pt-24 pb-8">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="space-y-4">
                            <Link href="/service" className="inline-flex items-center text-white/40 hover:text-safety-orange transition-colors font-mono text-[10px] md:text-xs uppercase tracking-widest">
                                <ArrowLeft size={14} className="mr-2" /> <span className="hidden xs:inline">Вернуться в </span>Сервис
                            </Link>
                            <div>
                                <h1 className="text-3xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-2">
                                    {instance.serial_number}
                                </h1>
                                <div className="flex flex-wrap items-center gap-2 md:gap-4 font-mono text-[10px] md:text-xs text-white/30 uppercase">
                                    <span>{productNames}</span>
                                    <span className="hidden xs:block w-1.5 h-1.5 bg-white/10 rounded-full" />
                                    <span>Inv: {instance.inventory_number || "N/A"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex w-full md:w-auto gap-1 p-1 bg-black/40 border border-white/5 rounded-none overflow-x-auto no-scrollbar">
                            {(["passport", "twin", "docs"] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 md:flex-none px-3 md:px-6 py-2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? "bg-safety-orange text-white" : "text-white/40 hover:bg-white/5 hover:text-white"}`}
                                >
                                    {tab === "passport" && "Паспорт"}
                                    {tab === "twin" && "Двойник"}
                                    {tab === "docs" && "Документы"}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-6 py-12">
                <AnimatePresence mode="wait">
                    {activeTab === "passport" && (
                        <motion.div
                            key="passport"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                        >
                            {/* Left: Progress & Status */}
                            <div className="lg:col-span-4 space-y-6">
                                <Card className="bg-industrial-panel border-white/5 rounded-none text-white">
                                    <CardHeader className="bg-white/5 border-b border-white/5 pb-3">
                                        <CardTitle className="text-xs uppercase tracking-[0.2em] font-black flex items-center justify-between">
                                            <span>Статус Обслуживания</span>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-safety-orange animate-pulse" />
                                                <span className="text-[10px] text-safety-orange">LIVE</span>
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="space-y-6">
                                            {instance.service_history.map((step, idx) => {
                                                const Icon = STATUS_ICON_MAP[step.icon] || CheckCircle2;
                                                const isDone = step.status === 'done';
                                                const isActive = step.status === 'active';

                                                return (
                                                    <div key={idx} className="flex gap-4 relative">
                                                        {idx !== instance.service_history.length - 1 && (
                                                            <div className={`absolute top-8 left-4 w-[1px] h-6 ${isDone ? 'bg-safety-orange' : 'bg-white/10'}`} />
                                                        )}
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border z-10 ${isDone ? 'bg-safety-orange border-safety-orange text-white' : isActive ? 'border-safety-orange text-safety-orange animate-pulse shadow-[0_0_10px_rgba(255,61,0,0.3)]' : 'border-white/10 text-white/20'}`}>
                                                            <Icon size={14} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-white' : isDone ? 'text-white/80' : 'text-white/20'}`}>
                                                                {step.title}
                                                            </span>
                                                            <span className="text-[10px] font-mono text-white/40">{step.date}</span>
                                                            {isActive && (
                                                                <p className="text-[10px] text-safety-orange/70 mt-1 italic">{step.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <Link href={`https://t.me/Russtanko2026_bot?start=service_${instance.serial_number}`} target="_blank" className="block w-full">
                                            <Button
                                                className="w-full mt-8 bg-safety-orange hover:bg-white hover:text-black text-white font-black rounded-none uppercase tracking-widest text-xs h-12 transition-all"
                                            >
                                                Вызвать инженера
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-industrial-panel border border-white/5 p-4 space-y-2">
                                        <Activity size={16} className="text-safety-orange" />
                                        <div className="text-[10px] text-white/40 uppercase font-bold">Наработка</div>
                                        <div className="text-2xl font-black font-mono">12,480 <span className="text-[10px] font-light">ч</span></div>
                                    </div>
                                    <div className="bg-industrial-panel border border-white/5 p-4 space-y-2">
                                        <Clock size={16} className="text-safety-orange" />
                                        <div className="text-[10px] text-white/40 uppercase font-bold">След. ТО</div>
                                        <div className="text-xl font-black font-mono">
                                            {instance.next_maintenance_date
                                                ? new Date(instance.next_maintenance_date).toLocaleDateString('ru-RU')
                                                : "Н/Д"
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Center: Specs & Info */}
                            <div className="lg:col-span-8 space-y-8">
                                <section className="bg-industrial-panel border border-white/5 p-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                                        <Settings size={200} className="animate-[spin_40s_linear_infinite]" />
                                    </div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                                        <div className="w-1 h-8 bg-safety-orange" />
                                        Технический Формуляр
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 relative z-10">
                                        {instance.product?.specs ? Object.entries(instance.product.specs).slice(0, 10).map(([key, val]) => (
                                            <div key={key} className="flex justify-between items-center border-b border-white/5 pb-3">
                                                <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{key}</span>
                                                <span className="text-sm font-mono font-bold">{String(val)}</span>
                                            </div>
                                        )) : (
                                            <div className="col-span-2 text-white/20 font-mono text-center py-10 italic">
                                                [ ДАННЫЕ НЕ ЗАПОЛНЕНЫ ]
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="p-6 bg-white/5 border border-white/5 hover:border-safety-orange/30 transition-all group">
                                        <ShieldCheck className="w-8 h-8 text-safety-orange mb-4 opacity-50 group-hover:opacity-100" />
                                        <h4 className="text-sm font-bold uppercase mb-2">Гарантия</h4>
                                        <p className="text-[11px] text-white/40 leading-relaxed uppercase tracking-wider">Действует до 20 ноября 2027 г.</p>
                                    </div>
                                    <div className="p-6 bg-white/5 border border-white/5 hover:border-safety-orange/30 transition-all group">
                                        <Download className="w-8 h-8 text-safety-orange mb-4 opacity-50 group-hover:opacity-100" />
                                        <h4 className="text-sm font-bold uppercase mb-2">ПО (V2.4)</h4>
                                        <p className="text-[11px] text-white/40 leading-relaxed uppercase tracking-wider">Установлено последнее обновление.</p>
                                    </div>
                                    <div className="p-6 bg-white/5 border border-white/5 hover:border-safety-orange/30 transition-all group">
                                        <Cpu className="w-8 h-8 text-safety-orange mb-4 opacity-50 group-hover:opacity-100" />
                                        <h4 className="text-sm font-bold uppercase mb-2">Конфигурация</h4>
                                        <p className="text-[11px] text-white/40 leading-relaxed uppercase tracking-wider">Усиленный шпиндель (15кВт), Fanuc 0i-TF.</p>
                                    </div>
                                </div>

                                {recommendedSpares.length > 0 && (
                                    <section className="space-y-6">
                                        <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                            <Package size={24} className="text-safety-orange" />
                                            Рекомендованный Комплект ТО
                                        </h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {recommendedSpares.map((spare) => (
                                                <div key={spare.id} className="bg-industrial-panel border border-white/5 p-4 flex flex-col justify-between group hover:border-safety-orange/30 transition-all">
                                                    <div>
                                                        <div className="aspect-square bg-white/5 mb-4 overflow-hidden">
                                                            <img
                                                                src={spare.image_url || "/images/products/spare_placeholder.png"}
                                                                alt={spare.name}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                            />
                                                        </div>
                                                        <h3 className="text-xs font-bold uppercase tracking-tight mb-1 line-clamp-2">{spare.name}</h3>
                                                        <p className="text-[10px] text-white/30 font-mono mb-4">{spare.price?.toLocaleString()} ₽</p>
                                                    </div>
                                                    <Button
                                                        onClick={() => handleAddToCart(spare)}
                                                        className="w-full bg-white/5 hover:bg-safety-orange text-white text-[10px] font-bold uppercase h-9 rounded-none flex items-center gap-2"
                                                    >
                                                        <Plus size={14} /> В корзину
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "twin" && (
                        <motion.div
                            key="twin"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-[60vh] bg-industrial-panel border border-white/5 relative"
                        >
                            <DigitalTwinViewer />
                            <div className="absolute top-6 left-6 p-4 bg-black/60 backdrop-blur-md border border-white/10 max-w-xs">
                                <h3 className="text-xs font-black uppercase text-safety-orange mb-2">RTX Telemetry</h3>
                                <div className="space-y-1 font-mono text-[9px] text-white/50">
                                    <div className="flex justify-between"><span>POSITION X</span> <span>420.003</span></div>
                                    <div className="flex justify-between"><span>POSITION Y</span> <span>-12.441</span></div>
                                    <div className="flex justify-between text-green-400"><span>LOAD</span> <span>OK</span></div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "docs" && (
                        <motion.div
                            key="docs"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        >
                            {[
                                { name: "Инструкция по эксплуатации", size: "12.4 MB", date: "12.2025" },
                                { name: "Паспорт станка (PDF)", size: "4.1 MB", date: "11.2025" },
                                { name: "Схема электрооборудования", size: "22.8 MB", date: "01.2026" },
                                { name: "Регламент ТО-1", size: "1.2 MB", date: "Июль 2026" },
                            ].map((doc, i) => (
                                <div key={i} className="bg-industrial-panel border border-white/5 p-6 flex flex-col justify-between group hover:border-safety-orange/50 transition-all">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-3 bg-white/5 group-hover:bg-safety-orange/20 transition-colors">
                                            <FileText className="w-6 h-6 text-safety-orange" />
                                        </div>
                                        <button className="text-white/20 hover:text-white transition-colors">
                                            <Download size={18} />
                                        </button>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold uppercase mb-2 group-hover:text-safety-orange transition-colors">{doc.name}</h3>
                                        <div className="flex justify-between font-mono text-[9px] text-white/30 uppercase">
                                            <span>{doc.size}</span>
                                            <span>{doc.date}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
