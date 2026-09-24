import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
// Must be imported before "pdf-parse" itself — this is pdf-parse's documented
// fix for "Setting up fake worker failed" under bundlers like Next.js's
// Turbopack/Webpack, which can't resolve pdf.js's worker file dynamically.
// See: https://github.com/mehmet-kozan/pdf-parse/blob/main/docs/troubleshooting.md
import "pdf-parse/worker";
import { PDFParse } from "pdf-parse";
import {
  CLAUDE_MODEL,
  MAX_EXTRACT_CHARS,
  MAX_FILE_SIZE_BYTES,
  MAX_OUTPUT_TOKENS,
  MIN_EXTRACT_CHARS,
} from "@/lib/constants";
import type { GenerateResponse, StudyMaterial } from "@/lib/types";

// pdf-parse touches Node APIs (Buffer, fs) that don't exist on the Edge
// runtime, so this route must run on Node.
export const runtime = "nodejs";
// Generating notes + flashcards + a quiz from a whole document can take a
// while. Hobby-tier Vercel deployments cap this at 10s by default unless
// you enable Fluid Compute; Pro plans go higher. See the README.
export const maxDuration = 60;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/** Small helper so every error response has the same JSON shape. */
function fail(error: string, status: number) {
  return NextResponse.json<GenerateResponse>({ success: false, error }, { status });
}

const SYSTEM_PROMPT = `You are an expert study coach who turns raw document text into study materials for students.

You will be given the extracted text of a student's PDF. Respond with ONE thing only: a single valid JSON object, and nothing else. No markdown code fences, no "Here is the JSON", no commentary before or after — your entire response must be parseable with JSON.parse().

The JSON object must match this exact shape:

{
  "notes": string[],
  "flashcards": [{ "front": string, "back": string }],
  "quiz": [{ "question": string, "options": string[], "correctAnswer": string }]
}

Rules you must follow:
- "notes": 4-8 array entries. Each entry is one section written in Markdown, starting with a "## Heading" line, followed by a concise explanation and/or bullet points covering one key topic from the document. Together the sections should summarize the document's most important concepts a student needs to know.
- "flashcards": 10-15 objects. "front" is a short question or term, "back" is a concise, accurate answer or definition. Cover the most testable concepts.
- "quiz": 5-8 objects. Each has exactly 4 strings in "options", and "correctAnswer" must be an EXACT character-for-character copy of one of those 4 option strings. Vary difficulty and phrasing; avoid "all of the above" style options.
- Base everything strictly on the provided text. Do not invent facts that aren't supported by it. If the text is thin on a topic, keep that section brief rather than fabricating detail.
- Write in clear, plain language aimed at a student encountering this material for the first time.`;

