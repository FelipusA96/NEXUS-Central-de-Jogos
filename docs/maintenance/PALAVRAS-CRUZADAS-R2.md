# NEXUS — correção definitiva do Palavras Cruzadas (Build R2)

Este pacote atualiza o banco de palavras e disponibiliza as duas modalidades: **Com dicas** e **Lista de palavras**. A versão nova mostra **299 palavras no banco** e o selo **ATUALIZADO · 2 MODOS** na configuração.

## Arquivos incluídos

- `assets/js/word-bank.js` — banco com 299 palavras únicas.
- `jogos/palavras-cruzadas/index.html` — interface com os dois modos e contador 299.
- `jogos/palavras-cruzadas/engine.js` — motor ligado ao banco compartilhado.
- `jogos/palavras-cruzadas/jogo.js` — seleção de modo, geração e validação.
- `jogos/palavras-cruzadas/estilo.css` — estilos atualizados.

## Instalação importante

1. Abra o repositório `NEXUS-Central-de-Jogos` no GitHub.
2. Extraia o ZIP **na raiz do repositório**. Não envie a pasta externa que contém o ZIP; os caminhos devem começar diretamente por `assets/` e `jogos/`.
3. Confirme no GitHub que `jogos/palavras-cruzadas/index.html` contém `id="bank-count">299` e os botões `id="mode-clues"` e `id="mode-list"`.
4. Confirme que `assets/js/word-bank.js` está na raiz do repositório, no caminho exato indicado.
5. Faça commit na branch que o GitHub Pages publica e aguarde a conclusão da implantação.
6. Abra a página do jogo e faça uma recarga forçada (`Ctrl+F5`) ou teste em uma janela anônima.

## Como confirmar que o site está com a versão nova

Na configuração do desafio, devem aparecer simultaneamente:

- contador **299 palavras no banco**;
- botões **Com dicas** e **Lista de palavras**;
- selo **ATUALIZADO · 2 MODOS**.

Se ainda aparecerem 54 palavras ou os botões de modalidade não existirem, o site está servindo outro arquivo/branch/pasta, ou a atualização não foi publicada. Nesse caso, abra a configuração do GitHub Pages em **Settings → Pages** e confira qual branch e pasta estão sendo publicadas. Atualizar apenas o banco, sem substituir o HTML e o motor, não corrige a página antiga.

A atualização é preparada para publicação; este pacote não altera o GitHub automaticamente.
