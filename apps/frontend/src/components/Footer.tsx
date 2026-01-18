import Link from "next/link";
import { Logo } from "@/components/Logo";
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
                            <Logo className="w-auto h-12" variant="light" />
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
                            {[
                                { label: "Каталог", href: "/catalog" },
                                { label: "Решения", href: "/solutions" },
                                { label: "О компании", href: "/company" },
                                { label: "Контакты", href: "/contacts" },
                            ].map((item) => (
                                <li key={item.label}>
                                    <Link href={item.href} className="hover:text-safety-orange transition-colors flex items-center group">
                                        <span className="w-1 h-1 rounded-full bg-safety-orange mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {item.label}
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
                                Москва, Россия
                            </p>
                            <p>
                                <strong className="text-white block mb-1">Отдел продаж</strong>
                                <a href="tel:+74993908504" className="hover:text-safety-orange transition-colors">+7 (499) 390-85-04</a>
                            </p>
                            <p>
                                <strong className="text-white block mb-1">Email</strong>
                                <a href="mailto:zakaz@tdrusstankosbyt.ru" className="hover:text-safety-orange transition-colors">zakaz@tdrusstankosbyt.ru</a>
                            </p>
                            <p>
                                <strong className="text-white block mb-1">Telegram</strong>
                                <a href="https://t.me/tdrusstankosbyt" target="_blank" rel="noopener noreferrer" className="hover:text-safety-orange transition-colors">@tdrusstankosbyt</a>
                            </p>
                            <Button className="w-full bg-white/5 border border-white/10 hover:bg-safety-orange hover:border-safety-orange text-white transition-all uppercase text-xs font-bold tracking-wider rounded-none mt-2">
                                Заказать звонок
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground font-mono uppercase tracking-wide">
                    <p>&copy; 2026 ТД РУССТАНКОСБЫТ. ВСЕ ПРАВА ЗАЩИЩЕНЫ.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <Link href="#" className="hover:text-white">Политика конфиденциальности</Link>
                        <Link href="#" className="hover:text-white">Условия использования</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