export async function POST(request: NextRequest) {
  // 0. Make sure the server is actually configured before doing any work.
  if (!process.env.ANTHROPIC_API_KEY) {
    return fail(
      "Server is missing an ANTHROPIC_API_KEY. Add it to .env.local (or your host's environment variables) and restart.",
      500
    );
  }

  // 1. Pull the file out of the multipart form data.
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return fail("Could not read the uploaded file. Please try again.", 400);
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return fail("No PDF file was uploaded.", 400);
  }

  const looksLikePdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!looksLikePdf) {
    return fail("Only PDF files are supported.", 400);
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const limitMb = (MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(1);
    return fail(`That PDF is too large. Please upload a file under ${limitMb} MB.`, 413);
  }

  // 2. Extract text from the PDF.
  let extractedText = "";
  let pageCount = 0;
  try {
    const arrayBuffer = await file.arrayBuffer();
    const parser = new PDFParse({ data: Buffer.from(arrayBuffer) });
    try {
      const result = await parser.getText({ pageJoiner: "\n\n" });
      extractedText = result.text.trim();
      pageCount = result.total;
    } finally {
      await parser.destroy();
    }
  } catch (err) {
    console.error("PDF parsing failed:", err);
    return fail(
      "Couldn't read that PDF. It may be corrupted, password-protected, or not a valid PDF file.",
      422
    );
  }

  if (extractedText.length < MIN_EXTRACT_CHARS) {
    return fail(
      "Couldn't find readable text in that PDF. If it's a scanned document or image-only PDF, text extraction won't work — try a PDF with a real text layer.",
      422
    );
  }

  const truncated = extractedText.length > MAX_EXTRACT_CHARS;
  const textForModel = truncated
    ? extractedText.slice(0, MAX_EXTRACT_CHARS)
    : extractedText;

  // 3. Ask Claude to turn the text into notes + flashcards + a quiz.
  //    We "prefill" the assistant's turn with `{` — a standard Anthropic
  //    prompting technique that makes the model continue straight into
  //    JSON instead of adding a preamble, which makes parsing far more
  //    reliable than asking nicely in the system prompt alone.
  let rawJson: string;
  try {
    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Here is the extracted text of the document (from a ${pageCount}-page PDF named "${file.name}"). Generate the study materials JSON now.\n\n---\n${textForModel}\n---`,
        },
        { role: "assistant", content: "{" },
      ],
    });

    if (message.stop_reason === "max_tokens") {
      return fail(
        "The document produced more content than we could generate in one go. Try a shorter PDF, or a shorter excerpt of it.",
        502
      );
    }

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return fail("The AI returned an unexpected response format. Please try again.", 502);
    }

    rawJson = "{" + textBlock.text;
  } catch (err) {
    console.error("Anthropic API call failed:", err);
    if (err instanceof Anthropic.APIError) {
      if (err.status === 401) {
        return fail("Server's Anthropic API key was rejected. Check ANTHROPIC_API_KEY.", 500);
      }
      if (err.status === 429) {
        return fail("Rate limited by the AI provider. Please wait a moment and try again.", 429);
      }
    }
    return fail("Failed to generate study materials from the AI. Please try again.", 502);
  }

  // 4. Parse and validate the JSON before trusting it on the frontend.
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch (err) {
    console.error("Failed to parse AI JSON:", err, rawJson.slice(0, 500));
    return fail("The AI's response wasn't valid JSON. Please try again.", 502);
  }

  const validationError = validateStudyMaterial(parsed);
  if (validationError) {
    console.error("AI JSON failed validation:", validationError, rawJson.slice(0, 500));
    return fail(`The AI's response was malformed (${validationError}). Please try again.`, 502);
  }

  return NextResponse.json<GenerateResponse>({
    success: true,
    data: parsed as StudyMaterial,
    meta: {
      fileName: file.name,
      pageCount,
      extractedChars: extractedText.length,
      truncated,
    },
  });
}

/**
 * Defensive runtime check that the AI actually returned the shape we
 * asked for. Returns a human-readable reason on failure, or null if valid.
 */
function validateStudyMaterial(value: unknown): string | null {
  if (typeof value !== "object" || value === null) return "not an object";
  const obj = value as Record<string, unknown>;

  if (!Array.isArray(obj.notes) || !obj.notes.every((n) => typeof n === "string")) {
    return "notes must be an array of strings";
  }

  if (!Array.isArray(obj.flashcards)) return "flashcards must be an array";
  for (const card of obj.flashcards) {
    if (
      typeof card !== "object" ||
      card === null ||
      typeof (card as { front?: unknown }).front !== "string" ||
      typeof (card as { back?: unknown }).back !== "string"
    ) {
      return "each flashcard needs a front and back string";
    }
  }

  if (!Array.isArray(obj.quiz)) return "quiz must be an array";
  for (const q of obj.quiz) {
    if (typeof q !== "object" || q === null) return "each quiz item must be an object";
    const question = q as {
      question?: unknown;
      options?: unknown;
      correctAnswer?: unknown;
    };
    if (typeof question.question !== "string") return "quiz item missing question text";
    if (
      !Array.isArray(question.options) ||
      question.options.length !== 4 ||
      !question.options.every((o) => typeof o === "string")
    ) {
      return "quiz item must have exactly 4 string options";
    }
    if (
      typeof question.correctAnswer !== "string" ||
      !question.options.includes(question.correctAnswer)
    ) {
      return "quiz item correctAnswer must match one of its options";
    }
  }

  return null;
}
