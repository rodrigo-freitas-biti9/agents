import { describe, expect, it } from "vitest";
import { routeFiscalQuestion } from "../src/domain/triage.js";
import { fiscalProblems, fiscalResearchSources } from "../src/knowledge/fiscal-problems.js";

describe("fiscal problem catalog", () => {
  it("contains exactly 100 unique and sequential problems", () => {
    expect(fiscalProblems).toHaveLength(100);
    expect(new Set(fiscalProblems.map((problem) => problem.id)).size).toBe(100);
    expect(fiscalProblems.map((problem) => problem.rank)).toEqual(
      Array.from({ length: 100 }, (_, index) => index + 1),
    );
  });

  it("keeps every problem actionable and traceable", () => {
    for (const problem of fiscalProblems) {
      expect(problem.keywords.length).toBeGreaterThan(0);
      expect(problem.nextAction.length).toBeGreaterThan(20);
      expect(problem.sourceIds.length).toBeGreaterThan(0);
      expect(problem.sourceIds.every((sourceId) => sourceId in fiscalResearchSources)).toBe(true);
      expect(problem.title.toLocaleLowerCase("pt-BR")).not.toContain("fluxo de caixa");
    }
  });
});

describe("deterministic specialist routing", () => {
  const cases = [
    ["A nota voltou com NCM inexistente, rejeição 778", "FP-013", "tax_validation"],
    ["Recebemos uma nota sem OC", "FP-006", "po_reconciliation"],
    ["O aprovador não responde e a nota está parada", "FP-007", "approval_workflow"],
    ["Perdemos o prazo e precisamos de cancelamento extemporâneo", "FP-082", "document_lifecycle"],
    ["O fornecedor mudou a conta bancária por e-mail", "FP-093", "supplier_risk"],
    ["O XML não foi recebido", "FP-009", "intake_capture"],
    ["Os campos de IBS/CBS estão ausentes", "FP-099", "integration_compliance"],
    ["Preciso acompanhar o ciclo de vida das notas", "FP-008", "monitoring_insights"],
  ] as const;

  it.each(cases)("routes %s", (question, problemId, specialist) => {
    const triage = routeFiscalQuestion(question);
    expect(triage.matches[0]?.problem.id).toBe(problemId);
    expect(triage.specialist).toBe(specialist);
    expect(triage.confidence).toBeGreaterThanOrEqual(0.6);
  });

  it("uses monitoring for an unknown question", () => {
    const triage = routeFiscalQuestion("Olá, pode me ajudar?");
    expect(triage.specialist).toBe("monitoring_insights");
    expect(triage.matches).toEqual([]);
  });

  it("routes locally within the five-minute product target", () => {
    const startedAt = performance.now();
    for (let index = 0; index < 1_000; index += 1) {
      routeFiscalQuestion("Nota sem OC com valor divergente e aprovação parada");
    }
    expect(performance.now() - startedAt).toBeLessThan(5_000);
  });
});
