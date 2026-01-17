import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Footer() {
    return (
        <footer className="bg-industrial-panel border-t border-industrial-border pt-16 pb-8 text-white relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-safety-orange to-transparent opacity-50" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center space-x-2 group">
                            <div className="h-8 w-8 bg-safety-orange rounded-sm flex items-center justify-center font-bold text-white font-mono">Z</div>
                            <span className="text-xl font-bold tracking-tighter uppercase text-white">
                                RusStanko<span className="text-safety-orange">Sbyt</span>
                            </span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                            Ведущий поставщик передовых промышленных инженерных решений.
                            Оптимизация жизненного цикла для высокопроизводительного производства.
                        </p>
                        <div className="flex gap-4">
                            {/* Social Placeholders */}
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center hover:border-safety-orange hover:text-safety-orange transition-colors cursor-pointer">
                                    <span className="text-xs">#</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold uppercase tracking-wider mb-6 text-sm">Навигация</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            {["Каталог", "Решения", "О компании", "Контакты"].map((item) => (
                                <li key={item}>
                                    <Link href={`/${item.toLowerCase()}`} className="hover:text-safety-orange transition-colors flex items-center group">
                                        <span className="w-1 h-1 rounded-full bg-safety-orange mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold uppercase tracking-wider mb-6 text-sm">Услуги</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            {["Лизинг оборудования", "Предиктивное обслуживание", "Цифровые двойники", "Поддержка 24/7"].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="hover:text-safety-orange transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold uppercase tracking-wider mb-6 text-sm">Контакты</h4>
                        <div className="space-y-4 text-sm text-muted-foreground">
                            <p>
                                <strong className="text-white block mb-1">Центральный офис</strong>
                                Индустриальный проспект, 123<br />
                                Москва, Россия, 101000
                            </p>
                            <p>
                                <strong className="text-white block mb-1">Отдел продаж</strong>
                                <a href="tel:+70000000000" className="hover:text-safety-orange transition-colors">+7 (000) 000-00-00</a>
                            </p>
                            <Button className="w-full bg-white/5 border border-white/10 hover:bg-safety-orange hover:border-safety-orange text-white transition-all uppercase text-xs font-bold tracking-wider rounded-none mt-2">
                                Заказать звонок
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground font-mono uppercase tracking-wide">
                    <p>&copy; 2026 РУССТАНКОСБЫТ. ВСЕ ПРАВА ЗАЩИЩЕНЫ.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <Link href="#" className="hover:text-white">Политика конфиденциальности</Link>
                        <Link href="#" className="hover:text-white">Условия использования</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
