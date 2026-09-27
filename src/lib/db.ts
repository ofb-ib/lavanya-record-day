// Stores the records guests add at the party.
// With VITE_SUPABASE_URL and VITE_SUPABASE_KEY set, every phone writes to one shared Supabase table.
// Without them, entries are kept on this phone only.

export interface AddedRecord {
  id?: number;
  created_at?: string;
  guest_name: string;
  title: string;
  requirements: string;
}

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.VITE_SUPABASE_KEY as string | undefined;
const TABLE = "record_ideas";
const LOCAL_KEY = "lrd-added-records";

const sharedDb = Boolean(URL && KEY);

function headers(): HeadersInit {
  return { apikey: KEY!, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
}

function readLocal(): AddedRecord[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]") as AddedRecord[];
  } catch {
    return [];
  }
}

export async function addRecord(entry: AddedRecord): Promise<void> {
  if (sharedDb) {
    const res = await fetch(`${URL}/rest/v1/${TABLE}`, {
      method: "POST",
      headers: { ...headers(), Prefer: "return=minimal" },
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error(`Save failed (${res.status})`);
    return;
  }
  const list = [{ ...entry, id: Date.now(), created_at: new Date().toISOString() }, ...readLocal()];
  localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
}

// ---------- Balloon pop challenge leaderboard ----------

export type Device = "mobile" | "laptop";

/** Touch screens get the phone board; mouse and trackpad get the laptop board. */
export const THIS_DEVICE: Device = window.matchMedia("(pointer: coarse)").matches ? "mobile" : "laptop";

export interface BalloonScore {
  id?: number;
  name: string;
  score: number;
  device: Device;
}

const SCORES_TABLE = "balloon_scores";
const LOCAL_SCORES_KEY = "lrd-balloon-scores";

function readLocalScores(): BalloonScore[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_SCORES_KEY) ?? "[]") as BalloonScore[];
  } catch {
    return [];
  }
}

export async function topScores(device: Device, limit = 3): Promise<BalloonScore[]> {
  if (sharedDb) {
    const res = await fetch(`${URL}/rest/v1/${SCORES_TABLE}?select=id,name,score,device&device=eq.${device}&order=score.desc,created_at.asc&limit=${limit}`, {
      headers: headers(),
    });
    if (!res.ok) throw new Error(`Load failed (${res.status})`);
    return (await res.json()) as BalloonScore[];
  }
  return readLocalScores().filter((x) => x.device === device).sort((a, b) => b.score - a.score).slice(0, limit);
}

export async function addScore(entry: BalloonScore): Promise<void> {
  if (sharedDb) {
    const res = await fetch(`${URL}/rest/v1/${SCORES_TABLE}`, {
      method: "POST",
      headers: { ...headers(), Prefer: "return=minimal" },
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error(`Save failed (${res.status})`);
    return;
  }
  try {
    localStorage.setItem(LOCAL_SCORES_KEY, JSON.stringify([...readLocalScores(), entry]));
  } catch {
    // Private mode: nothing is remembered.
  }
}
