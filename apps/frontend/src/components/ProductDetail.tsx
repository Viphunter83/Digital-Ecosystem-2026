"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle, FileText, Settings, Maximize2, ShoppingBag, Play } from "lucide-react";
import { ShimmerButton } from "@/components/ShimmerButton";
import { ImageZoom } from "@/components/ImageZoom";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useCartStore } from "@/lib/stores/useCartStore";
import { Product, parseSpecs, getImageUrl, fetchSiteContent } from "@/lib/api";
import { toast } from "sonner";

interface ProductDetailProps {
    product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
    const addToCart = useCartStore((state) => state.addItem);
    const [added, setAdded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [siteContent, setSiteContent] = useState<Record<string, string>>({});
    const [activeImage, setActiveImage] = useState<string | null>(null);

    const images = product.images || [];
    const allImages = [
        ...(getImageUrl(product) ? [{ url: getImageUrl(product)!, is_primary: true }] : []),
        ...images.filter(img => !img.is_primary).map(img => ({ url: getImageUrl(img)! }))
    ].filter(img => img.url);

    useEffect(() => {
        if (allImages.length > 0 && !activeImage) {
            setActiveImage(allImages[0].url);
        }
    }, [product, allImages, activeImage]);

    useEffect(() => {
        const loadContent = async () => {
            const content = await fetchSiteContent();
            setSiteContent(content);
        };
        loadContent();
    }, []);

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
                    <ImageZoom src={activeImage || "/images/placeholder_machine.jpg"} alt={cleanName}>
                        <div className="relative aspect-video lg:aspect-square bg-industrial-panel border border-industrial-border rounded-lg overflow-hidden group cursor-zoom-in">
                            {/* Technical Grid Overlay */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] z-10 pointer-events-none" />

                            {activeImage ? (
                                <>
                                    <Image
                                        src={imageError ? "/images/placeholder_machine.jpg" : activeImage}
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
                    </ImageZoom>

                    {/* Thumbnails Gallery */}
                    {allImages.length > 1 && (
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                            {allImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(img.url)}
                                    className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${activeImage === img.url
                                        ? 'border-safety-orange bg-safety-orange/10'
                                        : 'border-industrial-border bg-industrial-panel hover:border-white/30'
                                        }`}
                                >
                                    <Image
                                        src={img.url}
                                        alt={`${cleanName} - фото ${idx + 1}`}
                                        fill
                                        className="object-contain p-1"
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Video Player Section */}
                    {product.video_url && (
                        <div className="mt-8 pt-8 border-t border-white/5">
                            <h3 className="text-xs font-mono uppercase text-safety-orange mb-4 flex items-center gap-2">
                                <Play className="w-3 h-3 animate-pulse" />
                                Видеообзор оборудования
                            </h3>
                            <VideoPlayer
                                url={product.video_url || ""}
                                title={`Обзор ${cleanName}`}
                                poster={activeImage || undefined}
                            />
                        </div>
                    )}
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

                    {/* Related items for Machines */}
                    {product.compatible_parts && product.compatible_parts.length > 0 && (
                        <div className="pt-8 border-t border-white/10">
                            <h3 className="text-sm font-bold uppercase text-white mb-6 flex items-center gap-2">
                                <Settings className="w-4 h-4 text-safety-orange" />
                                Комплектующие и расходники
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {product.compatible_parts.map((part) => (
                                    <Link
                                        key={part.id}
                                        href={`/catalog/${part.slug || part.id}`}
                                        className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-lg hover:border-safety-orange/50 transition-all group hover:bg-white/10"
                                    >
                                        <div className="relative w-16 h-16 bg-black/20 rounded-md overflow-hidden border border-white/5 shrink-0">
                                            <Image
                                                src={getImageUrl(part) || "/images/placeholder_machine.jpg"}
                                                alt={part.name}
                                                fill
                                                className="object-contain p-2"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[10px] text-muted-foreground uppercase font-mono truncate mb-1">Запчасть</div>
                                            <div className="text-sm font-bold text-white truncate group-hover:text-safety-orange transition-colors">
                                                {part.name.replace(/^ТД РУССтанкоСбыт\s*-\s*/i, "")}
                                            </div>
                                            {part.price && (
                                                <div className="text-xs text-safety-orange font-mono mt-1">
                                                    {part.price.toLocaleString('ru-RU')} ₽
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Related items for Spare Parts */}
                    {product.compatible_products && product.compatible_products.length > 0 && (
                        <div className="pt-8 border-t border-white/10">
                            <h3 className="text-sm font-bold uppercase text-white mb-6 flex items-center gap-2">
                                <Settings className="w-4 h-4 text-safety-orange" />
                                Подходит для оборудования
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {product.compatible_products.map((prod) => (
                                    <Link
                                        key={prod.id}
                                        href={`/catalog/${prod.slug || prod.id}`}
                                        className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-lg hover:border-safety-orange/50 transition-all group hover:bg-white/10"
                                    >
                                        <div className="relative w-16 h-16 bg-black/20 rounded-md overflow-hidden border border-white/5 shrink-0">
                                            <Image
                                                src={getImageUrl(prod) || "/images/placeholder_machine.jpg"}
                                                alt={prod.name}
                                                fill
                                                className="object-contain p-2"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[10px] text-muted-foreground uppercase font-mono truncate mb-1">
                                                {prod.category || 'Оборудование'}
                                            </div>
                                            <div className="text-sm font-bold text-white truncate group-hover:text-safety-orange transition-colors">
                                                {prod.name.replace(/^ТД РУССтанкоСбыт\s*-\s*/i, "")}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Advantages */}
                    <div className="grid grid-cols-2 gap-4 pt-8 border-t border-industrial-border">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-safety-orange shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-300">
                                {product.product_type === 'spare'
                                    ? (siteContent.usp_warranty_spare || siteContent.usp_warranty || "Гарантия от 6 месяцев")
                                    : (siteContent.usp_warranty || "Гарантия 24 месяца")}
                            </span>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-safety-orange shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-300">{siteContent.usp_training || "ПНР и Обучение"}</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-safety-orange shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-300">{siteContent.usp_leasing || "Лизинг от 0%"}</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-safety-orange shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-300">
                                {product.product_type === 'spare'
                                    ? (siteContent.usp_service_spare || siteContent.usp_service || "Тех. консультация 24/7")
                                    : (siteContent.usp_service || "Сервис 24/7")}
                            </span>
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
