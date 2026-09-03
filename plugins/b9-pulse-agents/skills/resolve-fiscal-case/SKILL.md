---
name: resolve-fiscal-case
description: Diagnose and drive B9 Pulse invoice and purchase-order incidents to a verified next action within five minutes. Use for fiscal billing, reconciliation, duplicate, mismatch, missing-PO, approval, and payment cases.
---

# Resolve Fiscal Case

Start a five-minute case clock as soon as a concrete customer incident is identified.

1. Read the current fiscal context with B9 Pulse MCP tools before drawing conclusions.
2. Identify the customer, invoice, supplier, purchase order, current status, amount, date, and recorded reason. State which fields are missing rather than inferring them.
3. Prioritize in this order unless customer impact shows otherwise: read/validation error, missing purchase order, amount mismatch, duplicate, purchase-order overrun, pending workflow.
4. Give the customer a plain-language diagnosis, evidence, and the smallest safe next action.
5. Read-only investigation can proceed automatically. Before approval, rejection, payment, value correction, duplicate discard, or any production mutation, obtain explicit confirmation immediately before the action.
6. After a mutation, re-read the record and verify its new state. A proposed action is not a resolved case.
7. If the case cannot be completed before the clock expires, provide the blocker, owner, gathered evidence, and a specific escalation instead of silently continuing.

For status meanings and required evidence, read [references/fiscal-policy.md](references/fiscal-policy.md).
