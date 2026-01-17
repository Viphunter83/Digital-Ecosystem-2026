import Image from "next/image";
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

export function ProductCard({ product }: ProductCardProps) {
    // Transform specs record to array for display
    const specsArray = product.specs
        ? Object.entries(product.specs).map(([key, value]) => ({ parameter: key, value: String(value) }))
        : [];

    return (
        <Card className="group h-full w-full overflow-hidden border border-industrial-border bg-industrial-panel relative transition-all duration-500 hover:border-safety-orange hover:shadow-[0_0_30px_rgba(255,61,0,0.1)] flex flex-col rounded-none">
            {/* Blueprint grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative aspect-[4/3] w-full bg-industrial-surface overflow-hidden border-b border-industrial-border group-hover:border-safety-orange/50 transition-colors">
                <div className="absolute top-0 right-0 p-3 z-20 flex gap-2">
                    <Badge className="bg-industrial-surface/90 backdrop-blur text-xs font-mono text-muted-foreground border border-industrial-border rounded-none uppercase tracking-wider px-2 py-[2px] shadow-sm">
                        ID: {product.id.toString().padStart(4, '0')}
                    </Badge>
                </div>

                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105 group-hover:saturate-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
                        <span className="text-6xl font-black text-white/5 select-none font-mono">НЕТ ФОТО</span>
                    </div>
                )}

                {/* Category Badge with Industrial styling */}
                {product.category && (
                    <div className="absolute bottom-0 left-0 bg-safety-orange text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest font-mono z-10 clip-path-slant">
                        {product.category}
                    </div>
                )}
            </div>

            <CardHeader className="pt-5 pb-2 relative z-10">
                <CardTitle className="text-lg font-bold text-white leading-tight group-hover:text-safety-orange transition-colors duration-300 font-manrope tracking-tight">
                    {product.name}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground line-clamp-2 min-h-[32px] font-mono mt-1">
                    {product.description || "ПРОМЫШЛЕННЫЙ КЛАСС // ВЫСОКАЯ ПРОИЗВОДИТЕЛЬНОСТЬ"}
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-grow relative z-10">
                <div className="grid gap-[1px] bg-industrial-border border border-industrial-border my-2">
                    {specsArray.slice(0, 3).map((spec, index) => (
                        <div key={index} className="flex justify-between items-center bg-industrial-panel px-3 py-2">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold font-mono">{spec.parameter}</span>
                            <span className="text-[10px] font-mono text-white/90">{spec.value}</span>
                        </div>
                    ))}
                </div>
            </CardContent>

            <CardFooter className="pt-2 pb-5 px-6 relative z-10">
                <ShimmerButton className="w-full bg-transparent border border-white/20 text-white hover:bg-safety-orange hover:border-safety-orange hover:text-white h-10 text-[10px]">
                    Характеристики
                </ShimmerButton>
            </CardFooter>
        </Card>
    );
}
