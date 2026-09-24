"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import type { QuizQuestion } from "@/lib/types";

interface QuizViewProps {
  quiz: QuizQuestion[];
}

export default function QuizView({ quiz }: QuizViewProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(() => quiz.map(() => null));
  const [finished, setFinished] = useState(false);

  if (quiz.length === 0) {
    return <p className="text-ink-soft">No quiz questions were generated for this document.</p>;
  }

  if (finished) {
    const score = answers.reduce(
      (total, answer, i) => total + (answer === quiz[i].correctAnswer ? 1 : 0),
      0
    );
    return (
      <div>
        <div className="rounded-sm border border-line bg-surface p-6 text-center">
          <p className="font-display text-3xl text-forest">
            {score} / {quiz.length}
          </p>
          <p className="mt-1 text-ink-soft">
            {score === quiz.length
              ? "Perfect score."
              : score >= quiz.length / 2
                ? "Solid work — review the ones you missed below."
                : "Worth another pass through the notes before you retake this."}
          </p>
          <button
            type="button"
            onClick={() => {
              setAnswers(quiz.map(() => null));
              setIndex(0);
              setFinished(false);
            }}
            className="mt-4 rounded-sm bg-forest px-5 py-2 text-sm font-medium text-paper transition-colors hover:bg-forest-dark"
          >
            Retake quiz
          </button>
        </div>

        <ol className="mt-8 space-y-5">
          {quiz.map((q, i) => {
            const correct = answers[i] === q.correctAnswer;
            return (
              <li key={i} className="border-t border-line pt-5">
                <p className="flex items-start gap-2 font-medium text-ink">
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                      correct ? "bg-forest/15 text-forest" : "bg-brick/15 text-brick"
                    }`}
                  >
                    {correct ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  </span>
                  {q.question}
                </p>
                <p className="mt-2 pl-7 text-sm text-ink-soft">
                  Your answer: <span className="text-ink">{answers[i] ?? "—"}</span>
                </p>
                {!correct && (
                  <p className="pl-7 text-sm text-ink-soft">
                    Correct answer: <span className="text-forest">{q.correctAnswer}</span>
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  const question = quiz[index];
  const selected = answers[index];

  function select(option: string) {
    setAnswers((prev) => prev.map((a, i) => (i === index ? option : a)));
  }

  function next() {
    if (index === quiz.length - 1) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
    }
  }

  return (
    <div>
      {/* progress */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line/70">
          <div
            className="h-full rounded-full bg-brass transition-all"
            style={{ width: `${((index + 1) / quiz.length) * 100}%` }}
          />
        </div>
        <span className="shrink-0 text-xs text-ink-soft">
          {index + 1} / {quiz.length}
        </span>
      </div>

      <p className="font-display text-lg text-ink">{question.question}</p>

      <div className="mt-5 space-y-3">
        {question.options.map((option) => {
          const isSelected = option === selected;
          return (
            <button
              key={option}
              type="button"
              onClick={() => select(option)}
              className={`flex w-full items-center gap-3 rounded-sm border px-4 py-3 text-left transition-colors ${
                isSelected
                  ? "border-forest bg-forest/10"
                  : "border-line bg-surface hover:border-forest/40"
              }`}
            >
              <span
                aria-hidden
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                  isSelected ? "border-forest" : "border-line"
                }`}
              >
                {isSelected && <span className="h-2 w-2 rounded-full bg-forest" />}
              </span>
              <span className="text-ink">{option}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="text-sm text-ink-soft transition-colors hover:text-ink disabled:opacity-0"
        >
          Back
        </button>
        <button
          type="button"
          onClick={next}
          disabled={selected === null}
          className="rounded-sm bg-forest px-5 py-2 text-sm font-medium text-paper transition-colors hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          {index === quiz.length - 1 ? "See results" : "Next"}
        </button>
      </div>
    </div>
  );
}
