# Integração com o Lovable

O identificador do projeto Lovable é privado e deve ser informado como `LOVABLE_PROJECT_ID` apenas no ambiente de operação.

## Contrato

O frontend atual já envia:

```json
{
  "business": "Metalúrgica Serra Alta",
  "fornecedores": [],
  "invoices": [],
  "messages": [{ "role": "user", "content": "Alguma nota precisa de revisão?" }]
}
```

O novo endpoint preserva `reply` e `action`, portanto o componente existente continua compatível. Ele também retorna:

```json
{
  "status": "needs_confirmation",
  "evidence": ["nf-123: com valor divergente"],
  "caseId": "b9-abc123",
  "mode": "openai",
  "sla": { "targetMs": 300000, "elapsedMs": 1840, "remainingMs": 298160, "breached": false }
}
```

## Mudança mínima no frontend

Em `src/components/finance/PulseChat.tsx`, monte a URL sem quebrar o fallback existente:

```ts
const agentBaseUrl = import.meta.env.VITE_B9_PULSE_AGENT_URL?.replace(/\/$/, "") ?? "";
const response = await fetch(`${agentBaseUrl}/api/public/pulse-chat`, { /* payload atual */ });
```

Configure `VITE_B9_PULSE_AGENT_URL` no ambiente do Lovable somente depois de publicar este serviço. Adicione o domínio do preview e o domínio final do app em `ALLOWED_ORIGINS` no backend.

## Critérios de aceite

- A tela responde a uma consulta geral usando o modo OpenAI.
- Sem OpenAI, a mesma tela retorna o fallback determinístico.
- Um erro do endpoint não elimina os dados locais nem quebra o input.
- O `caseId` permanece na conversa quando o frontend passar a persistir casos.
- Ações mutáveis exibem confirmação antes de chegar ao backend B9.
