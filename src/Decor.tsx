import { useMemo } from "react";

const BALLOON_COLOURS = ["#D6A646", "#C94F6D", "#4F7BD6", "#F7F1E3", "#8E5BC9"];

/** Twinkling stars and slowly rising balloons behind every screen. */
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
      {BALLOON_COLOURS.map((c, i) => (
        <span
          key={c}
          className="balloon"
          style={{ left: `${8 + i * 20}%`, background: c, animationDelay: `${i * 2.8}s`, animationDuration: `${13 + i * 1.5}s` }}
        />
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
