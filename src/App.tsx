import { useCallback, useMemo, useState } from "react";
import { emptyAnswers, type Answers, type Bravery, type Format, type WorldRecord } from "./lib/types";
import { BRAVERY_OPTIONS, FORMAT_OPTIONS, HOBBY_OPTIONS, QUIZ_OPTIONS, VIBE_OPTIONS } from "./lib/questions";
import { rankRecords } from "./lib/match";
import { BIRTHDAY_NAME, displayName } from "./lib/format";
import { MultiChoice, SingleChoice } from "./screens/Choice";
import { Drumroll } from "./screens/Drumroll";
import { Reveal } from "./screens/Reveal";
import { Attempt } from "./screens/Attempt";
import { Result } from "./screens/Result";
import { Sky, Trophy } from "./Decor";
import { burst } from "./lib/device";

const QUESTIONS = ["name", "format", "vibe", "quiz", "hobbies", "trick", "bravery"] as const;
type Question = (typeof QUESTIONS)[number];
type Step = "welcome" | Question | "drumroll" | "reveal" | "attempt" | "result";

export default function App() {
  const [step, setStep] = useState<Step>("welcome");
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [ranked, setRanked] = useState<WorldRecord[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);

  const record = ranked[index];
  const set = (patch: Partial<Answers>) => setAnswers((a) => ({ ...a, ...patch }));
  const qIndex = QUESTIONS.indexOf(step as Question);

  function next() {
    setStep(QUESTIONS[qIndex + 1] ?? "drumroll");
  }

  function back() {
    setStep(qIndex > 0 ? QUESTIONS[qIndex - 1] : "welcome");
  }

  function finishQuestions(bravery: Bravery) {
    const final = { ...answers, bravery };
    setAnswers(final);
    setRanked(rankRecords(final));
    setIndex(0);
    setStep("drumroll");
  }

  function another() {
    setIndex((i) => (i + 1) % ranked.length);
    setStep("reveal");
  }

  function nextPerson() {
    setAnswers(emptyAnswers);
    setRanked([]);
    setIndex(0);
    setStep("welcome");
  }

  const drumTitles = useMemo(
    () => ranked.slice(1, 40).map((r) => r.title).sort(() => Math.random() - 0.5),
    [ranked],
  );
  const onDrumDone = useCallback(() => setStep("reveal"), []);

  return (
    <div className="page">
      <Sky />
      <main className="column" key={step}>
        {qIndex >= 0 && (
          <>
            <div className="topbar">
              <button type="button" className="link" onClick={back}>
                Back
              </button>
              <span>
                {qIndex + 1} of {QUESTIONS.length}
              </span>
            </div>
            <div className="progress" aria-hidden="true">
              <i style={{ width: `${((qIndex + 1) / QUESTIONS.length) * 100}%` }} />
            </div>
          </>
        )}

        {step === "welcome" && (
          <section className="stack welcome">
            <Trophy />
            <p className="script">Happy birthday, {BIRTHDAY_NAME}</p>
            <h1 className="display shine">Let's break some world records.</h1>
            <p className="lead">
              Answer a few quick questions and we'll find you a record to try, right here, right now.
            </p>
            <button type="button" className="primary big" onClick={() => {
                burst();
                setStep("name");
              }}>
              Find my record
            </button>
          </section>
        )}

        {step === "name" && (
          <form
            className="stack"
            onSubmit={(e) => {
              e.preventDefault();
              next();
            }}
          >
            <h1>What's your name?</h1>
            <label className="field">
              <span>Name</span>
              <input
                id="name"
                autoComplete="off"
                maxLength={40}
                value={answers.name}
                onChange={(e) => set({ name: e.target.value })}
                placeholder="Your name, or your team's name"
              />
            </label>
            <button type="submit" className="primary">
              Next
            </button>
          </form>
        )}

        {step === "format" && (
          <SingleChoice
            title="Who's going for it?"
            options={FORMAT_OPTIONS}
            value={answers.format}
            onPick={(v) => {
              set({ format: v as Format });
              next();
            }}
          />
        )}

        {step === "vibe" && (
          <SingleChoice
            title="Pick a vibe"
            options={VIBE_OPTIONS}
            value={answers.vibe}
            onPick={(v) => {
              set({ vibe: v });
              next();
            }}
          />
        )}

        {step === "quiz" && (
          <SingleChoice
            title="What are you best at in a pub quiz?"
            options={QUIZ_OPTIONS}
            value={answers.quiz}
            grid
            onPick={(v) => {
              set({ quiz: v });
              next();
            }}
          />
        )}

        {step === "hobbies" && (
          <MultiChoice
            title="What do you get up to outside work?"
            hint="Pick up to three."
            options={HOBBY_OPTIONS}
            values={answers.hobbies}
            max={3}
            onChange={(hobbies) => set({ hobbies })}
            onNext={next}
          />
        )}

        {step === "trick" && (
          <form
            className="stack"
            onSubmit={(e) => {
              e.preventDefault();
              next();
            }}
          >
            <h1>What's your party trick?</h1>
            <label className="field">
              <span>Party trick</span>
              <input
                id="trick"
                autoComplete="off"
                maxLength={120}
                value={answers.trick}
                onChange={(e) => set({ trick: e.target.value })}
                placeholder="e.g. I can do the worm"
              />
            </label>
            <button type="submit" className="primary">
              Next
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                set({ trick: "" });
                next();
              }}
            >
              Skip
            </button>
          </form>
        )}

        {step === "bravery" && (
          <SingleChoice
            title="How brave are we?"
            options={BRAVERY_OPTIONS}
            value={answers.bravery}
            onPick={(v) => finishQuestions(v as Bravery)}
          />
        )}

        {step === "drumroll" && record && (
          <Drumroll titles={drumTitles.length ? drumTitles : [record.title]} finalTitle={record.title} onDone={onDrumDone} />
        )}

        {step === "reveal" && record && (
          <Reveal
            record={record}
            answers={answers}
            onAttempt={() => setStep("attempt")}
            onAnother={another}
            onNextPerson={nextPerson}
          />
        )}

        {step === "attempt" && record && (
          <Attempt
            key={record.id}
            record={record}
            onBack={() => setStep("reveal")}
            onResult={(s) => {
              setScore(s);
              setStep("result");
            }}
          />
        )}

        {step === "result" && record && (
          <Result
            record={record}
            name={displayName(answers.name)}
            score={score}
            onTryAgain={() => setStep("attempt")}
            onAnother={another}
            onNextPerson={nextPerson}
          />
        )}
      </main>
      <footer className="footer">Just for fun. Not affiliated with Guinness World Records.</footer>
    </div>
  );
}
