"use client";

import { DigitalTwinViewer } from "@/components/DigitalTwinViewer";
import { ArrowLeft, Cpu, Activity, Database } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function DigitalTwinPage() {
    const [activeTab, setActiveTab] = useState("telemetry");

    return (
        <div className="w-full h-screen relative bg-black overflow-hidden">
            {/* Header Overlay */}
            <div className="absolute top-0 left-0 right-0 z-10 p-6 flex justify-between items-start pointer-events-none">
                <div className="pointer-events-auto">
                    <Link href="/" className="inline-flex items-center text-white/70 hover:text-safety-orange transition-colors font-mono text-sm uppercase mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Назад к Экосистеме
                    </Link>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">
                        Цифровой <span className="text-safety-orange">Двойник</span>
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-green-500 font-mono text-xs uppercase">Система в норме</span>
                    </div>
                </div>
            </div>

            {/* 3D Viewer Container */}
            <div className="absolute inset-0 z-0">
                <DigitalTwinViewer />
            </div>

            {/* Sidebar Overlay */}
            <div className="absolute top-24 right-6 w-80 z-10 pointer-events-auto">
                <div className="bg-black/40 backdrop-blur-md border border-white/10 p-1">
                    <div className="grid grid-cols-3 gap-1 mb-1">
                        <button
                            onClick={() => setActiveTab("telemetry")}
                            className={cn(
                                "py-2 text-[10px] uppercase font-bold tracking-wider transition-colors",
                                activeTab === "telemetry" ? "bg-safety-orange text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
                            )}
                        >
                            Телеметрия
                        </button>
                        <button
                            onClick={() => setActiveTab("analytics")}
                            className={cn(
                                "py-2 text-[10px] uppercase font-bold tracking-wider transition-colors",
                                activeTab === "analytics" ? "bg-safety-orange text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
                            )}
                        >
                            Аналитика
                        </button>
                        <button
                            onClick={() => setActiveTab("logs")}
                            className={cn(
                                "py-2 text-[10px] uppercase font-bold tracking-wider transition-colors",
                                activeTab === "logs" ? "bg-safety-orange text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
                            )}
                        >
                            Логи
                        </button>
                    </div>

                    <div className="bg-black/60 p-4 border border-white/5 min-h-[300px]">
                        {activeTab === "telemetry" && (
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-white/70 font-mono">
                                        <span>Нагрузка шпинделя</span>
                                        <span>84%</span>
                                    </div>
                                    <div className="h-1 bg-white/10 w-full overflow-hidden">
                                        <div className="h-full bg-safety-orange w-[84%]" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-white/70 font-mono">
                                        <span>Вибрация (X/Y/Z)</span>
                                        <span className="text-green-400">Норма</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-1 h-8">
                                        <div className="bg-white/5 flex items-end p-0.5"><div className="w-full bg-green-500/50 h-[30%]" /></div>
                                        <div className="bg-white/5 flex items-end p-0.5"><div className="w-full bg-green-500/50 h-[45%]" /></div>
                                        <div className="bg-white/5 flex items-end p-0.5"><div className="w-full bg-green-500/50 h-[20%]" /></div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-white/70 font-mono">
                                        <span>Температура СОЖ</span>
                                        <span>42°C</span>
                                    </div>
                                    <div className="h-1 bg-white/10 w-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[42%]" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "analytics" && (
                            <div className="flex flex-col items-center justify-center h-full text-white/30 text-xs font-mono text-center pt-10">
                                <Activity className="w-8 h-8 mb-2 opacity-50" />
                                Ожидание подключения к Bi-системе...
                            </div>
                        )}

                        {activeTab === "logs" && (
                            <div className="font-mono text-[10px] text-white/60 space-y-1 max-h-[250px] overflow-y-auto">
                                <p>[22:14:03] Connection established</p>
                                <p>[22:14:05] Syncing model parameters...</p>
                                <p>[22:14:06] <span className="text-green-400">Sync Complete</span></p>
                                <p>[22:14:10] Spindle RPM: 12000</p>
                                <p>[22:14:15] Tool Change: T04 &rarr; T05</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
