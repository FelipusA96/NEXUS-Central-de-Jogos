# Segurança

A segurança da NEXUS depende tanto do código do navegador quanto das configurações dos serviços externos utilizados.

## Como relatar uma vulnerabilidade

Não publique detalhes exploráveis, credenciais ou dados de terceiros em issues públicas. Entre em contato de forma privada com o responsável pelo repositório, caso o GitHub disponibilize esse canal, descrevendo:

- o componente afetado;
- o impacto potencial;
- os passos mínimos para reproduzir;
- evidências sem dados pessoais ou segredos.

## Orientações para manutenção

- Nunca comite chaves privadas de contas de serviço, tokens de acesso, senhas ou arquivos `.env` com segredos.
- Revise as regras do Cloud Firestore antes de implantá-las.
- Não considere uma API key de configuração web como mecanismo de autorização; use regras e controles de acesso adequados.
- Trate os dados de ranking enviados pelo cliente como dados não confiáveis.
- Para premiações ou decisões importantes, valide partidas em um backend confiável.
- Ao mudar o projeto Firebase, confirme os domínios autorizados, os provedores de autenticação e as regras do banco.
