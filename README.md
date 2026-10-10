# NEXUS — Central de Jogos + Campo Minado

Projeto estático e modular pronto para **GitHub Pages**, sem frameworks ou build. O repositório original do Caça-Palavras não precisa ser alterado.

## Jogos disponíveis

- **Caça-Palavras** (`jogos/caca-palavras/`): preservado da versão anterior, com seus quatro níveis, modelos salvos e ranking.
- **Campo Minado** (`jogos/campo-minado/`): novo jogo com quatro dificuldades, tabuleiro aleatório, primeiro clique e vizinhança seguros, expansão de casas vazias, bandeiras, abertura rápida de números, vitória/derrota, cronômetro opcional e ranking por apelido.
- Jogos da Memória, Sudoku e Quiz continuam com seus cartões de prévia e não estão implementados.

## Estrutura

```text
index.html                            HUD da Central NEXUS
assets/css/hud.css                    Estilo da Central
assets/css/game-bridge.css            Barra de navegação dos jogos
assets/js/app.js                      Navegação, catálogo e ranking geral
assets/js/catalog.js                  Registro dos jogos
assets/js/firebase.js                 Firebase compartilhado, carregado sob demanda
jogos/caca-palavras/index.html        Caça-Palavras original
jogos/campo-minado/index.html         Interface do Campo Minado
jogos/campo-minado/estilo.css         Visual futurista do novo jogo
jogos/campo-minado/engine.js          Regras puras e criação do tabuleiro
jogos/campo-minado/jogo.js            Interação e estado da partida
jogos/campo-minado/ranking.js         Classificação no Firebase
firestore.rules                       Regras completas para ambos os jogos
```

## Publicação no repositório NEXUS

1. Extraia o ZIP.
2. Copie **o conteúdo extraído** para a raiz do repositório NEXUS no GitHub, preservando as pastas.
3. Em **Settings → Pages** escolha **Deploy from a branch**, `main`, `/ (root)`.
4. A Central abrirá em `https://USUARIO.github.io/NOME-DO-REPOSITORIO/`.
5. O Campo Minado abrirá em `.../jogos/campo-minado/` e o Caça-Palavras em `.../jogos/caca-palavras/`.

Nenhuma URL está codificada com um repositório fixo; os links são **relativos**, inclusive a volta para a Central.

## Ativar ranking do Campo Minado

1. O projeto usa o mesmo Firebase `cacapalavrasinterativo` já configurado no Caça-Palavras. A autenticação **Anônima** e **E-mail/Senha** devem permanecer ativadas.
2. No Firebase Console, abra **Firestore Database → Regras**. Faça backup das regras atuais e publique o arquivo `firestore.rules` desta versão; ele **mantém** os modelos e o ranking anterior e **acrescenta** a coleção `rankings_campo_minado/{nivel}/participantes/{uid}`.
3. A coleção surge automaticamente após o primeiro resultado válido.
4. O ranking pode ser visualizado sem login; para registrar tempo, o usuário escolhe um apelido e o app realiza login anônimo somente se não houver uma sessão existente.
5. Uma conta participa com o **melhor tempo em cada dificuldade**, sem se misturar com o Caça-Palavras.

**Segurança:** as regras impedem gravações por outros UIDs, mas não comprovam que o tempo corresponde a uma partida legítima: o jogo calcula o resultado no navegador. Para campeonatos com prêmios, é necessária validação confiável no servidor.

## Como jogar

- Selecione dificuldade, relógio e clique em uma casa.
- **Fácil:** 9×9 / 10 minas; **Médio:** 12×12 / 24; **Difícil:** 16×16 / 40; **Extremo:** 20×20 / 80.
- Mouse: botão esquerdo revela; direito coloca bandeira.
- Celular: alterne os botões **Revelar** e **Bandeira**; deslize o tabuleiro horizontalmente.
- Teclado: setas navegam, Enter aciona e `F` marca bandeira.
- Revele todas as casas seguras para vencer. Partidas sem cronômetro e desistências/derrotas não entram no ranking.

## Testes locais

A lógica foi verificada automaticamente em 320 partidas geradas (80 por dificuldade): distribuição correta de minas, primeiro clique seguro, números adjacentes, vitória e derrota. A interação da página também foi testada em prévia do navegador com Firebase simulado. A conexão real do Firebase deve ser conferida após publicar o site e as regras.
