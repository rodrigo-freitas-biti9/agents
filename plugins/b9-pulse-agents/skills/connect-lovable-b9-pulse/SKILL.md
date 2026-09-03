---
name: connect-lovable-b9-pulse
description: Connect or update the B9 Pulse Lovable frontend against the Biti9 agent API while preserving demo fallback and Lovable project history. Use for B9 Pulse chat endpoint, Lovable Cloud, connector, preview, and release work.
---

# Connect Lovable B9 Pulse

Use this workflow for the Lovable project recorded in [references/project.md](references/project.md).

1. Read the project and relevant files before requesting a Lovable edit. Check the latest commit so concurrent changes are visible.
2. Keep the frontend contract compatible with `POST /api/public/pulse-chat`: send business, suppliers, invoices, messages, and optional case ID; accept reply, optional action, status, evidence, and SLA.
3. Configure the published agent URL through `VITE_B9_PULSE_AGENT_URL`. Do not commit a secret to the Lovable project. The browser calls `${VITE_B9_PULSE_AGENT_URL}/api/public/pulse-chat`.
4. Preserve the existing deterministic local fallback for trade-show continuity.
5. Use Lovable Plan mode for broad architecture decisions. A build message consumes Lovable credits, so consolidate a reviewed change into one focused build turn where practical.
6. Never rewrite published Git history. Validate the preview and the production endpoint before reporting the integration complete.

Do not enable a database, publish the app, remix it, change visibility, or add third-party connectors unless the user explicitly requests that action.
