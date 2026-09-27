import { useEffect, useState } from "react";
import { addRecord, listRecords, type AddedRecord } from "../lib/db";
import { burst } from "../lib/device";

const GWR_APPLY_URL = "https://www.guinnessworldrecords.com/records/apply-to-set-or-break-a-record";

interface Props {
  defaultName: string;
  onExit: () => void;
}

/** Guests add the record they are attempting, with the requirements Guinness sent them. */
export function PartyRecords({ defaultName, onExit }: Props) {
  const [name, setName] = useState(defaultName);
  const [title, setTitle] = useState("");
  const [requirements, setRequirements] = useState("");
  const [status, setStatus] = useState<"editing" | "saving" | "saved" | "error">("editing");
  const [entries, setEntries] = useState<AddedRecord[]>([]);

  useEffect(() => {
    listRecords().then(setEntries).catch(() => setEntries([]));
  }, [status]);

  const ready = name.trim().length > 0 && title.trim().length > 3;

  async function submit() {
    setStatus("saving");
    try {
      await addRecord({ guest_name: name.trim(), title: title.trim(), requirements: requirements.trim() });
      setStatus("saved");
      burst(true);
    } catch {
      setStatus("error");
    }
  }

  if (status === "saved") {
    return (
      <section className="stack">
        <h1 className="win">Added to the party book, {name.trim()}!</h1>
        <div className="record-card">
          <span>Your record</span>
          <strong className="idea-title">{title.trim()}</strong>
        </div>
        <p className="lead">Your attempt only counts once Guinness has approved it. If you haven't applied yet, do it here:</p>
        <a className="primary button-link" href={GWR_APPLY_URL} target="_blank" rel="noopener noreferrer">
          Apply on Guinness World Records
        </a>
        <div className="actions">
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setTitle("");
              setRequirements("");
              setStatus("editing");
            }}
          >
            Add another record
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
      <h1 className="display shine">Add your own record</h1>

      <aside className="note">
        <strong>Note:</strong> if you're not attempting an existing record, you'll need to propose a new record title
        to Guinness World Records and wait for it to be approved. Be warned: they turn down most niche proposals.
      </aside>

      <form
        className="stack invent"
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) submit();
        }}
      >
        <label className="field">
          <span>Your name</span>
          <input id="added-name" autoComplete="off" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </label>
        <label className="field">
          <span>The record you're attempting</span>
          <input
            id="added-title"
            autoComplete="off"
            maxLength={150}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Most socks put on one foot in 30 seconds"
          />
        </label>
        <label className="field">
          <span>Guinness attempt requirements</span>
          <textarea
            id="added-requirements"
            rows={8}
            maxLength={20000}
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="Paste the guidelines Guinness sent you"
          />
        </label>
        {status === "error" && <p className="error">That didn't save. Check your signal and try again.</p>}
        <button type="submit" className="primary" disabled={!ready || status === "saving"}>
          {status === "saving" ? "Saving..." : "Add my record"}
        </button>
      </form>

      {entries.length > 0 && (
        <div className="stack">
          <h2>The party book</h2>
          <ul className="board">
            {entries.map((e) => (
              <li key={e.id ?? `${e.title}-${e.created_at}`}>
                <div>
                  <p className="board-title">{e.title}</p>
                  <p>by {e.guest_name}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
