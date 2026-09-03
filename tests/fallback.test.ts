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

  it("returns an actionable catalog answer without an OpenAI key", () => {
    const request = pulseRequestSchema.parse({
      business: "Padaria Horizonte",
      invoices: [],
      messages: [{ role: "user", content: "A nota voltou com NCM inexistente" }],
    });

    const output = deterministicAnswer(request);
    expect(output.reply).toContain("FP-013");
    expect(output.reply).toContain("NCM inexistente");
    expect(output.status).toBe("needs_data");
  });

  it("does not confuse a missing purchase order with a consumption query", () => {
    const request = pulseRequestSchema.parse({
      business: "Padaria Horizonte",
      invoices: [],
      messages: [{ role: "user", content: "Recebemos uma nota sem OC" }],
    });

    const output = deterministicAnswer(request);
    expect(output.reply).toContain("FP-006");
    expect(output.reply).toContain("Nota sem ordem de compra");
  });
});
