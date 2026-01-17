"use client";

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { Project } from '@/lib/api';
import L from 'leaflet';

// Fix for default marker icon in Next.js
const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface MapComponentProps {
    projects: Project[];
}

export default function MapComponent({ projects }: MapComponentProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);

    // Default center (Moscow roughly)
    const center: [number, number] = [55.7558, 37.6173];

    // Initialize Map
    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Cleanup existing map if it exists (mostly for strict mode safety)
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }

        const map = L.map(mapContainerRef.current).setView(center, 5);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(map);

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Handle Markers
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        const createCustomIcon = () => new L.DivIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #FF4500; width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 0 10px #FF4500; border: 2px solid white;"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
            popupAnchor: [0, -10]
        });

        projects.forEach(project => {
            if (project.latitude && project.longitude) {
                const marker = L.marker([project.latitude, project.longitude], {
                    icon: createCustomIcon()
                }).addTo(mapInstanceRef.current!);

                const popupContent = `
                    <div class="p-2 min-w-[200px] bg-deep-graphite text-white rounded-md border border-safety-orange/30 font-sans">
                        <h3 class="font-bold text-sm uppercase tracking-wider text-safety-orange mb-1" style="color: #FF3D00; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">${project.title}</h3>
                        <p class="text-xs text-gray-300 font-mono mb-2" style="color: #d1d5db;">${project.client?.name || 'Unknown Client'}</p>
                        <div class="text-[10px] text-gray-500" style="color: #6b7280;">${project.region}</div>
                    </div>
                `;

                marker.bindPopup(popupContent, {
                    className: 'industrial-popup',
                    closeButton: false
                });

                markersRef.current.push(marker);
            }
        });
    }, [projects]);

    return (
        <div className="h-[500px] w-full overflow-hidden rounded-xl border border-border bg-deep-graphite/50 relative z-0">
            <div ref={mapContainerRef} className="h-full w-full" />
            <style jsx global>{`
                .leaflet-container {
                    background: #121212;
                }
            `}</style>
        </div>
    );
}
