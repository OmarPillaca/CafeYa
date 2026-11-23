/* ============================================================
   CafeYa Ica - Seguimiento del pedido en tiempo real
   ============================================================ */
(function () {
  'use strict';

  const ESTADOS = [
    { estado: 'recibido', titulo: 'Pedido recibido', texto: 'Confirmado y en cola', icono: '📥' },
    { estado: 'preparacion', titulo: 'En preparación', texto: 'Barista trabajando', icono: '👨‍🍳' },
    { estado: 'listo', titulo: 'Listo para recoger', texto: 'Presenta tu código', icono: '✅' }
  ];
  const INDICE = { recibido: 0, preparacion: 1, listo: 2, entregado: 3, cancelado: 3 };

  let contenido = null;
  let firma = '';

  function porcentaje(estado) {
    if (estado === 'recibido') return 33;
    if (estado === 'preparacion') return 66;
    if (estado === 'listo' || estado === 'entregado') return 100;
    return 0;
  }

  function estimado(pedido) {
    const objetivo = window.Almacen.config().tiempoObjetivo || 8;
    if (pedido.estado === 'listo') return { valor: '¡Listo!', detalle: 'Recoge en barra' };
    if (pedido.estado === 'entregado') return { valor: 'Entregado', detalle: 'Pedido completado' };
    if (pedido.estado === 'cancelado') return { valor: 'Cancelado', detalle: 'Pedido anulado' };
    const transcurridos = window.Util.minutosEntre(pedido.creadoEn, new Date());
    const restantes = Math.max(1, objetivo - transcurridos);
    return { valor: '≈ ' + restantes + ' min', detalle: 'Objetivo: ' + objetivo + ' min' };
  }

  function render(forzar) {
    const usuario = window.Auth.usuarioActual();
    if (!usuario) return;
    const pedidos = window.Pedidos.porUsuario(usuario.id);
    const parametros = new URLSearchParams(location.search);
    const codigo = parametros.get('codigo');
    let pedido = codigo ? window.Pedidos.porCodigo(codigo) : null;
    if (!pedido) {
      pedido = pedidos.find(function (p) {
        return ['recibido', 'preparacion', 'listo'].indexOf(p.estado) > -1;
      }) || pedidos[0];
    }

    if (!pedido) {
      contenido.innerHTML = '<div class="card">' + window.Util.vacio('Todavía no tienes pedidos',
        'Cuando confirmes un pedido podrás seguir aquí cada etapa de la preparación.',
        '<a class="btn btn-primario" href="menu.html">Ir al menú</a>') + '</div>';
      return;
    }

    const nuevaFirma = pedido.id + '|' + pedido.estado + '|' + pedido.estadoPago + '|' + (pedido.historial || []).length;
    if (!forzar && nuevaFirma === firma) return;
    firma = nuevaFirma;

    const actual = INDICE[pedido.estado] === undefined ? 0 : INDICE[pedido.estado];
    const eta = estimado(pedido);
    const progreso = porcentaje(pedido.estado);
    const pago = window.Pagos.porPedido(pedido.id);
    const mesa = pedido.mesaId ? window.Almacen.buscar('mesas', pedido.mesaId) : null;
    const items = (pedido.items || []).map(function (item) {
      return '<div class="detalle-item"><span>' + item.cantidad + 'x ' + window.Util.esc(item.nombre) + '</span>' +
        '<strong>' + window.Util.soles(item.precio * item.cantidad) + '</strong></div>';
    }).join('');
    const urlQR = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=6&data=' +
      encodeURIComponent('CAFEYA-DEMO|PEDIDO:' + pedido.codigo + '|CLIENTE:' + pedido.clienteNombre);

    contenido.innerHTML =
      '<div class="seguimiento-grid">' +
        '<div class="card">' +
          '<div class="card-head">' +
            '<div class="card-titulo"><div class="card-icono">' + window.Util.svg('reloj') + '</div>' +
              '<div><h2>Seguimiento del pedido</h2><p>' + window.Util.esc(pedido.modalidad === 'mesa' ? 'Consumo en mesa' : 'Recojo en barra') + '</p></div></div>' +
            (pedidos.length > 1
              ? '<select id="selector-pedido" style="padding:8px 12px;border:1.5px solid var(--borde);border-radius:9px;font-family:inherit">' +
                pedidos.map(function (p) {
                  return '<option value="' + p.codigo + '"' + (p.id === pedido.id ? ' selected' : '') + '>' +
                    p.codigo + ' · ' + window.Util.fecha(p.creadoEn) + ' · ' + window.Util.etiqueta(p.estado) + '</option>';
                }).join('') + '</select>'
              : '') +
          '</div>' +
          '<div class="seguimiento-cabecera">' +
            '<div><span class="small muted">Código de recojo</span><div class="codigo-grande">' + window.Util.esc(pedido.codigo) + '</div>' +
              '<div class="flex-wrap" style="margin-top:6px">' + window.Util.badge(pedido.estado) + window.Util.badge(pedido.estadoPago, 'Pago ' + window.Util.etiqueta(pedido.estadoPago)) + '</div></div>' +
            '<div class="eta-caja"><span>Tiempo estimado</span><strong>' + eta.valor + '</strong><small>' + eta.detalle + '</small></div>' +
          '</div>' +
          '<div class="progress ' + (progreso === 100 ? '' : 'naranja') + '"><span style="width:' + progreso + '%"></span></div>' +
          '<div class="pasos-grandes">' + ESTADOS.map(function (paso, indice) {
            const clase = (indice < actual ? ' completado' : '') + (indice === actual ? ' actual' : '');
            return '<div class="paso-grande' + clase + '"><div class="icono">' + paso.icono + '</div>' +
              '<strong>' + paso.titulo + '</strong><small>' + paso.texto + '</small></div>';
          }).join('') + '</div>' +
          (pedido.estado === 'listo'
            ? '<div class="alerta exito mt-2"><span class="alerta-icono">🔔</span><div><strong>Tu pedido está listo</strong>' +
              'Acércate a barra y presenta el código <strong>' + window.Util.esc(pedido.codigo) + '</strong>.</div></div>'
            : '') +
          (pedido.estado === 'entregado'
            ? '<div class="alerta exito mt-2"><span class="alerta-icono">🎉</span><div><strong>Pedido entregado</strong>' +
              '¡Gracias por tu compra! Esta compra suma en tu tarjeta de cliente frecuente.</div></div>'
            : '') +
          (pedido.estado === 'cancelado'
            ? '<div class="alerta peligro mt-2"><span class="alerta-icono">⚠️</span><div><strong>Pedido cancelado</strong>' +
              'Si fue un error, puedes realizar un nuevo pedido desde el menú.</div></div>'
            : '') +
          (pedido.estadoPago === 'pendiente' && pedido.estado !== 'cancelado'
            ? '<div class="alerta aviso mt-2"><span class="alerta-icono">💳</span><div><strong>Pago pendiente</strong>' +
              'Completa el pago demostrativo para agilizar la preparación.</div></div>' +
              '<a class="btn btn-primario mt-1" href="pago.html?pedido=' + encodeURIComponent(pedido.codigo) + '">Completar pago</a>'
            : '') +
          '<div class="flex-wrap mt-2">' +
            '<a class="btn btn-claro" href="menu.html">Volver al menú</a>' +
            (pedido.estado === 'recibido'
              ? '<button class="btn btn-peligro" type="button" data-cancelar="' + pedido.id + '">Cancelar pedido</button>'
              : '') +
            '<button class="btn btn-claro" type="button" data-actualizar>Actualizar ahora</button>' +
          '</div>' +
        '</div>' +

        '<aside class="card">' +
          '<h3 style="font-size:15px">Detalle del pedido</h3>' +
          '<div class="detalle-item"><span>Fecha</span><strong>' + window.Util.fechaHora(pedido.creadoEn) + '</strong></div>' +
          '<div class="detalle-item"><span>Modalidad</span><strong>' + (pedido.modalidad === 'mesa' ? 'Mesa ' + (mesa ? mesa.numero : '') : 'Para recoger') + '</strong></div>' +
          (pedido.modalidad === 'recojo'
            ? '<div class="detalle-item"><span>Hora de recojo</span><strong>' + window.Util.esc(pedido.horaRecojoTexto || window.Util.hora(pedido.horaRecojo)) + '</strong></div>'
            : '') +
          (pedido.observaciones ? '<div class="detalle-item"><span>Observaciones</span><strong style="max-width:60%;text-align:right">' + window.Util.esc(pedido.observaciones) + '</strong></div>' : '') +
          '<div class="mt-2">' + items + '</div>' +
          '<div class="detalle-item" style="border:none"><span>Subtotal</span><strong>' + window.Util.soles(pedido.subtotal) + '</strong></div>' +
          '<div class="detalle-item" style="border:none;color:var(--menta)"><span>Descuento</span><strong>− ' + window.Util.soles(pedido.descuento) + '</strong></div>' +
          '<div class="total-final"><span>Total</span><strong>' + window.Util.soles(pedido.total) + '</strong></div>' +
          '<div class="detalle-item"><span>Método de pago</span><strong>' + window.Util.metodoPago(pedido.metodoPago) + '</strong></div>' +
          '<div class="detalle-item"><span>Estado del pago</span><strong>' + window.Util.etiqueta(pedido.estadoPago) + '</strong></div>' +
          (pago ? '<div class="detalle-item"><span>Referencia</span><strong>' + window.Util.esc(pago.comprobante) + '</strong></div>' : '') +
          '<div class="qr-seguimiento"><img src="' + urlQR + '" alt="QR del pedido ' + window.Util.esc(pedido.codigo) + '" ' +
            'onerror="this.onerror=null;this.src=\'' + window.Util.placeholder('🧾') + '\'">' +
            '<span>QR demostrativo de recojo</span></div>' +
        '</aside>' +
      '</div>' +

      '<div class="card mt-2">' +
        '<div class="card-head"><div class="card-titulo"><div class="card-icono">' + window.Util.svg('pedidos') + '</div>' +
          '<div><h2>Historial de estados</h2><p>Registro de cada actualización del pedido</p></div></div></div>' +
        '<div class="timeline">' + (pedido.historial || []).slice().reverse().map(function (registro) {
          return '<div class="timeline-item hecho"><h4>' + window.Util.etiqueta(registro.estado) + '</h4>' +
            '<p>' + window.Util.fechaHora(registro.fecha) + (registro.por ? ' · ' + window.Util.esc(registro.por) : '') +
            (registro.nota ? ' · ' + window.Util.esc(registro.nota) : '') + '</p></div>';
        }).join('') + '</div>' +
      '</div>';

    const selector = document.getElementById('selector-pedido');
    if (selector) {
      selector.addEventListener('change', function () {
        history.replaceState(null, '', 'seguimiento.html?codigo=' + encodeURIComponent(selector.value));
        firma = '';
        render(true);
      });
    }
    const actualizar = contenido.querySelector('[data-actualizar]');
    if (actualizar) {
      actualizar.addEventListener('click', function () {
        firma = '';
        render(true);
        window.Notificaciones.info('Información actualizada', 'El estado se consulta desde el almacenamiento local.');
      });
    }
    const cancelar = contenido.querySelector('[data-cancelar]');
    if (cancelar) {
      cancelar.addEventListener('click', function () {
        window.Modal.confirmar({
          titulo: 'Cancelar pedido',
          mensaje: 'El pedido se marcará como cancelado y el pago pendiente será rechazado. Esta acción no se puede deshacer.',
          peligro: true,
          textoOk: 'Sí, cancelar pedido'
        }).then(function (confirmado) {
          if (!confirmado) return;
          const resultado = window.Pedidos.cancelar(pedido.id, 'Cancelado por el cliente');
          if (!resultado.ok) {
            window.Notificaciones.error('No se pudo cancelar', resultado.error);
            return;
          }
          firma = '';
          render(true);
          window.Notificaciones.info('Pedido cancelado', pedido.codigo + ' fue cancelado correctamente.');
        });
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    contenido = window.Shell.cliente({
      pagina: 'seguimiento',
      titulo: 'Seguimiento del pedido',
      subtitulo: 'Se actualiza automáticamente cada 5 segundos'
    });
    if (!contenido) return;
    render(true);
    setInterval(function () { render(false); }, 5000);
    window.Almacen.alCambiar(window.Util.debounce(function () { render(true); }, 400));
  });
})();
