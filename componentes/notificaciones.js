/* ============================================================
   CafeYa Ica - Componente de notificaciones y avisos
   ============================================================ */
(function () {
  'use strict';

  const ICONOS = { exito: '✅', error: '⚠️', aviso: '🔔', info: '💬' };

  function zona() {
    let contenedor = document.getElementById('cafeya-toasts');
    if (!contenedor) {
      contenedor = document.createElement('div');
      contenedor.id = 'cafeya-toasts';
      contenedor.className = 'toast-zona';
      contenedor.setAttribute('aria-live', 'polite');
      document.body.appendChild(contenedor);
    }
    return contenedor;
  }

  function mostrar(titulo, mensaje, tipo) {
    const clase = ['exito', 'error', 'aviso', 'info'].indexOf(tipo) > -1 ? tipo : 'info';
    const aviso = document.createElement('div');
    aviso.className = 'toast ' + clase;
    aviso.innerHTML =
      '<span class="toast-icono">' + ICONOS[clase] + '</span>' +
      '<div class="grow"><div class="toast-titulo">' + window.Util.esc(titulo) + '</div>' +
      (mensaje ? '<div class="toast-texto">' + window.Util.esc(mensaje) + '</div>' : '') + '</div>' +
      '<button class="modal-cerrar" style="width:24px;height:24px;font-size:11px" aria-label="Cerrar aviso">✕</button>';
    zona().appendChild(aviso);
    function cerrar() {
      if (!aviso.parentNode) return;
      aviso.classList.add('saliendo');
      setTimeout(function () { if (aviso.parentNode) aviso.parentNode.removeChild(aviso); }, 260);
    }
    aviso.querySelector('button').addEventListener('click', cerrar);
    setTimeout(cerrar, 4500);
    return aviso;
  }

  function push(titulo, mensaje, tipo) {
    try {
      const lista = window.Almacen.leer('notificaciones', []) || [];
      lista.unshift({
        id: window.Util.id('nt'),
        titulo: titulo,
        mensaje: mensaje || '',
        tipo: tipo || 'info',
        fecha: new Date().toISOString(),
        leida: false
      });
      window.Almacen.escribir('notificaciones', lista.slice(0, 40));
    } catch (error) {
      console.warn('CafeYa: no se pudo registrar la notificación', error);
    }
  }

  function listar() {
    return (window.Almacen.leer('notificaciones', []) || []).slice().sort(function (a, b) {
      return new Date(b.fecha) - new Date(a.fecha);
    });
  }

  function noLeidas() {
    return listar().filter(function (n) { return !n.leida; }).length;
  }

  function marcarLeidas() {
    const lista = listar().map(function (n) { return Object.assign({}, n, { leida: true }); });
    window.Almacen.escribir('notificaciones', lista);
    const punto = document.getElementById('punto-notif');
    if (punto) punto.style.display = 'none';
  }

  window.Notificaciones = {
    mostrar: mostrar,
    exito: function (titulo, mensaje) { return mostrar(titulo, mensaje, 'exito'); },
    error: function (titulo, mensaje) { return mostrar(titulo, mensaje, 'error'); },
    aviso: function (titulo, mensaje) { return mostrar(titulo, mensaje, 'aviso'); },
    info: function (titulo, mensaje) { return mostrar(titulo, mensaje, 'info'); },
    push: push,
    listar: listar,
    noLeidas: noLeidas,
    marcarLeidas: marcarLeidas
  };
})();
