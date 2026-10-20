# Atualização NEXUS — CrossMath

Esta atualização adiciona o jogo **CrossMath (Math Crossword)** à Central NEXUS e o disponibiliza no catálogo principal.

## O que foi incluído

- Novo módulo em `jogos/crossmath/`.
- Geração procedural de grades e equações para cada partida.
- Quatro dificuldades: Fácil (9×9, 12 equações), Médio (13×13, 24 equações), Difícil (17×17, 40 equações) e Extremo (21×21, 60 equações).
- Operações de adição, subtração, multiplicação e divisão exata.
- Casas numéricas iniciais, campos editáveis, validação de equações, dica e revelação do gabarito.
- Histórico local de até 80 configurações recentes por dificuldade para evitar repetições imediatas.
- Cartão do jogo no catálogo e atualização do número de jogos disponíveis.
- Atualização de cache da aplicação e do catálogo para facilitar a publicação da nova entrada.
- README público atualizado.

## Instalação recomendada

1. Faça uma cópia de segurança ou commit do repositório atual.
2. Extraia este pacote na **raiz** do repositório `NEXUS-Central-de-Jogos`, mantendo a estrutura de pastas.
3. Permita a substituição dos arquivos incluídos no pacote.
4. Faça commit e push para a branch publicada pelo GitHub Pages.
5. Depois da publicação, abra a página principal e escolha **CrossMath** no catálogo. Se a página já estava aberta, atualize-a com `Ctrl + F5`.

## Arquivos deste pacote

- `assets/js/catalog.js`
- `assets/js/app.js`
- `index.html`
- `README.md`
- `jogos/crossmath/index.html`
- `jogos/crossmath/estilo.css`
- `jogos/crossmath/jogo.js`

O jogo é executado no navegador e não depende de configuração adicional do Firebase. A atualização foi testada por verificações locais da lógica de geração: 100 matrizes por dificuldade, validação de todas as equações geradas e verificação de ausência de repetição nas amostras. A publicação no GitHub Pages ainda precisa ser realizada pelo responsável pelo repositório.
