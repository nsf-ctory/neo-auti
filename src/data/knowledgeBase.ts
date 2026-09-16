/**
 * BASE DE CONHECIMENTO CANÔNICA // NEØFLOW TIKTOK PARTNER
 * Memória persistente e dados de operação para o agente de triagem >_ neøtiko.
 */

export interface KnowledgeSection {
  id: string;
  topic: string;
  summary: string;
  details: string[];
}

export const ECOSYSTEM_KNOWLEDGE = {
  institution: {
    legalName: "FLOWOFF MARKETING E ASSESSORIA DIGITAL LTDA",
    cnpj: "43.376.355/0001-92",
    city: "Goiânia (GO) - Brasil",
    partnerStatus: "TikTok Shop Partner Oficial & TikTok One Creative Partner",
    enterpriseId: "7614619530886840336",
    orgId: "7620915620019864596",
    officialApp: "NEØFLOW TTS Connector (Service ID 7614526955808622356)",
    verifiedDate: "2026-07-04",
  },
  manifesto: {
    coreBelief: "Não somos agência de marketing de atendimento, não vendemos horas de suporte e não operamos por planilha. Desbloqueamos infraestrutura, dados de inteligência e recursos exclusivos que o lojista, creator ou gestor não consegue acessar pelo painel padrão do TikTok.",
    notAgency: "Sem reuniões vazias de alinhamento, sem posts institucionais genéricos e sem retenção de pagamentos. Operação no nível de engenharia e produto.",
  },
  territories: [
    {
      code: "01",
      name: "SHOP / SELLERS",
      target: "Lojistas, marcas e operações de e-commerce que querem vender no TikTok Shop.",
      prerequisites: [
        "CNPJ ativo e regular no Brasil (MEI, ME, LTDA ou S/A).",
        "Cadastro de vendedor aprovado no TikTok Shop Seller Center oficial (seller-br.tiktok.com).",
        "Estoque físico expedido a partir do território brasileiro com emissão de Nota Fiscal eletrônica (NF-e).",
      ],
      unlockedFeatures: [
        "Radar de Top Sellers: Dados de inteligência de catálogo para identificar quais produtos do seu nicho têm tração comprovada de vendas e alta conversão no TikTok.",
        "Aba Exclusiva de Creators: Ferramenta proprietária neøflow para pesquisar, filtrar e conectar criadores de conteúdo alinhados ao seu produto para comissionamento e envio de amostras sem intermediários de agência.",
        "Sincronização Oficial via API: Produtos, estoque e pedidos sincronizados em tempo real sem planilhas manuais.",
        "Split Automático de Pagamento: Divisão nativa no ato da compra entre seller, criador e taxas, 100% hands-off.",
      ],
      officialRoute: "/sellers/conectar",
      fallbackIfNoShop: "Orientar abertura prévia de conta de vendedor em https://seller-br.tiktok.com antes de conectar com a neøflow.",
    },
    {
      code: "02",
      name: "CREATORS / AFILIADOS",
      target: "Criadores de conteúdo, influenciadores, apresentadores de LIVE e streamers.",
      prerequisites: [
        "Conta ativa e em conformidade com as Diretrizes da Comunidade do TikTok.",
        "Perfil habilitado para o programa Alliance Creator / TikTok Shop Creator.",
        "CPF ou CNPJ cadastrado para recebimento de comissões na carteira do TikTok.",
      ],
      unlockedFeatures: [
        "Conteúdo no Centro: Monetização nativa integrada aos vídeos e LIVEs sem parecer publicidade invasiva ou forçada.",
        "Catálogo Curado com Estoque Real: Acesso a produtos de marcas verificadas no Brasil com entrega garantida aos seguidores.",
        "Checkout 1-Clique em 9:16 Minis: Páginas de produto em formato vertical para compra instantânea por Pix sem sair do app.",
        "Comissões Diretas na Carteira: Split nativo processado pelo TikTok, sem risco de calote ou relatórios manuais de marcas.",
      ],
      officialRoute: "/creators",
      oauthDomain: "shop.tiktok.com",
    },
    {
      code: "03",
      name: "MARKETING & GROWTH",
      target: "Gestores de tráfego, estrategistas de performance, marcas que anunciam no TikTok Ads.",
      prerequisites: [
        "Conta de administrador ou operador no TikTok Business Center.",
        "TikTok Ads Manager ativo com saldo ou forma de pagamento configurada.",
        "Catálogo sincronizado com o TikTok Catalog Manager / TikTok Shop.",
      ],
      unlockedFeatures: [
        "Conexão SKU-Tráfego: Anúncios alimentados pelo estoque e pelas vendas reais do Shop (zero desperdício com produtos pausados).",
        "TikTok Symphony & Creative Studio: Acesso aos recursos oficiais de IA generativa para roteiros, avatares e criativos nativos em escala.",
        "Créditos & Tokens Institucionais: O TikTok One e o Creative Studio disponibilizam cotas de tokens e créditos oficiais de IA e até 15% de Traffic Lift Credits (cashback algorítmico em visualizações para Spark Ads nos primeiros 7 dias).",
        "Spark Ads & Events API: Impulsionamento com código de autorização de criadores e rastreamento seguro via Events API com SHA-256.",
      ],
      officialRoute: "/marketing",
    },
    {
      code: "04",
      name: "TECH & INTEGRADORES",
      target: "Desenvolvedores, CTOs, arquitetos de software e operadores de ERPs, hubs e plataformas de e-commerce.",
      prerequisites: [
        "Ambiente técnico com suporte a chamadas REST, endpoints de Webhook e credenciais seguras.",
        "Service Account com chave de API ou credenciais de integração no Partner Center.",
      ],
      unlockedFeatures: [
        "SDK Oficial @neomello/tiktok-sdk: Modelos fortemente tipados cobrindo 41 escopos oficiais de API do TikTok Shop (Lojas, Pedidos, Finanças, Logística, Produtos e Devoluções).",
        "Motor de Webhooks Assíncronos: Processamento em tempo real com BullMQ + Redis, idempotência e assinatura HMAC SHA-256.",
        "Auto-Refresh de Tokens em Background: Gestão automática do ciclo de vida dos tokens OAuth para zero queda de sessão em produção.",
        "Integração com ERPs Nacionais: Conexão facilitada para Bling, Tiny, VTEX, Shopify e hubs de marketplace.",
      ],
      officialRoute: "/tech",
    },
  ],
  faqs: [
    {
      question: "Vocês deixam acessar o Symphony de graça / sem pagar?",
      answer: "O TikTok Creative Studio e a suíte TikTok Symphony disponibilizam modelos de inteligência artificial, avatares e ferramentas de edição dentro do ecossistema oficial do TikTok One. Para marcas e parceiros qualificados, o TikTok libera cotas de tokens de IA e créditos de tráfego (Traffic Lift Credits). Não é um atalho sem regras: o uso consome a cota de tokens oficiais disponibilizados pela própria plataforma do TikTok, sem que a marca precise pagar estúdios de produção convencionais por fora.",
    },
    {
      question: "Posso conectar minha loja usando apenas CPF (Pessoa Física)?",
      answer: "Não. A operação de vendas no TikTok Shop Brasil é estritamente regulamentada e exige CNPJ ativo (MEI, ME, LTDA ou S/A), emissão de Nota Fiscal e estoque despachado no Brasil. Se você ainda opera como pessoa física, recomendamos regularizar seu MEI ou empresa antes de conectar.",
    },
    {
      question: "A neøflow cobra mensalidade fixa de agência de marketing?",
      answer: "Não. A neøflow opera como infraestrutura tecnológica e partner oficial. Não cobramos mensalidades de fee de agência para fazer 'atendimento' ou 'gestão de redes'. Nossa remuneração e viabilização ocorrem por split nativo de comissões, infraestrutura de parceiro e pacotes institucionais garantidos.",
    },
    {
      question: "O que acontece quando clico em 'Conectar minha Shop'?",
      answer: "Você é redirecionado em ambiente seguro para o portal oficial do TikTok Shop (services.tiktokshop.com) para aprovar o acesso do app oficial NEØFLOW TTS Connector. Suas senhas e credenciais bancárias nunca são compartilhadas com a neøflow. Assim que você autoriza, seu catálogo e pedidos são integrados ao ecossistema.",
    },
    {
      question: "E se eu ainda não tiver conta no TikTok Shop Seller Center?",
      answer: "Sem problemas! O primeiro passo é criar sua conta oficial de vendedor no Seller Center do TikTok Brasil (https://seller-br.tiktok.com). Assim que seus documentos forem aprovados pelo TikTok, você volta aqui para conectar à neøflow e ativar os recursos de Top Sellers e creators.",
    },
  ],
};

