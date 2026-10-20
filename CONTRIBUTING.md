# Guia de contribuição

Obrigado pelo interesse em melhorar a NEXUS — Central de Jogos.

## Antes de propor uma mudança

1. Identifique o módulo envolvido e leia a documentação correspondente em `docs/`.
2. Verifique se a sugestão já existe no histórico de issues ou discussões do repositório.
3. Prefira alterações pequenas, com objetivo claro e escopo delimitado.
4. Não inclua credenciais privadas, tokens, chaves de serviço ou dados pessoais reais.

## Organização do código

- O catálogo e os metadados dos jogos ficam em `assets/js/catalog.js`.
- A lógica compartilhada da central fica em `assets/js/app.js`.
- Os estilos globais ficam em `assets/css/`.
- Cada módulo de jogo deve manter seus arquivos em seu próprio diretório dentro de `jogos/`.
- Recursos compartilhados, como o banco de palavras, devem ficar em `assets/` para evitar duplicação desnecessária.
- Preserve os caminhos relativos para que os jogos funcionem tanto localmente quanto em subdiretórios do GitHub Pages.

## Verificações antes do envio

- Confira a sintaxe dos arquivos JavaScript alterados.
- Teste a página inicial e o módulo modificado em um servidor HTTP local.
- Teste os diferentes níveis e os estados de vitória, derrota, reinício e desistência aplicáveis.
- Confira console do navegador e requisições com falha.
- Se a alteração depender do Firebase, teste com as regras e provedores configurados e descreva qualquer requisito adicional.
- Atualize o `README.md` ou a documentação quando mudar comportamento, configuração ou estrutura.
- Registre as mudanças relevantes em `CHANGELOG.md`.

## Pull requests e relatos

Descreva o objetivo, a solução, os módulos afetados e os testes realizados. Para mudanças visuais, inclua capturas de tela antes/depois quando possível. Para bugs, informe passos para reproduzir, comportamento esperado e comportamento observado.

## Escopo e licenciamento

A contribuição não altera automaticamente a situação de licenciamento do repositório. Consulte a seção de licença do README antes de reutilizar ou redistribuir o código.
