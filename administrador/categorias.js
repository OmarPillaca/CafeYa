/* ============================================================
   CafeYa Ica - CRUD y orden de categorías
   ============================================================ */
(function () {
  'use strict';

  let contenido = null;

  function lista() {
    return window.Almacen.listar('categorias').slice().sort(function (a, b) {
      return (Number(a.orden) || 0) - (Number(b.orden) || 0);
    });
  }

  function contarProductos(id) {
    return window.Almacen.listar('productos').filter(function (p) { return p.categoriaId === id; }).length;
  }

  function renderTabla() {
    const zona = document.getElementById('tabla-categorias');
    if (!zona) return;
    const categorias = lista();
    const activas = categorias.filter(function (c) { return c.activa !== false; }).length;
    zona.innerHTML =
      '<div class="categorias-resumen">' +
        '<span><strong>' + categorias.length + '</strong> categorías registradas</span>' +
        '<span><strong>' + activas + '</strong> activas en el menú</span>' +
        '<span><strong>' + window.Almacen.listar('productos').length + '</strong> productos asignados</span>' +
      '</div>' +
      window.AdminUI.tabla({
        datos: categorias,
        vacioTitulo: 'Sin categorías',
        vacioTexto: 'Crea la primera categoría del menú.',
        columnas: [
          { titulo: 'Orden', render: function (c, indice) {
            return '<div class="flex gap-1"><span class="orden-numero">' + (c.orden || indice + 1) + '</span>' +
              '<span class="orden-controles">' +
                '<button type="button" data-mover="' + c.id + '|' + (-1) + '"' + (indice === 0 ? ' disabled' : '') + '>▲</button>' +
                '<button type="button" data-mover="' + c.id + '|' + 1 + '"' + (indice === categorias.length - 1 ? ' disabled' : '') + '>▼</button>' +
              '</span></div>';
          } },
          { titulo: 'Categoría', render: function (c) {
            return '<div class="categoria-celda"><div class="categoria-icono">' + window.Util.esc(c.icono || '🍽️') + '</div>' +
              '<div><strong>' + window.Util.esc(c.nombre) + '</strong><small>' + window.Util.esc(c.descripcion || '') + '</small></div></div>';
          } },
          { titulo: 'Productos', render: function (c) { return '<span class="badge sin-punto">' + contarProductos(c.id) + '</span>'; } },
          { titulo: 'Estado', render: function (c) { return window.Util.badge(c.activa === false ? 'inactiva' : 'activa'); } },
          { titulo: 'Acciones', render: function (c) {
            return '<div class="acciones-fila">' +
              '<button type="button" class="btn btn-sm btn-claro" data-editar="' + c.id + '">Editar</button>' +
              '<button type="button" class="btn btn-sm ' + (c.activa === false ? 'btn-teal' : 'btn-claro') + '" data-activar="' + c.id + '">' +
                (c.activa === false ? 'Activar' : 'Desactivar') + '</button>' +
              '<button type="button" class="btn btn-sm btn-peligro" data-eliminar="' + c.id + '">Eliminar</button></div>';
          } }
        ]
      });
  }

  function abrirFormulario(categoria) {
    const esNueva = !categoria;
    const datos = categoria || { nombre: '', descripcion: '', icono: '🍽️', orden: lista().length + 1, activa: true };
    const caja = window.Modal.abrir({
      titulo: esNueva ? 'Nueva categoría' : 'Editar categoría',
      subtitulo: 'Organiza los productos del menú digital',
      emoji: '🗂️',
      cuerpo:
        '<div class="form-grid">' +
          '<div class="form-grid dos">' +
            '<div class="campo"><label for="cf-nombre">Nombre <span class="req">*</span></label>' +
              '<input id="cf-nombre" value="' + window.Util.esc(datos.nombre) + '" maxlength="40"></div>' +
            '<div class="campo"><label for="cf-icono">Icono (emoji)</label>' +
              '<input id="cf-icono" value="' + window.Util.esc(datos.icono || '🍽️') + '" maxlength="4"></div>' +
          '</div>' +
          '<div class="campo"><label for="cf-descripcion">Descripción</label>' +
            '<textarea id="cf-descripcion" maxlength="140">' + window.Util.esc(datos.descripcion || '') + '</textarea></div>' +
          '<div class="form-grid dos">' +
            '<div class="campo"><label for="cf-orden">Orden en el menú</label>' +
              '<input type="number" id="cf-orden" min="1" max="99" value="' + (datos.orden || 1) + '"></div>' +
            '<div class="campo"><label>Estado</label>' +
              '<label class="check" style="padding-top:10px"><input type="checkbox" id="cf-activa"' + (datos.activa === false ? '' : ' checked') + '> Visible en el menú</label></div>' +
          '</div>' +
        '</div>',
      acciones: '<button class="btn btn-claro" type="button" data-cerrar>Cancelar</button>' +
        '<button class="btn btn-primario" type="button" id="cf-guardar">Guardar categoría</button>'
    });
    caja.querySelector('#cf-guardar').addEventListener('click', function () {
      const nombre = caja.querySelector('#cf-nombre').value.trim();
      const descripcion = caja.querySelector('#cf-descripcion').value.trim();
      if (nombre.length < 3) {
        window.Notificaciones.error('Nombre inválido', 'Ingresa un nombre de al menos 3 caracteres.');
        return;
      }
      const cambios = {
        nombre: nombre,
        descripcion: descripcion,
        icono: caja.querySelector('#cf-icono').value.trim() || '🍽️',
        orden: Number(caja.querySelector('#cf-orden').value) || 1,
        activa: caja.querySelector('#cf-activa').checked
      };
      if (esNueva) window.Almacen.crear('categorias', cambios);
      else window.Almacen.actualizar('categorias', datos.id, cambios);
      window.Modal.cerrar();
      window.Notificaciones.exito(esNueva ? 'Categoría creada' : 'Categoría actualizada', nombre);
      renderTabla();
    });
  }

  function mover(id, direccion) {
    const categorias = lista();
    const indice = categorias.findIndex(function (c) { return c.id === id; });
    const destino = indice + direccion;
    if (indice < 0 || destino < 0 || destino >= categorias.length) return;
    const actual = categorias[indice];
    const vecina = categorias[destino];
    const ordenActual = Number(actual.orden) || indice + 1;
    const ordenVecina = Number(vecina.orden) || destino + 1;
    window.Almacen.actualizar('categorias', actual.id, { orden: ordenVecina });
    window.Almacen.actualizar('categorias', vecina.id, { orden: ordenActual });
    renderTabla();
  }

  document.addEventListener('DOMContentLoaded', function () {
    contenido = window.AdminUI.montar({
      pagina: 'categorias',
      titulo: 'Categorías',
      subtitulo: 'Ordena y administra las secciones del menú'
    });
    if (!contenido) return;

    contenido.innerHTML =
      '<div class="card">' +
        '<div class="tabla-toolbar">' +
          '<div><h2 style="font-size:15px;margin:0">Categorías del menú</h2>' +
          '<p class="small muted" style="margin:2px 0 0">El orden definido aquí se refleja en el menú del cliente.</p></div>' +
          '<button type="button" class="btn btn-primario btn-sm" id="cf-nueva">+ Nueva categoría</button>' +
        '</div>' +
        '<div id="tabla-categorias"></div>' +
      '</div>';

    document.getElementById('cf-nueva').addEventListener('click', function () { abrirFormulario(null); });

    contenido.addEventListener('click', function (evento) {
      const editar = evento.target.closest('[data-editar]');
      if (editar) { abrirFormulario(window.Almacen.buscar('categorias', editar.dataset.editar)); return; }
      const activar = evento.target.closest('[data-activar]');
      if (activar) {
        const categoria = window.Almacen.buscar('categorias', activar.dataset.activar);
        window.Almacen.actualizar('categorias', categoria.id, { activa: categoria.activa === false });
        window.Notificaciones.info('Estado actualizado', categoria.nombre + ' quedó ' + (categoria.activa === false ? 'activa' : 'inactiva') + '.');
        renderTabla();
        return;
      }
      const moverBoton = evento.target.closest('[data-mover]');
      if (moverBoton) {
        const partes = moverBoton.dataset.mover.split('|');
        mover(partes[0], Number(partes[1]));
        return;
      }
      const eliminar = evento.target.closest('[data-eliminar]');
      if (eliminar) {
        const categoria = window.Almacen.buscar('categorias', eliminar.dataset.eliminar);
        const productos = contarProductos(categoria.id);
        if (productos > 0) {
          window.Notificaciones.error('Categoría en uso', 'Tiene ' + productos + ' producto(s). Reasígnalos antes de eliminarla.');
          return;
        }
        window.Modal.confirmar({
          titulo: 'Eliminar categoría',
          mensaje: 'Se eliminará la categoría "' + categoria.nombre + '".',
          peligro: true,
          textoOk: 'Sí, eliminar'
        }).then(function (confirmado) {
          if (!confirmado) return;
          window.Almacen.eliminar('categorias', categoria.id);
          renderTabla();
          window.Notificaciones.exito('Categoría eliminada', 'El menú se actualizó.');
        });
      }
    });

    renderTabla();
    window.Almacen.alCambiar(window.Util.debounce(renderTabla, 500));
  });
})();
