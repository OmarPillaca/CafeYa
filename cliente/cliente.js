/* ============================================================
   CafeYa Ica - Panel principal del cliente
   ============================================================ */
(function () {
  'use strict';

  const PASOS = [
    ['recibido', 'Recibido', 'Pedido confirmado'],
    ['preparacion', 'En preparación', 'En barra'],
    ['listo', 'Listo para recoger', 'Recojo en barra']
  ];
  const INDICE = { recibido: 0, preparacion: 1, listo: 2, entregado: 3 };

  function pasosHTML(estado) {
    const actual = INDICE[estado] === undefined ? 0 : INDICE[estado];
    return '<div class="pasos">' + PASOS.map(function (paso, indice) {
      const clase = (indice < actual ? ' completado' : '') + (indice === actual ? ' actual' : '');
      return '<div class="paso' + clase + '"><strong>' + paso[1] + '</strong><span>' + paso[2] + '</span></div>';
    }).join('') + '</div>';
  }

  function slotsHTML(tarjeta) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
      html += '<div class="' + (i <= tarjeta.enTarjeta ? 'lleno' : '') + '">' + (i <= tarjeta.enTarjeta ? '☕' : '★') + '</div>';
    }
    return html;
  }

  document.addEventListener('DOMContentLoaded', function () {
    const contenedor = window.Shell.cliente({
      pagina: 'cliente',
      titulo: 'Mi panel',
      subtitulo: 'Resumen de tu actividad en CaféYa Ica'
    });
    if (!contenedor) return;

    function render() {
      const usuario = window.Auth.usuarioActual();
      if (!usuario) return;
      const pedidos = window.Pedidos.porUsuario(usuario.id);
      const activo = pedidos.find(function (p) {
        return ['recibido', 'preparacion', 'listo'].indexOf(p.estado) > -1;
      });
      const tarjeta = window.Fidelizacion.tarjeta(usuario.id);
      const reservas = window.Reservas.porUsuario(usuario.id).filter(function (r) {
        return r.estado !== 'cancelada' && r.fecha >= window.Util.hoyISO();
      });
      const aprobados = pedidos.filter(function (p) {
        return p.estado !== 'cancelado' && p.estadoPago === 'aprobado';
      });
      const gasto = window.Util.sumar(aprobados, 'total');
      const sugerencias = window.Almacen.listar('sugerencias').filter(function (s) {
        return s.usuarioId === usuario.id;
      });
      const nombreCorto = String(usuario.nombre).split(' ')[0];

      contenedor.innerHTML =
        '<section class="panel-bienvenida">' +
          '<div><span class="panel-etiqueta">' + window.Util.hoyTexto() + '</span>' +
            '<h1 class="display">Hola, ' + window.Util.esc(nombreCorto) + ' ☕</h1>' +
            '<p>' + window.Util.esc(usuario.preferencia ? 'Sabemos que disfrutas ' + usuario.preferencia.toLowerCase() + '. ' : '') +
            'Revisa tus pedidos, reserva tu mesa de estudio y acumula compras para tu bebida gratuita.</p>' +
            '<div class="flex-wrap">' +
              '<a class="btn btn-primario" href="menu.html">Pedir para recoger</a>' +
              '<a class="btn btn-claro" href="reserva.html">Reservar mesa</a>' +
            '</div>' +
          '</div>' +
          '<div class="panel-bienvenida-tarjeta">' +
            '<span>CLIENTE FRECUENTE</span>' +
            '<div class="mini-slots">' + slotsHTML(tarjeta) + '</div>' +
            '<strong>' + tarjeta.enTarjeta + ' de 5 compras · ' + tarjeta.completadas + ' tarjeta(s) completa(s)</strong>' +
            '<a href="fidelizacion.html">Ver mi tarjeta →</a>' +
          '</div>' +
        '</section>' +

        '<div class="grid grid-4 mt-2">' +
          '<div class="stat"><div class="stat-icono">' + window.Util.svg('pedidos') + '</div>' +
            '<div class="stat-valor">' + pedidos.length + '</div><div class="stat-etiqueta">Pedidos realizados</div></div>' +
          '<div class="stat menta"><div class="stat-icono">' + window.Util.svg('pagos') + '</div>' +
            '<div class="stat-valor">' + window.Util.soles(gasto) + '</div><div class="stat-etiqueta">Consumo acumulado</div></div>' +
          '<div class="stat terracota"><div class="stat-icono">' + window.Util.svg('fidelizacion') + '</div>' +
            '<div class="stat-valor">' + tarjeta.compras + '</div><div class="stat-etiqueta">Compras en tarjeta</div></div>' +
          '<div class="stat azul"><div class="stat-icono">' + window.Util.svg('calendario') + '</div>' +
            '<div class="stat-valor">' + reservas.length + '</div><div class="stat-etiqueta">Reservas próximas</div></div>' +
        '</div>' +

        '<div class="dos-columnas mt-2">' +
          '<div class="card">' +
            '<div class="card-head"><div class="card-titulo"><div class="card-icono">' + window.Util.svg('reloj') + '</div>' +
              '<div><h2>Pedido en curso</h2><p>Sigue el avance de tu preparación</p></div></div>' +
              (activo ? window.Util.badge(activo.estado) : '') + '</div>' +
            (activo
              ? '<div class="panel-pedido-activo">' +
                  '<div class="flex-between"><span class="codigo">' + window.Util.esc(activo.codigo) + '</span>' +
                    '<span class="small muted">' + (activo.modalidad === 'mesa' ? 'Consumo en mesa' : 'Recojo ' + (activo.horaRecojoTexto || '—')) + '</span></div>' +
                  '<div class="productos">' + (activo.items || []).map(function (i) { return i.cantidad + 'x ' + i.nombre; }).join(' · ') + '</div>' +
                  pasosHTML(activo.estado) +
                  '<div class="flex-between mt-2"><span class="small muted">Total ' + window.Util.soles(activo.total) + ' · ' + window.Util.etiqueta(activo.estadoPago) + '</span>' +
                    '<a class="btn btn-sm btn-teal" href="seguimiento.html?codigo=' + encodeURIComponent(activo.codigo) + '">Ver seguimiento</a></div>' +
                '</div>'
              : '<div class="panel-pedido-vacio"><div class="icono">' + window.Util.svg('cafe') + '</div>' +
                  '<h3>No tienes pedidos en curso</h3><p>Explora el menú y elige tu próximo café.</p>' +
                  '<a class="btn btn-primario btn-sm" href="menu.html">Abrir el menú</a></div>') +
          '</div>' +
          '<div class="card">' +
            '<div class="card-head"><div class="card-titulo"><div class="card-icono">' + window.Util.svg('menu') + '</div>' +
              '<div><h2>Accesos rápidos</h2><p>Todo lo que necesitas en un clic</p></div></div></div>' +
            '<div class="accesos-mini">' +
              accesos.map(function (acceso) {
                return '<a class="acceso-mini" href="' + acceso[0] + '">' + window.Util.svg(acceso[1]) + '<span>' + acceso[2] + '</span></a>';
              }).join('') +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="dos-columnas mt-2">' +
          '<div class="card">' +
            '<div class="card-head"><div class="card-titulo"><div class="card-icono">' + window.Util.svg('pedidos') + '</div>' +
              '<div><h2>Últimos pedidos</h2><p>Tus compras más recientes</p></div></div>' +
              '<a class="btn btn-claro btn-sm" href="historial.html">Ver historial</a></div>' +
            (pedidos.length
              ? '<div class="tabla-wrap"><table class="tabla"><thead><tr><th>Código</th><th>Fecha</th><th>Total</th><th>Estado</th><th></th></tr></thead><tbody>' +
                pedidos.slice(0, 4).map(function (p) {
                  return '<tr><td class="principal">' + window.Util.esc(p.codigo) + '</td>' +
                    '<td>' + window.Util.fecha(p.creadoEn) + '</td>' +
                    '<td>' + window.Util.soles(p.total) + '</td>' +
                    '<td>' + window.Util.badge(p.estado) + '</td>' +
                    '<td><a class="btn btn-sm btn-claro" href="seguimiento.html?codigo=' + encodeURIComponent(p.codigo) + '">Ver</a></td></tr>';
                }).join('') + '</tbody></table></div>'
              : window.Util.vacio('Aún no tienes pedidos', 'Tu primer pedido te dará tu primer espacio en la tarjeta.')) +
          '</div>' +
          '<div class="card">' +
            '<div class="card-head"><div class="card-titulo"><div class="card-icono">' + window.Util.svg('calendario') + '</div>' +
              '<div><h2>Próximas reservas</h2><p>Mesas confirmadas y pendientes</p></div></div>' +
              '<a class="btn btn-claro btn-sm" href="reserva.html">Gestionar</a></div>' +
            (reservas.length
              ? '<div class="lista-reservas">' + reservas.slice(0, 3).map(function (r) {
                  const mesa = window.Almacen.buscar('mesas', r.mesaId) || {};
                  const fecha = new Date(r.fecha + 'T12:00:00');
                  return '<div class="reserva-mini"><div class="fecha"><strong>' + fecha.getDate() + '</strong>' +
                    '<span>' + fecha.toLocaleDateString('es-PE', { month: 'short' }).replace('.', '') + '</span></div>' +
                    '<div class="grow"><h4>Mesa ' + window.Util.esc(mesa.numero || r.numeroMesa || '—') + ' · ' + r.hora + '</h4>' +
                    '<p>' + r.personas + ' personas · ' + window.Util.esc(mesa.zona || 'Salón') + '</p></div>' +
                    window.Util.badge(r.estado) + '</div>';
                }).join('') + '</div>'
              : window.Util.vacio('Sin reservas próximas', 'Reserva una mesa con Wi-Fi y enchufe desde el mapa.')) +
            (sugerencias.length
              ? '<div class="alerta mt-2"><span class="alerta-icono">💬</span><div><strong>Tu opinión nos ayuda</strong>' +
                'Has enviado ' + sugerencias.length + ' sugerencia(s). Gracias por ayudarnos a mejorar.</div></div>'
              : '') +
          '</div>' +
        '</div>';

      /* accesos declarados después para evitar hoisting confuso */
    }

    const accesos = [
      ['menu.html', 'cafe', 'Menú digital'],
      ['carrito.html', 'carrito', 'Mi carrito'],
      ['seguimiento.html', 'reloj', 'Seguimiento'],
      ['mesas.html', 'qr', 'Mesas y QR'],
      ['mesa-compartida.html', 'compartir', 'Mesa compartida'],
      ['sugerencias.html', 'sugerencias', 'Sugerencias']
    ];

    render();
    window.Almacen.alCambiar(window.Util.debounce(render, 400));
  });
})();
