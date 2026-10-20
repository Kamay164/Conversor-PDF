/* Conversor de Fotos para Relatório em PDF – montagem do PDF
 *
 * Recebe o estado do relatório (window.Relatorio.estado) e monta um PDF A4
 * com jsPDF, no estilo do relatório de exemplo da Tecno:
 *   - página 1: logo (opcional), título, subtítulo e data/período, seguidos das fotos;
 *   - fotos com título acima, 1, 2 ou 4 por página (A4) ou uma página do tamanho
 *     de cada foto, sempre sem distorcer nem cortar;
 *   - página final com os próximos passos em lista.
 * Exposto em window.GeradorPDF. Todas as medidas estão em milímetros.
 */
(function () {
  'use strict';

  var PAGINA = { largura: 210, altura: 297 };
  var MARGEM = { topo: 20, base: 20, lados: 25 };
  var LARGURA_UTIL = PAGINA.largura - 2 * MARGEM.lados;   // 160 mm
  var CENTRO_X = PAGINA.largura / 2;

  var MM_POR_PONTO = 25.4 / 72;
  var FATOR_LINHA = 1.2;
  var FONTE = 'times';   // fonte serifada, como no exemplo

  var ESTILO = {
    tituloRelatorio: { tamanho: 13, peso: 'bold' },
    subtitulo:       { tamanho: 12, peso: 'bold' },
    periodo:         { tamanho: 11, peso: 'normal' },
    tituloFoto:      { tamanho: 12, peso: 'bold' },
    tituloProximos:  { tamanho: 12, peso: 'bold' },
    itemProximos:    { tamanho: 12, peso: 'normal' }
  };

  var ESPACO = {
    aposLogo: 4,            // entre o logo e o título
    entreTextos: 1.5,       // entre título, subtítulo e período
    aposCabecalho: 6,       // entre o cabeçalho e a primeira foto
    tituloFoto: 2,          // entre o título da foto e a foto
    entreFotos: 6,          // entre células da grade
    aposTituloProximos: 4,
    entreItens: 1
  };

  var LOGO_MAX = { largura: 70, altura: 28 };
  var ALTURA_MIN_FOTOS_PAG1 = 80;   // se sobrar menos que isso na página 1, as fotos começam na página 2
  var PROPORCAO_MAX_TITULO = 0.35;  // o título da foto ocupa no máximo 35% da altura da célula
  var RECUO_LISTA = 6;
  var RAIO_MARCADOR = 0.7;

  // ---------- Texto ----------

  // Caracteres extras da codificação WinAnsi (além do Latin-1): – — “ ” ‘ ’ • … € ™ etc.
  var EXTRAS_WINANSI = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ' +
    '‘’“”•–—˜™š›œžŸ';

  /**
   * As fontes padrão do PDF (Times) usam a codificação WinAnsi, que cobre os
   * acentos do português, o travessão "–", aspas curvas e "•". Só o que fica
   * fora dela (emojis, símbolos de outros idiomas) é trocado ou removido,
   * para não aparecer lixo no PDF. O resto é impresso exatamente como digitado.
   */
  function textoSeguro(texto) {
    return String(texto || '')
      .replace(/[′]/g, "'")
      .replace(/[″]/g, '"')
      .replace(/[−‐‑]/g, '-')
      .replace(/[   ]/g, ' ')
      .split('')
      .filter(function (ch) {
        var c = ch.charCodeAt(0);
        return c === 9 || c === 10 || c === 13 ||
          (c >= 0x20 && c <= 0x7E) || (c >= 0xA0 && c <= 0xFF) ||
          EXTRAS_WINANSI.indexOf(ch) !== -1;
      })
      .join('');
  }

  function alturaLinha(estilo) {
    return estilo.tamanho * MM_POR_PONTO * FATOR_LINHA;
  }

  function aplicarEstilo(doc, estilo) {
    doc.setFont(FONTE, estilo.peso);
    doc.setFontSize(estilo.tamanho);
  }

  /** Quebra o texto em linhas que cabem na largura indicada. */
  function quebrarLinhas(doc, texto, estilo, largura) {
    var limpo = textoSeguro(texto).trim();
    if (!limpo) { return []; }
    aplicarEstilo(doc, estilo);
    return doc.splitTextToSize(limpo, largura);
  }

  /** Escreve linhas centralizadas em cx a partir de y (topo). Retorna o y seguinte. */
  function escreverCentralizado(doc, linhas, estilo, cx, y) {
    aplicarEstilo(doc, estilo);
    var h = alturaLinha(estilo);
    linhas.forEach(function (linha) {
      doc.text(linha, cx, y, { align: 'center', baseline: 'top' });
      y += h;
    });
    return y;
  }

  // ---------- Datas ----------

  /** '2026-09-22' -> '22/09/2026' (sem usar Date, para não sofrer com fuso horário). */
  function formatarData(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? m[3] + '/' + m[2] + '/' + m[1] : '';
  }

  function textoPeriodo(dataInicial, dataFinal) {
    var ini = formatarData(dataInicial);
    var fim = formatarData(dataFinal);
    if (ini && fim && ini !== fim) { return 'Período: ' + ini + ' a ' + fim; }
    if (ini || fim) { return 'Data: ' + (ini || fim); }
    return '';
  }

  // ---------- Imagens ----------

  function formatoDaImagem(dataUrl) {
    return /^data:image\/png/i.test(dataUrl) ? 'PNG' : 'JPEG';
  }

  // ---------- Cabeçalho (página 1) ----------

  /**
   * Logo, título, subtítulo e período. Com `desenhar = false` só mede.
   * Retorna o y onde as fotos começam, ou null se o cabeçalho estiver vazio.
   */
  function cabecalho(doc, estado, desenhar) {
    var y = MARGEM.topo;
    var temAlgo = false;

    if (estado.logo) {
      var escala = Math.min(LOGO_MAX.largura / estado.logo.largura, LOGO_MAX.altura / estado.logo.altura);
      var w = estado.logo.largura * escala;
      var h = estado.logo.altura * escala;
      if (desenhar) {
        doc.addImage(estado.logo.dataUrl, formatoDaImagem(estado.logo.dataUrl), CENTRO_X - w / 2, y, w, h, 'logo');
      }
      y += h + ESPACO.aposLogo;
      temAlgo = true;
    }

    var textos = [
      { texto: estado.titulo, estilo: ESTILO.tituloRelatorio },
      { texto: estado.subtitulo, estilo: ESTILO.subtitulo },
      { texto: textoPeriodo(estado.dataInicial, estado.dataFinal), estilo: ESTILO.periodo }
    ];
    textos.forEach(function (item) {
      var linhas = quebrarLinhas(doc, item.texto, item.estilo, LARGURA_UTIL);
      if (linhas.length === 0) { return; }
      if (desenhar) {
        y = escreverCentralizado(doc, linhas, item.estilo, CENTRO_X, y);
      } else {
        y += linhas.length * alturaLinha(item.estilo);
      }
      y += ESPACO.entreTextos;
      temAlgo = true;
    });

    return temAlgo ? y + ESPACO.aposCabecalho : null;
  }

  /** Desenha o cabeçalho na página A4. Retorna o y onde as fotos começam. */
  function desenharCabecalho(doc, estado) {
    var y = cabecalho(doc, estado, true);
    return y === null ? MARGEM.topo : y;
  }

  // ---------- Páginas de fotos ----------

  /** Versão da foto conforme a qualidade escolhida ("normal" ou "alta"). */
  function imagemDaFoto(foto, qualidade) {
    return (qualidade === 'alta' && foto.dataUrlAlta) ? foto.dataUrlAlta : foto.dataUrl;
  }

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
    aplicarEstilo(doc, ESTILO.tituloFoto);
    while (ultima.length > 0 && doc.getTextWidth(ultima + '...') > largura) {
      ultima = ultima.slice(0, -1);
    }
    cortadas[maxLinhas - 1] = ultima.replace(/\s+$/, '') + '...';
    return cortadas;
  }

  /**
   * Desenha até `fotosPorPagina` fotos na página atual, a partir de `topo`.
   * Cada linha da grade reserva o espaço do maior título dela, para que as
   * fotos lado a lado fiquem alinhadas. A foto cabe inteira na célula,
   * mantendo a proporção, centralizada na horizontal e logo abaixo do título.
   */
  function desenharFotos(doc, fotos, fotosPorPagina, topo, qualidade) {
    var grade = gradeDoLayout(fotosPorPagina);
    var alturaUtil = PAGINA.altura - MARGEM.base - topo;
    var larguraCelula = (LARGURA_UTIL - ESPACO.entreFotos * (grade.colunas - 1)) / grade.colunas;
    var alturaCelula = (alturaUtil - ESPACO.entreFotos * (grade.linhas - 1)) / grade.linhas;
    var hLinha = alturaLinha(ESTILO.tituloFoto);
    var maxLinhasTitulo = Math.max(1, Math.floor((alturaCelula * PROPORCAO_MAX_TITULO) / hLinha));

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
        var xCelula = MARGEM.lados + c * (larguraCelula + ESPACO.entreFotos);
        var cx = xCelula + larguraCelula / 2;

        // Título encostado na foto (alinhado pela base da área de título).
        var linhas = titulos[c];
        if (linhas.length > 0) {
          var alturaTitulo = linhas.length * hLinha + ESPACO.tituloFoto;
          escreverCentralizado(doc, linhas, ESTILO.tituloFoto, cx, yLinha + areaTitulo - alturaTitulo);
        }

        // Foto inteira, sem distorcer: usa a maior escala que cabe na caixa.
        var escala = Math.min(larguraCelula / foto.largura, alturaCaixaFoto / foto.altura);
        var w = foto.largura * escala;
        var h = foto.altura * escala;
        doc.addImage(imagemDaFoto(foto, qualidade), 'JPEG', cx - w / 2, yLinha + areaTitulo, w, h, foto.id);
      });
    }
  }

  // ---------- Próximos passos ----------

  function itensDaLista(texto) {
    return String(texto || '')
      .split(/\r?\n/)
      .map(function (linha) { return linha.trim(); })
      .filter(function (linha) { return linha.length > 0; });
  }

  /** Página nova com o título centralizado e a lista com marcadores. Omitida se não houver itens. */
  function desenharProximosPassos(doc, titulo, texto) {
    var itens = itensDaLista(texto);
    if (itens.length === 0) { return; }

    doc.addPage('a4', 'portrait');
    var y = MARGEM.topo;
    var limiteY = PAGINA.altura - MARGEM.base;

    var linhasTitulo = quebrarLinhas(doc, titulo, ESTILO.tituloProximos, LARGURA_UTIL);
    if (linhasTitulo.length > 0) {
      y = escreverCentralizado(doc, linhasTitulo, ESTILO.tituloProximos, CENTRO_X, y) + ESPACO.aposTituloProximos;
    }

    var xTexto = MARGEM.lados + RECUO_LISTA;
    var larguraTexto = LARGURA_UTIL - RECUO_LISTA;
    var h = alturaLinha(ESTILO.itemProximos);
    var alturaLetra = ESTILO.itemProximos.tamanho * MM_POR_PONTO;

    itens.forEach(function (item) {
      var linhas = quebrarLinhas(doc, item, ESTILO.itemProximos, larguraTexto);
      linhas.forEach(function (linha, i) {
        if (y + h > limiteY) {
          doc.addPage('a4', 'portrait');
          y = MARGEM.topo;
        }
        aplicarEstilo(doc, ESTILO.itemProximos);
        if (i === 0) {
          // Marcador desenhado como círculo: não depende da fonte.
          doc.circle(MARGEM.lados + RECUO_LISTA / 2, y + alturaLetra * 0.45, RAIO_MARCADOR, 'F');
        }
        doc.text(linha, xTexto, y, { baseline: 'top' });
        y += h;
      });
      y += ESPACO.entreItens;
    });
  }

  // ---------- Layout "tamanho da foto" ----------
  //
  // Cada foto ganha uma página própria com a largura de uma folha A4 (210 mm)
  // e a altura que a proporção da foto pede: a foto ocupa a página de ponta a
  // ponta, sem sobra branca (foto em pé = página em pé; deitada = página deitada).
  // O título da foto fica numa faixa branca acima dela, o cabeçalho do relatório
  // na primeira página e os próximos passos numa folha A4 no final.

  var FAIXA_TITULO = { topo: 6, base: 4, margemLateral: 15 };

  function orientacao(largura, altura) {
    return largura > altura ? 'landscape' : 'portrait';
  }

  function criarDocumentoTamanhoDaFoto(JsPDF, estado) {
    // Mede tudo antes, porque o tamanho da primeira página é definido ao criar o documento.
    var medidor = new JsPDF({ unit: 'mm', format: 'a4' });
    var larguraTexto = PAGINA.largura - 2 * FAIXA_TITULO.margemLateral;
    var hLinha = alturaLinha(ESTILO.tituloFoto);
    var alturaCabecalho = cabecalho(medidor, estado, false) || 0;

    var paginas = estado.fotos.map(function (foto, i) {
      var linhas = quebrarLinhas(medidor, foto.titulo, ESTILO.tituloFoto, larguraTexto);
      var topo = i === 0 ? alturaCabecalho : 0;
      var alturaTitulo = linhas.length > 0 ? FAIXA_TITULO.topo + linhas.length * hLinha + FAIXA_TITULO.base : 0;
      var alturaFoto = PAGINA.largura * foto.altura / foto.largura;
      return {
        foto: foto, linhas: linhas, topo: topo, alturaTitulo: alturaTitulo, alturaFoto: alturaFoto,
        altura: topo + alturaTitulo + alturaFoto
      };
    });

    var doc = null;
    paginas.forEach(function (pg, i) {
      var formato = [PAGINA.largura, pg.altura];
      if (i === 0) {
        doc = new JsPDF({ unit: 'mm', format: formato, orientation: orientacao(PAGINA.largura, pg.altura), compress: true });
        prepararDocumento(doc, estado);
        if (alturaCabecalho > 0) { cabecalho(doc, estado, true); }
      } else {
        doc.addPage(formato, orientacao(PAGINA.largura, pg.altura));
      }
      if (pg.linhas.length > 0) {
        escreverCentralizado(doc, pg.linhas, ESTILO.tituloFoto, CENTRO_X, pg.topo + FAIXA_TITULO.topo);
      }
      doc.addImage(imagemDaFoto(pg.foto, estado.qualidade), 'JPEG',
        0, pg.topo + pg.alturaTitulo, PAGINA.largura, pg.alturaFoto, pg.foto.id);
    });

    desenharProximosPassos(doc, estado.tituloProximos, estado.proximosPassos);
    return doc;
  }

  // ---------- Documento ----------

  function prepararDocumento(doc, estado) {
    doc.setProperties({
      title: textoSeguro(estado.titulo).trim() || 'Relatório',
      subject: textoSeguro(estado.subtitulo).trim(),
      creator: 'Conversor de Relatório em PDF'
    });
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(0, 0, 0);
  }

  /** Monta o PDF completo e devolve o objeto jsPDF. */
  function criarDocumento(estado) {
    var JsPDF = window.jspdf && window.jspdf.jsPDF;
    if (!JsPDF) {
      throw new Error('a biblioteca jsPDF não carregou (arquivo vendor/jspdf.umd.min.js).');
    }
    if (estado.fotosPorPagina === 'foto') {
      return criarDocumentoTamanhoDaFoto(JsPDF, estado);
    }

    var doc = new JsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
    prepararDocumento(doc, estado);

    var porPagina = [1, 2, 4].indexOf(estado.fotosPorPagina) !== -1 ? estado.fotosPorPagina : 1;
    var topo = desenharCabecalho(doc, estado);
    if (PAGINA.altura - MARGEM.base - topo < ALTURA_MIN_FOTOS_PAG1) {
      doc.addPage('a4', 'portrait');
      topo = MARGEM.topo;
    }

    for (var i = 0; i < estado.fotos.length; i += porPagina) {
      if (i > 0) {
        doc.addPage('a4', 'portrait');
        topo = MARGEM.topo;
      }
      desenharFotos(doc, estado.fotos.slice(i, i + porPagina), porPagina, topo, estado.qualidade);
    }

    desenharProximosPassos(doc, estado.tituloProximos, estado.proximosPassos);
    return doc;
  }

  // ---------- Nome do arquivo ----------

  function semAcentos(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function hojeIso() {
    var d = new Date();
    var mes = String(d.getMonth() + 1).padStart(2, '0');
    var dia = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mes + '-' + dia;
  }

  /** Ex.: "Relatorio - Residencia Julia e Pedro - 2026-09-25.pdf" (válido no Windows). */
  function nomeArquivo(estado) {
    var base = semAcentos(textoSeguro(estado.titulo))
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
