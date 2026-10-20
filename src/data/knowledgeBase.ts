/**
 * BASE DE CONHECIMENTO CANÔNICA // NEØFLOW TIKTOK PARTNER
 * Memória persistente e dados de operação para o agente de triagem >_ neøtiko.
 * Atualizado com as homologações, verificações e lançamentos de outubro/2026.
 */

export interface KnowledgeSection {
  id: string;
  topic: string;
  summary: string;
  details: string[];
}

export const ECOSYSTEM_KNOWLEDGE = {
  institution: {
    legalName: "NEO:ONE INOVA SIMPLES (I.S.)",
    cnpj: "68.729.237/0001-41",
    tradeName: "neøflow // Official TikTok Partner (FlowOff TikTok Partner)",
    city: "Brasil",
    partnerStatus: "TikTok Shop Partner Oficial (Verified Enterprise) & TikTok One Creative Partner (Essential Tier)",
    enterpriseId: "7689233193221881857",
    oneOrgId: "74911997819299417108",
    developerOrgId: "7614371641694635064",
    officialApp: "Neøflow TTS Connector (Service ID 7614526955808622356)",
    serviceMarketUrl: "https://seller-br.tiktok.com/services/market/service-detail/7614526955808622356?shop_region=BR",
    pixelId: "D9SJPC3C77U97D5QGU0G",
    verifiedDate: "2026-10-08",
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
        "Sincronização Oficial via API: Produtos, estoque e pedidos sincronizados em tempo real sem planilhas manuais via Neøflow TTS Connector (Service ID 7614526955808622356).",
        "Split Automático de Pagamento: Divisão nativa no ato da compra entre seller, criador e taxas, 100% hands-off.",
        "Autorização Segura ISV: Escopos homologados seller.shop.info, seller.authorization.info e seller.order.info.",
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
        "TikTok Login Kit (/app-in): Conexão instantânea com 1 clique utilizando a conta do TikTok para sincronizar nome público e avatar oficial em tempo real, sem formulários manuais.",
        "Experiência 9:16 Minis-First: Interface vertical nativa pensada para o formato do TikTok e navegação fluida no celular.",
        "Conteúdo no Centro: Monetização nativa integrada aos vídeos e LIVEs sem parecer publicidade invasiva ou forçada.",
        "Catálogo Curado com Estoque Real: Acesso a produtos de marcas verificadas no Brasil com entrega garantida aos seguidores.",
        "Checkout 1-Clique por Pix: Páginas de produto em formato vertical para compra instantânea sem atrito.",
        "Comissões Diretas na Carteira: Split nativo processado pelo TikTok, sem risco de calote ou relatórios manuais de marcas.",
        "Comunidade Exclusiva: Hub de acolhimento e suporte direto para criadores em /comunidade.",
      ],
      officialRoute: "/creators",
      appInRoute: "/app-in",
      communityRoute: "/comunidade",
      oauthDomain: "shop.tiktok.com e www.tiktok.com/v2/auth/authorize/",
      inAppBrowserGuidance: "Se o criador estiver acessando pelo link da bio dentro do app do TikTok, ele deve tocar nos 3 pontinhos e selecionar 'Abrir no navegador' (Chrome ou Safari) para autorizar com segurança e manter a sessão ativa.",
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
        "TikTok One Creative Partner: Credenciamento oficial Essential Tier verificado em outubro/2026 (Org ID 74911997819299417108).",
        "TikTok Symphony & Creative Studio: Acesso aos recursos oficiais de IA generativa para roteiros, avatares e criativos nativos em escala.",
        "Créditos & Tokens Institucionais: O TikTok One e o Creative Studio disponibilizam cotas de tokens e créditos oficiais de IA e até 15% de Traffic Lift Credits (cashback algorítmico em visualizações para Spark Ads nos primeiros 7 dias).",
        "Spark Ads & Events API: Impulsionamento com código de autorização de criadores e rastreamento seguro via Events API com SHA-256 (Pixel D9SJPC3C77U97D5QGU0G).",
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
        "Quatro Jornadas de Autorização Independentes: Seller (services.tiktokshop.com), Creator Shop Alliance (shop.tiktok.com), Login Kit (www.tiktok.com/v2/auth/authorize/) e Partner TAP (partner.tiktokshop.com).",
        "Motor de Webhooks Assíncronos: Processamento em tempo real com BullMQ + Redis, idempotência e assinatura HMAC SHA-256.",
        "Auto-Refresh de Tokens em Background: Gestão automática do ciclo de vida dos tokens OAuth para zero queda de sessão em produção.",
        "Integração com ERPs Nacionais: Conexão facilitada para Bling, Tiny, VTEX, Shopify e hubs de marketplace.",
      ],
      officialRoute: "/tech",
    },
  ],
  faqs: [
    {
      question: "Qual é a razão social e o CNPJ oficial da neøflow?",
      answer: "A entidade corporativa e agência oficial é a NEO:ONE INOVA SIMPLES (I.S.), CNPJ 68.729.237/0001-41. A marca operacional no ecossistema TikTok é neøflow // Official TikTok Partner (FlowOff TikTok Partner), com Business Center institucional verificado sob o ID 7689233193221881857 e TikTok One Creative Partner Org ID 74911997819299417108.",
    },
    {
      question: "Como um creator se conecta pelo celular ou link da bio?",
      answer: "Criadores de conteúdo conectam instantaneamente pelo link https://partners.neoflowoff.agency/app-in com o TikTok Login Kit oficial. Basta clicar em 'Continuar com TikTok' para autorizar a sincronização do avatar e nome de exibição. Se estiver navegando dentro do app do TikTok pelo link da bio, toque no menu de 3 pontinhos no canto superior e selecione 'Abrir no navegador' (Chrome ou Safari) ou use o botão de copiar link no app-in, garantindo uma conexão sem bloqueios de tela.",
    },
    {
      question: "Por que aparece um aviso pedindo para abrir no navegador padrão no /app-in?",
      answer: "Por segurança da plataforma, o navegador interno do TikTok (in-app WebView) restringe redirecionamentos que tentam se comunicar com outros aplicativos ou janelas de consentimento externo. Por isso, a neøflow detecta automaticamente quando você está dentro do TikTok e facilita com 1 toque a abertura no navegador padrão do seu smartphone.",
    },
    {
      question: "O aplicativo da neøflow para TikTok Shop é homologado?",
      answer: "Sim! O aplicativo oficial é o 'Neøflow TTS Connector' (Service ID 7614526955808622356), publicado e ativado no Service Market oficial do TikTok Shop Brasil (seller-br.tiktok.com), com escopos homologados de loja, autorizações e pedidos em tempo real.",
    },
    {
      question: "Vocês deixam acessar o Symphony de graça / sem pagar?",
      answer: "O TikTok Creative Studio e a suíte TikTok Symphony disponibilizam modelos de inteligência artificial, avatares e ferramentas de edição dentro do ecossistema oficial do TikTok One. Como parceiro verificado no TikTok One (Org ID 74911997819299417108), ajudamos marcas e criadores a acessar as cotas oficiais de tokens de IA e créditos de tráfego (Traffic Lift Credits de até 15%). O consumo é baseado nos tokens oficiais disponibilizados pela própria plataforma, sem taxas ocultas de estúdios tradicionais.",
    },
    {
      question: "Posso conectar minha loja usando apenas CPF (Pessoa Física)?",
      answer: "Não. A operação de vendas no TikTok Shop Brasil é estritamente regulamentada e exige CNPJ ativo (MEI, ME, LTDA ou S/A), emissão de Nota Fiscal eletrônica (NF-e) e estoque despachado no Brasil. Se você ainda opera como pessoa física, recomendamos regularizar seu MEI ou empresa antes de conectar.",
    },
    {
      question: "A neøflow cobra mensalidade fixa de agência de marketing?",
      answer: "Não. A neøflow opera como infraestrutura tecnológica e partner oficial. Não cobramos mensalidades de fee de agência para fazer 'atendimento' ou 'gestão de redes'. Nossa remuneração ocorre por split nativo de comissões, infraestrutura de parceiro e pacotes institucionais garantidos.",
    },
    {
      question: "O que acontece quando clico em 'Conectar minha Shop'?",
      answer: "Você é redirecionado em ambiente seguro para o portal oficial do TikTok Shop (services.tiktokshop.com) para aprovar o acesso do app oficial Neøflow TTS Connector. Suas senhas e credenciais bancárias nunca são compartilhadas com a neøflow. Assim que você autoriza, seu catálogo e pedidos são integrados ao ecossistema.",
    },
    {
      question: "E se eu ainda não tiver conta no TikTok Shop Seller Center?",
      answer: "O primeiro passo é criar sua conta oficial de vendedor no Seller Center do TikTok Brasil (https://seller-br.tiktok.com). Assim que seus documentos forem aprovados pelo TikTok, você volta aqui para conectar à neøflow e ativar os recursos de Top Sellers e creators.",
    },
  ],
};

