export const GESTURES = {
  open: {
    name: 'Open Palm',
    emoji: '✋',
    icon: 'Hand',
    meaning: 'Stop, pause, or attention',
    instruction: 'Raise all fingers and keep the palm open.',
    color: '#38bdf8',
  },
  fist: {
    name: 'Fist',
    emoji: '✊',
    icon: 'Shield',
    meaning: 'Strength, power, or hold',
    instruction: 'Curl all fingers into the palm.',
    color: '#fb7185',
  },
  peace: {
    name: 'Peace Sign',
    emoji: '✌️',
    icon: 'BadgeCheck',
    meaning: 'Peace, calm, or victory',
    instruction: 'Raise index and middle fingers only.',
    color: '#a78bfa',
  },
  thumbsUp: {
    name: 'Thumbs Up',
    emoji: '👍',
    icon: 'ThumbsUp',
    meaning: 'Approved, good job, or success',
    instruction: 'Raise the thumb while other fingers are closed.',
    color: '#22c55e',
  },
  point: {
    name: 'Pointing Up',
    emoji: '☝️',
    icon: 'MousePointer2',
    meaning: 'Select, direction, or important idea',
    instruction: 'Raise the index finger only.',
    color: '#facc15',
  },
  ok: {
    name: 'OK Sign',
    emoji: '👌',
    icon: 'CircleCheck',
    meaning: 'Confirm, correct, or ready',
    instruction: 'Touch thumb and index finger together.',
    color: '#2dd4bf',
  },
  call: {
    name: 'Call Me',
    emoji: '🤙',
    icon: 'Phone',
    meaning: 'Call, contact, or communicate',
    instruction: 'Open thumb and pinky, close the middle fingers.',
    color: '#60a5fa',
  },
  ilove: {
    name: 'I Love You',
    emoji: '🤟',
    icon: 'Heart',
    meaning: 'Love, support, or care',
    instruction: 'Raise thumb, index, and pinky fingers.',
    color: '#f472b6',
  },
  rock: {
    name: 'Rock Sign',
    emoji: '🤘',
    icon: 'Zap',
    meaning: 'Energy, confidence, or excitement',
    instruction: 'Raise index and pinky fingers.',
    color: '#fb923c',
  },
  three: {
    name: 'Number Three',
    emoji: '🖖',
    icon: 'Hash',
    meaning: 'Number three or count marker',
    instruction: 'Raise index, middle, and ring fingers.',
    color: '#818cf8',
  },
  four: {
    name: 'Number Four',
    emoji: '🖐️',
    icon: 'ListChecks',
    meaning: 'Number four or multiple options',
    instruction: 'Raise four fingers and keep the thumb relaxed.',
    color: '#34d399',
  },
  lshape: {
    name: 'L Shape',
    emoji: '🫳',
    icon: 'CornerUpLeft',
    meaning: 'Left, label, or direction cue',
    instruction: 'Raise index finger and extend the thumb sideways.',
    color: '#c084fc',
  },
};

export const gestureOrder = [
  'open',
  'fist',
  'peace',
  'thumbsUp',
  'point',
  'ok',
  'call',
  'ilove',
  'rock',
  'three',
  'four',
  'lshape',
];

export function getFingerStates(landmarks) {
  if (!landmarks || landmarks.length < 21) return null;

  const isRight = landmarks[4].x < landmarks[2].x;
  const thumbUp = isRight ? landmarks[4].x < landmarks[3].x : landmarks[4].x > landmarks[3].x;

  return {
    thumb: thumbUp,
    index: landmarks[8].y < landmarks[6].y,
    middle: landmarks[12].y < landmarks[10].y,
    ring: landmarks[16].y < landmarks[14].y,
    pinky: landmarks[20].y < landmarks[18].y,
  };
}

export function classifyGesture(landmarks) {
  const f = getFingerStates(landmarks);
  if (!f) return 'open';

  const upCount = [f.index, f.middle, f.ring, f.pinky].filter(Boolean).length;

  if (f.index && f.middle && f.ring && f.pinky) return 'open';
  if (!f.index && !f.middle && !f.ring && !f.pinky && !f.thumb) return 'fist';
  if (f.index && f.middle && !f.ring && !f.pinky) return 'peace';
  if (!f.index && !f.middle && !f.ring && !f.pinky && f.thumb) return 'thumbsUp';
  if (f.index && !f.middle && !f.ring && !f.pinky && !f.thumb) return 'point';
  if (f.thumb && f.pinky && !f.index && !f.middle && !f.ring) return 'call';
  if (f.thumb && f.index && f.pinky && !f.middle && !f.ring) return 'ilove';
  if (!f.thumb && f.index && f.pinky && !f.middle && !f.ring) return 'rock';
  if (f.index && f.middle && f.ring && !f.pinky) return 'three';
  if (!f.thumb && upCount === 4) return 'four';

  return 'open';
}
