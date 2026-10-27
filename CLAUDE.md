# CLAUDE.md — Conversor de Fotos para Relatório em PDF

> Leia este arquivo inteiro antes de qualquer ação. Ele é a fonte de verdade do projeto.

---

## ⛔ REGRA PRINCIPAL: UMA ETAPA POR VEZ

- O projeto é dividido em etapas numeradas (seção "Etapas do projeto").
- **Execute somente a etapa que o usuário pedir explicitamente** (ex.: "execute a Etapa 2").
- **Nunca avance para a próxima etapa sem autorização explícita do usuário**, mesmo que a etapa atual termine rápido ou que a próxima pareça óbvia.
- Não adiante trabalho de etapas futuras "para aproveitar" (nem arquivos, nem funções, nem esqueletos).
- Ao terminar uma etapa:
  1. Atualize a seção "Status das etapas" deste arquivo.
  2. Entregue um resumo curto: o que foi feito, arquivos criados/alterados, como o usuário verifica (checklist da etapa) e qualquer pendência ou decisão tomada.
  3. Se a pasta for um repositório git, sugira os comandos git do fim da etapa (o usuário executa; não faça commit/push por conta própria).
  4. **Pare e aguarde.** Pergunte se pode seguir para a próxima etapa.
- Se, durante uma etapa, surgir uma dúvida que mude o resultado, pergunte antes de decidir. Não invente requisitos.

---

### Regra adicional (fase 2 — identidade visual)
- **Antes de qualquer alteração, peça permissão ao usuário** e informe o modelo e o nível de esforço recomendados para a etapa.
- Trabalhe nas etapas 6 a 11 abaixo, uma por vez, sempre com autorização explícita.

---

## Objetivo

Site **muito simples, que roda localmente** (abrindo o `index.html` com duplo clique), onde o usuário:

1. Preenche o cabeçalho do relatório (logo, título, subtítulo, data/período).
2. Sobe várias fotos e dá **um título para cada foto**.
3. Escolhe quantas fotos por página (1, 2 ou 4).
4. Escreve os **próximos passos** (lista para o próximo relatório).
5. Gera um **PDF em formato de relatório**, baixado no computador.

Tudo acontece no navegador. Nenhuma foto sai do computador.

## Contexto

- Usuário: Vinicius. Uso: relatórios semanais de serviços executados em obras da **Tecno Construções**.
- Modelo de referência: `referencia/Relatorio-exemplo.pdf` (relatório "Pedro e Júlia", 22 páginas, A4). Estrutura do exemplo:
  - **Página 1:** logo da Tecno centralizado no topo; título em negrito, maiúsculas, centralizado ("RELATÓRIO DE SERVIÇOS EXECUTADOS – RESIDÊNCIA JULIA E PEDRO"); subtítulo logo abaixo ("REVESTIMENTO PISCINA EM TRAVERTINO"); primeira foto abaixo do cabeçalho.
  - **Páginas de fotos:** uma foto por página, grande e centralizada; título da foto acima, em negrito, maiúsculas, centralizado (fonte serifada, tipo Times).
  - **Página final:** "PREVISÃO PRÓXIMA SEMANA:" (negrito, centralizado) seguido de lista com marcadores.
- Diferenças em relação ao exemplo (decididas pelo usuário):
  - **Cada foto tem o seu próprio título** (no exemplo, um título valia para várias fotos). O título da foto pode ficar vazio.
  - **Data ou período** do relatório no cabeçalho da página 1.
  - **Escolha de fotos por página:** 1, 2 ou 4.
  - **Logo opcional, sem logo padrão** (mudança da Etapa 4): o usuário adiciona, troca ou remove o logo; sem logo, o PDF começa pelo título.
  - **Não** incluir a página de assinatura "TECNO OBRAS CIVIS" do exemplo.
  - **Não** salvar rascunho (o estado vive só na memória da aba).

## Tecnologias

Somente ferramentas **gratuitas**, sem servidor e sem etapa de build:

