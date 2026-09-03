import type { InvoiceAction } from "../contracts.js";

function getConfiguration() {
  const baseUrl = process.env.B9_API_BASE_URL?.replace(/\/$/, "");
  const token = process.env.B9_API_TOKEN;
  if (!baseUrl || !token) throw new Error("B9_API_BASE_URL e B9_API_TOKEN não estão configurados.");
  return { baseUrl, token };
}

export async function getFiscalCase(caseId: string): Promise<unknown> {
  const { baseUrl, token } = getConfiguration();
  const response = await fetch(`${baseUrl}/v1/fiscal/cases/${encodeURIComponent(caseId)}`, {
    headers: { authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`Não foi possível carregar o caso (${response.status}).`);
  return response.json();
}

export async function executeFiscalAction(
  caseId: string,
  action: InvoiceAction,
  confirmationToken: string,
): Promise<unknown> {
  const { baseUrl, token } = getConfiguration();
  if (!confirmationToken) throw new Error("Confirmação humana obrigatória.");
  const response = await fetch(`${baseUrl}/v1/fiscal/cases/${encodeURIComponent(caseId)}/actions`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "x-b9-confirmation": confirmationToken,
    },
    body: JSON.stringify(action),
  });
  if (!response.ok) throw new Error(`A ação fiscal foi recusada (${response.status}).`);
  return response.json();
}
