"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, OrbitControls, RoundedBox, Text } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { GestureKey } from "../lib/gestureRules";
import { GESTURE_DETAILS } from "../lib/gestureRules";

type Hand3DProps = {
  gesture: GestureKey;
  compact?: boolean;
};

type CurlState = "straight" | "half" | "bent" | "pinch";

type FingerProps = {
  x: number;
  length?: number;
  radius?: number;
  curl?: CurlState;
  spread?: number;
  z?: number;
};

const skin = "#f2bd92";
const skinWarm = "#e5a777";
const skinShadow = "#ba7652";
const nail = "#ffe4d6";
const cyan = "#38bdf8";
const purple = "#a78bfa";

const gestureAccent: Record<GestureKey, string> = {
  none: "#94a3b8",
  open: "#38bdf8",
  fist: "#f59e0b",
  peace: "#22c55e",
  thumbsUp: "#14b8a6",
  point: "#60a5fa",
  love: "#fb7185",
  rock: "#f97316",
  call: "#eab308",
  ok: "#10b981",
  three: "#8b5cf6",
};

function Joint({ radius = 0.075 }: { radius?: number }) {
  return (
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[radius, 32, 18]} />
      <meshStandardMaterial color={skinWarm} roughness={0.62} />
    </mesh>
  );
}

function FingerSegment({
  length,
  radius,
  fingertip = false,
}: {
  length: number;
  radius: number;
  fingertip?: boolean;
}) {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, length / 2, 0]}>
        <capsuleGeometry args={[radius, length, 14, 28]} />
        <meshStandardMaterial color={skin} roughness={0.56} metalness={0.015} />
      </mesh>
      {fingertip && (
        <mesh castShadow position={[0, length + radius * 0.55, -radius * 0.74]} rotation={[0.08, 0, 0]}>
          <RoundedBox args={[radius * 1.32, radius * 0.58, radius * 0.13]} radius={0.015} smoothness={4}>
            <meshStandardMaterial color={nail} roughness={0.48} />
          </RoundedBox>
        </mesh>
      )}
    </group>
  );
}

function Finger({ x, length = 1, radius = 0.075, curl = "straight", spread = 0, z = 0 }: FingerProps) {
  const rotations: Record<CurlState, [number, number, number]> = {
    straight: [-0.02, 0.01, 0],
    half: [-0.48, 0, 0],
    bent: [-1.16, 0, 0],
    pinch: [-0.78, 0.02, 0],
  };

  const rot2: Record<CurlState, [number, number, number]> = {
    straight: [-0.02, 0, 0],
    half: [-0.52, 0, 0],
    bent: [-1.28, 0, 0],
    pinch: [-0.92, 0, 0],
  };

  const rot3: Record<CurlState, [number, number, number]> = {
    straight: [-0.02, 0, 0],
    half: [-0.32, 0, 0],
    bent: [-1.08, 0, 0],
    pinch: [-0.72, 0, 0],
  };

  const l1 = 0.42 * length;
  const l2 = 0.34 * length;
  const l3 = 0.27 * length;

  return (
    <group position={[x, 0.38, z]} rotation={[0, 0, spread]}>
      <mesh position={[0, -0.025, 0]} castShadow receiveShadow>
        <sphereGeometry args={[radius * 1.18, 26, 16]} />
        <meshStandardMaterial color={skinShadow} roughness={0.6} />
      </mesh>
      <group rotation={rotations[curl]}>
        <FingerSegment length={l1} radius={radius} />
        <group position={[0, l1, 0]}>
          <Joint radius={radius * 0.92} />
          <group rotation={rot2[curl]}>
            <FingerSegment length={l2} radius={radius * 0.9} />
            <group position={[0, l2, 0]}>
              <Joint radius={radius * 0.8} />
              <group rotation={rot3[curl]}>
                <FingerSegment length={l3} radius={radius * 0.78} fingertip />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

function Thumb({ mode }: { mode: "open" | "bent" | "up" | "call" | "pinch" }) {
  const baseRotation: Record<typeof mode, [number, number, number]> = {
    open: [0.15, 0.2, -0.92],
    bent: [-0.2, 0.1, -1.08],
    up: [0.02, -0.18, 1.28],
    call: [0.08, 0.08, -1.32],
    pinch: [-0.52, 0.18, -0.58],
  };

  const curl1 = mode === "bent" ? -0.85 : mode === "pinch" ? -0.38 : -0.04;
  const curl2 = mode === "bent" ? -0.9 : mode === "pinch" ? -0.62 : 0.04;

  return (
    <group position={[-0.64, -0.2, 0.02]} rotation={baseRotation[mode]}>
      <mesh position={[0, -0.02, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.105, 28, 16]} />
        <meshStandardMaterial color={skinShadow} roughness={0.6} />
      </mesh>
      <group rotation={[curl1, 0, 0]}>
        <FingerSegment length={0.42} radius={0.088} />
        <group position={[0, 0.42, 0]}>
          <Joint radius={0.08} />
          <group rotation={[curl2, 0, 0]}>
            <FingerSegment length={0.36} radius={0.076} fingertip />
          </group>
        </group>
      </group>
    </group>
  );
}

function SymbolBadge({ gesture }: { gesture: GestureKey }) {
  const detail = GESTURE_DETAILS[gesture];
  const accent = gestureAccent[gesture];
  const code = gesture === "none" ? "SCAN" : detail.label.toUpperCase();

  return (
    <Float speed={1.6} rotationIntensity={0.08} floatIntensity={0.18}>
      <group position={[0, 2.12, -0.05]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.92, 0.92, 0.08, 64]} />
          <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.08} emissive={accent} emissiveIntensity={0.05} />
        </mesh>
        <mesh position={[0, 0.055, 0]}>
          <torusGeometry args={[0.93, 0.018, 12, 80]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.65} />
        </mesh>
        <Text position={[0, 0.105, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.16} anchorX="center" anchorY="middle" maxWidth={1.65}>
          {code}
          <meshStandardMaterial color="#e2e8f0" emissive={accent} emissiveIntensity={0.22} />
        </Text>
      </group>
    </Float>
  );
}

function GestureAura({ gesture }: { gesture: GestureKey }) {
  const accent = gestureAccent[gesture];
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.z = clock.getElapsedTime() * 0.55;
  });

  return (
    <group position={[0, -0.22, -0.22]}>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.22, 0.012, 8, 100]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.75} transparent opacity={0.7} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.98, 0.01, 8, 100]} />
        <meshStandardMaterial color={purple} emissive={purple} emissiveIntensity={0.45} transparent opacity={0.42} />
      </mesh>
    </group>
  );
}