| Item | Escolha | Motivo |
|---|---|---|
| Interface | HTML + CSS + JavaScript puro | Simples, abre com duplo clique, sem instalar nada |
| Geração do PDF | **jsPDF** (licença MIT), cópia local em `vendor/` | Gera PDF no navegador com texto e imagens; funciona offline |
| Tratamento de fotos | Canvas do navegador | Redimensionar e comprimir sem bibliotecas extras |
| Navegadores-alvo | Google Chrome e Microsoft Edge (Windows) | Navegadores do usuário |
| Hospedagem | **Vercel** (site estático, via GitHub); talvez domínio próprio no futuro | Decisão do usuário (antes: só local) |

## Estrutura de pastas

```
Conversor PDF/
├── CLAUDE.md                 ← este arquivo
├── README.md                 ← instruções de uso (Etapa 5)
├── index.html                ← página única do site
├── css/
│   └── style.css
├── js/
│   ├── app.js                ← estado da aplicação e eventos da interface
│   ├── imagens.js            ← leitura, redimensionamento e compressão das fotos
│   ├── pdf.js                ← montagem do PDF com jsPDF
│   └── logo-padrao.js        ← SEM USO desde a Etapa 4 (logo padrão removido); apagar só com autorização
├── vendor/
│   └── jspdf.umd.min.js      ← cópia local do jsPDF (versão fixa)
├── assets/
│   └── logo-tecno.(jpg|png)  ← SEM USO desde a Etapa 4; apagar só com autorização
└── referencia/
    ├── Relatorio-exemplo.pdf ← PDF de exemplo (fornecido pelo usuário; não alterar)
    └── fotos-teste/          ← fotos para testes (Etapa 0)
```

Não criar arquivos fora desta estrutura sem perguntar.

## Etapas do projeto

Cada etapa termina com o checklist de verificação aprovado pelo usuário.

### Etapa 0 — Preparação e ativos
- Criar a estrutura de pastas acima (sem conteúdo das etapas seguintes).
- Confirmar que `referencia/Relatorio-exemplo.pdf` existe; se não existir, pedir ao usuário que o coloque lá.
- Baixar a versão estável mais recente do jsPDF (build UMD minificado) para `vendor/` e registrar a versão na seção "Decisões registradas".
- Extrair o logo da Tecno do PDF de exemplo para `assets/` e gerar `js/logo-padrao.js` com o logo em base64 (ex.: `window.LOGO_PADRAO = "data:image/jpeg;base64,..."`). Usar ferramenta gratuita disponível no computador (ex.: Python + PyMuPDF/pypdf). Se não for possível, pedir o arquivo ao usuário. Avisar que o logo do PDF tem baixa resolução (≈253×94 px).
- Extrair as fotos do PDF de exemplo para `referencia/fotos-teste/` (servem de massa de teste realista).
- Criar um `index.html` provisório mínimo que só carrega `vendor/jspdf.umd.min.js` e `js/logo-padrao.js` e mostra na tela se ambos carregaram.
- **Verificação:** pastas criadas; abrir `index.html` com duplo clique mostra "jsPDF carregado" e o logo; `referencia/fotos-teste/` contém as fotos.

### Etapa 1 — Interface (HTML + CSS, sem lógica)
- Página única em português (pt-BR), visual limpo e simples, responsiva.
- Seções da página:
  1. **Cabeçalho do relatório:** prévia do logo + botões "Trocar logo" e "Restaurar logo padrão"; campos Título e Subtítulo; Data inicial e Data final (a final é opcional).
  2. **Fotos:** área para arrastar/soltar ou selecionar várias fotos; lista de fotos com miniatura, campo "Título da foto", botões ↑ ↓ e Remover (pode usar itens fictícios só para visualizar o layout).
  3. **Layout do PDF:** opção 1, 2 ou 4 fotos por página (padrão: 1).
  4. **Próximos passos:** campo com o título da seção (padrão "PREVISÃO PRÓXIMA SEMANA:") e caixa de texto com um item por linha.
  5. **Ações:** botões "Visualizar PDF" e "Gerar PDF".
