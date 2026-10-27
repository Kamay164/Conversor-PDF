# Relatório de Obra em PDF – Tecno Construções

Site simples que transforma fotos de obra em um **relatório em PDF** no padrão visual da Tecno: informações gerais, atividades realizadas, registro fotográfico (com título em cada foto), próximos passos e observações.

O site é usado **online**, pelo navegador do computador ou do celular. As fotos **não são enviadas para nenhum servidor**: o PDF é montado no próprio aparelho de quem usa.

---

## Como acessar

Abra o **endereço do site** no navegador. Hoje ele está hospedado na **Cloudflare**, ligado ao repositório do GitHub. Se um dia passar para um domínio próprio, só o endereço muda: o uso é o mesmo.

- **Computador:** funciona no Google Chrome e no Microsoft Edge. Dica: salve o endereço nos favoritos.
- **Celular:** funciona no Chrome (Android) e no Safari (iPhone). Para abrir com um toque, como um aplicativo, use a opção **Adicionar à tela inicial** do navegador.

Não precisa instalar nada nem criar conta.

---

## Passo a passo

O título do relatório é fixo: **RELATÓRIO DE OBRA**. O logo da Tecno também é fixo.

1. **Informações gerais**
   - *Obra*, *Endereço* e *Responsável*: aparecem numa tabela no começo do relatório. Campo em branco não aparece.
   - *Data inicial* e *Data final*: com as duas, o PDF mostra "Período: 22/09/2026 a 26/09/2026". Só com uma, mostra "Data: 22/09/2026". Sem nenhuma, a linha não aparece.
   - Se a *Obra* ficar vazia, o site avisa, mas o PDF é gerado mesmo assim.
2. **Atividades realizadas** (opcional): um item por linha. Cada linha vira um item com marcador.
3. **Fotos**
   - Arraste as fotos para a área tracejada ou clique nela para escolher. Dá para enviar várias de uma vez.
   - Escreva o **título de cada foto** (opcional). Ele aparece acima da foto.
   - Use **↑** e **↓** para mudar a ordem e **✕** para remover. **Remover todas** limpa a lista.
4. **Layout do PDF**
   - **1 foto** (grande), **2 fotos** (uma abaixo da outra) ou **4 fotos** (grade 2 × 2) por página A4.
   - **Tamanho da foto**: cada foto ganha uma página própria no formato dela (largura de uma folha A4 e a altura que a foto pede), sem sobra branca. As informações e atividades vêm numa folha A4 antes das fotos, e os próximos passos e observações numa folha A4 depois.
   - **Qualidade**: **Normal** (arquivo menor, bom para WhatsApp e e-mail) ou **Alta** (melhor para imprimir, arquivo maior). Dá para trocar a qualquer momento.
5. **Próximos passos** (opcional): um item por linha. O *Título da seção* é opcional; em branco, o PDF usa "PRÓXIMOS PASSOS".
6. **Observações** (opcional): texto livre; as quebras de linha são mantidas.

**Visualizar PDF** abre o relatório numa nova aba para conferir. **Gerar PDF** baixa o arquivo, com nome automático a partir da obra e da data inicial, por exemplo `Relatorio - Residencia Julia e Pedro - 2026-09-22.pdf`.

**Seção sem conteúdo não aparece no PDF** e a numeração se ajusta sozinha (o Registro fotográfico sempre aparece).

---

## Bom saber

- **Nada fica salvo ao fechar a aba.** Gere o PDF antes de fechar ou recarregar a página.
- **Fotos do iPhone (HEIC) não são aceitas pelo navegador.** O site mostra um aviso. Para resolver:
  - no iPhone, vá em **Ajustes → Câmera → Formatos → Mais Compatível** (as próximas fotos saem em JPG); ou
  - envie as fotos para o computador pelo WhatsApp ou e-mail, que já convertem para JPG.
- **Fotos grandes são reduzidas automaticamente**: até 1600 px no lado maior na qualidade Normal e até 2400 px na Alta. Com 20 fotos, o PDF fica em torno de 5 MB na Normal e 6 MB na Alta (fotos de câmera originais podem pesar mais).
- **A qualidade Alta não melhora foto que já chegou comprimida** (por exemplo, recebida pelo WhatsApp). Para o melhor resultado, use as fotos originais do celular.
- **Fotos nunca são cortadas nem distorcidas.**
- **Títulos de foto muito longos** quebram em várias linhas; se passarem de cerca de um terço da altura do espaço da foto, o final é cortado com "...".
- **Caracteres fora do alfabeto latino** (emojis, por exemplo) são removidos do PDF; acentos, travessão e aspas curvas funcionam.
- Se o botão **Visualizar PDF** não abrir nada, o navegador pode ter bloqueado o pop-up. Permita pop-ups para a página ou use **Gerar PDF**.

### Celular

No celular, o PDF é baixado pelo próprio navegador e fica na pasta de downloads (Android) ou em **Arquivos** (iPhone). Dá para mandar o relatório pelo WhatsApp ou e-mail direto de lá. Abrir o arquivo `index.html` recebido pelo WhatsApp **não** funciona para baixar o PDF: use o endereço online.

---

## Trocar o logo

