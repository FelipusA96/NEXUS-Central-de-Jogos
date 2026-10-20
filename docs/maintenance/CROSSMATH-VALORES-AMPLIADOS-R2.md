# CrossMath R2 — Valores numéricos ampliados

## Faixas por dificuldade

| Dificuldade | Valores-base | Entrada |
|---|---:|---:|
| Fácil | 1–9 | Até 1 dígito |
| Médio | 1–99 | Até 2 dígitos |
| Difícil | 10–999 | Até 3 dígitos |
| Extremo | 100–999 | Até 3 dígitos |

Os valores-base são os números dos nós que conectam as equações. Os operandos são calculados a partir das relações entre esses nós e podem ser menores, desde que sejam inteiros positivos e respeitem o limite máximo do nível.

## Alterações técnicas

- `jogos/crossmath/jogo.js`: limites por dificuldade, geração de candidatos de operação, validação de valores e entrada de múltiplos dígitos.
- `jogos/crossmath/index.html`: faixas exibidas na seleção de dificuldade, instruções e painel informativo.
- `jogos/crossmath/estilo.css`: ajustes de fonte para números de dois e três dígitos.
- Cache-busting atualizado para `20261020-values-r2`.

## Testes recomendados

1. Iniciar uma rodada em cada dificuldade e verificar as faixas numéricas.
2. Confirmar que é possível digitar valores com zeros internos, como `205` e `90`.
3. Conferir as equações, usar uma dica e revelar o gabarito.
4. Confirmar que as equações geradas sempre usam resultados inteiros e que o tabuleiro continua irregular.

Os testes automatizados locais verificam a geração matemática; a publicação no GitHub Pages deve ser validada após o upload.
