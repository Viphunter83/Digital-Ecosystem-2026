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
import { Separator } from "@/components/ui/separator";

interface ProductCardProps {
    title: string;
    category: string;
    price: string;
    image?: string;
    specs: { parameter: string; value: string }[];
}


export function ProductCard({ title, category, price, image, specs }: ProductCardProps) {
    return (
        <Card className="w-full max-w-sm overflow-hidden border-border transition-all hover:border-accent hover:shadow-lg">
            <div className="relative aspect-[4/3] w-full bg-muted">
                {image ? (
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        No Image
                    </div>
                )}
                <Badge className="absolute right-4 top-4 bg-primary text-primary-foreground hover:bg-primary/90">
                    {category}
                </Badge>
            </div>
            <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">{title}</CardTitle>
                <CardDescription className="text-2xl font-semibold text-accent">
                    {price}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-2 text-sm">
                    {specs.map((spec, index) => (
                        <div key={index} className="flex justify-between">
                            <span className="text-muted-foreground">{spec.parameter}</span>
                            <span className="font-medium text-foreground">{spec.value}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6 font-bold uppercase tracking-wider">
                    В корзину
                </Button>
            </CardFooter>
        </Card>
    );
}
