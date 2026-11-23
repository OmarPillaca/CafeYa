/* ============================================================
   CafeYa Ica - Administración de pagos demostrativos
   ============================================================ */
(function () {
  'use strict';

  let contenido = null;
  const filtros = { busqueda: '', estado: 'todos', metodo: 'todos', fecha: '' };
  const ICONOS = { yape: '📱', plin: '📲', tarjeta: '💳', efectivo: '💵' };

  function renderTabla() {
    const zona = document.getElementById('tabla-pagos');
    if (!zona) return;
    let lista = window.Pagos.listar();
    if (filtros.estado !== 'todos') lista = lista.filter(function (p) { return p.estado === filtros.estado; });
    if (filtros.metodo !== 'todos') lista = lista.filter(function (p) { return p.metodo === filtros.metodo; });
    if (filtros.fecha) lista = lista.filter(function (p) { return window.Util.isoDia(p.fecha) === filtros.fecha; });
    lista = window.AdminUI.filtrar(lista, filtros.busqueda, ['codigo', 'cliente', 'codigoPedido']);

    zona.innerHTML = window.AdminUI.tabla({
      datos: lista,
      vacioTitulo: 'Sin pagos',
      vacioTexto: 'No hay pagos que coincidan con los filtros.',
      columnas: [
        { titulo: 'Pago', render: function (p) {
          return '<span class="pago-codigo">' + window.Util.esc(p.codigo) + '</span>' +
            '<div class="pago-comprobante">' + window.Util.esc(p.comprobante) + '</div>';
        } },
        { titulo: 'Cliente', render: function (p) { return window.AdminUI.persona(p.cliente, p.correo || '', 'azul'); } },
        { titulo: 'Pedido', render: function (p) { return window.Util.esc(p.codigoPedido || (p.tipo === 'compartida' ? 'Mesa compartida' : '—')); } },
        { titulo: 'Método', render: function (p) {
          return '<div class="pago-metodo"><span class="icono">' + (ICONOS[p.metodo] || '💳') + '</span>' +
            window.Util.metodoPago(p.metodo) + '</div>';
        } },
        { titulo: 'Importe', render: function (p) {
          return '<span class="pago-importe">' + window.Util.soles(p.importe) + '<small>PEN</small></span>';
        } },
        { titulo: 'Fecha', render: function (p) { return window.Util.fechaHora(p.fecha); } },
        { titulo: 'Estado', render: function (p) { return window.Util.badge(p.estado); } },
        { titulo: 'Acciones', render: function (p) {
          let html = '<div class="acciones-fila">';
          if (p.estado !== 'aprobado') html += '<button type="button" class="btn btn-sm btn-teal" data-aprobar="' + p.id + '">Aprobar</button>';
          if (p.estado !== 'rechazado') html += '<button type="button" class="btn btn-sm btn-peligro" data-rechazar="' + p.id + '">Rechazar</button>';
          if (p.estado !== 'pendiente') html += '<button type="button" class="btn btn-sm btn-claro" data-pendiente="' + p.id + '">Pendiente</button>';
          html += '<button type="button" class="btn btn-sm btn-claro" data-ver="' + p.id + '">Ver</button></div>';
          return html;
        } }
      ]
    });
  }

  function cambiar(id, estado) {
    const resultado = window.Pagos.cambiarEstado(id, estado, 'Estado actualizado por administración');
    if (!resultado.ok) {
      window.Notificaciones.error('No se pudo actualizar', resultado.error);
      return;
    }
    if (window.Notificaciones.push) {
      window.Notificaciones.push('Pago ' + resultado.pago.codigo + ' ' + window.Util.etiqueta(estado).toLowerCase(),
        'Cliente: ' + resultado.pago.cliente + ' · ' + window.Util.soles(resultado.pago.importe), 'exito');
    }
    window.Notificaciones.exito('Pago actualizado', 'Estado: ' + window.Util.etiqueta(estado));
    renderTabla();
    window.Shell.actualizarBadges();
  }

  function verPago(id) {
    const pago = window.Almacen.buscar('pagos', id);
    const pedido = pago.pedidoId ? window.Almacen.buscar('pedidos', pago.pedidoId) : null;
    window.Modal.abrir({
      titulo: 'Pago ' + pago.codigo,
      subtitulo: 'Registro demostrativo sin valor real',
      emoji: ICONOS[pago.metodo] || '💳',
      cuerpo:
        '<div class="alerta mb-2"><span class="alerta-icono">🧪</span><div><strong>Pago simulado</strong>' +
          'Este registro no representa una transacción real.</div></div>' +
        window.Modal.detalleFilas([
          ['Cliente', pago.cliente],
          ['Método', window.Util.metodoPago(pago.metodo)],
          ['Importe', window.Util.soles(pago.importe) + ' PEN'],
          ['Estado', window.Util.etiqueta(pago.estado)],
          ['Pedido', pago.codigoPedido || '—'],
          ['Comprobante', pago.comprobante],
          ['Fecha', window.Util.fechaHora(pago.fecha)],
          ['Tipo', pago.tipo === 'compartida' ? 'Pago de mesa compartida' : 'Pago de pedido'],
          ['Nota', pago.nota || '—']
        ]) +
        (pedido ? '<div class="alerta mt-2"><span class="alerta-icono">🧾</span><div><strong>Pedido ' + window.Util.esc(pedido.codigo) + '</strong>' +
          window.Util.soles(pedido.total) + ' · ' + window.Util.etiqueta(pedido.estado) + ' · Pago ' + window.Util.etiqueta(pedido.estadoPago) + '</div></div>' : ''),
      acciones: '<button class="btn btn-primario" type="button" data-cerrar>Cerrar</button>'
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    contenido = window.AdminUI.montar({
      pagina: 'pagos-admin',
      titulo: 'Pagos',
      subtitulo: 'Validación de pagos demostrativos'
    });
    if (!contenido) return;

    const resumen = window.Pagos.resumen();
    contenido.innerHTML =
      '<div class="grid grid-4">' +
        window.AdminUI.stat(resumen.total, 'Pagos registrados', 'pagos', '') +
        window.AdminUI.stat(resumen.aprobados, 'Pagos aprobados', 'check', 'menta') +
        window.AdminUI.stat(resumen.pendientes, 'Pagos pendientes', 'reloj', 'terracota') +
        window.AdminUI.stat(window.Util.soles(resumen.recaudado), 'Recaudado (demo)', 'tarjeta', 'azul') +
      '</div>' +
      '<div class="card mt-2">' +
        '<div class="pagos-demo-aviso"><span>🧪</span><div><strong>Pagos demostrativos</strong>' +
          'Puedes aprobar, rechazar o devolver a pendiente un pago. El estado se refleja en el pedido del cliente y en su historial.</div></div>' +
        '<div class="panel-filtros">' +
          '<div class="buscador grow">' + window.Util.svg('buscar') +
            '<input id="pa-buscar" type="search" placeholder="Buscar pago, cliente o pedido..."></div>' +
          '<select id="pa-estado"><option value="todos">Todos los estados</option>' +
            '<option value="pendiente">Pendiente</option><option value="aprobado">Aprobado</option>' +
            '<option value="rechazado">Rechazado</option></select>' +
          '<select id="pa-metodo"><option value="todos">Todos los métodos</option>' +
            '<option value="yape">Yape</option><option value="plin">Plin</option>' +
            '<option value="tarjeta">Tarjeta</option><option value="efectivo">Efectivo</option></select>' +
          '<input type="date" id="pa-fecha" aria-label="Filtrar por fecha">' +
          '<button type="button" class="btn btn-claro btn-sm" id="pa-limpiar">Limpiar</button>' +
        '</div>' +
        '<div id="tabla-pagos"></div>' +
      '</div>';

    document.getElementById('pa-buscar').addEventListener('input', window.Util.debounce(function (e) {
      filtros.busqueda = e.target.value; renderTabla();
    }, 220));
    document.getElementById('pa-estado').addEventListener('change', function (e) {
      filtros.estado = e.target.value; renderTabla();
    });
    document.getElementById('pa-metodo').addEventListener('change', function (e) {
      filtros.metodo = e.target.value; renderTabla();
    });
    document.getElementById('pa-fecha').addEventListener('change', function (e) {
      filtros.fecha = e.target.value; renderTabla();
    });
    document.getElementById('pa-limpiar').addEventListener('click', function () {
      filtros.busqueda = ''; filtros.estado = 'todos'; filtros.metodo = 'todos'; filtros.fecha = '';
      document.getElementById('pa-buscar').value = '';
      document.getElementById('pa-estado').value = 'todos';
      document.getElementById('pa-metodo').value = 'todos';
      document.getElementById('pa-fecha').value = '';
      renderTabla();
    });

    contenido.addEventListener('click', function (evento) {
      const aprobar = evento.target.closest('[data-aprobar]');
      if (aprobar) { cambiar(aprobar.dataset.aprobar, 'aprobado'); return; }
      const rechazar = evento.target.closest('[data-rechazar]');
      if (rechazar) { cambiar(rechazar.dataset.rechazar, 'rechazado'); return; }
      const pendiente = evento.target.closest('[data-pendiente]');
      if (pendiente) { cambiar(pendiente.dataset.pendiente, 'pendiente'); return; }
      const ver = evento.target.closest('[data-ver]');
      if (ver) verPago(ver.dataset.ver);
    });

    renderTabla();
    window.Almacen.alCambiar(window.Util.debounce(renderTabla, 500));
  });
})();
