"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchProductById, Product } from "@/lib/api";
import { ArrowLeft, CheckCircle, FileText, Settings } from "lucide-react";
import { ShimmerButton } from "@/components/ShimmerButton";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    // In Next.js 15, params is a Promise. We need to unwrap it.
    // Using `use` hook to unwrap params if this was a server component, but since it's "use client", we treat it cautiously.
    // Actually, in "use client", params is still a Promise in recent Next.js versions or passed as prop. 
    // SAFEST: Use `useEffect` and `then`. Or since I control it, I'll assumme it's passed.
    // Update: Next.js 15 requires awaiting params.

    const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        params.then(setResolvedParams);
    }, [params]);

    useEffect(() => {
        if (resolvedParams?.id) {
            fetchProductById(Number(resolvedParams.id)).then((data) => {
                setProduct(data || null);
                setLoading(false);
            });
        }
    }, [resolvedParams]);

    if (loading) {
        return (
            <div className="min-h-screen bg-industrial-surface flex items-center justify-center text-safety-orange font-mono">
                [ ЗАГРУЗКА ДАННЫХ... ]
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-industrial-surface flex flex-col items-center justify-center text-white">
                <h1 className="text-2xl font-bold mb-4">ТОВАР НЕ НАЙДЕН</h1>
                <Link href="/catalog" className="text-safety-orange hover:underline font-mono">
                    ВЕРНУТЬСЯ В КАТАЛОГ
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-industrial-surface text-white pt-24 pb-20">
            {/* Breadcrumb */}
            <div className="container mx-auto px-6 mb-8">
                <Link href="/catalog" className="inline-flex items-center text-muted-foreground hover:text-safety-orange transition-colors font-mono text-sm uppercase">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Каталог / {product.category}
                </Link>
            </div>

            <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Visual Section */}
                <div className="space-y-6">
                    <div className="relative aspect-video lg:aspect-square bg-industrial-panel border border-industrial-border rounded-lg overflow-hidden group">
                        {/* Technical Grid Overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] z-10 pointer-events-none" />

                        {product.image_url && (
                            <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                            />
                        )}

                        <div className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur border border-white/10 px-3 py-1 text-[10px] font-mono text-safety-orange">
                            ID: {product.id}
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-none">
                            {product.name}
                        </h1>
                        <p className="text-xl text-gray-400 font-light leading-relaxed">
                            {product.description}
                        </p>
                    </div>

                    {/* Specs Table */}
                    {product.specs && (
                        <div className="bg-industrial-panel border border-industrial-border p-6 rounded-sm">
                            <h3 className="text-sm font-bold uppercase text-white mb-4 flex items-center gap-2">
                                <Settings className="w-4 h-4 text-safety-orange" />
                                Технические Характеристики
                            </h3>
                            <div className="space-y-3">
                                {Object.entries(product.specs).map(([key, value]) => (
                                    <div key={key} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                        <span className="text-muted-foreground font-mono text-xs uppercase">{key}</span>
                                        <span className="text-white font-mono text-sm font-bold">{value}</span>
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
                        <ShimmerButton
                            className="bg-safety-orange text-white px-8 py-4 font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 hover:bg-safety-orange-vivid"
                            onClick={() => alert("Форма КП будет открыта здесь")}
                        >
                            <FileText className="w-4 h-4" />
                            Запросить КП
                        </ShimmerButton>
                        <button className="px-8 py-4 border border-white/20 text-white font-mono uppercase text-sm hover:bg-white/5 transition-colors">
                            Скачать каталог (PDF)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
