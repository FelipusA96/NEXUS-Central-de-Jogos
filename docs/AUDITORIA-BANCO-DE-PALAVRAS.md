# Auditoria do banco de palavras NEXUS

## Resultado

- Entradas recebidas: **300**.
- Palavras únicas após deduplicação: **299**.
- Duplicata removida: `GELO`, item 147; foi mantida a ocorrência do item 88.
- Correções de digitação aplicadas:
  - Item 25: `ÁGORA` → `ÁGUIA`.
  - Item 30: `LOB0` → `LOBO`.
  - Item 260: `RELOGIO` → `RELÓGIO`.
- A palavra `PÉ` foi mantida; o motor de Palavras Cruzadas aceita palavras de duas letras.

## Grupos temáticos

| Grupo | Quantidade |
|---|---:|
| Animais e Plantas | 50 |
| Geografia, Astronomia e Clima | 50 |
| Comida e Bebida | 49 |
| Corpo Humano e Saúde | 50 |
| Profissões, Objetos e Cotidiano | 50 |
| Conhecimentos Gerais, Verbos, Cores e Abstratos | 50 |
| **Total** | **299** |

## Integração

- **Caça-Palavras:** os temas existentes foram preservados e os seis grupos foram adicionados ao seletor; a quantidade sorteada depende da dificuldade.
- **Palavras Cruzadas:** o banco compartilhado fornece palavras, pistas e categorias; listas personalizadas continuam disponíveis.
- **Lista de palavras:** no modo alternativo de Palavras Cruzadas, o jogador vê as respostas que foram encaixadas na grade. Cada palavra é marcada como concluída quando suas letras estiverem corretas.

As grades são geradas dinamicamente. Dependendo da combinação, algumas palavras podem não ser encaixadas; o módulo informa isso e permite gerar outra grade.
