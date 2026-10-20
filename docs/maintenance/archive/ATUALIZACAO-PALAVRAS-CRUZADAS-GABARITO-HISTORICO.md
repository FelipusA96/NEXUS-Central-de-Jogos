# Atualização NEXUS — Desistir e revelar o gabarito

Esta atualização adiciona ao jogo **Palavras Cruzadas** uma opção para desistir da rodada e preencher automaticamente a grade com as respostas corretas.

## O que mudou

- Adicionado o botão **Desistir** ao lado de **Limpar** e **Conferir**.
- Ao clicar, o jogo pede confirmação antes de encerrar a partida.
- Após a confirmação, o cronômetro é interrompido e todas as células jogáveis recebem a letra correta.
- As células do gabarito ficam destacadas em violeta e a tela exibe o aviso **Gabarito revelado**.
- A desistência não é apresentada como vitória; o jogador pode usar **Próxima grade** para iniciar outra rodada.
- A opção de desistir fica desativada depois que a partida termina. Limpar a grade ou gerar uma nova rodada restaura o jogo.

## Arquivos alterados

- `jogos/palavras-cruzadas/index.html`
- `jogos/palavras-cruzadas/jogo.js`
- `jogos/palavras-cruzadas/estilo.css`

## Como aplicar a atualização incremental

1. Faça uma cópia de segurança do repositório, se desejar.
2. Extraia o arquivo ZIP incremental na **raiz** do repositório `NEXUS-Central-de-Jogos`, mantendo a estrutura de pastas e permitindo substituir os arquivos existentes.
3. Confira se os três arquivos acima foram substituídos.
4. Faça commit e push para o GitHub.
5. Abra Palavras Cruzadas e atualize a página com `Ctrl + F5`.

> O ZIP incremental contém apenas os três arquivos alterados e este documento de instruções. Não o use como substituto do projeto inteiro.

## Validação realizada

Foram verificados a sintaxe JavaScript, os identificadores HTML referenciados pelo código, a integridade do banco de 299 palavras e a consistência das letras das grades geradas nos quatro níveis de dificuldade. A publicação e o funcionamento no GitHub Pages ainda precisam ser confirmados após o envio dos arquivos.
