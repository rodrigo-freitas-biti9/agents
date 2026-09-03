import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("installed plugin MCP bundle", () => {
  it("initializes and routes a fiscal problem without repository dependencies", () => {
    const input = [
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2025-03-26",
          capabilities: {},
          clientInfo: { name: "b9-test", version: "1.0.0" },
        },
      },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "triage_fiscal_problem",
          arguments: { question: "Recebemos uma nota sem OC", limit: 1 },
        },
      },
    ].map((message) => JSON.stringify(message)).join("\n") + "\n";

    const result = spawnSync(
      process.execPath,
      [resolve("plugins/b9-pulse-agents/dist/mcp-server.js")],
      { input, encoding: "utf8" },
    );

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    const responses = result.stdout.trim().split("\n").map((line) => JSON.parse(line));
    expect(responses[0].result.serverInfo.name).toBe("b9-pulse");
    expect(responses[1].result.content[0].text).toContain("FP-006");
  });
});

