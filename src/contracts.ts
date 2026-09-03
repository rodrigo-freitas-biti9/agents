import { z } from "zod";

export const recordStatusSchema = z.enum([
  "reconciled",
  "pending",
  "duplicate",
  "mismatch",
  "over_budget",
  "no_po",
  "error",
]);

export const approvalStatusSchema = z.enum(["aguardando_aprovacao", "aprovada", "rejeitada"]);
export const paymentStatusSchema = z.enum(["a_pagar", "paga", "nao_aplicavel"]);

export const invoiceSchema = z
  .object({
    id: z.string().min(1).max(120),
    description: z.string().min(1).max(500),
    amount: z.number().finite().nonnegative(),
    issueDate: z.string().min(8).max(40),
    status: recordStatusSchema,
    reason: z.string().max(1_000).default(""),
    expectedAmount: z.number().finite().nonnegative().optional(),
    areaId: z.string().max(120).default(""),
    fornecedorId: z.string().max(120).default(""),
    approvalStatus: approvalStatusSchema.default("aguardando_aprovacao"),
    paymentStatus: paymentStatusSchema.default("nao_aplicavel"),
    rejectionReason: z.string().max(1_000).optional(),
  })
  .passthrough();

export const supplierSchema = z
  .object({
    id: z.string().max(120).default(""),
    name: z.string().max(300).default("Fornecedor"),
    areaId: z.string().max(120).optional(),
    areaName: z.string().max(300).optional(),
    po: z
      .object({
        total: z.number().finite().nonnegative(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
      .optional(),
  })
  .passthrough();

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(20_000),
});

export const pulseRequestSchema = z.object({
  business: z.string().min(1).max(300),
  fornecedores: z.array(supplierSchema).max(500).default([]),
  invoices: z.array(invoiceSchema).max(2_000),
  messages: z.array(chatMessageSchema).min(1).max(40),
  caseId: z.string().max(120).optional(),
});

export const invoiceActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("confirm_invoice"), invoiceId: z.string() }),
  z.object({
    type: z.literal("resolve_duplicate"),
    keepInvoiceId: z.string(),
    discardInvoiceId: z.string(),
  }),
  z.object({
    type: z.literal("correct_mismatch"),
    invoiceId: z.string(),
    correctedAmount: z.number().finite().nonnegative(),
  }),
  z.object({ type: z.literal("dismiss_overrun"), invoiceId: z.string() }),
  z.object({ type: z.literal("restore_overrun"), invoiceId: z.string() }),
  z.object({ type: z.literal("approve_invoice"), invoiceId: z.string() }),
  z.object({
    type: z.literal("reject_invoice"),
    invoiceId: z.string(),
    rejectionReason: z.string().min(3).max(1_000),
  }),
  z.object({ type: z.literal("mark_paid"), invoiceId: z.string() }),
  z.object({ type: z.literal("mark_to_pay"), invoiceId: z.string() }),
]);

export const agentOutputSchema = z.object({
  reply: z.string().min(1),
  status: z.enum(["resolved", "needs_confirmation", "needs_data", "informational"]),
  action: invoiceActionSchema.optional(),
  evidence: z.array(z.string()).max(8).default([]),
});

export const fiscalSpecialistSchema = z.enum([
  "intake_capture",
  "tax_validation",
  "po_reconciliation",
  "approval_workflow",
  "document_lifecycle",
  "supplier_risk",
  "integration_compliance",
  "monitoring_insights",
]);

export const routingSchema = z.object({
  specialist: fiscalSpecialistSchema,
  problemIds: z.array(z.string()).max(3),
  confidence: z.number().min(0).max(1),
  reason: z.string(),
});

export const pulseResponseSchema = agentOutputSchema.extend({
  caseId: z.string(),
  mode: z.enum(["openai", "deterministic"]),
  sla: z.object({
    targetMs: z.number().int().positive(),
    elapsedMs: z.number().int().nonnegative(),
    remainingMs: z.number().int(),
    breached: z.boolean(),
  }),
  routing: routingSchema,
});

export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceAction = z.infer<typeof invoiceActionSchema>;
export type PulseRequest = z.infer<typeof pulseRequestSchema>;
export type AgentOutput = z.infer<typeof agentOutputSchema>;
export type PulseResponse = z.infer<typeof pulseResponseSchema>;
