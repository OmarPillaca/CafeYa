/* ============================================================
   CafeYa Ica - Gestión de pedidos (administración)
   ============================================================ */
(function () {
  'use strict';

  let contenido = null;
  const filtros = { busqueda: '', estado: 'todos', pago: 'todos', fecha: '' };

  function siguiente(pedido) {
    const mapa = {
      recibido: { estado: 'preparacion', texto: 'Aceptar pedido', clase: 'btn-teal' },
      preparacion: { estado: 'listo', texto: 'Marcar listo', clase: 'btn-teal' },
      listo: { estado: 'entregado', texto: 'Entregar', clase: 'btn-azul' }
    };
    return mapa[pedido.estado] || null;
  }

  function acciones(pedido) {
    let html = '<div class="acciones-fila">' +
      '<button type="button" class="btn btn-sm btn-claro" data-ver="' + pedido.id + '">Ver</button>';
    const paso = siguiente(pedido);
    if (paso) {
      html += '<button type="button" class="btn btn-sm ' + paso.clase + '" data-avanzar="' + pedido.id + '">' + paso.texto + '</button>';
    }
    if (pedido.estado === 'recibido' || pedido.estado === 'preparacion') {
      html += '<button type="button" class="btn btn-sm btn-peligro" data-cancelar="' + pedido.id + '">Cancelar</button>';
    }
    return html + '</div>';
  }

  function listaFiltrada() {
    let lista = window.Pedidos.listar();
    if (filtros.estado !== 'todos') lista = lista.filter(function (p) { return p.estado === filtros.estado; });
    if (filtros.pago !== 'todos') lista = lista.filter(function (p) { return p.estadoPago === filtros.pago; });
    if (filtros.fecha) lista = lista.filter(function (p) { return window.Util.isoDia(p.creadoEn) === filtros.fecha; });
    return window.AdminUI.filtrar(lista, filtros.busqueda, ['codigo', 'clienteNombre', 'clienteCorreo']);
  }

  function renderTabla() {
    const zona = document.getElementById('tabla-pedidos');
    if (!zona) return;
    const lista = listaFiltrada();
    zona.innerHTML = window.AdminUI.tabla({
      datos: lista,
      vacioTitulo: 'Sin pedidos',
      vacioTexto: 'No hay pedidos que coincidan con los filtros seleccionados.',
      columnas: [
        { titulo: 'Código', render: function (p) {
          return '<span class="pedido-codigo">' + window.Util.esc(p.codigo) + '</span>' +
            '<div class="small muted">' + (p.modalidad === 'mesa' ? 'Mesa' : 'Recojo') + '</div>';
        } },
        { titulo: 'Cliente', render: function (p) { return window.AdminUI.persona(p.clienteNombre, p.clienteCelular || '', 'azul'); } },
        { titulo: 'Fecha / recojo', render: function (p) {
          return window.Util.fecha(p.creadoEn) + '<div class="small muted">' + window.Util.esc(p.horaRecojoTexto || window.Util.hora(p.horaRecojo)) + '</div>';
        } },
        { titulo: 'Productos', render: function (p) {
          return '<div class="pedido-items">' + (p.items || []).slice(0, 3).map(function (i) {
            return '<span>' + i.cantidad + 'x ' + window.Util.esc(i.nombre) + '</span>';
          }).join('') + ((p.items || []).length > 3 ? '<span class="color-teal">+' + (p.items.length - 3) + ' más</span>' : '') + '</div>';
        } },
        { titulo: 'Total', render: function (p) { return '<strong class="dato-destacado">' + window.Util.soles(p.total) + '</strong>'; } },
        { titulo: 'Pago', render: function (p) { return window.Util.metodoPago(p.metodoPago) + '<div style="margin-top:3px">' + window.Util.badge(p.estadoPago) + '</div>'; } },
        { titulo: 'Estado', render: function (p) { return window.Util.badge(p.estado); } },
        { titulo: 'Acciones', render: function (p) { return acciones(p); } }
      ]
    });
  }

  function verPedido(id) {
    const pedido = window.Pedidos.porId(id);
    if (!pedido) return;
    const pago = window.Pagos.porPedido(pedido.id);
    const mesa = pedido.mesaId ? window.Almacen.buscar('mesas', pedido.mesaId) : null;
    const items = (pedido.items || []).map(function (item) {
      return '<div class="linea"><span>' + item.cantidad + 'x ' + window.Util.esc(item.nombre) +
        (item.observacion ? '<br><em class="small">' + window.Util.esc(item.observacion) + '</em>' : '') +
        '</span><strong>' + window.Util.soles(item.precio * item.cantidad) + '</strong></div>';
    }).join('');
    const historial = (pedido.historial || []).slice().reverse().map(function (h) {
      return '<div class="historial-mini">• <strong>' + window.Util.etiqueta(h.estado) + '</strong> · ' +
        window.Util.fechaHora(h.fecha) + (h.por ? ' · ' + window.Util.esc(h.por) : '') + '</div>';
    }).join('');

    const caja = window.Modal.abrir({
      titulo: 'Pedido ' + pedido.codigo,
      subtitulo: window.Util.fechaHora(pedido.creadoEn) + ' · ' + (pedido.modalidad === 'mesa' ? 'Mesa ' + (mesa ? mesa.numero : '') : 'Recojo'),
      emoji: '🧾',
      tamano: 'mediano',
      cuerpo:
        '<div class="flex-wrap mb-2">' + window.Util.badge(pedido.estado) + window.Util.badge(pedido.estadoPago, 'Pago ' + window.Util.etiqueta(pedido.estadoPago)) +
          '<span class="badge sin-punto">' + window.Util.metodoPago(pedido.metodoPago) + '</span></div>' +
        window.Modal.detalleFilas([
          ['Cliente', pedido.clienteNombre],
          ['Correo', pedido.clienteCorreo || '—'],
          ['Celular', pedido.clienteCelular || '—'],
          ['Hora de recojo', pedido.horaRecojoTexto || window.Util.hora(pedido.horaRecojo)],
          ['Observaciones', pedido.observaciones || 'Sin observaciones'],
          ['Código de pago', pago ? pago.codigo : '—']
        ]) +
        '<div class="detalle-pedido-items">' + items + '</div>' +
        '<div class="pedido-totales">' +
          '<div><span>Subtotal</span><strong>' + window.Util.soles(pedido.subtotal) + '</strong></div>' +
          '<div><span>Descuento</span><strong>− ' + window.Util.soles(pedido.descuento) + '</strong></div>' +
          '<div class="final"><span>Total</span><strong>' + window.Util.soles(pedido.total) + '</strong></div>' +
        '</div>' +
        '<div class="card" style="box-shadow:none;background:#F8F9FD"><div class="small bold color-azul mb-1">Historial de estados</div>' +
          historial + '</div>',
      acciones:
        (siguiente(pedido) ? '<button class="btn btn-teal" type="button" data-modal-avanzar="' + pedido.id + '">' + siguiente(pedido).texto + '</button>' : '') +
        (pago && pago.estado !== 'aprobado' ? '<button class="btn btn-claro" type="button" id="aprobar-pago">Aprobar pago</button>' : '') +
        '<button class="btn btn-primario" type="button" data-cerrar>Cerrar</button>'
    });

    const avanzar = caja.querySelector('[data-modal-avanzar]');
    if (avanzar) {
      avanzar.addEventListener('click', function () {
        cambiarEstado(pedido.id, siguiente(pedido).estado);
        window.Modal.cerrar();
      });
    }
    const aprobar = caja.querySelector('#aprobar-pago');
    if (aprobar) {
      aprobar.addEventListener('click', function () {
        window.Pagos.cambiarEstado(pago.id, 'aprobado', 'Validado por administración');
        window.Modal.cerrar();
        window.Notificaciones.exito('Pago aprobado', 'El pago del pedido ' + pedido.codigo + ' quedó aprobado.');
        renderTabla();
      });
    }
  }

  function cambiarEstado(id, estado) {
    const resultado = window.Pedidos.cambiarEstado(id, estado);
    if (!resultado.ok) {
      window.Notificaciones.error('No se pudo actualizar', resultado.error);
      return;
    }
    if (window.Notificaciones.push) {
      window.Notificaciones.push('Pedido ' + resultado.pedido.codigo + ' actualizado',
        'Nuevo estado: ' + window.Util.etiqueta(estado), 'info');
    }
    window.Notificaciones.exito('Pedido actualizado', resultado.pedido.codigo + ' → ' + window.Util.etiqueta(estado));
    renderTabla();
    window.Shell.actualizarBadges();
  }

  document.addEventListener('DOMContentLoaded', function () {
    contenido = window.AdminUI.montar({
      pagina: 'pedidos',
      titulo: 'Pedidos',
      subtitulo: 'Acepta, prepara y entrega los pedidos del día'
    });
    if (!contenido) return;

    contenido.innerHTML =
      '<div class="card">' +
        '<div class="panel-filtros">' +
          '<div class="buscador grow">' + window.Util.svg('buscar') +
            '<input id="f-buscar" type="search" placeholder="Buscar por código o cliente..."></div>' +
          '<select id="f-estado"><option value="todos">Todos los estados</option>' +
            window.Pedidos.ESTADOS.map(function (estado) {
              return '<option value="' + estado + '">' + window.Util.etiqueta(estado) + '</option>';
            }).join('') + '</select>' +
          '<select id="f-pago"><option value="todos">Todos los pagos</option>' +
            '<option value="pendiente">Pago pendiente</option><option value="aprobado">Pago aprobado</option>' +
            '<option value="rechazado">Pago rechazado</option></select>' +
          '<input type="date" id="f-fecha" aria-label="Filtrar por fecha">' +
          '<button type="button" class="btn btn-claro btn-sm" id="f-limpiar">Limpiar filtros</button>' +
        '</div>' +
        '<div id="tabla-pedidos"></div>' +
      '</div>';

    document.getElementById('f-buscar').addEventListener('input', window.Util.debounce(function (e) {
      filtros.busqueda = e.target.value;
      renderTabla();
    }, 220));
    document.getElementById('f-estado').addEventListener('change', function (e) {
      filtros.estado = e.target.value; renderTabla();
    });
    document.getElementById('f-pago').addEventListener('change', function (e) {
      filtros.pago = e.target.value; renderTabla();
    });
    document.getElementById('f-fecha').addEventListener('change', function (e) {
      filtros.fecha = e.target.value; renderTabla();
    });
    document.getElementById('f-limpiar').addEventListener('click', function () {
      filtros.busqueda = ''; filtros.estado = 'todos'; filtros.pago = 'todos'; filtros.fecha = '';
      document.getElementById('f-buscar').value = '';
      document.getElementById('f-estado').value = 'todos';
      document.getElementById('f-pago').value = 'todos';
      document.getElementById('f-fecha').value = '';
      renderTabla();
    });

    contenido.addEventListener('click', function (evento) {
      const ver = evento.target.closest('[data-ver]');
      if (ver) { verPedido(ver.dataset.ver); return; }
      const avanzar = evento.target.closest('[data-avanzar]');
      if (avanzar) {
        const pedido = window.Pedidos.porId(avanzar.dataset.avanzar);
        if (pedido && siguiente(pedido)) cambiarEstado(pedido.id, siguiente(pedido).estado);
        return;
      }
      const cancelar = evento.target.closest('[data-cancelar]');
      if (cancelar) {
        window.Modal.confirmar({
          titulo: 'Cancelar pedido',
          mensaje: 'El pedido será marcado como cancelado y el pago pendiente se rechazará.',
          peligro: true,
          textoOk: 'Sí, cancelar'
        }).then(function (confirmado) {
          if (!confirmado) return;
          const resultado = window.Pedidos.cancelar(cancelar.dataset.cancelar, 'Cancelado por administración');
          if (!resultado.ok) window.Notificaciones.error('No se pudo cancelar', resultado.error);
          else {
            window.Notificaciones.info('Pedido cancelado', resultado.pedido.codigo);
            renderTabla();
          }
        });
      }
    });

    renderTabla();
    window.Almacen.alCambiar(window.Util.debounce(renderTabla, 600));
  });
})();
