import type { Option } from "../lib/questions";

interface SingleProps {
  title: string;
  options: Option[];
  value: string | null;
  grid?: boolean;
  onPick: (value: string) => void;
}

export function SingleChoice({ title, options, value, grid, onPick }: SingleProps) {
  return (
    <section className="stack">
      <h1>{title}</h1>
      <div className={grid ? "options grid" : "options"}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className={o.value === value ? "option on" : "option"}
            aria-pressed={o.value === value}
            onClick={() => onPick(o.value)}
          >
            <span className="option-label">{o.label}</span>
            {o.hint && <span className="option-hint">{o.hint}</span>}
          </button>
        ))}
      </div>
    </section>
  );
}

interface MultiProps {
  title: string;
  hint: string;
  options: Option[];
  values: string[];
  max: number;
  onChange: (values: string[]) => void;
  onNext: () => void;
}

/** Pick up to `max`. The "none" option clears the others. */
export function MultiChoice({ title, hint, options, values, max, onChange, onNext }: MultiProps) {
  function toggle(v: string) {
    if (v === "none") return onChange(values.includes("none") ? [] : ["none"]);
    const rest = values.filter((x) => x !== "none");
    if (rest.includes(v)) return onChange(rest.filter((x) => x !== v));
    if (rest.length < max) onChange([...rest, v]);
  }

  return (
    <section className="stack">
      <h1>{title}</h1>
      <p>{hint}</p>
      <div className="options grid">
        {options.map((o) => {
          const on = values.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              className={on ? "option on" : "option"}
              aria-pressed={on}
              onClick={() => toggle(o.value)}
            >
              <span className="option-label">{o.label}</span>
            </button>
          );
        })}
      </div>
      <button type="button" className="primary" onClick={onNext}>
        Next
      </button>
    </section>
  );
}
