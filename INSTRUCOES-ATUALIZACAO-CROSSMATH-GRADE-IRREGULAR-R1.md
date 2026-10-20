# Atualização CrossMath — Tabuleiros irregulares R1

Esta atualização muda a geração do CrossMath para usar tabuleiros assimétricos com ramificações, espaços vazios e equações que se cruzam, em vez de uma matriz totalmente preenchida.

## Arquivos do módulo

Extraia o ZIP na raiz do repositório, mantendo os caminhos: `jogos/crossmath/index.html`, `jogos/crossmath/estilo.css` e `jogos/crossmath/jogo.js`. O pacote incremental contém somente os arquivos do CrossMath e este guia; não substitui os outros jogos.

## Publicação

1. Copie/substitua os arquivos extraídos na raiz do repositório local.
2. Confira se os três arquivos estão dentro de `jogos/crossmath/`.
3. Faça commit e push para a branch publicada pelo GitHub Pages.
4. Após a publicação, abra o CrossMath e execute `Ctrl + F5` para recarregar sem cache.
5. Troque entre as quatro dificuldades e gere algumas novas matrizes para conferir os formatos.

## Resultado esperado

- Fácil: tabuleiro-base de 9 × 13 células.
- Médio: 13 × 17 células.
- Difícil: 17 × 21 células.
- Extremo: 21 × 25 células.
- Em todos os níveis, os espaços sem nós/segmentos ficam vazios e a quantidade de equações varia conforme a forma gerada.
- As equações continuam conectadas pelos números compartilhados e todas as operações possuem resultado inteiro válido.

As dimensões acima descrevem a área de layout do tabuleiro; a quantidade real de equações depende do formato sorteado. O código foi testado localmente, mas o site publicado não foi alterado automaticamente.
