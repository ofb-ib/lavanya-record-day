import { useEffect } from "react";
import type { WorldRecord } from "../lib/types";
import { formatValue, holderLine } from "../lib/format";
import { burst } from "../lib/device";

interface Props {
  record: WorldRecord;
  onNextPerson: () => void;
  onPlay: () => void;
}

/** After picking a record: apply to Guinness, then add the guidelines once they arrive. */
export function Chosen({ record: r, onNextPerson, onPlay }: Props) {
  useEffect(() => burst(true), []);

  return (
    <section className="stack">
      <h1 className="win">Great pick.</h1>
      <div className="record-card">
        <span>You're going for</span>
        <strong className="idea-title">{r.title}</strong>
        <span>
          Record to beat: {formatValue(r, r.recordValue!)}, {holderLine(r)}
        </span>
      </div>

      <a className="primary button-link" href={r.gwrUrl!} target="_blank" rel="noopener noreferrer">
        Apply on Guinness World Records
      </a>

      <h2>What happens next</h2>
      <ol className="steps">
        <li>
          <strong>Apply to Guinness World Records.</strong> Open the record's page and apply to break it. Applying is
          free.
        </li>
        <li>
          <strong>Wait for approval.</strong> Guinness can take up to 12 weeks to reply, but it's often much sooner. If
          they approve you, they email you the official guidelines.
        </li>
        <li>
          <strong>Add your record attempt.</strong> Come back to this site, tap "Add your record attempt" on the front
          page, and paste in the guidelines.
        </li>
        <li>
          <strong>Practise, then break it on the big day.</strong>
        </li>
      </ol>

      <button type="button" className="secondary" onClick={onNextPerson}>
        Next person
      </button>

      <div className="play-cta">
        <p>While you wait: can you top the party leaderboard?</p>
        <button type="button" className="primary" onClick={onPlay}>
          Play the balloon pop record
        </button>
      </div>
    </section>
  );
}
