import { createHash } from "node:crypto";

export interface DocumentInput {
  documentId: string;
  text: string;
  language?: "ar" | "en" | "mixed";
}
export interface DocumentChunk {
  id: string;
  documentId: string;
  index: number;
  text: string;
  tokenCount: number;
  language: "ar" | "en" | "mixed";
}

export interface ChunkOptions {
  targetTokens?: number;
  overlapTokens?: number;
}

const TOKEN_PATTERN = /[\p{L}\p{N}]+(?:['’_-][\p{L}\p{N}]+)*/gu;

export function tokenize(text: string): string[] {
  return text.normalize("NFKC").match(TOKEN_PATTERN) ?? [];
}

function stableId(documentId: string, index: number, text: string): string {
  const digest = createHash("sha256")
    .update(`${documentId}\u0000${index}\u0000${text}`)
    .digest("hex")
    .slice(0, 16);
  return `${documentId}:${index}:${digest}`;
}

export function chunkDocument(
  input: DocumentInput,
  options: ChunkOptions = {},
): DocumentChunk[] {
  const targetTokens = options.targetTokens ?? 320;
  const overlapTokens = options.overlapTokens ?? 40;

  if (!input.documentId.trim()) throw new Error("documentId is required");
  if (targetTokens < 16) throw new Error("targetTokens must be at least 16");
  if (overlapTokens < 0 || overlapTokens >= targetTokens) {
    throw new Error("overlapTokens must be between 0 and targetTokens - 1");
  }

  const tokens = tokenize(input.text);
  if (tokens.length === 0) return [];

  const step = targetTokens - overlapTokens;
  const language = input.language ?? "mixed";
  const chunks: DocumentChunk[] = [];

  for (let start = 0, index = 0; start < tokens.length; start += step, index += 1) {
    const slice = tokens.slice(start, start + targetTokens);
    const text = slice.join(" ");
    chunks.push({
      id: stableId(input.documentId, index, text),
      documentId: input.documentId,
      index,
      text,
      tokenCount: slice.length,
      language,
    });
    if (start + targetTokens >= tokens.length) break;
  }

  return chunks;
}

