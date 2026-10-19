# NEXUS — Palavras Cruzadas (módulo 006)

Esta atualização adiciona **Palavras Cruzadas** à Central NEXUS, mantendo os jogos já existentes. O catálogo passa a ter seis jogos disponíveis e o Quiz permanece como módulo em breve.

## Funcionalidades

- Banco local com **54 palavras e dicas originais** em português. Cada nova grade sorteia uma combinação e embaralha as posições.
- Quatro dificuldades: Fácil (até 8 palavras), Médio (12), Difícil (16) e Extremo (20).
- Gerador de grade que tenta cruzar todas as palavras por letras compatíveis; a seleção é repetida em várias tentativas para encontrar uma montagem compacta.
- Dicas separadas em horizontais e verticais, numeração das casas iniciais e destaque da palavra selecionada.
- Digitação pelo teclado do computador e teclado virtual para celulares.
- Conferência de respostas, indicação de letras incorretas, limpeza da grade, cronômetro opcional e alternância entre tema claro e escuro.
- Modo **Minhas palavras**: até 50 palavras próprias, uma por linha. Para adicionar uma dica, use `PALAVRA | DICA`; por exemplo, `PRAIA | Faixa de areia junto ao mar`. Linhas sem dica recebem uma indicação neutra de tamanho.
- Acentos e espaços são normalizados para a montagem; a resposta é exibida sem acentos na grade, como é comum em palavras cruzadas.
- A lista personalizada e as preferências ficam no armazenamento local do navegador. Não foi adicionado ranking Firebase a este módulo nesta versão.

## Publicar a atualização

### Pacote completo

1. Faça backup do repositório NEXUS.
2. Extraia `NEXUS-Central-de-Jogos-Palavras-Cruzadas.zip`.
3. Envie os arquivos e diretórios extraídos para a raiz do repositório, mantendo os caminhos.
4. Faça commit/push e aguarde o GitHub Pages atualizar.

### Atualização incremental

Se a Central já estiver na versão dos cronômetros corrigidos, extraia `NEXUS-Atualizacao-Palavras-Cruzadas.zip` sobre a raiz do repositório. O pacote contém apenas os arquivos do catálogo e o novo módulo: `index.html`, `assets/js/catalog.js`, `jogos/palavras-cruzadas/index.html`, `jogos/palavras-cruzadas/estilo.css`, `jogos/palavras-cruzadas/engine.js`, `jogos/palavras-cruzadas/jogo.js` e este README.

## Catálogo atualizado

| Número | Jogo | Estado |
| --- | --- | --- |
| 001 | Caça-Palavras | Disponível |
| 002 | Campo Minado | Disponível |
| 003 | Sudoku | Disponível |
| 004 | Jogo da Memória | Disponível |
| 005 | Paciência Spider | Disponível |
| 006 | Palavras Cruzadas | Disponível |
| 007 | Quiz | Em breve |

**Verificação técnica realizada:** o motor foi exercitado com 25 grades aleatórias por dificuldade; as palavras selecionadas foram posicionadas e suas letras, cruzamentos, referências e numeração inicial foram conferidos. A publicação no GitHub Pages e o funcionamento em dispositivos reais ainda dependem de teste após o envio do pacote.

---

# NEXUS — atualização dos cronômetros

Nesta versão, os cronômetros dos cinco jogos e os tempos exibidos nos rankings foram padronizados:

- Antes de completar uma hora: **MM:SS** (ex.: `59:59`).
- A partir de uma hora: **HH:MM:SS** (ex.: `01:00:00`, `02:15:09`).
- Os tempos continuam sendo armazenados em milissegundos; os rankings existentes não precisam de migração.
- O principal defeito corrigido estava no Paciência Spider, que continuava mostrando minutos acumulados acima de 59.
- Nenhuma mudança nas regras do Firestore é necessária.

## Publicar

Extraia a atualização ZIP sobre a raiz do repositório NEXUS, preservando os caminhos. É suficiente substituir os seis arquivos JavaScript/HTML modificados. Se preferir, use o ZIP completo para substituir a plataforma toda. Depois faça commit e atualize a página com `Ctrl+F5`.

---

# NEXUS — Central de Jogos | Paciência Spider + catálogo organizado

Este pacote adiciona o **Paciência Spider** como quinto jogo jogável à NEXUS, mantendo Caça-Palavras, Campo Minado, Sudoku e Jogo da Memória. O **Quiz** continua como **Em breve**.

## Ordem definitiva do catálogo

| Número | Jogo | Estado |
| --- | --- | --- |
| 001 | Caça-Palavras | Disponível |
| 002 | Campo Minado | Disponível |
| 003 | Sudoku | Disponível |
| 004 | Jogo da Memória | Disponível |
| 005 | Paciência Spider | Disponível |
| 006 | Quiz | Em breve |

A ordem foi corrigida em `assets/js/catalog.js` e agora coincide com os códigos e com o Hall da Fama. O filtro **Cartas** foi incluído.

## Spider: funcionalidades

