import { useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { popSound } from "./lib/device";

const BALLOON_COLOURS = ["#D6A646", "#C94F6D", "#4F7BD6", "#F7F1E3", "#8E5BC9"];

interface Balloon {
  id: number;
  colour: string;
  left: number;
  duration: number;
  delay: number;
}

const MAX_BALLOONS = 36;
let nextId = 0;

function makeBalloon(pops: number, delay: number): Balloon {
  return {
    id: nextId++,
    colour: BALLOON_COLOURS[Math.floor(Math.random() * BALLOON_COLOURS.length)],
    left: 2 + Math.random() * 86,
    duration: Math.max(4.5, 14 - pops * 0.6) + Math.random() * 3,
    delay,
  };
}

/** Balloons float up over the page. Every pop sends up more, faster, than the last. */
export function Balloons() {
  const [balloons, setBalloons] = useState<Balloon[]>(() =>
    Array.from({ length: 5 }, (_, i) => makeBalloon(0, i * 2.8)),
  );
  const [pops, setPops] = useState(0);

  function pop(b: Balloon, e: React.PointerEvent<HTMLButtonElement>) {
    popSound();
    confetti({
      particleCount: 40,
      spread: 360,
      startVelocity: 18,
      gravity: 0.8,
      scalar: 0.8,
      ticks: 90,
      origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
      colors: [b.colour, "#F7F1E3"],
    });
    const n = pops + 1;
    setPops(n);
    // Pop 1 sends up 2, pop 3 sends up 3, pop 5 sends up 4 ... until the sky is full.
    const extra = 1 + Math.ceil(n / 2);
    setBalloons((list) => {
      const rest = list.filter((x) => x.id !== b.id);
      const room = Math.max(0, MAX_BALLOONS - rest.length);
      const fresh = Array.from({ length: Math.min(extra, room) }, (_, i) => makeBalloon(n, i * 0.35));
      return [...rest, ...fresh];
    });
  }

  return (
    <div className="balloons">
      {balloons.map((b) => (
        <button
          key={b.id}
          type="button"
          aria-label="Pop balloon"
          className="balloon"
          onPointerDown={(e) => pop(b, e)}
          style={{
            left: `${b.left}%`,
            background: b.colour,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Twinkling stars behind every screen. */
export function Sky() {
  const stars = useMemo(
    () => Array.from({ length: 40 }, () => ({ left: Math.random() * 100, top: Math.random() * 100, delay: Math.random() * 3 })),
    [],
  );
  return (
    <div className="sky" aria-hidden="true">
      {stars.map((s, i) => (
        <span key={i} className="star" style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s` }} />
      ))}
    </div>
  );
}

export function Trophy() {
  return (
    <svg className="trophy" viewBox="0 0 96 96" aria-hidden="true">
      <path d="M28 14h40v18c0 13-9 24-20 24S28 45 28 32z" fill="#D6A646" />
      <path d="M28 20H16c0 12 6 19 14 20M68 20h12c0 12-6 19-14 20" fill="none" stroke="#D6A646" strokeWidth="5" />
      <rect x="43" y="56" width="10" height="14" fill="#B8862F" />
      <rect x="30" y="70" width="36" height="10" rx="3" fill="#D6A646" />
      <path d="M48 22l3.5 7 7.5 1-5.5 5 1.5 7.5L48 39l-6.5 3.5L43 35l-5.5-5 7.5-1z" fill="#F7F1E3" />
    </svg>
  );
}

export function Seal() {
  return (
    <svg className="seal" viewBox="0 0 80 80" aria-hidden="true">
      <circle cx="40" cy="40" r="36" fill="#C94F6D" />
      <circle cx="40" cy="40" r="28" fill="none" stroke="#F7F1E3" strokeWidth="2" strokeDasharray="3 3" />
      <path d="M40 22l5 10 11 1.5-8 7.5 2 11L40 46.5 30 52l2-11-8-7.5L35 32z" fill="#F7F1E3" />
    </svg>
  );
}
