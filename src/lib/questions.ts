export interface Option {
  value: string;
  label: string;
  hint?: string;
}

export const FORMAT_OPTIONS: Option[] = [
  { value: "solo", label: "Just me", hint: "Solo glory." },
  { value: "pair", label: "Me and a partner", hint: "Grab a buddy." },
  { value: "team", label: "A group of us", hint: "Round up 8 to 12 people." },
];

export const VIBE_OPTIONS: Option[] = [
  { value: "speed", label: "Fast and frantic", hint: "Speed is everything." },
  { value: "precision", label: "Steady hands", hint: "Precision wins." },
  { value: "silly", label: "Silly and giggly", hint: "Laughing allowed." },
  { value: "sporty", label: "Sporty", hint: "Bring your trainers." },
  { value: "brainy", label: "Big brain energy", hint: "Think fast, not run fast." },
];

export const QUIZ_OPTIONS: Option[] = [
  { value: "general-knowledge", label: "General knowledge" },
  { value: "geography", label: "Geography" },
  { value: "history", label: "History" },
  { value: "science", label: "Science and nature" },
  { value: "music", label: "Music" },
  { value: "film-tv", label: "Film and TV" },
  { value: "sport", label: "Sport" },
  { value: "words", label: "Words and spelling" },
  { value: "numbers", label: "Maths and numbers" },
  { value: "art", label: "Art and culture" },
  { value: "none", label: "I'm there for the crisps" },
];

export const HOBBY_OPTIONS: Option[] = [
  { value: "running", label: "Running" },
  { value: "team-sports", label: "Team sports" },
  { value: "racket-sports", label: "Tennis, badminton or squash" },
  { value: "gym-fitness", label: "Gym and fitness" },
  { value: "yoga-pilates", label: "Yoga or pilates" },
  { value: "dance", label: "Dance" },
  { value: "music-playing", label: "Play an instrument" },
  { value: "singing", label: "Singing or choir" },
  { value: "drama", label: "Drama or improv" },
  { value: "crafts", label: "Arts and crafts" },
  { value: "gaming", label: "Gaming" },
  { value: "baking-cooking", label: "Baking or cooking" },
  { value: "puzzles", label: "Puzzles and crosswords" },
  { value: "circus-juggling", label: "Juggling or circus" },
  { value: "climbing", label: "Climbing" },
  { value: "martial-arts", label: "Martial arts" },
  { value: "board-games", label: "Board games" },
  { value: "reading-writing", label: "Reading or writing" },
  { value: "none", label: "Mostly the sofa" },
];

export const BRAVERY_OPTIONS: Option[] = [
  { value: "safe", label: "Safe bet", hint: "We want to win." },
  { value: "challenge", label: "Proper challenge", hint: "We'll give it a real go." },
  { value: "moonshot", label: "Moonshot", hint: "Go big or go home." },
];

export function labelFor(options: Option[], value: string | null): string {
  return options.find((o) => o.value === value)?.label ?? "";
}
