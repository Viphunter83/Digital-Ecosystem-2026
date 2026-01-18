"use client";

import { YMaps, Map, Placemark, ZoomControl } from '@pbe/react-yandex-maps';
import { Project } from '@/lib/api';
import { useState } from 'react';

interface MapComponentProps {
    projects: Project[];
}

export default function MapComponent({ projects }: MapComponentProps) {
    const [isInteractive, setIsInteractive] = useState(false);

    const defaultState = {
        center: [55.751574, 37.573856],
        zoom: 3,
        controls: [],
        behaviors: isInteractive ? ["default", "scrollZoom"] : ["default", "-drag", "-scrollZoom", "-multiTouch"]
    };

    return (
        <div
            className="h-full w-full overflow-hidden bg-deep-graphite relative z-0 group"
        >
            <YMaps>
                <div className="w-full h-full relative">
                    <Map
                        key={isInteractive ? 'interactive' : 'static'} // Force re-render behavior
                        defaultState={defaultState}
                        width="100%"
                        height="100%"
                        options={{
                            suppressMapOpenBlock: true,
                            yandexMapDisablePoiInteractivity: !isInteractive,
                        }}
                    >
                        {/* Custom Zoom Control */}
                        <ZoomControl options={{ position: { right: 10, top: 100 } }} />

                        {projects.map((project, idx) => {
                            if (!project.latitude || !project.longitude) return null;
                            return (
                                <Placemark
                                    key={idx}
                                    geometry={[project.latitude, project.longitude]}
                                    properties={{
                                        hintContent: project.title,
                                        balloonContentBody: `<h3 class="font-bold text-sm uppercase tracking-wider text-safety-orange mb-1" style="color: #FF3D00; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">${project.title}</h3>
                        <p class="text-xs text-gray-300 font-mono mb-2" style="color: #d1d5db;">${project.description || project.client?.name || ''}</p>
                        <div class="text-[10px] text-gray-500" style="color: #6b7280;">${project.region}</div>`,
                                    }}
                                    options={{
                                        iconColor: '#FF4500', // Safety Orange
                                        preset: 'islands#circleIcon',
                                    }}
                                />
                            );
                        })}
                    </Map>

                    {/* Interaction Guard Overlay */}
                    {!isInteractive && (
                        <div
                            className="absolute inset-0 z-50 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/30 transition-colors backdrop-blur-[1px]"
                            onClick={() => setIsInteractive(true)}
                            onTouchEnd={() => setIsInteractive(true)}
                        >
                            <div className="bg-black/80 px-4 py-2 rounded border border-white/20 text-white font-mono text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl backdrop-blur-md">
                                <span className="animate-pulse">👆</span>
                                <span>Активировать карту</span>
                            </div>
                        </div>
                    )}

                    {/* The Dark Mode Hack: Apply filter only to the map TILES, not the markers */}
                    <style jsx global>{`
                        /* Invert the ground pane (tiles) to create dark mode */
                        [class*="ground-pane"] {
                            filter: invert(100%) grayscale(100%) brightness(85%);
                        }
                        /* Ensure copyright text is readable (optional) */
                        [class*="copyrights-pane"] {
                            filter: invert(100%);
                        }
                    `}</style>
                </div>
            </YMaps>
        </div>
    );
}
