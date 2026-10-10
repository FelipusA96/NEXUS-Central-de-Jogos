# NEXUS — Central de Jogos | Atualização Jogo da Memória

Esta versão incorpora o **Jogo da Memória** à HUD NEXUS, preservando o Caça-Palavras, Campo Minado e Sudoku do pacote anterior.

## Novidades

- **Jogo da Memória**: cartas futuristas, interação por mouse, toque e teclado, pares certos permanecem abertos.
- **Fechamento automático das cartas erradas após 1 segundo**, sem botão adicional; o tabuleiro bloqueia outros cliques durante o intervalo.
- Quatro níveis: Fácil (6 pares/12 cartas), Médio (8 pares/16), Difícil (10 pares/20) e Extremo (12 pares/24).
- Treino livre com embaralhamento variável e desafio diário com disposição reprodutível por data de Brasília e dificuldade.
- Cronômetro opcional, tentativas, progresso, vitória e reinício.
- Ranking diário opcional por apelido: **menos tentativas vence; tempo é o desempate**.
- Apenas partidas diárias com cronômetro permitem registrar um resultado por UID, dia e dificuldade.
- HUD: catálogo, pesquisa e Hall da Fama incluem o quarto jogo.

## Como instalar no GitHub Pages

### Instalação completa

1. Faça backup do repositório **NEXUS** atual.
2. Extraia o arquivo **NEXUS-Central-de-Jogos-Memoria.zip**.
3. Envie **o conteúdo extraído** para a raiz do repositório NEXUS (não inclua uma pasta externa adicional).
4. Preserve os subdiretórios `assets/` e `jogos/` e confirme os arquivos modificados.
5. Certifique-se de que o GitHub Pages publica a branch `main` e a pasta raiz `/`.

### Atualizar o projeto já publicado

Extraia **NEXUS-Atualizacao-Memoria.zip** e envie os arquivos preservando as pastas. O pacote contém o novo módulo `jogos/memoria/` e somente os arquivos compartilhados modificados (`index.html`, catálogo, HUD, Firebase e `firestore.rules`).

### URLs

- Central: `https://SEU-USUARIO.github.io/NEXUS-Central-de-Jogos/`
- Memória: `https://SEU-USUARIO.github.io/NEXUS-Central-de-Jogos/jogos/memoria/`

## Ativar o ranking no Firebase

O projeto usa a configuração Firebase existente da NEXUS.

1. Confirme em **Firebase Authentication → Método de login** que **Anônimo** está ativado. Mantenha **E-mail/Senha** para o Caça-Palavras.
2. No Console Firebase, vá a **Firestore Database → Regras**, faça uma cópia de segurança das regras atuais, depois publique as regras completas do arquivo `firestore.rules`.
3. As regras acrescentam o caminho: `rankings_memoria/{nivel}/dias/{AAAA-MM-DD}/participantes/{uid}`.
4. Ao registrar o primeiro tempo, o Firestore cria a subcoleção automaticamente; **não precisa criar coleções nem índices compostos manualmente** (consulta ordenada por `ordem`, um único campo).
5. Teste uma partida diária com cronômetro, informe um apelido e confira o resultado no Hall da Fama da Central.

**Atenção:** enviar `firestore.rules` ao GitHub não publica as regras no Firebase. Use a aba Regras do console Firebase.

## Arquivos novos

```
jogos/memoria/
├── index.html     # interface e navegação
├── estilo.css     # visual responsivo futurista
├── engine.js      # motor puro e embaralhamento determinístico
├── jogo.js        # lógica e interações de partida
└── ranking.js     # leitura e registro opcional no Firestore
```

## Como funciona o ranking

O ranking é limitado aos desafios diários com cronômetro. Os resultados são ordenados por `ordem = tentativas * 100000000 + tempoMs`. Portanto, nenhuma diferença de segundos supera uma diferença de uma tentativa. Apenas um registro **por conta do Firebase/UID, dificuldade e dia** pode ser enviado; não é um bloqueio por pessoa física. A pontuação é calculada no navegador: **não é uma classificação antifraude**. Para premiações, seria necessário verificar jogadas em backend confiável.

## Testes e observações

- 600 layouts gerados e conferidos (150 para cada dificuldade), incluindo pares únicos e reprodutibilidade diária.
- Teste de navegador em versão desktop e celular: viradas, bloqueio, fechamento automático, vitória, desafio diário e navegação da HUD.
- A leitura/gravação REAL do ranking depende da conexão e das regras Firestore publicadas. Não foi validada contra a instância Firebase ativa do usuário.
- Arquivos do Caça-Palavras, Campo Minado e Sudoku preservados byte a byte em relação ao pacote anterior.
