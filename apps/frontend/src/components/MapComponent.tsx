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
        controls: [] // Clean controls
    };

    return (
        <div className="h-[500px] w-full overflow-hidden rounded-xl border border-border bg-deep-graphite/50 relative z-0">
            <YMaps>
                <div className="w-full h-full relative">
                    <Map
                        defaultState={defaultState}
                        width="100%"
                        height="100%"
                        options={{
                            suppressMapOpenBlock: true,
                            yandexMapDisablePoiInteractivity: true,
                            scrollZoom: false, // Requirement: Disable scroll zoom
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
                                        balloonContentHeader: `<span style="color:#000; font-weight:bold;">${project.title}</span>`,
                                        balloonContentBody: `${project.client?.name || ''}<br/><span style="color:#666">${project.region}</span>`,
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