- 104 cartas, 10 colunas e 50 cartas de reserva, distribuídas em cinco grupos de dez.
- Nível Fácil: 1 naipe (com sugestões disponíveis); Médio: 1 naipe; Difícil: 2 naipes; Extremo: 4 naipes.
- Cartas inicialmente ocultas e abertas automaticamente à medida que ficam expostas.
- Movimentação por **arrastar e soltar (computador)** ou **selecionar a origem e tocar a coluna de destino (celular/teclado)**.
- Grupos móveis somente quando formados por sequência decrescente de cartas do mesmo naipe.
- Ao completar uma sequência de Rei ao Ás do mesmo naipe, ela sai automaticamente do tabuleiro. Vitória após 8 sequências.
- Distribuição permitida somente se todas as dez colunas possuírem cartas.
- **Desfazer**, **Dica**, modo livre, desafio diário e cronômetro opcional.
- Tabuleiro horizontalmente rolável no celular, sem quebrar o layout geral da página.
- **Ranking diário** opcional por apelido: *menos movimentos* primeiro; *tempo* para desempate. Apenas partidas diárias com cronômetro e sem uso de dica/desfazer podem registrar resultado.
- Cada conta Firebase/UID pode enviar um resultado por dificuldade e data. A classificação continua calculada no navegador e não é antifraude.

## Publicar no GitHub Pages

### Pacote completo

1. Faça backup do repositório NEXUS antes de atualizar.
2. Extraia `NEXUS-Central-de-Jogos-Spider.zip`.
3. Envie **os arquivos e diretórios extraídos**, não a pasta externa, à **raiz do repositório NEXUS**.
4. Preserve os caminhos `assets/` e `jogos/`. Substitua os arquivos compartilhados alterados quando solicitado.
5. Aguarde a publicação da branch configurada em **Settings → Pages**.

### Atualização incremental

Se já utiliza a versão da NEXUS com os quatro jogos, extraia `NEXUS-Atualizacao-Spider.zip`. Essa atualização contém:

```
index.html
assets/css/hud.css
assets/js/catalog.js
assets/js/app.js
assets/js/firebase.js
jogos/paciencia-spider/index.html
jogos/paciencia-spider/estilo.css
jogos/paciencia-spider/engine.js
jogos/paciencia-spider/jogo.js
jogos/paciencia-spider/ranking.js
firestore.rules
README.md
```

Os códigos dos quatro jogos anteriores não precisaram ser modificados.

### Endereços

- Central: `https://SEU-USUARIO.github.io/NEXUS-Central-de-Jogos/`
- Spider: `https://SEU-USUARIO.github.io/NEXUS-Central-de-Jogos/jogos/paciencia-spider/`
- Ranking da Central: `https://SEU-USUARIO.github.io/NEXUS-Central-de-Jogos/#ranking?jogo=paciencia-spider`

## Configuração do Firebase

O Spider utiliza o mesmo Firebase do projeto NEXUS. Ele depende de:

1. **Authentication**: provedores E-mail/Senha e Anônimo ativados.
2. **Firestore Database → Regras**: publicar as **regras completas atualizadas** do arquivo `firestore.rules` após fazer backup das regras atuais.
3. O caminho novo será `rankings_spider/{nivel}/dias/{AAAA-MM-DD}/participantes/{uid}`. O Firestore cria os documentos na primeira inscrição; não é necessário criar a coleção manualmente.
4. O ranking usa `orderBy('ordem')`, com `ordem = movimentos * 100000000 + tempoMs`, sem necessidade de índice composto.

**Importante:** fazer upload de `firestore.rules` no GitHub não publica as permissões no Firebase. É obrigatório publicar também no Firebase Console.

## Verificações realizadas

- 600 embaralhamentos de teste (150 por nível), verificando 104 cartas únicas, 10 colunas, 50 cartas de reserva e reprodutibilidade com a mesma semente.
- Testes da remoção automática de sequências completas, da movimentação e da distribuição.
- Teste visual no Chromium (desktop e celular) com clique, movimento válido, desfazer, distribuição, dica, troca de dificuldade e reinício diário idêntico.
- Busca, filtro Cartas e ordem 001–006 do catálogo conferidos no navegador.
- Os arquivos dos quatro jogos anteriores foram comparados com a versão anterior: nenhum foi modificado.

**Ainda precisa de validação real:** registro e consulta no Firestore do seu projeto após publicar as regras. Como os tempos e movimentos são enviados pelo navegador, para premiações é recomendável verificar as partidas em backend confiável.


## Atualização: Coordenadas no Campo Minado

- Cabeçalho A–T (de acordo com o nível) e linhas 1–20 ao lado esquerdo.
- A casa **A3** é a primeira coluna, terceira linha.
- Ao passar o mouse, clicar ou focar uma casa, a coordenada é exibida no painel acima do tabuleiro.
- Indicadores visuais não interferem nos cliques, nas bandeiras ou na navegação por teclado.
- Para atualizar uma NEXUS já publicada, substitua apenas `jogos/campo-minado/index.html`, `jogos/campo-minado/estilo.css` e `jogos/campo-minado/jogo.js`.
- Nenhuma mudança no Firestore é necessária.


## Banco de palavras revisado e modalidade de lista

- O arquivo compartilhado `assets/js/word-bank.js` contém 299 palavras únicas da lista enviada, com as dicas correspondentes e seis grupos temáticos.
- O Caça-Palavras preserva seus temas existentes e adiciona esses seis grupos ao seletor de temas.
- Palavras Cruzadas utiliza o mesmo banco e oferece duas modalidades: **Com dicas** e **Lista de palavras**. Na segunda, a lista de respostas aparece ao lado da grade e cada palavra é riscada quando todas as suas letras estão corretas.
- A duplicata `GELO` foi removida; `ÁGORA`, `LOB0` e `RELOGIO` foram corrigidas para `ÁGUIA`, `LOBO` e `RELÓGIO`.
