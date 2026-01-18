"use client";

import { YMaps, Map, Placemark, ZoomControl } from '@pbe/react-yandex-maps';
import { Project } from '@/lib/api';

interface MapComponentProps {
    projects: Project[];
}

export default function MapComponent({ projects }: MapComponentProps) {
    const defaultState = {
        center: [55.751574, 37.573856],
        zoom: 3,
        controls: [],
        behaviors: ["default", "-scrollZoom"]
    };

    return (
        <div className="h-full w-full overflow-hidden bg-deep-graphite relative z-0">
            <YMaps>
                <div className="w-full h-full relative">
                    <Map
                        defaultState={defaultState}
                        width="100%"
                        height="100%"
                        options={{
                            suppressMapOpenBlock: true,
                            yandexMapDisablePoiInteractivity: true,
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

                    {/* The Dark Mode Hack: Apply filter only to the map TILES, not the markers */}
                    <style jsx global>{`
                        /* Invert the ground pane (tiles) to create dark mode */
                        [class*="ground-pane"] {
                            filter: grayscale(100%) invert(100%) contrast(120%) brightness(80%);
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
