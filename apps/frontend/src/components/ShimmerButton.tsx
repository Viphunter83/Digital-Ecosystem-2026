import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    shimmerColor?: string;
}

export function ShimmerButton({
    children,
    className,
    variant = "default",
    shimmerColor = "rgba(255, 255, 255, 0.4)",
    ...props
}: ShimmerButtonProps) {
    return (
        <Button
            className={cn(
                "relative overflow-hidden group/shimmer font-mono uppercase tracking-wider font-bold rounded-none transition-all duration-300",
                className
            )}
            variant={variant}
            {...props}
        >
            <span className="relative z-10">{children}</span>
            <div
                className="absolute inset-0 -translate-x-[100%] animate-[shimmer_4s_infinite] group-hover/shimmer:animate-none"
                style={{
                    background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
                }}
            />
        </Button>
    );
}
