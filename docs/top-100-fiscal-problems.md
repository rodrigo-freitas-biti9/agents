# Catálogo priorizado das 100 dores fiscais e de faturamento

## Como a lista foi construída

Este é um catálogo de priorização do B9 Pulse, não um ranking estatístico universal. A ordem combina frequência publicada, risco fiscal, impacto operacional e aderência ao produto: monitoramento do ciclo de vida da NF, OC, aprovações e fornecedores, sem expandir para fluxo de caixa corporativo.

As âncoras quantitativas foram:

- No [State of AP 2025](https://eco-cdn.iqpc.com/eco/files/channel_content/posts/sson-stateofap2025trendsinsightspapaya03mDKiNFX1pHeAYfXOAaWYiqY2RttGHm1a6xvs697s.pdf), as maiores dores declaradas incluem digitação manual (59%), atrasos (42%), complexidade fiscal/compliance (41%) e erros de conciliação (41%).
- O [levantamento IFOL 2025](https://acarp-edu.org/new-global-research-highlights-pressure-points-and-priorities-in-ap-automation-in-2025/) informa que 63% gastam mais de 10 horas semanais no processamento de faturas e 66% ainda digitam dados manualmente no ERP.
- A [lista oficial de rejeições do Portal NF-e](https://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=R7Y%2FbEE%2FRM8%3D) foi usada para ordenar os erros formais mais recorrentes, como duplicidade, NCM, certificado, CSOSN, QR Code, CFOP e totais.
- O [Portal NF-e](https://www.nfe.fazenda.gov.br/Portal/perguntasFrequentes.aspx?AspxAutoDetectCookieSupport=1&tipoConteudo=PN6e+JQMTxs%3D), a [Receita Federal sobre CC-e](https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/exportacao-portal-unico/elaboracao-da-due/carta-de-correcao-de-nota-fiscal-eletronica) e a [Sefaz-SP sobre cancelamento extemporâneo](https://portal.fazenda.sp.gov.br/servicos/nfe/Paginas/cancelamentoextemp.aspx/1000) fundamentam as dores de ciclo de vida.
- Para 2026, as [orientações da Receita sobre CBS/IBS](https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/acoes-e-programas/programas-e-atividades/reforma-tributaria-do-consumo/orientacoes-2026) e a [NT 009 da NFS-e](https://www.gov.br/nfse/pt-br/noticias/publicada-a-nota-tecnica-009-da-nfs-e/) fundamentam as novas validações.
- A [AFP](https://www.financialprofessionals.org/about/learn-more/press-releases/Details/survey-79-percent-of-organizations-were-victims-of-attempted-or-actual-payments-fraud-activity-in-2024) reportou tentativa ou ocorrência de fraude de pagamentos em 79% das organizações pesquisadas e fraude por impostor de fornecedor em 45%.

## Os 100 problemas

| # | ID | Dor do cliente | Especialista B9 |
|---:|---|---|---|
| 1 | FP-001 | Digitação manual de dados da nota | Recebimento e Captura |
| 2 | FP-002 | Atraso no processamento da nota | Monitoramento e Insights |
| 3 | FP-003 | Complexidade de conformidade e regras tributárias | Integrações e Compliance |
| 4 | FP-004 | Erro de conciliação entre nota, OC e recebimento | Conciliação de OC |
| 5 | FP-005 | Nota fiscal duplicada | Fornecedor e Risco |
| 6 | FP-006 | Nota sem ordem de compra | Conciliação de OC |
| 7 | FP-007 | Aprovação parada ou sem resposta | Aprovações e SLA |
| 8 | FP-008 | Falta de visão do ciclo de vida da NF | Monitoramento e Insights |
| 9 | FP-009 | XML não recebido ou indisponível | Recebimento e Captura |
| 10 | FP-010 | Comunicação lenta ou opaca com fornecedor | Fornecedor e Risco |
| 11 | FP-011 | Risco de fraude ou documento de fornecedor falso | Fornecedor e Risco |
| 12 | FP-012 | Falha de integração com ERP ou sistema fiscal | Integrações e Compliance |
| 13 | FP-013 | NCM inexistente | Validação Fiscal |
| 14 | FP-014 | Certificado digital expirado | Integrações e Compliance |
| 15 | FP-015 | CSOSN indevido para o item | Validação Fiscal |
| 16 | FP-016 | Hash do QR Code divergente | Validação Fiscal |
| 17 | FP-017 | Parâmetros do QR Code divergentes da nota | Validação Fiscal |
| 18 | FP-018 | Data e hora de emissão atrasadas | Validação Fiscal |
| 19 | FP-019 | CFOP inválido | Validação Fiscal |
| 20 | FP-020 | Total da nota difere das formas de pagamento | Validação Fiscal |
| 21 | FP-021 | CFOP incompatível com CSOSN | Validação Fiscal |
| 22 | FP-022 | CFOP incompatível com CST | Validação Fiscal |
| 23 | FP-023 | Total de PIS difere do somatório dos itens | Validação Fiscal |
| 24 | FP-024 | CST indevido para o item | Validação Fiscal |
| 25 | FP-025 | Entrada em contingência registrada com atraso | Ciclo de Vida Fiscal |
| 26 | FP-026 | Base total de ICMS difere dos itens | Validação Fiscal |
| 27 | FP-027 | Numeração da NF-e já inutilizada | Ciclo de Vida Fiscal |
| 28 | FP-028 | Data de emissão posterior ao recebimento | Validação Fiscal |
| 29 | FP-029 | UF do emitente diverge da autorizadora | Validação Fiscal |
| 30 | FP-030 | Total de produtos/serviços difere dos itens | Validação Fiscal |
| 31 | FP-031 | Total de desconto difere dos itens | Validação Fiscal |
| 32 | FP-032 | NCM incompleto | Validação Fiscal |
| 33 | FP-033 | Grupo de formas de pagamento ausente | Validação Fiscal |
| 34 | FP-034 | CSOSN informado por emissor fora do Simples | Validação Fiscal |
| 35 | FP-035 | GTIN/cEAN inválido | Validação Fiscal |
| 36 | FP-036 | NF-e já cancelada | Ciclo de Vida Fiscal |
| 37 | FP-037 | Destinatário igual ao emitente indevidamente | Validação Fiscal |
| 38 | FP-038 | CSC do QR Code não cadastrado | Integrações e Compliance |
| 39 | FP-039 | CPF do destinatário inválido | Validação Fiscal |
| 40 | FP-040 | Valor do troco incorreto | Validação Fiscal |
| 41 | FP-041 | Chave de acesso inconsistente com o XML | Validação Fiscal |
| 42 | FP-042 | Documento ilegível ou OCR com baixa confiança | Recebimento e Captura |
| 43 | FP-043 | Anexo ausente, corrompido ou protegido | Recebimento e Captura |
| 44 | FP-044 | Tipo de documento não reconhecido | Recebimento e Captura |
| 45 | FP-045 | Mesma nota capturada por canais diferentes | Recebimento e Captura |
| 46 | FP-046 | Fila de e-mail ou portal não processada | Recebimento e Captura |
| 47 | FP-047 | Campos obrigatórios ausentes no documento | Recebimento e Captura |
| 48 | FP-048 | CNPJ inválido ou fornecedor não encontrado | Validação Fiscal |
| 49 | FP-049 | Inscrição estadual inválida ou incompatível | Validação Fiscal |
| 50 | FP-050 | Código de serviço municipal incorreto | Validação Fiscal |
| 51 | FP-051 | Município de incidência do ISS incorreto | Validação Fiscal |
| 52 | FP-052 | Regime tributário do fornecedor desatualizado | Validação Fiscal |
| 53 | FP-053 | Alíquota tributária incorreta | Validação Fiscal |
| 54 | FP-054 | ICMS-ST ou DIFAL calculado incorretamente | Validação Fiscal |
| 55 | FP-055 | PIS/COFINS devido versus retido inconsistente | Validação Fiscal |
| 56 | FP-056 | Retenção de ISS incorreta | Validação Fiscal |
| 57 | FP-057 | Retenções federais divergentes | Validação Fiscal |
| 58 | FP-058 | Diferença de centavos por arredondamento | Validação Fiscal |
| 59 | FP-059 | Frete, seguro ou outras despesas divergentes | Conciliação de OC |
| 60 | FP-060 | Fornecedor da nota diverge da OC | Conciliação de OC |
| 61 | FP-061 | OC fechada, cancelada ou bloqueada | Conciliação de OC |
| 62 | FP-062 | Saldo da OC insuficiente | Conciliação de OC |
| 63 | FP-063 | Risco de estouro do orçamento da OC | Monitoramento e Insights |
| 64 | FP-064 | Valor da NF diverge do valor contratado | Conciliação de OC |
| 65 | FP-065 | Quantidade faturada diverge do recebido | Conciliação de OC |
| 66 | FP-066 | Recebimento de mercadoria não registrado | Conciliação de OC |
| 67 | FP-067 | Medição ou aceite de serviço ausente | Conciliação de OC |
| 68 | FP-068 | Linha ou item incorreto da OC | Conciliação de OC |
| 69 | FP-069 | Nota fora da vigência do contrato ou OC | Conciliação de OC |
| 70 | FP-070 | Parcelamento ou faturamento parcial inconsistente | Conciliação de OC |
| 71 | FP-071 | Centro de custo, área ou projeto ausente | Aprovações e SLA |
| 72 | FP-072 | Aprovador não identificado | Aprovações e SLA |
| 73 | FP-073 | Aprovador ausente, desligado ou sem substituto | Aprovações e SLA |
| 74 | FP-074 | SLA de aprovação vencido | Aprovações e SLA |
| 75 | FP-075 | Aprovação fora da alçada | Aprovações e SLA |
| 76 | FP-076 | Quebra de segregação de funções | Aprovações e SLA |
| 77 | FP-077 | Rejeição interna sem motivo registrado | Aprovações e SLA |
| 78 | FP-078 | Fluxo de múltiplas aprovações inconsistente | Aprovações e SLA |
| 79 | FP-079 | NF pendente de autorização na SEFAZ | Ciclo de Vida Fiscal |
| 80 | FP-080 | NF-e denegada | Ciclo de Vida Fiscal |
| 81 | FP-081 | Protocolo de autorização ausente ou divergente | Ciclo de Vida Fiscal |
| 82 | FP-082 | Prazo de cancelamento perdido | Ciclo de Vida Fiscal |
| 83 | FP-083 | Cancelamento bloqueado por CT-e, MDF-e ou evento | Ciclo de Vida Fiscal |
| 84 | FP-084 | Tentativa de usar CC-e para campo não permitido | Ciclo de Vida Fiscal |
| 85 | FP-085 | Carta de correção necessária e ainda não emitida | Ciclo de Vida Fiscal |
| 86 | FP-086 | Manifestação do destinatário pendente | Ciclo de Vida Fiscal |
| 87 | FP-087 | Manifestação do destinatário incorreta | Ciclo de Vida Fiscal |
| 88 | FP-088 | Operação desconhecida usando CNPJ/IE da empresa | Fornecedor e Risco |
| 89 | FP-089 | Operação não realizada ou mercadoria recusada | Ciclo de Vida Fiscal |
| 90 | FP-090 | Devolução total ou parcial não vinculada | Ciclo de Vida Fiscal |
| 91 | FP-091 | Status de pagamento divergente ou sem evidência | Monitoramento e Insights |
| 92 | FP-092 | Vencimento divergente ou risco de atraso | Monitoramento e Insights |
| 93 | FP-093 | Alteração suspeita de dados bancários do fornecedor | Fornecedor e Risco |
| 94 | FP-094 | Fornecedor duplicado ou cadastro mestre inconsistente | Fornecedor e Risco |
| 95 | FP-095 | API da SEFAZ, prefeitura ou conector indisponível | Integrações e Compliance |
| 96 | FP-096 | Credencial, assinatura ou permissão inválida | Integrações e Compliance |
| 97 | FP-097 | Leiaute, schema ou versão de integração obsoletos | Integrações e Compliance |
| 98 | FP-098 | CNPJ alfanumérico não suportado | Integrações e Compliance |
| 99 | FP-099 | Campos ou cálculo de IBS/CBS ausentes ou incorretos | Integrações e Compliance |
| 100 | FP-100 | Ausência de trilha, indicadores e alertas de exceção | Monitoramento e Insights |

O arquivo executável que alimenta a triagem é `src/knowledge/fiscal-problems.ts`. Cada item também contém palavras-chave, prioridade, fontes e o menor próximo passo seguro.

