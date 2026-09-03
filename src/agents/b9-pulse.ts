import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import {
  agentOutputSchema,
  type AgentOutput,
  type PulseRequest,
  type PulseResponse,
} from "../contracts.js";
import { buildResolutionCandidate, diagnoseCase, findInvoice } from "../domain/fiscal.js";
import { deterministicAnswer } from "../domain/fallback.js";
import { getSlaSnapshot } from "../domain/sla.js";
import { routeFiscalQuestion, type FiscalTriage } from "../domain/triage.js";
import type { FiscalSpecialistId } from "../knowledge/fiscal-problems.js";

const BASE_INSTRUCTIONS = `
Você é o B9 Pulse, copiloto fiscal da Biti9. Responda em português brasileiro, com números específicos e linguagem clara.
Seu objetivo é levar cada caso a um próximo passo verificável em menos de cinco minutos.

Regras obrigatórias:
- Consulte as ferramentas antes de afirmar fatos sobre notas ou OCs.
- Não invente documentos, IDs, valores, datas, integrações ou confirmações.
- Diferencie diagnóstico, proposta e execução.
- Nunca inclua uma ação mutável no resultado sem um pedido explícito do usuário na mensagem mais recente.
- Pagamento, aprovação, rejeição, correção de valor e descarte de duplicidade exigem confirmação humana.
- Se faltarem dados, diga exatamente quais dados faltam.
- O resultado deve seguir o schema estruturado e incluir evidências curtas.
`.trim();

function makeTools(request: PulseRequest, triage: FiscalTriage) {
  const diagnosis = diagnoseCase(request);

  const inspectCase = tool({
    name: "inspect_fiscal_case",
    description: "Resume o caso fiscal atual e ordena os problemas por risco operacional.",
    parameters: z.object({}),
    execute: async () => ({
      business: request.business,
      totalInvoices: diagnosis.totalInvoices,
      activeInvoices: diagnosis.activeInvoices,
      totalAmount: diagnosis.totalAmount,
      purchaseOrderTotal: diagnosis.purchaseOrderTotal,
      consumptionRatio: diagnosis.consumptionRatio,
      counts: diagnosis.counts,
      flagged: diagnosis.flagged.slice(0, 20),
    }),
  });

  const searchInvoices = tool({
    name: "search_invoices",
    description: "Localiza uma nota do caso atual por ID, descrição ou palavras relevantes.",
    parameters: z.object({ query: z.string().min(1).max(500) }),
    execute: async ({ query }) => {
      const invoice = findInvoice(query, request.invoices);
      return invoice ?? { found: false, reason: "Nenhuma nota correspondente." };
    },
  });

  const prepareResolution = tool({
    name: "prepare_resolution",
    description:
      "Monta e valida uma ação candidata sem executá-la. Use somente quando o usuário pedir uma mudança de forma explícita.",
    parameters: z.object({
      invoiceId: z.string(),
      intent: z.enum([
        "confirm",
        "approve",
        "reject",
        "mark_paid",
        "mark_to_pay",
        "correct_mismatch",
        "resolve_duplicate",
      ]),
      correctedAmount: z.number().nonnegative().optional(),
      rejectionReason: z.string().optional(),
    }),
    execute: async (input) => buildResolutionCandidate(input, request.invoices),
  });

  const inspectProblemCatalog = tool({
    name: "inspect_problem_catalog",
    description: "Retorna as dores fiscais mais compatíveis com a pergunta e seus próximos passos seguros.",
    parameters: z.object({}),
    execute: async () => ({
      specialist: triage.specialist,
      confidence: triage.confidence,
      matches: triage.matches.map(({ problem, score }) => ({
        id: problem.id,
        rank: problem.rank,
        title: problem.title,
        category: problem.category,
        priority: problem.priority,
        score,
        nextAction: problem.nextAction,
      })),
    }),
  });

  return { inspectCase, searchInvoices, prepareResolution, inspectProblemCatalog };
}

interface SpecialistSpec {
  name: string;
  focus: string;
  canPrepareMutation: boolean;
}

