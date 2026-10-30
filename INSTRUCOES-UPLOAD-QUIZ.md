# Atualização do banco de perguntas — NEXUS

## Conteúdo do pacote
- `jogos/quiz/questions.json`: banco consolidado com 150 perguntas.
- `docs/banco_quest_150_perguntas.txt`: versão legível para conferência.
- `docs/perguntas_novas_151_180.txt`: lote original adicional preservado.

## Implementação
1. Faça um commit/cópia de segurança do repositório.
2. Copie `jogos/quiz/questions.json` para o mesmo caminho no repositório.
3. Guarde os arquivos de documentação em `docs/`.
4. Ajuste a lógica do Quiz para carregar `jogos/quiz/questions.json` (em site estático, normalmente via `fetch`).
5. Filtre por `category` e `difficulty`; sorteie sem reposição dentro da rodada.
6. Use a sequência `facil`, `facil`, `medio`, `medio`, `dificil`, `dificil`.
7. Revise os gabaritos e altere `status` para `aprovada` somente após validação.

## Campos por pergunta
`id`, `sourceNumber`, `sourceBatch`, `category`, `categoryLabel`, `difficulty`,
`difficultyLabel`, `question`, `options` (A–D), `correctOption` e `status`.

## Importante
Este pacote contém dados e documentação. Ele não altera a interface nem implementa sozinho
o fluxo visual/lógica do Quiz. A validação realizada foi estrutural: quantidade de perguntas,
quatro alternativas, correspondência do texto do gabarito e ausência de enunciados literalmente
duplicados. Isso não substitui a revisão factual das respostas.

As perguntas não são transcrições oficiais de Quest ou Show do Milhão.
