import { useEffect, useState } from "react";
import type { Measure } from "../lib/types";
import { listIdeas, submitIdea, type RecordIdea } from "../lib/db";
import { burst } from "../lib/device";

export const GWR_APPLY_URL = "https://www.guinnessworldrecords.com/records/apply-to-set-or-break-a-record";

interface Props {
  defaultName: string;
  onExit: () => void;
}

const MEASURES: { value: Measure; label: string; hint: string }[] = [
  { value: "most", label: "Most", hint: "How many in a time limit." },
  { value: "fastest", label: "Fastest", hint: "Beat the stopwatch." },
  { value: "longest", label: "Longest", hint: "Keep it going as long as you can." },
];

const LIMITS = [
  { value: 30, label: "30 seconds" },
  { value: 60, label: "1 minute" },
  { value: 180, label: "3 minutes" },
  { value: 0, label: "No limit" },
];

function ideaFigure(i: RecordIdea): string | null {
  if (i.target === null) return null;
  return i.measure === "most" ? `${i.target} ${i.unit}` : `${i.target} seconds`;
}

/** Guests propose their own record. It is saved to the party database, then they apply to Guinness. */
export function PartyRecords({ defaultName, onExit }: Props) {
  const [name, setName] = useState(defaultName);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [measure, setMeasure] = useState<Measure>("most");
  const [limit, setLimit] = useState(60);
  const [unit, setUnit] = useState("");
  const [target, setTarget] = useState("");
  const [status, setStatus] = useState<"editing" | "saving" | "saved" | "error">("editing");
  const [ideas, setIdeas] = useState<RecordIdea[]>([]);

  useEffect(() => {
    listIdeas().then(setIdeas).catch(() => setIdeas([]));
  }, [status]);

  const figure = Number(target.replace(",", "."));
  const ready =
    name.trim() && title.trim().length > 3 && (measure !== "most" || unit.trim()) && (target === "" || Number.isFinite(figure));

  async function submit() {
    setStatus("saving");
    try {
      await submitIdea({
        guest_name: name.trim(),
        title: title.trim(),
        measure,
        unit: measure === "most" ? unit.trim() : "seconds",
        time_limit_seconds: measure === "most" && limit ? limit : null,
        target: target === "" ? null : figure,
        description: description.trim(),
      });
      setStatus("saved");
      burst(true);
    } catch {
      setStatus("error");
    }
  }

  if (status === "saved") {
    return (
      <section className="stack">
        <h1 className="win">Your record is in the book, {name.trim()}!</h1>
        <div className="record-card">
          <span>Proposed record</span>
          <strong className="idea-title">{title.trim()}</strong>
          {target !== "" && <span>Target: {measure === "most" ? `${figure} ${unit.trim()}` : `${figure} seconds`}</span>}
        </div>
        <p className="lead">Now make it official. Guinness needs you to apply on their site before any attempt counts.</p>
        <a className="primary button-link" href={GWR_APPLY_URL} target="_blank" rel="noopener noreferrer">
          Apply on Guinness World Records
        </a>
        <p>Applying is free. Guinness can take up to 20 weeks to reply, and they send the official rules once they approve it.</p>
        <div className="actions">
          <button type="button" className="secondary" onClick={() => setStatus("editing")}>
            Submit another idea
          </button>
          <button type="button" className="secondary" onClick={onExit}>
            Back to the start
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="stack">
      <button type="button" className="link" onClick={onExit}>
        Back to the start
      </button>
      <h1 className="display shine">Invent your own record</h1>
      <p className="lead">Dream up a record, add it to the party book, then apply to Guinness to make it official.</p>

      <form
        className="stack invent"
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) submit();
        }}
      >
        <label className="field">
          <span>Your name</span>
          <input id="idea-name" autoComplete="off" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </label>
        <label className="field">
          <span>Name your record</span>
          <input id="idea-title" autoComplete="off" maxLength={90} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Most crisps balanced on a nose in one minute" />
        </label>
        <div className="field">
          <span>How is it won?</span>
          <div className="options">
            {MEASURES.map((m) => (
              <button key={m.value} type="button" className={m.value === measure ? "option on" : "option"} aria-pressed={m.value === measure} onClick={() => setMeasure(m.value)}>
                <span className="option-label">{m.label}</span>
                <span className="option-hint">{m.hint}</span>
              </button>
            ))}
          </div>
        </div>
        {measure === "most" && (
          <>
            <label className="field">
              <span>What are you counting?</span>
              <input id="idea-unit" autoComplete="off" maxLength={30} value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="crisps" />
            </label>
            <div className="field">
              <span>Time limit</span>
              <div className="options grid">
                {LIMITS.map((l) => (
                  <button key={l.value} type="button" className={l.value === limit ? "option on" : "option"} aria-pressed={l.value === limit} onClick={() => setLimit(l.value)}>
                    <span className="option-label">{l.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        <label className="field">
          <span>{measure === "most" ? `How many ${unit.trim() || "can you do"}? (optional)` : "Your target time in seconds (optional)"}</span>
          <input id="idea-target" inputMode="decimal" autoComplete="off" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="e.g. 12" />
        </label>
        <label className="field">
          <span>How does it work? (optional)</span>
          <textarea id="idea-description" maxLength={400} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="One crisp at a time, no hands after placing it." />
        </label>
        {status === "error" && <p className="error">That didn't save. Check your signal and try again.</p>}
        <button type="submit" className="primary" disabled={!ready || status === "saving"}>
          {status === "saving" ? "Saving..." : "Submit my record"}
        </button>
      </form>

      {ideas.length > 0 && (
        <div className="stack">
          <h2>The party book</h2>
          <ul className="board">
            {ideas.map((i) => (
              <li key={i.id ?? `${i.title}-${i.created_at}`}>
                <div>
                  <p className="board-title">{i.title}</p>
                  <p>
                    {ideaFigure(i) && <strong className="gold">{ideaFigure(i)} · </strong>}
                    by {i.guest_name}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
