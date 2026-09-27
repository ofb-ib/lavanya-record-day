// Turns a free-text party trick into talent tags with plain keyword matching.
// Each keyword matches the start of a word ("sing" matches "singing", not "using").
// Keywords ending in "$" must match a whole word.

const RULES: [string[], string][] = [
  [["juggl", "catch", "throw", "grape", "popcorn"], "circus-juggling"],
  [["cartwheel", "handstand", "flip", "splits", "press-up", "push-up", "backflip"], "gym-fitness"],
  [["danc", "moonwalk", "worm", "breakdanc"], "dance"],
  [["sing", "beatbox", "whistl"], "singing"],
  [["piano", "guitar", "drum", "instrument", "ukulele"], "music-playing"],
  [["impression", "accent", "act$", "acting", "mime"], "drama"],
  [["draw", "origami", "fold", "knit", "craft"], "crafts"],
  [["rubik", "cube", "puzzle", "crossword"], "puzzles"],
  [["capital", "flag", "countr", "map$"], "geography"],
  [["memor", "digits", "pi$", "times table", "maths"], "numbers"],
  [["spell", "backwards", "alphabet", "tongue twister", "word$", "words$"], "words"],
  [["card trick", "magic", "chess", "board game"], "board-games"],
  [["football", "keepy", "rugby", "basketball", "netball", "hockey"], "team-sports"],
  [["tennis", "badminton", "squash", "ping pong", "table tennis"], "racket-sports"],
  [["balanc", "yoga", "bendy", "flexib"], "yoga-pilates"],
  [["karate", "kick", "punch", "judo", "taekwondo", "boxing"], "martial-arts"],
  [["run$", "running", "sprint"], "running"],
  [["climb"], "climbing"],
  [["bake", "baking", "cook"], "baking-cooking"],
  [["game$", "games$", "gamer", "gaming", "controller"], "gaming"],
  [["quiz", "trivia", "fact$", "facts$"], "general-knowledge"],
  [["song", "lyric"], "music"],
  [["film quote", "movie", "film$"], "film-tv"],
];

function escape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const MATCHERS = RULES.map(([words, tag]) => {
  const parts = words.map((w) => (w.endsWith("$") ? `\\b${escape(w.slice(0, -1))}\\b` : `\\b${escape(w)}`));
  return { tag, re: new RegExp(parts.join("|"), "i") };
});

export function trickTags(trick: string): string[] {
  const text = trick.trim();
  if (!text) return [];
  return MATCHERS.filter((m) => m.re.test(text)).map((m) => m.tag);
}
