"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Project } from '@/lib/api';
import L from 'leaflet';
import { useEffect } from 'react';

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

    // Default center (Moscow roughly)
    const center: [number, number] = [55.7558, 37.6173];

    const createCustomIcon = () => new L.DivIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #FF4500; width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 0 10px #FF4500; border: 2px solid white;"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
        popupAnchor: [0, -10]
    });

    return (
        <div className="h-[500px] w-full overflow-hidden rounded-xl border border-border bg-deep-graphite/50 relative z-0">
            <MapContainer
                center={center}
                zoom={5}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                {projects.map((project) => (
                    project.latitude && project.longitude ? (
                        <Marker
                            key={project.id}
                            position={[project.latitude, project.longitude]}
                            icon={createCustomIcon()}
                        >
                            <Popup className="industrial-popup">
                                <div className="p-2 min-w-[200px] bg-deep-graphite text-white rounded-md border border-safety-orange/30">
                                    <h3 className="font-bold text-sm uppercase tracking-wider text-safety-orange mb-1">{project.title}</h3>
                                    <p className="text-xs text-gray-300 font-mono mb-2">{project.client.name}</p>
                                    <div className="text-[10px] text-gray-500">{project.region}</div>
                                </div>
                            </Popup>
                        </Marker>
                    ) : null
                ))}
            </MapContainer>
            <style jsx global>{`
                .leaflet-popup-content-wrapper {
                    background: transparent;
                    box-shadow: none;
                    padding: 0;
                }
                .leaflet-popup-tip {
                    background: #1A1A1A; /* Match deep-graphite */
                    border: 1px solid rgba(255, 69, 0, 0.3);
                }
            `}</style>
        </div>
    );
}
