# NEXTSTEPS — organização, continuidade e colaboração

> Registro de investigação. Não é decisão arquitetural nem autorização para migração, deploy ou alteração de permissões.

## Contexto

A organização GitHub `Chat-as-a-Protocol` estava vinculada à conta principal do criador, atualmente em processo de recuperação em outra conversa. Existe uma cópia local dos projetos. O repositório Auti. opera hoje em `nsf-ctory/neo-auti`.

A pergunta não é apenas onde hospedar código: **quais garantias, responsabilidades e mecanismos de colaboração uma organização pode fornecer para que um projeto continue existindo sem depender de uma única identidade?**

## Prompt para Dev Agent — auditoria read-only

Atue como arquiteto de governança open-source e continuidade operacional. Investigue **somente com leitura**, sem executar migrações, convites, alterações de settings, criação de tokens, publicação ou mudanças de código.

1. **Inventário verificável:** identifique os repositórios locais relacionados ao NEØ Protocol e `Chat-as-a-Protocol`, remotes atuais, branches, documentação de governança e dependências entre organizações. Diferencie o que está comprovado localmente do que exige acesso ao GitHub suspenso. Não presuma que a cópia local inclua issues, PRs, releases, packages, Actions secrets, configurações ou histórico de membros.
2. **Capacidades da organização:** avalie o que uma organização GitHub acrescenta à mera hospedagem de um repositório: papéis e ownership, equipes, permissões, colaboração externa, proteção de branches, regras de contribuição, discussões, projetos, Actions, packages, security advisories e transferência de manutenção. Diferencie funcionalidades disponíveis no plano aplicável daquelas que exigem plano pago ou configuração específica.
3. **Continuidade e dependência institucional:** analise concentração de controle em uma conta, sucessão de mantenedores, dependência de domínios/identidades, propriedade intelectual, backups exportáveis e portabilidade. Compare manter `nsf-ctory`, recuperar `Chat-as-a-Protocol` ou estabelecer governança independente. Não recomende migração sem evidências.
4. **Colaboração:** proponha um modelo mínimo e de baixo custo para mantenedores, contributors e parceiros: `README`, `CONTRIBUTING`, `CODEOWNERS`, `SECURITY`, `GOVERNANCE`, licença, decisões técnicas e processo de revisão. Verifique quais arquivos já existem antes de sugerir novos.
5. **Riscos e oportunidades:** registre riscos de disponibilidade, governança, lock-in, custos, reputação, titularidade e perda de contexto, com evidências e incertezas. Identifique oportunidades concretas de contribuição e sustentabilidade sem presumir apoio institucional ou financiamento.

### Entregável

Produza um relatório curto com:
- **Fatos confirmados**, incluindo caminho local, arquivo e evidência;
- **Não verificável no momento**, especialmente dependências da conta suspensa;
- **Comparação de alternativas** (continuar, recuperar, reorganizar), com custos conhecidos versus custos a confirmar;
- **Três ações reversíveis prioritárias** e **decisões que exigem aprovação do criador**.

### Restrições

- Somente leitura; não tocar em produção, Railway, DNS, credenciais ou organizações.
- Não pedir nem expor tokens, chaves ou dados privados.
- Não assumir que o GitHub resolverá a suspensão, nem que a organização original poderá ser recuperada.
- Não introduzir DB, memória, regex, agentes adicionais ou novos serviços na Auti.
- Priorizar custo zero/baixo, portabilidade, transparência e continuidade.
- Manter esta investigação separada da implementação de voz e do teste Gemini Live.