const SPECIALISTS: Record<FiscalSpecialistId, SpecialistSpec> = {
  intake_capture: {
    name: "B9 Recebimento e Captura",
    focus: "XML, PDF, OCR, anexos, classificação documental, campos ausentes e filas de entrada.",
    canPrepareMutation: false,
  },
  tax_validation: {
    name: "B9 Validação Fiscal",
    focus: "rejeições, cadastros, CFOP, NCM, CST, CSOSN, totais, bases, alíquotas e retenções.",
    canPrepareMutation: true,
  },
  po_reconciliation: {
    name: "B9 Conciliação de OC",
    focus: "nota, ordem de compra, contrato, recebimento, saldo, orçamento, quantidade e valor.",
    canPrepareMutation: true,
  },
  approval_workflow: {
    name: "B9 Aprovações e SLA",
    focus: "alçadas, aprovadores, delegações, segregação, pendências e prazo operacional.",
    canPrepareMutation: true,
  },
  document_lifecycle: {
    name: "B9 Ciclo de Vida Fiscal",
    focus: "autorização, denegação, inutilização, cancelamento, CC-e, manifestação e devolução.",
    canPrepareMutation: false,
  },
  supplier_risk: {
    name: "B9 Fornecedor e Risco",
    focus: "duplicidade, fraude, identidade, cadastro mestre, dados bancários e comunicação com fornecedor.",
    canPrepareMutation: true,
  },
  integration_compliance: {
    name: "B9 Integrações e Compliance",
    focus: "ERP, APIs, certificados, credenciais, schemas, CNPJ alfanumérico e IBS/CBS.",
    canPrepareMutation: false,
  },
  monitoring_insights: {
    name: "B9 Monitoramento e Insights",
    focus: "visão executiva e operacional de status, vencimentos, consumo da OC, exceções e tendências.",
    canPrepareMutation: false,
  },
};

function createSpecialistAgent(request: PulseRequest, triage: FiscalTriage) {
  const tools = makeTools(request, triage);
  const model = process.env.OPENAI_MODEL || "gpt-5.6";
  const specialist = SPECIALISTS[triage.specialist];
  const selectedTools = specialist.canPrepareMutation
    ? [tools.inspectProblemCatalog, tools.inspectCase, tools.searchInvoices, tools.prepareResolution]
    : [tools.inspectProblemCatalog, tools.inspectCase, tools.searchInvoices];

  return new Agent({
    name: specialist.name,
    model,
    instructions: `${BASE_INSTRUCTIONS}
Você é o especialista selecionado por roteamento determinístico. Seu foco é: ${specialist.focus}
Classificação inicial: ${triage.reason} (confiança ${triage.confidence}).
Consulte o catálogo e os dados do caso. Corrija a classificação se as evidências demonstrarem outra causa.
Responda com diagnóstico, evidência, próximo passo, dono recomendado e informação faltante. Não transforme o atendimento em gestão ampla de fluxo de caixa.`,
    tools: selectedTools,
    outputType: agentOutputSchema,
  });
}

function buildTranscript(request: PulseRequest, triage: FiscalTriage): string {
  const conversation = request.messages
    .slice(-16)
    .map((message) => `${message.role === "user" ? "Cliente" : "B9 Pulse"}: ${message.content}`)
    .join("\n");
  const candidates = triage.matches.map(({ problem }) => `${problem.id} ${problem.title}`).join("; ");
  return `Triagem local: ${triage.reason}. Candidatos: ${candidates || "nenhum"}.\n${conversation}`;
}

export async function runB9Pulse(request: PulseRequest): Promise<PulseResponse> {
  const startedAt = Date.now();
  const caseId = request.caseId ?? `b9-${startedAt.toString(36)}`;
  const question = request.messages.at(-1)?.content ?? "";
  const triage = routeFiscalQuestion(question);
  let output: AgentOutput;
  let mode: PulseResponse["mode"];

  if (!process.env.OPENAI_API_KEY) {
    output = deterministicAnswer(request, triage);
    mode = "deterministic";
  } else {
    const result = await run(createSpecialistAgent(request, triage), buildTranscript(request, triage), {
      maxTurns: 5,
    });
    output = agentOutputSchema.parse(result.finalOutput);
    mode = "openai";
  }

  return {
    ...output,
    caseId,
    mode,
    routing: {
      specialist: triage.specialist,
      problemIds: triage.matches.map(({ problem }) => problem.id),
      confidence: triage.confidence,
      reason: triage.reason,
    },
    sla: getSlaSnapshot(startedAt),
  };
}
