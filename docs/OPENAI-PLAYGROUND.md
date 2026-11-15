# Auti. — referências para OpenAI Playground e revisão do plugin

Este documento reúne links verificáveis para transportar a identidade e as instruções da Auti. para uma experiência OpenAI. **Links não importam automaticamente arquivos ou políticas para o Playground.** Copie ou anexe o conteúdo pertinente, conforme as ferramentas disponíveis.

## Endereços

| Destino | Link | Uso |
| --- | --- | --- |
| Auti. web | https://auti.neoprotocol.space/ | Experiência pública; não é fonte integral de instruções |
| Repositório | https://github.com/nsf-ctory/neo-auti | Código-fonte (privado; requer acesso) |
| Instrução canônica | https://github.com/nsf-ctory/neo-auti/blob/main/docs/skills/instructions/SKILL.md | Referência de comportamento |
| Índice das skills | https://github.com/nsf-ctory/neo-auti/blob/main/docs/skills/README.md | Mapa das referências |
| Identidade e humanização | https://github.com/nsf-ctory/neo-auti/blob/main/docs/skills/AUTI_IDENTITY_BEHAVIOR_HUMANIZATION_SPEC_v0.8.1.md | Identidade e aceitação |
| Adaptive Support Engine | https://github.com/nsf-ctory/neo-auti/blob/main/docs/skills/instructions/references/adaptive-support-engine.md | Preferências e consentimento |
| Instrução efetiva do runtime web | https://github.com/nsf-ctory/neo-auti/blob/main/auti-policy.ts | Projeção usada pelo Gemini Live na main |
| Setup e limites | https://github.com/nsf-ctory/neo-auti/blob/main/docs/SETUP.md | Infraestrutura e limites conhecidos |
| OpenAI Playground | https://platform.openai.com/playground | Ambiente de testes; requer conta/acesso |
| PR de voz e conversa | https://github.com/nsf-ctory/neo-auti/pull/7 | Ajustes propostos, ainda sujeitos a merge |
| PR do Safety Orchestrator | https://github.com/nsf-ctory/neo-auti/pull/6 | Fundação de segurança, não ativa |

Os links de arquivos apontam para a `main`. Mudanças em PRs ainda não incorporados devem ser lidas na própria branch/PR. A interface web usa Gemini Live, não OpenAI Playground; testar no Playground **não equivale** a validar o áudio ou o deploy do site.

## Ordem de uso no Playground

1. Ler `docs/skills/instructions/SKILL.md` e a especificação de identidade.
2. Acrescentar o contrato de conversa sem interrogatório do PR #7 **somente após revisão**; não tratar PR aberto como produção.
3. Usar o Adaptive Support Engine para adaptação contextual, sem presumir memória persistente.
4. Testar: saudação breve; silêncio; relato sem pergunta; pedido objetivo; sobrecarga; risco explícito; risco ambíguo; fala sobre passado.
5. Registrar diferenças entre respostas textuais, prosódia sintetizada e ações realmente disponíveis. Não prometer alertas externos, retenção de memória ou socorro que não estejam implementados.

## Princípios inegociáveis

- Sem cadastro, formulários ou exigência de diagnóstico para iniciar conversa.
- Sem perguntas automáticas, ofertas repetitivas ou euforia performática.
- Segurança com prioridade quando houver risco concreto; sem alegar que terceiros foram notificados.
- Sem prometer terapia, atendimento emergencial ou detecção perfeita.
- Documentos de referência não substituem políticas de privacidade e termos publicados e revisados.

## Links de divulgação e atribuição

Site canônico: https://auti.neoprotocol.space/

Exemplo de link de campanha Threads:
https://auti.neoprotocol.space/?utm_source=threads&utm_medium=social&utm_campaign=auti_beta

UTM identifica a origem **na URL**; só haverá mensuração consolidada quando analytics/logs apropriados forem configurados. Evitar dados sensíveis e identificadores pessoais em parâmetros UTM.
