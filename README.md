<div align="center">

# NEXUS — Central de Jogos

**Uma plataforma web de jogos casuais, lógica e desafios de palavras.**

Explore jogos independentes em uma experiência unificada, com interface futurista, níveis de dificuldade e recursos de pontuação.

[**Abrir a plataforma**](https://felipusa96.github.io/NEXUS-Central-de-Jogos/)

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-7c3aed?style=flat-square)
![HTML5](https://img.shields.io/badge/HTML5-estrutura-e34f26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-interface-1572b6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-l%C3%B3gica-f7df1e?style=flat-square&logo=javascript&logoColor=111111)
![Firebase](https://img.shields.io/badge/Firebase-integra%C3%A7%C3%A3o-ffca28?style=flat-square&logo=firebase&logoColor=111111)
![GitHub Pages](https://img.shields.io/badge/deploy-GitHub%20Pages-222222?style=flat-square&logo=githubpages&logoColor=white)

</div>

---

## Visão geral

A **NEXUS — Central de Jogos** reúne experiências de entretenimento e raciocínio em um único site. A aplicação é construída com HTML, CSS e JavaScript, mantém os jogos organizados em módulos e pode ser hospedada como site estático no GitHub Pages.

O projeto está em desenvolvimento contínuo. Algumas funções, como rankings e salvamento de modelos, dependem da configuração do Firebase e das regras de acesso do Cloud Firestore.

## Catálogo

| Jogo | Categoria | Descrição | Estado |
|---|---|---|---|
| [Caça-Palavras](./jogos/caca-palavras/) | Palavras | Encontre palavras ocultas em diferentes temas e dificuldades. | Disponível |
| [Campo Minado](./jogos/campo-minado/) | Lógica | Use as pistas numéricas para identificar casas seguras e evitar minas. | Disponível |
| [Sudoku](./jogos/sudoku/) | Lógica | Complete grades de Sudoku, com níveis de dificuldade e desafio diário. | Disponível |
| [Jogo da Memória](./jogos/memoria/) | Memória | Encontre pares e conclua a partida com o menor número de tentativas possível. | Disponível |
| [Paciência Spider](./jogos/paciencia-spider/) | Cartas | Organize as cartas em sequências decrescentes do Rei ao Ás. | Disponível |
| [Palavras Cruzadas](./jogos/palavras-cruzadas/) | Palavras | Resolva grades com pistas ou usando uma lista de palavras. | Disponível |
| [CrossMath](./jogos/crossmath/) | Matemática | Resolva equações aritméticas que se cruzam em uma grade. | Disponível |
| Quiz | Conhecimento | Módulo planejado para desafios de perguntas e respostas. | Planejado |

## Funcionalidades da plataforma

- Interface com identidade visual futurista e HUD compartilhada.
- Navegação por catálogo, filtros e categorias.
- Temas de interface claro e escuro nos módulos compatíveis.
- Quatro níveis de dificuldade nos jogos que oferecem essa configuração.
- Cronômetros formatados para exibir minutos e horas corretamente.
- Integração opcional com Firebase Authentication e Cloud Firestore.
- Rankings para os módulos compatíveis, sujeitos à configuração do serviço e às regras publicadas.
- Estrutura modular para facilitar manutenção e expansão.

### Destaques dos módulos

**Caça-Palavras** — seleção de temas, busca de palavras em diferentes direções, opção de cronômetro, desistência com revelação das respostas e recursos de conta/salvamento disponíveis conforme a configuração do Firebase.

**Campo Minado** — tabuleiro com coordenadas alfanuméricas, marcação de bandeiras e níveis de dificuldade.

**Sudoku, Memória e Paciência Spider** — modos de jogo e desafios diários conforme implementados em cada módulo, com regras de pontuação próprias.

**Palavras Cruzadas** — banco compartilhado com **299 palavras únicas**, modalidade **Com dicas**, modalidade **Lista de palavras**, quatro níveis de dificuldade e suporte a listas personalizadas.

**CrossMath** — desafios matemáticos gerados dinamicamente em tabuleiros assimétricos e irregulares, com equações horizontais e verticais conectadas, ramificações, quatro níveis de dificuldade e validação das operações.

## Tecnologias

- **HTML5:** estrutura das páginas e dos jogos.
- **CSS3:** layout responsivo, temas, animações e componentes visuais.
- **JavaScript (ES Modules):** lógica dos jogos, navegação, filtros e integração entre módulos.
- **Firebase Authentication:** identificação de usuários nos recursos compatíveis.
- **Cloud Firestore:** consulta e registro de dados de ranking/modelos conforme as regras configuradas.
- **GitHub Pages:** hospedagem da versão estática.

Não há etapa de compilação obrigatória. Os módulos que usam ES Modules devem ser executados por um servidor HTTP local, e não diretamente por `file://`.

## Estrutura do repositório

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
│   ├── crossmath/
│   ├── memoria/
│   ├── paciencia-spider/
│   ├── palavras-cruzadas/
│   └── sudoku/
├── docs/
├── firestore.rules
├── CHANGELOG.md
├── CONTRIBUTING.md
├── SECURITY.md
└── README.md
```

Cada jogo possui seu próprio diretório. Os arquivos compartilhados de interface, catálogo, integração e banco de palavras ficam em `assets/`.

## Executar localmente

### Opção 1 — Python

1. Baixe ou clone este repositório.
2. Abra um terminal na pasta raiz do projeto.
3. Execute:

```bash
python -m http.server 8000
```

No Windows, também é possível usar `py -m http.server 8000`.

4. Abra `http://localhost:8000` no navegador.

### Opção 2 — Visual Studio Code

Abra a pasta do projeto no Visual Studio Code, inicie um servidor local com a extensão Live Server e acesse o endereço local informado pela extensão.

## Publicar no GitHub Pages

1. Envie o **conteúdo** desta pasta para a raiz do repositório GitHub. `index.html`, `assets/` e `jogos/` devem ficar diretamente na raiz do repositório — não dentro de uma segunda pasta `NEXUS-Central-de-Jogos-Completo/`.
2. Faça commit e push para a branch utilizada na publicação.
3. No GitHub, abra **Settings → Pages** e confira a origem configurada. Para publicação por branch, selecione a branch correta e a pasta `/ (root)`.
4. Aguarde a conclusão da publicação e abra o endereço informado pelo GitHub Pages.
5. Após atualizar arquivos, recarregue a página com `Ctrl + F5` ou teste em uma janela anônima.

O arquivo `docs/PUBLICACAO-GITHUB-PAGES.md` contém um procedimento mais detalhado e uma lista de verificação.

## Configuração do Firebase

A integração atual aponta para o projeto Firebase utilizado pela aplicação original. Se for necessário usar outro projeto, confira todas as configurações no código, habilite os provedores de autenticação utilizados e configure o Cloud Firestore.

O arquivo `firestore.rules` contém regras versionadas, mas **enviar o arquivo ao GitHub não publica as regras no Firebase**. A implantação deve ser feita separadamente pelo Firebase Console ou por uma ferramenta de implantação configurada. Consulte [`docs/FIREBASE.md`](./docs/FIREBASE.md).

As chaves de configuração web do Firebase são identificadores destinados ao cliente; elas não substituem regras de segurança. Nunca publique chaves privadas de contas de serviço, credenciais administrativas ou arquivos secretos.

> **Limitação importante:** os rankings são registrados a partir do navegador. As regras restringem operações e formatos, mas não tornam o cliente uma autoridade confiável para validar a partida. Para competições com prêmios ou decisões de alto impacto, seria necessário validar resultados em um backend confiável.

## Documentação

- [Arquitetura do projeto](./docs/ARQUITETURA.md)
- [Publicação no GitHub Pages](./docs/PUBLICACAO-GITHUB-PAGES.md)
- [Configuração do Firebase e Firestore](./docs/FIREBASE.md)
- [Auditoria do banco de palavras](./docs/AUDITORIA-BANCO-DE-PALAVRAS.md)
- [Histórico de alterações](./CHANGELOG.md)
- [Como contribuir](./CONTRIBUTING.md)
- [Relato responsável de vulnerabilidades](./SECURITY.md)

## Testes e validação

Não existe atualmente uma suíte de testes automatizados integrada ao repositório. Antes de publicar mudanças, recomenda-se validar a sintaxe dos arquivos JavaScript, conferir os caminhos locais, testar cada jogo nos níveis disponíveis e verificar os recursos dependentes do Firebase.

Durante a preparação deste pacote completo, foram verificadas a sintaxe dos arquivos JavaScript, a existência dos caminhos locais referenciados pelo HTML e a integridade do banco compartilhado de palavras (**299 entradas únicas**). Isso não substitui testes funcionais em todos os navegadores nem confirma, por si só, a implantação no GitHub Pages.

## Contribuições

Sugestões, correções e novas ideias são bem-vindas. Antes de abrir uma solicitação, consulte [`CONTRIBUTING.md`](./CONTRIBUTING.md) e descreva o problema ou melhoria com passos claros para reprodução.

## Licença

Este repositório não declara uma licença de código aberto no momento. Até que uma licença seja adicionada pelo responsável pelo projeto, não presuma permissão para redistribuir, modificar ou utilizar o código fora dos direitos previstos em lei.

---

<div align="center">

**NEXUS — Pense. Jogue. Evolua.**

</div>
