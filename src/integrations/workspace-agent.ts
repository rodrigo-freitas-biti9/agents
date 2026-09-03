export interface WorkspaceAgentTrigger {
  input: string;
  conversationKey?: string;
  idempotencyKey?: string;
}

export interface WorkspaceAgentTriggerResult {
  conversation_url: string;
  agent_trigger_run_id?: string;
}

export async function triggerWorkspaceAgent(
  trigger: WorkspaceAgentTrigger,
): Promise<WorkspaceAgentTriggerResult> {
  const agentId = process.env.CHATGPT_WORKSPACE_AGENT_ID;
  const token = process.env.AGENT_ACCESS_TOKEN;
  if (!agentId || !token) {
    throw new Error("CHATGPT_WORKSPACE_AGENT_ID e AGENT_ACCESS_TOKEN são obrigatórios.");
  }

  const response = await fetch(`https://api.chatgpt.com/v1/workspace_agents/${encodeURIComponent(agentId)}/trigger`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "openai-beta": "workspace_agent_runs=v1",
      ...(trigger.idempotencyKey ? { "idempotency-key": trigger.idempotencyKey } : {}),
    },
    body: JSON.stringify({
      input: trigger.input,
      ...(trigger.conversationKey ? { conversation_key: trigger.conversationKey } : {}),
    }),
  });

  if (!response.ok) {
    throw new Error(`Workspace Agent recusou a solicitação (${response.status}).`);
  }

  return (await response.json()) as WorkspaceAgentTriggerResult;
}
