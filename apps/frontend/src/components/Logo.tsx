
import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    showSubtitle?: boolean;
    variant?: "light" | "dark";
}

export function Logo({ className, showSubtitle = true, variant = "light" }: LogoProps) {
    const textColor = variant === "light" ? "text-white" : "text-industrial-text";
    const subColor = variant === "light" ? "text-white/60" : "text-industrial-text/60";

    return (
        <div className={cn("flex items-center gap-3 select-none group", className)}>
            {/* Animated Icon */}
            <div className="relative w-10 h-10 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full text-safety-orange drop-shadow-[0_0_10px_rgba(255,61,0,0.5)] transform group-hover:rotate-90 transition-transform duration-700 ease-in-out">
                    {/* Hexagon Outer */}
                    <path
                        d="M50 5 L93.3 30 V80 L50 95 L6.7 80 V30 Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinejoin="round"
                    />
                    {/* Inner Circle / Cutter Head */}
                    <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-80" />
                    <circle cx="50" cy="50" r="12" fill="currentColor" />
                    {/* Cutting flutes */}
                    <line x1="50" y1="25" x2="50" y2="10" stroke="currentColor" strokeWidth="4" />
                    <line x1="50" y1="75" x2="50" y2="90" stroke="currentColor" strokeWidth="4" />
                    <line x1="25" y1="50" x2="10" y2="50" stroke="currentColor" strokeWidth="4" />
                    <line x1="75" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="4" />
                </svg>
            </div>

            {/* Typography */}
            <div className="flex flex-col leading-none">
                <div className={cn("font-black tracking-tighter uppercase text-xl flex items-center gap-1", textColor)}>
                    <span>ТД</span>
                    <span className="text-safety-orange">РУС</span>
                    <span>СтанкоСбыт</span>
                </div>
                {showSubtitle && (
                    <div className={cn("text-[8px] font-mono uppercase tracking-[0.3em] pl-[2px] pt-1 font-bold", subColor)}>
                        Industrial Systems
                    </div>
                )}
            </div>
        </div>
    );
}
