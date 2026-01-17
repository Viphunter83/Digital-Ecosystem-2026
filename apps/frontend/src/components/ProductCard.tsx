import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
        <Card className="group w-full overflow-hidden border-border bg-card transition-all hover:border-safety-orange hover:shadow-[0_0_20px_rgba(255,95,0,0.15)] flex flex-col h-full">
            <div className="relative aspect-[4/3] w-full bg-machine-grey overflow-hidden">
                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground bg-gradient-to-br from-neutral-800 to-neutral-900">
                        <span className="text-4xl opacity-20 font-bold">ZIO</span>
                    </div>
                )}
                {product.category && (
                    <Badge className="absolute right-4 top-4 bg-safety-orange text-white hover:bg-safety-orange/90 rounded-none px-3 py-1 uppercase tracking-wider text-xs font-bold">
                        {product.category}
                    </Badge>
                )}
            </div>
            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold text-foreground line-clamp-1">{product.name}</CardTitle>
                <CardDescription className="text-sm line-clamp-2 min-h-[40px]">
                    {product.description || "High-performance equipment for industrial applications."}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="grid gap-2 text-sm">
                    {specsArray.slice(0, 3).map((spec, index) => (
                        <div key={index} className="flex justify-between border-b border-border/50 pb-1 last:border-0">
                            <span className="text-muted-foreground text-xs uppercase tracking-wide">{spec.parameter}</span>
                            <span className="font-medium text-foreground text-right">{spec.value}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="pt-2">
                <Button className="w-full bg-deep-graphite text-white hover:bg-safety-orange transition-colors rounded-sm uppercase tracking-wider font-bold h-12">
                    Подробнее
                </Button>
            </CardFooter>
        </Card>
    );
}
