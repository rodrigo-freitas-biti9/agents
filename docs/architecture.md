# Arquitetura B9 Pulse

## Objetivo operacional

Cada conversa vira um caso com relógio de cinco minutos. O orquestrador mantém a voz única do B9 Pulse e envia o trabalho para um especialista. Ferramentas determinísticas levantam evidências; o modelo explica e escolhe o próximo passo.

| Agente | Responsabilidade | Saída esperada |
| --- | --- | --- |
| B9 Pulse Orquestrador | Classificar intenção e manter a conversa | Resposta final estruturada |
| Diagnóstico Fiscal | Erro de leitura, ausência de OC, dados incompletos | Causa provável + evidências faltantes |
| Conciliação | Duplicidade, divergência, vínculo nota/OC | Comparação + ação candidata |
| Resolução | Aprovação, rejeição, pagamento e fechamento | Próximo passo + confirmação humana |

## Fluxo de um caso

1. O Lovable envia a conversa e o contexto fiscal.
2. O runtime valida tamanho, tipos e campos obrigatórios.
3. O orquestrador consulta o snapshot determinístico.
4. Um especialista investiga e retorna uma resposta estruturada.
5. A API devolve `reply`, `status`, `evidence`, `caseId`, `sla` e uma ação opcional.
6. Qualquer mutação real passa pelo backend B9 com confirmação curta e auditável.
7. O registro é lido novamente antes do caso ser marcado como resolvido.

## Por que Agents SDK

O Agents SDK mantém loop, especialistas, handoffs, ferramentas, guardrails e traces no runtime. Agent Builder pode espelhar temporariamente o fluxo para apresentação, mas não é dependência de produção porque seu encerramento está anunciado para 30 de novembro de 2026.

## Continuidade da demonstração

Sem `OPENAI_API_KEY`, o endpoint opera em modo determinístico. Ele responde consultas básicas, calcula consumo e prioriza ocorrências com os mesmos dados já usados pela interface. Isso evita que uma falha externa interrompa a demonstração no Cubo Conecta.
