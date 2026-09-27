import { useEffect, useState } from "react";

interface Props {
  titles: string[];
  finalTitle: string;
  onDone: () => void;
}

/** Record titles flick past like a slot machine, slow down, then stop on the pick. */
export function Drumroll({ titles, finalTitle, onDone }: Props) {
  const [shown, setShown] = useState(titles[0] ?? finalTitle);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onDone();
      return;
    }
    let elapsed = 0;
    let delay = 55;
    let i = 0;
    let timer = 0;
    const tick = () => {
      elapsed += delay;
      if (elapsed >= 2500) {
        setShown(finalTitle);
        timer = window.setTimeout(onDone, 450);
        return;
      }
      i += 1;
      setShown(titles[i % titles.length]);
      delay = Math.min(320, delay * 1.13);
      timer = window.setTimeout(tick, delay);
    };
    timer = window.setTimeout(tick, delay);
    return () => window.clearTimeout(timer);
  }, [titles, finalTitle, onDone]);

  return (
    <section className="drumroll" aria-live="polite">
      <p className="drumroll-label">Finding your record</p>
      <p className="drumroll-title" key={shown}>{shown}</p>
    </section>
  );
}
