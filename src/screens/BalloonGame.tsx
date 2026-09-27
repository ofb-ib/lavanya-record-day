import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { beep, burst, keepAwake, popSound } from "../lib/device";

const GAME_SECONDS = 30;
const COLOURS = ["#D6A646", "#C94F6D", "#4F7BD6", "#F7F1E3", "#8E5BC9"];
const RECORD_KEY = "lrd-balloon-record";

interface Best {
  score: number;
  name: string;
}

interface Balloon {
  id: number;
  colour: string;
  left: number;
  duration: number;
}

function readBest(): Best | null {
  try {
    return JSON.parse(localStorage.getItem(RECORD_KEY) ?? "null") as Best | null;
  } catch {
    return null;
  }
}

function writeBest(best: Best): void {
  try {
    localStorage.setItem(RECORD_KEY, JSON.stringify(best));
  } catch {
    // Private mode: the record lasts until the page closes.
  }
}

type Phase = "intro" | "countdown" | "playing" | "over";

interface Props {
  defaultName: string;
  onExit: () => void;
}

/** Pop as many balloons as you can in 30 seconds. The more time passes, the faster they come. */
export function BalloonGame({ defaultName, onExit }: Props) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(GAME_SECONDS);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [best, setBest] = useState<Best | null>(readBest);
  const [name, setName] = useState(defaultName);
  const [saved, setSaved] = useState(false);
  const nextId = useRef(0);
  const startedAt = useRef(0);

  const beaten = phase === "over" && score > 0 && (best === null || score > best.score);

  useEffect(() => {
    keepAwake(phase === "countdown" || phase === "playing");
    return () => void keepAwake(false);
  }, [phase]);

  // 3-2-1
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown === 0) {
      beep(true);
      startedAt.current = performance.now();
      setPhase("playing");
      return;
    }
    beep();
    const t = window.setTimeout(() => setCountdown((c) => c - 1), 800);
    return () => window.clearTimeout(t);
  }, [phase, countdown]);

  // The clock, plus a spawner that speeds up as time runs out.
  useEffect(() => {
    if (phase !== "playing") return;
    let spawnTimer = 0;
    const spawn = () => {
      const t = (performance.now() - startedAt.current) / 1000;
      const progress = Math.min(1, t / GAME_SECONDS);
      const count = 1 + Math.floor(progress * 3);
      setBalloons((list) => [
        ...list.slice(-40),
        ...Array.from({ length: count }, () => ({
          id: nextId.current++,
          colour: COLOURS[Math.floor(Math.random() * COLOURS.length)],
          left: 4 + Math.random() * 84,
          duration: 5.5 - progress * 3 + Math.random(),
        })),
      ]);
      spawnTimer = window.setTimeout(spawn, 700 - progress * 450);
    };
    spawn();
    const clock = window.setInterval(() => {
      const remaining = GAME_SECONDS - (performance.now() - startedAt.current) / 1000;
      if (remaining <= 0) {
        beep(true);
        setLeft(0);
        setBalloons([]);
        setPhase("over");
      } else {
        setLeft(Math.ceil(remaining));
      }
    }, 100);
    return () => {
      window.clearTimeout(spawnTimer);
      window.clearInterval(clock);
    };
  }, [phase]);

  useEffect(() => {
    if (beaten) {
      burst(true);
      const again = window.setTimeout(() => burst(true), 900);
      return () => window.clearTimeout(again);
    }
  }, [beaten]);

  function pop(b: Balloon, e: React.PointerEvent<HTMLButtonElement>) {
    popSound();
    confetti({
      particleCount: 24,
      spread: 360,
      startVelocity: 14,
      scalar: 0.7,
      ticks: 60,
      origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
      colors: [b.colour, "#F7F1E3"],
    });
    setScore((s) => s + 1);
    setBalloons((list) => list.filter((x) => x.id !== b.id));
  }

  function start() {
    setScore(0);
    setLeft(GAME_SECONDS);
    setCountdown(3);
    setSaved(false);
    setPhase("countdown");
  }

  function save() {
    const record = { score, name: name.trim() || "Mystery guest" };
    writeBest(record);
    setBest(record);
    setSaved(true);
  }

  return (
    <section className="stack game">
      <button type="button" className="link" onClick={onExit}>
        Back to the records
      </button>

      {phase === "intro" && (
        <>
          <h1 className="display shine">Balloon pop challenge</h1>
          <p className="lead">Pop as many balloons as you can in {GAME_SECONDS} seconds. They get faster as the clock runs down.</p>
          <div className="record-card">
            <span>The party record to beat</span>
            <strong>{best ? `${best.score} balloons` : "No record yet"}</strong>
            {best && <span>set by {best.name}</span>}
          </div>
          <button type="button" className="primary big" onClick={start}>
            Start
          </button>
        </>
      )}

      {phase === "countdown" && <p className="clock game-count">{countdown}</p>}

      {phase === "playing" && (
        <div className="hud" aria-live="off">
          <span>
            <strong>{score}</strong> popped
          </span>
          <span className={left <= 5 ? "hurry" : ""}>
            <strong>{left}</strong> s left
          </span>
          {best && <span>Record {best.score}</span>}
        </div>
      )}

      {phase === "over" && (
        <>
          {beaten ? (
            <h1 className="win">New party record: {score} balloons!</h1>
          ) : (
            <h1>
              {score} balloons popped
            </h1>
          )}
          {!beaten && best && (
            <p className="lead">
              {best.score - score + 1} more to beat {best.name}'s record of {best.score}.
            </p>
          )}
          {beaten && best && !saved && <p className="lead">You beat {best.name}'s {best.score}.</p>}
          {beaten && !saved && (
            <form
              className="stack"
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
            >
              <label className="field">
                <span>Put your name on the record</span>
                <input id="game-name" autoComplete="off" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </label>
              <button type="submit" className="primary">
                Save my record
              </button>
            </form>
          )}
          {(saved || !beaten) && (
            <div className="actions">
              <button type="button" className="primary" onClick={start}>
                Play again
              </button>
              <button type="button" className="secondary" onClick={onExit}>
                Back to the records
              </button>
            </div>
          )}
        </>
      )}

      {phase === "playing" && (
        <div className="game-sky">
          {balloons.map((b) => (
            <button
              key={b.id}
              type="button"
              aria-label="Pop balloon"
              className="balloon game-balloon"
              onPointerDown={(e) => pop(b, e)}
              onAnimationEnd={() => setBalloons((list) => list.filter((x) => x.id !== b.id))}
              style={{ left: `${b.left}%`, background: b.colour, animationDuration: `${b.duration}s` }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
