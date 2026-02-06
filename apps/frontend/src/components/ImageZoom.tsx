"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";

interface ImageZoomProps {
    src: string;
    alt: string;
    children: React.ReactNode;
}

export function ImageZoom({ src, alt, children }: ImageZoomProps) {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const MIN_SCALE = 1;
    const MAX_SCALE = 5;
    const ZOOM_STEP = 0.5;

    // Reset on close
    useEffect(() => {
        if (!isOpen) {
            setScale(1);
            setPosition({ x: 0, y: 0 });
        }
    }, [isOpen]);

    const handleZoomIn = useCallback(() => {
        setScale((prev) => Math.min(prev + ZOOM_STEP, MAX_SCALE));
    }, []);

    const handleZoomOut = useCallback(() => {
        setScale((prev) => {
            const newScale = Math.max(prev - ZOOM_STEP, MIN_SCALE);
            if (newScale === MIN_SCALE) {
                setPosition({ x: 0, y: 0 });
            }
            return newScale;
        });
    }, []);

    const handleReset = useCallback(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    }, []);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        setScale((prev) => {
            const newScale = Math.min(Math.max(prev + delta, MIN_SCALE), MAX_SCALE);
            if (newScale === MIN_SCALE) {
                setPosition({ x: 0, y: 0 });
            }
            return newScale;
        });
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (scale > 1) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    }, [scale, position]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging && scale > 1) {
            const newX = e.clientX - dragStart.x;
            const newY = e.clientY - dragStart.y;

            // Calculate bounds based on scale
            const container = containerRef.current;
            if (container) {
                const rect = container.getBoundingClientRect();
                const maxX = (rect.width * (scale - 1)) / 2;
                const maxY = (rect.height * (scale - 1)) / 2;

                setPosition({
                    x: Math.max(-maxX, Math.min(maxX, newX)),
                    y: Math.max(-maxY, Math.min(maxY, newY)),
                });
            }
        }
    }, [isDragging, dragStart, scale]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Touch events for mobile
    const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);

    const getTouchDistance = (touches: React.TouchList) => {
        if (touches.length < 2) return null;
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const distance = getTouchDistance(e.touches);
            setLastTouchDistance(distance);
        } else if (e.touches.length === 1 && scale > 1) {
            setIsDragging(true);
            setDragStart({
                x: e.touches[0].clientX - position.x,
                y: e.touches[0].clientY - position.y,
            });
        }
    }, [scale, position]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2 && lastTouchDistance !== null) {
            e.preventDefault();
            const newDistance = getTouchDistance(e.touches);
            if (newDistance) {
                const delta = (newDistance - lastTouchDistance) * 0.01;
                setScale((prev) => Math.min(Math.max(prev + delta, MIN_SCALE), MAX_SCALE));
                setLastTouchDistance(newDistance);
            }
        } else if (e.touches.length === 1 && isDragging && scale > 1) {
            const newX = e.touches[0].clientX - dragStart.x;
            const newY = e.touches[0].clientY - dragStart.y;

            const container = containerRef.current;
            if (container) {
                const rect = container.getBoundingClientRect();
                const maxX = (rect.width * (scale - 1)) / 2;
                const maxY = (rect.height * (scale - 1)) / 2;

                setPosition({
                    x: Math.max(-maxX, Math.min(maxX, newX)),
                    y: Math.max(-maxY, Math.min(maxY, newY)),
                });
            }
        }
    }, [lastTouchDistance, isDragging, dragStart, scale]);

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
        setLastTouchDistance(null);
    }, []);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-[98vw] w-full max-h-[98vh] h-full p-0 bg-black/95 border-none shadow-2xl flex flex-col">
                {/* Header with controls */}
                <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleZoomOut}
                            disabled={scale <= MIN_SCALE}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-full border border-white/10 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Уменьшить"
                        >
                            <ZoomOut className="h-5 w-5" />
                        </button>
                        <div className="px-3 py-1 bg-white/10 rounded-full border border-white/10 text-white text-sm font-mono min-w-[60px] text-center">
                            {Math.round(scale * 100)}%
                        </div>
                        <button
                            onClick={handleZoomIn}
                            disabled={scale >= MAX_SCALE}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-full border border-white/10 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Увеличить"
                        >
                            <ZoomIn className="h-5 w-5" />
                        </button>
                        <button
                            onClick={handleReset}
                            disabled={scale === 1}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-full border border-white/10 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Сбросить"
                        >
                            <RotateCcw className="h-5 w-5" />
                        </button>
                    </div>

                    <DialogClose className="p-2 bg-white/10 hover:bg-white/20 rounded-full border border-white/10 text-white transition-colors">
                        <X className="h-6 w-6" />
                        <span className="sr-only">Закрыть</span>
                    </DialogClose>
                </div>

                {/* Image container */}
                <div
                    ref={containerRef}
                    className={`flex-1 flex items-center justify-center overflow-hidden ${scale > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"
                        }`}
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onClick={() => scale === 1 && handleZoomIn()}
                >
                    <div
                        className="relative w-full h-full transition-transform duration-100"
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            transformOrigin: "center center",
                        }}
                    >
                        <Image
                            src={src}
                            alt={alt}
                            fill
                            className="object-contain select-none pointer-events-none"
                            priority
                            sizes="98vw"
                            draggable={false}
                        />
                    </div>
                </div>

                {/* Footer hint */}
                <div className="absolute bottom-0 left-0 right-0 z-50 flex items-center justify-center p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white/60 text-sm font-mono">
                        {scale === 1
                            ? "🖱️ Колёсико мыши или клик для увеличения • 📱 Pinch для масштабирования"
                            : "🖱️ Перетащите для прокрутки • Колёсико для масштабирования"
                        }
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
