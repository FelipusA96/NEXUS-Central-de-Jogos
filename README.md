<div align="center">

# ✦ NEXUS — Central de Jogos

**Uma central de desafios digitais para exercitar a lógica, a memória e o conhecimento.**

Explore jogos independentes em uma interface unificada, com identidade visual futurista, desafios em diferentes dificuldades e recursos que incentivam a evolução a cada partida.

[**🎮 Abrir a Central**](https://felipusa96.github.io/NEXUS-Central-de-Jogos/)

![Status do projeto](https://img.shields.io/badge/status-em%20desenvolvimento-7c3aed?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-estrutura-e34f26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-interface-1572b6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-interatividade-f7df1e?style=for-the-badge&logo=javascript&logoColor=111111)

</div>

---

## 🧭 Sobre o projeto

A **NEXUS — Central de Jogos** é um projeto web que reúne diferentes experiências de entretenimento e raciocínio em um só lugar. A proposta é oferecer uma navegação simples, uma apresentação visual consistente e jogos que possam ser acessados diretamente pelo navegador.

A plataforma está em evolução contínua. Novos recursos, melhorias de interface e ajustes nas mecânicas são incorporados gradualmente, mantendo os jogos organizados em módulos próprios.

### ✨ Principais objetivos

- Reunir jogos de palavras, lógica, memória e cartas em uma única central.
- Criar uma identidade visual futurista, com HUD, elementos neon e temas claro e escuro.
- Oferecer diferentes níveis de dificuldade e desafios que incentivem a prática.
- Organizar o catálogo por categorias, com pesquisa e navegação direta para cada jogo.
- Centralizar a leitura de rankings compatíveis com a integração ao Firebase.
- Manter uma estrutura modular para facilitar manutenção e futuras expansões.

## 🎮 Catálogo de jogos

| Código | Jogo | Categoria | Descrição | Situação |
|:---:|---|---|---|:---:|
| 001 | [Caça-Palavras](./jogos/caca-palavras/) | Palavras | Encontre palavras escondidas, explore temas e tente superar seus melhores tempos. | **Disponível** |
| 002 | [Campo Minado](./jogos/campo-minado/) | Lógica | Analise as pistas numéricas, marque possíveis minas e descubra as casas seguras. | **Disponível** |
| 003 | [Sudoku](./jogos/sudoku/) | Lógica | Complete a grade respeitando as regras do Sudoku, com níveis de dificuldade e desafio diário. | **Disponível** |
| 004 | [Jogo da Memória](./jogos/memoria/) | Memória | Encontre os pares de cartas e tente concluir a partida com o menor número de tentativas. | **Disponível** |
| 005 | [Paciência Spider](./jogos/paciencia-spider/) | Cartas | Organize as cartas em sequências decrescentes e conclua as sequências do Rei ao Ás. | **Disponível** |
| 006 | [Palavras Cruzadas](./jogos/palavras-cruzadas/) | Palavras | Preencha a grade usando pistas horizontais e verticais ou uma lista de palavras. | **Disponível** |
| 007 | Quiz | Conhecimento | Uma experiência de perguntas e respostas planejada para uma próxima etapa do projeto. | **Em planejamento** |

> A situação dos módulos reflete a organização atual do código e pode mudar conforme novas versões forem desenvolvidas.

## 🧩 Destaques da plataforma

### Uma interface unificada

- Visual inspirado em interfaces futuristas e HUDs de jogos.
- Alternância entre tema escuro e claro.
- Catálogo com busca por texto e filtros por categoria.
- Navegação entre início, catálogo, rankings e perfil.
- Layout pensado para uso em computadores e dispositivos móveis.

### Desafios e pontuações

Os jogos possuem regras próprias de pontuação e conclusão. Nos módulos compatíveis, a central pode consultar rankings por jogo e dificuldade. Alguns resultados dependem de condições específicas, como concluir um desafio diário ou jogar com o cronômetro ativado.

A disponibilidade dos rankings depende da configuração do Firebase, das regras do Firestore e da publicação correta da aplicação.

## 🔤 Banco compartilhado de palavras

O projeto conta com um banco compartilhado de **299 palavras únicas**, revisado a partir de uma lista de 300 entradas. O banco mantém palavras, pistas e categorias para reutilização entre os jogos de palavras.

As palavras estão organizadas em seis grupos temáticos:

- **Animais e Plantas**
- **Geografia, Astronomia e Clima**
- **Comida e Bebida**
- **Corpo Humano e Saúde**
- **Profissões, Objetos e Cotidiano**
- **Conhecimentos Gerais, Verbos, Cores e Abstratos**

O arquivo compartilhado está em `assets/js/word-bank.js`.

### Caça-Palavras

Além dos temas já existentes, o jogo pode utilizar os grupos do banco compartilhado, permitindo ampliar o conteúdo sem manter listas duplicadas em cada módulo.

### Palavras Cruzadas

O módulo possui duas modalidades principais:

- **Com dicas:** descubra as respostas pelas pistas horizontais e verticais.
- **Lista de palavras:** consulte a lista de respostas que foram posicionadas na grade; cada palavra é marcada como concluída quando suas letras são preenchidas corretamente.

Também é possível trabalhar com listas personalizadas, incluindo dicas no formato `PALAVRA | DICA`.

## 🛠️ Tecnologias utilizadas

| Tecnologia | Utilização |
|---|---|
| **HTML5** | Estrutura das páginas e dos módulos de jogo. |
| **CSS3** | Identidade visual, HUD, temas, animações e adaptação de layout. |
| **JavaScript** | Mecânicas dos jogos, navegação, filtros, estado de interface e validações. |
| **JavaScript ES Modules** | Organização dos recursos compartilhados e carregamento modular. |
| **Firebase Authentication** | Integração de autenticação e identificação de sessão nos recursos compatíveis. |
| **Cloud Firestore** | Consulta e armazenamento de resultados nos rankings configurados. |
| **GitHub Pages** | Hospedagem estática da aplicação web. |

O projeto não depende de um processo de compilação para servir suas páginas estáticas. Os módulos utilizam arquivos HTML, CSS e JavaScript organizados por responsabilidade.

## 🗂️ Organização dos arquivos

```text
NEXUS-Central-de-Jogos/
├── index.html
├── assets/
│   ├── css/
│   │   ├── hud.css
│   │   └── game-bridge.css
│   └── js/
│       ├── app.js
│       ├── catalog.js
│       ├── firebase.js
│       └── word-bank.js
├── jogos/
│   ├── caca-palavras/
│   ├── campo-minado/
│   ├── sudoku/
│   ├── memoria/
│   ├── paciencia-spider/
│   └── palavras-cruzadas/
└── firestore.rules
```

Cada jogo mantém seus próprios arquivos e lógica, enquanto os recursos compartilhados ficam em `assets/`. Essa separação ajuda a evoluir um módulo sem concentrar toda a aplicação em um único arquivo.

## ▶️ Como executar localmente

Como a aplicação utiliza módulos JavaScript, recomendamos executá-la por um servidor local em vez de abrir o `index.html` diretamente pelo explorador de arquivos.

### Opção 1 — Visual Studio Code

1. Baixe ou clone o repositório.
2. Abra a pasta do projeto no Visual Studio Code.
3. Inicie um servidor local com uma extensão como **Live Server**.
4. Abra o endereço local informado pela extensão.

### Opção 2 — Python

Se o Python estiver instalado, abra um terminal na raiz do projeto e execute:

```bash
python -m http.server 8000
```

Depois, acesse `http://localhost:8000` no navegador.

## 🌐 Publicação no GitHub Pages

Para hospedar a versão estática pelo GitHub Pages:

1. Envie os arquivos do projeto para o repositório, preservando a estrutura de pastas.
2. Abra **Settings → Pages** no GitHub.
3. Configure a publicação a partir da branch e da pasta utilizadas pelo repositório — normalmente a raiz (`/`).
4. Aguarde a publicação e abra o endereço indicado pelo GitHub Pages.
5. Após atualizar os arquivos, recarregue o site. Se necessário, utilize `Ctrl + F5` para limpar o cache da página.

## 🔐 Firebase e rankings

Os recursos que utilizam Firebase precisam estar configurados no projeto correspondente. Em uma nova instalação ou ao alterar as regras, confira:

- Os provedores de autenticação necessários estão ativados no Firebase Authentication.
- O Cloud Firestore está habilitado.
- As regras de segurança do Firestore correspondem aos recursos publicados.
- Os jogos e a central estão apontando para o projeto Firebase correto.

**Importante:** o arquivo `firestore.rules` presente no repositório é uma referência versionada das regras. Enviá-lo ao GitHub **não publica automaticamente** as regras no Firebase. A publicação deve ser feita separadamente pelo Firebase Console ou por uma ferramenta de implantação configurada.

Os rankings são alimentados por dados enviados pela aplicação cliente. Portanto, resultados usados em competições com premiações ou decisões importantes exigiriam validações adicionais em um ambiente confiável de servidor.

## 🧪 Desenvolvimento e próximos passos

O desenvolvimento da NEXUS é incremental. Entre as frentes de evolução estão:

- Refinar a experiência visual e a navegação entre módulos.
- Ampliar e revisar os conteúdos utilizados nos jogos de palavras.
- Melhorar consistência, responsividade e usabilidade em diferentes telas.
- Evoluir os rankings e os desafios diários de acordo com as regras de cada jogo.
- Planejar e desenvolver novos módulos, incluindo o Quiz.
- Realizar testes após cada atualização e validar os recursos que dependem de serviços externos.

As funcionalidades disponíveis podem variar conforme a versão dos arquivos publicada e a configuração dos serviços externos.

## 🤝 Sugestões e melhorias

Ideias para novos jogos, sugestões de interface e relatos de problemas são bem-vindos. Ao registrar uma sugestão, procure informar:

1. Qual jogo ou área da central está envolvida.
2. O comportamento esperado.
3. O que aconteceu na prática.
4. Os passos necessários para reproduzir o problema, quando aplicável.

## 📌 Status do projeto

A NEXUS está **em desenvolvimento ativo**. A estrutura modular permite adicionar novos jogos e recursos gradualmente, preservando a identidade da central e os módulos já existentes.

---

<div align="center">

**NEXUS — Pense. Jogue. Evolua.**

*Uma central em constante construção, feita para transformar pequenas pausas em novos desafios.*

</div>
