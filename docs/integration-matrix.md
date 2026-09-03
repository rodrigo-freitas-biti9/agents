# Matriz de integrações

Nem todos os itens da visão são bibliotecas embutíveis no B9 Pulse. Esta matriz separa runtime, operação e desenvolvimento para evitar dependências falsas.

| Ecossistema | Capacidade | Papel no B9 Pulse | Estado da base |
| --- | --- | --- | --- |
| ChatGPT | GPT / Personalização | Experiência e instruções do operador | Skill de equipe preparada; configuração depende do workspace |
| ChatGPT | Agendado | Monitorar casos, filas e alertas | Playbook pronto; agenda é criada no ChatGPT após definir fonte e horário |
| ChatGPT | Work | Investigar casos com apps conectados | Pode usar o plug-in/MCP após registro do servidor |
| ChatGPT | Sites | Portal auxiliar ou demonstração hospedada | Opcional; o produto principal permanece no Lovable |
| ChatGPT | Workspace Agents API | Disparar agente publicado por evento externo | Adaptador em `src/integrations/workspace-agent.ts` |
| Codex | Plug-in Lovable | Evoluir o frontend conectado | Conexão verificada no projeto indicado |
| Codex | Template Creator | Criar templates pessoais a partir de referência | Capacidade do Codex; não é vendorizada neste repositório |
| Codex | Visualize | Explorar fluxos, métricas e cenários | Capacidade do Codex; o app mantém seus próprios gráficos |
| OpenAI Platform | Agents SDK | Runtime multiagente | Implementado |
| OpenAI Platform | MCP | Ferramentas fiscais para ChatGPT/Codex | MCP local implementado |
| OpenAI Platform | Skills | Playbooks reutilizáveis | Três skills no plug-in: triagem, resolução e Lovable |
| OpenAI Platform | Agent Builder | Protótipo visual temporário | Não usado em produção; encerramento anunciado para 30/11/2026 |
| Lovable | Design System | Identidade visual Biti9 | Já aplicada no app atual |
| Lovable | Plan | Planejar mudanças antes de consumir build credits | Coberto pela skill de integração |
| Lovable | Cloud | Hospedagem/dados do frontend | Não habilitado por esta base; exige decisão de ambiente |
| Lovable | Remix | Criar variantes do projeto | Disponível sob pedido; não necessário para integrar o app atual |
| Lovable | Agent integrations | Chamar o endpoint dos agentes | Contrato compatível implementado |
| Lovable | Connectors | Serviços externos do projeto | Dependem de OAuth, escopos e escolha explícita do workspace |

## Segredos necessários

- `OPENAI_API_KEY`: runtime do Agents SDK.
- `B9_API_BASE_URL` e `B9_API_TOKEN`: dados e ações reais do produto B9.
- `CHATGPT_WORKSPACE_AGENT_ID` e `AGENT_ACCESS_TOKEN`: disparo opcional de Workspace Agent.

Nenhum segredo deve entrar no Git ou ser enviado ao chat do Lovable.
