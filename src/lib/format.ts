import type { WorldRecord } from "./types";

export const BIRTHDAY_NAME = "Lavanya";

export function displayName(name: string): string {
  return name.trim() || "Mystery guest";
}

/** "Priya", "Priya and Sam", or "Priya, Sam and Leo". */
export function crewName(name: string, crew: string[]): string {
  const all = [displayName(name), ...crew.map((c) => c.trim()).filter(Boolean)];
  if (all.length === 1) return all[0];
  return `${all.slice(0, -1).join(", ")} and ${all[all.length - 1]}`;
}

function tidy(n: number): string {
  return String(Math.round(n * 100) / 100);
}

/** A record value or score with its unit, e.g. "18 balloons" or "39.41 seconds". */
export function formatValue(r: WorldRecord, value: number): string {
  if (r.measure === "most") return `${tidy(value)} ${r.unit}`;
  return `${value.toFixed(2)} seconds`;
}

export function formatNumber(r: WorldRecord, value: number): string {
  return r.measure === "most" ? tidy(value) : value.toFixed(2);
}

export function unitWord(r: WorldRecord): string {
  return r.measure === "most" ? r.unit : "seconds";
}

export function holderLine(r: WorldRecord): string {
  return r.year ? `${r.holder}, ${r.year}` : r.holder;
}

export function teamLine(r: WorldRecord): string | null {
  if (r.format === "solo") return null;
  if (r.teamSize === null) return "Any number of people";
  return r.teamSize === 2 ? "Team of two" : `Team of ${r.teamSize}`;
}

export function peopleNeeded(r: WorldRecord): string | null {
  if (r.format === "solo") return null;
  if (r.teamSize === null) return "Any number of people.";
  return `You need ${r.teamSize} people.`;
}

export const DIFFICULTY_WORDS = ["", "A real chance", "Possible with a good run", "Hard", "Moonshot"];

/** "sticky-notes" -> "Sticky notes", "other:Jenga Giant set" -> "Jenga Giant set". */
export function kitLabel(tag: string): string {
  const text = tag.startsWith("other:") ? tag.slice(6) : tag.replace(/-/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function beats(r: WorldRecord, score: number): boolean {
  const target = r.recordValue ?? 0;
  return r.measure === "fastest" ? score > 0 && score < target : score > target;
}

/** How far short of the record, in the record's own unit. */
export function gap(r: WorldRecord, score: number): number {
  const target = r.recordValue ?? 0;
  return Math.abs(target - score);
}
