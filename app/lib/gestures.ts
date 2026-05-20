import { Check, CircleDot, Hand, Heart, Info, MousePointer2, Phone, Shield, Sparkles, Waves } from "lucide-react";

export type GestureId =
  | "open"
  | "fist"
  | "peace"
  | "thumbsUp"
  | "point"
  | "ily"
  | "rock"
  | "call"
  | "ok"
  | "three";

export const GESTURES: Record<GestureId, {
  id: GestureId;
  name: string;
  label: string;
  emoji: string;
  meaning: string;
  instruction: string;
  icon: any;
}> = {
  open: {
    id: "open",
    name: "Open Palm",
    label: "Open Palm",
    emoji: "✋",
    meaning: "Stop, pause, or attention",
    instruction: "Show all fingers open and visible to the camera.",
    icon: Hand,
  },
  fist: {
    id: "fist",
    name: "Fist",
    label: "Fist",
    emoji: "✊",
    meaning: "Strength, power, or hold",
    instruction: "Close all fingers into the palm.",
    icon: Shield,
  },
  peace: {
    id: "peace",
    name: "Peace Sign",
    label: "Peace",
    emoji: "✌️",
    meaning: "Peace, calm, or victory",
    instruction: "Open index and middle finger only.",
    icon: Waves,
  },
  thumbsUp: {
    id: "thumbsUp",
    name: "Thumbs Up",
    label: "Thumbs Up",
    emoji: "👍",
    meaning: "Approved, good, or correct",
    instruction: "Raise the thumb and fold the other fingers.",
    icon: Check,
  },
  point: {
    id: "point",
    name: "Pointing Up",
    label: "Point",
    emoji: "☝️",
    meaning: "Select, direction, or information",
    instruction: "Raise the index finger only.",
    icon: MousePointer2,
  },
  ily: {
    id: "ily",
    name: "I Love You",
    label: "I Love You",
    emoji: "🤟",
    meaning: "Love, support, or care",
    instruction: "Open thumb, index, and pinky fingers.",
    icon: Heart,
  },
  rock: {
    id: "rock",
    name: "Rock Sign",
    label: "Rock",
    emoji: "🤘",
    meaning: "Energy, fun, or celebration",
    instruction: "Open index and pinky fingers.",
    icon: Sparkles,
  },
  call: {
    id: "call",
    name: "Call Me",
    label: "Call Me",
    emoji: "🤙",
    meaning: "Call, contact, or communication",
    instruction: "Open thumb and pinky fingers.",
    icon: Phone,
  },
  ok: {
    id: "ok",
    name: "OK Sign",
    label: "OK",
    emoji: "👌",
    meaning: "Confirm, okay, or success",
    instruction: "Touch thumb and index, keep other fingers up.",
    icon: CircleDot,
  },
  three: {
    id: "three",
    name: "Number Three",
    label: "Three",
    emoji: "🤟",
    meaning: "Number three or count signal",
    instruction: "Open index, middle, and ring fingers.",
    icon: Info,
  },
};

export const GESTURE_LIST = Object.values(GESTURES);

export const fingerMap: Record<GestureId, {
  thumb: number;
  index: number;
  middle: number;
  ring: number;
  pinky: number;
  thumbUp?: boolean;
  okPose?: boolean;
}> = {
  open: { thumb: 0, index: 0, middle: 0, ring: 0, pinky: 0 },
  fist: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 },
  peace: { thumb: .45, index: 0, middle: 0, ring: 1, pinky: 1 },
  thumbsUp: { thumb: 0, index: 1, middle: 1, ring: 1, pinky: 1, thumbUp: true },
  point: { thumb: .8, index: 0, middle: 1, ring: 1, pinky: 1 },
  ily: { thumb: 0, index: 0, middle: 1, ring: 1, pinky: 0 },
  rock: { thumb: .7, index: 0, middle: 1, ring: 1, pinky: 0 },
  call: { thumb: 0, index: 1, middle: 1, ring: 1, pinky: 0 },
  ok: { thumb: .45, index: .55, middle: 0, ring: 0, pinky: 0, okPose: true },
  three: { thumb: 1, index: 0, middle: 0, ring: 0, pinky: 1 },
};

export function recognizeGesture(landmarks: any[]): GestureId | null {
  if (!landmarks || landmarks.length < 21) return null;

  const fingerUp = (tip: number, pip: number) => landmarks[tip].y < landmarks[pip].y - 0.035;
  const index = fingerUp(8, 6);
  const middle = fingerUp(12, 10);
  const ring = fingerUp(16, 14);
  const pinky = fingerUp(20, 18);

  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const wrist = landmarks[0];
  const thumbUp = thumbTip.y < landmarks[2].y - 0.06 && Math.abs(thumbTip.x - wrist.x) < 0.26;
  const thumbSideOpen = Math.abs(thumbTip.x - thumbIp.x) > 0.055 || thumbUp;

  const indexThumbDistance = Math.hypot(landmarks[8].x - landmarks[4].x, landmarks[8].y - landmarks[4].y);
  if (indexThumbDistance < 0.065 && middle && ring && pinky) return "ok";

  const openCount = [index, middle, ring, pinky].filter(Boolean).length;

  if (thumbUp && openCount === 0) return "thumbsUp";
  if (index && middle && !ring && !pinky) return "peace";
  if (index && !middle && !ring && !pinky) return "point";
  if (!index && !middle && !ring && !pinky) return "fist";
  if (index && middle && ring && pinky) return "open";
  if (thumbSideOpen && index && !middle && !ring && pinky) return "ily";
  if (!middle && !ring && index && pinky) return "rock";
  if (thumbSideOpen && !index && !middle && !ring && pinky) return "call";
  if (index && middle && ring && !pinky) return "three";

  return null;
}
