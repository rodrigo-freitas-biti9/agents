import { describe, expect, it } from "vitest";
import { pulseRequestSchema } from "../src/contracts.js";
import { deterministicAnswer } from "../src/domain/fallback.js";
import { FIVE_MINUTES_MS, getSlaSnapshot } from "../src/domain/sla.js";

describe("trade-show fallback", () => {
  it("keeps answering without an OpenAI key", () => {
    const request = pulseRequestSchema.parse({
      business: "Padaria Horizonte",
      fornecedores: [{ id: "f1", name: "Energia", po: { total: 10_000 } }],
      invoices: [
        {
          id: "nf-1",
          description: "Energia agosto",
          amount: 3_000,
          issueDate: "2026-08-30",
          status: "reconciled",
          reason: "Conferida.",
          areaId: "ops",
          fornecedorId: "f1",
          approvalStatus: "aprovada",
          paymentStatus: "paga",
        },
      ],
      messages: [{ role: "user", content: "Quanto consumimos da OC?" }],
    });

    const output = deterministicAnswer(request);
    expect(output.reply).toContain("R$ 3.000,00");
    expect(output.status).toBe("informational");
  });

  it("marks the five-minute deadline only after the target", () => {
    expect(getSlaSnapshot(1_000, 1_000 + FIVE_MINUTES_MS).breached).toBe(false);
    expect(getSlaSnapshot(1_000, 1_001 + FIVE_MINUTES_MS).breached).toBe(true);
  });
});
