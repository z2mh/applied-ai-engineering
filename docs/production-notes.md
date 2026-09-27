# Production notes

The sample code covers deterministic processing only. A production retrieval system should add the following boundaries.

## Ingestion

- Validate file type, size and ownership before parsing.
- Store original files outside the model request path.
- Use idempotent jobs so retries do not duplicate chunks or spend.
- Record parser version, embedding model and chunking configuration with every index.
- Keep failed items inspectable and retryable.

## Retrieval

- Filter by user, workspace and document permissions before ranking.
- Log query, candidate IDs, scores, selected context and latency with appropriate privacy controls.
- Evaluate on representative Arabic, English and mixed-language questions.
- Define explicit behavior when retrieval returns no useful evidence.

## Generation

- Require source-grounded answers when the workflow calls for factual retrieval.
- Validate structured output against a schema.
- Add timeouts, bounded retries, provider fallbacks and per-user rate/spend limits.
- Keep a human-review step for financial, legal or otherwise consequential actions.

## Evaluation

- Unit-test tokenization, chunk boundaries and ranking independently from model calls.
- Maintain a small labeled retrieval set and track recall at K.
- Review answer faithfulness against retrieved sources.
- Measure user outcomes such as successful task completion, repeated use and correction rate.
