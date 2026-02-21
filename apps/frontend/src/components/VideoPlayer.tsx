"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Maximize2, Volume2, Pause, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sanitizeUrl } from "@/lib/api";

interface VideoPlayerProps {
    url: string;
    title?: string;
    poster?: string;
}

export function VideoPlayer({ url, title, poster }: VideoPlayerProps) {
    const [isIframe, setIsIframe] = useState(false);
    const [embedUrl, setEmbedUrl] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const cleanUrl = sanitizeUrl(url);
        console.log('[VideoPlayer] Initializing with URL:', url);
        console.log('[VideoPlayer] Sanitized URL:', cleanUrl);

        if (!cleanUrl) {
            console.log('[VideoPlayer] No clean URL, returning');
            return;
        }

        // Detect YouTube
        const ytMatch = cleanUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (ytMatch) {
            setIsIframe(true);
            setEmbedUrl(`https://www.youtube.com/embed/${ytMatch[1]}`);
            return;
        }

        // Detect Vimeo
        const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/);
        if (vimeoMatch) {
            setIsIframe(true);
            setEmbedUrl(`https://player.vimeo.com/video/${vimeoMatch[1]}`);
            return;
        }

        // Detect Rutube
        const rutubeMatch = url.match(/(?:https?:\/\/)?(?:www\.)?rutube\.ru\/video\/([a-zA-Z0-9_-]+)/);
        if (rutubeMatch) {
            setIsIframe(true);
            setEmbedUrl(`https://rutube.ru/play/embed/${rutubeMatch[1]}`);
            return;
        }

        // Detect Directus UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(cleanUrl)) {
            setIsIframe(false);
            return;
        }

        // Detect VK (Video, Clip, Wall)
        const vkMatch = cleanUrl.match(/(?:https?:\/\/)?(?:www\.)?vk\.com\/(video|clip|wall)(-?\d+)_(\d+)/);
        if (vkMatch) {
            const type = vkMatch[1];
            const oid = vkMatch[2];
            const id = vkMatch[3];

            setIsIframe(true);
            if (type === 'wall') {
                // For wall posts, use the Video Extender if it's a video wall post 
                // but usually widget_post is what we have for "wall" type in VK.
                // However, many "wall" links are actually videos.
                setEmbedUrl(`https://vk.com/widget_post.php?owner_id=${oid}&post_id=${id}`);
            } else {
                setEmbedUrl(`https://vk.com/video_ext.php?oid=${oid}&id=${id}`);
            }
            return;
        }

        setIsIframe(false);
    }, [url]);

    const togglePlay = () => {
        if (!videoRef.current) return;

        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    if (!url) return null;

    return (
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-industrial-border group">
            {/* Technical Overlay */}
            <div className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur border border-white/10 px-3 py-1 text-[10px] font-mono text-safety-orange uppercase tracking-widest pointer-events-none">
                {title || "Video Feed"} // 24 FPS // {isPlaying ? 'ACTIVE' : 'IDLE'}
            </div>

            {isIframe ? (
                <iframe
                    src={embedUrl}
                    title={title || "Video Player"}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            ) : (
                <div
                    className="relative w-full h-full cursor-pointer"
                    onClick={togglePlay}
                >
                    <video
                        ref={videoRef}
                        src={sanitizeUrl(url) || ""}
                        poster={sanitizeUrl(poster) || undefined}
                        controls={true}
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-contain"
                        onPlay={() => {
                            console.log('[VideoPlayer] Play started');
                            setIsPlaying(true);
                        }}
                        onPause={() => {
                            console.log('[VideoPlayer] Play paused');
                            setIsPlaying(false);
                        }}
                        onError={(e) => {
                            console.error('[VideoPlayer] Video error:', videoRef.current?.error);
                        }}
                        onLoadedMetadata={() => {
                            console.log('[VideoPlayer] Metadata loaded, duration:', videoRef.current?.duration);
                        }}
                    >
                        <source src={sanitizeUrl(url) || ""} type="video/mp4" />
                        Ваш браузер не поддерживает встроенные видео.
                    </video>

                    {/* Big Play Button Overlay */}
                    <AnimatePresence>
                        {!isPlaying && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.2 }}
                                className="absolute inset-0 flex items-center justify-center z-20"
                            >
                                <div className="w-20 h-20 bg-safety-orange/90 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,61,0,0.5)] transition-transform hover:scale-110">
                                    <Play className="w-10 h-10 text-white fill-white ml-1" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Source Link Fallback - Always visible for iframes as they often get blocked or have access issues */}
            <div className={`absolute top-4 right-4 z-20 transition-opacity ${isIframe ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <a
                    href={sanitizeUrl(url) || url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-safety-orange backdrop-blur border border-white/20 px-4 py-2 rounded-full text-xs font-mono text-white shadow-lg hover:bg-safety-orange/80 transition-all uppercase tracking-widest active:scale-95"
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {url.includes('vk.com') ? 'Смотреть в VK' : 'Источник'}
                </a>
            </div>

            {/* Aesthetic Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] z-10 pointer-events-none group-hover:opacity-10 transition-opacity" />
        </div>
    );
}
