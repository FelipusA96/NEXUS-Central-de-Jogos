# Configuração do Firebase

A NEXUS contém integração com Firebase para recursos como autenticação, rankings e modelos salvos. Os recursos remotos só funcionam quando o projeto Firebase, os provedores e as regras estão configurados de forma compatível com o código.

## Configuração usada atualmente

A configuração Web existente aponta para o projeto Firebase utilizado pelo Caça-Palavras original. Os principais pontos de configuração são:

- `assets/js/firebase.js` — inicialização utilizada pela central;
- `jogos/caca-palavras/index.html` — inicialização e operações específicas do Caça-Palavras.

Se a aplicação for migrada para outro projeto Firebase, revise os dois arquivos para evitar que partes da central consultem projetos diferentes.

## Preparar um projeto Firebase

1. Abra o Firebase Console e selecione o projeto correto.
2. Registre ou confira o aplicativo Web e os valores de configuração.
3. Ative no Firebase Authentication os provedores necessários para os fluxos presentes no código, incluindo e-mail/senha e autenticação anônima quando utilizados.
4. Habilite o Cloud Firestore.
5. Revise `firestore.rules` e publique regras compatíveis com o código implantado.
6. Confira os domínios autorizados no Authentication, incluindo o domínio usado pelo GitHub Pages e o domínio local de desenvolvimento, se necessário.
7. Teste login, leitura de rankings e gravação de resultados com usuários de teste.

## Coleções referenciadas pelas regras atuais

| Coleção/caminho | Uso |
|---|---|
| `modelos/{codigo}` | Modelos de palavras, com operações condicionadas à identidade do proprietário. |
| `rankings/{nivel}/participantes/{uid}` | Ranking geral do Caça-Palavras. |
| `rankings_campo_minado/{nivel}/participantes/{uid}` | Ranking do Campo Minado. |
| `rankings_sudoku/{nivel}/dias/{dia}/participantes/{uid}` | Resultados do desafio diário de Sudoku. |
| `rankings_memoria/{nivel}/dias/{dia}/participantes/{uid}` | Resultados do desafio diário de Memória. |
| `rankings_spider/{nivel}/dias/{dia}/participantes/{uid}` | Resultados do desafio diário de Paciência Spider. |

A estrutura efetivamente utilizada deve ser conferida no código e nas regras da versão que será publicada.

## Publicar as regras

O arquivo `firestore.rules` é apenas um arquivo versionado no repositório. O GitHub Pages não o publica no Firebase. Para aplicar as regras, use o Firebase Console ou uma implantação Firebase CLI configurada para o projeto correto.

Antes de publicar:

- confira se as regras correspondem aos campos que os módulos realmente gravam;
- valide operações de leitura, criação, atualização e exclusão;
- teste com sessão autenticada, anônima e sem sessão, conforme os fluxos suportados;
- não substitua regras de produção sem revisar o impacto sobre dados existentes.

## Segurança e integridade

A configuração Web do Firebase é incluída no cliente e não deve ser tratada como segredo. A segurança depende das regras do Firestore, dos provedores de autenticação e da validação das operações.

Os rankings atuais recebem resultados enviados pelo navegador. Uma pessoa pode modificar o cliente ou simular chamadas. Para torneios com premiações, recompensas ou decisões importantes, valide a partida em um backend confiável e não aceite o tempo enviado pelo cliente como prova definitiva.

Nunca inclua no repositório chaves privadas de contas de serviço, tokens administrativos, senhas ou credenciais de servidor.
