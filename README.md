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
