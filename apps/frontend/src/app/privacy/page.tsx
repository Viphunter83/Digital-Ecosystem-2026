"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-black text-white p-8 md:p-24 selection:bg-safety-orange/30">
            <div className="max-w-3xl mx-auto space-y-12">
                <Link href="/" className="inline-flex items-center text-white/40 hover:text-safety-orange transition-colors font-mono text-xs uppercase tracking-widest">
                    <ArrowLeft size={14} className="mr-2" /> Назад
                </Link>

                <header className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                        Политика <span className="text-safety-orange">Конфиденциальности</span>
                    </h1>
                    <p className="text-sm font-mono text-white/40 uppercase tracking-widest">
                        В соответствии с 152-ФЗ РФ «О персональных данных»
                    </p>
                </header>

                <section className="space-y-8 text-sm text-gray-400 font-mono leading-relaxed uppercase">
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">1. Общие положения</h2>
                        <p>Настоящая политика обработки персональных данных составлена в соответствии с требованиями Федерального закона от 27.07.2006. №152-ФЗ «О персональных данных» и определяет порядок обработки персональных данных и меры по обеспечению безопасности персональных данных ООО «ТД «РусСтанко 2026».</p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">2. Какие данные мы собираем</h2>
                        <p>Мы собираем только те данные, которые необходимы для связи с вами и выполнения заказов:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Фамилия, имя, отчество;</li>
                            <li>Номер телефона;</li>
                            <li>Адрес электронной почты;</li>
                            <li>Информация об интересующем оборудовании.</li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">3. Цели обработки</h2>
                        <p>Данные обрабатываются исключительно для:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Оформления заявок на оборудование и запчасти;</li>
                            <li>Предоставления сервисной поддержки;</li>
                            <li>Информирования о статусе выполнения заказа.</li>
                        </ul>
                    </div>
                </section>

                <footer className="pt-12 text-[10px] text-white/20 uppercase tracking-widest border-t border-white/5">
                    Последнее обновление: 23 января 2026 г. | ООО «ТД «РусСтанко 2026»
                </footer>
            </div>
        </div>
    );
}
