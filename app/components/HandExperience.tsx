"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { Camera, Loader2, Sparkles, Video, VideoOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import HandModel from "./HandModel";
import { GESTURE_LIST, GESTURES, recognizeGesture, type GestureId } from "../lib/gestures";

export default function HandExperience() {
  const [gesture, setGesture] = useState<GestureId>("open");
  const [detected, setDetected] = useState<GestureId | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Camera is off. Use manual buttons or start the camera.");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastGestureRef = useRef<GestureId>("open");
  const stableRef = useRef({ value: null as GestureId | null, count: 0 });

  async function createLandmarker() {
    if (landmarkerRef.current) return landmarkerRef.current;
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    const handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numHands: 1,
      minHandDetectionConfidence: 0.55,
      minHandPresenceConfidence: 0.55,
      minTrackingConfidence: 0.55,
    });
    landmarkerRef.current = handLandmarker;
    return handLandmarker;
  }

  async function startCamera() {
    try {
      setLoading(true);
      setMessage("Loading hand detector...");
      const handLandmarker = await createLandmarker();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 960 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
      setMessage("Camera active. Show a clear hand sign inside the frame.");

      const loop = () => {
        const video = videoRef.current;
        if (video && video.readyState >= 2 && handLandmarker) {
          const results = handLandmarker.detectForVideo(video, performance.now());
          const landmarks = results.landmarks?.[0];
          const found = landmarks ? recognizeGesture(landmarks) : null;

          if (found) {
            if (stableRef.current.value === found) stableRef.current.count += 1;
            else stableRef.current = { value: found, count: 1 };

            if (stableRef.current.count >= 4 && found !== lastGestureRef.current) {
              lastGestureRef.current = found;
              setDetected(found);
              setGesture(found);
              setMessage(`Detected ${GESTURES[found].name}. ${GESTURES[found].meaning}.`);
            }
          }
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      loop();
    } catch (err) {
      console.error(err);
      setMessage("Camera failed. Allow camera permission and run on localhost or HTTPS.");
    } finally {
      setLoading(false);
    }
  }

  function stopCamera() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
    setDetected(null);
    setMessage("Camera stopped. Manual mode is available below.");
  }

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const active = GESTURES[gesture];
  const ActiveIcon = active.icon;

  return (
    <section className="experience" id="demo">
      <div className="section-title">
        <span><Sparkles size={18} /> Live Demo</span>
        <h2>Camera detects your hand sign and displays a procedural 3D hand with meaning.</h2>
      </div>

      <div className="demo-grid">
        <div className="camera-card panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow"><Camera size={16} /> Camera Input</p>
              <h3>Hand Detection</h3>
            </div>
            <button className={cameraOn ? "btn danger" : "btn primary"} onClick={cameraOn ? stopCamera : startCamera} disabled={loading}>
              {loading ? <Loader2 className="spin" size={18} /> : cameraOn ? <VideoOff size={18} /> : <Video size={18} />}
              {loading ? "Loading" : cameraOn ? "Stop Camera" : "Start Camera"}
            </button>
          </div>

          <div className="video-wrap">
            <video ref={videoRef} playsInline muted className={cameraOn ? "video active" : "video"} />
            {!cameraOn && (
              <div className="video-placeholder">
                <Camera size={42} />
                <strong>Camera Preview</strong>
                <span>Allow camera permission to enable AR-style detection.</span>
              </div>
            )}
            <div className="scan-line" />
          </div>

          <div className="status-box">
            <span className={cameraOn ? "dot live" : "dot"} />
            <p>{message}</p>
          </div>
        </div>

        <div className="model-card panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow"><ActiveIcon size={16} /> 3D Output</p>
              <h3>{active.name}</h3>
            </div>
            <div className="gesture-badge">{active.emoji} {detected ? "Detected" : "Manual"}</div>
          </div>

          <div className="canvas-wrap">
            <Canvas shadows camera={{ position: [0, 1.25, 5.2], fov: 42 }}>
              <color attach="background" args={["#07111f"]} />
              <ambientLight intensity={0.65} />
              <directionalLight position={[3, 5, 4]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} />
              <pointLight position={[-3, 1.8, 2]} intensity={1.4} color="#67e8f9" />
              <Environment preset="city" />
              <HandModel gesture={gesture} />
              <ContactShadows position={[0, -1.55, 0]} opacity={0.45} scale={5} blur={2.5} />
              <OrbitControls enablePan={false} minDistance={3.6} maxDistance={7} />
            </Canvas>
          </div>

          <div className="meaning-card">
            <div className="meaning-icon"><ActiveIcon size={22} /></div>
            <div>
              <strong>{active.meaning}</strong>
              <p>{active.instruction}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="manual panel">
        <div className="panel-head simple">
          <div>
            <p className="eyebrow">Manual Gesture Guide</p>
            <h3>Tap a gesture to preview the 3D pose</h3>
          </div>
        </div>
        <div className="gesture-grid">
          {GESTURE_LIST.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === gesture;
            return (
              <button key={item.id} className={isActive ? "gesture-btn active" : "gesture-btn"} onClick={() => { setGesture(item.id); setDetected(null); setMessage(`Manual preview: ${item.name}. ${item.meaning}.`); }}>
                <span className="gesture-emoji">{item.emoji}</span>
                <span className="gesture-info">
                  <strong><Icon size={15} /> {item.label}</strong>
                  <small>{item.meaning}</small>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
