import { useEffect, useState } from "react";
import type { WorldRecord } from "../lib/types";
import { beats, formatValue, gap } from "../lib/format";
import { burst, saveBest } from "../lib/device";

interface Props {
  record: WorldRecord;
  name: string;
  score: number;
  onTryAgain: () => void;
  onAnother: () => void;
  onNextPerson: () => void;
}

export function Result({ record: r, name, score, onTryAgain, onAnother, onNextPerson }: Props) {
  const won = beats(r, score);
  const [best, setBest] = useState<number | null>(null);

  useEffect(() => {
    setBest(saveBest(r, score));
    if (!won) return;
    burst(true);
    const again = window.setTimeout(() => burst(true), 900);
    return () => window.clearTimeout(again);
  }, [r, score, won]);

  return (
    <section className="stack">
      {won ? (
        <>
          <h1 className="win">{name} just beat a world record!</h1>
          <p>
            {formatValue(r, score)} against {formatValue(r, r.recordValue!)}.
          </p>
          {r.gwrUrl && (
          <p>
            Unofficially, for now. Guinness only counts attempts they have approved in advance. Film it, then
            apply to do it for real:{" "}
            <a href={r.gwrUrl!} target="_blank" rel="noopener noreferrer">
              {r.title}
            </a>
          </p>
          )}
        </>
      ) : (
        <>
          <h1>
            {name} scored {formatValue(r, score)}.
          </h1>
          <p className="lead">{formatValue(r, gap(r, score))} off the world record.</p>
          <p>Have another go, or try a different record.</p>
        </>
      )}

      {best !== null && best !== score && <p>Best on this phone: {formatValue(r, best)}</p>}

      <div className="actions">
        <button type="button" className="primary" onClick={onTryAgain}>
          Try again
        </button>
        <button type="button" className="secondary" onClick={onAnother}>
          Another record
        </button>
        <button type="button" className="secondary" onClick={onNextPerson}>
          Next person
        </button>
      </div>
    </section>
  );
}
