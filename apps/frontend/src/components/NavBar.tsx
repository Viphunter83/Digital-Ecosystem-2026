"use client";

import * as React from "react";
import Link from "next/link";
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
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
                isScrolled
                    ? "bg-background/80 backdrop-blur-md border-border py-2 shadow-sm"
                    : "bg-transparent py-4 text-white"
            )}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    {/* Placeholder for Logo */}
                    <div className="h-8 w-8 bg-accent rounded-sm" />
                    <span className={cn("text-xl font-bold tracking-tighter uppercase", isScrolled ? "text-foreground" : "text-white mix-blend-difference")}>
                        RusStanko<span className="text-accent">Sbyt</span>
                    </span>
                </Link>

                <nav className="hidden md:flex items-center space-x-8">
                    {["Каталог", "Решения", "О компании", "Контакты"].map((item) => (
                        <Link
                            key={item}
                            href={`/${item.toLowerCase()}`}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-accent",
                                isScrolled ? "text-muted-foreground" : "text-white/90"
                            )}
                        >
                            {item}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center space-x-4">
                    <Button variant="ghost" className={cn("hidden sm:flex", isScrolled ? "" : "text-white hover:text-accent hover:bg-white/10")}>
                        Поиск
                    </Button>
                    <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm font-bold">
                        Запрос КП
                    </Button>
                </div>
            </div>
        </header>
    );
}
