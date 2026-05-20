"use client";

import {
  BadgeCheck,
  CircleCheck,
  Hand,
  HeartHandshake,
  ListChecks,
  MousePointer2,
  PhoneCall,
  ScanLine,
  Shield,
  Sparkles,
  ThumbsUp,
  Zap,
} from "lucide-react";
import type { GestureInfo } from "../lib/gestureRules";

const icons = {
  BadgeCheck,
  CircleCheck,
  Hand,
  HeartHandshake,
  ListChecks,
  MousePointer2,
  PhoneCall,
  ScanLine,
  Shield,
  Sparkles,
  ThumbsUp,
  Zap,
};

export default function GestureCard({ info }: { info: GestureInfo }) {
  const Icon = icons[info.icon as keyof typeof icons] ?? Sparkles;
  const percent = Math.round(info.confidence * 100);

  return (
    <div className="glass rounded-[2rem] p-5 shadow-2xl sm:p-6">
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-sky-300/25 bg-sky-300/10 text-sky-200 shadow-inner sm:h-16 sm:w-16">
          <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-300">Detected Sign</p>
          <h3 className="mt-1 break-words text-2xl font-black text-white sm:text-3xl">{info.label}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300 sm:text-base">{info.meaning}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Confidence</p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-sky-300" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-2 text-sm font-bold text-slate-200">{percent}% stable match</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">How to show it</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{info.instruction}</p>
        </div>
      </div>
    </div>
  );
}
