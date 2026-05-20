'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, ScanLine, VideoOff } from 'lucide-react';
import { classifyGesture } from '../lib/gestures';

export default function CameraDetector({ onGesture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const rafRef = useRef(null);
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState('Camera is off');
  const [confidence, setConfidence] = useState(0);
  const lastGesture = useRef('open');
  const stableCount = useRef(0);

  async function startCamera() {
    try {
      setStatus('Loading hand detector...');
      const vision = await import('@mediapipe/tasks-vision');
      const { FilesetResolver, HandLandmarker } = vision;
      const fileset = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm'
      );

      detectorRef.current = await HandLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 1,
        minHandDetectionConfidence: 0.55,
        minHandPresenceConfidence: 0.55,
        minTrackingConfidence: 0.55,
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 720 } },
        audio: false,
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setEnabled(true);
      setStatus('Camera active');
      loop();
    } catch (error) {
      console.error(error);
      setStatus('Camera or detector failed. Use localhost or HTTPS.');
    }
  }

  function stopCamera() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const stream = videoRef.current?.srcObject;
    stream?.getTracks?.().forEach((track) => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setEnabled(false);
    setStatus('Camera is off');
    setConfidence(0);
  }

  function loop() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const detector = detectorRef.current;

    if (video && canvas && detector && video.readyState >= 2) {
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      const result = detector.detectForVideo(video, performance.now());
      const hand = result.landmarks?.[0];

      if (hand) {
        drawLandmarks(ctx, hand, canvas.width, canvas.height);
        const gesture = classifyGesture(hand);
        if (gesture === lastGesture.current) {
          stableCount.current += 1;
        } else {
          lastGesture.current = gesture;
          stableCount.current = 0;
        }

        const score = Math.min(100, 50 + stableCount.current * 8);
        setConfidence(score);
        setStatus(score > 75 ? 'Gesture locked' : 'Detecting hand gesture');
        if (score > 70) onGesture(gesture);
      } else {
        setStatus('Show your hand to the camera');
        setConfidence(0);
      }
    }
    rafRef.current = requestAnimationFrame(loop);
  }

  useEffect(() => () => stopCamera(), []);

  return (
    <section className="glass-card camera-card">
      <div className="section-title-row">
        <div className="section-icon"><Camera size={20} /></div>
        <div>
          <h2>Camera Detector</h2>
          <p>Detect a real hand sign and update the 3D model.</p>
        </div>
      </div>

      <div className="camera-frame">
        <video ref={videoRef} playsInline muted className="hidden-video" />
        <canvas ref={canvasRef} className="camera-canvas" />
        {!enabled && (
          <div className="camera-placeholder">
            <VideoOff size={38} />
            <span>Camera preview appears here</span>
          </div>
        )}
      </div>

      <div className="camera-controls">
        {!enabled ? (
          <button className="primary-btn" onClick={startCamera}>Start Camera</button>
        ) : (
          <button className="secondary-btn" onClick={stopCamera}>Stop Camera</button>
        )}
        <div className="status-pill"><ScanLine size={15} /> {status}</div>
      </div>

      <div className="confidence-wrap">
        <div className="confidence-label"><span>Detection confidence</span><strong>{confidence}%</strong></div>
        <div className="bar"><span style={{ width: `${confidence}%` }} /></div>
      </div>
    </section>
  );
}

function drawLandmarks(ctx, landmarks, width, height) {
  const lines = [
    [0,1,2,3,4], [0,5,6,7,8], [0,9,10,11,12], [0,13,14,15,16], [0,17,18,19,20], [5,9,13,17]
  ];
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#7dd3fc';
  ctx.fillStyle = '#facc15';
  lines.forEach((line) => {
    ctx.beginPath();
    line.forEach((i, idx) => {
      const p = landmarks[i];
      const x = width - p.x * width;
      const y = p.y * height;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  });
  landmarks.forEach((p) => {
    const x = width - p.x * width;
    const y = p.y * height;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}
