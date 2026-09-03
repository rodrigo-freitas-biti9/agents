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

function makeTools(request: PulseRequest) {
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

  return { inspectCase, searchInvoices, prepareResolution };
}

function createAgentGraph(request: PulseRequest) {
  const tools = makeTools(request);
  const model = process.env.OPENAI_MODEL || "gpt-5.6";

  const diagnosticAgent = new Agent({
    name: "B9 Diagnóstico Fiscal",
    handoffDescription: "Investiga erros de leitura, ausência de OC e dados insuficientes.",
    model,
    instructions: `${BASE_INSTRUCTIONS}\nFoque em reunir evidências e explicar a causa provável sem alterar dados.`,
    tools: [tools.inspectCase, tools.searchInvoices],
    outputType: agentOutputSchema,
  });

  const reconciliationAgent = new Agent({
    name: "B9 Conciliação",
    handoffDescription: "Trata divergências, duplicidades e reconciliação de notas contra OCs.",
    model,
    instructions: `${BASE_INSTRUCTIONS}\nCompare a nota, o fornecedor e a OC. Prepare uma ação apenas se o pedido mais recente for explícito.`,
    tools: [tools.inspectCase, tools.searchInvoices, tools.prepareResolution],
    outputType: agentOutputSchema,
  });

  const resolutionAgent = new Agent({
    name: "B9 Resolução",
    handoffDescription: "Conduz aprovação, rejeição, pagamento e próximo passo com confirmação humana.",
    model,
    instructions: `${BASE_INSTRUCTIONS}\nEscolha a menor ação segura que resolva o caso e deixe claro o ponto de confirmação.`,
    tools: [tools.inspectCase, tools.searchInvoices, tools.prepareResolution],
    outputType: agentOutputSchema,
  });

  return Agent.create({
    name: "B9 Pulse Orquestrador",
    model,
    instructions: `${BASE_INSTRUCTIONS}
Classifique a intenção e encaminhe ao especialista adequado. Responda diretamente apenas para consultas gerais simples.
Use Diagnóstico para erros/ausência de dados, Conciliação para divergência/duplicidade/OC e Resolução para ações financeiras.`,
    tools: [tools.inspectCase, tools.searchInvoices],
    handoffs: [diagnosticAgent, reconciliationAgent, resolutionAgent],
    outputType: agentOutputSchema,
  });
}

function buildTranscript(request: PulseRequest): string {
  return request.messages
    .slice(-16)
    .map((message) => `${message.role === "user" ? "Cliente" : "B9 Pulse"}: ${message.content}`)
    .join("\n");
}

export async function runB9Pulse(request: PulseRequest): Promise<PulseResponse> {
  const startedAt = Date.now();
  const caseId = request.caseId ?? `b9-${startedAt.toString(36)}`;
  let output: AgentOutput;
  let mode: PulseResponse["mode"];

  if (!process.env.OPENAI_API_KEY) {
    output = deterministicAnswer(request);
    mode = "deterministic";
  } else {
    const result = await run(createAgentGraph(request), buildTranscript(request), { maxTurns: 8 });
    output = agentOutputSchema.parse(result.finalOutput);
    mode = "openai";
  }

  return {
    ...output,
    caseId,
    mode,
    sla: getSlaSnapshot(startedAt),
  };
}
