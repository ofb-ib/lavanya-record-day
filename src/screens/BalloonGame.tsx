import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { beep, burst, keepAwake, popSound } from "../lib/device";
import { addScore, logAttempt, topScores, THIS_DEVICE, type BalloonScore, type Device } from "../lib/db";

const GAME_SECONDS = 30;
const COLOURS = ["#D6A646", "#C94F6D", "#4F7BD6", "#F7F1E3", "#8E5BC9"];
interface Balloon {
  id: number;
  colour: string;
  left: number;
  duration: number;
  delay: number;
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
  // The board you compete on is your device's. You can peek at the other one.
  const [top, setTop] = useState<BalloonScore[]>([]);
  const [viewing, setViewing] = useState<Device>(THIS_DEVICE);
  const [viewTop, setViewTop] = useState<BalloonScore[]>([]);
  const [name, setName] = useState(defaultName);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [saveError, setSaveError] = useState(false);
  const refresh = () => {
    topScores(THIS_DEVICE).then(setTop).catch(() => undefined);
    if (viewing !== THIS_DEVICE) topScores(viewing).then(setViewTop).catch(() => undefined);
  };
  // Keep the podium live: other guests' scores appear within a few seconds.
  useEffect(() => {
    refresh();
    if (phase === "countdown" || phase === "playing") return;
    const id = window.setInterval(refresh, 4000);
    return () => window.clearInterval(id);
  }, [phase, viewing]);
  const nextId = useRef(0);
  const startedAt = useRef(0);
  const scoreRef = useRef(0);

  const best = top[0] ?? null;
  // Top three if there's a free spot, or it beats third place.
  const madeTop3 = phase === "over" && score > 0 && (top.length < 3 || score > top[top.length - 1].score);
  const beaten = madeTop3 && (best === null || score > best.score);

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
    let first = true;
    const spawn = () => {
      const t = (performance.now() - startedAt.current) / 1000;
      const progress = Math.min(1, t / GAME_SECONDS);
      // Open with a burst, then 3 per wave building to 6, arriving faster and faster.
      const count = first ? 8 : 3 + Math.floor(progress * 3);
      first = false;
      setBalloons((list) => [
        ...list.slice(-60),
        ...Array.from({ length: count }, () => ({
          id: nextId.current++,
          colour: COLOURS[Math.floor(Math.random() * COLOURS.length)],
          left: 4 + Math.random() * 84,
          duration: 4.6 - progress * 2.2 + Math.random() * 0.8,
          delay: Math.random() * 0.4,
        })),
      ]);
      spawnTimer = window.setTimeout(spawn, 450 - progress * 230);
    };
    spawn();
    const clock = window.setInterval(() => {
      const remaining = GAME_SECONDS - (performance.now() - startedAt.current) / 1000;
      if (remaining <= 0) {
        beep(true);
        // Every round counts towards the party total, whatever the score.
        logAttempt(scoreRef.current, THIS_DEVICE).then(refresh).catch(() => undefined);
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
    if (madeTop3 && !beaten) burst();
    if (beaten) {
      burst(true);
      const again = window.setTimeout(() => burst(true), 900);
      return () => window.clearTimeout(again);
    }
  }, [beaten, madeTop3]);

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
    scoreRef.current += 1;
    setScore(scoreRef.current);
    setBalloons((list) => list.filter((x) => x.id !== b.id));
  }

  async function save() {
    setSaving(true);
    setSaveError(false);
    try {
      await addScore({ score, name: name.trim(), device: THIS_DEVICE });
      await refresh();
      setSaved(true);
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  function start() {
    refresh();
    scoreRef.current = 0;
    setScore(0);
    setLeft(GAME_SECONDS);
    setCountdown(3);
    setSaved(false);
    setPhase("countdown");
  }

  const shown = viewing === THIS_DEVICE ? top : viewTop;
  const podium = (
    <>
      <div className="board-tabs" role="tablist" aria-label="Leaderboard">
        {(["mobile", "laptop"] as Device[]).map((d) => (
          <button key={d} type="button" role="tab" aria-selected={viewing === d} className={viewing === d ? "on" : ""} onClick={() => setViewing(d)}>
            {d === "mobile" ? "Phone" : "Laptop"}
            {d === THIS_DEVICE && " (you)"}
          </button>
        ))}
      </div>
      <ol className="podium">
        {[0, 1, 2].map((i) => (
          <li key={i} className={`place-${i + 1}`}>
            <span className="medal">{i + 1}</span>
            <span className="podium-name">{shown[i]?.name ?? "Up for grabs"}</span>
            <strong>{shown[i] ? `${shown[i].score}` : ""}</strong>
          </li>
        ))}
      </ol>
    </>
  );

  return (
    <section className="stack game">
      <button type="button" className="link" onClick={onExit}>
        Back to the records
      </button>

      {phase === "intro" && (
        <>
          <h1 className="display shine">Balloon pop challenge</h1>
          <p className="lead">Pop as many balloons as you can in {GAME_SECONDS} seconds. They get faster as the clock runs down.</p>
          {podium}
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
          ) : madeTop3 ? (
            <h1 className="win">{score} balloons. You made the top three!</h1>
          ) : (
            <h1>{score} balloons popped</h1>
          )}
          {!madeTop3 && top.length === 3 && (
            <p className="lead">{top[2].score - score + 1} more to get on the podium.</p>
          )}
          {madeTop3 && !saved && (
            <form
              className="stack"
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
            >
              <label className="field">
                <span>Put your name on the board</span>
                <input id="game-name" autoComplete="off" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </label>
              {saveError && <p className="error">That didn't save. Check your signal and try again.</p>}
              <button type="submit" className="primary" disabled={saving || !name.trim()}>
                {saving ? "Saving..." : name.trim() ? "Save my score" : "Add your name to save"}
              </button>
            </form>
          )}
          {(saved || !madeTop3) && (
            <>
              {podium}
              <div className="actions">
                <button type="button" className="primary" onClick={start}>
                  Play again
                </button>
                <button type="button" className="secondary" onClick={onExit}>
                  Back to the records
                </button>
              </div>
            </>
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
              style={{ left: `${b.left}%`, background: b.colour, animationDuration: `${b.duration}s`, animationDelay: `${b.delay}s` }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
