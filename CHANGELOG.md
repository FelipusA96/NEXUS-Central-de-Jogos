## 2026-10-20 — CrossMath R2: ampliação dos valores numéricos

- Fácil: valores-base de 1 a 9.
- Médio: valores-base de 1 a 99, com campos para até dois dígitos.
- Difícil: valores-base de 10 a 999, com campos para até três dígitos.
- Extremo: valores-base de 100 a 999, priorizando a casa das centenas.
- A geração das operações foi adaptada aos limites de cada nível; a validação aceita respostas maiores e preserva operações inteiras.
- Interface, instruções, indicador de faixa e cache dos arquivos atualizados.
- CSS refinado para legibilidade de números com dois e três dígitos.

## 2026-10-20 — Palavras Cruzadas: regeneração ao trocar modalidade

- Ao alternar entre “Com dicas” e “Lista de palavras” durante uma partida, a grade é gerada novamente com uma nova seleção/disposição de palavras.
- Ao clicar novamente na modalidade já ativa, a partida não é reiniciada.
- Atualizados os parâmetros de cache para a versão R3.

## 2026-10-20 — CrossMath: tabuleiros irregulares

- Substituída a matriz totalmente preenchida por uma máscara conectada e assimétrica de nós matemáticos.
- As equações só são criadas entre nós vizinhos presentes no tabuleiro; os cruzamentos continuam compartilhando os mesmos números.
- Os formatos variam por dificuldade e passam a usar dimensões retangulares com ramificações e espaços vazios, aproximando a leitura visual de um jogo de palavras cruzadas.
- A contagem de equações passa a refletir a estrutura gerada em cada partida.
- Adicionado versionamento de cache para os arquivos do CrossMath.
- Validadas localmente 2.000 matrizes geradas, incluindo conectividade, variação de linhas/colunas e consistência aritmética.

# Histórico de alterações

As datas e descrições abaixo registram os principais marcos consolidados neste pacote. O projeto continua em desenvolvimento.

## 2026-10-20 — Pacote completo para publicação

- Consolidação da central e dos sete módulos de jogo disponíveis no catálogo.
- Organização da documentação do projeto em `docs/`.
- Revisão do README para apresentação pública no GitHub, com instruções de execução, publicação e configuração do Firebase.
- Banco compartilhado de palavras validado com 299 entradas únicas.
- Palavras Cruzadas com modalidades **Com dicas** e **Lista de palavras**, selo de versão e atualização de cache.
- Mantidas as melhorias de cronômetro para exibição de horas quando a partida ultrapassa 60 minutos.
- Mantidas as coordenadas alfanuméricas do Campo Minado.
- Documentadas as limitações de validação client-side dos rankings.

## Próximas etapas sugeridas

- Criar testes automatizados para os motores dos jogos.
- Adicionar testes de interface em diferentes navegadores e tamanhos de tela.
- Definir e documentar uma licença caso o projeto seja destinado à reutilização pública.
- Automatizar verificações de integridade antes da publicação.

