# Arquitetura B9 Pulse

## Objetivo operacional

Cada conversa vira um caso com relógio de cinco minutos. Uma triagem determinística compara a pergunta com o catálogo de 100 dores e executa diretamente um especialista. Isso evita um turno adicional de modelo só para roteamento. Ferramentas determinísticas levantam evidências; o modelo explica e escolhe o próximo passo.

| Agente | Responsabilidade | Saída esperada |
| --- | --- | --- |
| Recebimento e Captura | XML, PDF, OCR, anexos e filas | Documento identificado + campos confiáveis/faltantes |
| Validação Fiscal | Rejeições, cadastro, classificação e tributos | Regra afetada + correção proposta |
| Conciliação de OC | OC, contrato, recebimento, saldo e valor | Comparação + ação candidata |
| Aprovações e SLA | Alçadas, aprovadores, delegação e pendências | Dono + prazo + confirmação pendente |
| Ciclo de Vida Fiscal | Autorização, cancelamento, CC-e e manifestação | Estado oficial + procedimento cabível |
| Fornecedor e Risco | Duplicidade, fraude, cadastro e comunicação | Sinal de risco + validação independente |
| Integrações e Compliance | ERP, API, certificado, schemas e IBS/CBS | Componente causador + correção técnica |
| Monitoramento e Insights | Status, vencimento, consumo da OC e exceções | Resumo executivo + prioridade operacional |

## Fluxo de um caso

1. O Lovable envia a conversa e o contexto fiscal.
2. O runtime valida tamanho, tipos e campos obrigatórios.
3. A triagem local retorna até três IDs `FP-###` e escolhe um especialista.
4. Somente o especialista escolhido recebe contexto e ferramentas relevantes.
5. A API devolve `reply`, `status`, `evidence`, `routing`, `caseId`, `sla` e uma ação opcional.
6. Qualquer mutação real passa pelo backend B9 com confirmação curta e auditável.
7. O registro é lido novamente antes do caso ser marcado como resolvido.

## Por que Agents SDK

O Agents SDK mantém o loop, as ferramentas, o schema de saída, guardrails e traces no runtime. A triagem fica local para reduzir latência e tornar o encaminhamento testável. Agent Builder pode espelhar temporariamente o fluxo para apresentação, mas não é dependência de produção porque seu encerramento está anunciado para 30 de novembro de 2026.

## Continuidade da demonstração

Sem `OPENAI_API_KEY`, o endpoint opera em modo determinístico. Ele classifica as 100 dores, responde consultas básicas, calcula consumo e prioriza ocorrências com os mesmos dados já usados pela interface. Isso evita que uma falha externa interrompa a demonstração no Cubo Conecta.
