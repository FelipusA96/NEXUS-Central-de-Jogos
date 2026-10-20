# NEXUS — Correção do banco de palavras cruzadas

## O que esta atualização corrige

- Garante que a tela de Palavras Cruzadas carregue o banco compartilhado com **299 palavras únicas** de `assets/js/word-bank.js`.
- Inclui o arquivo `engine.js`, que precisa usar o banco compartilhado, em vez de uma versão antiga com uma lista reduzida.
- Atualiza os arquivos HTML, JavaScript e CSS do jogo.
- Adiciona identificadores de versão (`?v=20261020`) nos arquivos carregados para evitar que o navegador continue usando scripts e estilos antigos em cache.
- Exibe uma mensagem de erro clara e impede iniciar a rodada caso o banco tenha menos de 299 palavras, em vez de continuar silenciosamente com uma lista incompleta.
- Mantém as duas modalidades: **Com dicas** (resolver pelas pistas horizontais e verticais) e **Lista de palavras** (consultar a lista de respostas da grade; cada palavra é riscada quando todas as letras correspondentes estiverem corretas).
- Preserva a opção **Desistir**, a confirmação e o preenchimento do gabarito nas células.

## Instalação

1. Extraia o ZIP na raiz do repositório `NEXUS-Central-de-Jogos`.
2. Permita a substituição dos arquivos existentes.
3. Confirme que `assets/js/word-bank.js` está presente no repositório. O ZIP inclui esse arquivo.
4. Faça commit e push para o GitHub.
5. Após a publicação, abra Palavras Cruzadas e faça uma recarga forçada (`Ctrl + F5` no computador). No celular, limpe o cache do navegador ou abra o site em uma aba anônima para confirmar a versão nova.

## Arquivos incluídos

- `assets/js/word-bank.js`
- `jogos/palavras-cruzadas/index.html`
- `jogos/palavras-cruzadas/engine.js`
- `jogos/palavras-cruzadas/jogo.js`
- `jogos/palavras-cruzadas/estilo.css`

Esta atualização prepara os arquivos; ela não publica alterações no GitHub automaticamente.
