/* Conversor de Fotos para Relatório em PDF – lógica da interface
 *
 * Mantém o estado do relatório em um único objeto, em memória, e liga os
 * campos, a lista de fotos e os botões. A montagem do PDF fica em js/pdf.js
 * e o tratamento das fotos em js/imagens.js.
 */
(function () {
  'use strict';

  // ---------- Estado único da aplicação ----------
  var estado = {
    logo: null,              // { dataUrl, largura, altura } – opcional; null = relatório sem logo
    titulo: '',
    subtitulo: '',
    dataInicial: '',
    dataFinal: '',
    fotos: [],               // { id, nome, dataUrl, miniatura, largura, altura, titulo }
    fotosPorPagina: 1,
    tituloProximos: '',
    proximosPassos: ''
  };

  var proximoId = 1;
  var processando = false;

  function porId(id) { return document.getElementById(id); }

  var el = {
    logoImg: porId('logo-img'),
    logoVazio: porId('logo-vazio'),
    botaoTrocarLogo: porId('botao-trocar-logo'),
    botaoRemoverLogo: porId('botao-remover-logo'),
    entradaLogo: porId('entrada-logo'),
    mensagensCabecalho: porId('mensagens-cabecalho'),
    titulo: porId('titulo'),
    subtitulo: porId('subtitulo'),
    dataInicial: porId('data-inicial'),
    dataFinal: porId('data-final'),
    areaEnvio: porId('area-envio'),
    entradaFotos: porId('entrada-fotos'),
    progresso: porId('progresso'),
    mensagensFotos: porId('mensagens-fotos'),
    contador: porId('contador'),
    botaoRemoverTodas: porId('botao-remover-todas'),
    listaFotos: porId('lista-fotos'),
    vazio: porId('lista-vazia'),
    tituloProximos: porId('titulo-proximos'),
    proximosPassos: porId('proximos-passos'),
    botaoVisualizar: porId('botao-visualizar'),
    botaoGerar: porId('botao-gerar'),
    mensagensAcoes: porId('mensagens-acoes')
  };

  // ---------- Mensagens para o usuário ----------
  // tipo: 'erro' | 'alerta' | 'ok'
  function mostrarMensagens(container, lista) {
    container.textContent = '';
    lista.forEach(function (m) {
      var div = document.createElement('div');
      div.className = 'aviso aviso-' + m.tipo;
      var texto = document.createElement('span');
      texto.textContent = m.texto;
      var fechar = document.createElement('button');
      fechar.type = 'button';
      fechar.className = 'aviso-fechar';
      fechar.textContent = '✕';
      fechar.setAttribute('aria-label', 'Fechar aviso');
      fechar.addEventListener('click', function () { div.remove(); });
      div.appendChild(texto);
      div.appendChild(fechar);
      container.appendChild(div);
    });
  }

  function limparMensagens(container) {
    container.textContent = '';
  }

  // ---------- Logo ----------
  // O logo é opcional: sem logo, a prévia mostra "Sem logo" e o PDF começa pelo título.
  function atualizarLogo() {
    var temLogo = !!estado.logo;
    if (temLogo) {
      el.logoImg.src = estado.logo.dataUrl;
    } else {
      el.logoImg.removeAttribute('src');
    }
    el.logoImg.hidden = !temLogo;
    el.logoVazio.hidden = temLogo;
    el.botaoTrocarLogo.textContent = temLogo ? 'Trocar logo' : 'Adicionar logo';
    el.botaoRemoverLogo.disabled = !temLogo;
  }

  function trocarLogo(arquivo) {
    limparMensagens(el.mensagensCabecalho);
    var erro = window.Imagens.validarArquivo(arquivo);
    if (erro) {
      mostrarMensagens(el.mensagensCabecalho, [{ tipo: 'erro', texto: erro }]);
      return;
    }
    window.Imagens.processarLogo(arquivo).then(function (logo) {
      estado.logo = logo;
      atualizarLogo();
    }).catch(function () {
      mostrarMensagens(el.mensagensCabecalho, [{
        tipo: 'erro',
        texto: 'Não foi possível abrir "' + arquivo.name + '". O arquivo pode estar corrompido.'
      }]);
    });
  }

  // ---------- Lista de fotos ----------
  function criarBotaoIcone(acao, texto, titulo, desabilitado, perigo) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'botao-icone' + (perigo ? ' botao-perigo' : '');
    b.textContent = texto;
    b.title = titulo;
    b.setAttribute('aria-label', titulo);
    b.setAttribute('data-acao', acao);
    b.disabled = !!desabilitado;
    return b;
  }

  function criarItemFoto(foto, indice, total) {
    var li = document.createElement('li');
    li.className = 'item-foto';
    li.setAttribute('data-id', foto.id);

    var ordem = document.createElement('span');
    ordem.className = 'ordem';
    ordem.textContent = indice + 1;

    var img = document.createElement('img');
    img.src = foto.miniatura;
    img.alt = 'Miniatura da foto ' + (indice + 1);

    var campo = document.createElement('div');
    campo.className = 'campo';
    var rotulo = document.createElement('label');
    rotulo.htmlFor = 'foto-titulo-' + foto.id;
    rotulo.textContent = 'Título da foto';
    var entrada = document.createElement('input');
    entrada.type = 'text';
    entrada.id = 'foto-titulo-' + foto.id;
    entrada.placeholder = 'Sem título';
    entrada.value = foto.titulo;
    entrada.addEventListener('input', function () { foto.titulo = entrada.value; });
    campo.appendChild(rotulo);
    campo.appendChild(entrada);

    var acoes = document.createElement('div');
    acoes.className = 'item-acoes';
    acoes.appendChild(criarBotaoIcone('subir', '↑', 'Mover para cima', indice === 0, false));
    acoes.appendChild(criarBotaoIcone('descer', '↓', 'Mover para baixo', indice === total - 1, false));
    acoes.appendChild(criarBotaoIcone('remover', '✕', 'Remover foto', false, true));

    li.appendChild(ordem);
    li.appendChild(img);
    li.appendChild(campo);
    li.appendChild(acoes);
    return li;
  }

  // focoId/focoAcao: devolve o foco ao botão usado, depois de redesenhar a lista.
  function renderizarFotos(focoId, focoAcao) {
    var total = estado.fotos.length;
    el.listaFotos.textContent = '';
    estado.fotos.forEach(function (foto, i) {
      el.listaFotos.appendChild(criarItemFoto(foto, i, total));
    });

    el.contador.textContent = total === 0 ? 'Nenhuma foto' : (total === 1 ? '1 foto' : total + ' fotos');
    el.botaoRemoverTodas.hidden = (total === 0);
    el.vazio.hidden = (total !== 0);

    if (focoId) {
      var base = el.listaFotos.querySelector('[data-id="' + focoId + '"]');
      if (base) {
        var botao = base.querySelector('[data-acao="' + focoAcao + '"]');
        if (!botao || botao.disabled) {
          botao = base.querySelector('input');
        }
        if (botao) { botao.focus(); }
      }
    }
  }

  function indiceDaFoto(id) {
    for (var i = 0; i < estado.fotos.length; i++) {
      if (estado.fotos[i].id === id) { return i; }
    }
    return -1;
  }

  function moverFoto(id, deslocamento) {
    var i = indiceDaFoto(id);
    var j = i + deslocamento;
    if (i < 0 || j < 0 || j >= estado.fotos.length) { return; }
    var tmp = estado.fotos[i];
    estado.fotos[i] = estado.fotos[j];
    estado.fotos[j] = tmp;
    renderizarFotos(id, deslocamento < 0 ? 'subir' : 'descer');
  }

  function removerFoto(id) {
    var i = indiceDaFoto(id);
    if (i < 0) { return; }
    estado.fotos.splice(i, 1);
    // Foco vai para a foto que ocupou o lugar da removida (ou a anterior).
    var vizinha = estado.fotos[i] || estado.fotos[i - 1];
    renderizarFotos(vizinha ? vizinha.id : null, 'remover');
  }

  function removerTodas() {
    var total = estado.fotos.length;
    if (total === 0) { return; }
    var pergunta = total === 1 ? 'Remover a foto da lista?' : 'Remover todas as ' + total + ' fotos da lista?';
    if (!window.confirm(pergunta)) { return; }
    estado.fotos = [];
    limparMensagens(el.mensagensFotos);
    renderizarFotos();
  }

  // ---------- Envio de fotos ----------
  function textoFotos(n) { return n === 1 ? '1 foto' : n + ' fotos'; }

  // Processa um arquivo por vez para não estourar a memória com muitas fotos.
  function adicionarFotos(arquivos) {
    var lista = Array.prototype.slice.call(arquivos || []);
    if (lista.length === 0) { return Promise.resolve(); }

    if (processando) {
      mostrarMensagens(el.mensagensFotos, [{
        tipo: 'alerta',
        texto: 'Aguarde: ainda estou processando as fotos anteriores.'
      }]);
      return Promise.resolve();
    }

    processando = true;
    limparMensagens(el.mensagensFotos);
    var avisos = [];
    var adicionadas = 0;

    function proxima(i) {
      if (i >= lista.length) { return Promise.resolve(); }
      var arquivo = lista[i];
      el.progresso.hidden = false;
      el.progresso.textContent = 'Processando foto ' + (i + 1) + ' de ' + lista.length + '…';

      var erro = window.Imagens.validarArquivo(arquivo);
      if (erro) {
        avisos.push({ tipo: 'erro', texto: erro });
        return proxima(i + 1);
      }
      return window.Imagens.processarFoto(arquivo).then(function (resultado) {
        estado.fotos.push({
          id: 'f' + (proximoId++),
          nome: arquivo.name,
          dataUrl: resultado.dataUrl,
          miniatura: resultado.miniatura,
          largura: resultado.largura,
          altura: resultado.altura,
          titulo: ''
        });
        adicionadas++;
      }).catch(function () {
        avisos.push({
          tipo: 'erro',
          texto: '"' + arquivo.name + '": não foi possível abrir a imagem. O arquivo pode estar corrompido.'
        });
      }).then(function () {
        return proxima(i + 1);
      });
    }

    return proxima(0).then(function () {
      processando = false;
      el.progresso.hidden = true;
      renderizarFotos();
      var mensagens = [];
      if (adicionadas > 0) {
        mensagens.push({
          tipo: 'ok',
          texto: textoFotos(adicionadas) + (adicionadas === 1 ? ' adicionada.' : ' adicionadas.')
        });
      }
      mostrarMensagens(el.mensagensFotos, mensagens.concat(avisos));
    });
  }

  // ---------- Validação antes de gerar ----------
  function validar() {
    var erros = [];
    var avisos = [];
    if (estado.fotos.length === 0) {
      erros.push('Adicione pelo menos uma foto antes de gerar o PDF.');
    }
    if (estado.titulo.trim() === '') {
      avisos.push('O título do relatório está vazio. O PDF pode ser gerado mesmo assim.');
    }
    return { ok: erros.length === 0, erros: erros, avisos: avisos };
  }

  // ---------- Geração do PDF ----------
  var urlVisualizacaoAnterior = null;

  // modo: 'visualizar' (abre em nova aba) ou 'baixar' (salva o arquivo)
  function gerarPdf(modo) {
    if (processando) {
      mostrarMensagens(el.mensagensAcoes, [{
        tipo: 'alerta',
        texto: 'Aguarde terminar de processar as fotos antes de gerar o PDF.'
      }]);
      return;
    }

    var r = validar();
    var mensagens = [];
    r.erros.forEach(function (t) { mensagens.push({ tipo: 'erro', texto: t }); });
    if (!r.ok) {
      mostrarMensagens(el.mensagensAcoes, mensagens);
      return;
    }
    r.avisos.forEach(function (t) { mensagens.push({ tipo: 'alerta', texto: t }); });

    try {
      var doc = window.GeradorPDF.criarDocumento(estado);
      var nome = window.GeradorPDF.nomeArquivo(estado);

      if (modo === 'visualizar') {
        var url = doc.output('bloburl');
        var aba = window.open(url, '_blank');
        if (urlVisualizacaoAnterior) { URL.revokeObjectURL(urlVisualizacaoAnterior); }
        urlVisualizacaoAnterior = url;
        if (aba) {
          mensagens.push({ tipo: 'ok', texto: 'PDF aberto em uma nova aba.' });
        } else {
          mensagens.push({
            tipo: 'alerta',
            texto: 'O navegador bloqueou a nova aba. Permita pop-ups para esta página ou use "Gerar PDF" para baixar o arquivo.'
          });
        }
      } else {
        doc.save(nome);
        mensagens.push({ tipo: 'ok', texto: 'PDF gerado: ' + nome });
      }
    } catch (e) {
      mensagens.push({
        tipo: 'erro',
        texto: 'Não foi possível gerar o PDF: ' + (e && e.message ? e.message : e)
      });
    }
    mostrarMensagens(el.mensagensAcoes, mensagens);
  }

  // ---------- Ligação dos eventos ----------
  function ligarCampos() {
    // Os campos podem voltar preenchidos (o navegador restaura ao recarregar),
    // então o estado é lido da tela antes de ligar os eventos.
    estado.titulo = el.titulo.value;
    estado.subtitulo = el.subtitulo.value;
    estado.dataInicial = el.dataInicial.value;
    estado.dataFinal = el.dataFinal.value;
    estado.tituloProximos = el.tituloProximos.value;
    estado.proximosPassos = el.proximosPassos.value;
    var marcada = document.querySelector('input[name="fotos-por-pagina"]:checked');
    estado.fotosPorPagina = marcada ? parseInt(marcada.value, 10) : 1;

    el.titulo.addEventListener('input', function () { estado.titulo = el.titulo.value; });
    el.subtitulo.addEventListener('input', function () { estado.subtitulo = el.subtitulo.value; });
    el.dataInicial.addEventListener('input', function () { estado.dataInicial = el.dataInicial.value; });
    el.dataFinal.addEventListener('input', function () { estado.dataFinal = el.dataFinal.value; });
    el.tituloProximos.addEventListener('input', function () { estado.tituloProximos = el.tituloProximos.value; });
    el.proximosPassos.addEventListener('input', function () { estado.proximosPassos = el.proximosPassos.value; });

    Array.prototype.forEach.call(document.querySelectorAll('input[name="fotos-por-pagina"]'), function (radio) {
      radio.addEventListener('change', function () {
        if (radio.checked) { estado.fotosPorPagina = parseInt(radio.value, 10); }
      });
    });
  }

  function ligarLogo() {
    el.botaoTrocarLogo.addEventListener('click', function () { el.entradaLogo.click(); });
    el.entradaLogo.addEventListener('change', function () {
      if (el.entradaLogo.files.length > 0) { trocarLogo(el.entradaLogo.files[0]); }
      el.entradaLogo.value = '';
    });
    el.botaoRemoverLogo.addEventListener('click', function () {
      limparMensagens(el.mensagensCabecalho);
      estado.logo = null;
      atualizarLogo();
      el.botaoTrocarLogo.focus();
    });
  }

  function ligarFotos() {
    el.entradaFotos.addEventListener('change', function () {
      var arquivos = Array.prototype.slice.call(el.entradaFotos.files);
      el.entradaFotos.value = '';   // permite escolher o mesmo arquivo de novo
      adicionarFotos(arquivos);
    });

    // Acessível pelo teclado: Enter ou Espaço abrem a escolha de arquivos.
    el.areaEnvio.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.entradaFotos.click();
      }
    });

    // Arrastar e soltar sobre a área de envio.
    ['dragenter', 'dragover'].forEach(function (nome) {
      el.areaEnvio.addEventListener(nome, function (e) {
        e.preventDefault();
        el.areaEnvio.classList.add('arrastando');
      });
    });
    el.areaEnvio.addEventListener('dragleave', function () {
      el.areaEnvio.classList.remove('arrastando');
    });
    el.areaEnvio.addEventListener('drop', function (e) {
      e.preventDefault();
      el.areaEnvio.classList.remove('arrastando');
      adicionarFotos(e.dataTransfer.files);
    });

    // Soltar uma foto fora da área não deve fazer o navegador abri-la e perder o trabalho.
    window.addEventListener('dragover', function (e) { e.preventDefault(); });
    window.addEventListener('drop', function (e) { e.preventDefault(); });

    // Botões ↑ ↓ ✕ de cada foto (delegação de eventos).
    el.listaFotos.addEventListener('click', function (e) {
      var botao = e.target.closest('button[data-acao]');
      if (!botao || botao.disabled) { return; }
      var item = botao.closest('.item-foto');
      var id = item.getAttribute('data-id');
      var acao = botao.getAttribute('data-acao');
      if (acao === 'subir') { moverFoto(id, -1); }
      else if (acao === 'descer') { moverFoto(id, 1); }
      else if (acao === 'remover') { removerFoto(id); }
    });

    el.botaoRemoverTodas.addEventListener('click', removerTodas);
  }

  function ligarAcoes() {
    el.botaoGerar.addEventListener('click', function () { gerarPdf('baixar'); });
    el.botaoVisualizar.addEventListener('click', function () { gerarPdf('visualizar'); });
  }

  // ---------- Início ----------
  ligarCampos();
  ligarLogo();
  ligarFotos();
  ligarAcoes();
  renderizarFotos();
  atualizarLogo();

  // Acesso ao estado para depuração no console (F12) e testes automáticos.
  window.Relatorio = { estado: estado, validar: validar };
})();
