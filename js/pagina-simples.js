/* Páginas simples (404 e privacidade): só mostra o logo fixo no topo. */
(function () {
  'use strict';
  var img = document.getElementById('logo-img');
  if (img && window.LOGO_TECNO) { img.src = window.LOGO_TECNO.dataUrl; }
})();
