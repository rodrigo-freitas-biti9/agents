import { createInterface } from "node:readline";
import type { Invoice, PulseRequest } from "./contracts.js";
import { diagnoseCase, findInvoice } from "./domain/fiscal.js";
import { getSlaSnapshot } from "./domain/sla.js";
import { routeFiscalQuestion } from "./domain/triage.js";
import { fiscalProblems } from "./knowledge/fiscal-problems.js";

interface RpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

const tools = [
  {
    name: "triage_fiscal_problem",
    description: "Classifica uma pergunta no catálogo das 100 dores e seleciona o especialista B9.",
    inputSchema: {
      type: "object",
      properties: {
        question: { type: "string", minLength: 2, maxLength: 2_000 },
        limit: { type: "integer", minimum: 1, maximum: 10, default: 3 },
      },
      required: ["question"],
      additionalProperties: false,
    },
  },
  {
    name: "list_fiscal_problem_catalog",
    description: "Lista as dores fiscais conhecidas por categoria ou especialista.",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string" },
        specialist: { type: "string" },
        limit: { type: "integer", minimum: 1, maximum: 100, default: 100 },
      },
      additionalProperties: false,
    },
  },
  {
    name: "analyze_fiscal_case",
    description: "Diagnostica notas e OCs e ordena os problemas por risco operacional.",
    inputSchema: {
      type: "object",
      properties: { request: { type: "object" } },
      required: ["request"],
      additionalProperties: false,
    },
  },
  {
    name: "search_fiscal_records",
    description: "Localiza a nota mais compatível com uma descrição ou identificador.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        invoices: { type: "array", items: { type: "object" } },
      },
      required: ["query", "invoices"],
      additionalProperties: false,
    },
  },
  {
    name: "check_resolution_sla",
    description: "Calcula o tempo restante da meta de resolução de cinco minutos.",
    inputSchema: {
      type: "object",
      properties: {
        startedAt: { type: "integer", minimum: 0 },
        now: { type: "integer", minimum: 0 },
      },
      required: ["startedAt"],
      additionalProperties: false,
    },
  },
] as const;

function content(value: unknown) {
  return { content: [{ type: "text", text: JSON.stringify(value, null, 2) }] };
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function callTool(params: Record<string, unknown> | undefined) {
  const name = params?.name;
  const args = (params?.arguments ?? {}) as Record<string, unknown>;

  switch (name) {
    case "triage_fiscal_problem": {
      const question = typeof args.question === "string" ? args.question : "";
      const limit = Math.min(10, Math.max(1, asNumber(args.limit, 3)));
      const triage = routeFiscalQuestion(question, limit);
      return content({
        ...triage,
        matches: triage.matches.map(({ problem, score }) => ({ ...problem, score })),
      });
    }
    case "list_fiscal_problem_catalog": {
      const category = typeof args.category === "string" ? args.category.toLocaleLowerCase("pt-BR") : "";
      const specialist = typeof args.specialist === "string" ? args.specialist : "";
      const limit = Math.min(100, Math.max(1, asNumber(args.limit, 100)));
      return content(fiscalProblems
        .filter((problem) => !category || problem.category.toLocaleLowerCase("pt-BR") === category)
        .filter((problem) => !specialist || problem.specialist === specialist)
        .slice(0, limit));
    }
    case "analyze_fiscal_case":
      return content(diagnoseCase(args.request as PulseRequest));
    case "search_fiscal_records":
      return content(findInvoice(String(args.query ?? ""), (args.invoices ?? []) as Invoice[]));
    case "check_resolution_sla":
      return content(getSlaSnapshot(asNumber(args.startedAt, 0), asNumber(args.now, Date.now())));
    default:
      throw new Error(`Ferramenta desconhecida: ${String(name)}`);
  }
}

function respond(id: RpcRequest["id"], result?: unknown, error?: { code: number; message: string }): void {
  if (id === undefined) return;
  process.stdout.write(`${JSON.stringify(error
    ? { jsonrpc: "2.0", id, error }
    : { jsonrpc: "2.0", id, result })}\n`);
}

function handle(request: RpcRequest): void {
  try {
    switch (request.method) {
      case "initialize":
        respond(request.id, {
          protocolVersion: "2025-03-26",
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: "b9-pulse", version: "0.2.0" },
          instructions: "Leia os dados antes de propor solução. Toda mutação exige confirmação humana.",
        });
        return;
      case "notifications/initialized":
      case "notifications/cancelled":
        return;
      case "ping":
        respond(request.id, {});
        return;
      case "tools/list":
        respond(request.id, { tools });
        return;
      case "tools/call":
        respond(request.id, callTool(request.params));
        return;
      default:
        respond(request.id, undefined, { code: -32601, message: "Método não encontrado." });
    }
  } catch (error) {
    respond(request.id, undefined, {
      code: -32602,
      message: error instanceof Error ? error.message : "Parâmetros inválidos.",
    });
  }
}

const input = createInterface({ input: process.stdin, crlfDelay: Infinity });
input.on("line", (line) => {
  if (!line.trim()) return;
  try {
    handle(JSON.parse(line) as RpcRequest);
  } catch {
    respond(null, undefined, { code: -32700, message: "JSON inválido." });
  }
});

