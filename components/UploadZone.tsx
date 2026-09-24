"use client";

import { useCallback, useRef, useState } from "react";
import { FileText, UploadCloud } from "lucide-react";
import { MAX_FILE_SIZE_BYTES } from "@/lib/constants";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}

const MAX_SIZE_MB = (MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(1);

export default function UploadZone({ onFileSelected, onError, disabled }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSend = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      if (!isPdf) {
        onError("Please upload a PDF file.");
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        onError(`That file is too large. Please upload a PDF under ${MAX_SIZE_MB} MB.`);
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected, onError]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled) return;
        validateAndSend(e.dataTransfer.files?.[0]);
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) inputRef.current?.click();
      }}
      aria-disabled={disabled}
      className={`group relative flex flex-col items-center justify-center gap-4 rounded-sm border-2 border-dashed px-8 py-16 text-center transition-colors ${
        disabled
          ? "cursor-not-allowed border-line/70 opacity-60"
          : isDragging
            ? "cursor-pointer border-brass bg-brass-soft/30"
            : "cursor-pointer border-line bg-surface hover:border-forest/50"
      }`}
    >
      {/* folded-corner detail, like a loose sheet of paper */}
      <span
        aria-hidden
        className="absolute right-0 top-0 h-6 w-6 bg-paper"
        style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
      />

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        disabled={disabled}
        onChange={(e) => validateAndSend(e.target.files?.[0])}
      />

      <span className="rounded-full bg-forest/10 p-4 text-forest">
        {isDragging ? <FileText className="h-7 w-7" /> : <UploadCloud className="h-7 w-7" />}
      </span>

      <div>
        <p className="font-medium text-ink">
          {isDragging ? "Drop it right here" : "Drag a PDF here, or click to choose one"}
        </p>
        <p className="mt-1 text-sm text-ink-soft">Lecture notes, textbook chapters, articles — up to {MAX_SIZE_MB} MB.</p>
      </div>
    </div>
  );
}
