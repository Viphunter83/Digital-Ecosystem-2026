import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ShimmerButton } from "@/components/ShimmerButton";
import { Product, sanitizeUrl } from "@/lib/api";

interface ProductTableProps {
    products: Product[];
}

function ProductTableImage({ url, name }: { url?: string; name: string }) {
    const [imageError, setImageError] = useState(false);

    return (
        <div className="relative w-12 h-12 bg-industrial-surface border border-industrial-border overflow-hidden">
            {url ? (
                <Image
                    src={imageError ? "/images/placeholder_machine.jpg" : sanitizeUrl(url)!}
                    alt={name}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                    sizes="48px"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-[8px] text-white/20 font-mono">
                    NO IMG
                </div>
            )}
        </div>
    );
}

export function ProductTable({ products }: ProductTableProps) {
    return (
        <div className="w-full overflow-x-auto border border-industrial-border bg-industrial-panel">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-[10px] uppercase text-muted-foreground font-mono tracking-wider">
                        <th className="p-4 font-semibold w-[80px]">Фото</th>
                        <th className="p-4 font-semibold w-[120px]">Артикул</th>
                        <th className="p-4 font-semibold">Наименование</th>
                        <th className="p-4 font-semibold">Категория</th>
                        <th className="p-4 font-semibold">Остаток</th>
                        <th className="p-4 font-semibold text-right">Цена</th>
                        <th className="p-4 font-semibold w-[140px]"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {products.map((product) => (
                        <tr
                            key={product.id}
                            className="group hover:bg-white/5 transition-colors duration-200"
                        >
                            <td className="p-3">
                                <ProductTableImage url={product.image_url} name={product.name} />
                            </td>
                            <td className="p-4 font-mono text-sm text-white/70">
                                {product.id.toString().substring(0, 8).toUpperCase()}
                            </td>
                            <td className="p-4">
                                <div className="font-bold text-white group-hover:text-safety-orange transition-colors duration-300 font-manrope">
                                    {product.name}
                                </div>
                                <div className="text-[10px] text-muted-foreground font-mono line-clamp-1">
                                    {product.description || "-"}
                                </div>
                            </td>
                            <td className="p-4">
                                <Badge variant="outline" className="border-industrial-border text-xs font-mono rounded-none">
                                    {product.category || "ЗАПЧАСТЬ"}
                                </Badge>
                            </td>
                            <td className="p-4">
                                {/* Mock Stock Status - keep for now as logic is complex */}
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-signal-green animate-pulse" />
                                    <span className="text-xs font-mono text-signal-green">В НАЛИЧИИ</span>
                                </div>
                            </td>
                            <td className="p-4 text-right font-mono text-white text-sm">
                                {product.price
                                    ? <span>{product.price.toLocaleString("ru-RU")} ₽</span>
                                    : <span className="text-muted-foreground text-xs">ПО ЗАПРОСУ</span>
                                }
                            </td>
                            <td className="p-3 text-right">
                                <ShimmerButton className="h-8 text-[9px] px-3 bg-transparent border border-safety-orange/50 text-safety-orange hover:bg-safety-orange hover:text-white">
                                    В КОРЗИНУ
                                </ShimmerButton>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
