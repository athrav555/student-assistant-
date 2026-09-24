"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import type { Flashcard } from "@/lib/types";

interface FlashcardsViewProps {
  flashcards: Flashcard[];
}

export default function FlashcardsView({ flashcards }: FlashcardsViewProps) {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (flashcards.length === 0) {
    return <p className="text-ink-soft">No flashcards were generated for this document.</p>;
  }

  const card = flashcards[index];

  function go(delta: number) {
    setIsFlipped(false);
    setIndex((current) => (current + delta + flashcards.length) % flashcards.length);
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flip-scene h-72 w-full max-w-lg">
        <button
          type="button"
          onClick={() => setIsFlipped((f) => !f)}
          aria-label={isFlipped ? "Show question side" : "Show answer side"}
          className={`flip-card h-full w-full text-left ${isFlipped ? "is-flipped" : ""}`}
        >
          {/* Front */}
          <div className="flip-face rule-line absolute inset-0 flex flex-col rounded-sm border border-line bg-surface p-6 shadow-sm">
            <div className="h-1.5 w-12 rounded-full bg-brick/80" />
            <div className="flex flex-1 items-center justify-center px-2 text-center">
              <p className="font-display text-xl text-ink">{card.front}</p>
            </div>
            <p className="flex items-center justify-center gap-1.5 text-xs text-ink-soft">
              <RotateCw className="h-3.5 w-3.5" /> Click to flip
            </p>
          </div>

          {/* Back */}
          <div className="flip-face flip-face-back rule-line absolute inset-0 flex flex-col rounded-sm border border-line bg-surface p-6 shadow-sm">
            <div className="h-1.5 w-12 rounded-full bg-brass" />
            <div className="flex flex-1 items-center justify-center overflow-y-auto px-2 text-center">
              <p className="leading-relaxed text-ink">{card.back}</p>
            </div>
            <p className="flex items-center justify-center gap-1.5 text-xs text-ink-soft">
              <RotateCw className="h-3.5 w-3.5" /> Click to flip back
            </p>
          </div>
        </button>
      </div>

      <div className="mt-6 flex items-center gap-6">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous card"
          className="rounded-full border border-line bg-surface p-2.5 text-ink transition-colors hover:border-forest hover:text-forest"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="min-w-[4rem] text-center text-sm text-ink-soft">
          {index + 1} / {flashcards.length}
        </span>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next card"
          className="rounded-full border border-line bg-surface p-2.5 text-ink transition-colors hover:border-forest hover:text-forest"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
