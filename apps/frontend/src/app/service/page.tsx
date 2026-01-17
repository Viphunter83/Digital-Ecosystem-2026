"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, Wrench } from "lucide-react";

export default function ServicePage() {
    // Mock data for timeline
    const steps = [
        { title: "Заявка принята", date: "15.01.2026", active: true, done: true, icon: CheckCircle2 },
        { title: "Дефектовка", date: "16.01.2026", active: true, done: true, icon: Wrench },
        { title: "Ремонт", date: "В процессе", active: true, done: false, icon: Clock },
        { title: "Готово", date: "-", active: false, done: false, icon: CheckCircle2 },
    ];

    return (
        <div className="container mx-auto py-12 px-4 max-w-5xl">
            <h1 className="text-4xl font-bold mb-2 uppercase tracking-widest text-deep-graphite dark:text-white">Цифровой паспорт</h1>
            <p className="text-muted-foreground mb-12">Станок CNC-2026-X • Серийный номер #992811</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Status Card */}
                <div className="md:col-span-2 space-y-8">
                    <Card className="border-safety-orange/50 shadow-md">
                        <CardHeader>
                            <CardTitle className="uppercase tracking-wide text-safety-orange">Текущий статус заявки</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative flex flex-col md:flex-row justify-between items-center w-full mt-4">
                                {/* Connector Line */}
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -z-0 hidden md:block -translate-y-1/2" />

                                {steps.map((step, index) => {
                                    const Icon = step.icon;
                                    return (
                                        <div key={index} className="relative z-10 flex flex-col items-center bg-card p-2 md:w-auto w-full mb-4 md:mb-0">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 mb-2 transition-colors ${step.done ? 'bg-safety-orange border-safety-orange text-white' : step.active ? 'bg-card border-safety-orange text-safety-orange animate-pulse' : 'bg-muted border-muted-foreground text-muted-foreground'}`}>
                                                <Icon size={20} />
                                            </div>
                                            <span className={`font-bold text-sm ${step.active ? 'text-foreground' : 'text-muted-foreground'}`}>{step.title}</span>
                                            <span className="text-xs text-muted-foreground">{step.date}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Наработка часов</CardTitle></CardHeader>
                            <CardContent><div className="text-4xl font-bold">12,402 ч</div></CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">След. ТО</CardTitle></CardHeader>
                            <CardContent><div className="text-4xl font-bold">14 дн</div></CardContent>
                        </Card>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                    <Card className="bg-deep-graphite text-white border-none">
                        <CardHeader>
                            <CardTitle>Поддержка</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-gray-300">Возникли проблемы? Вызовите инженера в один клик.</p>
                            <Button className="w-full bg-safety-orange hover:bg-safety-orange/90 text-white font-bold h-12">
                                ВЫЗВАТЬ ИНЖЕНЕРА
                            </Button>
                            <Button variant="outline" className="w-full bg-transparent border-white/20 hover:bg-white/10 text-white">
                                Скачать мануал (PDF)
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
