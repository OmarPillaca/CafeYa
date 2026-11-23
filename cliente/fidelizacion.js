/* ============================================================
   CafeYa Ica - Tarjeta de cliente frecuente
   ============================================================ */
(function () {
  'use strict';

  let contenido = null;

  function render() {
    const usuario = window.Auth.usuarioActual();
    if (!usuario) return;
    const tarjeta = window.Fidelizacion.tarjeta(usuario.id);
    const compras = window.Pedidos.porUsuario(usuario.id).filter(function (p) {
      return p.estado === 'entregado' && p.estadoPago === 'aprobado';
    }).sort(function (a, b) {
      return new Date(b.entregadoEn || b.creadoEn) - new Date(a.entregadoEn || a.creadoEn);
    });

    let slots = '';
    for (let i = 1; i <= 5; i++) {
      const lleno = i <= tarjeta.enTarjeta;
      const premio = i === 5;
      slots += '<div class="fid-slot' + (lleno ? ' lleno' : '') + (lleno && premio ? ' regalo' : '') + '">' +
        (lleno ? (premio ? '🎁' : '☕') : '★') +
        (lleno ? '<small>' + (premio ? 'Bebida gratis' : 'Compra') + '</small>' : '') +
      '</div>';
    }

    contenido.innerHTML =
      '<div class="fid-grid">' +
        '<div>' +
          '<div class="fid-tarjeta">' +
            '<div class="fid-tarjeta-cabeza">' +
              '<div><span>CaféYa · Cliente frecuente</span>' +
                '<strong>' + window.Util.esc(usuario.nombre) + '</strong>' +
                '<small>Tarjeta digital · ' + window.Util.esc(usuario.correo) + '</small></div>' +
              '<div class="fid-logo">☕</div>' +
            '</div>' +
            '<div class="fid-slots">' + slots + '</div>' +
            '<div class="fid-progreso">' +
              '<div class="progress"><span style="width:' + tarjeta.progreso + '%"></span></div>' +
              '<div class="etiqueta"><span>' + tarjeta.enTarjeta + ' de 5 compras en esta tarjeta</span>' +
                '<span>' + tarjeta.progreso + '%</span></div>' +
            '</div>' +
            '<div class="fid-tarjeta-pie"><span>Compras válidas acumuladas</span><strong>' + tarjeta.compras + '</strong></div>' +
            (tarjeta.beneficioDisponible
              ? '<div class="fid-beneficio"><span style="font-size:20px">🎁</span><div><strong>¡Tienes un beneficio disponible!</strong>' +
                'Completaste ' + tarjeta.completadas + ' tarjeta(s). El canje de la bebida gratuita se habilitará en la siguiente fase del proyecto.</div></div>'
              : '<div class="fid-beneficio"><span style="font-size:20px">⭐</span><div><strong>Te faltan ' + tarjeta.pendientes + ' compra(s)</strong>' +
                'Cada pedido entregado y pagado suma un espacio en tu tarjeta.</div></div>') +
          '</div>' +

          '<div class="grid grid-3 mt-2">' +
            '<div class="stat"><div class="stat-icono">' + window.Util.svg('fidelizacion') + '</div>' +
              '<div class="stat-valor">' + tarjeta.compras + '</div><div class="stat-etiqueta">Compras acumuladas</div></div>' +
            '<div class="stat menta"><div class="stat-icono">' + window.Util.svg('check') + '</div>' +
              '<div class="stat-valor">' + tarjeta.completadas + '</div><div class="stat-etiqueta">Tarjetas completadas</div></div>' +
            '<div class="stat terracota"><div class="stat-icono">' + window.Util.svg('promocion') + '</div>' +
              '<div class="stat-valor">' + tarjeta.beneficios + '</div><div class="stat-etiqueta">Beneficios disponibles</div></div>' +
          '</div>' +
        '</div>' +

        '<div>' +
          '<div class="card fid-info">' +
            '<h3>¿Cómo funciona?</h3>' +
            '<p>1. Realiza un pedido y completa el pago demostrativo.<br>' +
              '2. Cuando el pedido se marca como <strong>entregado</strong>, la compra ocupa un espacio.<br>' +
              '3. Al completar <strong>5 compras</strong> se habilita el beneficio de una bebida gratuita.<br>' +
              '4. El canje real se gestionará en una fase posterior del proyecto.</p>' +
            '<div class="alerta aviso"><span class="alerta-icono">ℹ️</span><div><strong>Alcance de esta versión</strong>' +
              'La tarjeta se actualiza automáticamente, pero el canje permanece como función futura según el documento del proyecto.</div></div>' +
            '<a class="btn btn-primario btn-block mt-2" href="menu.html">Seguir acumulando compras</a>' +
          '</div>' +

          '<div class="card mt-2 fid-historial">' +
            '<div class="card-head"><div class="card-titulo"><div class="card-icono">' + window.Util.svg('pedidos') + '</div>' +
              '<div><h2>Compras que suman</h2><p>Pedidos entregados y pagados</p></div></div></div>' +
            (compras.length
              ? compras.map(function (pedido) {
                  return '<div class="historial-item"><div class="cabeza"><h4>' + window.Util.esc(pedido.codigo) + '</h4>' +
                    '<span class="small muted">' + window.Util.fechaHora(pedido.entregadoEn || pedido.creadoEn) + '</span></div>' +
                    '<p>' + window.Util.esc((pedido.items || []).map(function (i) { return i.cantidad + 'x ' + i.nombre; }).join(' · ')) + '</p>' +
                    '<div class="flex-between mt-1"><span class="small muted">' + window.Util.metodoPago(pedido.metodoPago) + '</span>' +
                      '<strong class="color-azul">' + window.Util.soles(pedido.total) + '</strong></div></div>';
                }).join('')
              : window.Util.vacio('Aún no hay compras válidas', 'Realiza tu primer pedido para estrenar tu tarjeta.')) +
          '</div>' +
        '</div>' +
      '</div>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    contenido = window.Shell.cliente({
      pagina: 'fidelizacion',
      titulo: 'Cliente frecuente',
      subtitulo: '5 compras = 1 bebida gratuita'
    });
    if (!contenido) return;
    render();
    window.Almacen.alCambiar(window.Util.debounce(render, 400));
  });
})();
