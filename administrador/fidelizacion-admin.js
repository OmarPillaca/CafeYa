/* ============================================================
   CafeYa Ica - Administración de fidelización
   ============================================================ */
(function () {
  'use strict';

  let contenido = null;
  const filtros = { busqueda: '', tipo: 'todos' };

  function filas() {
    return window.Fidelizacion.listar().map(function (registro) {
      return {
        registro: registro,
        tarjeta: window.Fidelizacion.tarjeta(registro.usuarioId),
        usuario: window.Almacen.buscar('usuarios', registro.usuarioId) || {}
      };
    });
  }

  function slots(enTarjeta, meta, clase) {
    let html = '<div class="fid-slots ' + (clase || '') + '">';
    for (let i = 1; i <= meta; i++) {
      html += '<span class="' + (i <= enTarjeta ? 'lleno' : '') + '">' + (i <= enTarjeta ? '✓' : i) + '</span>';
    }
    return html + '</div>';
  }

  function renderTabla() {
    const zona = document.getElementById('tabla-fidelizacion');
    if (!zona) return;
    let lista = filas();
    if (filtros.tipo === 'completas') lista = lista.filter(function (f) { return f.tarjeta.completadas > 0; });
    if (filtros.tipo === 'beneficios') lista = lista.filter(function (f) { return f.tarjeta.beneficios > 0; });
    if (filtros.tipo === 'sin-compras') lista = lista.filter(function (f) { return f.tarjeta.compras === 0; });
    lista = window.AdminUI.filtrar(lista, filtros.busqueda, []).filter(function (f) {
      const texto = String(filtros.busqueda || '').toLowerCase();
      if (!texto) return true;
      return String(f.usuario.nombre || f.registro.cliente || '').toLowerCase().indexOf(texto) > -1 ||
        String(f.usuario.correo || '').toLowerCase().indexOf(texto) > -1;
    });

    zona.innerHTML = window.AdminUI.tabla({
      datos: lista,
      vacioTitulo: 'Sin registros de fidelización',
      vacioTexto: 'Las compras entregadas y pagadas generan la tarjeta de 5 compras.',
      columnas: [
        { titulo: 'Cliente', render: function (f) {
          return window.AdminUI.persona(f.usuario.nombre || f.registro.cliente, f.usuario.correo || '', 'azul');
        } },
        { titulo: 'Compras', render: function (f) {
          return '<span class="dato-destacado">' + f.tarjeta.compras + '</span><div class="small muted">Meta: ' + f.tarjeta.meta + '</div>';
        } },
        { titulo: 'Tarjeta actual', render: function (f) { return slots(f.tarjeta.enTarjeta, f.tarjeta.meta); } },
        { titulo: 'Completadas', render: function (f) { return '<span class="dato-destacado">' + f.tarjeta.completadas + '</span>'; } },
        { titulo: 'Beneficios', render: function (f) {
          return f.tarjeta.beneficios > 0
            ? '<span class="fid-beneficio-chip">☕ ' + f.tarjeta.beneficios + ' disponible(s)</span>'
            : '<span class="fid-beneficio-chip sin">Sin beneficios</span>';
        } },
        { titulo: 'Acciones', render: function (f) {
          return '<button type="button" class="btn btn-sm btn-claro" data-ver="' + f.registro.usuarioId + '">Ver tarjeta</button>';
        } }
      ]
    });
  }

  function verTarjeta(usuarioId) {
    const usuario = window.Almacen.buscar('usuarios', usuarioId) || {};
    const tarjeta = window.Fidelizacion.tarjeta(usuarioId);
    const pedidos = window.Pedidos.porUsuario(usuarioId).slice(0, 5);
    const historial = pedidos.map(function (p) {
      return '<div class="detalle-linea"><span>' + window.Util.esc(p.codigo) + ' · ' + window.Util.fecha(p.creadoEn) + '</span>' +
        '<strong>' + window.Util.soles(p.total) + ' · ' + window.Util.etiqueta(p.estado) + '</strong></div>';
    }).join('');
    window.Modal.abrir({
      titulo: 'Tarjeta de ' + (usuario.nombre || 'Cliente'),
      subtitulo: 'Programa de cliente frecuente',
      emoji: '⭐',
      tamano: 'mediano',
      cuerpo:
        '<div class="fid-tarjeta-grande">' +
          '<p>Cliente frecuente</p><h4>' + window.Util.esc(usuario.nombre || 'Cliente') + '</h4>' +
          slots(tarjeta.enTarjeta, tarjeta.meta, 'fid-slots') +
          '<div class="fid-pie"><span>' + tarjeta.compras + ' compras acumuladas</span><span>' + tarjeta.beneficios + ' beneficio(s)</span></div>' +
        '</div>' +
        '<div class="cliente-metricas">' +
          '<div><strong>' + tarjeta.enTarjeta + '/5</strong><span>En tarjeta</span></div>' +
          '<div><strong>' + tarjeta.pendientes + '</strong><span>Faltan</span></div>' +
          '<div><strong>' + tarjeta.completadas + '</strong><span>Completadas</span></div>' +
          '<div><strong>' + tarjeta.beneficios + '</strong><span>Beneficios</span></div>' +
        '</div>' +
        '<div class="alerta"><span class="alerta-icono">🎁</span><div><strong>Beneficio</strong>' +
          'Al completar 5 compras el cliente obtiene una bebida gratuita. El canje se habilitará en una fase posterior.</div></div>' +
        '<div class="mt-2"><strong class="small color-azul">Últimos pedidos</strong>' +
          (historial || '<p class="small muted mt-1">Sin pedidos entregados.</p>') + '</div>',
      acciones: '<button class="btn btn-claro" type="button" data-cerrar>Cerrar</button>'
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    contenido = window.AdminUI.montar({
      pagina: 'fidelizacion-admin',
      titulo: 'Fidelización',
      subtitulo: 'Tarjetas de 5 compras y beneficios'
    });
    if (!contenido) return;

    const resumen = window.Fidelizacion.resumen();
    contenido.innerHTML =
      '<div class="grid grid-4">' +
        window.AdminUI.stat(resumen.clientes, 'Clientes en el programa', 'usuarios', '') +
        window.AdminUI.stat(resumen.compras, 'Compras acumuladas', 'cafe', 'azul') +
        window.AdminUI.stat(resumen.tarjetasCompletas, 'Tarjetas completadas', 'fidelizacion', 'menta') +
        window.AdminUI.stat(resumen.beneficiosDisponibles, 'Beneficios disponibles', 'estrella', 'terracota') +
      '</div>' +
      '<div class="card mt-2">' +
        '<div class="panel-filtros">' +
          '<div class="buscador grow">' + window.Util.svg('buscar') +
            '<input id="fid-buscar" type="search" placeholder="Buscar cliente..."></div>' +
          '<select id="fid-tipo"><option value="todos">Todos los clientes</option>' +
            '<option value="completas">Con tarjetas completas</option>' +
            '<option value="beneficios">Con beneficios disponibles</option>' +
            '<option value="sin-compras">Sin compras</option></select>' +
          '<button type="button" class="btn btn-claro btn-sm" id="fid-exportar">Exportar CSV</button>' +
        '</div>' +
        '<div id="tabla-fidelizacion"></div>' +
      '</div>' +
      '<div class="alerta mt-2"><span class="alerta-icono">🔄</span><div><strong>Actualización automática</strong>' +
        'La tarjeta se actualiza cuando un pedido queda <strong>entregado</strong> y su pago está <strong>aprobado</strong>.</div></div>';

    document.getElementById('fid-buscar').addEventListener('input', window.Util.debounce(function (e) {
      filtros.busqueda = e.target.value; renderTabla();
    }, 220));
    document.getElementById('fid-tipo').addEventListener('change', function (e) {
      filtros.tipo = e.target.value; renderTabla();
    });
    document.getElementById('fid-exportar').addEventListener('click', function () {
      const cantidad = window.Reportes.exportarClientes();
      window.Notificaciones.exito('Reporte exportado', cantidad + ' cliente(s) incluidos en el CSV.');
    });

    contenido.addEventListener('click', function (evento) {
      const ver = evento.target.closest('[data-ver]');
      if (ver) verTarjeta(ver.dataset.ver);
    });

    renderTabla();
    window.Almacen.alCambiar(window.Util.debounce(function () {
      window.Fidelizacion.sincronizar();
      renderTabla();
    }, 600));
  });
})();