/**
 * Monta o bloco de conhecimento detalhado para ser incorporado na memória do agente.
 */
export function buildKnowledgeMemoryPrompt(): string {
  const t = ECOSYSTEM_KNOWLEDGE;
  const parts: string[] = [];

  parts.push(`\n[BASE DE CONHECIMENTO INSTITUCIONAL & MEMÓRIA DO ECOSSISTEMA // OUTUBRO 2026]`);
  parts.push(`- Entidade Oficial: ${t.institution.legalName} (CNPJ ${t.institution.cnpj}).`);
  parts.push(`- Marca Operacional: ${t.institution.tradeName}.`);
  parts.push(`- Credenciamento TikTok: ${t.institution.partnerStatus}.`);
  parts.push(`- TikTok Business Center Enterprise ID: ${t.institution.enterpriseId} (Verified).`);
  parts.push(`- TikTok One Creative Partner Org ID: ${t.institution.oneOrgId} (Verified Essential Tier).`);
  parts.push(`- TikTok for Developers Org ID: ${t.institution.developerOrgId} (Verified).`);
  parts.push(`- Aplicativo Oficial Homologado no Service Market BR: ${t.institution.officialApp}.`);
  parts.push(`- URL da Vitrine Oficial no Service Market: ${t.institution.serviceMarketUrl}`);
  parts.push(`- TikTok Pixel & Events API (SHA-256): ${t.institution.pixelId}.`);
  parts.push(`- Posicionamento Soberano: ${t.manifesto.coreBelief}`);

  parts.push(`\n[OS 4 TERRITÓRIOS E SUAS REGRAS DE QUALIFICAÇÃO]`);
  t.territories.forEach((terr) => {
    parts.push(`\n### TERRITÓRIO ${terr.code} // ${terr.name}`);
    parts.push(`- Público: ${terr.target}`);
    parts.push(`- Pré-requisitos Obrigatórios:\n  * ${terr.prerequisites.join("\n  * ")}`);
    parts.push(`- Recursos Desbloqueados Exclusivos:\n  * ${terr.unlockedFeatures.join("\n  * ")}`);
    parts.push(`- Rota de Ação Oficial: ${terr.officialRoute}`);
    if ((terr as any).appInRoute) {
      parts.push(`- Rota do Login Kit para Creators: ${(terr as any).appInRoute}`);
    }
    if ((terr as any).communityRoute) {
      parts.push(`- Rota da Comunidade: ${(terr as any).communityRoute}`);
    }
    if ((terr as any).inAppBrowserGuidance) {
      parts.push(`- Orientação sobre Navegador Interno: ${(terr as any).inAppBrowserGuidance}`);
    }
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
