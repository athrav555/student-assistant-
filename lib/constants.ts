/**
 * Central place for the "knobs" you're most likely to want to turn.
 */

// Anthropic model used to generate study materials.
// "claude-sonnet-5" is Anthropic's current best balance of speed, cost and
// intelligence at time of writing. For gnarlier/longer documents you can
// swap in a higher-reasoning model; for lower cost/latency swap in a
// Haiku-class model. Full current lineup + IDs:
// https://docs.claude.com/en/docs/about-claude/models/overview
export const CLAUDE_MODEL = "claude-sonnet-5";

// Max tokens Claude is allowed to generate for one document's study pack.
// Notes + ~12 flashcards + ~6 quiz questions comfortably fits in this.
export const MAX_OUTPUT_TOKENS = 8192;

// Reject uploads above this size before doing any work.
// Most serverless hosts (Vercel included) cap request bodies around 4.5 MB
// on free/hobby tiers, so we stay safely under that. Raise this only if
// your hosting plan supports larger request bodies — see the README.
export const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB

// Extracted text is truncated to this many characters before being sent to
// Claude, to keep cost and latency predictable for very large PDFs.
export const MAX_EXTRACT_CHARS = 100_000; // ~100k chars ≈ 25k tokens

// Below this many extracted characters, we assume text extraction failed
// (e.g. a scanned/image-only PDF with no real text layer) and stop early
// rather than sending near-empty content to the model.
export const MIN_EXTRACT_CHARS = 200;
