"use client";

import { useUserContext, UserRole } from "@/stores/user-context";
import { ShimmerButton } from "@/components/ShimmerButton";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, Suspense } from "react";
import { Settings, User, Wrench, Wallet, Briefcase } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { HeroStats } from "./HeroStats";

// Exact Copy from User Request
const CONTENT_BY_ROLE: Record<UserRole, { title: string; subtitle: string; cta: string }> = {
    director: {
        title: "ИНВЕСТИЦИИ В НАДЕЖНОСТЬ ВАШЕГО ПРОИЗВОДСТВА",
        subtitle: "Работаем с ЗиО-Подольск. Окупаемость модернизации — 12 месяцев. Лизинг 0%.",
        cta: "РАССЧИТАТЬ ОКУПАЕМОСТЬ",
    },
    engineer: {
        title: "ПРОДЛИМ РЕСУРС ВАШЕГО СТАНКА НА 15 ЛЕТ",
        subtitle: "Собственное производство запчастей. Соблюдаем паспортные нормы точности (ГОСТ 8-82).",
        cta: "СКАЧАТЬ ТЕХ. СПЕЦИФИКАЦИИ",
    },
    buyer: {
        title: "ПОСТАВКА КОМПЛЕКТУЮЩИХ С ОТГРУЗКОЙ ЗА 24 ЧАСА",
        subtitle: "2500 позиций на складе. Счета за 5 минут. Доставка до двери.",
        cta: "ПОЛУЧИТЬ КП ЗА 5 МИНУТ",
    },
    default: {
        title: "ОБЕСПЕЧИВАЕМ БЕСПЕРЕБОЙНУЮ РАБОТУ СТАНОЧНОГО ПАРКА",
        subtitle: "Комплексные поставки металлообрабатывающего оборудования. Сервис, лизинг, цифровизация.",
        cta: "ЗАПУСТИТЬ ДИАГНОСТИКУ",
    },
};

function HeroSectionContent({ onOpenDiagnostics }: { onOpenDiagnostics: () => void }) {
    const { role, setRole } = useUserContext();
    const searchParams = useSearchParams();
    const content = CONTENT_BY_ROLE[role];
    const [mounted, setMounted] = useState(false);

    // Logic: Chameleon Detection (Strategies 1, 2, 3)
    useEffect(() => {
        setMounted(true);

        // 1. UTM / Query Param Strategy (?role=director)
        const roleParam = searchParams.get('role') as UserRole | null;
        if (roleParam && ['director', 'engineer', 'buyer'].includes(roleParam)) {
            setRole(roleParam);
        }

    }, [searchParams, setRole]);

    if (!mounted) return null;

    return (
        <section className="relative h-[90vh] min-h-[600px] flex items-center overflow-hidden border-b border-industrial-border bg-industrial-bg">

            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-safety-orange/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            </div>

            <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center lg:pb-32">

                {/* Text Content */}
                <div className="space-y-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={role}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="flex items-center space-x-2 text-safety-orange mb-4">
                                <span className="h-[2px] w-8 bg-safety-orange" />
                                <span className="text-xs font-mono uppercase tracking-widest font-bold">
                                    {role === 'default' ? 'SYSTEM V.2.0.26' : `DETECTED ROLE: ${role.toUpperCase()}`}
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-black text-white leading-[0.9] tracking-tighter uppercase mb-6">
                                {content.title}
                            </h1>

                            <p className="text-xl text-muted-foreground font-light max-w-xl leading-relaxed">
                                {content.subtitle}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <ShimmerButton
                            className="h-14 px-8 text-base bg-safety-orange border-none text-white hover:bg-safety-orange-vivid"
                            onClick={onOpenDiagnostics}
                        >
                            {content.cta}
                        </ShimmerButton>
                        <button className="h-14 px-8 border border-white/20 text-white font-mono uppercase tracking-wider text-sm hover:bg-white/5 transition-colors">
                            Видео презентация
                        </button>
                    </div>
                </div>

                {/* Visual/3D Placeholder - Replaced with Holographic Asset */}
                <div className="relative hidden lg:block h-[600px] w-full">
                    <div className="absolute inset-0 bg-transparent flex items-center justify-center">
                        <div className="relative w-full h-full">
                            {/* Floating Elements */}
                            <motion.div
                                animate={{ y: [0, -20, 0], opacity: [0.8, 1, 0.8] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 z-10"
                            >
                                <Image
                                    src="/images/holographic_cnc.png"
                                    alt="Holographic CNC System"
                                    fill
                                    className="object-contain drop-shadow-[0_0_30px_rgba(255,61,0,0.3)]"
                                    priority
                                />
                            </motion.div>

                            {/* Scanning Effect */}
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-safety-orange/50 animate-scan shadow-[0_0_20px_rgba(255,61,0,0.8)] z-20 opacity-50" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Stats Bar */}
            <HeroStats />

            {/* Debug Panel - Dev Only (Collapsible) */}
            <DebugPanel role={role} setRole={setRole} />
        </section>
    );
}

// Wrap in Suspense for useSearchParams
export function HeroSection(props: { onOpenDiagnostics: () => void }) {
    return (
        <Suspense fallback={<div className="h-[600px] w-full bg-industrial-bg animate-pulse" />}>
            <HeroSectionContent {...props} />
        </Suspense>
    );
}

function DebugPanel({ role, setRole }: { role: UserRole, setRole: (r: UserRole) => void }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-40px)]'}`}>
            <div className="bg-black/80 border border-industrial-border backdrop-blur rounded-lg shadow-2xl overflow-hidden">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full text-[10px] text-muted-foreground uppercase font-mono px-3 py-2 border-b border-white/10 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Settings className={`w-3 h-3 ${isOpen ? 'text-safety-orange' : ''}`} />
                        <span>Dev Control</span>
                    </div>
                    <span className="text-[10px]">{isOpen ? '▼' : '▲'}</span>
                </button>

                <div className={`p-2 flex gap-1 transition-all ${isOpen ? 'opacity-100' : 'opacity-0 h-0 p-0 overflow-hidden'}`}>
                    <RoleButton active={role === 'default'} onClick={() => setRole('default')} icon={<User className="w-3 h-3" />} label="Def" />
                    <RoleButton active={role === 'director'} onClick={() => setRole('director')} icon={<Briefcase className="w-3 h-3" />} label="Dir" />
                    <RoleButton active={role === 'engineer'} onClick={() => setRole('engineer')} icon={<Wrench className="w-3 h-3" />} label="Eng" />
                    <RoleButton active={role === 'buyer'} onClick={() => setRole('buyer')} icon={<Wallet className="w-3 h-3" />} label="Buy" />
                </div>
            </div>
        </div>
    );
}

function RoleButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono uppercase transition-all ${active
                ? 'bg-safety-orange text-white shadow-[0_0_10px_rgba(255,61,0,0.3)]'
                : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'
                }`}
        >
            {icon}
            {label}
        </button>
    );
}
