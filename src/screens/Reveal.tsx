import { useEffect } from "react";
import type { Answers, WorldRecord } from "../lib/types";
import { matchedReasons } from "../lib/match";
import { DIFFICULTY_WORDS, formatNumber, holderLine, kitLabel, teamLine, unitWord } from "../lib/format";
import { burst } from "../lib/device";
import { Seal } from "../Decor";

interface Props {
  record: WorldRecord;
  answers: Answers;
  onChoose: () => void;
  onAnother: () => void;
  onNextPerson: () => void;
}

export function Reveal({ record: r, answers, onChoose, onAnother, onNextPerson }: Props) {
  useEffect(() => burst(), [r.id]);
  const team = teamLine(r);

  return (
    <section className="stack">
      <div className="certificate">
        <Seal />
        <p className="cert-name">Your record</p>
        <h1 className="cert-title">{r.title}</h1>
        {team && <p className="cert-small">{team}</p>}
        <p className="cert-small">The record to beat</p>
        <p className="cert-number">
          {formatNumber(r, r.recordValue!)} <span className="cert-unit">{unitWord(r)}</span>
        </p>
        <p className="cert-small">{holderLine(r)}</p>
      </div>

      <p>
        <strong>{DIFFICULTY_WORDS[r.difficulty]}.</strong> Picked for you because: {matchedReasons(r, answers)}.
      </p>

      <div className="details">
        <h2>How it works</h2>
        <p>{r.howItWorks}</p>
        {r.rules.length > 0 && (
          <ul>
            {r.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        )}
        <h2>Kit you'll need</h2>
        <p>{r.kit.length ? r.kit.map(kitLabel).join(", ") : "No kit needed"}</p>
        <h2>Space</h2>
        <p>{r.space}</p>
      </div>

      <div className="actions">
        <button type="button" className="primary" onClick={onChoose}>
          This is the one
        </button>
        <button type="button" className="secondary" onClick={onAnother}>
          Show me another
        </button>
        <button type="button" className="secondary" onClick={onNextPerson}>
          Next person
        </button>
      </div>
    </section>
  );
}
