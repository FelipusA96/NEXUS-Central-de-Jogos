# NEXUS — Central de Jogos (protótipo funcional)

Este diretório é um site estático completo para GitHub Pages. **Não exige build, React ou servidor.**

## Organização

```
index.html                          Central NEXUS / HUD
jogos/caca-palavras/index.html      Caça-Palavras existente, preservado
assets/css/hud.css                  Estilo futurista da central
assets/css/game-bridge.css          Barra de retorno da Central no jogo
assets/js/catalog.js                Catálogo de jogos (módulos disponíveis/em breve)
assets/js/app.js                    Navegação, busca, filtros e ajustes da HUD
assets/js/firebase.js               Firebase sob demanda (ranking/perfil)
firestore.rules                     Cópia das regras utilizadas pelo jogo atual
```

## Como publicar

1. **Faça backup** do `index.html` atual do repositório e de quaisquer arquivos existentes.
2. Copie **todo o conteúdo desta pasta** para a raiz do mesmo repositório GitHub Pages. Os caminhos relativos precisam ser preservados.
3. Acesse a URL habitual do GitHub Pages: agora será a central NEXUS.
4. Clique em **Jogar Caça-Palavras** ou entre em `jogos/caca-palavras/` para jogar a versão atual.
5. A aba **Rankings** da central consulta os dados públicos existentes do Firestore (regras atuais precisam estar publicadas).
6. A aba **Perfil** consulta a sessão Firebase quando aberta. O login continua dentro do Caça-Palavras.

### Links compartilhados antigos

Os links antigos `https://exemplo.github.io/repositorio/?modelo=CP-XXXX-XXXX-XXXX` são automaticamente redirecionados pela central para `.../jogos/caca-palavras/?modelo=CP-XXXX-XXXX-XXXX`.

### O que já está funcional

- Navegação entre Início, Jogos, Rankings e Perfil por hash (`#inicio`, `#jogos`, `#ranking`, `#perfil`).
- Busca instantânea de jogos e filtro por categoria.
- Tema futurista escuro/claro persistido no navegador.
- Jogo Caça-Palavras original: temas, quatro dificuldades, cronômetro, vitória, desistência, Firebase e ranking.
- Ranking da Central consulta os dados reais do Firestore quando acessado; sem placares fictícios.
- Perfil da Central consulta a sessão Firebase quando acessado.
- Cartões de Memória, Sudoku e Quiz apresentam conceitos, **não jogos implementados**.

### O que não foi alterado

- Regras e coleções existentes do Firestore, inclusive `rankings/{nivel}/participantes/{uid}`.
- Configuração Firebase do jogo original e sua lógica (foi adicionada apenas a barra de navegação para a Central).

### Como adicionar outro jogo

1. Crie `jogos/<nome-do-jogo>/index.html` com o jogo independente.
2. Adicione o item em `assets/js/catalog.js` com `playable:true` e `href:'./jogos/<nome-do-jogo>/'`.
3. Se quiser rankings próprios, crie novas coleções e regras Firestore apropriadas; **não misture tempos de jogos diferentes**.

**Nota:** Os tempos atuais são submetidos pelo navegador; para competições com prêmios, use verificação antifraude no servidor.