- Sem JavaScript funcional nesta etapa.
- **Verificação:** abrir com duplo clique no Chrome e no Edge; todas as seções aparecem; layout aceitável em janela estreita; nenhum erro no console (F12).

### Etapa 2 — Lógica da interface e tratamento das fotos
- Estado em um único objeto em memória (cabeçalho, logo, lista de fotos, layout, próximos passos).
- Upload múltiplo por seleção e por arrastar-e-soltar. Aceitar JPG, PNG e WebP. Para HEIC ou outro formato não suportado: mensagem clara em português explicando o motivo.
- Redimensionar cada foto (lado maior ≈1600 px) e comprimir em JPEG (qualidade ≈0,8) via canvas, mantendo a orientação correta (fotos de celular em pé devem continuar em pé).
- Miniaturas, título por foto, reordenar (↑ ↓), remover e "remover todas".
- Trocar logo por imagem enviada pelo usuário; restaurar logo padrão.
- Validação antes de gerar: pelo menos 1 foto; avisar (sem bloquear) se o título do relatório estiver vazio.
- **Verificação:** carregar as fotos de `referencia/fotos-teste/`; reordenar e remover funcionam; foto vertical de celular aparece em pé; arquivo HEIC (ou .txt) gera aviso; 30 fotos carregam sem travar a página; nenhum erro no console.

### Etapa 3 — Geração do PDF
- A4 retrato, margens consistentes, fonte Times (negrito para títulos), como no exemplo.
- **Página 1:** logo centralizado; título; subtítulo; data/período (ex.: "Período: 22/09/2026 a 26/09/2026" ou "Data: 25/09/2026"); as fotos começam abaixo do cabeçalho, seguindo o layout escolhido.
- **Fotos:** título da foto acima dela, centralizado, negrito; layout de 1 (foto grande), 2 (empilhadas) ou 4 (grade 2×2) por página; manter a proporção, centralizar na área disponível, **nunca distorcer nem cortar**; título vazio = sem título.
- **Próximos passos:** em página nova após as fotos; título centralizado em negrito; lista com marcadores; quebra automática de linha e de página. Se a lista estiver vazia, a página é omitida.
- Textos impressos exatamente como digitados (sem forçar maiúsculas).
- Nome do arquivo automático com título e data (ex.: `Relatorio - Residencia Julia e Pedro - 2026-09-25.pdf`), sem caracteres inválidos no Windows.
- "Visualizar PDF" abre em nova aba; "Gerar PDF" baixa o arquivo.
- **Verificação:** gerar com as fotos de teste nos 3 layouts e comparar lado a lado com o exemplo; acentos corretos (Ç, Ã, Õ, É, –); foto horizontal ocupa bem o espaço; título longo quebra linha sem invadir a foto; lista com 30 itens quebra página corretamente; PDF com 20 fotos no layout 1 não maior que o exemplo (~5 MB); abre no Chrome, no Edge e em um leitor de PDF.

### Etapa 4 — Teste com uso real e ajustes
- O usuário monta um relatório real e lista os problemas encontrados.
- Corrigir somente os itens listados; não adicionar funcionalidades novas sem pedido.
- **Verificação:** cada item da lista do usuário resolvido e conferido por ele.

### Etapa 5 — Revisão final e README
- Revisão do código: código morto, nomes consistentes, comentários em português, aderência às regras deste arquivo.
- `README.md` em português: como abrir, como criar atalho na área de trabalho, passo a passo de uso, limitações (ex.: HEIC).
- **Verificação:** o usuário segue o README do zero e consegue gerar um relatório; "Critérios de conclusão" todos atendidos.

## Fase 2 — Identidade visual da Tecno (etapas 6 a 11)

Referências enviadas pelo usuário (26/10/2026): kit de identidade visual da Tecno Construções (papel timbrado, capa escura de relatório, relatório de obra, cartões, assinatura de e-mail) e o logo em PNG com fundo preto.

