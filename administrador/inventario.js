/* ============================================================
   CafeYa Ica - Inventario demostrativo
   ============================================================ */
(function () {
  'use strict';

  let contenido = null;
  const filtros = { busqueda: '', estado: 'todos' };

  function lista() {
    return window.Almacen.listar('inventario').slice().sort(function (a, b) {
      return String(a.insumo).localeCompare(String(b.insumo));
    });
  }

  function bajo(item) { return Number(item.stock) <= Number(item.stockMinimo); }

  function render() {
    const items = lista();
    const bajos = items.filter(bajo);
    const totalMovimientos = items.reduce(function (s, i) { return s + (i.movimientos || []).length; }, 0);

    contenido.innerHTML =
      '<div class="grid grid-4">' +
        window.AdminUI.stat(items.length, 'Insumos registrados', 'inventario', '') +
        window.AdminUI.stat(bajos.length, 'Insumos en stock mínimo', 'alerta', 'terracota') +
        window.AdminUI.stat(items.length - bajos.length, 'Insumos con stock adecuado', 'check', 'menta') +
        window.AdminUI.stat(totalMovimientos, 'Movimientos registrados', 'reportes', 'azul') +
      '</div>' +
      (bajos.length
        ? '<div class="inventario-alerta mt-2"><span>⚠️</span><div><strong>Alerta de bajo inventario</strong>' +
          bajos.length + ' insumo(s) están en o por debajo del stock mínimo: ' +
          bajos.map(function (i) { return i.insumo; }).join(', ') + '. Registra una entrada para reponerlos.</div></div>'
        : '') +
      '<div class="card mt-2">' +
        '<div class="panel-filtros">' +
          '<div class="buscador grow">' + window.Util.svg('buscar') +
            '<input id="inv-buscar" type="search" placeholder="Buscar insumo..."></div>' +
          '<select id="inv-estado"><option value="todos">Todos</option><option value="bajos">Solo stock mínimo</option>' +
            '<option value="ok">Stock adecuado</option></select>' +
          '<button type="button" class="btn btn-primario btn-sm" id="inv-nuevo">+ Nuevo insumo</button>' +
        '</div>' +
        '<div id="tabla-inventario"></div>' +
      '</div>' +
      '<div class="alerta mt-2"><span class="alerta-icono">ℹ️</span><div><strong>Módulo demostrativo</strong>' +
        'Los movimientos de entrada y salida actualizan el stock y quedan registrados con fecha y nota.</div></div>';

    renderTabla();

    document.getElementById('inv-buscar').addEventListener('input', window.Util.debounce(function (e) {
      filtros.busqueda = e.target.value; renderTabla();
    }, 220));
    document.getElementById('inv-estado').addEventListener('change', function (e) {
      filtros.estado = e.target.value; renderTabla();
    });
    document.getElementById('inv-nuevo').addEventListener('click', function () { formulario(null); });

    contenido.addEventListener('click', function (evento) {
      const entrada = evento.target.closest('[data-entrada]');
      if (entrada) { movimiento(window.Almacen.buscar('inventario', entrada.dataset.entrada), 'entrada'); return; }
      const salida = evento.target.closest('[data-salida]');
      if (salida) { movimiento(window.Almacen.buscar('inventario', salida.dataset.salida), 'salida'); return; }
      const editar = evento.target.closest('[data-editar]');
      if (editar) { formulario(window.Almacen.buscar('inventario', editar.dataset.editar)); return; }
      const eliminar = evento.target.closest('[data-eliminar]');
      if (eliminar) {
        const item = window.Almacen.buscar('inventario', eliminar.dataset.eliminar);
        window.Modal.confirmar({
          titulo: 'Eliminar insumo',
          mensaje: 'Se eliminará "' + item.insumo + '" y su historial de movimientos.',
          peligro: true,
          textoOk: 'Sí, eliminar'
        }).then(function (confirmado) {
          if (!confirmado) return;
          window.Almacen.eliminar('inventario', item.id);
          render();
          window.Notificaciones.exito('Insumo eliminado', item.insumo);
        });
      }
    });
  }

  function renderTabla() {
    const zona = document.getElementById('tabla-inventario');
    if (!zona) return;
    let items = lista();
    if (filtros.estado === 'bajos') items = items.filter(bajo);
    if (filtros.estado === 'ok') items = items.filter(function (i) { return !bajo(i); });
    items = window.AdminUI.filtrar(items, filtros.busqueda, ['insumo', 'unidad']);

    zona.innerHTML = window.AdminUI.tabla({
      datos: items,
      vacioTitulo: 'Sin insumos',
      vacioTexto: 'Registra el primer insumo del inventario.',
      columnas: [
        { titulo: 'Insumo', render: function (i) {
          return '<div class="inventario-insumo"><strong>' + window.Util.esc(i.insumo) + '</strong>' +
            '<small>' + window.Util.esc(i.unidad) + ' · mínimo ' + i.stockMinimo + '</small></div>';
        } },
        { titulo: 'Stock actual', render: function (i) {
          const porcentaje = Math.min(100, Math.round((Number(i.stock) / Math.max(1, Number(i.stockMinimo) * 2)) * 100));
          return '<div class="stock-celda' + (bajo(i) ? ' bajo' : '') + '">' +
            '<div class="stock-numero"><strong>' + i.stock + ' ' + window.Util.esc(i.unidad) + '</strong><span>mín. ' + i.stockMinimo + '</span></div>' +
            '<div class="progress"><span style="width:' + porcentaje + '%"></span></div></div>';
        } },
        { titulo: 'Estado', render: function (i) {
          return window.Util.badge(bajo(i) ? 'cancelado' : 'disponible', bajo(i) ? 'Stock mínimo' : 'Adecuado');
        } },
        { titulo: 'Último movimiento', render: function (i) {
          const ultimo = (i.movimientos || [])[(i.movimientos || []).length - 1];
          return ultimo ? '<span class="small">' + (ultimo.tipo === 'entrada' ? 'Entrada' : 'Salida') + ' de ' + ultimo.cantidad +
            '<br><span class="muted">' + window.Util.fechaHora(ultimo.fecha) + '</span></span>' : '<span class="small muted">Sin movimientos</span>';
        } },
        { titulo: 'Acciones', render: function (i) {
          return '<div class="acciones-fila">' +
            '<button type="button" class="btn btn-sm btn-teal" data-entrada="' + i.id + '">+ Entrada</button>' +
            '<button type="button" class="btn btn-sm btn-claro" data-salida="' + i.id + '">− Salida</button>' +
            '<button type="button" class="btn btn-sm btn-claro" data-editar="' + i.id + '">Editar</button>' +
            '<button type="button" class="btn btn-sm btn-peligro" data-eliminar="' + i.id + '">Eliminar</button></div>';
        } }
      ]
    });
  }

  function movimiento(item, tipo) {
    const caja = window.Modal.abrir({
      titulo: tipo === 'entrada' ? 'Registrar entrada' : 'Registrar salida',
      subtitulo: item.insumo + ' · stock actual ' + item.stock + ' ' + item.unidad,
      emoji: tipo === 'entrada' ? '📥' : '📤',
      cuerpo:
        '<div class="form-grid">' +
          '<div class="campo"><label for="mv-cantidad">Cantidad (' + window.Util.esc(item.unidad) + ')</label>' +
            '<input type="number" id="mv-cantidad" min="1" step="1" value="1"></div>' +
          '<div class="campo"><label for="mv-nota">Nota del movimiento</label>' +
            '<input id="mv-nota" maxlength="90" placeholder="Ej. compra a proveedor, merma, consumo del día..."></div>' +
          '<div class="alerta"><span class="alerta-icono">📦</span><div><strong>Stock mínimo: ' + item.stockMinimo + ' ' + window.Util.esc(item.unidad) + '</strong>' +
            'El sistema mostrará una alerta cuando el stock quede en el mínimo.</div></div>' +
        '</div>',
      acciones: '<button class="btn btn-claro" type="button" data-cerrar>Cancelar</button>' +
        '<button class="btn ' + (tipo === 'entrada' ? 'btn-teal' : 'btn-primario') + '" type="button" id="mv-guardar">Registrar ' + tipo + '</button>'
    });
    caja.querySelector('#mv-guardar').addEventListener('click', function () {
      const cantidad = Number(caja.querySelector('#mv-cantidad').value);
      if (!cantidad || cantidad <= 0) {
        window.Notificaciones.error('Cantidad inválida', 'Ingresa una cantidad mayor a cero.');
        return;
      }
      if (tipo === 'salida' && cantidad > Number(item.stock)) {
        window.Notificaciones.error('Stock insuficiente', 'Solo hay ' + item.stock + ' ' + item.unidad + ' disponibles.');
        return;
      }
      const nota = caja.querySelector('#mv-nota').value.trim();
      const nuevoStock = tipo === 'entrada' ? Number(item.stock) + cantidad : Number(item.stock) - cantidad;
      const movimientos = (item.movimientos || []).concat([{
        fecha: new Date().toISOString(), tipo: tipo, cantidad: cantidad, nota: nota || 'Movimiento manual'
      }]);
      window.Almacen.actualizar('inventario', item.id, {
        stock: nuevoStock,
        movimientos: movimientos,
        actualizadoEn: new Date().toISOString()
      });
      window.Modal.cerrar();
      window.Notificaciones.exito('Movimiento registrado', item.insumo + ': ' + (tipo === 'entrada' ? '+' : '−') + cantidad + ' ' + item.unidad);
      if (nuevoStock <= Number(item.stockMinimo)) {
        window.Notificaciones.aviso('Alerta de inventario', item.insumo + ' quedó en stock mínimo (' + nuevoStock + ').');
      }
      render();
    });
  }

  function formulario(item) {
    const esNuevo = !item;
    const datos = item || { insumo: '', unidad: 'kg', stock: 0, stockMinimo: 1 };
    const caja = window.Modal.abrir({
      titulo: esNuevo ? 'Nuevo insumo' : 'Editar insumo',
      subtitulo: 'Control de existencias del local',
      emoji: '📦',
      cuerpo:
        '<div class="form-grid">' +
          '<div class="campo"><label for="if-insumo">Nombre del insumo <span class="req">*</span></label>' +
            '<input id="if-insumo" value="' + window.Util.esc(datos.insumo) + '" maxlength="60"></div>' +
          '<div class="form-grid tres">' +
            '<div class="campo"><label for="if-unidad">Unidad</label>' +
              '<select id="if-unidad">' + ['kg', 'litros', 'unidades', 'cajas', 'gramos'].map(function (u) {
                return '<option' + (datos.unidad === u ? ' selected' : '') + '>' + u + '</option>';
              }).join('') + '</select></div>' +
            '<div class="campo"><label for="if-stock">Stock actual</label>' +
              '<input type="number" id="if-stock" min="0" step="1" value="' + (datos.stock || 0) + '"></div>' +
            '<div class="campo"><label for="if-minimo">Stock mínimo</label>' +
              '<input type="number" id="if-minimo" min="1" step="1" value="' + (datos.stockMinimo || 1) + '"></div>' +
          '</div>' +
        '</div>',
      acciones: '<button class="btn btn-claro" type="button" data-cerrar>Cancelar</button>' +
        '<button class="btn btn-primario" type="button" id="if-guardar">Guardar insumo</button>'
    });
    caja.querySelector('#if-guardar').addEventListener('click', function () {
      const insumo = caja.querySelector('#if-insumo').value.trim();
      const stock = Number(caja.querySelector('#if-stock').value);
      const minimo = Number(caja.querySelector('#if-minimo').value);
      if (insumo.length < 3) { window.Notificaciones.error('Nombre inválido', 'Ingresa el nombre del insumo.'); return; }
      if (stock < 0 || minimo < 1) { window.Notificaciones.error('Valores inválidos', 'Revisa el stock y el mínimo.'); return; }
      const cambios = {
        insumo: insumo,
        unidad: caja.querySelector('#if-unidad').value,
        stock: stock,
        stockMinimo: minimo
      };
      if (esNuevo) window.Almacen.crear('inventario', Object.assign({ movimientos: [] }, cambios));
      else window.Almacen.actualizar('inventario', datos.id, cambios);
      window.Modal.cerrar();
      window.Notificaciones.exito(esNuevo ? 'Insumo registrado' : 'Insumo actualizado', insumo);
      render();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    contenido = window.AdminUI.montar({
      pagina: 'inventario',
      titulo: 'Inventario',
      subtitulo: 'Existencias, entradas, salidas y alertas de stock'
    });
    if (!contenido) return;
    render();
    window.Almacen.alCambiar(window.Util.debounce(render, 500));
  });
})();
