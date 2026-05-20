"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  FilesetResolver,
  HandLandmarker,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";
import { Camera, Loader2, VideoOff } from "lucide-react";
import { recognizeGesture, type GestureInfo, type GestureKey } from "../lib/gestureRules";

type DetectorProps = {
  onGestureChange: (gesture: GestureKey, info: GestureInfo) => void;
};

const CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

function drawHand(ctx: CanvasRenderingContext2D, points: NormalizedLandmark[], width: number, height: number) {
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(34, 211, 238, 0.95)";
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.shadowBlur = 12;
  ctx.shadowColor = "rgba(34, 211, 238, 0.8)";

  for (const [start, end] of CONNECTIONS) {
    const a = points[start];
    const b = points[end];
    ctx.beginPath();
    ctx.moveTo(a.x * width, a.y * height);
    ctx.lineTo(b.x * width, b.y * height);
    ctx.stroke();
  }

  for (const point of points) {
    ctx.beginPath();
    ctx.arc(point.x * width, point.y * height, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export default function CameraGestureDetector({ onGestureChange }: DetectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastGestureRef = useRef<GestureKey>("none");
  const stableCountRef = useRef(0);

  const [status, setStatus] = useState("Camera is off");
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");

  const loadModel = useCallback(async () => {
    if (landmarkerRef.current) return landmarkerRef.current;

    setStatus("Loading AI hand detector...");
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm"
    );

    const landmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numHands: 1,
      minHandDetectionConfidence: 0.62,
      minHandPresenceConfidence: 0.62,
      minTrackingConfidence: 0.62,
    });

    landmarkerRef.current = landmarker;
    return landmarker;
  }, []);

  const predictLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = landmarkerRef.current;

    if (!video || !canvas || !landmarker || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(predictLoop);
      return;
    }

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;

    const result = landmarker.detectForVideo(video, performance.now());
    const ctx = canvas.getContext("2d");

    if (result.landmarks?.[0]) {
      const handedness = result.handednesses?.[0]?.[0]?.categoryName ?? "Right";
      const info = recognizeGesture(result.landmarks[0], handedness);

      if (ctx) drawHand(ctx, result.landmarks[0], width, height);

      if (info.key === lastGestureRef.current) {
        stableCountRef.current += 1;
      } else {
        stableCountRef.current = 0;
        lastGestureRef.current = info.key;
      }

      if (stableCountRef.current >= 4) {
        onGestureChange(info.key, info);
        setStatus(`${info.label} detected`);
      }
    } else {
      if (ctx) ctx.clearRect(0, 0, width, height);
      stableCountRef.current = 0;
      lastGestureRef.current = "none";
      onGestureChange("none", recognizeGesture());
      setStatus("Show your hand to the camera");
    }

    rafRef.current = requestAnimationFrame(predictLoop);
  }, [onGestureChange]);

  async function startCamera() {
    try {
      setIsLoading(true);
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 960 }, height: { ideal: 720 } },
        audio: false,
      });

      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      await loadModel();
      setIsRunning(true);
      setStatus("Show a hand sign");
      rafRef.current = requestAnimationFrame(predictLoop);
    } catch (err) {
      console.error(err);
      setError("Camera/model failed. Allow camera permission and make sure you are on localhost or HTTPS with internet.");
      setStatus("Unable to start camera");
    } finally {
      setIsLoading(false);
    }
  }

  function stopCamera() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((track) => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

    setIsRunning(false);
    setStatus("Camera is off");
    onGestureChange("none", recognizeGesture());
  }

  useEffect(() => {
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="glass overflow-hidden rounded-[2rem] p-4 shadow-2xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Live Camera</p>
          <h2 className="text-xl font-bold text-white">Hand Sign Detector</h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isRunning ? "bg-emerald-400/15 text-emerald-300" : "bg-slate-500/15 text-slate-300"}`}>
          {isRunning ? "Running" : "Offline"}
        </span>
      </div>

      <div className="relative aspect-video overflow-hidden rounded-3xl bg-slate-950">
        <video ref={videoRef} className="camera-mirror h-full w-full object-cover" playsInline muted />
        <canvas ref={canvasRef} className="camera-mirror pointer-events-none absolute inset-0 h-full w-full" />
        {!isRunning && (
          <div className="absolute inset-0 grid place-items-center bg-slate-950/80 text-center">
            <div>
              <VideoOff className="mx-auto mb-3 h-10 w-10 text-cyan-300" />
              <p className="font-semibold text-white">Camera preview will appear here</p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-400">
                Click start and allow camera permission to detect gestures.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-300">Status: <span className="font-semibold text-cyan-200">{status}</span></p>
        {!isRunning ? (
          <button
            onClick={startCamera}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
            {isLoading ? "Starting..." : "Start Camera"}
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="rounded-2xl border border-white/15 px-5 py-3 font-bold text-white transition hover:bg-white/10"
          >
            Stop Camera
          </button>
        )}
      </div>

      {error && <p className="mt-3 rounded-2xl bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
    </div>
  );
}