### Decisões da fase 2
- **Relatório PDF:** seguir **exatamente** o 3º template ("Relatório de obra"): cabeçalho com logo à esquerda, linha laranja vertical e "RELATÓRIO DE OBRA" à direita; seções numeradas em laranja; tabela de informações gerais; listas com marcador laranja; rodapé com faixa grafite "CONSTRUINDO O AMANHÃ" + linha laranja.
- **Site:** versão **clara** inspirada no 2º template (capa escura), sem preto: topo com degradê suave (branco → cinza quente), logo à esquerda, "RELATÓRIO DE OBRA" com barra laranja vertical, "C" laranja em contorno decorativo, cartões brancos e rodapé grafite "CONSTRUINDO O AMANHÃ".
- **Paleta:** Laranja Tecno `#FF6A00` (números, linhas, marcadores, botão principal); Grafite `#1F1F1F` (textos, faixa do rodapé — no lugar do preto); Cinza quente `#F3F2F0` (fundo do site); Branco `#FFFFFF` (cartões e páginas do PDF); apoio `#6B6B6B` (texto secundário) e `#E4E2DE` (linhas). Laranja não é usado em texto pequeno corrido (contraste).
- **Fonte:** Montserrat (Google Fonts, licença OFL), embutida localmente no site e no PDF (funciona offline). Custo: ≈ +0,5 MB por PDF.
- **Logo:** fixo (sai a opção de enviar logo). Usar `assets/logo-tecno-fundo-claro.png` (gerado por edição automática do PNG com fundo preto; versão `assets/logo-tecno-fundo-escuro.png` para fundos escuros).
  - ⚠️ **Provisório:** o usuário não gostou totalmente dessa versão; **no final ele vai enviar o logo oficial (PDF/vetor)** para substituir. Deixar a troca simples (um único arquivo/constante).
- **Formulário (campos do template):** título fixo "RELATÓRIO DE OBRA" (sai o campo Subtítulo e o campo Título livre); novos campos **Obra, Endereço, Responsável**; Período (datas já existentes); **Atividades realizadas** (lista, um item por linha); Próximos passos (já existe); **Observações** (texto livre). Fotos, os 4 layouts e as 2 qualidades continuam.
- **Ordem das seções no PDF:** 1. Informações gerais (tabela Obra / Endereço / Período / Responsável) · 2. Atividades realizadas · 3. Registro fotográfico · 4. Próximos passos · 5. Observações. Seção vazia é omitida e a numeração se ajusta.

### Etapa 6 — Plano da fase 2
- Registrar neste arquivo as decisões acima. **Verificação:** usuário confere o plano.

### Etapa 7 — Logo fixo
- Remover "Adicionar/Trocar/Remover logo" do formulário; logo fixo da Tecno no site e no PDF, a partir de um único ponto do código (troca fácil pelo logo oficial).
- Embutir o logo para funcionar também via `file://` (ex.: base64 em `js/logo.js`). Apagar `js/logo-padrao.js` e `assets/logo-tecno.jpg` antigos só com autorização.
- **Verificação:** logo aparece no site e no PDF; não há mais botões de logo.

### Etapa 8 — Visual do site
- Aplicar paleta, Montserrat (arquivos locais em `vendor/fonts/`), topo claro com degradê, logo à esquerda, "RELATÓRIO DE OBRA" com barra laranja, "C" decorativo, cartões brancos, rodapé grafite. Responsivo (celular).
- **Verificação:** Chrome/Edge e celular; sem rolagem horizontal; sem erros no console.

### Etapa 9 — Campos novos do formulário
- Obra, Endereço, Responsável, Atividades realizadas, Observações; remover Título/Subtítulo; ajustar estado e validação (aviso se Obra vazia, sem bloquear). Nome do arquivo passa a usar a Obra.
- **Verificação:** campos aparecem e chegam ao estado.

### Etapa 10 — Novo layout do PDF
- Implementar o 3º template em todas as páginas (cabeçalho e rodapé), com Montserrat embutida no jsPDF, seções numeradas, tabela e listas; manter os 4 layouts de foto (incluindo "Tamanho da foto") e as 2 qualidades.
- **Verificação:** comparar com o template; acentos; quebras de página; tamanho do arquivo.

