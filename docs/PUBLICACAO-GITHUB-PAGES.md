# Publicação completa no GitHub Pages

Este guia descreve como publicar o conteúdo completo do projeto sem criar uma pasta aninhada que impeça o site de localizar os arquivos.

## 1. Preparar os arquivos

1. Baixe o pacote completo da NEXUS e extraia o ZIP.
2. Abra a pasta extraída. Ela deve conter `index.html`, `assets/`, `jogos/`, `docs/` e os arquivos Markdown na raiz.
3. Não envie o arquivo ZIP como substituto do código: extraia-o primeiro.
4. Se o repositório já existe, mantenha a pasta interna `.git` do clone local. O pacote de atualização não contém essa pasta.

**Estrutura correta na raiz do repositório:**

```text
seu-repositorio/
├── index.html
├── assets/
├── jogos/
├── docs/
├── firestore.rules
└── README.md
```

**Evite esta estrutura:**

```text
seu-repositorio/
└── NEXUS-Central-de-Jogos-Completo/
    ├── index.html
    ├── assets/
    └── jogos/
```

A estrutura incorreta deixa o `index.html` fora da raiz publicada e pode fazer o GitHub Pages continuar servindo uma versão antiga ou não encontrar os arquivos.

## 2. Enviar os arquivos

### Opção recomendada — GitHub Desktop

1. Abra o clone local do repositório no GitHub Desktop.
2. Copie o conteúdo extraído do pacote para a pasta raiz do clone, aceitando substituir os arquivos existentes quando apropriado.
3. Confira a lista de alterações. Verifique especialmente `index.html`, `assets/`, `jogos/` e `docs/`.
4. Escreva uma mensagem de commit, por exemplo: `Atualiza central NEXUS e documentação`.
5. Clique em **Commit to main** (ou na branch usada pelo projeto) e depois em **Push origin**.

### Opção por Git no terminal

Execute na pasta do clone local, após copiar os arquivos:

```bash
git status
git add .
git commit -m "Atualiza central NEXUS e documentação"
git push
```

Confirme que está na branch correta antes de executar o `push`.

## 3. Conferir a configuração do Pages

1. Abra o repositório no GitHub.
2. Acesse **Settings → Pages**.
3. Confira a origem da publicação. Se usar **Deploy from a branch**, selecione a branch correta e a pasta `/ (root)`.
4. Aguarde o término da publicação e abra o endereço informado nessa página.

## 4. Verificar Palavras Cruzadas

Na página de configuração de Palavras Cruzadas, a versão R2 deve mostrar:

- `299 palavras no banco`;
- os botões `Com dicas` e `Lista de palavras`;
- o selo `ATUALIZADO · 2 MODOS`.

Se aparecerem apenas 54 palavras ou os controles de modalidade estiverem ausentes:

1. Confirme no GitHub se `jogos/palavras-cruzadas/index.html` contém os controles `mode-clues` e `mode-list`.
2. Confirme se `assets/js/word-bank.js` contém 299 entradas únicas.
3. Confirme se a branch e a pasta configuradas em **Settings → Pages** correspondem aos arquivos atualizados.
4. Recarregue com `Ctrl + F5` ou teste em uma janela anônima.

## 5. Verificação após publicação

- Abra a página inicial e todos os módulos listados no catálogo.
- Teste cada nível de dificuldade e os controles de reinício/desistência aplicáveis.
- Abra o console do navegador e verifique erros de carregamento.
- Se os rankings falharem, confira a configuração e as regras do Firebase separadamente.

**Importante:** o upload ao GitHub não publica automaticamente regras do Firestore. Consulte [`FIREBASE.md`](./FIREBASE.md).
