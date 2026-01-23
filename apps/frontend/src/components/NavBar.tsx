"use client";

import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/stores/useCartStore";
import { fetchSiteContent } from "@/lib/api";

function CartBadge() {
    const cartItemsCount = useCartStore((state) => state.items.length);
    const [mounted, setMounted] = React.useState(false);

    // We can also fetch labels here if we really want "ЗАКАЗ" to be dynamic, 
    // but for badges usually brevity is key. 
    // Let's passed down content if accessible or just keep as is for this small internal component 
    // unless we lift state up. For now let's keep it simple as the parent NavBar fetches content.

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || cartItemsCount === 0) return <span>[ ЗАКАЗ ]</span>;

    return (
        <span className="flex items-center gap-2">
            [ ЗАКАЗ: <span className="text-safety-orange font-bold">{cartItemsCount}</span> ]
        </span>
    );
}

export function NavBar() {
    const [isScrolled, setIsScrolled] = React.useState(false);
    const [content, setContent] = React.useState<Record<string, string>>({});

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);

        // Load content
        fetchSiteContent().then(setContent);

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const t = (key: string, defaultVal: string) => content[key] || defaultVal;

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
                isScrolled
                    ? "bg-industrial-surface/80 backdrop-blur-md border-industrial-border py-2 shadow-lg"
                    : "bg-transparent border-transparent py-6"
            )}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-3 group">
                    <Logo className="h-12 w-auto" />
                </Link>

                <nav className="hidden md:flex items-center space-x-1">
                    {
                        [
                            { label: t('ui_nav_catalog', "Каталог"), href: "/catalog" },
                            { label: t('ui_nav_service', "Сервис"), href: "/service" },
                            { label: t('ui_nav_solutions', "Решения"), href: "/solutions" },
                            { label: t('ui_nav_company', "О компании"), href: "/company" },
                            { label: t('ui_nav_contacts', "Контакты"), href: "/contacts" },
                        ].map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium transition-all duration-200 relative group overflow-hidden whitespace-nowrap",
                                    isScrolled ? "text-muted-foreground hover:text-safety-orange" : "text-white/80 hover:text-white"
                                )}
                            >
                                <span className="relative z-10 font-mono tracking-wide uppercase text-xs">{item.label}</span>
                                <span className="absolute inset-x-0 bottom-0 h-[1px] bg-safety-orange transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                            </Link>
                        ))}
                </nav>

                <div className="flex items-center space-x-4">
                    <Link href="/catalog">
                        <Button variant="ghost" className={cn("hidden sm:flex font-mono text-xs uppercase tracking-wider border border-white/10 bg-white/5 hover:bg-white/10 px-4 whitespace-nowrap", isScrolled ? "text-muted-foreground hover:text-safety-orange border-industrial-border" : "text-white/80 hover:text-white hover:border-white/30")}>
                            <span className="mr-2 opacity-50">🔍</span> [ {t('ui_btn_search', 'ПОИСК')} ]
                        </Button>
                    </Link>
                    <Link href="/cart">
                        <Button variant="ghost" className={cn("hidden sm:flex font-mono text-xs uppercase tracking-wider border border-white/10 bg-white/5 hover:bg-white/10 px-4 relative whitespace-nowrap", isScrolled ? "text-muted-foreground hover:text-safety-orange border-industrial-border" : "text-white/80 hover:text-white hover:border-white/30")}>
                            <span className="mr-2 opacity-50">🛒</span>
                            <CartBadge />
                        </Button>
                    </Link>
                    <Link href="/contacts" className="hidden md:flex">
                        <Button className="bg-safety-orange hover:bg-safety-orange-vivid text-white rounded-none border-l-2 border-white/20 font-bold uppercase tracking-wider text-xs px-6 h-10 shadow-[0_0_15px_rgba(255,61,0,0.3)] hover:shadow-[0_0_25px_rgba(255,61,0,0.5)] transition-all">
                            {t('ui_btn_request_cp', 'Запрос КП')}
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