O logo fica em **um único lugar**: `js/logo.js` (imagem PNG com fundo transparente, para fundo claro, escrita em texto base64). Para trocar, substitua o conteúdo de `dataUrl` e ajuste `largura` e `altura` (em pixels) para as medidas da nova imagem. O mesmo logo aparece no topo do site e no PDF.

---

## Estrutura das pastas

```
Conversor PDF/
├── index.html            página do site
├── css/style.css         visual da página (identidade Tecno)
├── js/app.js             campos, lista de fotos e botões
├── js/imagens.js         leitura, redução e compressão das fotos
├── js/pdf.js             montagem do PDF (modelo "Relatório de obra")
├── js/logo.js            logo fixo da Tecno (base64)
├── js/pagina-simples.js  logo nas páginas 404 e privacidade
├── js/fontes-pdf.js      fonte Montserrat usada dentro do PDF (base64)
├── vendor/jspdf.umd.min.js   jsPDF (biblioteca que gera o PDF)
├── vendor/fonts/         fonte Montserrat do site + licença
├── icones/               favicon e ícones para "Adicionar à tela inicial"
├── 404.html, privacidade.html, robots.txt, manifest.webmanifest, _headers
│                         páginas e arquivos de apoio do site publicado
├── demo/                 demonstração antiga (só no computador; não atualizada)
├── referencia/           materiais de referência do cliente (só no computador)
├── CLAUDE.md             planejamento e regras do projeto
├── README.md             este arquivo
├── .gitignore            deixa referencia/, demo/ e dist/ fora do Git
└── .assetsignore         (só Worker) arquivos que não ficam públicos
```

A pasta `demo/` é uma cópia separada, feita para apresentação a clientes: ela **não é atualizada** quando o site principal muda e **não vai para o GitHub**. A pasta `referencia/` também fica só no computador.

---

## Publicação (Cloudflare Pages)

O site é estático: a Cloudflare só entrega os arquivos. Não há servidor nem banco de dados. Cada `git push` na branch `main` publica uma nova versão automaticamente.

**Importante: publique só os arquivos do site.** Sem configuração, a Cloudflare entrega *todos* os arquivos do repositório, inclusive `CLAUDE.md`, `README.md` e as pastas de referência. Por isso, no painel da Cloudflare (projeto → **Settings → Build** → *Build configuration*), use:

| Campo | Valor |
|---|---|
| Framework preset | None |
| **Build command** | `mkdir -p dist && cp -r index.html 404.html privacidade.html robots.txt manifest.webmanifest _headers _redirects css js vendor icones dist/` |
| **Build output directory** | `dist` |
| Root directory | (vazio) |

Esse comando copia para a pasta `dist` apenas o que faz parte do site; o resto não fica público. Depois de salvar, faça um novo deploy (**Deployments → Retry deployment**, ou um novo `git push`) e confira: `endereco-do-site/CLAUDE.md` e `endereco-do-site/README.md` devem mostrar "Página não encontrada". **Se criar um arquivo ou pasta nova que faça parte do site, inclua o nome dela nesse comando.**

**Plano B (sem mexer no painel):** o arquivo `_redirects` da raiz faz `CLAUDE.md`, `README.md`, `referencia/` e `demo/` mostrarem a página "Página não encontrada" mesmo que o repositório inteiro seja publicado. Só depende de subir os arquivos para o GitHub. A configuração acima continua sendo o ideal, porque assim os arquivos nem chegam a ser publicados.

Se o projeto estiver publicado como *Worker* (e não como Pages), o arquivo `.assetsignore` da raiz já esconde esses arquivos.

- O arquivo `_headers` aplica cabeçalhos de segurança (bloqueia scripts de fora, uso em iframe e envio de referência), e `robots.txt` com `noindex` mantém o site fora do Google.
- As pastas `referencia/` e `demo/` **não vão para o GitHub nem para o site**. O `.gitignore` garante isso para arquivos novos.
- Se essas pastas já tinham sido enviadas antes do `.gitignore`, tire-as do repositório (os arquivos continuam no computador):

  ```
  git rm -r --cached --ignore-unmatch referencia demo
  git add .
  git commit -m "chore: remove referencia e demo do repositório"
  git push
  ```
- Para ter um endereço próprio (ex.: `relatorio.tecnoconstrucoes.com.br`), use **Custom domains** no painel da Cloudflare. Não é preciso mudar o código.
- Mantenha o **Web Analytics** da Cloudflare desligado: a página de privacidade afirma que o site não usa rastreamento.

### Testar no computador sem publicar

Dê duplo clique em `index.html`: o site também funciona direto do disco, sem internet. Mantenha o `index.html` junto das pastas `css`, `js` e `vendor`.

---

## Tecnologias e licenças

- HTML, CSS e JavaScript, sem servidor, sem banco de dados e sem instalação.
- [jsPDF](https://github.com/parallax/jsPDF) 4.2.1, licença MIT, em `vendor/`. A licença permite uso comercial; mantenha o aviso que vem dentro do arquivo.
- [Montserrat](https://github.com/JulietaUla/Montserrat), licença SIL Open Font License 1.1, em `vendor/fonts/` (com o texto da licença). Pode ser usada e embutida em PDFs, inclusive em projetos comerciais.
