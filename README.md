# Relatório de Serviços em PDF

Site simples que transforma fotos de obra em um **relatório em PDF**: cabeçalho com logo, título e período, uma foto por vez com título próprio e, no final, a lista de próximos passos.

Tudo acontece no próprio computador. As fotos **não são enviadas para a internet** e o site funciona sem conexão.

---

## Como abrir

1. Abra a pasta do projeto.
2. Dê **duplo clique em `index.html`**.
3. O site abre no navegador padrão. Funciona no **Google Chrome** e no **Microsoft Edge**.

Não precisa instalar nada nem estar conectado à internet.

### Criar um atalho na área de trabalho (Windows)

1. Clique com o botão direito em `index.html`.
2. Escolha **Enviar para** → **Área de trabalho (criar atalho)**. No Windows 11, clique antes em **Mostrar mais opções**.
3. Para abrir o site, use o atalho que aparece na área de trabalho.

> Mantenha o `index.html` dentro da pasta do projeto: ele precisa das pastas `css`, `js` e `vendor` ao lado dele.

---

## Passo a passo

1. **Cabeçalho do relatório**
   - *Logo* (opcional): clique em **Adicionar logo** e escolha a imagem (JPG, PNG ou WebP). Logo em PNG com fundo transparente fica melhor. **Remover logo** tira o logo do relatório.
   - *Título* e *Subtítulo*: aparecem centralizados no topo da primeira página.
   - *Data inicial* e *Data final*: com as duas, o PDF mostra "Período: 22/09/2026 a 26/09/2026". Só com uma, mostra "Data: 22/09/2026". Sem nenhuma, não mostra data.
2. **Fotos**
   - Arraste as fotos para a área tracejada ou clique nela para escolher. Dá para enviar várias de uma vez.
   - Escreva o **título de cada foto** (opcional). Ele aparece em negrito acima da foto.
   - Use **↑** e **↓** para mudar a ordem e **✕** para remover. **Remover todas** limpa a lista.
3. **Layout do PDF**: escolha **1 foto** (grande), **2 fotos** (uma abaixo da outra) ou **4 fotos** (grade 2 × 2) por página.
4. **Próximos passos**
   - *Título da seção* (opcional), por exemplo "PREVISÃO PRÓXIMA SEMANA:".
   - *Itens*: um por linha. No PDF, cada linha vira um item com marcador.
   - Se os itens ficarem em branco, a página de próximos passos não é criada.
5. **Visualizar PDF** abre o relatório numa nova aba para conferir. **Gerar PDF** baixa o arquivo.

O nome do arquivo é criado automaticamente a partir do título e da data inicial, por exemplo `Relatorio - Residencia Julia e Pedro - 2026-09-22.pdf`.

---

## Bom saber

- **Nada fica salvo ao fechar a aba.** Gere o PDF antes de fechar ou recarregar a página.
- **Fotos do iPhone (HEIC) não são aceitas pelo navegador.** O site mostra um aviso. Para resolver:
  - no iPhone, vá em **Ajustes → Câmera → Formatos → Mais Compatível** (as próximas fotos saem em JPG); ou
  - envie as fotos para o computador pelo WhatsApp ou e-mail, que já convertem para JPG.
- **Fotos grandes são reduzidas automaticamente** (lado maior de até 1600 px) para o PDF não ficar pesado. Um relatório com 20 fotos fica em torno de 5 MB.
- **Fotos nunca são cortadas nem distorcidas.** Fotos deitadas ocupam a largura e fotos em pé ocupam a altura disponível.
- **Títulos muito longos** quebram em várias linhas. Se passarem de cerca de um terço da altura do espaço da foto, o final é cortado com "...".
- Se o botão **Visualizar PDF** não abrir nada, o navegador pode ter bloqueado o pop-up. Permita pop-ups para a página ou use **Gerar PDF**.

### Uso no celular

Abrir o `index.html` pelo celular (por exemplo, recebido pelo WhatsApp) **não funciona bem**: o celular abre o arquivo num leitor que não deixa baixar o PDF. Para usar no celular, o site precisa estar hospedado online (Vercel, Netlify ou GitHub Pages hospedam de graça um site como este).

---

## Estrutura das pastas

```
Conversor PDF/
├── index.html          página do site (abra esta)
├── css/style.css       visual da página
├── js/app.js           campos, lista de fotos e botões
├── js/imagens.js       leitura, redução e compressão das fotos
├── js/pdf.js           montagem do PDF
├── vendor/             jsPDF (biblioteca que gera o PDF)
├── demo/               versão de demonstração em arquivo único (marca d'água, até 5 fotos)
├── CLAUDE.md           planejamento e regras do projeto
└── README.md           este arquivo
```

A pasta `demo/` é uma cópia separada, feita para apresentação a clientes. Ela **não é atualizada** quando o site principal muda.

---

## Tecnologias e licença

- HTML, CSS e JavaScript, sem servidor, sem banco de dados e sem instalação.
- [jsPDF](https://github.com/parallax/jsPDF) 4.2.1, licença MIT, incluído em `vendor/`. A licença permite uso comercial; mantenha o aviso de licença que vem dentro do arquivo.
