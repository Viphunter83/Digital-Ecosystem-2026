"use client";

import { Home, Grid, Activity, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useCartStore } from "@/lib/stores/useCartStore";

function CartBadge({ count }: { count: number }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || count === 0) return null;

    return (
        <div className="absolute -top-2 -right-2 bg-safety-orange text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-black font-mono animate-in zoom-in duration-300">
            {count}
        </div>
    );
}

export function BottomNav() {
    const pathname = usePathname();

    const tabs = [
        { id: 'home', icon: Home, label: 'Главная', path: '/' },
        { id: 'catalog', icon: Grid, label: 'Каталог', path: '/catalog' },
        { id: 'diagnostics', icon: Activity, label: 'Диагностика', path: '/?show_diagnostics=true' },
        { id: 'cart', icon: ShoppingCart, label: 'Заказ', path: '/cart' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-t border-white/10 pb-safe md:hidden">
            <div className="flex justify-around items-center h-16">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.path || (tab.path.includes('show_diagnostics') && false); // Keep inactive for action button
                    const Icon = tab.icon;



                    // Add badge logic
                    const isCart = tab.id === 'cart';
                    // Hydration fix: useCartStore with persist can cause hydration mismatch. 
                    // Best practice is to wait for mount or use a selector that handles it.
                    // For simplicity, we just check if mounted in a useEffect or use a specific pattern.
                    // However, mistakenly accessing state directly in render without hydration check is the #1 cause of "didn't pass".
                    // Let's use a local state to ensure client-side rendering of the count.

                    const cartItemsCount = useCartStore((state) => state.items.length);

                    return (
                        <Link
                            key={tab.id}
                            href={tab.path}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-safety-orange' : 'text-gray-400 hover:text-white'}`}
                        >
                            <div className="relative">
                                <Icon className="w-6 h-6" />
                                {isActive && (
                                    <motion.div
                                        layoutId="bottom-nav-indicator"
                                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-safety-orange rounded-full"
                                    />
                                )}
                                {isCart && (
                                    <CartBadge count={cartItemsCount} />
                                )}
                            </div>
                            <span className="text-[10px] font-mono uppercase tracking-wide">
                                {tab.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
