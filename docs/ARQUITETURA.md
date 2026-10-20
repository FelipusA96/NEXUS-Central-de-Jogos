# Arquitetura do projeto

## Visão geral

A NEXUS é uma aplicação web estática. A página inicial funciona como portal e catálogo; cada jogo é um módulo separado. Não há processo de compilação obrigatório nem servidor de aplicação próprio no pacote atual.

## Componentes compartilhados

| Caminho | Responsabilidade |
|---|---|
| `index.html` | Estrutura da central e pontos de montagem da interface. |
| `assets/css/hud.css` | Estilos globais, navegação, catálogo e identidade visual da central. |
| `assets/css/game-bridge.css` | Elementos compartilhados de navegação entre a central e os jogos. |
| `assets/js/app.js` | Comportamento da central, renderização do catálogo, filtros e integração da interface com rankings. |
| `assets/js/catalog.js` | Metadados do catálogo: identificador, título, categoria, descrição e caminho de cada jogo. |
| `assets/js/firebase.js` | Inicialização do Firebase e leitura dos rankings usados pela central. |
| `assets/js/word-bank.js` | Banco compartilhado de palavras, com palavra, forma original, pista e categoria. |
| `firestore.rules` | Regras versionadas do Cloud Firestore; precisam ser implantadas separadamente. |

## Módulos de jogo

Cada módulo fica em `jogos/<id-do-jogo>/`. Conforme a complexidade, pode conter:

- `index.html`: interface e elementos de controle;
- `estilo.css`: apresentação específica do jogo;
- `jogo.js`: estado da partida, eventos e interação;
- `engine.js`: regras ou geração do tabuleiro;
- `ranking.js`: leitura ou envio de resultados, quando aplicável.

O Caça-Palavras mantém uma implementação mais concentrada em seu `index.html` por compatibilidade com a estrutura existente. O banco compartilhado é carregado a partir de `assets/js/word-bank.js`.

## Fluxo do catálogo

1. `catalog.js` declara os metadados dos jogos.
2. `app.js` usa esses dados para apresentar cartões, categorias e links.
3. Cada cartão aponta para o diretório do jogo correspondente.
4. Os recursos compartilhados são referenciados por caminhos relativos, permitindo a hospedagem em um subdiretório do GitHub Pages.

Ao adicionar um jogo, atualize o catálogo, crie o diretório do módulo e teste todos os caminhos relativos.

## Integração com Firebase

O cliente usa Firebase Web SDK por módulos ES carregados da CDN oficial. A inicialização da central está em `assets/js/firebase.js`; o Caça-Palavras também possui sua integração no próprio HTML. Se trocar de projeto Firebase, revise ambos os pontos de configuração.

O Firestore é utilizado para rankings e modelos, de acordo com as regras atuais. O arquivo `firestore.rules` não é aplicado automaticamente pelo GitHub Pages.

## Compatibilidade e execução

Como há módulos JavaScript e importações por URL, use um servidor HTTP local. Abrir os arquivos diretamente com `file://` pode impedir o carregamento dos módulos por restrições do navegador.

## Limites conhecidos

- Não há pipeline de compilação nem suíte automatizada de testes no repositório atual.
- A validação de resultados dos rankings acontece no cliente; não é apropriada para competições de alto impacto sem validação adicional no servidor.
- O comportamento dos recursos remotos depende da disponibilidade e da configuração do Firebase.
