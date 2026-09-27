import { useState } from "react";

interface Props {
  pair: boolean;
  crew: string[];
  onChange: (crew: string[]) => void;
  onNext: () => void;
}

/** Gathers the partner's name, or everyone in the crew. */
export function Crew({ pair, crew, onChange, onNext }: Props) {
  const [draft, setDraft] = useState("");

  if (pair) {
    return (
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault();
          onNext();
        }}
      >
        <h1>Who's your partner?</h1>
        <label className="field">
          <span>Partner's name</span>
          <input
            id="partner"
            autoComplete="off"
            maxLength={40}
            value={crew[0] ?? ""}
            onChange={(e) => onChange(e.target.value ? [e.target.value] : [])}
            placeholder="Go and grab them"
          />
        </label>
        <button type="submit" className="primary" disabled={!crew[0]?.trim()}>
          Next
        </button>
      </form>
    );
  }

  function add() {
    const name = draft.trim();
    if (!name) return;
    onChange([...crew, name]);
    setDraft("");
  }

  const size = crew.length + 1;
  return (
    <section className="stack">
      <h1>Who's in your crew?</h1>
      <p>Add everyone who's going for it with you. Most team records need 8 to 12 people.</p>
      <form
        className="add-row"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <input
          id="crew-name"
          aria-label="Crew member's name"
          autoComplete="off"
          maxLength={40}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Name"
        />
        <button type="submit" className="add" disabled={!draft.trim()}>
          Add
        </button>
      </form>
      {crew.length > 0 && (
        <ul className="crew">
          {crew.map((c, i) => (
            <li key={`${c}-${i}`} className="pop-in">
              {c}
              <button type="button" aria-label={`Remove ${c}`} onClick={() => onChange(crew.filter((_, j) => j !== i))}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="lead">
        <strong className="gold">Crew of {size}</strong>, including you.
      </p>
      <button type="button" className="primary" disabled={crew.length < 2} onClick={onNext}>
        {crew.length < 2 ? `Add ${2 - crew.length} more to continue` : "That's everyone"}
      </button>
    </section>
  );
}
