# Applied AI Engineering Patterns

A small, sanitized TypeScript sample showing two deterministic building blocks used around production LLM systems:

1. semantic document chunking with stable metadata;
2. hybrid retrieval ranking that combines vector similarity, keyword overlap and recency.

The code is generalized from patterns used while building Arabic-first products such as Shater and Daftar. It contains no production source, credentials, prompts, user data or vendor-specific configuration.

## Why this repository exists

Model calls are only one part of an AI product. Retrieval quality, stable identifiers, deterministic ranking, validation and testable fallback behavior often decide whether the user experience is reliable. This repository keeps those parts small enough to inspect and run locally.

## Run

Requires Node.js 22 or newer.

```bash
npm test
```

No package installation is required. Node runs the TypeScript files using its built-in type stripping.

## Structure

```text
src/
  chunk-document.ts   # semantic chunking with overlap and stable IDs
  hybrid-ranker.ts    # normalized scoring and deterministic tie-breaking
tests/
  chunk-document.test.ts
  hybrid-ranker.test.ts
docs/
  production-notes.md
```

## Design choices

- Pure functions make the behavior easy to test without calling a model.
- Stable content hashes make retries and caches safe.
- Arabic-aware tokenization keeps Arabic letters and digits instead of treating the text as punctuation.
- Each scoring signal is normalized before weighting.
- Deterministic tie-breaking prevents noisy result ordering.

## Production boundary

In a deployed system, adapters would provide embeddings, storage and telemetry. The pure logic in this sample stays provider-independent. See [production notes](docs/production-notes.md) for the additional controls required around it.

## Author

**Abdulrahman Alsaher** — [GitHub](https://github.com/z2mh) · [LinkedIn](https://www.linkedin.com/in/abdulrahmansh/)

## License

MIT
