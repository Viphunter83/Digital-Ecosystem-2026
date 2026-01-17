"use client";

export default function CompanyPage() {
    return (
        <div className="min-h-screen bg-industrial-surface text-white pt-24 pb-20">
            {/* Header */}
            <div className="container mx-auto px-6 mb-16">
                <div className="border-b border-industrial-border pb-6">
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-white">
                        Инженерный <span className="text-safety-orange">Центр</span>
                    </h1>
                    <p className="text-muted-foreground font-mono text-sm max-w-2xl uppercase">
                        Комплексное техническое перевооружение промышленных предприятий России
                    </p>
                </div>
            </div>

            {/* Content Sections */}
            <div className="container mx-auto px-6 space-y-24">

                {/* Section 1: About & Mission */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
                    <div className="space-y-6">
                        <div className="prose prose-invert max-w-none">
                            <h3 className="text-2xl font-bold uppercase text-white mb-4 border-l-4 border-safety-orange pl-4">О Нас</h3>
                            <p className="text-gray-300 leading-relaxed text-lg">
                                Торговый Дом «РУССтанкоСбыт» — это современный инженерный центр, специализирующийся на подборе и поставке металлообрабатывающего оборудования, а также реализации проектов "под ключ".
                            </p>
                            <p className="text-gray-400 leading-relaxed">
                                Мы не просто продаем станки — мы внедряем технологии, которые повышают эффективность вашего производства. Наш опыт позволяет решать задачи любой сложности: от поставки единичного оборудования до комплексного оснащения цехов.
                            </p>
                        </div>
                    </div>

                    {/* Key Stats Grid */}
                    <div className="grid grid-cols-2 gap-8 bg-industrial-panel p-8 border border-industrial-border">
                        <div>
                            <div className="text-4xl font-black text-safety-orange mb-1">12</div>
                            <div className="text-xs font-mono text-muted-foreground uppercase">Лет успеха на рынке</div>
                        </div>
                        <div>
                            <div className="text-4xl font-black text-safety-orange mb-1">4</div>
                            <div className="text-xs font-mono text-muted-foreground uppercase">Производственных площадки</div>
                        </div>
                        <div>
                            <div className="text-4xl font-black text-safety-orange mb-1">15 000</div>
                            <div className="text-xs font-mono text-muted-foreground uppercase">Кв.м. площадей</div>
                        </div>
                        <div>
                            <div className="text-4xl font-black text-safety-orange mb-1">200+</div>
                            <div className="text-xs font-mono text-muted-foreground uppercase">Квалифицированных сотрудников</div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Production Geography */}
                <div>
                    <h2 className="text-3xl font-black uppercase text-white mb-8 flex items-center gap-4">
                        <span className="w-12 h-1 bg-safety-orange" />
                        География Производства
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Site 1 */}
                        <div className="bg-industrial-panel border border-industrial-border p-6 hover:border-safety-orange transition-colors group">
                            <div className="text-safety-orange text-sm font-mono mb-2">ПЛОЩАДКА №1</div>
                            <h4 className="text-xl font-bold text-white mb-4">РЯЗАНЬ</h4>
                            <p className="text-sm text-gray-400">
                                Производство полного цикла токарных станков с ЧПУ и трубонарезных станков. Участок производства зубчатых колес и шлицевых валов.
                            </p>
                        </div>
                        {/* Site 2 */}
                        <div className="bg-industrial-panel border border-industrial-border p-6 hover:border-safety-orange transition-colors group">
                            <div className="text-safety-orange text-sm font-mono mb-2">ПЛОЩАДКА №2</div>
                            <h4 className="text-xl font-bold text-white mb-4">ВОРОНЕЖ</h4>
                            <p className="text-sm text-gray-400">
                                Тяжелая механическая обработка деталей массой до 150 тонн. Сборочный цех с мостовым краном 160 тонн.
                            </p>
                        </div>
                        {/* Site 3 */}
                        <div className="bg-industrial-panel border border-industrial-border p-6 hover:border-safety-orange transition-colors group">
                            <div className="text-safety-orange text-sm font-mono mb-2">ПЛОЩАДКА №3</div>
                            <h4 className="text-xl font-bold text-white mb-4">ИЖЕВСК</h4>
                            <p className="text-sm text-gray-400">
                                Производство конических зубчатых колес с круговым зубом. Высокоточная механическая обработка корпусных деталей.
                            </p>
                        </div>
                        {/* Site 4 */}
                        <div className="bg-industrial-panel border border-industrial-border p-6 hover:border-safety-orange transition-colors group">
                            <div className="text-safety-orange text-sm font-mono mb-2">ПЛОЩАДКА №4</div>
                            <h4 className="text-xl font-bold text-white mb-4">БЕЛАРУСЬ</h4>
                            <p className="text-sm text-gray-400">
                                Партнерская производственная площадка. Литье станин, черновая и чистовая обработка узлов.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section 3: Values */}
                <div className="border-t border-industrial-border pt-16">
                    <h3 className="text-xl font-bold uppercase text-white mb-8 text-center">Наши Ценности</h3>
                    <div className="flex flex-wrap justify-center gap-4">
                        {["Честность и прозрачность", "Технологическая независимость", "Ответственность за результат", "Долгосрочное партнерство"].map((val, i) => (
                            <div key={i} className="px-6 py-3 bg-white/5 border border-white/10 rounded-full font-mono text-sm uppercase hover:bg-safety-orange hover:text-white transition-colors cursor-default">
                                {val}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