### Etapa 11 — Testes e documentação
- Testes completos, README e este arquivo atualizados; perguntar se a `demo/` deve ser refeita no visual novo.

## Status das etapas

| Etapa | Status | Observações |
|---|---|---|
| 0 — Preparação e ativos | ✅ Concluída | Pastas, jsPDF 4.2.1, logo e fotos de teste |
| 1 — Interface | ✅ Concluída | index.html e css/style.css |
| 2 — Lógica e fotos | ✅ Concluída | js/app.js e js/imagens.js |
| 3 — Geração do PDF | ✅ Concluída | js/pdf.js; 3 layouts, lista longa e casos difíceis |
| 4 — Uso real e ajustes | ✅ Concluída | Logo opcional sem padrão; "Grande" no layout de 1 foto; próximos passos em branco; título da seção só como sugestão |
| 5 — Revisão e README | ✅ Concluída | Revisão do código, README.md (uso online), .gitignore com referencia/ e demo/. Extras: qualidade Normal/Alta e layout "Tamanho da foto" |
| 6 — Plano da fase 2 | 🔄 Aguardando verificação | Decisões de identidade visual registradas |
| 7 — Logo fixo | 🔄 Aguardando verificação | Logo embutido em `js/logo.js` (provisório); upload removido; arquivos antigos ainda não apagados |
| 8 — Visual do site | 🔄 Aguardando verificação | Montserrat local em `vendor/fonts/` (OFL), paleta Tecno, topo em degradê com logo + "RELATÓRIO DE OBRA" + C decorativo, rodapé grafite. Logo-padrao.js e logo-tecno.jpg: apagar à mão |
| 9 — Campos novos | ⬜ Pendente | |
| 10 — Novo layout do PDF | ⬜ Pendente | |
| 11 — Testes e documentação | ⬜ Pendente | |

Legenda: ⬜ Pendente · 🔄 Em andamento · ✅ Concluída (aprovada pelo usuário)

## Regras técnicas e restrições

- **Precisa funcionar abrindo `index.html` direto do disco (`file://`)**, sem servidor local. Consequências:
  - Usar `<script src="...">` clássicos; **não usar** `type="module"`, `import`/`export` nem `fetch()` de arquivos locais.
  - O logo enviado pelo usuário é lido do arquivo escolhido (sem `fetch`), então funciona via `file://`.
- **Sem CDN em tempo de execução:** todas as bibliotecas ficam em `vendor/`. O site deve funcionar offline.
- **Sem backend, sem banco de dados, sem login, sem frameworks** (React, Vue, Tailwind etc.) e sem etapa de build.
- Única dependência externa permitida: jsPDF. Qualquer outra biblioteca exige autorização do usuário.
- Somente ferramentas e bibliotecas gratuitas.
- Nada de rastreamento, analytics ou envio de dados para fora do computador.
- Não alterar nada em `referencia/` (exceto criar `fotos-teste/` na Etapa 0).
- Não apagar arquivos sem perguntar.

## Padrões de trabalho

- Interface, mensagens e comentários do código em **português (pt-BR)**.
- Código simples e legível, priorizando clareza a "esperteza". Funções pequenas, com nomes descritivos em português ou inglês, mas consistentes no projeto inteiro.
- Separação de responsabilidades: `app.js` (interface/estado), `imagens.js` (fotos), `pdf.js` (PDF).
- Mensagens de erro amigáveis para o usuário, nunca só no console.
- Antes de dar uma etapa como pronta, testar o que for possível testar e dizer claramente o que precisa ser verificado manualmente pelo usuário no navegador.
- Mudanças pequenas e focadas no escopo da etapa atual.
- Não adicionar funcionalidades que não estejam descritas aqui; sugestões podem ser feitas no resumo final da etapa, sem implementar.

## Critérios de conclusão do projeto

Conferidos em testes automáticos no Chromium (Etapa 5). Falta só a conferência do usuário no site publicado.

