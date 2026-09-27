import { useEffect, useRef, useState } from "react";
import type { WorldRecord } from "../lib/types";
import { formatValue, peopleNeeded, unitWord } from "../lib/format";
import { beep, keepAwake } from "../lib/device";

interface Props {
  record: WorldRecord;
  onResult: (score: number) => void;
  onBack: () => void;
}

type Phase = "ready" | "countdown" | "running" | "done";

export function Attempt({ record: r, onResult, onBack }: Props) {
  const timed = r.measure === "most" && r.attemptSeconds !== null;
  const stopwatch = r.measure !== "most";
  const [phase, setPhase] = useState<Phase>(timed || stopwatch ? "ready" : "done");
  const [countdown, setCountdown] = useState(3);
  const [count, setCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [entry, setEntry] = useState("");
  const startedAt = useRef(0);

  // Keep the screen on while the clock matters.
  useEffect(() => {
    keepAwake(phase === "countdown" || phase === "running");
  }, [phase]);
  useEffect(() => () => void keepAwake(false), []);

  // 3-2-1 before a timed "most" attempt.
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown === 0) {
      beep(true);
      startedAt.current = performance.now();
      setPhase("running");
      return;
    }
    beep();
    const t = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phase, countdown]);

  // The running clock, for both the timer and the stopwatch.
  useEffect(() => {
    if (phase !== "running") return;
    const id = window.setInterval(() => {
      const secs = (performance.now() - startedAt.current) / 1000;
      if (timed && secs >= r.attemptSeconds!) {
        beep(true);
        setElapsed(r.attemptSeconds!);
        setPhase("done");
      } else {
        setElapsed(secs);
      }
    }, 50);
    return () => window.clearInterval(id);
  }, [phase, timed, r.attemptSeconds]);

  // When a timed attempt ends, pre-fill the count so it can be corrected.
  useEffect(() => {
    if (phase === "done" && timed) setEntry(String(count));
  }, [phase, timed, count]);

  function startStopwatch() {
    beep(true);
    startedAt.current = performance.now();
    setElapsed(0);
    setPhase("running");
  }

  function stopStopwatch() {
    beep(true);
    const secs = (performance.now() - startedAt.current) / 1000;
    setElapsed(secs);
    setEntry(secs.toFixed(2));
    setPhase("done");
  }

  function reset() {
    setCount(0);
    setElapsed(0);
    setCountdown(3);
    setEntry("");
    setPhase(timed || stopwatch ? "ready" : "done");
  }

  const score = Number(entry.replace(",", "."));
  const valid = entry.trim() !== "" && Number.isFinite(score) && score >= 0;
  const people = peopleNeeded(r);

  return (
    <section className="stack">
      <button type="button" className="link" onClick={onBack}>
        Back to the record
      </button>
      <h1>{r.title}</h1>
      <p>
        The record to beat: <strong className="gold">{formatValue(r, r.recordValue!)}</strong>
      </p>
      <p>
        You need a timekeeper and a counter. Grab someone nearby.{people && ` ${people}`}
      </p>

      {timed && phase === "ready" && (
        <button type="button" className="primary big" onClick={() => setPhase("countdown")}>
          Start
        </button>
      )}

      {timed && phase === "countdown" && <p className="clock">{countdown}</p>}

      {timed && phase === "running" && (
        <>
          <p className="clock">{Math.max(0, Math.ceil(r.attemptSeconds! - elapsed))}</p>
          <button type="button" className="tap" onClick={() => setCount((c) => c + 1)}>
            <span className="tap-count">{count}</span>
            <span>Tap to count</span>
          </button>
        </>
      )}

      {stopwatch && phase !== "done" && (
        <>
          <p className="clock">{elapsed.toFixed(2)}</p>
          <button
            type="button"
            className="tap"
            onClick={phase === "ready" ? startStopwatch : stopStopwatch}
          >
            {phase === "ready" ? "Tap to start" : "Tap to stop"}
          </button>
        </>
      )}

      {phase === "done" && (
        <div className="stack">
          {!timed && !stopwatch && <p className="lead">Go when you're ready.</p>}
          {timed && <p className="lead">Time's up.</p>}
          <label className="field">
            <span>
              {stopwatch ? "Time in seconds" : `Your score in ${unitWord(r)}`}
            </span>
            <input
              id="score"
              inputMode="decimal"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              placeholder="0"
            />
          </label>
          <button type="button" className="primary" disabled={!valid} onClick={() => onResult(score)}>
            See result
          </button>
          {(timed || stopwatch) && (
            <button type="button" className="secondary" onClick={reset}>
              Reset
            </button>
          )}
        </div>
      )}
    </section>
  );
}
