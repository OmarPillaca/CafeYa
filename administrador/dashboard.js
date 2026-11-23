/* ============================================================
   CafeYa Ica - Dashboard administrativo
   ============================================================ */
(function () {
  'use strict';

  let contenido = null;

  function render() {
    const estadisticas = window.Pedidos.estadisticas();
    const ventasHoy = window.Reportes.resumen(window.Util.hoyISO(), window.Util.hoyISO());
    const clientes = window.Almacen.listar('usuarios').filter(function (u) { return u.rol === 'cliente'; });
    const productos = window.Almacen.listar('productos');
    const promociones = window.Promociones.resumen();
    const reservas = window.Reservas.estadisticas();
    const inventario = window.Almacen.listar('inventario');
    const bajoStock = inventario.filter(function (i) { return Number(i.stock) <= Number(i.stockMinimo); });
    const sugerencias = window.Reportes.sugerenciasResumen();
    const tiempo = window.Reportes.tiempoPreparacion();
    const top = window.Reportes.productosMasVendidos(null, null, 5);
    const estados = window.Reportes.pedidosPorEstado();
    const metodos = window.Reportes.metodosPago();
    const recientes = window.Pedidos.listar().slice(0, 6);

    contenido.innerHTML =
      '<div class="grid grid-4">' +
        window.AdminUI.stat(window.Util.soles(estadisticas.ventasHoy), 'Ventas del día', 'pagos', 'menta') +
        window.AdminUI.stat(estadisticas.hoy, 'Pedidos del día', 'pedidos', '') +
        window.AdminUI.stat(estadisticas.pendientes, 'Pedidos pendientes', 'reloj', 'terracota') +
        window.AdminUI.stat(estadisticas.entregados, 'Pedidos completados', 'check', 'azul') +
      '</div>' +
      '<div class="grid grid-4 mt-2">' +
        window.AdminUI.stat(reservas.pendientes + reservas.confirmadas, 'Reservas activas', 'calendario', '') +
        window.AdminUI.stat(clientes.length, 'Clientes registrados', 'usuarios', 'azul') +
        window.AdminUI.stat(productos.filter(function (p) { return p.disponible; }).length + ' / ' + productos.length, 'Productos disponibles', 'producto', 'menta') +
        window.AdminUI.stat(promociones.activas, 'Promociones activas', 'promocion', 'terracota') +
      '</div>' +

      '<div class="dos-columnas mt-2">' +
        '<div class="card dash-grafico-card">' +
          '<div class="card-head"><div class="card-titulo"><div class="card-icono">' + window.Util.svg('grafico') + '</div>' +
            '<div><h2>Ventas de los últimos 7 días</h2><p>Pedidos pagados y no cancelados</p></div></div>' +
            '<span class="badge sin-punto">Hoy: ' + window.Util.soles(ventasHoy.ventas) + '</span></div>' +
          window.Util.barras(window.Reportes.ventasPorDia(7), { moneda: true }) +
        '</div>' +
        '<div class="card">' +
          '<div class="card-head"><div class="card-titulo"><div class="card-icono">' + window.Util.svg('pedidos') + '</div>' +
            '<div><h2>Pedidos por estado</h2><p>Distribución del total registrado</p></div></div></div>' +
          window.Util.dona(estados, estadisticas.total) +
        '</div>' +
      '</div>' +

      '<div class="dos-columnas mt-2">' +
        '<div class="card dash-grafico-card">' +
          '<div class="card-head"><div class="card-titulo"><div class="card-icono">' + window.Util.svg('reportes') + '</div>' +
            '<div><h2>Ventas mensuales</h2><p>Últimos 6 meses de operación</p></div></div></div>' +
          window.Util.barras(window.Reportes.ventasPorMes(6), { moneda: true }) +
        '</div>' +
        '<div class="card">' +
          '<div class="card-head"><div class="card-titulo"><div class="card-icono">' + window.Util.svg('pagos') + '</div>' +
            '<div><h2>Métodos de pago</h2><p>Pagos aprobados registrados</p></div></div></div>' +
          (metodos.length ? window.Util.dona(metodos, metodos.reduce(function (s, m) { return s + m.valor; }, 0)) : window.Util.vacio('Sin pagos aprobados', 'Los pagos demostrativos aparecerán aquí.')) +
        '</div>' +
      '</div>' +

      '<div class="dos-columnas mt-2">' +
        '<div class="card">' +
          '<div class="card-head"><div class="card-titulo"><div class="card-icono">' + window.Util.svg('producto') + '</div>' +
            '<div><h2>Productos más vendidos</h2><p>Unidades acumuladas del histórico</p></div></div></div>' +
          (top.length ? window.Util.barras(top.map(function (p) { return { etiqueta: p.etiqueta, valor: p.valor }; })) : window.Util.vacio('Sin ventas registradas', 'Aún no hay productos vendidos.')) +
          '<div class="dash-leyenda">Cantidad de unidades vendidas por producto.</div>' +
        '</div>' +
        '<div class="card">' +
          '<div class="card-head"><div class="card-titulo"><div class="card-icono">' + window.Util.svg('alerta') + '</div>' +
            '<div><h2>Alertas y pendientes</h2><p>Revisión rápida del día</p></div></div></div>' +
          '<div class="dashboard-alertas">' +
            (bajoStock.length
              ? '<div class="alerta-linea peligro"><span>📦 <strong>' + bajoStock.length + '</strong> insumo(s) en stock mínimo</span>' +
                '<a class="btn btn-sm btn-claro" href="inventario.html">Ver</a></div>'
              : '<div class="alerta-linea"><span>📦 Inventario sin alertas de stock</span><a class="btn btn-sm btn-claro" href="inventario.html">Ver</a></div>') +
            '<div class="alerta-linea"><span>💬 <strong>' + sugerencias.pendientes + '</strong> sugerencia(s) pendientes</span>' +
              '<a class="btn btn-sm btn-claro" href="sugerencias-admin.html">Atender</a></div>' +
            '<div class="alerta-linea"><span>⏱️ Tiempo promedio de preparación: <strong>' + tiempo.promedio + ' min</strong></span>' +
              '<span class="badge ' + (tiempo.promedio <= tiempo.objetivo ? 'badge-aprobado' : 'badge-pendiente') + '">' +
              (tiempo.promedio <= tiempo.objetivo ? 'En objetivo' : 'Sobre objetivo') + '</span></div>' +
            '<div class="alerta-linea"><span>🪑 Mesas reservadas para hoy: <strong>' + reservas.hoy + '</strong></span>' +
              '<a class="btn btn-sm btn-claro" href="reservas-admin.html">Ver</a></div>' +
            '<div class="alerta-linea"><span>👨‍🍳 Pedidos en cocina: <strong>' + (estadisticas.recibidos + estadisticas.preparacion) + '</strong></span>' +
              '<a class="btn btn-sm btn-claro" href="../cocina/cocina.html">Abrir cocina</a></div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="card mt-2">' +
        '<div class="card-head"><div class="card-titulo"><div class="card-icono">' + window.Util.svg('pedidos') + '</div>' +
          '<div><h2>Últimos pedidos</h2><p>Actividad reciente del sistema</p></div></div>' +
          '<a class="btn btn-claro btn-sm" href="pedidos.html">Ver todos</a></div>' +
        window.AdminUI.tabla({
          datos: recientes,
          vacioTitulo: 'Sin pedidos registrados',
          vacioTexto: 'Cuando los clientes realicen pedidos aparecerán aquí.',
          columnas: [
            { titulo: 'Código', render: function (p) { return '<span class="principal">' + window.Util.esc(p.codigo) + '</span>'; } },
            { titulo: 'Cliente', render: function (p) { return window.AdminUI.persona(p.clienteNombre, p.clienteCorreo, 'azul'); } },
            { titulo: 'Fecha', render: function (p) { return window.Util.fecha(p.creadoEn); } },
            { titulo: 'Total', render: function (p) { return '<strong>' + window.Util.soles(p.total) + '</strong>'; } },
            { titulo: 'Pago', render: function (p) { return window.Util.badge(p.estadoPago); } },
            { titulo: 'Estado', render: function (p) { return window.Util.badge(p.estado); } }
          ]
        }) +
      '</div>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    contenido = window.AdminUI.montar({
      pagina: 'dashboard',
      titulo: 'Dashboard',
      subtitulo: 'Resumen operativo de CaféYa Ica en tiempo real'
    });
    if (!contenido) return;
    render();
    window.Almacen.alCambiar(window.Util.debounce(render, 500));
  });
})();
