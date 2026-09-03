export type FiscalSpecialistId =
  | "intake_capture"
  | "tax_validation"
  | "po_reconciliation"
  | "approval_workflow"
  | "document_lifecycle"
  | "supplier_risk"
  | "integration_compliance"
  | "monitoring_insights";

export type FiscalProblemPriority = "critical" | "high" | "recurring" | "emerging";

export interface FiscalProblem {
  id: string;
  rank: number;
  title: string;
  category: string;
  specialist: FiscalSpecialistId;
  priority: FiscalProblemPriority;
  keywords: readonly string[];
  nextAction: string;
  sourceIds: readonly string[];
}

export const fiscalResearchSources = {
  "sson-ap-2025": {
    title: "State of AP 2025 — SSON",
    url: "https://eco-cdn.iqpc.com/eco/files/channel_content/posts/sson-stateofap2025trendsinsightspapaya03mDKiNFX1pHeAYfXOAaWYiqY2RttGHm1a6xvs697s.pdf",
  },
  "ifol-ap-2025": {
    title: "Accounts Payable Automation Trends 2025 — IFOL",
    url: "https://acarp-edu.org/new-global-research-highlights-pressure-points-and-priorities-in-ap-automation-in-2025/",
  },
  "nfe-rejections": {
    title: "50 maiores rejeições em um dia — Portal NF-e",
    url: "https://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=R7Y%2FbEE%2FRM8%3D",
  },
  "nfe-faq": {
    title: "Perguntas frequentes e manifestação do destinatário — Portal NF-e",
    url: "https://www.nfe.fazenda.gov.br/Portal/perguntasFrequentes.aspx?AspxAutoDetectCookieSupport=1&tipoConteudo=PN6e+JQMTxs%3D",
  },
  "rfb-cce": {
    title: "Carta de Correção de NF-e — Receita Federal",
    url: "https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/exportacao-portal-unico/elaboracao-da-due/carta-de-correcao-de-nota-fiscal-eletronica",
  },
  "sefaz-sp-cancel": {
    title: "Cancelamento extemporâneo de NF-e — Sefaz-SP",
    url: "https://portal.fazenda.sp.gov.br/servicos/nfe/Paginas/cancelamentoextemp.aspx/1000",
  },
  "rfb-rtc-2026": {
    title: "Orientações da Reforma Tributária para 2026 — Receita Federal",
    url: "https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/acoes-e-programas/programas-e-atividades/reforma-tributaria-do-consumo/orientacoes-2026",
  },
  "nfse-nt009": {
    title: "Nota Técnica 009 da NFS-e — Portal NFS-e",
    url: "https://www.gov.br/nfse/pt-br/noticias/publicada-a-nota-tecnica-009-da-nfs-e/",
  },
  "afp-fraud-2025": {
    title: "Payments Fraud and Control Survey 2025 — AFP",
    url: "https://www.financialprofessionals.org/about/learn-more/press-releases/Details/survey-79-percent-of-organizations-were-victims-of-attempted-or-actual-payments-fraud-activity-in-2024",
  },
  "b9-discovery": {
    title: "Descoberta B9 Pulse / Priscilla — monitoramento do ciclo de vida da NF",
    url: "https://github.com/rodrigo-freitas-biti9/agents",
  },
} as const;

function problem(
  rank: number,
  title: string,
  category: string,
  specialist: FiscalSpecialistId,
  priority: FiscalProblemPriority,
  keywords: readonly string[],
  nextAction: string,
  sourceIds: readonly string[],
): FiscalProblem {
  return {
    id: `FP-${String(rank).padStart(3, "0")}`,
    rank,
    title,
    category,
    specialist,
    priority,
    keywords,
    nextAction,
    sourceIds,
  };
}

