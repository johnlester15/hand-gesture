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
  | "three"
  | "four"
  | "lshape";

export type FingerPose = {
  thumb: number;
  index: number;
  middle: number;
  ring: number;
  pinky: number;
};

export type GestureItem = {
  id: GestureId;
  name: string;
  emoji: string;
  meaning: string;
  instruction: string;
};

export const GESTURE_LIST: GestureItem[] = [
  {
    id: "open",
    name: "Open Palm",
    emoji: "✋",
    meaning: "Stop, pause, or open hand signal",
    instruction: "Show all fingers open and straight",
  },
  {
    id: "fist",
    name: "Fist",
    emoji: "✊",
    meaning: "Strength, power, or hold",
    instruction: "Close all fingers into your palm",
  },
  {
    id: "peace",
    name: "Peace Sign",
    emoji: "✌️",
    meaning: "Peace, calm, or victory",
    instruction: "Raise index and middle finger only",
  },
  {
    id: "thumbsUp",
    name: "Thumbs Up",
    emoji: "👍",
    meaning: "Good, approved, or correct",
    instruction: "Raise your thumb while other fingers are closed",
  },
  {
    id: "point",
    name: "Pointing",
    emoji: "☝️",
    meaning: "Select, direction, or attention",
    instruction: "Raise index finger only",
  },
  {
    id: "ily",
    name: "I Love You",
    emoji: "🤟",
    meaning: "Love, support, or care",
    instruction: "Raise thumb, index, and pinky",
  },
  {
    id: "rock",
    name: "Rock Sign",
    emoji: "🤘",
    meaning: "Energy, rock, or excitement",
    instruction: "Raise index and pinky only",
  },
  {
    id: "call",
    name: "Call Me",
    emoji: "🤙",
    meaning: "Call, contact, or communication",
    instruction: "Raise thumb and pinky only",
  },
  {
    id: "ok",
    name: "OK Sign",
    emoji: "👌",
    meaning: "Okay, confirm, or success",
    instruction: "Touch thumb and index, keep other fingers open",
  },
  {
    id: "three",
    name: "Number Three",
    emoji: "🖖",
    meaning: "Number three or count signal",
    instruction: "Raise three fingers",
  },
  {
    id: "four",
    name: "Number Four",
    emoji: "🖐️",
    meaning: "Number four or open count",
    instruction: "Raise four fingers",
  },
  {
    id: "lshape",
    name: "L Shape",
    emoji: "👆",
    meaning: "Angle, label, or left marker",
    instruction: "Raise thumb and index like an L shape",
  },
];

export const fingerMap: Record<GestureId, FingerPose> = {
  open: {
    thumb: 0,
    index: 0,
    middle: 0,
    ring: 0,
    pinky: 0,
  },
  fist: {
    thumb: 1,
    index: 1,
    middle: 1,
    ring: 1,
    pinky: 1,
  },
  peace: {
    thumb: 0.55,
    index: 0,
    middle: 0,
    ring: 1,
    pinky: 1,
  },
  thumbsUp: {
    thumb: -0.9,
    index: 1,
    middle: 1,
    ring: 1,
    pinky: 1,
  },
  point: {
    thumb: 0.8,
    index: 0,
    middle: 1,
    ring: 1,
    pinky: 1,
  },
  ily: {
    thumb: -0.65,
    index: 0,
    middle: 1,
    ring: 1,
    pinky: 0,
  },
  rock: {
    thumb: 0.7,
    index: 0,
    middle: 1,
    ring: 1,
    pinky: 0,
  },
  call: {
    thumb: -0.8,
    index: 1,
    middle: 1,
    ring: 1,
    pinky: 0,
  },
  ok: {
    thumb: 0.45,
    index: 0.55,
    middle: 0,
    ring: 0,
    pinky: 0,
  },
  three: {
    thumb: 1,
    index: 0,
    middle: 0,
    ring: 0,
    pinky: 1,
  },
  four: {
    thumb: 1,
    index: 0,
    middle: 0,
    ring: 0,
    pinky: 0,
  },
  lshape: {
    thumb: -0.65,
    index: 0,
    middle: 1,
    ring: 1,
    pinky: 1,
  },
};

type Landmark = {
  x: number;
  y: number;
  z?: number;
};

function isFingerUp(landmarks: Landmark[], tip: number, pip: number) {
  return landmarks[tip].y < landmarks[pip].y;
}

function isThumbOpen(landmarks: Landmark[]) {
  return Math.abs(landmarks[4].x - landmarks[2].x) > 0.08;
}

export function recognizeGesture(landmarks?: Landmark[]): GestureId {
  if (!landmarks || landmarks.length < 21) {
    return "open";
  }

  const thumb = isThumbOpen(landmarks);
  const index = isFingerUp(landmarks, 8, 6);
  const middle = isFingerUp(landmarks, 12, 10);
  const ring = isFingerUp(landmarks, 16, 14);
  const pinky = isFingerUp(landmarks, 20, 18);

  const openCount = [index, middle, ring, pinky].filter(Boolean).length;

  if (index && middle && ring && pinky && thumb) return "open";
  if (!index && !middle && !ring && !pinky && !thumb) return "fist";
  if (index && middle && !ring && !pinky) return "peace";
  if (thumb && !index && !middle && !ring && !pinky) return "thumbsUp";
  if (index && !middle && !ring && !pinky && !thumb) return "point";
  if (thumb && index && !middle && !ring && pinky) return "ily";
  if (!thumb && index && !middle && !ring && pinky) return "rock";
  if (thumb && !index && !middle && !ring && pinky) return "call";
  if (thumb && index && middle && ring && pinky) return "ok";
  if (openCount === 3) return "three";
  if (openCount === 4 && !thumb) return "four";

  return "open";
}