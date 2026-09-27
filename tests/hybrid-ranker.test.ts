import assert from "node:assert/strict";
import test from "node:test";

import { rankCandidates } from "../src/hybrid-ranker.ts";

const now = new Date("2026-09-28T00:00:00Z");

test("vector relevance dominates with default weights", () => {
  const ranked = rankCandidates(
    [
      { id: "semantic", vectorScore: 0.95, keywordScore: 0.1, updatedAt: "2026-08-28T00:00:00Z" },
      { id: "literal", vectorScore: 0.5, keywordScore: 1, updatedAt: "2026-08-28T00:00:00Z" },
    ],
    { now },
  );
  assert.equal(ranked[0].id, "semantic");
});
test("recency breaks otherwise equal scores", () => {
  const ranked = rankCandidates(
    [
      { id: "old", vectorScore: 0.8, keywordScore: 0.8, updatedAt: "2025-09-28T00:00:00Z" },
      { id: "new", vectorScore: 0.8, keywordScore: 0.8, updatedAt: "2026-09-27T00:00:00Z" },
    ],
    { now },
  );
  assert.equal(ranked[0].id, "new");
});

test("ties are deterministic", () => {
  const ranked = rankCandidates(
    [
      { id: "b", vectorScore: 0.5, keywordScore: 0.5, updatedAt: "invalid" },
      { id: "a", vectorScore: 0.5, keywordScore: 0.5, updatedAt: "invalid" },
    ],
    { now },
  );
  assert.deepEqual(ranked.map(({ id }) => id), ["a", "b"]);
});

