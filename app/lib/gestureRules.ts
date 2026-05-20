import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export type GestureKey =
  | "none"
  | "open"
  | "fist"
  | "peace"
  | "thumbsUp"
  | "point"
  | "love"
  | "rock"
  | "call"
  | "ok"
  | "three";

export type GestureInfo = {
  key: GestureKey;
  label: string;
  icon: string;
  meaning: string;
  instruction: string;
  confidence: number;
};

export const GESTURE_DETAILS: Record<GestureKey, Omit<GestureInfo, "key" | "confidence">> = {
  none: {
    label: "No sign detected",
    icon: "ScanLine",
    meaning: "Place your hand clearly inside the camera frame.",
    instruction: "Use bright light and keep one hand visible.",
  },
  open: {
    label: "Open Palm",
    icon: "Hand",
    meaning: "Stop, pause, or attention.",
    instruction: "Show all fingers open and facing the camera.",
  },
  fist: {
    label: "Fist",
    icon: "Shield",
    meaning: "Power, strength, or ready state.",
    instruction: "Close all fingers into your palm.",
  },
  peace: {
    label: "Peace Sign",
    icon: "BadgeCheck",
    meaning: "Peace, calm, victory, or agreement.",
    instruction: "Raise index and middle finger only.",
  },
  thumbsUp: {
    label: "Thumbs Up",
    icon: "ThumbsUp",
    meaning: "Approved, correct, or good job.",
    instruction: "Fold the fingers and point your thumb upward.",
  },
  point: {
    label: "Pointing Up",
    icon: "MousePointer2",
    meaning: "Select, direction, or information.",
    instruction: "Raise the index finger only.",
  },
  love: {
    label: "I Love You",
    icon: "HeartHandshake",
    meaning: "Love, support, or care.",
    instruction: "Raise thumb, index, and pinky fingers.",
  },
  rock: {
    label: "Rock Sign",
    icon: "Zap",
    meaning: "Energy, confidence, or excitement.",
    instruction: "Raise index and pinky fingers only.",
  },
  call: {
    label: "Call Me",
    icon: "PhoneCall",
    meaning: "Contact, communication, or call request.",
    instruction: "Raise thumb and pinky only.",
  },
  ok: {
    label: "OK Sign",
    icon: "CircleCheck",
    meaning: "Confirmed, correct, or success.",
    instruction: "Touch thumb and index finger, then raise the other fingers.",
  },
  three: {
    label: "Number Three",
    icon: "ListChecks",
    meaning: "Three, count, or option number three.",
    instruction: "Raise index, middle, and ring fingers.",
  },
};

const INDEX_TIP = 8;
const INDEX_PIP = 6;
const INDEX_MCP = 5;
const MIDDLE_TIP = 12;
const MIDDLE_PIP = 10;
const RING_TIP = 16;
const RING_PIP = 14;
const PINKY_TIP = 20;
const PINKY_PIP = 18;
const THUMB_TIP = 4;
const THUMB_IP = 3;
const THUMB_MCP = 2;
const WRIST = 0;

function distance(a: NormalizedLandmark, b: NormalizedLandmark) {
  return Math.hypot(a.x - b.x, a.y - b.y, (a.z ?? 0) - (b.z ?? 0));
}

function fingerUp(points: NormalizedLandmark[], tip: number, pip: number) {
  return points[tip].y < points[pip].y - 0.025;
}

function thumbExtended(points: NormalizedLandmark[], handedness: string) {
  const thumbTip = points[THUMB_TIP];
  const thumbIp = points[THUMB_IP];
  const thumbMcp = points[THUMB_MCP];

  const horizontalExtension =
    handedness === "Left"
      ? thumbTip.x > thumbIp.x + 0.03
      : thumbTip.x < thumbIp.x - 0.03;

  const distanceFromPalm = distance(thumbTip, thumbMcp);
  return horizontalExtension && distanceFromPalm > 0.075;
}

function thumbUp(points: NormalizedLandmark[]) {
  return points[THUMB_TIP].y < points[THUMB_IP].y - 0.035 && points[THUMB_TIP].y < points[WRIST].y;
}

function okCircle(points: NormalizedLandmark[]) {
  const pinch = distance(points[THUMB_TIP], points[INDEX_TIP]);
  const palmScale = distance(points[WRIST], points[INDEX_MCP]);
  return pinch < palmScale * 0.42;
}

function scoreGesture(key: GestureKey, confidence: number): GestureInfo {
  return {
    key,
    confidence,
    ...GESTURE_DETAILS[key],
  };
}

export function recognizeGesture(
  points?: NormalizedLandmark[],
  handedness = "Right"
): GestureInfo {
  if (!points || points.length < 21) return scoreGesture("none", 0);

  const index = fingerUp(points, INDEX_TIP, INDEX_PIP);
  const middle = fingerUp(points, MIDDLE_TIP, MIDDLE_PIP);
  const ring = fingerUp(points, RING_TIP, RING_PIP);
  const pinky = fingerUp(points, PINKY_TIP, PINKY_PIP);
  const thumb = thumbExtended(points, handedness);
  const thumbVertical = thumbUp(points);
  const ok = okCircle(points);

  const upCount = [index, middle, ring, pinky].filter(Boolean).length;

  if (ok && middle && ring && pinky) return scoreGesture("ok", 0.94);
  if (thumbVertical && upCount === 0) return scoreGesture("thumbsUp", 0.94);
  if (thumb && !index && !middle && !ring && pinky) return scoreGesture("call", 0.92);
  if (thumb && index && !middle && !ring && pinky) return scoreGesture("love", 0.91);
  if (!thumb && index && !middle && !ring && pinky) return scoreGesture("rock", 0.89);
  if (index && middle && ring && !pinky) return scoreGesture("three", 0.9);
  if (index && middle && !ring && !pinky) return scoreGesture("peace", 0.92);
  if (index && !middle && !ring && !pinky) return scoreGesture("point", 0.9);
  if (index && middle && ring && pinky) return scoreGesture("open", 0.93);
  if (!index && !middle && !ring && !pinky && !thumb) return scoreGesture("fist", 0.88);

  return scoreGesture("none", 0.35);
}
