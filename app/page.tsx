"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import UploadZone from "@/components/UploadZone";
import ResultsPanel from "@/components/ResultsPanel";
import type { GenerateMeta, GenerateResponse, StudyMaterial } from "@/lib/types";

type Status = "idle" | "loading" | "success" | "error";

// Purely cosmetic — the API call is a single request/response, so these
// messages advance on a timer to narrate what's *probably* happening on the
// server, rather than tracking real progress.
const LOADING_STAGES = [
  "Uploading your PDF…",
  "Extracting text from the document…",
  "Generating notes, flashcards & quiz…",
];

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [stage, setStage] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<StudyMaterial | null>(null);
  const [meta, setMeta] = useState<GenerateMeta | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  async function handleFile(file: File) {
    setStatus("loading");
    setErrorMessage(null);
    setStage(0);
    timers.current.push(setTimeout(() => setStage(1), 1200));
    timers.current.push(setTimeout(() => setStage(2), 4000));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/generate", { method: "POST", body: formData });
      const json: GenerateResponse = await res.json();

      if (!json.success) {
        throw new Error(json.error);
      }

      setResult(json.data);
      setMeta(json.meta);
      setStatus("success");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setStatus("error");
    } finally {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    }
  }

  function handleValidationError(message: string) {
    setErrorMessage(message);
    setStatus("error");
  }

  function reset() {
    setStatus("idle");
    setResult(null);
    setMeta(null);
    setErrorMessage(null);
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16 sm:py-20">
      <header className="mb-12">
        <h1 className="font-display text-3xl font-semibold text-forest">Studyfold</h1>
        <p className="mt-2 max-w-md text-ink-soft">
          Upload a PDF — a chapter, a lecture handout, an article — and get study notes,
          flashcards, and a practice quiz built from it.
        </p>
      </header>

      {status === "success" && result && meta ? (
        <ResultsPanel data={result} meta={meta} onReset={reset} />
      ) : status === "loading" ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-sm border border-line bg-surface px-8 py-20 text-center">
          <Loader2 className="h-7 w-7 animate-spin text-forest" />
          <p className="font-medium text-ink">{LOADING_STAGES[stage]}</p>
          <p className="text-sm text-ink-soft">This can take up to a minute for longer documents.</p>
        </div>
      ) : (
        <div>
          {status === "error" && errorMessage && (
            <div className="mb-5 flex items-start gap-3 rounded-sm border border-brick/30 bg-brick/10 px-4 py-3 text-sm text-brick">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{errorMessage}</p>
            </div>
          )}
          <UploadZone onFileSelected={handleFile} onError={handleValidationError} />
        </div>
      )}
    </main>
  );
}
