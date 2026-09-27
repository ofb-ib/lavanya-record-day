export type Format = "solo" | "pair" | "team";
export type Measure = "most" | "fastest" | "longest";
export type Bravery = "safe" | "challenge" | "moonshot";

export interface WorldRecord {
  id: string;
  title: string;
  format: Format;
  teamSize: number | null;
  measure: Measure;
  attemptSeconds: number | null;
  recordValue: number | null;
  unit: string;
  holder: string;
  year: number | null;
  gwrUrl: string | null;
  verified: boolean;
  difficulty: 1 | 2 | 3 | 4;
  vibes: string[];
  talents: string[];
  kit: string[];
  kitCostGbp: number;
  space: string;
  howItWorks: string;
  rules: string[];
}

export interface Answers {
  format: Format | null;
  vibe: string | null;
  quiz: string | null;
  hobbies: string[];
  trick: string;
  bravery: Bravery | null;
}

export const emptyAnswers: Answers = {
  format: null,
  vibe: null,
  quiz: null,
  hobbies: [],
  trick: "",
  bravery: null,
};
