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

    return (
        <div className="h-[500px] w-full overflow-hidden rounded-xl border border-border bg-deep-graphite/50 relative z-0">
            <MapContainer
                center={center}
                zoom={5}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                {projects.map((project) => (
                    project.latitude && project.longitude ? (
                        <Marker
                            key={project.id}
                            position={[project.latitude, project.longitude]}
                            icon={customIcon}
                        >
                            <Popup className="industrial-popup">
                                <div className="p-1">
                                    <h3 className="font-bold text-sm">{project.title}</h3>
                                    <p className="text-xs text-muted-foreground">{project.client}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ) : null
                ))}
            </MapContainer>
        </div>
    );
}
