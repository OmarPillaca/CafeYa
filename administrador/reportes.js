/* ============================================================
   CafeYa Ica - Reportes y estadísticas
   ============================================================ */
(function () {
  'use strict';

  let contenido = null;
  const periodo = {
    desde: window.Util.sumarDias(window.Util.hoyISO(), -29),
    hasta: window.Util.hoyISO()
  };

  function render() {
    const res = window.Reportes.resumen(periodo.desde, periodo.hasta);
    const dias = window.Reportes.ventasPorDia(7);
    const meses = window.Reportes.ventasPorMes(6);
    const top = window.Reportes.productosMasVendidos(periodo.desde, periodo.hasta, 6);
    const estados = window.Reportes.pedidosPorEstado(periodo.desde, periodo.hasta);
    const metodos = window.Reportes.metodosPago(periodo.desde, periodo.hasta);
    const tiempo = window.Reportes.tiempoPreparacion();
    const reservas = window.Reportes.reservasPorEstado();
    const sugerencias = window.Reportes.sugerenciasResumen();
    const usuarios = window.Almacen.listar('usuarios').filter(function (u) { return u.rol === 'cliente'; });

    const tablaTop = window.AdminUI.tabla({
      datos: top,
      vacioTitulo: 'Sin ventas en el periodo',
      vacioTexto: 'Registra pedidos pagados para ver el ranking de productos.',
      columnas: [
        { titulo: 'Producto', render: function (p, i) {
          return '<div class="flex gap-1" style="align-items:center"><strong style="color:var(--gris-claro);font-size:11px;width:16px">' +
            (i + 1) + '</strong><span>' + window.Util.esc(p.etiqueta) + '</span></div>';
        } },
        { titulo: 'Unidades', render: function (p) { return '<strong>' + p.valor + '</strong>'; } },
        { titulo: 'Ingresos', render: function (p) { return window.Util.soles(p.total); } }
      ]
    });

    contenido.innerHTML =
      '<div class="reportes-periodo">' +
        '<div class="campo"><label for="rep-desde">Desde</label><input type="date" id="rep-desde" value="' + periodo.desde + '"></div>' +
        '<div class="campo"><label for="rep-hasta">Hasta</label><input type="date" id="rep-hasta" value="' + periodo.hasta + '"></div>' +
        '<div class="reporte-acciones">' +
          '<button type="button" class="btn btn-claro btn-sm" data-rango="7">Últimos 7 días</button>' +
          '<button type="button" class="btn btn-claro btn-sm" data-rango="30">Últimos 30 días</button>' +
          '<button type="button" class="btn btn-claro btn-sm" data-rango="mes">Mes actual</button>' +
        '</div>' +
        '<div class="reporte-acciones">' +
          '<button type="button" class="btn btn-claro btn-sm" id="rep-pedidos">' + window.Util.svg('descargar') + ' CSV pedidos</button>' +
          '<button type="button" class="btn btn-claro btn-sm" id="rep-productos">' + window.Util.svg('descargar') + ' CSV productos</button>' +
          '<button type="button" class="btn btn-claro btn-sm" id="rep-clientes">' + window.Util.svg('descargar') + ' CSV clientes</button>' +
        '</div>' +
      '</div>' +
      '<div class="reporte-card ancho">' +
        '<h3><span>📈</span>Resumen del periodo</h3>' +
        '<div class="reporte-kpi">' +
          '<div><strong>' + window.Util.soles(res.ventas) + '</strong><span>Ventas cobradas</span></div>' +
          '<div><strong>' + res.pedidos + '</strong><span>Pedidos</span></div>' +
          '<div><strong>' + window.Util.soles(res.ticket) + '</strong><span>Ticket promedio</span></div>' +
          '<div><strong>' + res.productosVendidos + '</strong><span>Productos vendidos</span></div>' +
          '<div><strong>' + res.clientes + '</strong><span>Clientes registrados</span></div>' +
          '<div><strong>' + res.reservas + '</strong><span>Reservas</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="reportes-grid mt-2">' +
        '<div class="reporte-card"><h3><span>📊</span>Ventas de los últimos 7 días</h3>' +
          '<p class="reporte-sub">Pedidos con pago aprobado por día</p>' + window.Util.barras(dias, { moneda: true }) + '</div>' +
        '<div class="reporte-card"><h3><span>🗓️</span>Ventas por mes</h3>' +
          '<p class="reporte-sub">Últimos 6 meses</p>' + window.Util.barras(meses, { moneda: true }) + '</div>' +
        '<div class="reporte-card"><h3><span>🍰</span>Pedidos por estado</h3>' +
          '<p class="reporte-sub">Según el periodo seleccionado</p>' +
          window.Util.dona(estados, res.pedidos) + '</div>' +
        '<div class="reporte-card"><h3><span>💳</span>Métodos de pago</h3>' +
          '<p class="reporte-sub">Pagos aprobados del periodo</p>' +
          (metodos.length ? window.Util.dona(metodos.map(function (m, i) {
            return { etiqueta: m.etiqueta, valor: m.valor, color: window.Reportes.COLORES[i % 6] };
          }), metodos.reduce(function (s, m) { return s + m.valor; }, 0)) : window.Util.vacio('Sin pagos', 'No hay pagos aprobados en el periodo.')) + '</div>' +
        '<div class="reporte-card"><h3><span>⏱️</span>Tiempo de preparación</h3>' +
          '<p class="reporte-sub">Objetivo del documento: menos de 8 minutos</p>' +
          '<div class="reporte-kpi"><div><strong>' + tiempo.promedio + ' min</strong><span>Promedio real</span></div>' +
            '<div><strong>' + tiempo.objetivo + ' min</strong><span>Objetivo</span></div>' +
            '<div><strong>' + tiempo.muestras + '</strong><span>Pedidos medidos</span></div></div>' +
          '<div class="reporte-objetivo"><span>Cumplimiento del objetivo</span>' +
            '<div class="progress"><span style="width:' + tiempo.cumplimiento + '%"></span></div><strong>' + tiempo.cumplimiento + '%</strong></div>' +
        '</div>' +
        '<div class="reporte-card"><h3><span>📅</span>Reservas por estado</h3>' +
          '<p class="reporte-sub">Todas las reservas registradas</p>' +
          window.Util.dona(reservas.filter(function (r) { return r.valor > 0; }), reservas.reduce(function (s, r) { return s + r.valor; }, 0)) + '</div>' +
        '<div class="reporte-card"><h3><span>💬</span>Sugerencias y satisfacción</h3>' +
          '<p class="reporte-sub">Opiniones de los clientes</p>' +
          '<div class="reporte-kpi"><div><strong>' + sugerencias.total + '</strong><span>Total</span></div>' +
            '<div><strong>' + sugerencias.pendientes + '</strong><span>Pendientes</span></div>' +
            '<div><strong>' + sugerencias.promedio + '/5</strong><span>Promedio</span></div></div>' +
          '<div class="small muted">' + sugerencias.categorias.slice(0, 4).map(function (c) {
            return window.Util.esc(c.etiqueta) + ': ' + c.valor;
          }).join(' · ') + '</div></div>' +
        '<div class="reporte-card ancho"><h3><span>🏆</span>Productos más vendidos del periodo</h3>' +
          '<p class="reporte-sub">Ranking según unidades pagadas</p><div class="reporte-tabla">' + tablaTop + '</div></div>' +
        '<div class="reporte-card ancho"><h3><span>⭐</span>Clientes frecuentes</h3>' +
          '<p class="reporte-sub">Compras acumuladas en el programa de fidelización</p>' +
          window.AdminUI.tabla({
            datos: window.Reportes.clientesFrecuentes(6),
            vacioTitulo: 'Sin compras registradas',
            vacioTexto: 'Los pedidos entregados y pagados alimentan esta tabla.',
            columnas: [
              { titulo: 'Cliente', render: function (c) { return window.AdminUI.persona(c.cliente, c.correo, 'azul'); } },
              { titulo: 'Compras', render: function (c) { return '<strong>' + c.compras + '</strong>'; } },
              { titulo: 'Tarjetas', campo: 'tarjetas' },
              { titulo: 'Beneficios', campo: 'beneficios' }
            ]
          }) + '</div>' +
      '</div>' +
      '<p class="small muted mt-2" style="text-align:center">Reporte generado el ' + window.Util.fechaHora(new Date()) +
        ' · Clientes registrados: ' + usuarios.length + ' · Datos almacenados en el navegador (localStorage).</p>';

    document.getElementById('rep-desde').addEventListener('change', function (e) {
      periodo.desde = e.target.value;
      if (periodo.desde > periodo.hasta) periodo.hasta = periodo.desde;
      render();
    });
    document.getElementById('rep-hasta').addEventListener('change', function (e) {
      periodo.hasta = e.target.value;
      if (periodo.hasta < periodo.desde) periodo.desde = periodo.hasta;
      render();
    });
    contenido.querySelectorAll('[data-rango]').forEach(function (boton) {
      boton.addEventListener('click', function () {
        const rango = boton.dataset.rango;
        if (rango === 'mes') {
          const hoy = window.Util.hoyISO();
          periodo.desde = hoy.slice(0, 8) + '01';
          periodo.hasta = hoy;
        } else {
          periodo.hasta = window.Util.hoyISO();
          periodo.desde = window.Util.sumarDias(periodo.hasta, -(Number(rango) - 1));
        }
        render();
      });
    });

    document.getElementById('rep-pedidos').addEventListener('click', function () {
      window.Notificaciones.exito('Exportación generada', window.Reportes.exportarPedidos(periodo.desde, periodo.hasta) + ' pedido(s) exportados.');
    });
    document.getElementById('rep-productos').addEventListener('click', function () {
      window.Notificaciones.exito('Exportación generada', window.Reportes.exportarProductos(periodo.desde, periodo.hasta) + ' producto(s) exportados.');
    });
    document.getElementById('rep-clientes').addEventListener('click', function () {
      window.Notificaciones.exito('Exportación generada', window.Reportes.exportarClientes() + ' cliente(s) exportados.');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    contenido = window.AdminUI.montar({
      pagina: 'reportes',
      titulo: 'Reportes',
      subtitulo: 'Ventas, productos, pagos y satisfacción'
    });
    if (!contenido) return;
    render();
    window.Almacen.alCambiar(window.Util.debounce(render, 700));
  });
})();
