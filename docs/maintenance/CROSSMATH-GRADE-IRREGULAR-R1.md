# CrossMath — Tabuleiros irregulares R1

**Data:** 20/10/2026  
**Módulo:** `jogos/crossmath/`

## Objetivo

Substituir a matriz completa e previsível por um tabuleiro com formato assimétrico, ramificações e espaços vazios, mantendo o princípio de equações matemáticas que se cruzam.

## Implementação

- Cada dificuldade define dimensões-base diferentes: Fácil 3×4, Médio 4×5, Difícil 5×6 e Extremo 6×7 nós potenciais.
- O gerador cria uma máscara conectada de nós ativos e exige cobertura de todas as linhas e colunas, variação na quantidade de nós por linha/coluna e cruzamentos horizontais/verticais.
- Uma equação é criada somente entre nós ativos adjacentes. Números nos cruzamentos são compartilhados entre as equações.
- A área visual usa dimensões retangulares calculadas a partir do nível e deixa vazias as posições sem conteúdo.
- A contagem de equações e o identificador são derivados da estrutura real gerada.
- O cache de `estilo.css` e `jogo.js` recebe a versão `20261020-irregular-r1`.

## Verificações locais

Foram geradas 500 matrizes por dificuldade (2.000 no total). Os testes confirmaram:

- conectividade dos nós ativos;
- presença de nós em todas as linhas e colunas;
- variação de formato, sem tabuleiros totalmente preenchidos;
- existência de equações horizontais e verticais;
- consistência aritmética das equações geradas;
- 500 assinaturas únicas por nível na amostra testada.

Esses resultados correspondem a testes locais do gerador. A publicação no GitHub Pages e a validação visual em navegadores ainda devem ser feitas após o upload.
