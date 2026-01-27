import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    shimmerColor?: string;
    glow?: boolean;
}

export function ShimmerButton({
    children,
    className,
    variant = "default",
    shimmerColor = "rgba(255, 255, 255, 0.4)",
    glow = false,
    ...props
}: ShimmerButtonProps) {
    return (
        <Button
            className={cn(
                "relative overflow-hidden group/shimmer font-mono uppercase tracking-widest font-bold rounded-none transition-all duration-500",
                glow && variant === "default" && "hover:shadow-[0_0_20px_rgba(255,80,0,0.4)] hover:border-safety-orange/50",
                className
            )}
            variant={variant}
            {...props}
        >
            <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>

            {/* Shimmer Effect */}
            <div
                className="absolute inset-0 -translate-x-[100%] animate-[shimmer_3s_infinite] group-hover/shimmer:animate-none opacity-50"
                style={{
                    background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
                }}
            />

            {/* Hover Glow Overlay */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/shimmer:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Button>
    );
}
