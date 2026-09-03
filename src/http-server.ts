import { createServer } from "node:http";
import { ZodError } from "zod";
import { runB9Pulse } from "./agents/b9-pulse.js";
import { pulseRequestSchema } from "./contracts.js";
import { readJsonBody, sendJson, setCors } from "./transport/http.js";

const port = Number(process.env.PORT || 8787);

const server = createServer(async (request, response) => {
  setCors(request, response);

  if (request.method === "OPTIONS") {
    response.writeHead(204).end();
    return;
  }

  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  if (request.method === "GET" && url.pathname === "/health") {
    sendJson(response, 200, {
      ok: true,
      service: "b9-pulse-agents",
      mode: process.env.OPENAI_API_KEY ? "openai" : "deterministic",
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/public/pulse-chat") {
    try {
      const requestBody = pulseRequestSchema.parse(await readJsonBody(request));
      const result = await runB9Pulse(requestBody);
      sendJson(response, 200, result);
    } catch (error) {
      if (error instanceof ZodError) {
        sendJson(response, 400, { error: "Payload inválido.", details: error.issues });
      } else if (error instanceof SyntaxError) {
        sendJson(response, 400, { error: "JSON inválido." });
      } else {
        console.error(error instanceof Error ? error.message : "Erro desconhecido");
        sendJson(response, 500, { error: "Não foi possível concluir o atendimento agora." });
      }
    }
    return;
  }

  sendJson(response, 404, { error: "Rota não encontrada." });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`B9 Pulse Agents disponível na porta ${port}.`);
});
