/* Conversor de Fotos para Relatório em PDF – tratamento de imagens
 *
 * Lê, valida, redimensiona e comprime as fotos no próprio navegador.
 * Nenhuma imagem sai do aparelho do usuário (computador ou celular).
 * Exposto em window.Imagens (script clássico, sem módulos, para funcionar via file://).
 */
(function () {
  'use strict';

  var TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp'];
  var EXTENSOES_ACEITAS = ['jpg', 'jpeg', 'png', 'webp'];

  // Lado maior (px) e qualidade JPEG de cada tipo de saída.
  var FOTO = { ladoMax: 1600, qualidade: 0.8 };        // qualidade "Normal" no PDF
  var FOTO_ALTA = { ladoMax: 2400, qualidade: 0.9 };   // qualidade "Alta" no PDF (para impressão)
  var MINIATURA = { ladoMax: 160, qualidade: 0.7 };

  function extensao(nome) {
    var m = /\.([^.]+)$/.exec(nome || '');
    return m ? m[1].toLowerCase() : '';
  }

  /**
   * Confere o arquivo antes de tentar abri-lo.
   * Retorna null se estiver ok, ou um texto em português explicando o problema.
   */
  function validarArquivo(arquivo) {
    var nome = '"' + arquivo.name + '"';
    var ext = extensao(arquivo.name);
    var tipo = (arquivo.type || '').toLowerCase();

    if (ext === 'heic' || ext === 'heif' || tipo === 'image/heic' || tipo === 'image/heif') {
      return nome + ': o formato HEIC (padrão do iPhone) não funciona no navegador. ' +
        'Converta para JPG ou PNG e envie de novo.';
    }
    var tipoOk = TIPOS_ACEITOS.indexOf(tipo) !== -1 ||
      (tipo === '' && EXTENSOES_ACEITAS.indexOf(ext) !== -1);
    if (!tipoOk) {
      return nome + ': formato não aceito. Use JPG, PNG ou WebP.';
    }
    if (arquivo.size === 0) {
      return nome + ': o arquivo está vazio.';
    }
    return null;
  }

  // Alternativa para navegadores sem createImageBitmap.
  function abrirComElementoImg(arquivo) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(arquivo);
      var img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        resolve({
          fonte: img,
          largura: img.naturalWidth,
          altura: img.naturalHeight,
          fechar: function () {}
        });
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('Não foi possível ler a imagem.'));
      };
      img.src = url;
    });
  }

  /**
   * Abre a imagem já aplicando a orientação EXIF (fotos de celular em pé
   * continuam em pé). Retorna { fonte, largura, altura, fechar }.
   */
  function abrirImagem(arquivo) {
    if (window.createImageBitmap) {
      return createImageBitmap(arquivo, { imageOrientation: 'from-image' })
        .then(function (bitmap) {
          return {
            fonte: bitmap,
            largura: bitmap.width,
            altura: bitmap.height,
            fechar: function () { bitmap.close(); }
          };
        })
        .catch(function () {
          return abrirComElementoImg(arquivo);
        });
    }
    return abrirComElementoImg(arquivo);
  }

  /**
   * Desenha a imagem num canvas menor (nunca amplia) e devolve um data URL.
   * JPEG recebe fundo branco para não ficar preto onde havia transparência.
   */
  function redimensionar(imagem, ladoMax, tipoSaida, qualidade) {
    var escala = Math.min(1, ladoMax / Math.max(imagem.largura, imagem.altura));
    var largura = Math.max(1, Math.round(imagem.largura * escala));
    var altura = Math.max(1, Math.round(imagem.altura * escala));

    var canvas = document.createElement('canvas');
    canvas.width = largura;
    canvas.height = altura;
    var ctx = canvas.getContext('2d');
    if (tipoSaida === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, largura, altura);
    }
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(imagem.fonte, 0, 0, largura, altura);
    var dataUrl = canvas.toDataURL(tipoSaida, qualidade);

    // Libera a memória do canvas.
    canvas.width = 0;
    canvas.height = 0;
    return { dataUrl: dataUrl, largura: largura, altura: altura };
  }

  /**
   * Foto: duas versões para o PDF (Normal, até 1600 px, e Alta, até 2400 px),
   * preparadas no envio para que a qualidade possa ser trocada a qualquer
   * momento, + miniatura de 160 px para a lista.
   */
  function processarFoto(arquivo) {
    return abrirImagem(arquivo).then(function (imagem) {
      try {
        var normal = redimensionar(imagem, FOTO.ladoMax, 'image/jpeg', FOTO.qualidade);
        var alta = redimensionar(imagem, FOTO_ALTA.ladoMax, 'image/jpeg', FOTO_ALTA.qualidade);
        var pequena = redimensionar(imagem, MINIATURA.ladoMax, 'image/jpeg', MINIATURA.qualidade);
        return {
          dataUrl: normal.dataUrl,
          dataUrlAlta: alta.dataUrl,
          largura: normal.largura,
          altura: normal.altura,
          miniatura: pequena.dataUrl
        };
      } finally {
        imagem.fechar();
      }
    });
  }

  window.Imagens = {
    validarArquivo: validarArquivo,
    processarFoto: processarFoto
  };
})();
