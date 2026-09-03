import type { AgentOutput, PulseRequest } from "../contracts.js";
import { diagnoseCase, findInvoice, formatBrl } from "./fiscal.js";

function label(status: PulseRequest["invoices"][number]["status"]): string {
  return {
    reconciled: "confirmada",
    pending: "pendente",
    duplicate: "duplicada",
    mismatch: "com valor divergente",
    over_budget: "com risco de estouro",
    no_po: "sem OC vinculada",
    error: "com erro de leitura",
  }[status];
}

export function deterministicAnswer(request: PulseRequest): AgentOutput {
  const diagnosis = diagnoseCase(request);
  const question = request.messages.at(-1)?.content ?? "";
  const matched = findInvoice(question, request.invoices);

  if (matched) {
    return {
      reply: `A nota **${matched.description}** é de ${formatBrl(matched.amount)} e está ${label(matched.status)}. ${matched.reason || "Não há justificativa adicional registrada."}`,
      status: "informational",
      evidence: [matched.id, matched.issueDate, matched.status],
    };
  }

  if (/quanto|consumo|consumiu|fatur|total|oc\b/i.test(question)) {
    const ratio = diagnosis.consumptionRatio;
    const comparison = ratio === null
      ? "O teto consolidado das OCs não veio no payload."
      : `Isso representa ${(ratio * 100).toFixed(0)}% de ${formatBrl(diagnosis.purchaseOrderTotal)} em OCs.`;
    return {
      reply: `${request.business} tem ${diagnosis.activeInvoices} notas ativas, somando **${formatBrl(diagnosis.totalAmount)}**. ${comparison}`,
      status: ratio === null ? "needs_data" : "informational",
      evidence: [`${diagnosis.activeInvoices} notas ativas`, formatBrl(diagnosis.totalAmount)],
    };
  }

  if (!diagnosis.topIssue) {
    return {
      reply: `Tudo dentro do esperado para ${request.business}: não encontrei notas com erro, sem OC, divergência, duplicidade ou risco de estouro.`,
      status: "resolved",
      evidence: [`${diagnosis.totalInvoices} notas analisadas`],
    };
  }

  const issue = diagnosis.topIssue;
  return {
    reply: `Encontrei ${diagnosis.flagged.length} item(ns) para tratar. A prioridade é **${issue.description}**, de ${formatBrl(issue.amount)}: está ${label(issue.status)}. ${issue.reason} Próximo passo: validar a evidência e confirmar a ação antes de alterar dados fiscais.`,
    status: "needs_confirmation",
    evidence: diagnosis.flagged.slice(0, 5).map((invoice) => `${invoice.id}: ${label(invoice.status)}`),
  };
}
