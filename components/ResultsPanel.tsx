"use client";

import { useState } from "react";
import { BookOpen, Layers, ListChecks, RotateCcw } from "lucide-react";
import type { GenerateMeta, StudyMaterial } from "@/lib/types";
import NotesView from "./NotesView";
import FlashcardsView from "./FlashcardsView";
import QuizView from "./QuizView";

interface ResultsPanelProps {
  data: StudyMaterial;
  meta: GenerateMeta;
  onReset: () => void;
}

const TABS = [
  { id: "notes", label: "Notes", icon: BookOpen },
  { id: "flashcards", label: "Flashcards", icon: Layers },
  { id: "quiz", label: "Quiz", icon: ListChecks },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ResultsPanel({ data, meta, onReset }: ResultsPanelProps) {
  const [tab, setTab] = useState<TabId>("notes");

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-ink-soft">
          Studied <span className="text-ink">{meta.fileName}</span> · {meta.pageCount}{" "}
          {meta.pageCount === 1 ? "page" : "pages"}
          {meta.truncated ? " (first portion only — document was long)" : ""}
        </p>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-forest"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Upload another PDF
        </button>
      </div>

      {/* Folder tabs */}
      <div className="mt-6 flex gap-1.5">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`folder-tab relative z-0 flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "z-10 bg-surface text-forest"
                  : "bg-line/50 text-ink-soft hover:bg-line/80"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>

      {/* Panel content, visually "inside" the active folder tab */}
      <div className="rounded-b-sm rounded-tr-sm border border-line bg-surface p-6 sm:p-8">
        {tab === "notes" && <NotesView notes={data.notes} />}
        {tab === "flashcards" && <FlashcardsView flashcards={data.flashcards} />}
        {tab === "quiz" && <QuizView quiz={data.quiz} />}
      </div>
    </div>
  );
}
