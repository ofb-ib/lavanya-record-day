import { useEffect } from "react";
import type { WorldRecord } from "../lib/types";
import { formatValue, holderLine } from "../lib/format";
import { burst } from "../lib/device";

interface Props {
  record: WorldRecord;
  names: string;
  onAddRequirements: () => void;
  onNextPerson: () => void;
  onPlay: () => void;
}

/** The guest has claimed a record. Next: apply to Guinness, wait for the rules, attempt it on the big day. */
export function Chosen({ record: r, names, onAddRequirements, onNextPerson, onPlay }: Props) {
  useEffect(() => burst(true), []);

  return (
    <section className="stack">
      <p className="script">It's official-ish</p>
      <h1 className="win">{names}, this record is yours.</h1>
      <div className="record-card">
        <span>You're going for</span>
        <strong className="idea-title">{r.title}</strong>
        <span>
          Record to beat: {formatValue(r, r.recordValue!)}, {holderLine(r)}
        </span>
      </div>
      <p>Nobody else at the party will be offered it.</p>

      <h2>What happens next</h2>
      <ol className="steps">
        <li>
          <strong>Apply to Guinness World Records.</strong> Open the record's page and apply to break it. Applying is
          free.
        </li>
        <li>
          <strong>Wait for approval.</strong> Guinness can take up to 20 weeks to reply. If they approve you, they send
          the official guidelines.
        </li>
        <li>
          <strong>Add the guidelines to the party book</strong> so everyone knows the rules.
        </li>
        <li>
          <strong>Practise, then break it on the big day.</strong>
        </li>
      </ol>

      <div className="actions">
        <a className="primary button-link" href={r.gwrUrl!} target="_blank" rel="noopener noreferrer">
          Apply on Guinness World Records
        </a>
        <button type="button" className="secondary" onClick={onAddRequirements}>
          I've got my guidelines
        </button>
        <button type="button" className="secondary" onClick={onNextPerson}>
          Next person
        </button>
      </div>

      <div className="play-cta">
        <p>While you wait: can you top the party leaderboard?</p>
        <button type="button" className="primary" onClick={onPlay}>
          Play the balloon pop challenge
        </button>
      </div>
    </section>
  );
}
