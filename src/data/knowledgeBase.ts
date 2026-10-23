/**
 * BASE DE CONHECIMENTO CANÔNICA // NEØFLOW TIKTOK PARTNER
 * Memória persistente e dados de operação para o agente de triagem >_ neøtiko.
 * Revisado em 2026-10-23 contra as fontes públicas do TikTok e o estado
 * canônico do ecossistema. Elegibilidade, escopos, recursos, cotas e termos
 * comerciais são determinados pelo TikTok, pelo mercado e pela conta efetiva.
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
        "Na triagem brasileira da neøflow, verificamos CNPJ ativo, cadastro aprovado no Seller Center e operação logística/fiscal nacional.",
        "A aprovação, os documentos aceitos e a elegibilidade final são definidos pelo Seller Center para a conta e o mercado efetivos.",
      ],
      unlockedFeatures: [
        "Conexão segura do app, mediante consentimento do seller, para os escopos efetivamente autorizados.",
        "A orientação para catálogo, pedidos, creators e automações depende da autorização ativa e da capacidade liberada para a loja.",
        "Não prometa split, catálogo, logística, comissão ou sincronização como automáticos antes de confirmar a modalidade e a aprovação no ambiente oficial.",
      ],
      officialRoute: "/sellers/conectar",
      fallbackIfNoShop: "Orientar abertura prévia de conta de vendedor em https://seller-br.tiktok.com antes de conectar com a neøflow.",
    },
    {
      code: "02",
      name: "CREATORS / AFILIADOS",
      target: "Criadores de conteúdo, influenciadores, apresentadores de LIVE, streamers e pessoas que querem entender oportunidades de colaboração.",
      prerequisites: [
        "Conta ativa e em conformidade com as Diretrizes da Comunidade do TikTok.",
        "TikTok One depende de disponibilidade regional, maioridade, conformidade com as políticas e requisitos específicos de cada projeto.",
        "Login Kit, TikTok One e TikTok Shop Affiliate são jornadas separadas; conectar a identidade não concede inscrição, comissão ou elegibilidade em outra jornada.",
      ],
      unlockedFeatures: [
        "TikTok Login Kit (/app-in): conexão consentida para identidade e sessão, sem criar automaticamente participação em TikTok One ou Affiliate.",
        "TikTok One: oportunidades por convite, candidatura aberta ou link de convite, sujeitas a requisitos do projeto e aceite da marca ou do TikTok.",
        "Comunidade e orientação: hub de acolhimento em /comunidade e esclarecimento honesto sobre o próximo caminho oficial.",
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
        "TikTok One reúne oportunidades de colaboração e recursos criativos; recursos, disponibilidade, cotas e condições comerciais variam por conta, região e projeto.",
        "Para conteúdo comercial, a divulgação de conteúdo comercial é obrigatória; projetos TikTok One fazem essa gestão na própria plataforma.",
        "Spark Ads e mensuração exigem as autorizações e configurações aplicáveis de cada conta. Não prometa crédito, cashback, tokens ou resultado de campanha.",
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
        "SDK TikTok Shop: o pacote Node.js é gerado no Partner Center conforme o app efetivo, os escopos aprovados e as versões de API disponíveis; não existe uma única versão global aplicável a todas as contas.",
        "Quatro Jornadas de Autorização Independentes: Seller (services.tiktokshop.com), Creator Shop Alliance (shop.tiktok.com), Login Kit (www.tiktok.com/v2/auth/authorize/) e Partner TAP (partner.tiktokshop.com).",
        "A presença de um método no SDK não prova escopo, token, autorização ou elegibilidade para utilizá-lo. Isso é confirmado no Partner Center e no fluxo de consentimento correspondente.",
        "Integrações técnicas passam por análise de contrato, escopo e mercado antes de qualquer promessa de automação.",
      ],
      officialRoute: "/tech",
    },
  ],
  platformGuidance: [
    "Use somente fatos presentes nesta base para afirmar estado atual. Para regras novas, elegibilidade, créditos, pagamentos ou disponibilidade, explique que a confirmação depende da conta, do mercado e da tela oficial do TikTok.",
    "Quando alguém disser 'apoiador', pergunte qual contexto: fã de LIVE/Fã-clube, moderador ou co-host de LIVE, creator que busca oportunidades de marca, ou afiliado de TikTok Shop. Não trate o termo como uma categoria única de TikTok One ou da API Shop.",
    "Apoiadores de LIVE podem interagir com criadores por visualização, chat, curtidas e Presentes quando o recurso está disponível. Isso não concede papel de creator, acesso a TikTok One, escopo de API ou comissão de Shop.",
    "TikTok One exige disponibilidade regional, 18 anos ou mais e conformidade com as políticas. Para participar de projetos, o TikTok informa como referência pelo menos 1.000 seguidores, além de critérios que variam por projeto.",
    "Os quatro tipos públicos de projeto TikTok One são Creator Marketing, Branded Buzz, Spark Opportunity Program e TikTok Creative Challenge. Convite, candidatura e pagamento dependem do projeto e do aceite da plataforma ou da marca.",
    "Nunca prometa aprovação, alcance, pagamento, crédito, cashback, token, comissão, acesso a SDK ou resultado de campanha.",
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
      answer: "O TikTok disponibiliza recursos criativos conforme a conta, o mercado, o produto e os termos vigentes. Não prometemos acesso gratuito, cota de tokens, créditos de tráfego ou cashback: isso precisa ser confirmado no ambiente oficial aplicável antes de qualquer decisão.",
    },
    {
      question: "Posso conectar minha loja usando apenas CPF (Pessoa Física)?",
      answer: "Na nossa trilha de qualificação brasileira verificamos CNPJ ativo, aprovação no Seller Center e condições fiscais e logísticas. A decisão final e os documentos aceitos são exibidos pelo TikTok Shop para a conta e o mercado da sua loja; se ainda não houver loja aprovada, comece pelo Seller Center.",
    },
    {
      question: "A neøflow cobra mensalidade fixa de agência de marketing?",
      answer: "Não. A neøflow opera como infraestrutura tecnológica e partner oficial. Não cobramos mensalidades de fee de agência para fazer 'atendimento' ou 'gestão de redes'. Nossa remuneração ocorre por split nativo de comissões, infraestrutura de parceiro e pacotes institucionais garantidos.",
    },
    {
      question: "O que acontece quando clico em 'Conectar minha Shop'?",
      answer: "Você é redirecionado em ambiente seguro para o portal oficial do TikTok Shop para avaliar e aprovar o acesso solicitado pelo app. Suas senhas e credenciais bancárias não são compartilhadas com a neøflow. Os dados e automações liberados depois dependem dos escopos autorizados, do vínculo da loja e das regras vigentes da plataforma.",
    },
    {
      question: "E se eu ainda não tiver conta no TikTok Shop Seller Center?",
      answer: "O primeiro passo é criar sua conta oficial de vendedor no Seller Center do TikTok Brasil (https://seller-br.tiktok.com). Assim que seus documentos forem aprovados pelo TikTok, você volta aqui para conectar à neøflow e ativar os recursos de Top Sellers e creators.",
    },
    {
      question: "O que são apoiadores no TikTok?",
      answer: "'Apoiador' precisa de contexto. Em LIVE, normalmente é um fã que interage, acompanha ou envia Presentes quando o recurso está disponível; isso pode estar ligado ao Fã-clube. Moderador e co-host são papéis distintos concedidos pelo criador. Já TikTok One e TikTok Shop Affiliate são jornadas comerciais próprias: apoio a um creator não cria automaticamente acesso, comissão ou elegibilidade. Você está falando de LIVE, moderação, colaboração com marcas ou afiliados?",
    },
    {
      question: "Conectar pelo Login Kit me coloca no TikTok One ou no Affiliate?",
      answer: "Não automaticamente. O Login Kit autoriza identidade e sessão da aplicação. TikTok One, projetos de marca e TikTok Shop Affiliate têm regras, consentimentos e elegibilidade próprios. Posso orientar a entrada correta depois de entender se você busca colaboração de marca, LIVE ou produtos com comissão.",
    },
    {
      question: "Existe um SDK novo do TikTok Shop?",
      answer: "O TikTok Shop gera o SDK de Node.js de acordo com o app, os escopos aprovados e as versões disponíveis no Partner Center. Por isso não há uma única versão global a prometer. Atualizações devem partir do pacote baixado pela conta correta e ser comparadas com os escopos e contratos que ela realmente possui.",
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

  parts.push(`\n[REGRAS DE CONFIABILIDADE DA PLATAFORMA]`);
  t.platformGuidance.forEach((rule) => parts.push(`- ${rule}`));

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
