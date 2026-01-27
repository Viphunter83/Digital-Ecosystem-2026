"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle, FileText, Settings, Maximize2, X, ShoppingBag } from "lucide-react";
import { ShimmerButton } from "@/components/ShimmerButton";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { useCartStore } from "@/lib/stores/useCartStore";
import { Product, parseSpecs, getImageUrl } from "@/lib/api";
import { toast } from "sonner";

interface ProductDetailProps {
    product: Product;
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

    // Prepare specs using common utility
    const specsArray = parseSpecs(product.specs);

    return (
        <div className="min-h-screen bg-industrial-surface text-white pt-24 pb-20">
            {/* Breadcrumb */}
            <div className="container mx-auto px-6 mb-8">
                <Link href="/catalog" className="inline-flex items-center text-muted-foreground hover:text-safety-orange transition-colors font-mono text-sm uppercase">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Каталог {product.category && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.category)
                        ? `/ ${product.category}`
                        : product.category
                            ? '/ Оборудование'
                            : '/ Запчасти'}
                </Link>
            </div>

            <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Visual Section */}
                <div className="space-y-6">
                    <Dialog>
                        <DialogTrigger asChild>
                            <div className="relative aspect-video lg:aspect-square bg-industrial-panel border border-industrial-border rounded-lg overflow-hidden group cursor-zoom-in">
                                {/* Technical Grid Overlay */}
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] z-10 pointer-events-none" />

                                {getImageUrl(product) ? (
                                    <>
                                        <Image
                                            src={imageError ? "/images/placeholder_machine.jpg" : getImageUrl(product)!}
                                            alt={cleanName}
                                            fill
                                            className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                                            onError={() => setImageError(true)}
                                            priority
                                        />
                                        {/* Zoom Indicator */}
                                        <div className="absolute bottom-4 right-4 z-20 bg-safety-orange/20 backdrop-blur-sm border border-safety-orange/30 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <Maximize2 className="w-5 h-5 text-safety-orange" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
                                        <span className="text-4xl font-black text-white/5 select-none font-mono">НЕТ ФОТО</span>
                                    </div>
                                )}

                                <div className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur border border-white/10 px-3 py-1 text-[10px] font-mono text-safety-orange">
                                    ID: {product.id.substring(0, 8)}
                                </div>
                            </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full p-0 bg-transparent border-none shadow-none flex items-center justify-center">
                            <div className="relative w-full h-full flex items-center justify-center p-4">
                                <DialogClose className="absolute top-6 right-6 z-50 p-2 bg-black/50 hover:bg-black/80 rounded-full border border-white/10 text-white transition-colors outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                                    <X className="h-6 w-6" />
                                    <span className="sr-only">Закрыть</span>
                                </DialogClose>

                                <div className="relative w-full h-full max-w-7xl">
                                    {getImageUrl(product) && (
                                        <Image
                                            src={getImageUrl(product)!}
                                            alt={cleanName}
                                            fill
                                            className="object-contain"
                                            priority
                                            sizes="95vw"
                                        />
                                    )}
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Info Section */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-none">
                            {cleanName}
                        </h1>
                        <div
                            className="text-lg text-gray-400 font-light leading-relaxed description-content whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{
                                __html: product.description || "Оригинальная запасная часть для металлообрабатывающего оборудования. Гарантия качества и совместимости."
                            }}
                        />
                        <style jsx>{`
                            .description-content :global(ul) { list-style-type: disc; padding-left: 1.5rem; margin-top: 1rem; margin-bottom: 1rem; }
                            .description-content :global(ol) { list-style-type: decimal; padding-left: 1.5rem; margin-top: 1rem; margin-bottom: 1rem; }
                            .description-content :global(li) { margin-bottom: 0.5rem; }
                            .description-content :global(p) { margin-bottom: 1rem; }
                        `}</style>
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
                    <div className="pt-6 border-t border-industrial-border grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/contacts" className="w-full">
                            <ShimmerButton
                                glow
                                className="bg-safety-orange text-white h-14 font-bold uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2 hover:bg-safety-orange-vivid w-full transition-all duration-500 hover:scale-[1.02]"
                            >
                                <FileText className="w-4 h-4" />
                                ЗАПРОСИТЬ КП
                            </ShimmerButton>
                        </Link>
                        <button
                            onClick={handleAddToCart}
                            className={`h-14 flex items-center justify-center gap-2 border font-mono uppercase text-sm transition-all duration-500 w-full group/btn
                                ${added
                                    ? 'bg-green-500/20 text-green-400 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                                    : 'bg-white/5 backdrop-blur-md border-white/10 text-white hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]'}
                            `}
                        >
                            {added ? (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    В КОРЗИНЕ
                                </>
                            ) : (
                                <>
                                    <ShoppingBag className="w-4 h-4 group-hover/btn:translate-y-[-2px] transition-transform" />
                                    В ЗАКАЗ
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
