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
  - **Logo da Tecno por padrão, mas trocável** pelo usuário (com opção de restaurar o padrão).
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
| Hospedagem | **Nenhuma** — uso local | Decisão do usuário |

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
│   └── logo-padrao.js        ← logo padrão da Tecno em base64 (gerado na Etapa 0)
├── vendor/
│   └── jspdf.umd.min.js      ← cópia local do jsPDF (versão fixa)
├── assets/
│   └── logo-tecno.(jpg|png)  ← logo original, só para referência
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

## Status das etapas

| Etapa | Status | Observações |
|---|---|---|
| 0 — Preparação e ativos | ✅ Concluída | Pastas, jsPDF 4.2.1, logo e fotos de teste |
| 1 — Interface | ✅ Concluída | index.html e css/style.css |
| 2 — Lógica e fotos | 🔄 Aguardando verificação | js/app.js e js/imagens.js; testado automaticamente no Chromium |
| 3 — Geração do PDF | ⬜ Pendente | |
| 4 — Uso real e ajustes | ⬜ Pendente | |
| 5 — Revisão e README | ⬜ Pendente | |

Legenda: ⬜ Pendente · 🔄 Em andamento · ✅ Concluída (aprovada pelo usuário)

## Regras técnicas e restrições

- **Precisa funcionar abrindo `index.html` direto do disco (`file://`)**, sem servidor local. Consequências:
  - Usar `<script src="...">` clássicos; **não usar** `type="module"`, `import`/`export` nem `fetch()` de arquivos locais.
  - O logo padrão fica embutido em base64 em `js/logo-padrao.js` (evita bloqueio de canvas com imagens locais).
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

- [ ] Abre com duplo clique em `index.html` no Chrome e no Edge, sem internet.
- [ ] Logo da Tecno aparece por padrão; dá para trocar e restaurar.
- [ ] Título, subtítulo e data/período aparecem na página 1, no estilo do exemplo.
- [ ] Várias fotos, cada uma com título próprio (opcional), na ordem definida pelo usuário.
- [ ] Layouts de 1, 2 e 4 fotos por página funcionando, sem distorcer nem cortar fotos.
- [ ] Página de próximos passos com lista de marcadores, quebrando página quando necessário.
- [ ] Acentuação correta em todo o PDF.
- [ ] PDF de 20 fotos com tamanho razoável (≤ ~5 MB no layout de 1 foto por página).
- [ ] Mensagens claras para formatos de imagem não suportados.
- [ ] README de uso em português.
- [ ] Nenhum erro no console durante o uso normal.

## Decisões registradas

- Organização das fotos: um título por foto (opcional), mais o cabeçalho com logo, título e subtítulo na página 1.
- Identidade: Tecno por padrão, logo trocável.
- Execução: somente local, sem hospedagem.
- Extras incluídos: data/período e escolha de fotos por página. Extras não incluídos: rascunho salvo, página de assinatura.
- Versão do jsPDF: 4.2.1 (publicada em 2026-03-17, vendor/jspdf.umd.min.js)

## Pendências do usuário

- Colocar o PDF de exemplo em `referencia/Relatorio-exemplo.pdf` (antes da Etapa 0).
- Opcional: fornecer o logo da Tecno em melhor resolução (o do PDF é pequeno, ≈253×94 px).
- Opcional: separar 1 ou 2 fotos horizontais e 1 foto HEIC de celular para os testes.

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

Comandos: `/model sonnet`, `/model opus`, `/model haiku`, `/effort medium`. Use `/clear` entre etapas — este arquivo mantém o contexto.
