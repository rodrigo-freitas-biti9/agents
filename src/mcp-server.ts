import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { invoiceSchema, pulseRequestSchema } from "./contracts.js";
import { diagnoseCase, findInvoice } from "./domain/fiscal.js";
import { getSlaSnapshot } from "./domain/sla.js";
import { routeFiscalQuestion } from "./domain/triage.js";
import { fiscalProblems } from "./knowledge/fiscal-problems.js";

const server = new McpServer(
  { name: "b9-pulse", version: "0.2.0" },
  {
    instructions:
      "Use as ferramentas de leitura antes de propor uma solução. Alterações fiscais exigem confirmação humana e verificação posterior.",
  },
);

server.registerTool(
  "triage_fiscal_problem",
  {
    title: "Classificar dor fiscal",
    description: "Classifica uma pergunta no catálogo das 100 dores e seleciona o especialista B9.",
    inputSchema: {
      question: z.string().min(2).max(2_000),
      limit: z.number().int().min(1).max(10).default(3),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async ({ question, limit }) => {
    const triage = routeFiscalQuestion(question, limit);
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          ...triage,
          matches: triage.matches.map(({ problem, score }) => ({ ...problem, score })),
        }, null, 2),
      }],
    };
  },
);

server.registerTool(
  "list_fiscal_problem_catalog",
  {
    title: "Listar catálogo de dores fiscais",
    description: "Lista as dores fiscais conhecidas, opcionalmente por categoria ou especialista.",
    inputSchema: {
      category: z.string().max(100).optional(),
      specialist: z.string().max(100).optional(),
      limit: z.number().int().min(1).max(100).default(100),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async ({ category, specialist, limit }) => {
    const normalizedCategory = category?.toLocaleLowerCase("pt-BR");
    const items = fiscalProblems
      .filter((problem) => !normalizedCategory || problem.category.toLocaleLowerCase("pt-BR") === normalizedCategory)
      .filter((problem) => !specialist || problem.specialist === specialist)
      .slice(0, limit);
    return { content: [{ type: "text", text: JSON.stringify(items, null, 2) }] };
  },
);

server.registerTool(
  "analyze_fiscal_case",
  {
    title: "Analisar caso fiscal",
    description: "Diagnostica notas e OCs, priorizando erro, ausência de OC, divergência e duplicidade.",
    inputSchema: { request: pulseRequestSchema },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async ({ request }) => ({
    content: [{ type: "text", text: JSON.stringify(diagnoseCase(request), null, 2) }],
  }),
);

server.registerTool(
  "search_fiscal_records",
  {
    title: "Buscar notas fiscais",
    description: "Localiza a nota mais compatível com uma descrição ou identificador.",
    inputSchema: {
      query: z.string().min(1).max(500),
      invoices: z.array(invoiceSchema).max(2_000),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async ({ query, invoices }) => ({
    content: [{ type: "text", text: JSON.stringify(findInvoice(query, invoices), null, 2) }],
  }),
);

server.registerTool(
  "check_resolution_sla",
  {
    title: "Verificar SLA do atendimento",
    description: "Calcula o tempo restante da meta de resolução de cinco minutos.",
    inputSchema: { startedAt: z.number().int().nonnegative(), now: z.number().int().nonnegative().optional() },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async ({ startedAt, now }) => ({
    content: [{ type: "text", text: JSON.stringify(getSlaSnapshot(startedAt, now), null, 2) }],
  }),
);

await server.connect(new StdioServerTransport());
