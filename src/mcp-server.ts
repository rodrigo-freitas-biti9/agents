import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { invoiceSchema, pulseRequestSchema } from "./contracts.js";
import { diagnoseCase, findInvoice } from "./domain/fiscal.js";
import { getSlaSnapshot } from "./domain/sla.js";

const server = new McpServer(
  { name: "b9-pulse", version: "0.1.0" },
  {
    instructions:
      "Use as ferramentas de leitura antes de propor uma solução. Alterações fiscais exigem confirmação humana e verificação posterior.",
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
