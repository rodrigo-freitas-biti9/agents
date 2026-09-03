# B9 Pulse agent workspace

This repository contains the B9 Pulse fiscal-resolution runtime and its team Codex plugin.

## Product invariant

Move a fiscal case from question to a verified next action in under five minutes. Prefer deterministic data checks before model judgment. Every answer must state the evidence, the next action, and whether human confirmation is still required.

## Safety boundary

- Treat invoice, purchase-order, payment, supplier, and customer data as confidential.
- Never log access tokens, full customer exports, or raw fiscal documents.
- Read-only inspection may run automatically.
- Any mutation of fiscal, payment, approval, or production data requires explicit user confirmation immediately before execution.
- Never mark a case resolved without a verification result.
- Keep the local deterministic fallback working so the trade-show demo is not blocked by a missing external API.

## Repository map

- `src/agents/`: OpenAI Agents SDK orchestration and specialists.
- `src/domain/`: deterministic fiscal diagnosis, SLA, and fallback behavior.
- `src/integrations/`: B9 and ChatGPT Workspace Agent adapters.
- `src/transport/`: HTTP contracts and helpers.
- `plugins/b9-pulse-agents/`: repo-scoped Codex plugin, skills, and MCP configuration.
- `docs/`: architecture, integration ownership, and Lovable handoff.

## Verification

Run `pnpm check`, validate both skills, then validate the plugin before committing. Do not commit secrets or generated dependencies.
