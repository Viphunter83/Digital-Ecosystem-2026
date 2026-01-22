"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight, Home } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

interface OrderInfo {
    id: string;
    total: number;
    itemsCount: number;
    name: string;
}

export default function OrderSuccessPage() {
    const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);

    useEffect(() => {
        // Get order info from sessionStorage
        const storedOrder = sessionStorage.getItem('lastOrder');
        if (storedOrder) {
            setOrderInfo(JSON.parse(storedOrder));
            sessionStorage.removeItem('lastOrder');
        }

        // Trigger confetti animation
        const duration = 2000;
        const animationEnd = Date.now() + duration;

        const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
        };

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) {
                clearInterval(interval);
                return;
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({
                particleCount,
                startVelocity: 25,
                spread: 360,
                origin: {
                    x: randomInRange(0.3, 0.7),
                    y: randomInRange(0.3, 0.5),
                },
                colors: ['#ff3d00', '#ff6d33', '#ffffff', '#ffa366'],
            });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20 px-4 flex flex-col items-center justify-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-safety-orange to-safety-orange-vivid flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(255,61,0,0.4)]"
            >
                <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center max-w-md"
            >
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4">
                    Заявка отправлена!
                </h1>

                <p className="text-gray-400 mb-8 leading-relaxed">
                    {orderInfo?.name ? `${orderInfo.name}, спасибо` : 'Спасибо'} за ваш заказ!
                    Наш менеджер свяжется с вами в ближайшее время для уточнения деталей.
                </p>

                {orderInfo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white/5 border border-white/10 p-6 rounded-lg mb-8"
                    >
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Package className="w-5 h-5 text-safety-orange" />
                            <span className="font-mono text-sm text-gray-400">
                                ЗАЯВКА #{orderInfo.id.substring(0, 8).toUpperCase()}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500 uppercase text-xs mb-1">Позиций</p>
                                <p className="font-bold">{orderInfo.itemsCount}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 uppercase text-xs mb-1">Сумма</p>
                                <p className="font-bold text-safety-orange font-mono">
                                    {orderInfo.total.toLocaleString()} ₽
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 px-6 py-3 border border-white/20 text-white hover:bg-white/5 transition-colors font-mono uppercase text-sm"
                    >
                        <Home className="w-4 h-4" />
                        На главную
                    </Link>
                    <Link
                        href="/catalog"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-safety-orange hover:bg-safety-orange-vivid text-white font-bold uppercase text-sm transition-colors"
                    >
                        Продолжить покупки
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-12 text-center"
            >
                <p className="text-gray-500 text-sm mb-4">Есть вопросы? Свяжитесь с нами напрямую:</p>
                <div className="flex flex-wrap justify-center gap-4">
                    <a
                        href="tel:+74993908504"
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-safety-orange transition-colors"
                    >
                        +7 (499) 390-85-04
                    </a>
                    <a
                        href="https://t.me/russtankosbyt"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-[#229ED9]/10 border border-[#229ED9]/30 rounded text-[#229ED9] hover:bg-[#229ED9]/20 transition-colors text-xs font-bold uppercase tracking-wider"
                    >
                        Telegram
                    </a>
                    <a
                        href="https://wa.me/79031234567"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-[#25D366]/10 border border-[#25D366]/30 rounded text-[#25D366] hover:bg-[#25D366]/20 transition-colors text-xs font-bold uppercase tracking-wider"
                    >
                        WhatsApp
                    </a>
                </div>
            </motion.div>
        </div>
    );
}
