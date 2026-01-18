"use client";

import { useCartStore } from "@/lib/stores/useCartStore";
import { useTelegram } from "@/providers/TelegramProvider";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CartPage() {
    const { items, removeItem, updateQuantity, totalAmount, clearCart } = useCartStore();
    const { webApp, user } = useTelegram();
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    useEffect(() => {
        if (webApp) {
            webApp.BackButton.show();
            webApp.BackButton.onClick(() => window.history.back());
            return () => {
                webApp.BackButton.hide();
                webApp.BackButton.offClick(() => window.history.back());
            };
        }
    }, [webApp]);

    const handleCheckout = () => {
        setIsCheckingOut(true);
        const orderData = {
            type: "ORDER",
            items: items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price })),
            total: totalAmount(),
            user_id: user?.id,
            timestamp: new Date().toISOString()
        };

        if (webApp) {
            webApp.HapticFeedback.notificationOccurred('success');
            (webApp as any).sendData(JSON.stringify(orderData));
        } else {
            console.log("Web Checkout Data:", orderData);
            alert("Заказ сформирован! (В реальном Telegram это отправило бы данные боту).");
            setIsCheckingOut(false);
            clearCart();
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white pt-24 pb-20 px-4 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <ShoppingCart className="w-10 h-10 text-white/30" />
                </div>
                <h1 className="text-2xl font-bold uppercase mb-2">Корзина пуста</h1>
                <p className="text-muted-foreground mb-8 text-sm max-w-xs">
                    Добавьте оборудование из каталога, чтобы сформировать список закупки.
                </p>
                <Link
                    href="/catalog"
                    className="bg-safety-orange hover:bg-safety-orange-vivid text-white font-bold py-3 px-8 uppercase tracking-wider text-sm clip-path-slant"
                >
                    Перейти в каталог
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-32 px-4 md:px-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight">Ваш Заказ</h1>
                    <p className="text-xs text-safety-orange font-mono mt-1">
                        {items.length} ПОЗИЦИЙ // ОБЩАЯ СУММА: {totalAmount().toLocaleString()} ₽
                    </p>
                </div>
                <button
                    onClick={clearCart}
                    className="text-xs text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1 uppercase font-mono"
                >
                    <Trash2 className="w-3 h-3" /> Очистить
                </button>
            </div>

            <div className="space-y-4">
                {items.map((item) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white/5 border border-white/10 p-4 flex gap-4 items-center"
                    >
                        {/* Image */}
                        <div className="w-20 h-20 bg-black border border-white/10 relative shrink-0">
                            {item.image_url ? (
                                <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-white/20 text-[8px] uppercase text-center font-mono">Нет фото</div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-grow min-w-0">
                            <h3 className="font-bold text-sm uppercase leading-tight truncate">{item.name}</h3>
                            <p className="text-safety-orange font-mono text-xs mt-1">{item.price.toLocaleString()} ₽</p>

                            <div className="flex items-center gap-4 mt-3">
                                <div className="flex items-center bg-black border border-white/20 h-8">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="w-8 h-full flex items-center justify-center hover:bg-white/10 text-white/50 hover:text-white"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="w-8 text-center text-sm font-mono">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="w-8 h-full flex items-center justify-center hover:bg-white/10 text-white/50 hover:text-white"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="text-xs text-muted-foreground font-mono">
                                    = {(item.price * item.quantity).toLocaleString()} ₽
                                </div>
                            </div>
                        </div>

                        {/* Remove */}
                        <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-white/20 hover:text-red-500 transition-colors"
                        >
                            <XIcon />
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* Sticky Footer for Total */}
            <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-black/95 backdrop-blur border-t border-white/10 p-4 z-30">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="text-center md:text-left">
                        <p className="text-xs text-muted-foreground uppercase">Итого к оплате</p>
                        <p className="text-2xl font-bold text-white font-mono">{totalAmount().toLocaleString()} ₽</p>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={isCheckingOut}
                        className="w-full md:w-auto bg-safety-orange hover:bg-safety-orange-vivid text-white font-bold py-3 px-8 uppercase tracking-wider text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,61,0,0.3)] disabled:opacity-50"
                    >
                        {isCheckingOut ? 'Обработка...' : 'Оформить заявку'}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function XIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
    )
}
