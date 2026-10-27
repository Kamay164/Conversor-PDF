/* Conversor de Fotos para Relatório em PDF – montagem do PDF
 *
 * Recebe o estado do relatório (window.Relatorio.estado) e monta um PDF A4
 * com jsPDF, no modelo "Relatório de obra" da identidade visual da Tecno:
 *   - topo de cada página: logo à esquerda; linha laranja + "RELATÓRIO DE OBRA" à direita;
 *   - seções numeradas em laranja: Informações gerais (tabela), Atividades realizadas,
 *     Registro fotográfico, Próximos passos e Observações. Seção vazia não aparece
 *     e a numeração se ajusta;
 *   - fotos com título acima, 1, 2 ou 4 por página (A4) ou uma página do tamanho de
 *     cada foto, sempre sem distorcer nem cortar;
 *   - rodapé grafite com o número da página, linha laranja e "CONSTRUINDO O AMANHÃ".
 * Fonte Montserrat embutida (js/fontes-pdf.js); se ela não carregar, usa Helvetica.
 * Exposto em window.GeradorPDF. Todas as medidas estão em milímetros.
 */
(function () {
  'use strict';

  // ---------- Medidas e cores ----------

  var PAGINA = { largura: 210, altura: 297 };
  var MARGEM = 20;                                   // margem esquerda e direita
  var DIREITA = PAGINA.largura - MARGEM;             // 190 mm
  var X_NUMERO = MARGEM;                             // número da seção
  var X_CONTEUDO = 28;                               // títulos e conteúdo das seções
  var LARGURA_CONTEUDO = DIREITA - X_CONTEUDO;       // 162 mm
  var AREA = { topo: 44, base: 278 };                // área útil de uma página A4

  var TOPO = { yLogo: 12, larguraLogo: 40, alturaFaixa: 40 };
  var RODAPE = { altura: 10 };

  var COR = {
    grafite: [31, 31, 31],
    laranja: [255, 106, 0],
    cinza: [107, 107, 107],
    borda: [228, 226, 222],
    fundo: [243, 242, 240],
    branco: [255, 255, 255],
    rodapeTexto: [200, 198, 192]
  };

  var MM_POR_PONTO = 25.4 / 72;

  // fonte: 'normal' | 'semi' | 'negrito'; espaco = espaçamento entre letras (mm); linha = fator da altura da linha
  var ESTILO = {
    tituloTopo:   { fonte: 'semi',    tamanho: 7.5, cor: COR.grafite, espaco: 0.9 },
    numeroSecao:  { fonte: 'negrito', tamanho: 10,  cor: COR.laranja },
    tituloSecao:  { fonte: 'negrito', tamanho: 10,  cor: COR.grafite, espaco: 0.35 },
    tabela:       { fonte: 'normal',  tamanho: 8.5, cor: COR.grafite, linha: 1.35 },
    texto:        { fonte: 'normal',  tamanho: 9,   cor: COR.grafite, linha: 1.45 },
    tituloFoto:   { fonte: 'semi',    tamanho: 8.5, cor: COR.grafite, linha: 1.3 },
    tituloFaixa:  { fonte: 'semi',    tamanho: 10,  cor: COR.grafite, linha: 1.3 },
    assinatura:   { fonte: 'semi',    tamanho: 8.5, cor: COR.grafite },
    rodape:       { fonte: 'semi',    tamanho: 6.5, cor: COR.branco, espaco: 0.9 },
    pagina:       { fonte: 'normal',  tamanho: 6.5, cor: COR.rodapeTexto, espaco: 0.4 }
  };

  var ESPACO = {
    antesSecao: 9,          // entre uma seção e a próxima
    tituloFoto: 2,          // entre o título da foto e a foto
    entreFotos: 6,          // entre células da grade de fotos
    entreItens: 1.2,        // entre itens de lista
    celula: { v: 2.4, h: 3 }
  };

  var TITULO_FIXO = 'RELATÓRIO DE OBRA';
  var LEMA = 'CONSTRUINDO O AMANHÃ';
  var ASSINATURA = 'TECNO Construções';
  var LARGURA_ROTULO = 38;              // coluna cinza da tabela de informações gerais
  var ALTURA_MIN_FOTOS = 100;           // se sobrar menos que isso, as fotos começam na página seguinte
  var PROPORCAO_MAX_TITULO = 0.3;       // o título da foto ocupa no máximo 30% da altura da célula
  var RAIO_MARCADOR = 0.6;

  // ---------- Fontes ----------

  var FONTES = {
    montserrat: { normal: ['Montserrat', 'normal'], semi: ['MontserratSemi', 'normal'], negrito: ['Montserrat', 'bold'] },
    padrao:     { normal: ['helvetica', 'normal'],  semi: ['helvetica', 'bold'],        negrito: ['helvetica', 'bold'] }
  };
  var fontesAtuais = FONTES.padrao;

  /** Registra a Montserrat no documento (cada documento jsPDF tem os próprios arquivos). */
  function registrarFontes(doc) {
    var f = window.FONTES_PDF;
    if (!f || !f.normal || !f.seminegrito || !f.negrito) {
      fontesAtuais = FONTES.padrao;
      return;
    }
    doc.addFileToVFS('Montserrat-Regular.ttf', f.normal);
    doc.addFont('Montserrat-Regular.ttf', 'Montserrat', 'normal');
    doc.addFileToVFS('Montserrat-SemiBold.ttf', f.seminegrito);
    doc.addFont('Montserrat-SemiBold.ttf', 'MontserratSemi', 'normal');
    doc.addFileToVFS('Montserrat-Bold.ttf', f.negrito);
    doc.addFont('Montserrat-Bold.ttf', 'Montserrat', 'bold');
    fontesAtuais = FONTES.montserrat;
  }

  // ---------- Texto ----------

  // Caracteres extras da codificação WinAnsi (além do Latin-1): – — “ ” ‘ ’ • … € ™ etc.
  var EXTRAS_WINANSI = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ' +
    '‘’“”•–—˜™š›œžŸ';

  /**
   * A fonte embutida cobre os acentos do português, o travessão "–", aspas
   * curvas e "•". Só o que fica fora disso (emojis, símbolos de outros idiomas)
   * é trocado ou removido, para não aparecer lixo no PDF. O resto é impresso
   * exatamente como digitado.
   */
  function textoSeguro(texto) {
    return String(texto || '')
      .replace(/\t/g, ' ')
      .replace(/[′]/g, "'")
      .replace(/[″]/g, '"')
      .replace(/[−‐‑]/g, '-')
      .replace(/[   ]/g, ' ')
      .split('')
      .filter(function (ch) {
        var c = ch.charCodeAt(0);
        return c === 10 || c === 13 ||
          (c >= 0x20 && c <= 0x7E) || (c >= 0xA0 && c <= 0xFF) ||
          EXTRAS_WINANSI.indexOf(ch) !== -1;
      })
      .join('');
  }

  function alturaLetra(estilo) {
    return estilo.tamanho * MM_POR_PONTO;
  }

  function alturaLinha(estilo) {
    return alturaLetra(estilo) * (estilo.linha || 1.25);
  }

  function aplicarEstilo(doc, estilo) {
    var f = fontesAtuais[estilo.fonte];
    doc.setFont(f[0], f[1]);
    doc.setFontSize(estilo.tamanho);
    doc.setTextColor(estilo.cor[0], estilo.cor[1], estilo.cor[2]);
  }

  function larguraDoTexto(doc, texto, estilo) {
    aplicarEstilo(doc, estilo);
    return doc.getTextWidth(texto) + (estilo.espaco || 0) * Math.max(0, texto.length - 1);
  }

  /** Escreve uma linha com o topo em y. alinhamento: 'left' (padrão), 'center' ou 'right'. */
  function escrever(doc, texto, x, y, estilo, alinhamento) {
    var x0 = x;
    if (alinhamento === 'center' || alinhamento === 'right') {
      var w = larguraDoTexto(doc, texto, estilo);
      x0 = alinhamento === 'center' ? x - w / 2 : x - w;
    }
    aplicarEstilo(doc, estilo);
    doc.text(texto, x0, y, { baseline: 'top', charSpace: estilo.espaco || 0 });
  }

  /** Quebra o texto em linhas que cabem na largura indicada. */
  function quebrarLinhas(doc, texto, estilo, largura) {
    var limpo = textoSeguro(texto).trim();
    if (!limpo) { return []; }
    aplicarEstilo(doc, estilo);
    return doc.splitTextToSize(limpo, largura);
  }

  function itensDaLista(texto) {
    return String(texto || '')
      .split(/\r?\n/)
      .map(function (linha) { return linha.replace(/^\s*[-•*]\s+/, '').trim(); })
      .filter(function (linha) { return linha.length > 0; });
  }

  function corDeTraco(doc, cor) { doc.setDrawColor(cor[0], cor[1], cor[2]); }
  function corDePreenchimento(doc, cor) { doc.setFillColor(cor[0], cor[1], cor[2]); }

  // ---------- Datas ----------

  /** '2026-09-22' -> '22/09/2026' (sem usar Date, para não sofrer com fuso horário). */
  function formatarData(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? m[3] + '/' + m[2] + '/' + m[1] : '';
  }

  /** Devolve [rótulo, valor] do período, ou null se não houver data. */
  function linhaPeriodo(dataInicial, dataFinal) {
    var ini = formatarData(dataInicial);
    var fim = formatarData(dataFinal);
    if (ini && fim && ini !== fim) { return ['Período:', ini + ' a ' + fim]; }
    if (ini || fim) { return ['Data:', ini || fim]; }
    return null;
  }

  // ---------- Imagens ----------

  function formatoDaImagem(dataUrl) {
    return /^data:image\/png/i.test(dataUrl) ? 'PNG' : 'JPEG';
  }

  /** Versão da foto conforme a qualidade escolhida ("normal" ou "alta"). */
  function imagemDaFoto(foto, qualidade) {
    return (qualidade === 'alta' && foto.dataUrlAlta) ? foto.dataUrlAlta : foto.dataUrl;
  }

  // ---------- Topo e rodapé ----------

  /** Logo à esquerda; linha laranja + "RELATÓRIO DE OBRA" à direita. yBase = topo da faixa. */
  function desenharTopo(doc, estado, yBase) {
    var y = (yBase || 0) + TOPO.yLogo;
    if (estado.logo) {
      var w = TOPO.larguraLogo;
      var h = w * estado.logo.altura / estado.logo.largura;
      doc.addImage(estado.logo.dataUrl, formatoDaImagem(estado.logo.dataUrl), MARGEM, y, w, h, 'logo');
    }
    var larguraTitulo = larguraDoTexto(doc, TITULO_FIXO, ESTILO.tituloTopo);
    var xLinha = DIREITA - larguraTitulo - 4;
    corDeTraco(doc, COR.laranja);
    doc.setLineWidth(0.6);
    doc.line(xLinha, y + 2, xLinha, y + 9);
    escrever(doc, TITULO_FIXO, DIREITA, y + 4.3, ESTILO.tituloTopo, 'right');
  }

  /** Faixa grafite: número da página, linha laranja e o lema da Tecno. */
  function desenharRodape(doc, pagina, total) {
    var yFaixa = PAGINA.altura - RODAPE.altura;
    var yMeio = yFaixa + RODAPE.altura / 2;
    corDePreenchimento(doc, COR.grafite);
    doc.rect(0, yFaixa, PAGINA.largura, RODAPE.altura, 'F');

    var textoPagina = 'PÁG. ' + pagina + ' DE ' + total;
    var hLetra = alturaLetra(ESTILO.rodape) * 0.72;   // altura das maiúsculas
    escrever(doc, textoPagina, MARGEM, yMeio - hLetra / 2 - 0.35, ESTILO.pagina);
    var fimPagina = MARGEM + larguraDoTexto(doc, textoPagina, ESTILO.pagina);
    var inicioLema = DIREITA - larguraDoTexto(doc, LEMA, ESTILO.rodape);
    escrever(doc, LEMA, DIREITA, yMeio - hLetra / 2 - 0.35, ESTILO.rodape, 'right');

    corDeTraco(doc, COR.laranja);
    doc.setLineWidth(0.3);
    doc.line(fimPagina + 6, yMeio, inicioLema - 6, yMeio);
  }

  // ---------- Controle das páginas A4 ----------

  /**
   * ctx guarda o documento, a posição atual (y) e quais páginas são A4 "de texto"
   * (que recebem topo e rodapé). As páginas do layout "tamanho da foto" não entram.
   */
  function novaPaginaA4(ctx) {
    if (ctx.usarPaginaAtual) {
      ctx.usarPaginaAtual = false;
    } else {
      ctx.doc.addPage('a4', 'portrait');
    }
    desenharTopo(ctx.doc, ctx.estado, 0);
    ctx.paginasA4.push(ctx.doc.getNumberOfPages());
    ctx.y = AREA.topo;
  }

  function garantirEspaco(ctx, altura) {
    if (ctx.y + altura > AREA.base) { novaPaginaA4(ctx); }
  }

  // ---------- Seções ----------

  /**
   * Título da seção ("1. INFORMAÇÕES GERAIS"). `alturaMinima` é o espaço que o
   * começo do conteúdo precisa ter na mesma página, para o título não ficar sozinho.
   */
  function tituloDeSecao(ctx, numero, titulo, comLinha, alturaMinima) {
    if (ctx.y > AREA.topo) { ctx.y += ESPACO.antesSecao; }
    var alturaTitulo = alturaLetra(ESTILO.tituloSecao) + (comLinha ? 7 : 4);
    garantirEspaco(ctx, alturaTitulo + (alturaMinima || 12));

    escrever(ctx.doc, numero + '.', X_NUMERO, ctx.y, ESTILO.numeroSecao);
    escrever(ctx.doc, textoSeguro(titulo).toUpperCase(), X_CONTEUDO, ctx.y, ESTILO.tituloSecao);
    ctx.y += alturaLetra(ESTILO.tituloSecao);
    if (comLinha) {
      ctx.y += 2.5;
      corDeTraco(ctx.doc, COR.borda);
      ctx.doc.setLineWidth(0.3);
      ctx.doc.line(X_CONTEUDO, ctx.y, DIREITA, ctx.y);
      ctx.y += 4.5;
    } else {
      ctx.y += 4;
    }
  }

  /** Tabela de duas colunas: rótulo em fundo cinza, valor em fundo branco. */
  function tabela(ctx, linhas) {
    var doc = ctx.doc;
    var est = ESTILO.tabela;
    var hLinha = alturaLinha(est);
    var larguraValor = LARGURA_CONTEUDO - LARGURA_ROTULO - 2 * ESPACO.celula.h;
    var primeira = true;

    linhas.forEach(function (par) {
      var valor = quebrarLinhas(doc, par[1], est, larguraValor);
      var h = Math.max(1, valor.length) * hLinha + 2 * ESPACO.celula.v - (hLinha - alturaLetra(est));
      if (ctx.y + h > AREA.base) { novaPaginaA4(ctx); primeira = true; }

      corDePreenchimento(doc, COR.fundo);
      doc.rect(X_CONTEUDO, ctx.y, LARGURA_ROTULO, h, 'F');
      corDeTraco(doc, COR.borda);
      doc.setLineWidth(0.25);
      if (primeira) { doc.line(X_CONTEUDO, ctx.y, DIREITA, ctx.y); }
      doc.line(X_CONTEUDO, ctx.y + h, DIREITA, ctx.y + h);

      escrever(doc, par[0], X_CONTEUDO + ESPACO.celula.h, ctx.y + ESPACO.celula.v, est);
      valor.forEach(function (linha, i) {
        escrever(doc, linha, X_CONTEUDO + LARGURA_ROTULO + ESPACO.celula.h, ctx.y + ESPACO.celula.v + i * hLinha, est);
      });
      ctx.y += h;
      primeira = false;
    });
  }

  /** Lista com marcadores laranja; quebra linha e página sozinha. */
  function lista(ctx, itens) {
    var doc = ctx.doc;
    var est = ESTILO.texto;
    var hLinha = alturaLinha(est);
    var recuo = 5;

    itens.forEach(function (item) {
      var linhas = quebrarLinhas(doc, item, est, LARGURA_CONTEUDO - recuo);
      linhas.forEach(function (linha, i) {
        garantirEspaco(ctx, hLinha);
        if (i === 0) {
          corDePreenchimento(doc, COR.laranja);
          doc.circle(X_CONTEUDO + 1.4, ctx.y + alturaLetra(est) * 0.47, RAIO_MARCADOR, 'F');
        }
        escrever(doc, linha, X_CONTEUDO + recuo, ctx.y, est);
        ctx.y += hLinha;
      });
      ctx.y += ESPACO.entreItens;
    });
    ctx.y -= ESPACO.entreItens;
  }

  /** Texto corrido; respeita as quebras de linha digitadas. */
  function paragrafos(ctx, texto) {
    var doc = ctx.doc;
    var est = ESTILO.texto;
    var hLinha = alturaLinha(est);
    var blocos = textoSeguro(texto).replace(/\r/g, '').trim().split('\n');

    blocos.forEach(function (bloco) {
      if (bloco.trim() === '') { ctx.y += hLinha * 0.6; return; }
      quebrarLinhas(doc, bloco, est, LARGURA_CONTEUDO).forEach(function (linha) {
        garantirEspaco(ctx, hLinha);
        escrever(doc, linha, X_CONTEUDO, ctx.y, est);
        ctx.y += hLinha;
      });
    });
  }

  function assinatura(ctx) {
    var h = alturaLetra(ESTILO.assinatura);
    if (ctx.y + 7 + h > AREA.base) { return; }   // não abre página só para a assinatura
    ctx.y += 7;
    escrever(ctx.doc, ASSINATURA, X_CONTEUDO, ctx.y, ESTILO.assinatura);
    ctx.y += h;
  }

  // ---------- Fotos em páginas A4 ----------

  function gradeDoLayout(fotosPorPagina) {
    if (fotosPorPagina === 4) { return { colunas: 2, linhas: 2 }; }
    if (fotosPorPagina === 2) { return { colunas: 1, linhas: 2 }; }
    return { colunas: 1, linhas: 1 };
  }

  /** Limita o título a um número de linhas, terminando com "..." se cortar. */
  function limitarLinhas(doc, linhas, maxLinhas, largura) {
    if (linhas.length <= maxLinhas) { return linhas; }
    var cortadas = linhas.slice(0, maxLinhas);
    var ultima = cortadas[maxLinhas - 1];
    while (ultima.length > 0 && larguraDoTexto(doc, ultima + '...', ESTILO.tituloFoto) > largura) {
      ultima = ultima.slice(0, -1);
    }
    cortadas[maxLinhas - 1] = ultima.replace(/\s+$/, '') + '...';
    return cortadas;
  }

  /**
   * Desenha até `fotosPorPagina` fotos entre `topo` e `base`. Cada linha da grade
   * reserva o espaço do maior título dela, para que as fotos lado a lado fiquem
   * alinhadas. A foto cabe inteira na célula, mantendo a proporção, centralizada
   * na horizontal e logo abaixo do título. Retorna o y do fim do que foi desenhado.
   */
  function desenharFotos(doc, fotos, fotosPorPagina, topo, base, qualidade) {
    var grade = gradeDoLayout(fotosPorPagina);
    var larguraCelula = (LARGURA_CONTEUDO - ESPACO.entreFotos * (grade.colunas - 1)) / grade.colunas;
    var alturaCelula = (base - topo - ESPACO.entreFotos * (grade.linhas - 1)) / grade.linhas;
    var hLinha = alturaLinha(ESTILO.tituloFoto);
    var maxLinhasTitulo = Math.max(1, Math.floor((alturaCelula * PROPORCAO_MAX_TITULO) / hLinha));
    var fim = topo;

    for (var l = 0; l < grade.linhas; l++) {
      var daLinha = fotos.slice(l * grade.colunas, (l + 1) * grade.colunas);
      if (daLinha.length === 0) { break; }

      var titulos = daLinha.map(function (foto) {
        var linhas = quebrarLinhas(doc, foto.titulo, ESTILO.tituloFoto, larguraCelula);
        return limitarLinhas(doc, linhas, maxLinhasTitulo, larguraCelula);
      });
      var maiorTitulo = Math.max.apply(null, titulos.map(function (t) { return t.length; }));
      var areaTitulo = maiorTitulo > 0 ? maiorTitulo * hLinha + ESPACO.tituloFoto : 0;
      var yLinha = topo + l * (alturaCelula + ESPACO.entreFotos);
      var alturaCaixaFoto = alturaCelula - areaTitulo;

      daLinha.forEach(function (foto, c) {
        var xCelula = X_CONTEUDO + c * (larguraCelula + ESPACO.entreFotos);
        var cx = xCelula + larguraCelula / 2;

        // Título encostado na foto (alinhado pela base da área de título).
        var linhas = titulos[c];
        var yTitulo = yLinha + areaTitulo - (linhas.length * hLinha + ESPACO.tituloFoto);
        linhas.forEach(function (linha, i) {
          escrever(doc, linha, cx, yTitulo + i * hLinha, ESTILO.tituloFoto, 'center');
        });

        // Foto inteira, sem distorcer: usa a maior escala que cabe na caixa.
        var escala = Math.min(larguraCelula / foto.largura, alturaCaixaFoto / foto.altura);
        var w = foto.largura * escala;
        var h = foto.altura * escala;
        doc.addImage(imagemDaFoto(foto, qualidade), 'JPEG', cx - w / 2, yLinha + areaTitulo, w, h, 'foto-' + foto.id);
        fim = Math.max(fim, yLinha + areaTitulo + h);
      });
    }
    return fim;
  }

  function registroFotograficoA4(ctx, numero) {
    var estado = ctx.estado;
    var porPagina = [1, 2, 4].indexOf(estado.fotosPorPagina) !== -1 ? estado.fotosPorPagina : 1;
    tituloDeSecao(ctx, numero, 'Registro fotográfico', true, ALTURA_MIN_FOTOS);

    for (var i = 0; i < estado.fotos.length; i += porPagina) {
      if (i > 0) { novaPaginaA4(ctx); }
      ctx.y = desenharFotos(ctx.doc, estado.fotos.slice(i, i + porPagina), porPagina, ctx.y, AREA.base, estado.qualidade);
    }
  }

  // ---------- Montagem ----------

  /** Quais seções têm conteúdo, na ordem do relatório (a numeração vem daqui). */
  function planejarSecoes(estado) {
    var info = [
      ['Obra:', estado.obra],
      ['Endereço:', estado.endereco],
      linhaPeriodo(estado.dataInicial, estado.dataFinal),
      ['Responsável:', estado.responsavel]
    ].filter(function (par) { return par && textoSeguro(par[1]).trim() !== ''; });

    var plano = {
      info: info,
      atividades: itensDaLista(estado.atividades),
      proximos: itensDaLista(estado.proximosPassos),
      tituloProximos: textoSeguro(estado.tituloProximos).trim().replace(/:\s*$/, '') || 'Próximos passos',
      observacoes: textoSeguro(estado.observacoes).trim(),
      ordem: []
    };
    if (plano.info.length) { plano.ordem.push('info'); }
    if (plano.atividades.length) { plano.ordem.push('atividades'); }
    plano.ordem.push('fotos');
    if (plano.proximos.length) { plano.ordem.push('proximos'); }
    if (plano.observacoes) { plano.ordem.push('observacoes'); }
    plano.numero = function (nome) { return plano.ordem.indexOf(nome) + 1; };
    return plano;
  }

  function secoesIniciais(ctx, plano) {
    if (plano.info.length) {
      tituloDeSecao(ctx, plano.numero('info'), 'Informações gerais', false, 14);
      tabela(ctx, plano.info);
    }
    if (plano.atividades.length) {
      tituloDeSecao(ctx, plano.numero('atividades'), 'Atividades realizadas', true);
      lista(ctx, plano.atividades);
    }
  }

  /** Próximos passos e observações. Retorna true se desenhou alguma coisa. */
  function secoesFinais(ctx, plano) {
    if (plano.proximos.length) {
      tituloDeSecao(ctx, plano.numero('proximos'), plano.tituloProximos, true);
      lista(ctx, plano.proximos);
    }
    if (plano.observacoes) {
      tituloDeSecao(ctx, plano.numero('observacoes'), 'Observações', true);
      paragrafos(ctx, plano.observacoes);
    }
    return plano.proximos.length > 0 || !!plano.observacoes;
  }

  function finalizar(ctx) {
    var total = ctx.doc.getNumberOfPages();
    ctx.paginasA4.forEach(function (p) {
      ctx.doc.setPage(p);
      desenharRodape(ctx.doc, p, total);
    });
    ctx.doc.setPage(total);
    return ctx.doc;
  }

  function prepararDocumento(doc, estado) {
    registrarFontes(doc);
    var obra = textoSeguro(estado.obra).trim();
    doc.setProperties({
      title: 'Relatório de obra' + (obra ? ' – ' + obra : ''),
      subject: obra,
      author: 'Tecno Construções',
      creator: 'Conversor de Relatório em PDF'
    });
  }

  function novoContexto(doc, estado) {
    return { doc: doc, estado: estado, y: AREA.topo, paginasA4: [], usarPaginaAtual: true };
  }

  /** Layouts 1, 2 e 4 fotos por página: tudo em A4, com as seções em sequência. */
  function criarDocumentoA4(JsPDF, estado) {
    var doc = new JsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
    prepararDocumento(doc, estado);
    var ctx = novoContexto(doc, estado);
    var plano = planejarSecoes(estado);

    novaPaginaA4(ctx);
    secoesIniciais(ctx, plano);
    registroFotograficoA4(ctx, plano.numero('fotos'));
    if (secoesFinais(ctx, plano)) { assinatura(ctx); }
    return finalizar(ctx);
  }

  // ---------- Layout "tamanho da foto" ----------
  //
  // Cada foto ganha uma página própria com a largura de uma folha A4 (210 mm)
  // e a altura que a proporção da foto pede: a foto ocupa a página de ponta a
  // ponta (foto em pé = página em pé; deitada = página deitada). O título fica
  // numa faixa branca acima da foto. Informações gerais e atividades vêm numa
  // folha A4 antes das fotos; próximos passos e observações, numa folha A4 depois.
  // Sem informações nem atividades, o topo do relatório vai na primeira foto.

  var FAIXA = { topo: 6, base: 4, margemLateral: 15, secao: 9 };

  function orientacao(largura, altura) {
    return largura > altura ? 'landscape' : 'portrait';
  }

  function criarDocumentoTamanhoDaFoto(JsPDF, estado) {
    var plano = planejarSecoes(estado);
    var temFolhaInicial = plano.info.length > 0 || plano.atividades.length > 0;

    // Mede os títulos antes, porque o tamanho de cada página é definido ao criá-la.
    var medidor = new JsPDF({ unit: 'mm', format: 'a4' });
    registrarFontes(medidor);
    var larguraTexto = PAGINA.largura - 2 * FAIXA.margemLateral;
    var hLinha = alturaLinha(ESTILO.tituloFaixa);

    var paginas = estado.fotos.map(function (foto, i) {
      var linhas = quebrarLinhas(medidor, foto.titulo, ESTILO.tituloFaixa, larguraTexto);
      var topo = (i === 0 && !temFolhaInicial) ? TOPO.alturaFaixa : 0;
      var secao = i === 0 ? FAIXA.secao : 0;
      var alturaTitulo = linhas.length > 0 ? linhas.length * hLinha : 0;
      var faixa = (secao || alturaTitulo) ? FAIXA.topo + secao + alturaTitulo + FAIXA.base : 0;
      var alturaFoto = PAGINA.largura * foto.altura / foto.largura;
      return { foto: foto, linhas: linhas, topo: topo, secao: secao, faixa: faixa, alturaFoto: alturaFoto,
        altura: topo + faixa + alturaFoto };
    });

    var doc, ctx;
    if (temFolhaInicial) {
      doc = new JsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
      prepararDocumento(doc, estado);
      ctx = novoContexto(doc, estado);
      novaPaginaA4(ctx);
      secoesIniciais(ctx, plano);
    }

    paginas.forEach(function (pg, i) {
      var formato = [PAGINA.largura, pg.altura];
      if (!doc) {
        doc = new JsPDF({ unit: 'mm', format: formato, orientation: orientacao(PAGINA.largura, pg.altura), compress: true });
        prepararDocumento(doc, estado);
        ctx = novoContexto(doc, estado);
        ctx.usarPaginaAtual = false;
      } else {
        doc.addPage(formato, orientacao(PAGINA.largura, pg.altura));
      }
      if (pg.topo > 0) { desenharTopo(doc, estado, 0); }

      var y = pg.topo + FAIXA.topo;
      if (pg.secao) {
        escrever(doc, plano.numero('fotos') + '.', X_NUMERO, y, ESTILO.numeroSecao);
        escrever(doc, 'REGISTRO FOTOGRÁFICO', X_CONTEUDO, y, ESTILO.tituloSecao);
        y += pg.secao;
      }
      pg.linhas.forEach(function (linha, n) {
        escrever(doc, linha, PAGINA.largura / 2, y + n * hLinha, ESTILO.tituloFaixa, 'center');
      });
      doc.addImage(imagemDaFoto(pg.foto, estado.qualidade), 'JPEG',
        0, pg.topo + pg.faixa, PAGINA.largura, pg.alturaFoto, 'foto-' + pg.foto.id);
    });

    if (plano.proximos.length || plano.observacoes) {
      ctx.usarPaginaAtual = false;
      novaPaginaA4(ctx);
      secoesFinais(ctx, plano);
      assinatura(ctx);
    }
    return finalizar(ctx);
  }

  // ---------- Documento ----------

  /** Monta o PDF completo e devolve o objeto jsPDF. */
  function criarDocumento(estado) {
    var JsPDF = window.jspdf && window.jspdf.jsPDF;
    if (!JsPDF) {
      throw new Error('a biblioteca jsPDF não carregou (arquivo vendor/jspdf.umd.min.js).');
    }
    if (estado.fotosPorPagina === 'foto') {
      return criarDocumentoTamanhoDaFoto(JsPDF, estado);
    }
    return criarDocumentoA4(JsPDF, estado);
  }

  // ---------- Nome do arquivo ----------

  function semAcentos(texto) {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function hojeIso() {
    var d = new Date();
    var mes = String(d.getMonth() + 1).padStart(2, '0');
    var dia = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mes + '-' + dia;
  }

  /** Ex.: "Relatorio - Residencia Julia e Pedro - 2026-09-25.pdf" (válido no Windows). */
  function nomeArquivo(estado) {
    var base = semAcentos(textoSeguro(estado.obra))
      .replace(/[–—]/g, '-')
      .replace(/[^\x20-\x7E]/g, '')
      .replace(/[<>:"\/\\|?*]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 80)
      .replace(/[ .]+$/, '');
    if (!base) {
      base = 'Relatorio';
    } else if (!/^relatorio/i.test(base)) {
      base = 'Relatorio - ' + base;
    }
    var data = /^\d{4}-\d{2}-\d{2}$/.test(estado.dataInicial || '') ? estado.dataInicial : hojeIso();
    return base + ' - ' + data + '.pdf';
  }

  window.GeradorPDF = {
    criarDocumento: criarDocumento,
    nomeArquivo: nomeArquivo
  };
})();