// Lista priorizada para o produto, não um ranking estatístico universal. A ordem combina
// incidência publicada, impacto operacional, risco fiscal e aderência ao escopo do B9 Pulse.
export const fiscalProblems: readonly FiscalProblem[] = [
  problem(1, "Digitação manual de dados da nota", "captura", "intake_capture", "critical", ["digitacao manual", "lancamento manual", "entrada manual", "digitar no erp"], "Extrair XML/OCR, validar campos críticos e enviar somente exceções para revisão.", ["sson-ap-2025", "ifol-ap-2025"]),
  problem(2, "Atraso no processamento da nota", "operacao", "monitoring_insights", "critical", ["atraso no processamento", "nota parada", "demora para processar", "fila de notas"], "Localizar a etapa e o responsável atuais e iniciar o SLA de tratamento.", ["sson-ap-2025", "ifol-ap-2025", "b9-discovery"]),
  problem(3, "Complexidade de conformidade e regras tributárias", "tributacao", "integration_compliance", "critical", ["complexidade tributaria", "conformidade fiscal", "regra tributaria", "compliance fiscal"], "Identificar documento, jurisdição, vigência e regra aplicável antes de recomendar correção.", ["sson-ap-2025", "rfb-rtc-2026"]),
  problem(4, "Erro de conciliação entre nota, OC e recebimento", "conciliacao", "po_reconciliation", "critical", ["erro de conciliacao", "three way match", "nota oc recebimento", "conciliar nota"], "Comparar fornecedor, itens, quantidades, valores, contrato e recebimento.", ["sson-ap-2025", "b9-discovery"]),
  problem(5, "Nota fiscal duplicada", "risco", "supplier_risk", "critical", ["nota duplicada", "duplicidade de nota", "nf duplicada", "duplicidade nf-e", "rejeicao 204", "rejeicao 539"], "Comparar chave, número, série, fornecedor, valor e data; bloquear descarte até confirmação.", ["nfe-rejections", "sson-ap-2025"]),
  problem(6, "Nota sem ordem de compra", "conciliacao", "po_reconciliation", "critical", ["sem oc", "nao tem oc", "sem ordem de compra", "non-po", "nota sem pedido"], "Localizar contrato/solicitação ou encaminhar para fluxo excepcional com dono definido.", ["sson-ap-2025", "b9-discovery"]),
  problem(7, "Aprovação parada ou sem resposta", "workflow", "approval_workflow", "critical", ["aprovacao parada", "aguardando aprovacao", "aprovador nao responde", "aprovar nota", "pendente de aprovacao"], "Identificar aprovador, tempo na etapa, substituto e evidências faltantes.", ["sson-ap-2025", "b9-discovery"]),
  problem(8, "Falta de visão do ciclo de vida da NF", "monitoramento", "monitoring_insights", "critical", ["status da nota", "ciclo de vida", "onde esta a nota", "acompanhar nota", "visibilidade das notas"], "Consolidar recebida, validada, aprovada, a pagar, paga, rejeitada e cancelada com timestamps.", ["b9-discovery", "sson-ap-2025"]),
  problem(9, "XML não recebido ou indisponível", "captura", "intake_capture", "critical", ["xml nao recebido", "sem xml", "xml indisponivel", "fornecedor nao enviou xml"], "Consultar distribuição/manifestação e solicitar o XML ao emitente quando necessário.", ["nfe-faq", "b9-discovery"]),
  problem(10, "Comunicação lenta ou opaca com fornecedor", "fornecedor", "supplier_risk", "high", ["fornecedor nao responde", "cobrar fornecedor", "comunicacao com fornecedor", "status para fornecedor"], "Gerar solicitação objetiva com documento, divergência, evidência e prazo.", ["sson-ap-2025", "b9-discovery"]),
  problem(11, "Risco de fraude ou documento de fornecedor falso", "risco", "supplier_risk", "critical", ["fraude", "fornecedor falso", "documento falso", "golpe", "fornecedor impostor"], "Suspender a ação financeira, validar identidade e canal do fornecedor e escalar ao controle antifraude.", ["afp-fraud-2025"]),
  problem(12, "Falha de integração com ERP ou sistema fiscal", "integracao", "integration_compliance", "critical", ["falha no erp", "integracao erp", "nao integrou", "erro de sincronizacao", "sync falhou"], "Comparar IDs, payload, fila, retorno e idempotência; reprocessar somente com segurança.", ["ifol-ap-2025", "sson-ap-2025"]),
  problem(13, "NCM inexistente", "validacao", "tax_validation", "critical", ["ncm inexistente", "rejeicao 778", "ncm invalido"], "Validar o NCM vigente no cadastro do item e corrigir a origem antes de retransmitir.", ["nfe-rejections"]),
  problem(14, "Certificado digital expirado", "integracao", "integration_compliance", "critical", ["certificado expirado", "certificado vencido", "rejeicao 291"], "Renovar/substituir o certificado, conferir cadeia e validade e repetir a assinatura.", ["nfe-rejections"]),
  problem(15, "CSOSN indevido para o item", "validacao", "tax_validation", "high", ["csosn indevido", "rejeicao 383", "csosn errado"], "Validar CRT, operação e regra do item antes de ajustar o CSOSN.", ["nfe-rejections"]),
  problem(16, "Hash do QR Code divergente", "validacao", "tax_validation", "high", ["hash qr code", "qr code divergente", "rejeicao 464"], "Recalcular o hash com CSC, parâmetros e versão corretos.", ["nfe-rejections"]),
  problem(17, "Parâmetros do QR Code divergentes da nota", "validacao", "tax_validation", "high", ["parametro qr code", "rejeicao 397", "qr code diferente da nota"], "Comparar parâmetros do QR Code com o XML assinado e regenerá-lo.", ["nfe-rejections"]),
  problem(18, "Data e hora de emissão atrasadas", "validacao", "tax_validation", "high", ["data hora atrasada", "emissao atrasada", "rejeicao 704"], "Sincronizar relógio/fuso e validar a regra de tolerância antes da retransmissão.", ["nfe-rejections"]),
  problem(19, "CFOP inválido", "validacao", "tax_validation", "critical", ["cfop invalido", "cfop errado", "rejeicao 725"], "Reclassificar a natureza da operação e validar origem/destino antes de alterar o CFOP.", ["nfe-rejections"]),
  problem(20, "Total da nota difere das formas de pagamento", "valores", "tax_validation", "critical", ["total difere pagamento", "somatorio pagamentos", "rejeicao 767"], "Recalcular total, pagamentos, troco e arredondamentos por item.", ["nfe-rejections"]),
  problem(21, "CFOP incompatível com CSOSN", "validacao", "tax_validation", "high", ["cfop csosn", "rejeicao 386", "cfop nao permitido csosn"], "Validar a combinação CFOP/CSOSN conforme operação e regime.", ["nfe-rejections"]),
  problem(22, "CFOP incompatível com CST", "validacao", "tax_validation", "high", ["cfop cst", "rejeicao 382", "cfop nao permitido cst"], "Validar a combinação CFOP/CST e a natureza da operação.", ["nfe-rejections"]),
  problem(23, "Total de PIS difere do somatório dos itens", "valores", "tax_validation", "high", ["total pis", "pis difere", "rejeicao 602"], "Recalcular PIS item a item e reconciliar com o total do documento.", ["nfe-rejections"]),
  problem(24, "CST indevido para o item", "validacao", "tax_validation", "high", ["cst indevido", "cst errado", "rejeicao 766"], "Validar tributação, regime e finalidade do item antes de corrigir o CST.", ["nfe-rejections"]),
  problem(25, "Entrada em contingência registrada com atraso", "ciclo_de_vida", "document_lifecycle", "high", ["contingencia atrasada", "data de contingencia", "rejeicao 569"], "Validar justificativa, data/hora e modalidade de contingência utilizada.", ["nfe-rejections"]),
  problem(26, "Base total de ICMS difere dos itens", "valores", "tax_validation", "high", ["base icms difere", "total bc icms", "rejeicao 531"], "Recalcular bases de ICMS e tolerâncias por item.", ["nfe-rejections"]),
  problem(27, "Numeração da NF-e já inutilizada", "ciclo_de_vida", "document_lifecycle", "high", ["nota inutilizada", "numeracao inutilizada", "rejeicao 206"], "Confirmar o evento de inutilização e gerar nova numeração válida.", ["nfe-rejections"]),
  problem(28, "Data de emissão posterior ao recebimento", "validacao", "tax_validation", "high", ["emissao posterior", "horario de recebimento", "rejeicao 703"], "Corrigir relógio, fuso e sequência de emissão antes de retransmitir.", ["nfe-rejections"]),
  problem(29, "UF do emitente diverge da autorizadora", "validacao", "tax_validation", "high", ["uf autorizadora", "uf do emitente", "rejeicao 226"], "Direcionar a autorização para a UF/serviço competente.", ["nfe-rejections"]),
  problem(30, "Total de produtos/serviços difere dos itens", "valores", "tax_validation", "critical", ["total produtos difere", "somatorio dos itens", "rejeicao 564"], "Recalcular valores de item, descontos, frete e outras despesas.", ["nfe-rejections"]),
  problem(31, "Total de desconto difere dos itens", "valores", "tax_validation", "high", ["desconto difere", "total desconto", "rejeicao 537"], "Reconciliar desconto por item com o total informado.", ["nfe-rejections"]),
  problem(32, "NCM incompleto", "validacao", "tax_validation", "high", ["ncm incompleto", "ncm completo", "rejeicao 777"], "Preencher o código NCM completo e validar sua vigência.", ["nfe-rejections"]),
  problem(33, "Grupo de formas de pagamento ausente", "validacao", "tax_validation", "high", ["forma de pagamento ausente", "grupo de pagamento", "rejeicao 769"], "Informar o grupo de pagamento obrigatório conforme a operação.", ["nfe-rejections"]),
  problem(34, "CSOSN informado por emissor fora do Simples", "validacao", "tax_validation", "high", ["csosn nao simples", "crt diferente", "rejeicao 591"], "Conferir CRT do emitente e substituir CSOSN por CST quando aplicável.", ["nfe-rejections"]),
  problem(35, "GTIN/cEAN inválido", "validacao", "tax_validation", "high", ["cean invalido", "gtin invalido", "codigo de barras invalido", "rejeicao 611"], "Validar GTIN no cadastro do produto ou usar a indicação permitida para item sem GTIN.", ["nfe-rejections"]),
  problem(36, "NF-e já cancelada", "ciclo_de_vida", "document_lifecycle", "high", ["nota ja cancelada", "nfe cancelada", "rejeicao 218"], "Consultar protocolo/eventos e interromper qualquer processamento como nota ativa.", ["nfe-rejections"]),
  problem(37, "Destinatário igual ao emitente indevidamente", "validacao", "tax_validation", "high", ["destinatario igual emitente", "rejeicao 220"], "Validar o tipo de operação e os identificadores das partes.", ["nfe-rejections"]),
  problem(38, "CSC do QR Code não cadastrado", "integracao", "integration_compliance", "high", ["csc nao cadastrado", "codigo csc", "rejeicao 462"], "Cadastrar/ativar o CSC correto para o ambiente e regenerar o QR Code.", ["nfe-rejections"]),
  problem(39, "CPF do destinatário inválido", "cadastro", "tax_validation", "high", ["cpf invalido", "cpf destinatario", "rejeicao 237"], "Validar dígitos, titular e origem do cadastro antes de corrigir.", ["nfe-rejections"]),
  problem(40, "Valor do troco incorreto", "valores", "tax_validation", "high", ["troco incorreto", "valor do troco", "rejeicao 869"], "Recalcular pagamentos menos total da NFC-e e ajustar o troco.", ["nfe-rejections"]),
  problem(41, "Chave de acesso inconsistente com o XML", "validacao", "tax_validation", "critical", ["chave de acesso errada", "id nao corresponde", "rejeicao 502", "chave inconsistente"], "Recompor a chave pelos campos do documento e corrigir a origem do XML.", ["nfe-rejections"]),
  problem(42, "Documento ilegível ou OCR com baixa confiança", "captura", "intake_capture", "high", ["documento ilegivel", "ocr falhou", "baixa confianca", "imagem ruim"], "Solicitar XML/PDF original ou revisão humana apenas nos campos de baixa confiança.", ["sson-ap-2025", "b9-discovery"]),
  problem(43, "Anexo ausente, corrompido ou protegido", "captura", "intake_capture", "high", ["anexo ausente", "arquivo corrompido", "pdf protegido", "nao abre o anexo"], "Solicitar reenvio e registrar falha de captura sem criar uma nota incompleta.", ["b9-discovery"]),
  problem(44, "Tipo de documento não reconhecido", "captura", "intake_capture", "recurring", ["documento nao reconhecido", "tipo de nota", "nao e nota fiscal", "arquivo invalido"], "Classificar NF-e, NFS-e, CT-e, boleto ou anexo auxiliar antes do fluxo fiscal.", ["b9-discovery"]),
  problem(45, "Mesma nota capturada por canais diferentes", "captura", "intake_capture", "high", ["capturada duas vezes", "email e portal", "duplicidade de captura", "mesmo xml"], "Deduplicar por chave/hash antes de criar o registro operacional.", ["sson-ap-2025"]),
  problem(46, "Fila de e-mail ou portal não processada", "captura", "intake_capture", "high", ["email nao processado", "caixa fiscal parada", "portal nao importou", "fila de captura"], "Verificar último cursor, erro por mensagem e volume pendente; retomar de forma idempotente.", ["ifol-ap-2025"]),
  problem(47, "Campos obrigatórios ausentes no documento", "captura", "intake_capture", "high", ["campo obrigatorio ausente", "dados faltando na nota", "nota incompleta"], "Listar exatamente os campos faltantes e solicitar correção ao emitente.", ["nfe-faq"]),
  problem(48, "CNPJ inválido ou fornecedor não encontrado", "cadastro", "tax_validation", "critical", ["cnpj invalido", "fornecedor nao cadastrado", "cnpj nao encontrado"], "Validar CNPJ, razão social, situação cadastral e vínculo com o fornecedor.", ["nfe-faq", "b9-discovery"]),
  problem(49, "Inscrição estadual inválida ou incompatível", "cadastro", "tax_validation", "high", ["inscricao estadual invalida", "ie invalida", "ie divergente"], "Validar IE e UF no cadastro oficial e no XML.", ["nfe-faq"]),
  problem(50, "Código de serviço municipal incorreto", "tributacao", "tax_validation", "high", ["codigo de servico errado", "item lista servico", "servico municipal"], "Validar município competente, item da lista e código municipal vigente.", ["nfse-nt009"]),
  problem(51, "Município de incidência do ISS incorreto", "tributacao", "tax_validation", "high", ["municipio incidencia iss", "iss municipio errado", "local da prestacao"], "Conferir local da prestação, regra de incidência e retenção antes da correção.", ["nfse-nt009"]),
  problem(52, "Regime tributário do fornecedor desatualizado", "cadastro", "tax_validation", "high", ["regime tributario desatualizado", "simples nacional", "crt errado"], "Atualizar cadastro mestre com evidência e revalidar CST/CSOSN/retenções.", ["nfe-rejections", "nfse-nt009"]),
  problem(53, "Alíquota tributária incorreta", "tributacao", "tax_validation", "critical", ["aliquota incorreta", "imposto calculado errado", "aliquota divergente"], "Identificar tributo, base, vigência, jurisdição e benefício antes de recalcular.", ["rfb-rtc-2026", "nfse-nt009"]),
  problem(54, "ICMS-ST ou DIFAL calculado incorretamente", "tributacao", "tax_validation", "high", ["icms st errado", "difal errado", "substituicao tributaria"], "Validar origem/destino, produto, base, MVA e partilha aplicáveis.", ["rfb-rtc-2026"]),
  problem(55, "PIS/COFINS devido versus retido inconsistente", "tributacao", "tax_validation", "high", ["pis cofins retido", "pis cofins errado", "tributo retido"], "Separar valores devidos e retidos, conferindo base, CST e arredondamento.", ["nfse-nt009"]),
  problem(56, "Retenção de ISS incorreta", "tributacao", "tax_validation", "high", ["iss retido errado", "retencao iss", "iss nao retido"], "Validar município, tomador, serviço e responsabilidade pela retenção.", ["nfse-nt009"]),
  problem(57, "Retenções federais divergentes", "tributacao", "tax_validation", "high", ["inss irrf csll", "retencoes federais", "irrf errado"], "Recalcular cada retenção com base, alíquota, limite e natureza do serviço.", ["sson-ap-2025"]),
  problem(58, "Diferença de centavos por arredondamento", "valores", "tax_validation", "recurring", ["diferenca de centavos", "arredondamento", "tolerancia de valor"], "Aplicar a tolerância configurada e registrar o cálculo por item.", ["nfse-nt009", "sson-ap-2025"]),
  problem(59, "Frete, seguro ou outras despesas divergentes", "valores", "po_reconciliation", "high", ["frete divergente", "seguro divergente", "outras despesas", "acrescimo na nota"], "Comparar despesas acessórias com OC, contrato e base tributária.", ["nfe-rejections", "b9-discovery"]),
  problem(60, "Fornecedor da nota diverge da OC", "conciliacao", "po_reconciliation", "critical", ["fornecedor diverge da oc", "cnpj diferente da oc", "fornecedor da nota errado"], "Validar grupo econômico, cessão/filial e fornecedor autorizado antes de vincular.", ["b9-discovery", "sson-ap-2025"]),
  problem(61, "OC fechada, cancelada ou bloqueada", "conciliacao", "po_reconciliation", "high", ["oc fechada", "oc cancelada", "oc bloqueada", "pedido fechado"], "Confirmar status e motivo da OC; solicitar reabertura ou nova OC ao dono.", ["b9-discovery"]),
  problem(62, "Saldo da OC insuficiente", "conciliacao", "po_reconciliation", "critical", ["saldo da oc", "oc sem saldo", "saldo insuficiente"], "Calcular consumo confirmado e pendente e apontar o valor exato da insuficiência.", ["b9-discovery"]),
  problem(63, "Risco de estouro do orçamento da OC", "monitoramento", "monitoring_insights", "critical", ["estouro da oc", "over budget", "risco de estouro", "orcamento da oc"], "Projetar consumo versus período e alertar responsável com antecedência.", ["b9-discovery"]),
  problem(64, "Valor da NF diverge do valor contratado", "conciliacao", "po_reconciliation", "critical", ["valor divergente", "valor da nota diferente", "mismatch", "valor contratado"], "Comparar NF, OC, contrato, medição, impostos e tolerância.", ["sson-ap-2025", "b9-discovery"]),
  problem(65, "Quantidade faturada diverge do recebido", "conciliacao", "po_reconciliation", "critical", ["quantidade divergente", "faturou a mais", "quantidade recebida", "recebimento parcial"], "Conciliar item e unidade de medida com o recebimento físico.", ["sson-ap-2025"]),
  problem(66, "Recebimento de mercadoria não registrado", "conciliacao", "po_reconciliation", "high", ["sem recebimento", "mercadoria nao recebida", "entrada nao registrada", "gr missing"], "Localizar comprovante/entrada e encaminhar ao recebedor responsável.", ["sson-ap-2025"]),
  problem(67, "Medição ou aceite de serviço ausente", "conciliacao", "po_reconciliation", "high", ["medicao ausente", "aceite do servico", "servico nao atestado"], "Solicitar medição/aceite com período, responsável e evidência da entrega.", ["b9-discovery"]),
  problem(68, "Linha ou item incorreto da OC", "conciliacao", "po_reconciliation", "high", ["linha da oc errada", "item da oc", "pedido item incorreto"], "Identificar a linha compatível e validar saldo e categoria antes de revincular.", ["b9-discovery"]),
  problem(69, "Nota fora da vigência do contrato ou OC", "conciliacao", "po_reconciliation", "high", ["fora da vigencia", "contrato vencido", "periodo da oc"], "Conferir competência, vigência e autorização excepcional documentada.", ["b9-discovery"]),
  problem(70, "Parcelamento ou faturamento parcial inconsistente", "conciliacao", "po_reconciliation", "high", ["faturamento parcial", "parcela errada", "nota parcelada"], "Reconstruir cronograma, parcelas já faturadas e saldo remanescente.", ["b9-discovery"]),
  problem(71, "Centro de custo, área ou projeto ausente", "workflow", "approval_workflow", "high", ["centro de custo ausente", "sem area", "projeto nao informado", "rateio ausente"], "Inferir nunca; solicitar ao dono da despesa o centro de custo/rateio correto.", ["b9-discovery"]),
  problem(72, "Aprovador não identificado", "workflow", "approval_workflow", "high", ["quem aprova", "aprovador nao identificado", "sem aprovador"], "Resolver pela matriz de alçada, área, centro de custo e valor.", ["b9-discovery"]),
  problem(73, "Aprovador ausente, desligado ou sem substituto", "workflow", "approval_workflow", "high", ["aprovador ausente", "aprovador de ferias", "aprovador desligado", "sem substituto"], "Aplicar delegação válida ou escalar ao gestor da matriz de alçada.", ["b9-discovery"]),
  problem(74, "SLA de aprovação vencido", "workflow", "approval_workflow", "critical", ["sla vencido", "aprovacao atrasada", "tempo de aprovacao"], "Alertar aprovador e gestor com idade da pendência e impacto no vencimento.", ["sson-ap-2025", "b9-discovery"]),
  problem(75, "Aprovação fora da alçada", "workflow", "approval_workflow", "critical", ["fora da alcada", "aprovacao indevida", "sem autorizacao"], "Bloquear progressão e validar matriz de alçada e identidade do aprovador.", ["sson-ap-2025"]),
  problem(76, "Quebra de segregação de funções", "workflow", "approval_workflow", "critical", ["segregacao de funcoes", "mesma pessoa aprovou", "conflito de acesso"], "Impedir autoaprovação e encaminhar a um aprovador independente.", ["sson-ap-2025"]),
  problem(77, "Rejeição interna sem motivo registrado", "workflow", "approval_workflow", "high", ["rejeitada sem motivo", "motivo da rejeicao", "rejeicao interna"], "Exigir motivo objetivo e evidência para retorno ao solicitante/fornecedor.", ["b9-discovery"]),
  problem(78, "Fluxo de múltiplas aprovações inconsistente", "workflow", "approval_workflow", "high", ["multiplas aprovacoes", "fluxo de aprovacao", "etapa pulada"], "Comparar a rota executada com a matriz vigente e corrigir a próxima etapa.", ["b9-discovery"]),
  problem(79, "NF pendente de autorização na SEFAZ", "ciclo_de_vida", "document_lifecycle", "critical", ["pendente de autorizacao", "sefaz processando", "nota nao autorizada"], "Consultar recibo/status do serviço e evitar duplicar o envio sem idempotência.", ["nfe-faq"]),
  problem(80, "NF-e denegada", "ciclo_de_vida", "document_lifecycle", "critical", ["nota denegada", "nfe denegada", "denegacao"], "Consultar motivo cadastral/fiscal e impedir uso do documento denegado.", ["nfe-faq"]),
  problem(81, "Protocolo de autorização ausente ou divergente", "ciclo_de_vida", "document_lifecycle", "critical", ["sem protocolo", "protocolo divergente", "autorizacao ausente"], "Consultar a chave na SEFAZ e reconciliar XML, protocolo e status.", ["nfe-faq"]),
  problem(82, "Prazo de cancelamento perdido", "ciclo_de_vida", "document_lifecycle", "critical", ["cancelamento fora do prazo", "cancelamento extemporaneo", "perdeu prazo cancelar"], "Verificar circulação, UF, prazo e requisitos do cancelamento extemporâneo.", ["sefaz-sp-cancel"]),
  problem(83, "Cancelamento bloqueado por CT-e, MDF-e ou evento", "ciclo_de_vida", "document_lifecycle", "critical", ["cancelamento bloqueado", "cte mdfe", "evento impede cancelamento", "averbacao"], "Listar o evento bloqueador e orientar a regularização aplicável.", ["sefaz-sp-cancel"]),
  problem(84, "Tentativa de usar CC-e para campo não permitido", "ciclo_de_vida", "document_lifecycle", "critical", ["carta de correcao valor", "cce valor", "cce cnpj", "cce data", "carta de correcao nao permite"], "Impedir CC-e para valor/base, identidade das partes ou datas e indicar o procedimento fiscal cabível.", ["rfb-cce"]),
  problem(85, "Carta de correção necessária e ainda não emitida", "ciclo_de_vida", "document_lifecycle", "high", ["emitir carta de correcao", "cce pendente", "corrigir descricao"], "Confirmar que o campo é corrigível e preparar o texto/evento para validação humana.", ["rfb-cce"]),
  problem(86, "Manifestação do destinatário pendente", "ciclo_de_vida", "document_lifecycle", "high", ["manifestacao pendente", "sem manifestacao", "ciencia da emissao"], "Exibir prazo e solicitar manifestação conclusiva adequada.", ["nfe-faq"]),
  problem(87, "Manifestação do destinatário incorreta", "ciclo_de_vida", "document_lifecycle", "critical", ["manifestacao incorreta", "confirmou por engano", "desconheceu por engano"], "Consultar eventos e prazo e orientar a manifestação conclusiva correta permitida.", ["nfe-faq"]),
  problem(88, "Operação desconhecida usando CNPJ/IE da empresa", "risco", "supplier_risk", "critical", ["operacao desconhecida", "nao reconheco a nota", "uso indevido do cnpj", "nota que nao e minha"], "Registrar evidências e preparar manifestação de desconhecimento após confirmação humana.", ["nfe-faq", "afp-fraud-2025"]),
  problem(89, "Operação não realizada ou mercadoria recusada", "ciclo_de_vida", "document_lifecycle", "high", ["operacao nao realizada", "mercadoria recusada", "nao recebeu mercadoria"], "Validar o fato e preparar o evento de operação não realizada.", ["nfe-faq"]),
  problem(90, "Devolução total ou parcial não vinculada", "ciclo_de_vida", "document_lifecycle", "high", ["devolucao nao vinculada", "nota de devolucao", "devolucao parcial"], "Relacionar NF original, itens/quantidades devolvidos e documento de devolução.", ["nfe-faq"]),
  problem(91, "Status de pagamento divergente ou sem evidência", "monitoramento", "monitoring_insights", "critical", ["status de pagamento", "consta pago", "sem comprovante", "pagamento sem evidencia"], "Reconciliar status e identificador do pagamento sem iniciar controle amplo de caixa.", ["sson-ap-2025", "b9-discovery"]),
  problem(92, "Vencimento divergente ou risco de atraso", "monitoramento", "monitoring_insights", "high", ["vencimento divergente", "risco de atraso", "pagamento atrasado", "nota vencida"], "Comparar vencimento da NF, contrato e prazo de aprovação e apontar o bloqueio.", ["sson-ap-2025", "b9-discovery"]),
  problem(93, "Alteração suspeita de dados bancários do fornecedor", "risco", "supplier_risk", "critical", ["mudou conta bancaria", "dados bancarios alterados", "troca de banco fornecedor", "conta suspeita"], "Suspender ação e validar a alteração por canal independente e cadastro mestre.", ["afp-fraud-2025"]),
  problem(94, "Fornecedor duplicado ou cadastro mestre inconsistente", "cadastro", "supplier_risk", "high", ["fornecedor duplicado", "cadastro fornecedor duplicado", "vendor master", "cadastro mestre"], "Comparar CNPJ, razão social, filiais e dados bancários antes de consolidar.", ["sson-ap-2025"]),
  problem(95, "API da SEFAZ, prefeitura ou conector indisponível", "integracao", "integration_compliance", "critical", ["sefaz indisponivel", "prefeitura fora do ar", "api indisponivel", "timeout conector"], "Confirmar disponibilidade, ativar contingência/retry com backoff e preservar idempotência.", ["nfe-faq", "nfse-nt009"]),
  problem(96, "Credencial, assinatura ou permissão inválida", "integracao", "integration_compliance", "critical", ["credencial invalida", "assinatura invalida", "sem permissao", "erro autenticacao"], "Validar identidade, escopo, cadeia do certificado e ambiente sem expor segredos.", ["nfe-faq", "nfe-rejections"]),
  problem(97, "Leiaute, schema ou versão de integração obsoletos", "integracao", "integration_compliance", "critical", ["schema desatualizado", "layout obsoleto", "versao do xml", "nota tecnica"], "Comparar versão em produção, nota técnica e data de vigência; atualizar com teste de contrato.", ["nfse-nt009", "rfb-rtc-2026"]),
  problem(98, "CNPJ alfanumérico não suportado", "reforma_tributaria", "integration_compliance", "emerging", ["cnpj alfanumerico", "novo formato cnpj", "cnpj com letras"], "Remover premissas numéricas de schema, banco, validação e integrações.", ["nfse-nt009"]),
  problem(99, "Campos ou cálculo de IBS/CBS ausentes ou incorretos", "reforma_tributaria", "integration_compliance", "critical", ["ibs cbs", "campos ibs", "campos cbs", "reforma tributaria", "gibscbs"], "Identificar documento, vigência e nota técnica e validar grupos, bases, alíquotas e valores.", ["rfb-rtc-2026", "nfse-nt009"]),
  problem(100, "Ausência de trilha, indicadores e alertas de exceção", "monitoramento", "monitoring_insights", "critical", ["sem trilha de auditoria", "sem indicadores", "sem alerta", "taxa de excecao", "monitoramento de nf"], "Registrar eventos, dono, timestamps e evidências; medir SLA, exceções, duplicidade e consumo da OC.", ["sson-ap-2025", "b9-discovery"]),
];

export const fiscalProblemsById = new Map(fiscalProblems.map((item) => [item.id, item]));
