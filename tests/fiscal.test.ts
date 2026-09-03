import { describe, expect, it } from "vitest";
import { pulseRequestSchema } from "../src/contracts.js";
import { buildResolutionCandidate, diagnoseCase, findInvoice } from "../src/domain/fiscal.js";

const request = pulseRequestSchema.parse({
  business: "Metalúrgica Serra Alta",
  fornecedores: [
    { id: "forn-1", name: "Robô de Cobrança", po: { total: 100_000 } },
  ],
  invoices: [
    {
      id: "nf-ok",
      description: "Automação mensal",
      amount: 20_000,
      issueDate: "2026-08-01",
      status: "reconciled",
      reason: "Conferida.",
      areaId: "automacao",
      fornecedorId: "forn-1",
      approvalStatus: "aprovada",
      paymentStatus: "paga",
    },
    {
      id: "nf-mismatch",
      description: "Expansão Robô de Cobrança",
      amount: 62_000,
      expectedAmount: 55_000,
      issueDate: "2026-08-22",
      status: "mismatch",
      reason: "Valor emitido difere do acordado.",
      areaId: "automacao",
      fornecedorId: "forn-1",
      approvalStatus: "aguardando_aprovacao",
      paymentStatus: "nao_aplicavel",
    },
    {
      id: "nf-error",
      description: "Documento ilegível",
      amount: 1_000,
      issueDate: "2026-09-01",
      status: "error",
      reason: "Falha ao validar a chave.",
      areaId: "automacao",
      fornecedorId: "forn-1",
      approvalStatus: "aguardando_aprovacao",
      paymentStatus: "nao_aplicavel",
    },
  ],
  messages: [{ role: "user", content: "Por que a Expansão Robô de Cobrança divergiu?" }],
});

describe("fiscal diagnosis", () => {
  it("prioritizes read errors before financial mismatches", () => {
    const diagnosis = diagnoseCase(request);
    expect(diagnosis.topIssue?.id).toBe("nf-error");
    expect(diagnosis.totalAmount).toBe(83_000);
    expect(diagnosis.consumptionRatio).toBe(0.83);
  });

  it("finds an invoice by meaningful description words", () => {
    expect(findInvoice("expansao robo cobranca", request.invoices)?.id).toBe("nf-mismatch");
    expect(findInvoice("Quero revisar a nf-error", request.invoices)?.id).toBe("nf-error");
    expect(findInvoice("Quanto consumimos da OC?", request.invoices)).toBeNull();
  });

  it("uses the expected amount when preparing a correction", () => {
    const candidate = buildResolutionCandidate(
      { invoiceId: "nf-mismatch", intent: "correct_mismatch" },
      request.invoices,
    );
    expect(candidate.action).toEqual({
      type: "correct_mismatch",
      invoiceId: "nf-mismatch",
      correctedAmount: 55_000,
    });
    expect(candidate.requiresConfirmation).toBe(true);
  });
});
