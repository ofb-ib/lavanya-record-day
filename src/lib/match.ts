import recordsJson from "../data/records.json";
import { KIT_ON_TABLE } from "../data/kit";
import type { Answers, Bravery, WorldRecord } from "./types";
import { HOBBY_OPTIONS, QUIZ_OPTIONS, VIBE_OPTIONS, labelFor } from "./questions";
import { trickTags } from "./partyTrick";

const ALL = recordsJson as WorldRecord[];
const KIT = new Set(KIT_ON_TABLE);

export const IN_PLAY: WorldRecord[] = ALL.filter(
  (r) => r.recordValue !== null && r.gwrUrl !== null && r.kit.every((k) => KIT.has(k)),
);

const BANDS: Record<Bravery, [number, number]> = {
  safe: [1, 2],
  challenge: [3, 3],
  moonshot: [4, 4],
};

function score(r: WorldRecord, a: Answers, tags: string[]): number {
  let s = 0;
  if (a.vibe && r.vibes.includes(a.vibe)) s += 3;
  if (a.quiz && r.talents.includes(a.quiz)) s += 2;
  s += 2 * Math.min(2, a.hobbies.filter((h) => r.talents.includes(h)).length);
  s += 2 * Math.min(2, tags.filter((t) => r.talents.includes(t)).length);
  // Teams: prefer records sized for the crew that's actually here.
  if (a.format === "team") {
    const size = 1 + a.crew.length;
    if (r.teamSize === null || r.teamSize === size) s += 3;
    else if (r.teamSize > size) s -= Math.min(4, r.teamSize - size);
    else s -= 1;
  }
  if (a.bravery) {
    const [lo, hi] = BANDS[a.bravery];
    const d = r.difficulty;
    s += d >= lo && d <= hi ? 3 : -2 * (d < lo ? lo - d : d - hi);
  }
  return s;
}

const CLAIMED_KEY = "lrd-claimed";

function readClaimed(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(CLAIMED_KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

/** Marks a record as taken, so later guests are offered something else. */
export function claimRecord(id: string): void {
  const claimed = readClaimed();
  claimed.add(id);
  try {
    localStorage.setItem(CLAIMED_KEY, JSON.stringify([...claimed]));
  } catch {
    // Private mode: nothing is remembered.
  }
}

/** Records in play, best match first. Ties are shuffled once per call. */
export function rankRecords(a: Answers): WorldRecord[] {
  const claimed = readClaimed();
  const open = IN_PLAY.filter((r) => !claimed.has(r.id));
  const available = open.length ? open : IN_PLAY;
  const byFormat = available.filter((r) => r.format === a.format);
  const pool = byFormat.length ? byFormat : available;
  const tags = trickTags(a.trick);
  return pool
    .map((r) => ({ r, s: score(r, a, tags), tie: Math.random() }))
    .sort((x, y) => y.s - x.s || x.tie - y.tie)
    .map((x) => x.r);
}

/** The reasons shown under "Picked for you because:". */
export function matchedReasons(r: WorldRecord, a: Answers): string {
  const reasons: string[] = [];
  if (a.quiz && r.talents.includes(a.quiz)) reasons.push(labelFor(QUIZ_OPTIONS, a.quiz));
  for (const h of a.hobbies) if (r.talents.includes(h)) reasons.push(labelFor(HOBBY_OPTIONS, h));
  if (trickTags(a.trick).some((t) => r.talents.includes(t))) reasons.push("your party trick");
  if (reasons.length) return reasons.join(", ");
  return `you wanted ${labelFor(VIBE_OPTIONS, a.vibe).toLowerCase()}`;
}
