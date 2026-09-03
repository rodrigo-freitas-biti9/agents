import type { Invoice, InvoiceAction, PulseRequest } from "../contracts.js";

const priority: Record<Invoice["status"], number> = {
  error: 100,
  no_po: 90,
  mismatch: 80,
  duplicate: 70,
  over_budget: 60,
  pending: 30,
  reconciled: 0,
};

export interface FiscalDiagnosis {
  totalInvoices: number;
  activeInvoices: number;
  totalAmount: number;
  purchaseOrderTotal: number;
  consumptionRatio: number | null;
  flagged: Invoice[];
  topIssue: Invoice | null;
  counts: Record<Invoice["status"], number>;
}

export function diagnoseCase(request: PulseRequest): FiscalDiagnosis {
  const counts = Object.fromEntries(
    Object.keys(priority).map((status) => [status, 0]),
  ) as Record<Invoice["status"], number>;

  for (const invoice of request.invoices) counts[invoice.status] += 1;

  const active = request.invoices.filter((invoice) => invoice.status !== "duplicate");
  const totalAmount = active.reduce((sum, invoice) => sum + invoice.amount, 0);
  const purchaseOrderTotal = request.fornecedores.reduce(
    (sum, supplier) => sum + (supplier.po?.total ?? 0),
    0,
  );
  const flagged = request.invoices
    .filter((invoice) => priority[invoice.status] >= 60)
    .sort((left, right) => priority[right.status] - priority[left.status] || right.amount - left.amount);

  return {
    totalInvoices: request.invoices.length,
    activeInvoices: active.length,
    totalAmount,
    purchaseOrderTotal,
    consumptionRatio: purchaseOrderTotal > 0 ? totalAmount / purchaseOrderTotal : null,
    flagged,
    topIssue: flagged[0] ?? null,
    counts,
  };
}

function normalized(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ");
}

function words(value: string): string[] {
  return normalized(value)
    .split(/\s+/)
    .filter((word) => word.length >= 3);
}

export function findInvoice(query: string, invoices: Invoice[]): Invoice | null {
  const normalizedQuery = normalized(query);
  const exactIdMatch = invoices.find((invoice) => normalizedQuery.includes(normalized(invoice.id)));
  if (exactIdMatch) return exactIdMatch;

  const queryWords = new Set(words(query));
  let best: { invoice: Invoice; score: number } | null = null;

  for (const invoice of invoices) {
    const descriptionWords = words(`${invoice.id} ${invoice.description}`);
    const score = descriptionWords.reduce((sum, word) => sum + (queryWords.has(word) ? 1 : 0), 0);
    if (!best || score > best.score) best = { invoice, score };
  }

  return best && best.score >= 2 ? best.invoice : null;
}

export type ResolutionIntent =
  | "confirm"
  | "approve"
  | "reject"
  | "mark_paid"
  | "mark_to_pay"
  | "correct_mismatch"
  | "resolve_duplicate";

export interface ResolutionCandidateInput {
  invoiceId: string;
  intent: ResolutionIntent;
  correctedAmount?: number | undefined;
  rejectionReason?: string | undefined;
}

export interface ResolutionCandidate {
  action: InvoiceAction | null;
  requiresConfirmation: true;
  reason: string;
}

export function buildResolutionCandidate(
  input: ResolutionCandidateInput,
  invoices: Invoice[],
): ResolutionCandidate {
  const invoice = invoices.find((item) => item.id === input.invoiceId);
  if (!invoice) {
    return { action: null, requiresConfirmation: true, reason: "Nota não encontrada no caso atual." };
  }

  switch (input.intent) {
    case "confirm":
      return {
        action: { type: "confirm_invoice", invoiceId: invoice.id },
        requiresConfirmation: true,
        reason: "A confirmação altera o estado de conciliação da nota.",
      };
    case "approve":
      return {
        action: { type: "approve_invoice", invoiceId: invoice.id },
        requiresConfirmation: true,
        reason: "A aprovação altera o ciclo financeiro da nota.",
      };
    case "reject":
      if (!input.rejectionReason?.trim()) {
        return { action: null, requiresConfirmation: true, reason: "Informe o motivo da rejeição." };
      }
      return {
        action: {
          type: "reject_invoice",
          invoiceId: invoice.id,
          rejectionReason: input.rejectionReason.trim(),
        },
        requiresConfirmation: true,
        reason: "A rejeição precisa de motivo registrado e confirmação humana.",
      };
    case "mark_paid":
      return {
        action: { type: "mark_paid", invoiceId: invoice.id },
        requiresConfirmation: true,
        reason: "Marcar como paga é uma alteração financeira sensível.",
      };
    case "mark_to_pay":
      return {
        action: { type: "mark_to_pay", invoiceId: invoice.id },
        requiresConfirmation: true,
        reason: "A alteração afeta a fila de pagamentos.",
      };
    case "correct_mismatch": {
      const correctedAmount = input.correctedAmount ?? invoice.expectedAmount;
      if (correctedAmount === undefined) {
        return { action: null, requiresConfirmation: true, reason: "O valor correto ainda não foi informado." };
      }
      return {
        action: { type: "correct_mismatch", invoiceId: invoice.id, correctedAmount },
        requiresConfirmation: true,
        reason: "A correção muda o valor usado na conciliação.",
      };
    }
    case "resolve_duplicate": {
      const peer = invoices.find(
        (item) => item.id !== invoice.id && item.amount === invoice.amount && item.description === invoice.description,
      );
      if (!peer) {
        return {
          action: null,
          requiresConfirmation: true,
          reason: "Não há uma segunda nota idêntica para resolver a duplicidade com segurança.",
        };
      }
      const discard = invoice.status === "duplicate" ? invoice : peer;
      const keep = discard.id === invoice.id ? peer : invoice;
      return {
        action: { type: "resolve_duplicate", keepInvoiceId: keep.id, discardInvoiceId: discard.id },
        requiresConfirmation: true,
        reason: "A nota mantida e a descartada devem ser confirmadas por uma pessoa.",
      };
    }
  }
}

export function formatBrl(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}
