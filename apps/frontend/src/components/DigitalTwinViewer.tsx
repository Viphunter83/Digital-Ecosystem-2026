"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera, Grid, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Glitch } from "@react-three/postprocessing";
import { useRef, useMemo, useState } from "react";
import * as THREE from "three";

function MachineCore() {
    const group = useRef<THREE.Group>(null);
    const [hovered, setHover] = useState(false);

    useFrame((state) => {
        if (group.current) {
            group.current.rotation.y += 0.005;
        }
    });

    return (
        <group ref={group} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
            {/* Main Frame */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[2, 2.5, 2]} />
                <meshStandardMaterial
                    color={hovered ? "#ff3d00" : "#1a1a1a"}
                    roughness={0.2}
                    metalness={0.9}
                    wireframe={hovered}
                />
            </mesh>

            {/* Inner Glow */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[1.8, 2.3, 1.8]} />
                <meshBasicMaterial color="#ff3d00" transparent opacity={0.1} />
            </mesh>

            {/* Details - Top */}
            <mesh position={[0, 1.3, 0]}>
                <boxGeometry args={[2.2, 0.2, 2.2]} />
                <meshStandardMaterial color="#333" metalness={0.8} />
            </mesh>

            {/* Details - Base */}
            <mesh position={[0, -1.3, 0]}>
                <boxGeometry args={[2.5, 0.2, 2.5]} />
                <meshStandardMaterial color="#333" metalness={0.8} />
            </mesh>

            {/* Dynamic Ring */}
            <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[1.5, 0.05, 16, 100]} />
                <meshStandardMaterial color="#ff3d00" emissive="#ff3d00" emissiveIntensity={2} />
            </mesh>
        </group>
    );
}

function FloatingParticles() {
    const count = 100;
    const mesh = useRef<THREE.InstancedMesh>(null);

    useFrame((state) => {
        if (!mesh.current) return;
        // Simple rotation for particles
        mesh.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    });

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;
            const xFactor = -50 + Math.random() * 100;
            const yFactor = -50 + Math.random() * 100;
            const zFactor = -50 + Math.random() * 100;
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
        }
        return temp;
    }, [count]);

    return (
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    );
}

export function DigitalTwinViewer() {
    const [glitchActive, setGlitchActive] = useState(false);

    return (
        <div className="w-full h-full relative cursor-crosshair">
            <Canvas>
                <PerspectiveCamera makeDefault position={[5, 2, 5]} />
                <OrbitControls
                    enablePan={false}
                    minDistance={3}
                    maxDistance={10}
                    autoRotate
                    autoRotateSpeed={0.5}
                />

                <color attach="background" args={['#050505']} />

                {/* Lighting */}
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff3d00" />

                {/* Environment */}
                <Environment preset="city" />
                <Grid infiniteGrid fadeDistance={50} fadeStrength={5} sectionSize={1} sectionColor="#ff3d00" cellColor="#333" />

                {/* Core Object */}
                <MachineCore />
                <FloatingParticles />

                {/* Post Processing */}
                <EffectComposer>
                    <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} intensity={0.2} />
                    <Vignette eskil={false} offset={0.1} darkness={1.1} />
                </EffectComposer>
            </Canvas>

            {/* Overlay UI Controls */}
            {/* Glitch toggle removed for stability */}
            <div className="absolute bottom-4 left-4 pointer-events-none">
                <div className="text-white/50 font-mono text-xs">
                    DIGITAL TWIN ENGINE v2.0
                    <br />
                    FPS: 60 (Optimized)
                    <br />
                    RTX: ON
                </div>
            </div>
        </div>
    );
}
