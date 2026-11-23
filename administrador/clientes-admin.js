/* ============================================================
   CafeYa Ica - Administración de clientes
   ============================================================ */
(function () {
  'use strict';

  let contenido = null;
  const filtros = { busqueda: '', estado: 'todos' };

  function datosCliente(cliente) {
    const pedidos = window.Pedidos.porUsuario(cliente.id);
    const reservas = window.Reservas.porUsuario(cliente.id);
    const tarjeta = window.Fidelizacion.tarjeta(cliente.id);
    const gasto = window.Util.sumar(pedidos.filter(function (p) {
      return p.estadoPago === 'aprobado' && p.estado !== 'cancelado';
    }), 'total');
    return { pedidos: pedidos, reservas: reservas, tarjeta: tarjeta, gasto: gasto };
  }

  function renderTabla() {
    const zona = document.getElementById('tabla-clientes');
    if (!zona) return;
    let clientes = window.Almacen.listar('usuarios').filter(function (u) { return u.rol === 'cliente'; });
    if (filtros.estado === 'activos') clientes = clientes.filter(function (c) { return c.estado !== 'inactivo'; });
    if (filtros.estado === 'inactivos') clientes = clientes.filter(function (c) { return c.estado === 'inactivo'; });
    if (filtros.estado === 'frecuentes') clientes = clientes.filter(function (c) { return window.Fidelizacion.tarjeta(c.id).compras >= 5; });
    clientes = window.AdminUI.filtrar(clientes, filtros.busqueda, ['nombre', 'correo', 'celular']);

    zona.innerHTML = window.AdminUI.tabla({
      datos: clientes,
      vacioTitulo: 'Sin clientes',
      vacioTexto: 'No hay clientes que coincidan con la búsqueda.',
      columnas: [
        { titulo: 'Cliente', render: function (c) {
          return '<div class="cliente-celda">' + window.Util.avatar(c.nombre, 'azul') +
            '<div><strong>' + window.Util.esc(c.nombre) + '</strong><small>' + window.Util.esc(c.correo) + '</small></div></div>';
        } },
        { titulo: 'Celular', campo: 'celular' },
        { titulo: 'Pedidos', render: function (c) {
          const datos = datosCliente(c);
          return '<span class="dato-destacado">' + datos.pedidos.length + '</span><div class="small muted">' + window.Util.soles(datos.gasto) + '</div>';
        } },
        { titulo: 'Compras', render: function (c) {
          const tarjeta = window.Fidelizacion.tarjeta(c.id);
          let mini = '<div class="tarjeta-mini-fid">';
          for (let i = 1; i <= 5; i++) mini += '<i class="' + (i <= tarjeta.enTarjeta ? 'lleno' : '') + '"></i>';
          return '<span class="dato-destacado">' + tarjeta.compras + '</span>' + mini + '</div>';
        } },
        { titulo: 'Reservas', render: function (c) {
          return window.Reservas.porUsuario(c.id).length;
        } },
        { titulo: 'Estado', render: function (c) { return window.Util.badge(c.estado === 'inactivo' ? 'inactivo' : 'activo'); } },
        { titulo: 'Acciones', render: function (c) {
          return '<div class="acciones-fila">' +
            '<button type="button" class="btn btn-sm btn-claro" data-ver="' + c.id + '">Ver ficha</button>' +
            '<button type="button" class="btn btn-sm ' + (c.estado === 'inactivo' ? 'btn-teal' : 'btn-peligro') + '" data-estado-cliente="' + c.id + '">' +
              (c.estado === 'inactivo' ? 'Activar' : 'Desactivar') + '</button></div>';
        } }
      ]
    });
  }

  function verCliente(id) {
    const cliente = window.Almacen.buscar('usuarios', id);
    const datos = datosCliente(cliente);
    const pedidos = datos.pedidos.slice(0, 4).map(function (p) {
      return '<div class="detalle-linea"><span>' + window.Util.esc(p.codigo) + ' · ' + window.Util.fecha(p.creadoEn) + '</span>' +
        '<strong>' + window.Util.soles(p.total) + ' · ' + window.Util.etiqueta(p.estado) + '</strong></div>';
    }).join('');
    window.Modal.abrir({
      titulo: cliente.nombre,
      subtitulo: 'Cliente desde ' + window.Util.fecha(cliente.creadoEn),
      emoji: '👤',
      tamano: 'mediano',
      cuerpo:
        '<div class="cliente-metricas">' +
          '<div><strong>' + datos.pedidos.length + '</strong><span>Pedidos</span></div>' +
          '<div><strong>' + window.Util.soles(datos.gasto) + '</strong><span>Consumo</span></div>' +
          '<div><strong>' + datos.tarjeta.compras + '</strong><span>Compras</span></div>' +
          '<div><strong>' + datos.tarjeta.beneficios + '</strong><span>Beneficios</span></div>' +
          '<div><strong>' + datos.reservas.length + '</strong><span>Reservas</span></div>' +
        '</div>' +
        window.Modal.detalleFilas([
          ['Correo', cliente.correo],
          ['Celular', cliente.celular || '—'],
          ['Distrito', cliente.distrito || 'Ica'],
          ['Preferencia', cliente.preferencia || '—'],
          ['Estado', window.Util.etiqueta(cliente.estado === 'inactivo' ? 'inactivo' : 'activo')]
        ]) +
        '<div class="mt-2"><strong class="small color-azul">Últimos pedidos</strong>' + (pedidos || '<p class="small muted mt-1">Sin pedidos registrados.</p>') + '</div>',
      acciones: '<button class="btn btn-claro" type="button" data-cerrar>Cerrar</button>'
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    contenido = window.AdminUI.montar({
      pagina: 'clientes-admin',
      titulo: 'Clientes',
      subtitulo: 'Fichas, consumo y tarjetas de fidelización'
    });
    if (!contenido) return;

    const clientes = window.Almacen.listar('usuarios').filter(function (u) { return u.rol === 'cliente'; });
    const activos = clientes.filter(function (c) { return c.estado !== 'inactivo'; }).length;
    const frecuentes = clientes.filter(function (c) { return window.Fidelizacion.tarjeta(c.id).compras >= 5; }).length;
    const compras = clientes.reduce(function (s, c) { return s + window.Fidelizacion.tarjeta(c.id).compras; }, 0);

    contenido.innerHTML =
      '<div class="grid grid-4">' +
        window.AdminUI.stat(clientes.length, 'Clientes registrados', 'usuarios', '') +
        window.AdminUI.stat(activos, 'Clientes activos', 'check', 'menta') +
        window.AdminUI.stat(frecuentes, 'Tarjetas completas (5+)', 'fidelizacion', 'terracota') +
        window.AdminUI.stat(compras, 'Compras acumuladas', 'cafe', 'azul') +
      '</div>' +
      '<div class="card mt-2">' +
        '<div class="panel-filtros">' +
          '<div class="buscador grow">' + window.Util.svg('buscar') +
            '<input id="c-buscar" type="search" placeholder="Buscar por nombre, correo o celular..."></div>' +
          '<select id="c-estado" class="cliente-filtro-estado">' +
            '<option value="todos">Todos los clientes</option><option value="activos">Solo activos</option>' +
            '<option value="inactivos">Solo inactivos</option><option value="frecuentes">Clientes frecuentes</option></select>' +
        '</div>' +
        '<div id="tabla-clientes"></div>' +
      '</div>' +
      '<div class="alerta mt-2"><span class="alerta-icono">⭐</span><div><strong>Tarjeta de fidelización</strong>' +
        'Las compras se calculan automáticamente con los pedidos entregados y pagados de cada cliente.</div></div>';

    document.getElementById('c-buscar').addEventListener('input', window.Util.debounce(function (e) {
      filtros.busqueda = e.target.value; renderTabla();
    }, 220));
    document.getElementById('c-estado').addEventListener('change', function (e) {
      filtros.estado = e.target.value; renderTabla();
    });

    contenido.addEventListener('click', function (evento) {
      const ver = evento.target.closest('[data-ver]');
      if (ver) { verCliente(ver.dataset.ver); return; }
      const alternar = evento.target.closest('[data-estado-cliente]');
      if (alternar) {
        const cliente = window.Almacen.buscar('usuarios', alternar.dataset.estadoCliente);
        const nuevoEstado = cliente.estado === 'inactivo' ? 'activo' : 'inactivo';
        window.Almacen.actualizar('usuarios', cliente.id, { estado: nuevoEstado });
        window.Notificaciones.info('Estado del cliente', cliente.nombre + ' quedó ' + nuevoEstado + '.');
        renderTabla();
      }
    });

    renderTabla();
  });
})();
