'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Float, OrbitControls, RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { GESTURES } from '../lib/gestures';

const skin = '#f0c7a4';
const skinLight = '#ffd8bc';
const skinDark = '#c98f72';
const nail = '#fff1e8';

function useSmoothRotation(ref, target, speed = 0.16) {
  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, target[0], speed);
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, target[1], speed);
    ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, target[2], speed);
  });
}

function useSmoothPosition(ref, target, speed = 0.16) {
  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, target[0], speed);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, target[1], speed);
    ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, target[2], speed);
  });
}

function CapsuleSegment({ length = 0.48, radius = 0.075, color = skin, highlight = false }) {
  return (
    <group>
      <mesh position={[0, length / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius * 0.92, radius, length, 32]} />
        <meshPhysicalMaterial color={color} roughness={0.62} metalness={0} clearcoat={0.18} />
      </mesh>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[radius, 32, 16]} />
        <meshPhysicalMaterial color={highlight ? skinLight : color} roughness={0.65} clearcoat={0.14} />
      </mesh>
      <mesh position={[0, length, 0]} castShadow receiveShadow>
        <sphereGeometry args={[radius * 0.96, 32, 16]} />
        <meshPhysicalMaterial color={highlight ? skinLight : color} roughness={0.65} clearcoat={0.14} />
      </mesh>
    </group>
  );
}

function Finger({ base = [0, 0, 0], spread = 0, scale = 1, bend = [0, 0, 0], splay = 0, nailVisible = true }) {
  const j1 = useRef();
  const j2 = useRef();
  const j3 = useRef();
  useSmoothRotation(j1, [bend[0], 0, splay], 0.18);
  useSmoothRotation(j2, [bend[1], 0, 0], 0.2);
  useSmoothRotation(j3, [bend[2], 0, 0], 0.22);

  const l1 = 0.45 * scale;
  const l2 = 0.37 * scale;
  const l3 = 0.28 * scale;
  const r = 0.072 * Math.max(0.84, scale);

  return (
    <group position={base} rotation={[0, 0, spread]}>
      <group ref={j1}>
        <CapsuleSegment length={l1} radius={r} />
        <mesh position={[0, 0.03, -0.052]} scale={[1.05, 0.45, 0.45]} castShadow>
          <sphereGeometry args={[r * 1.1, 24, 12]} />
          <meshStandardMaterial color={skinDark} roughness={0.78} />
        </mesh>
        <group position={[0, l1, 0]} ref={j2}>
          <CapsuleSegment length={l2} radius={r * 0.9} highlight />
          <group position={[0, l2, 0]} ref={j3}>
            <CapsuleSegment length={l3} radius={r * 0.8} color={skinLight} />
            {nailVisible && (
              <mesh position={[0, l3 * 0.72, -r * 0.78]} rotation={[Math.PI / 2.1, 0, 0]} scale={[1, 1.35, 0.18]} castShadow>
                <sphereGeometry args={[r * 0.72, 24, 12]} />
                <meshPhysicalMaterial color={nail} roughness={0.42} clearcoat={0.35} />
              </mesh>
            )}
          </group>
        </group>
      </group>
    </group>
  );
}

