/* ============================================================
   CafeYa Ica - Componente de ventanas modales
   ============================================================ */
(function () {
  'use strict';

  let fondo = null;

  function crearFondo() {
    if (fondo) return fondo;
    fondo = document.createElement('div');
    fondo.className = 'modal-fondo';
    fondo.innerHTML = '<div class="modal" role="dialog" aria-modal="true"></div>';
    document.body.appendChild(fondo);
    fondo.addEventListener('mousedown', function (evento) {
      if (evento.target === fondo) cerrar();
    });
    document.addEventListener('keydown', function (evento) {
      if (evento.key === 'Escape') cerrar();
    });
    return fondo;
  }

  function abrir(opciones) {
    const o = opciones || {};
    const contenedor = crearFondo();
    const caja = contenedor.querySelector('.modal');
    caja.className = 'modal ' + (o.tamano || '');
    caja.innerHTML =
      '<div class="modal-cabeza">' +
        (o.emoji ? '<div class="modal-emoji ' + (o.emojiPeligro ? 'peligro' : '') + '">' + o.emoji + '</div>' : '') +
        '<div class="grow"><h3>' + window.Util.esc(o.titulo || '') + '</h3>' +
        (o.subtitulo ? '<p>' + window.Util.esc(o.subtitulo) + '</p>' : '') + '</div>' +
        '<button class="modal-cerrar" type="button" aria-label="Cerrar">✕</button>' +
      '</div>' +
      '<div class="modal-cuerpo">' + (o.cuerpo || '') + '</div>' +
      (o.acciones ? '<div class="modal-pie">' + o.acciones + '</div>' : '');

    caja.querySelector('.modal-cerrar').onclick = cerrar;
    Array.prototype.forEach.call(caja.querySelectorAll('[data-cerrar]'), function (boton) {
      boton.addEventListener('click', cerrar);
    });
    requestAnimationFrame(function () { contenedor.classList.add('abierto'); });
    document.body.style.overflow = 'hidden';
    if (typeof o.alAbrir === 'function') o.alAbrir(caja);
    if (typeof o.alCerrar === 'function') caja.dataset.cerrar = 'si';
    return caja;
  }

  function cerrar() {
    if (!fondo) return;
    const contenedor = fondo;
    contenedor.classList.remove('abierto');
    document.body.style.overflow = '';
    setTimeout(function () {
      if (!contenedor.classList.contains('abierto')) {
        contenedor.remove();
        if (fondo === contenedor) fondo = null;
      }
    }, 240);
  }

  function confirmar(opciones) {
    const o = opciones || {};
    return new Promise(function (resolver) {
      const caja = abrir({
        titulo: o.titulo || 'Confirmar acción',
        subtitulo: o.subtitulo || '',
        emoji: o.emoji || (o.peligro ? '🗑️' : '❓'),
        emojiPeligro: !!o.peligro,
        cuerpo: '<p style="margin:0;color:#555;font-size:14px;line-height:1.6">' + window.Util.esc(o.mensaje || '¿Deseas continuar?') + '</p>',
        acciones: '<button class="btn btn-claro" type="button" data-no>' + window.Util.esc(o.textoCancelar || 'Cancelar') + '</button>' +
          '<button class="btn ' + (o.peligro ? 'btn-peligro' : 'btn-primario') + '" type="button" data-si>' +
          window.Util.esc(o.textoOk || 'Sí, continuar') + '</button>',
        tamano: o.tamano || ''
      });
      caja.querySelector('[data-no]').onclick = function () { cerrar(); resolver(false); };
      caja.querySelector('[data-si]').onclick = function () { cerrar(); resolver(true); };
    });
  }

  function alerta(titulo, mensaje, tipo) {
    return new Promise(function (resolver) {
      abrir({
        titulo: titulo,
        emoji: tipo === 'error' ? '⚠️' : (tipo === 'exito' ? '✅' : '💬'),
        emojiPeligro: tipo === 'error',
        cuerpo: '<p style="margin:0;color:#555;font-size:14px;line-height:1.6">' + window.Util.esc(mensaje || '') + '</p>',
        acciones: '<button class="btn btn-primario" type="button" data-cerrar>Entendido</button>',
        alCerrar: resolver
      });
    });
  }

  function detalleFilas(filas) {
    return '<div>' + (filas || []).map(function (fila) {
      return '<div class="detalle-linea"><span>' + window.Util.esc(fila[0]) + '</span><strong>' + (fila[2] ? fila[1] : window.Util.esc(fila[1])) + '</strong></div>';
    }).join('') + '</div>';
  }

  window.Modal = {
    abrir: abrir,
    cerrar: cerrar,
    confirmar: confirmar,
    alerta: alerta,
    detalleFilas: detalleFilas
  };
})();
