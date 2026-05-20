'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import * as Icons from 'lucide-react';
import { GESTURES, gestureOrder } from './lib/gestures';
import CameraDetector from './components/CameraDetector';

const RealisticHand3D = dynamic(() => import('./components/RealisticHand3D'), {
  ssr: false,
  loading: () => <div className="scene-loader">Loading 3D hand...</div>,
});

export default function Home() {
  const [gesture, setGesture] = useState('open');
  const current = GESTURES[gesture] || GESTURES.open;
  const Icon = Icons[current.icon] || Icons.Hand;

  const stats = useMemo(() => [
    ['12', 'coded gestures'],
    ['0', 'downloaded 3D models'],
    ['100%', 'responsive layout'],
  ], []);

  return (
    <main className="app-shell">
      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow"><Icons.Sparkles size={16} /> Procedural 3D Hand Gesture AR</div>
          <h1>Realistic coded 3D hand with camera gesture detection.</h1>
          <p>
            A Next.js project that creates the hand model from code only. It uses rounded palms,
            capsule fingers, knuckles, nails, soft lighting, shadows, and gesture meanings.
          </p>
          <div className="hero-actions">
            <a href="#demo" className="primary-btn">Open Demo</a>
            <a href="#manual" className="secondary-btn">Manual Gestures</a>
          </div>
        </div>
        <div className="hero-panel">
          {stats.map(([value, label]) => (
            <div className="stat-card" key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="demo" className="demo-grid">
        <div className="glass-card output-card">
          <div className="section-title-row">
            <div className="section-icon"><Icons.Layers3 size={20} /></div>
            <div>
              <h2>3D Output</h2>
              <p>Enhanced procedural hand made only from Three.js geometry.</p>
            </div>
          </div>
          <div className="scene-box">
            <RealisticHand3D gesture={gesture} />
            <div className="scene-caption">
              <span>Drag to rotate</span>
              <span>Scroll to zoom</span>
            </div>
          </div>
        </div>

        <div className="side-stack">
          <div className="glass-card meaning-card">
            <div className="meaning-top">
              <div className="emoji-badge" style={{ borderColor: current.color, boxShadow: `0 0 30px ${current.color}55` }}>{current.emoji}</div>
              <div>
                <h2>{current.name}</h2>
                <p>{current.meaning}</p>
              </div>
            </div>
            <div className="instruction-box">
              <Icon size={20} />
              <span>{current.instruction}</span>
            </div>
          </div>
          <CameraDetector onGesture={setGesture} />
        </div>
      </section>

      <section id="manual" className="glass-card manual-section">
        <div className="section-title-row spaced">
          <div className="title-with-icon">
            <div className="section-icon"><Icons.HandMetal size={20} /></div>
            <div>
              <h2>Manual Gesture Guide</h2>
              <p>Tap any card to preview the 3D pose and its meaning.</p>
            </div>
          </div>
          <div className="mini-note">Emoji guide included</div>
        </div>

        <div className="gesture-grid">
          {gestureOrder.map((key) => {
            const item = GESTURES[key];
            const CardIcon = Icons[item.icon] || Icons.Hand;
            const active = gesture === key;
            return (
              <button
                key={key}
                className={`gesture-card ${active ? 'active' : ''}`}
                onClick={() => setGesture(key)}
                style={active ? { borderColor: item.color, boxShadow: `0 18px 45px ${item.color}24` } : undefined}
              >
                <div className="gesture-emoji">{item.emoji}</div>
                <div className="gesture-text">
                  <strong>{item.name}</strong>
                  <span>{item.meaning}</span>
                </div>
                <CardIcon size={18} />
              </button>
            );
          })}
        </div>
      </section>

      <section className="features-grid">
        {[
          ['Rounded geometry', 'Palm, wrist, and fingers are built using rounded boxes, capsules, and spheres.'],
          ['Real hand details', 'Includes knuckles, palm lines, fingernails, fingertips, and wrist shape.'],
          ['Smooth motion', 'Finger joints smoothly transition to the selected gesture pose.'],
          ['Mobile first', 'The layout adapts cleanly to phone, tablet, and desktop screens.'],
        ].map(([title, text]) => (
          <article className="feature-card" key={title}>
            <Icons.CheckCircle2 size={20} />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