function Thumb({ pose }) {
  const root = useRef();
  const mid = useRef();
  const tip = useRef();
  useSmoothRotation(root, pose.root, 0.18);
  useSmoothRotation(mid, pose.mid, 0.2);
  useSmoothRotation(tip, pose.tip, 0.22);

  return (
    <group position={[-0.62, -0.17, 0.04]} ref={root}>
      <CapsuleSegment length={0.42} radius={0.085} color={skin} />
      <mesh position={[0, 0.03, -0.04]} scale={[1.05, 0.55, 0.45]}>
        <sphereGeometry args={[0.095, 24, 12]} />
        <meshStandardMaterial color={skinDark} roughness={0.75} />
      </mesh>
      <group position={[0, 0.42, 0]} ref={mid}>
        <CapsuleSegment length={0.34} radius={0.074} color={skinLight} />
        <group position={[0, 0.34, 0]} ref={tip}>
          <CapsuleSegment length={0.22} radius={0.064} color={skinLight} />
          <mesh position={[0, 0.14, -0.052]} rotation={[Math.PI / 2.1, 0, 0]} scale={[1, 1.25, 0.18]}>
            <sphereGeometry args={[0.05, 24, 12]} />
            <meshPhysicalMaterial color={nail} roughness={0.42} clearcoat={0.35} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

const straight = [0.02, 0.02, 0.01];
const relaxed = [0.32, 0.2, 0.12];
const curled = [1.1, 0.92, 0.72];
const tight = [1.38, 1.12, 0.85];
const half = [0.72, 0.58, 0.38];
const hook = [0.58, 1.08, 0.72];

function poseFor(gesture) {
  const poses = {
    open: {
      fingers: [relaxed, straight, straight, relaxed],
      thumb: { root: [0.05, 0.15, 0.92], mid: [0.05, 0, -0.1], tip: [0.03, 0, 0] },
    },
    fist: {
      fingers: [tight, tight, tight, tight],
      thumb: { root: [0.9, 0.1, 0.85], mid: [0.75, 0, -0.2], tip: [0.42, 0, 0] },
    },
    peace: {
      fingers: [straight, straight, tight, tight],
      thumb: { root: [0.58, 0.12, 0.55], mid: [0.55, 0, -0.1], tip: [0.35, 0, 0] },
    },
    thumbsUp: {
      fingers: [tight, tight, tight, tight],
      thumb: { root: [-0.35, 0.05, 1.72], mid: [-0.06, 0, 0], tip: [0, 0, 0] },
    },
    point: {
      fingers: [straight, tight, tight, tight],
      thumb: { root: [0.52, 0.12, 0.66], mid: [0.58, 0, -0.15], tip: [0.25, 0, 0] },
    },
    ok: {
      fingers: [hook, straight, relaxed, relaxed],
      thumb: { root: [0.42, 0.16, 1.0], mid: [0.42, 0, -0.35], tip: [0.28, 0, -0.18] },
    },
    call: {
      fingers: [tight, tight, tight, straight],
      thumb: { root: [0.02, 0.05, 1.45], mid: [0.05, 0, 0.05], tip: [0.02, 0, 0] },
    },
    ilove: {
      fingers: [straight, tight, tight, straight],
      thumb: { root: [0.05, 0.05, 1.2], mid: [0.05, 0, 0], tip: [0.02, 0, 0] },
    },
    rock: {
      fingers: [straight, tight, tight, straight],
      thumb: { root: [0.65, 0.08, 0.65], mid: [0.62, 0, -0.12], tip: [0.32, 0, 0] },
    },
    three: {
      fingers: [straight, straight, straight, tight],
      thumb: { root: [0.58, 0.15, 0.6], mid: [0.58, 0, -0.16], tip: [0.28, 0, 0] },
    },
    four: {
      fingers: [straight, straight, straight, straight],
      thumb: { root: [0.62, 0.12, 0.52], mid: [0.62, 0, -0.12], tip: [0.36, 0, 0] },
    },
    lshape: {
      fingers: [straight, tight, tight, tight],
      thumb: { root: [0.02, 0.04, 1.25], mid: [0.03, 0, 0], tip: [0.02, 0, 0] },
    },
  };
  return poses[gesture] || poses.open;
}

function PalmDetails({ color }) {
  const lineMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#a16b56', roughness: 0.9 }), []);
  return (
    <group>
      {[[-0.25, 0.06, 0.196, 0.34], [0.05, -0.05, 0.197, 0.42], [0.3, 0.1, 0.198, 0.28]].map((l, i) => (
        <mesh key={i} position={[l[0], l[1], l[2]]} rotation={[0, 0, i === 1 ? -0.35 : 0.45]} scale={[0.018, l[3], 0.01]}>
          <capsuleGeometry args={[1, 1, 4, 12]} />
          <primitive object={lineMat} attach="material" />
        </mesh>
      ))}
      {[-0.34, -0.11, 0.12, 0.34].map((x, i) => (
        <mesh key={x} position={[x, 0.6, -0.13]} scale={[1, 0.55, 0.28]} castShadow>
          <sphereGeometry args={[0.095 - i * 0.004, 24, 12]} />
          <meshStandardMaterial color={color} roughness={0.74} />
        </mesh>
      ))}
    </group>
  );
}

function MeaningIcon({ gesture }) {
  const info = GESTURES[gesture] || GESTURES.open;
  const color = info.color;
  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.25}>
      <group position={[1.65, 0.45, 0]}>
        <mesh castShadow>
          <torusGeometry args={[0.28, 0.035, 18, 80]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
        </mesh>
        <Text position={[0, -0.62, 0]} fontSize={0.13} color="#e5eefc" anchorX="center" anchorY="middle" maxWidth={1.2}>
          {info.name}
        </Text>
      </group>
    </Float>
  );
}

function HandModel({ gesture }) {
  const group = useRef();
  const p = poseFor(gesture);
  const info = GESTURES[gesture] || GESTURES.open;
  useSmoothPosition(group, [0, -0.25, 0], 0.08);

  return (
    <Float speed={1.4} rotationIntensity={0.12} floatIntensity={0.12}>
      <group ref={group} rotation={[0.16, -0.25, 0.04]}>
        <mesh position={[0, -0.92, -0.02]} rotation={[0, 0, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.23, 0.62, 16, 32]} />
          <meshPhysicalMaterial color={skinDark} roughness={0.7} clearcoat={0.08} />
        </mesh>
        <RoundedBox position={[0, -0.1, 0]} args={[1.12, 1.15, 0.42]} radius={0.18} smoothness={8} castShadow receiveShadow>
          <meshPhysicalMaterial color={skin} roughness={0.58} metalness={0} clearcoat={0.18} />
        </RoundedBox>
        <PalmDetails color={skinLight} />
        <Finger base={[-0.36, 0.48, 0.02]} spread={0.1} scale={0.92} bend={p.fingers[0]} splay={-0.08} />
        <Finger base={[-0.12, 0.56, 0.02]} spread={0.025} scale={1.08} bend={p.fingers[1]} splay={-0.02} />
        <Finger base={[0.12, 0.54, 0.02]} spread={-0.025} scale={1.0} bend={p.fingers[2]} splay={0.02} />
        <Finger base={[0.34, 0.47, 0.02]} spread={-0.1} scale={0.84} bend={p.fingers[3]} splay={0.08} />
        <Thumb pose={p.thumb} />
        <mesh position={[0, -0.48, 0.24]} scale={[0.82, 0.15, 0.08]}>
          <sphereGeometry args={[0.45, 32, 12]} />
          <meshStandardMaterial color={info.color} emissive={info.color} emissiveIntensity={0.22} transparent opacity={0.28} />
        </mesh>
      </group>
      <MeaningIcon gesture={gesture} />
    </Float>
  );
}

function Scene({ gesture }) {
  return (
    <Canvas shadows camera={{ position: [0, 0.7, 5.4], fov: 42 }} dpr={[1, 2]}>
      <color attach="background" args={['#050916']} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-3, 2, 4]} intensity={1.3} color="#86c5ff" />
      <pointLight position={[3, -1, 2]} intensity={0.8} color="#ffd2a6" />
      <Environment preset="city" />
      <HandModel gesture={gesture} />
      <mesh position={[0, -1.35, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.0, 96]} />
        <meshStandardMaterial color="#09111f" roughness={0.92} />
      </mesh>
      <ContactShadows position={[0, -1.32, 0]} opacity={0.55} scale={5} blur={2.2} far={3} />
      <OrbitControls enablePan={false} minDistance={3.2} maxDistance={8} />
    </Canvas>
  );
}

export default function RealisticHand3D({ gesture }) {
  return <Scene gesture={gesture} />;
}
