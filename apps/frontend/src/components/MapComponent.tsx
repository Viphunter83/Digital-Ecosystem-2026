"use client";

import { YMaps, Map, Placemark, ZoomControl } from '@pbe/react-yandex-maps';
import { Project } from '@/lib/api';
import { useState } from 'react';

interface MapComponentProps {
    projects: Project[];
}

export default function MapComponent({ projects }: MapComponentProps) {
    const [isInteractive, setIsInteractive] = useState(false);

    const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || 'da2795c4-0e28-4f3a-b58a-83432b0942b2';
    const isKeyValid = apiKey && apiKey !== 'placeholder_replace_with_real_key';

    // Domain verification for debugging
    if (typeof window !== 'undefined' && isKeyValid) {
        console.log(`[YandexMaps] Key: ${apiKey.substring(0, 5)}...`);
        console.log(`[YandexMaps] Projects count: ${projects.length}`);
        if (window.location.hostname === 'td-rss.ru' || window.location.hostname.endsWith('.ru')) {
            console.log(`[YandexMaps] Initializing for .ru domain: ${window.location.hostname}`);
        }
    }

    // If no projects, add a default one (e.g. Moscow Office) so the map isn't empty
    const displayProjects = projects.length > 0 ? projects : [
        {
            id: 'fallback',
            title: 'ЦЕНТРАЛЬНЫЙ ОФИС',
            region: 'МОСКВА',
            latitude: 55.790484,
            longitude: 37.467581,
            isOffice: true
        }
    ];

    const defaultState = {
        center: [55.751574, 37.573856],
        zoom: 3,
        controls: [],
        behaviors: isInteractive ? ["default", "scrollZoom"] : ["default", "-drag", "-scrollZoom", "-multiTouch"]
    };

    if (!isKeyValid) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-deep-graphite text-white/40 p-10 text-center border border-white/10 min-h-[400px]">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" /></svg>
                </div>
                <h3 className="font-bold uppercase tracking-widest text-sm mb-2">Карта в режиме ожидания</h3>
                <p className="text-xs max-w-xs leading-relaxed">
                    Для активации карты необходимо подтвердить API ключ в переменных окружения на домене td-rss.ru.
                </p>
                <button
                    onClick={() => window.open('https://developer.tech.yandex.ru/', '_blank')}
                    className="mt-4 text-[10px] uppercase font-mono border border-white/20 px-3 py-1 hover:bg-white/5 transition-colors"
                >
                    Кабинет Разработчика ➔
                </button>
            </div>
        );
    }

    return (
        <div
            className="h-full w-full overflow-hidden bg-deep-graphite relative z-0 group"
        >
            <YMaps query={{ apikey: apiKey, lang: 'ru_RU' }}>
                <div className="w-full h-full relative">
                    <Map
                        defaultState={defaultState}
                        state={{ ...defaultState, behaviors: isInteractive ? ["default", "scrollZoom"] : ["default", "-drag", "-scrollZoom", "-multiTouch"] }}
                        width="100%"
                        height="100%"
                        modules={["geoObject.addon.balloon", "geoObject.addon.hint"]}
                        options={{
                            suppressMapOpenBlock: true,
                            yandexMapDisablePoiInteractivity: !isInteractive,
                        }}
                    >
                        {/* Custom Zoom Control */}
                        <ZoomControl options={{ position: { right: 10, top: 100 } }} />

                        {displayProjects.map((project, idx) => {
                            if (!project.latitude || !project.longitude) return null;
                            return (
                                <Placemark
                                    key={idx}
                                    geometry={[project.latitude, project.longitude]}
                                    properties={{
                                        hintContent: project.title,
                                        balloonContentBody: `
                                            <div class="p-2 min-w-[200px]">
                                                <h3 class="font-bold text-sm uppercase tracking-wider text-safety-orange mb-1" style="color: #FF3D00; font-family: system-ui;">${project.title}</h3>
                                                <p class="text-xs text-gray-800 font-mono mb-2">${project.description || project.client?.name || ''}</p>
                                                <div class="text-[10px] text-gray-500 mb-2">${project.region}</div>
                                                ${(project.id && !project.isOffice) ? `<a href="/projects/${project.id}" target="_blank" class="block w-full text-center bg-[#FF3D00] text-white text-xs font-bold py-1 px-2 rounded hover:bg-[#E63700] transition-colors" style="background-color: #FF3D00; color: white; display: block; padding: 4px; text-decoration: none; border-radius: 4px;">ПОДРОБНЕЕ</a>` : ''}
                                            </div>
                                        `,
                                    }}
                                    modules={["geoObject.addon.balloon", "geoObject.addon.hint"]}
                                    options={{
                                        iconColor: '#FF4500', // Safety Orange
                                        preset: 'islands#circleIcon',
                                        hideIconOnBalloonOpen: false,
                                        openBalloonOnClick: true
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
