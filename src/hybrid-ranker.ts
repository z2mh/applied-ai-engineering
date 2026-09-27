export interface RetrievalCandidate {
  id: string;
  vectorScore: number;
  keywordScore: number;
  updatedAt: string;
}
export interface RankedCandidate extends RetrievalCandidate {
  finalScore: number;
  signals: {
    vector: number;
    keyword: number;
    recency: number;
  };
}

export interface RankWeights {
  vector: number;
  keyword: number;
  recency: number;
}

const DEFAULT_WEIGHTS: RankWeights = {
  vector: 0.65,
  keyword: 0.25,
  recency: 0.10,
};

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function normalizeWeights(weights: RankWeights): RankWeights {
  const values = [weights.vector, weights.keyword, weights.recency];
  if (values.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error("ranking weights must be finite and non-negative");
  }
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total === 0) throw new Error("at least one ranking weight must be positive");
  return {
    vector: weights.vector / total,
    keyword: weights.keyword / total,
    recency: weights.recency / total,
  };
}

function recencyScore(updatedAt: string, now: Date, halfLifeDays: number): number {
  const timestamp = Date.parse(updatedAt);
  if (!Number.isFinite(timestamp)) return 0;
  const ageDays = Math.max(0, (now.getTime() - timestamp) / 86_400_000);
  return Math.pow(0.5, ageDays / halfLifeDays);
}

export function rankCandidates(
  candidates: RetrievalCandidate[],
  options: {
    weights?: RankWeights;
    now?: Date;
    recencyHalfLifeDays?: number;
  } = {},
): RankedCandidate[] {
  const weights = normalizeWeights(options.weights ?? DEFAULT_WEIGHTS);
  const now = options.now ?? new Date();
  const halfLifeDays = options.recencyHalfLifeDays ?? 30;
  if (!Number.isFinite(halfLifeDays) || halfLifeDays <= 0) {
    throw new Error("recencyHalfLifeDays must be positive");
  }

  return candidates
    .map((candidate) => {
      const signals = {
        vector: clamp01(candidate.vectorScore),
        keyword: clamp01(candidate.keywordScore),
        recency: recencyScore(candidate.updatedAt, now, halfLifeDays),
      };
      const finalScore =
        signals.vector * weights.vector +
        signals.keyword * weights.keyword +
        signals.recency * weights.recency;
      return { ...candidate, finalScore, signals };
    })
    .sort((a, b) => b.finalScore - a.finalScore || a.id.localeCompare(b.id));
}

