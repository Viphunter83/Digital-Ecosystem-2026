"use client";

export default function CompanyPage() {
    return (
        <div className="min-h-screen bg-industrial-surface text-white pt-24 pb-20">
            {/* Header */}
            <div className="container mx-auto px-6 mb-16">
                <div className="border-b border-industrial-border pb-6">
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-white">
                        О <span className="text-safety-orange">Компании</span>
                    </h1>
                    <p className="text-muted-foreground font-mono text-sm max-w-2xl">
                        Л И Д Е Р &nbsp; В &nbsp; С Ф Е Р Е &nbsp; П Р О М Ы Ш Л Е Н Н О Г О &nbsp; И Н Ж И Н И Р И Н Г А
                    </p>
                </div>
            </div>

            {/* Content Sections */}
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

                {/* Left Column: Story */}
                <div className="space-y-8">
                    <div className="prose prose-invert max-w-none">
                        <h3 className="text-2xl font-bold uppercase text-white mb-4 border-l-4 border-safety-orange pl-4">Миссия</h3>
                        <p className="text-gray-300 leading-relaxed text-lg">
                            Мы создаем будущее промышленного производства, объединяя передовые технологии, инжиниринговую экспертизу и цифровые инструменты в единую экосистему.
                        </p>
                        <p className="text-gray-400 leading-relaxed">
                            Наша цель — обеспечить промышленные предприятия России современным, надежным и высокоэффективным оборудованием, предоставляя сервис мирового уровня.
                        </p>
                    </div>

                    <div className="py-8 border-y border-industrial-border">
                        <h3 className="text-xl font-bold uppercase text-white mb-6">Ключевые показатели</h3>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <div className="text-4xl font-black text-safety-orange mb-1">12+</div>
                                <div className="text-xs font-mono text-muted-foreground uppercase">Лет на рынке</div>
                            </div>
                            <div>
                                <div className="text-4xl font-black text-safety-orange mb-1">500+</div>
                                <div className="text-xs font-mono text-muted-foreground uppercase">Реализованных проектов</div>
                            </div>
                            <div>
                                <div className="text-4xl font-black text-safety-orange mb-1">24/7</div>
                                <div className="text-xs font-mono text-muted-foreground uppercase">Техническая поддержка</div>
                            </div>
                            <div>
                                <div className="text-4xl font-black text-safety-orange mb-1">48ч</div>
                                <div className="text-xs font-mono text-muted-foreground uppercase">Время реакции</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Values/Image Placeholder */}
                <div className="relative h-full min-h-[400px] bg-industrial-panel border border-industrial-border p-8 flex flex-col justify-center">
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:10px_10px]" />

                    <h3 className="text-xl font-bold uppercase text-white mb-6 relative z-10 text-center">Наши Принципы</h3>

                    <ul className="space-y-4 relative z-10 max-w-md mx-auto">
                        {["Технологическое Лидерство", "Надежность и Безопасность", "Прозрачность Процессов", "Клиентоцентричность"].map((item, i) => (
                            <li key={i} className="flex items-center space-x-3 bg-black/20 p-3 border border-white/5 rounded-sm">
                                <div className="h-2 w-2 bg-safety-orange rounded-full" />
                                <span className="font-mono text-sm uppercase tracking-wider">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