function palmShape() {
  return (
    <group>
      <RoundedBox args={[1.17, 1.18, 0.42]} radius={0.22} smoothness={8} position={[0, -0.22, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={skin} roughness={0.54} metalness={0.02} />
      </RoundedBox>
      <RoundedBox args={[0.92, 0.38, 0.44]} radius={0.17} smoothness={8} position={[0, -0.87, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={skinWarm} roughness={0.58} />
      </RoundedBox>
      <mesh position={[0, -0.12, -0.24]} receiveShadow>
        <boxGeometry args={[0.72, 0.04, 0.025]} />
        <meshStandardMaterial color={skinShadow} roughness={0.7} transparent opacity={0.35} />
      </mesh>
      {[-0.36, -0.12, 0.12, 0.36].map((x) => (
        <mesh key={x} position={[x, 0.26, -0.24]} castShadow>
          <sphereGeometry args={[0.08, 24, 14]} />
          <meshStandardMaterial color={skinShadow} roughness={0.62} />
        </mesh>
      ))}
    </group>
  );
}

function HandModel({ gesture }: { gesture: GestureKey }) {
  const group = useRef<THREE.Group>(null);

  const states = useMemo(() => {
    const fist = gesture === "fist";
    const peace = gesture === "peace";
    const thumbsUp = gesture === "thumbsUp";
    const point = gesture === "point";
    const love = gesture === "love";
    const rock = gesture === "rock";
    const call = gesture === "call";
    const ok = gesture === "ok";
    const three = gesture === "three";

    return {
      index: (ok ? "pinch" : fist || thumbsUp || call ? "bent" : "straight") as CurlState,
      middle: (fist || thumbsUp || point || love || rock || call ? "bent" : "straight") as CurlState,
      ring: (fist || thumbsUp || peace || point || love || rock || call ? "bent" : "straight") as CurlState,
      pinky: (fist || thumbsUp || peace || point || three || ok ? "bent" : "straight") as CurlState,
      thumb: (thumbsUp ? "up" : ok ? "pinch" : call ? "call" : fist || peace || point || rock || three ? "bent" : "open") as "open" | "bent" | "up" | "call" | "pinch",
      spreadIndex: peace ? -0.17 : love || rock ? -0.1 : ok ? -0.04 : -0.045,
      spreadMiddle: peace ? 0.12 : three ? 0.04 : 0,
      spreadRing: three ? 0.08 : 0.025,
      spreadPinky: love || rock || call ? 0.24 : 0.07,
    };
  }, [gesture]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.55) * 0.14;
    group.current.position.y = Math.sin(clock.getElapsedTime() * 1.15) * 0.035;
  });

  return (
    <group ref={group} rotation={[0.34, -0.12, 0]}>
      <GestureAura gesture={gesture} />
      <SymbolBadge gesture={gesture} />
      {palmShape()}
      <Finger x={-0.42} length={0.94} radius={0.078} curl={states.index} spread={states.spreadIndex} z={0.015} />
      <Finger x={-0.14} length={1.1} radius={0.083} curl={states.middle} spread={states.spreadMiddle} z={0.025} />
      <Finger x={0.14} length={1.02} radius={0.079} curl={states.ring} spread={states.spreadRing} z={0.017} />
      <Finger x={0.42} length={0.86} radius={0.07} curl={states.pinky} spread={states.spreadPinky} z={0.01} />
      <Thumb mode={states.thumb} />
    </group>
  );
}

export default function Hand3D({ gesture, compact = false }: Hand3DProps) {
  return (
    <div className={`relative w-full overflow-hidden rounded-[2rem] border border-sky-300/20 bg-[#020617] shadow-glow ${compact ? "h-[340px] sm:h-[420px]" : "h-[440px] sm:h-[520px]"}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-sky-400/10 via-indigo-400/5 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(56,189,248,0.16),transparent_38%)]" />
      <Canvas shadows dpr={[1, 1.7]} camera={{ position: [0, 1.18, 5.2], fov: 40 }}>
        <ambientLight intensity={0.75} />
        <directionalLight position={[4, 6, 5]} intensity={2.15} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <pointLight position={[-3, 2.4, 3]} intensity={16} color={cyan} />
        <pointLight position={[3, 1.6, 2]} intensity={8} color={purple} />
        <HandModel gesture={gesture} />
        <ContactShadows position={[0, -1.18, 0]} opacity={0.48} scale={5} blur={2.4} far={2.4} />
        <Environment preset="city" />
        <OrbitControls enablePan={false} minDistance={3.1} maxDistance={7} autoRotate autoRotateSpeed={0.55} />
      </Canvas>
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-xs text-slate-200 backdrop-blur sm:text-sm">
        <span>Procedural 3D hand</span>
        <span className="hidden text-slate-400 sm:inline">Drag to rotate</span>
      </div>
    </div>
  );
}
