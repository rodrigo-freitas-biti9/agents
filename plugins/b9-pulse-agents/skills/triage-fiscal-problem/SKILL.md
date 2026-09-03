---
name: triage-fiscal-problem
description: Classify a Brazilian invoice, tax, purchase-order, approval, supplier, or fiscal-integration complaint into the B9 Pulse catalog of 100 recurring problems and select the right specialist. Use when a customer describes a fiscal pain, asks who should handle it, or needs a fast first response.
---

# Triage Fiscal Problem

Start the five-minute case clock when the customer describes a concrete incident.

1. Call `triage_fiscal_problem` with the customer's own wording before choosing a specialist.
2. Read the top matches, confidence, safe next action, and source IDs. Treat the ranking as product prioritization, not a universal statistical ranking.
3. If the top match conflicts with the case data, prefer verified evidence and state the corrected classification.
4. Route to exactly one primary specialist. Keep other matches as secondary hypotheses rather than starting parallel mutations.
5. Return the problem ID, plain-language diagnosis, evidence already available, missing fields, recommended owner, and next action.
6. Continue automatically for read-only checks. Obtain explicit human confirmation immediately before approval, rejection, payment, correction, discard, or any production mutation.
7. Do not expand the case into general cash-flow management.

For specialist boundaries, read [references/specialists.md](references/specialists.md).

