"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function NavBar() {
    const [isScrolled, setIsScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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
                    <div className="relative h-12 w-48 transition-transform duration-300 group-hover:scale-105">
                        <Image
                            src="/images/logo.png"
                            alt="ТД РУССтанкоСбыт"
                            fill
                            className="object-contain object-left"
                        />
                    </div>
                </Link>

                <nav className="hidden md:flex items-center space-x-1">
                    {
                        [
                            { label: "Каталог", href: "/catalog" },
                            { label: "Решения", href: "/solutions" },
                            { label: "О компании", href: "/company" },
                            { label: "Контакты", href: "/contacts" },
                        ].map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium transition-all duration-200 relative group overflow-hidden",
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
                        <Button variant="ghost" className={cn("hidden sm:flex font-mono text-xs uppercase tracking-wider", isScrolled ? "text-muted-foreground hover:text-safety-orange" : "text-white/80 hover:text-white hover:bg-white/5")}>
                            [ Поиск ]
                        </Button>
                    </Link>
                    <Link href="/contacts">
                        <Button className="bg-safety-orange hover:bg-safety-orange-vivid text-white rounded-none border-l-2 border-white/20 font-bold uppercase tracking-wider text-xs px-6 h-10 shadow-[0_0_15px_rgba(255,61,0,0.3)] hover:shadow-[0_0_25px_rgba(255,61,0,0.5)] transition-all">
                            Запрос КП
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