/**
 * Monta o bloco de conhecimento detalhado para ser incorporado na memória do agente.
 */
export function buildKnowledgeMemoryPrompt(): string {
  const t = ECOSYSTEM_KNOWLEDGE;
  const parts: string[] = [];

  parts.push(`\n[BASE DE CONHECIMENTO INSTITUCIONAL & MEMÓRIA DO ECOSSISTEMA]`);
  parts.push(`- Entidade Oficial: ${t.institution.legalName} (CNPJ ${t.institution.cnpj}), com sede em ${t.institution.city}.`);
  parts.push(`- Credenciamento: ${t.institution.partnerStatus} (Business Center ${t.institution.enterpriseId}, Org ID ${t.institution.orgId}).`);
  parts.push(`- Aplicativo Oficial Homologado no Service Market: ${t.institution.officialApp}.`);
  parts.push(`- Posicionamento Soberano: ${t.manifesto.coreBelief}`);

  parts.push(`\n[OS 4 TERRITÓRIOS E SUAS REGRAS DE QUALIFICAÇÃO]`);
  t.territories.forEach((terr) => {
    parts.push(`\n### TERRITÓRIO ${terr.code} // ${terr.name}`);
    parts.push(`- Público: ${terr.target}`);
    parts.push(`- Pré-requisitos Obrigatórios:\n  * ${terr.prerequisites.join("\n  * ")}`);
    parts.push(`- Recursos Desbloqueados Exclusivos:\n  * ${terr.unlockedFeatures.join("\n  * ")}`);
    parts.push(`- Rota de Ação Oficial: ${terr.officialRoute}`);
    if (terr.fallbackIfNoShop) {
      parts.push(`- Rota Alternativa se não tiver loja: ${terr.fallbackIfNoShop}`);
    }
  });

  parts.push(`\n[PERGUNTAS FREQUENTES E RESPOSTAS DE REFERÊNCIA (FAQ)]`);
  t.faqs.forEach((faq, i) => {
    parts.push(`${i + 1}. Pergunta: "${faq.question}"\n   Resposta de autoridade: "${faq.answer}"`);
  });

  return parts.join("\n");
}
