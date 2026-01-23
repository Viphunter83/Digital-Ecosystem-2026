"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle, FileText, Settings } from "lucide-react";
import { ShimmerButton } from "@/components/ShimmerButton";
import { useCartStore } from "@/lib/stores/useCartStore";
import { Product } from "@/lib/api";
import { toast } from "sonner";

interface ProductDetailProps {
    product: Product;
}

// Maps shared with ProductCard (could be moved to a shared constant file)
const SPEC_MAP: Record<string, string> = {
    'TRAVEL_X': 'ХОД ПО ОСИ X',
    'TABLE_SIZE': 'РАЗМЕР СТОЛА',
    'SPINDLE_SPEED': 'ОБОРОТЫ',
    'FORCE': 'УСИЛИЕ',
    'SPEED': 'СКОРОСТЬ',
    'STROKE': 'ХОД ПОЛЗУНА',
    'POWER': 'МОЩНОСТЬ',
    'ACCURACY': 'ТОЧНОСТЬ',
    'MAX_LENGTH': 'МАКС. ДЛИНА',
    'MAX_DIAMETER': 'МАКС. ДИАМЕТР',
    'DIAMETER': 'ДИАМЕТР',
    'WEIGHT': 'ВЕС',
    'AXIS': 'ОСИ',
    'SPINDLE': 'ШПИНДЕЛЬ',
    'WORKSPACE': 'РАБ. ЗОНА',
    'MAIN': 'ОСНОВНОЕ',
    'MODEL': 'МОДЕЛЬ',
    'DESCRIPTION': 'ОПИСАНИЕ',
};

const UNIT_MAP: Record<string, string> = {
    'mm': 'мм',
    'mm/s': 'мм/с',
    'rpm': 'об/мин',
    'ton': 'т',
    'kW': 'кВт',
    'kg': 'кг',
};

function formatSpecValue(value: string): string {
    let formatted = value;
    Object.entries(UNIT_MAP).forEach(([en, ru]) => {
        formatted = formatted.replace(new RegExp(en, 'g'), ru);
    });
    return formatted;
}

export function ProductDetail({ product }: ProductDetailProps) {
    const addToCart = useCartStore((state) => state.addItem);
    const [added, setAdded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleAddToCart = () => {
        // Clean name for cart
        let cleanName = product.name.replace(/^ТД РУССтанкоСбыт\s*-\s*/i, "");
        cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

        addToCart({ ...product, name: cleanName, price: product.price || 0, slug: product.id });
        toast.success("Добавлено в заказ", {
            description: cleanName.substring(0, 50) + (cleanName.length > 50 ? "..." : "")
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    // Clean name for display
    let cleanName = product.name.replace(/^ТД РУССтанкоСбыт\s*-\s*/i, "");
    cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

    // Prepare specs
    const specsArray = product.specs
        ? Object.entries(product.specs)
            .filter(([key, value]) => {
                const k = key.toUpperCase();
                return k !== 'DESCRIPTION' && value && String(value).trim() !== '';
            })
            .map(([key, value]) => ({
                originalKey: key,
                parameter: SPEC_MAP[key] || SPEC_MAP[key.toUpperCase()] || key,
                value: formatSpecValue(String(value))
            }))
        : [];

    return (
        <div className="min-h-screen bg-industrial-surface text-white pt-24 pb-20">
            {/* ... Breadcrumb ... */}
            <div className="container mx-auto px-6 mb-8">
                <Link href="/catalog" className="inline-flex items-center text-muted-foreground hover:text-safety-orange transition-colors font-mono text-sm uppercase">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Каталог {product.category ? `/ ${product.category}` : '/ Запчасти'}
                </Link>
            </div>

            <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Visual Section */}
                <div className="space-y-6">
                    <div className="relative aspect-video lg:aspect-square bg-industrial-panel border border-industrial-border rounded-lg overflow-hidden group">
                        {/* Technical Grid Overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] z-10 pointer-events-none" />

                        {product.image_url ? (
                            <Image
                                src={imageError ? "/images/placeholder_machine.jpg" : product.image_url}
                                alt={cleanName}
                                fill
                                className="object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                                onError={() => setImageError(true)}
                                priority
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
                                <span className="text-4xl font-black text-white/5 select-none font-mono">НЕТ ФОТО</span>
                            </div>
                        )}

                        <div className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur border border-white/10 px-3 py-1 text-[10px] font-mono text-safety-orange">
                            ID: {product.id.substring(0, 8)}
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-none">
                            {cleanName}
                        </h1>
                        <p className="text-xl text-gray-400 font-light leading-relaxed">
                            {product.description || "Оригинальная запасная часть для металлообрабатывающего оборудования. Гарантия качества и совместимости."}
                        </p>
                    </div>

                    {/* Specs Table */}
                    {specsArray.length > 0 && (
                        <div className="bg-industrial-panel border border-industrial-border p-6 rounded-sm">
                            <h3 className="text-sm font-bold uppercase text-white mb-4 flex items-center gap-2">
                                <Settings className="w-4 h-4 text-safety-orange" />
                                Технические Характеристики
                            </h3>
                            <div className="space-y-3">
                                {specsArray.map((spec) => (
                                    <div key={spec.originalKey} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                        <span className="text-muted-foreground font-mono text-xs uppercase">{spec.parameter}</span>
                                        <span className="text-white font-mono text-sm font-bold">{spec.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Advantages */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-safety-orange shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-300">Гарантия 24 месяца</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-safety-orange shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-300">ПНР и Обучение</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-safety-orange shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-300">Лизинг от 0%</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-safety-orange shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-300">Сервис 24/7</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-6 border-t border-industrial-border flex flex-col md:flex-row gap-4">
                        <Link href="/contacts" className="w-full md:w-auto">
                            <ShimmerButton
                                className="bg-safety-orange text-white px-8 py-4 font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 hover:bg-safety-orange-vivid w-full"
                            >
                                <FileText className="w-4 h-4" />
                                ЗАПРОСИТЬ КП
                            </ShimmerButton>
                        </Link>
                        <button
                            onClick={handleAddToCart}
                            className={`px-8 py-4 flex items-center justify-center border font-mono uppercase text-sm transition-colors w-full md:w-auto
                                ${added ? 'bg-green-500 text-white border-green-500' : 'border-white/20 text-white hover:bg-white/5'}
                            `}
                        >
                            {added ? 'В КОРЗИНЕ' : 'В ЗАКАЗ'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
