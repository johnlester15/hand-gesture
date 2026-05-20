"use client";

import { RoundedBox, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { fingerMap, GESTURES, type GestureId } from "../lib/gestures";

const skin = "#f1c6a5";
const skinLight = "#ffd9bd";
const skinDark = "#c98762";
const nail = "#fff2ea";

type FingerName = "index" | "middle" | "ring" | "pinky";

function Joint({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <sphereGeometry args={[0.105, 24, 24]} />
      <meshStandardMaterial color={skinLight} roughness={0.72} metalness={0} />
    </mesh>
  );
}

function Finger({ x, name, bend, length = 1, spread = 0 }: { x: number; name: FingerName; bend: number; length?: number; spread?: number }) {
  const base = useRef<THREE.Group>(null);
  const mid = useRef<THREE.Group>(null);
  const tip = useRef<THREE.Group>(null);

  useFrame(() => {
    const b1 = THREE.MathUtils.lerp(0.03, 1.12, bend);
    const b2 = THREE.MathUtils.lerp(0.02, 1.0, bend);
    const b3 = THREE.MathUtils.lerp(0.02, 0.72, bend);
    if (base.current) {
      base.current.rotation.x = THREE.MathUtils.lerp(base.current.rotation.x, b1, 0.12);
      base.current.rotation.z = THREE.MathUtils.lerp(base.current.rotation.z, spread, 0.12);
    }
    if (mid.current) mid.current.rotation.x = THREE.MathUtils.lerp(mid.current.rotation.x, b2, 0.12);
    if (tip.current) tip.current.rotation.x = THREE.MathUtils.lerp(tip.current.rotation.x, b3, 0.12);
  });

  const baseLen = 0.58 * length;
  const midLen = 0.48 * length;
  const tipLen = 0.36 * length;

  return (
    <group position={[x, 0.7, 0.02]}>
      <Joint position={[0, -0.05, 0]} />
      <group ref={base} position={[0, 0, 0]}>
        <mesh position={[0, baseLen / 2, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.105, baseLen, 12, 28]} />
          <meshStandardMaterial color={skin} roughness={0.68} metalness={0} />
        </mesh>
        <Joint position={[0, baseLen + 0.02, 0]} />
        <group ref={mid} position={[0, baseLen, 0]}>
          <mesh position={[0, midLen / 2, 0]} castShadow receiveShadow>
            <capsuleGeometry args={[0.095, midLen, 12, 28]} />
            <meshStandardMaterial color={skinLight} roughness={0.7} metalness={0} />
          </mesh>
          <Joint position={[0, midLen + 0.02, 0]} />
          <group ref={tip} position={[0, midLen, 0]}>
            <mesh position={[0, tipLen / 2, 0]} castShadow receiveShadow>
              <capsuleGeometry args={[0.086, tipLen, 12, 28]} />
              <meshStandardMaterial color={skinLight} roughness={0.64} metalness={0} />
            </mesh>
            <mesh position={[0, tipLen + 0.105, -0.07]} rotation={[0.42, 0, 0]} castShadow>
              <RoundedBox args={[0.13, 0.055, 0.018]} radius={0.018} smoothness={8}>
                <meshStandardMaterial color={nail} roughness={0.32} metalness={0} />
              </RoundedBox>
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

function Thumb({ bend, thumbUp, okPose }: { bend: number; thumbUp?: boolean; okPose?: boolean }) {
  const base = useRef<THREE.Group>(null);
  const tip = useRef<THREE.Group>(null);

  useFrame(() => {
    const targetZ = thumbUp ? 1.03 : okPose ? -0.2 : -0.8;
    const targetX = thumbUp ? -0.14 : THREE.MathUtils.lerp(0.1, 0.86, bend);
    const tipX = okPose ? 1.25 : THREE.MathUtils.lerp(0, 0.72, bend);
    if (base.current) {
      base.current.rotation.z = THREE.MathUtils.lerp(base.current.rotation.z, targetZ, 0.12);
      base.current.rotation.x = THREE.MathUtils.lerp(base.current.rotation.x, targetX, 0.12);
    }
    if (tip.current) tip.current.rotation.x = THREE.MathUtils.lerp(tip.current.rotation.x, tipX, 0.12);
  });

  return (
    <group position={[-0.72, -0.13, 0.04]} rotation={[0, 0.05, -0.18]}>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.16, 28, 28]} />
        <meshStandardMaterial color={skinDark} roughness={0.75} />
      </mesh>
      <group ref={base}>
        <mesh position={[0, 0.34, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.105, 0.55, 12, 28]} />
          <meshStandardMaterial color={skin} roughness={0.68} />
        </mesh>
        <Joint position={[0, 0.62, 0]} />
        <group ref={tip} position={[0, 0.58, 0]}>
          <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
            <capsuleGeometry args={[0.095, 0.46, 12, 28]} />
            <meshStandardMaterial color={skinLight} roughness={0.63} />
          </mesh>
          <mesh position={[0, 0.55, -0.07]} rotation={[0.42, 0, 0]} castShadow>
            <RoundedBox args={[0.13, 0.055, 0.018]} radius={0.018} smoothness={8}>
              <meshStandardMaterial color={nail} roughness={0.3} />
            </RoundedBox>
          </mesh>
        </group>
      </group>
    </group>
  );
}

function PalmLines() {
  const lines = useMemo(() => [
    { p: [-0.22, -0.05, -0.185], r: [0, 0, -0.18], s: [0.5, 0.018, 0.01] },
    { p: [0.12, 0.18, -0.188], r: [0, 0, 0.2], s: [0.45, 0.018, 0.01] },
    { p: [0.03, -0.28, -0.188], r: [0, 0, 0.1], s: [0.36, 0.016, 0.01] },
  ], []);

  return (
    <>
      {lines.map((line, i) => (
        <mesh key={i} position={line.p as any} rotation={line.r as any}>
          <boxGeometry args={line.s as any} />
          <meshStandardMaterial color="#b97958" roughness={0.8} />
        </mesh>
      ))}
    </>
  );
}

function MeaningSymbol({ gesture }: { gesture: GestureId }) {
  const label = GESTURES[gesture].label;
  return (
    <group position={[1.45, 0.7, -0.25]}>
      <mesh rotation={[0.1, 0.2, 0]} castShadow>
        <torusGeometry args={[0.34, 0.025, 16, 80]} />
        <meshStandardMaterial color="#67e8f9" emissive="#0891b2" emissiveIntensity={0.45} />
      </mesh>
      <Text fontSize={0.18} color="#e0f2fe" anchorX="center" anchorY="middle" position={[0, -0.02, 0.05]}>
        {label}
      </Text>
    </group>
  );
}

export default function HandModel({ gesture }: { gesture: GestureId }) {
  const pose = fingerMap[gesture] || fingerMap.open;
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.13;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.03;
  });

  return (
    <group ref={group} rotation={[0.18, -0.2, 0]} position={[-0.15, -0.45, 0]}>
      <mesh position={[0, -0.95, 0]} rotation={[0, 0, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.26, 0.72, 16, 32]} />
        <meshStandardMaterial color={skin} roughness={0.7} />
      </mesh>

      <RoundedBox args={[1.22, 1.25, 0.42]} radius={0.22} smoothness={16} position={[0, -0.1, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={skin} roughness={0.7} metalness={0} />
      </RoundedBox>

      <mesh position={[0, 0.22, -0.19]} scale={[0.9, 0.65, 0.07]} castShadow>
        <sphereGeometry args={[0.62, 32, 32]} />
        <meshStandardMaterial color={skinLight} roughness={0.72} />
      </mesh>

      <PalmLines />

      {[-0.42, -0.14, 0.14, 0.42].map((x, i) => (
        <mesh key={i} position={[x, 0.53, -0.16]} castShadow>
          <sphereGeometry args={[0.105, 24, 24]} />
          <meshStandardMaterial color={skinDark} roughness={0.78} />
        </mesh>
      ))}

      <Finger x={-0.42} name="index" bend={pose.index} length={0.94} spread={gesture === "peace" ? -0.09 : 0.02} />
      <Finger x={-0.14} name="middle" bend={pose.middle} length={1.1} spread={gesture === "peace" ? 0.09 : 0} />
      <Finger x={0.14} name="ring" bend={pose.ring} length={1.02} spread={0} />
      <Finger x={0.42} name="pinky" bend={pose.pinky} length={0.82} spread={gesture === "ily" || gesture === "rock" || gesture === "call" ? 0.12 : -0.02} />
      <Thumb bend={pose.thumb} thumbUp={pose.thumbUp} okPose={pose.okPose} />
      <MeaningSymbol gesture={gesture} />
    </group>
  );
}
