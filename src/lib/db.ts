// Stores record ideas guests submit at the party.
// With VITE_SUPABASE_URL and VITE_SUPABASE_KEY set, every phone writes to one shared Supabase table.
// Without them, ideas are kept on this phone only.

export interface RecordIdea {
  id?: number;
  created_at?: string;
  guest_name: string;
  title: string;
  measure: "most" | "fastest" | "longest";
  unit: string;
  time_limit_seconds: number | null;
  target: number | null;
  description: string;
}

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.VITE_SUPABASE_KEY as string | undefined;
const TABLE = "record_ideas";
const LOCAL_KEY = "lrd-record-ideas";

export const sharedDb = Boolean(URL && KEY);

function headers(): HeadersInit {
  return { apikey: KEY!, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
}

function readLocal(): RecordIdea[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]") as RecordIdea[];
  } catch {
    return [];
  }
}

export async function submitIdea(idea: RecordIdea): Promise<void> {
  if (sharedDb) {
    const res = await fetch(`${URL}/rest/v1/${TABLE}`, {
      method: "POST",
      headers: { ...headers(), Prefer: "return=minimal" },
      body: JSON.stringify(idea),
    });
    if (!res.ok) throw new Error(`Save failed (${res.status})`);
    return;
  }
  const list = [{ ...idea, id: Date.now(), created_at: new Date().toISOString() }, ...readLocal()];
  localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
}

export async function listIdeas(): Promise<RecordIdea[]> {
  if (sharedDb) {
    const res = await fetch(`${URL}/rest/v1/${TABLE}?select=*&order=created_at.desc&limit=100`, { headers: headers() });
    if (!res.ok) throw new Error(`Load failed (${res.status})`);
    return (await res.json()) as RecordIdea[];
  }
  return readLocal();
}
