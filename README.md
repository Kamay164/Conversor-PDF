# Relatório de Serviços em PDF

Site simples que transforma fotos de obra em um **relatório em PDF**: cabeçalho com logo, título e período, uma foto por vez com título próprio e, no final, a lista de próximos passos.

O site é usado **online**, pelo navegador do computador ou do celular. Mesmo assim, as fotos **não são enviadas para nenhum servidor**: o PDF é montado no próprio aparelho de quem usa.

---

## Como acessar

Abra o **endereço do site** no navegador. Hoje ele está hospedado na **Vercel**. Se um dia passar para um domínio próprio, só o endereço muda: o uso é o mesmo.

- **Computador:** funciona no Google Chrome e no Microsoft Edge. Dica: salve o endereço nos favoritos.
- **Celular:** funciona no Chrome (Android) e no Safari (iPhone). Para abrir com um toque, como um aplicativo, use a opção **Adicionar à tela inicial** do navegador.

Não precisa instalar nada nem criar conta.

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
3. **Layout do PDF**
   - **1 foto** (grande), **2 fotos** (uma abaixo da outra) ou **4 fotos** (grade 2 × 2) por página A4.
   - **Tamanho da foto**: cada foto ganha uma página própria no formato dela (largura de uma folha A4 e a altura que a foto pede). A foto ocupa a página inteira, sem sobra branca; foto em pé gera página em pé e foto deitada, página deitada. O título fica numa faixa branca acima da foto.
   - **Qualidade**: **Normal** (arquivo menor, bom para WhatsApp e e-mail) ou **Alta** (melhor para imprimir, arquivo maior). Dá para trocar a qualquer momento, mesmo depois de enviar as fotos.
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
- **Fotos grandes são reduzidas automaticamente** para o PDF não ficar pesado: até 1600 px no lado maior na qualidade Normal e até 2400 px na Alta. Com 20 fotos, a Normal fica em torno de 5 MB; a Alta pode ficar 2 a 3 vezes maior quando as fotos são de câmera (originais grandes).
- **A qualidade Alta não melhora foto que já chegou comprimida** (por exemplo, foto recebida pelo WhatsApp). Para o melhor resultado, use as fotos originais do celular.
- **Fotos nunca são cortadas nem distorcidas.** Fotos deitadas ocupam a largura e fotos em pé ocupam a altura disponível.
- **Títulos muito longos** quebram em várias linhas. Se passarem de cerca de um terço da altura do espaço da foto, o final é cortado com "...".
- Se o botão **Visualizar PDF** não abrir nada, o navegador pode ter bloqueado o pop-up. Permita pop-ups para a página ou use **Gerar PDF**.

### Celular

No celular, o PDF é baixado pelo próprio navegador e fica na pasta de downloads (Android) ou em **Arquivos** (iPhone). Dá para mandar o relatório pelo WhatsApp ou e-mail direto de lá.

---

## Estrutura das pastas

```
Conversor PDF/
├── index.html          página do site
├── css/style.css       visual da página
├── js/app.js           campos, lista de fotos e botões
├── js/imagens.js       leitura, redução e compressão das fotos
├── js/pdf.js           montagem do PDF
├── vendor/             jsPDF (biblioteca que gera o PDF)
├── demo/               versão de demonstração em arquivo único (marca d'água, até 5 fotos) – só no computador
├── CLAUDE.md           planejamento e regras do projeto
├── README.md           este arquivo
└── .gitignore          deixa referencia/ e demo/ fora do Git (e do site publicado)
```

A pasta `demo/` é uma cópia separada, feita para apresentação a clientes: ela **não é atualizada** quando o site principal muda e **não vai para o GitHub**. A pasta `referencia/` (relatório e fotos de exemplo de um cliente) também fica só no computador.

---

## Publicação (Vercel)

O site é estático: a Vercel só entrega os arquivos `index.html`, `css/`, `js/` e `vendor/`. Não há servidor nem banco de dados.

- Cada `git push` na branch `main` gera uma nova versão do site automaticamente.
- As pastas `referencia/` (relatório e fotos de exemplo de um cliente) e `demo/` **não vão para o GitHub nem para o site**. O `.gitignore` garante isso para arquivos novos.
- Se essas pastas já tinham sido enviadas antes do `.gitignore`, tire-as do repositório (os arquivos continuam no computador):

  ```
  git rm -r --cached --ignore-unmatch referencia demo
  git add .
  git commit -m "chore: remove referencia e demo do repositório"
  git push
  ```
- Para trocar de endereço (domínio próprio), configure o domínio no painel da Vercel. Não é preciso mudar o código.

### Testar no computador sem publicar

Dê duplo clique em `index.html`: o site também funciona direto do disco, sem internet. Mantenha o `index.html` junto das pastas `css`, `js` e `vendor`.

---

## Tecnologias e licença

- HTML, CSS e JavaScript, sem servidor, sem banco de dados e sem instalação.
- [jsPDF](https://github.com/parallax/jsPDF) 4.2.1, licença MIT, incluído em `vendor/`. A licença permite uso comercial; mantenha o aviso de licença que vem dentro do arquivo.
