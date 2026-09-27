import assert from "node:assert/strict";
import test from "node:test";

import { chunkDocument, tokenize } from "../src/chunk-document.ts";

test("tokenizer preserves Arabic and English words", () => {
  assert.deepEqual(tokenize("ملخص الدرس: vector search 2026"), [
    "ملخص",
    "الدرس",
    "vector",
    "search",
    "2026",
  ]);
});
test("chunker creates stable overlapping chunks", () => {
  const text = Array.from({ length: 40 }, (_, index) => `token${index}`).join(" ");
  const input = { documentId: "doc-1", text, language: "mixed" as const };
  const first = chunkDocument(input, { targetTokens: 16, overlapTokens: 4 });
  const second = chunkDocument(input, { targetTokens: 16, overlapTokens: 4 });

  assert.equal(first.length, 3);
  assert.equal(first[0].tokenCount, 16);
  assert.equal(first[1].text.split(" ")[0], "token12");
  assert.deepEqual(first, second);
});

test("chunker rejects an invalid overlap", () => {
  assert.throws(
    () => chunkDocument({ documentId: "doc", text: "enough text" }, { targetTokens: 16, overlapTokens: 16 }),
    /overlapTokens/,
  );
});

