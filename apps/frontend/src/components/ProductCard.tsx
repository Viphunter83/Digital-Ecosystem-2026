import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useCartStore } from "@/lib/stores/useCartStore";
import { Badge } from "@/components/ui/badge";
import { ShimmerButton } from "@/components/ShimmerButton";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Product } from "@/lib/api";

interface ProductCardProps {
    product: Product;
}

const CATEGORY_MAP: Record<string, string> = {
    'MILLING': 'ФРЕЗЕРНЫЙ',
    'TURNING': 'ТОКАРНЫЙ',
    'CNC_CENTER': 'ОБРАБ. ЦЕНТР',
    'PRESS': 'ПРЕСС',
    'LASER': 'ЛАЗЕР',
    // Fallbacks for direct API values if different
    'Turning': 'ТОКАРНЫЙ',
    'Milling': 'ФРЕЗЕРНЫЙ',
};

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
    'DIAMETER': 'ДИАМЕТР',
    'WEIGHT': 'ВЕС',
    'AXIS': 'ОСИ',
    'SPINDLE': 'ШПИНДЕЛЬ',
    'WORKSPACE': 'РАБ. ЗОНА',
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

export function ProductCard({ product }: ProductCardProps) {
    const addToCart = useCartStore((state) => state.addItem);
    const [added, setAdded] = React.useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({ ...product, price: product.price || 0, slug: product.id });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    // Transform specs record to array for display
    const specsArray = product.specs
        ? Object.entries(product.specs).map(([key, value]) => ({
            parameter: SPEC_MAP[key] || key,
            value: formatSpecValue(String(value))
        }))
        : [];

    return (
        <Card className="h-full w-full overflow-hidden border border-industrial-border bg-industrial-panel relative transition-all duration-500 hover:border-safety-orange hover:shadow-[0_0_50px_rgba(255,61,0,0.25)] flex flex-col rounded-none group">
            {/* Blueprint grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Image Container */}
            <Link href={`/catalog/${product.id}`} className="block relative w-full h-48 sm:h-56 bg-industrial-surface overflow-hidden border-b border-industrial-border group-hover:border-safety-orange/50 transition-colors shrink-0">
                <div className="absolute top-0 right-0 p-3 z-20 flex gap-2">
                    <Badge className="bg-industrial-surface/90 backdrop-blur text-xs font-mono text-muted-foreground border border-industrial-border rounded-none uppercase tracking-wider px-2 py-[2px] shadow-sm">
                        ID: {product.id.toString().substring(0, 8).toUpperCase()}
                    </Badge>
                </div>

                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover object-center transition-transform duration-700 group-hover:scale-105 group-hover:saturate-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
                        <span className="text-4xl font-black text-white/5 select-none font-mono">НЕТ ФОТО</span>
                    </div>
                )}

                {/* Category Badge */}
                {product.category && (
                    <div className="absolute bottom-0 left-0 bg-safety-orange text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest font-mono z-10 clip-path-slant">
                        {CATEGORY_MAP[product.category] || product.category}
                    </div>
                )}
            </Link>

            <CardHeader className="pt-5 pb-2 relative z-10">
                <Link href={`/catalog/${product.id}`}>
                    <CardTitle className="text-lg font-bold text-white leading-tight hover:text-safety-orange transition-colors duration-300 font-manrope tracking-tight">
                        {product.name}
                    </CardTitle>
                </Link>
                <CardDescription className="text-xs text-gray-400 line-clamp-2 min-h-[32px] font-mono mt-1 leading-relaxed">
                    {product.description || "ПРОМЫШЛЕННЫЙ КЛАСС // ВЫСОКАЯ ПРОИЗВОДИТЕЛЬНОСТЬ"}
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-grow relative z-10">
                <Link href={`/catalog/${product.id}`}>
                    <div className="grid gap-[1px] bg-industrial-border border border-industrial-border my-2">
                        {specsArray.slice(0, 3).map((spec, index) => (
                            <div key={index} className="flex justify-between items-center bg-industrial-panel px-3 py-2">
                                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold font-mono">{spec.parameter}</span>
                                <span className="text-[10px] font-mono text-white/90">{spec.value}</span>
                            </div>
                        ))}
                    </div>
                </Link>
            </CardContent>

            <CardFooter className="pt-2 pb-5 px-6 relative z-10 grid grid-cols-2 gap-2">
                <Link href={`/catalog/${product.id}`} className="w-full">
                    <ShimmerButton className="w-full bg-transparent border border-white/20 text-white hover:bg-white/10 h-10 text-[10px]">
                        ПОДРОБНЕЕ
                    </ShimmerButton>
                </Link>
                <button
                    onClick={handleAddToCart}
                    className={`w-full h-10 text-[10px] font-bold uppercase tracking-wider border transition-all duration-300 flex items-center justify-center
                        ${added
                            ? 'bg-green-500 text-white border-green-500'
                            : 'bg-safety-orange text-white border-safety-orange hover:bg-safety-orange-vivid'
                        }`}
                >
                    {added ? 'В КОРЗИНЕ' : 'В ЗАКАЗ'}
                </button>
            </CardFooter>
        </Card>
    );
}
