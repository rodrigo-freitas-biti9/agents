import type { IncomingMessage, ServerResponse } from "node:http";

const MAX_BODY_BYTES = 1_000_000;

export async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_BODY_BYTES) throw new Error("Payload maior que 1 MB.");
    chunks.push(buffer);
  }

  if (chunks.length === 0) throw new Error("Payload JSON obrigatório.");
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function allowedOrigin(origin: string | undefined): string | null {
  if (!origin) return null;
  const configured = (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000,http://localhost:5173")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return configured.includes("*") || configured.includes(origin) ? origin : null;
}

export function setCors(request: IncomingMessage, response: ServerResponse): void {
  const origin = allowedOrigin(request.headers.origin);
  if (origin) {
    response.setHeader("access-control-allow-origin", origin);
    response.setHeader("vary", "origin");
  }
  response.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
  response.setHeader("access-control-allow-headers", "content-type,authorization,x-request-id");
}

export function sendJson(response: ServerResponse, status: number, payload: unknown): void {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}