- [x] Funciona online (Vercel) e também com duplo clique em `index.html`, sem internet.
- [x] Logo opcional: começa sem logo; dá para adicionar, trocar e remover.
- [x] Título, subtítulo e data/período aparecem na página 1, no estilo do exemplo.
- [x] Várias fotos, cada uma com título próprio (opcional), na ordem definida pelo usuário.
- [x] Layouts de 1, 2 e 4 fotos por página e "Tamanho da foto", sem distorcer nem cortar fotos.
- [x] Qualidade Normal e Alta, com troca a qualquer momento.
- [x] Página de próximos passos com lista de marcadores, quebrando página quando necessário.
- [x] Acentuação correta em todo o PDF.
- [x] PDF de 20 fotos com tamanho razoável (≈ 4,7 MB no layout de 1 foto por página, qualidade Normal).
- [x] Mensagens claras para formatos de imagem não suportados.
- [x] README de uso em português.
- [x] Nenhum erro no console durante o uso normal.

## Decisões registradas

- Organização das fotos: um título por foto (opcional), mais o cabeçalho com logo, título e subtítulo na página 1.
- Identidade: logo opcional, sem logo padrão (decidido na Etapa 4; antes era o logo da Tecno por padrão).
- Execução: online, hospedado na Vercel (o site continua funcionando também via `file://` para testes). `referencia/` nunca vai para o GitHub nem para o site.
- Extras incluídos: data/período e escolha de fotos por página. Extras não incluídos: rascunho salvo, página de assinatura.
- Layout do PDF (Etapa 3): margens de 20 mm (topo/base) e 25 mm (laterais); logo até 70×28 mm; Times 13 pt (título) e 12 pt (demais); foto de 1 por página ≈ 15×20 cm, como no exemplo; título da foto limitado a 35% da altura da célula (cortado com "...").
- Qualidade das fotos (pedido após a Etapa 5): cada foto é preparada no envio em duas versões, Normal (1600 px, JPEG 80%) e Alta (2400 px, JPEG 90%); o usuário escolhe no layout e pode trocar a qualquer momento.
- Layout "Tamanho da foto" (pedido após a Etapa 5): uma página por foto, largura 210 mm e altura pela proporção da foto, foto de ponta a ponta; título numa faixa branca acima; cabeçalho na 1ª página; próximos passos em A4.
- Versão do jsPDF: 4.2.1 (publicada em 2026-03-17, vendor/jspdf.umd.min.js)

## Pendências do usuário

- **Enviar o logo oficial (PDF/vetor) no final da fase 2** para substituir o logo provisório.

- Decidir se `js/logo-padrao.js` e `assets/logo-tecno.jpg` (sem uso desde a Etapa 4) podem ser apagados.
- Tirar `referencia/` e `demo/` do repositório no GitHub (`git rm -r --cached --ignore-unmatch referencia demo`, commit e push) e, se quiser, limpar o histórico.

## Modelo recomendado por etapa (referência para o usuário)

| Etapa | Modelo | Esforço |
|---|---|---|
| Planejamento | Opus 5.5 | medium |
| 0 — Preparação | Haiku 5.5 | low |
| 1 — Interface | Sonnet 5.5 | medium |
| 2 — Lógica e fotos | Sonnet 5.5 | medium |
| 3 — Geração do PDF | Opus 5.5 | medium (high se travar) |
| 4 — Ajustes | Sonnet 5.5 | medium |
| 5 — Revisão | Opus 5.5 (revisão) / Haiku 5.5 (README) | medium / low |
| 6 — Plano da fase 2 | Sonnet 5.5 | low |
| 7 — Logo fixo | Sonnet 5.5 | medium |
| 8 — Visual do site | Sonnet 5.5 | medium (Opus se complicar) |
| 9 — Campos novos | Sonnet 5.5 | medium |
| 10 — Novo layout do PDF | Opus 5.5 | medium (high se travar) |
| 11 — Testes e documentação | Sonnet 5.5 | low |

Comandos: `/model sonnet`, `/model opus`, `/model haiku`, `/effort medium`. Use `/clear` entre etapas — este arquivo mantém o contexto.
