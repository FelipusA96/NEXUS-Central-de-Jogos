# Atualização — Palavras Cruzadas R3

## O que mudou

Ao alternar entre **Com dicas** e **Lista de palavras** durante uma partida, o jogo gera uma nova grade. A nova rodada sorteia novamente as palavras e recalcula suas posições, evitando que a pessoa consulte a grade anterior para associar respostas.

Clicar novamente na modalidade que já está ativa não reinicia a partida. A dificuldade, a origem das palavras e a configuração do cronômetro são mantidas.

## Como instalar

1. Extraia o ZIP na raiz do repositório, mantendo a estrutura de pastas.
2. Permita a substituição dos arquivos listados.
3. Envie as alterações para a branch usada pelo GitHub Pages.
4. Aguarde a publicação e recarregue a página com `Ctrl + F5`.

## Arquivos incluídos

- `assets/js/word-bank.js`
- `jogos/palavras-cruzadas/index.html`
- `jogos/palavras-cruzadas/engine.js`
- `jogos/palavras-cruzadas/jogo.js`
- `jogos/palavras-cruzadas/estilo.css`

O pacote também mantém a versão do banco com 299 palavras únicas e o seletor de modalidades da atualização R2.
