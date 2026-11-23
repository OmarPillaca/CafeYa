/* ============================================================
   CafeYa Ica - Administración de promociones y combos
   ============================================================ */
(function () {
  'use strict';

  let contenido = null;

  function productosDisponibles() {
    return window.Almacen.listar('productos').filter(function (p) { return p.categoriaId !== 'cat-combos'; });
  }

  function renderTabla() {
    const zona = document.getElementById('tabla-promociones');
    if (!zona) return;
    const promociones = window.Promociones.todas().slice().sort(function (a, b) {
      return Number(b.activa !== false) - Number(a.activa !== false);
    });
    zona.innerHTML = window.AdminUI.tabla({
      datos: promociones,
      vacioTitulo: 'Sin promociones',
      vacioTexto: 'Crea una promoción para que aparezca en la página principal y en el menú.',
      columnas: [
        { titulo: 'Promoción', render: function (p) {
          return window.AdminUI.persona(p.titulo, p.descripcion, 'terracota');
        } },
        { titulo: 'Tipo', render: function (p) {
          return '<div class="promo-tipo-celda"><strong>' + (p.tipo === 'porcentaje' ? 'Descuento' : 'Combo') + '</strong>' +
            '<small>' + (p.tipo === 'porcentaje' ? p.descuento + '% de descuento' : 'Precio especial S/ ' + Number(p.precioCombo || 0).toFixed(2)) + '</small></div>';
        } },
        { titulo: 'Vigencia', render: function (p) {
          return '<div class="promo-vigencia"><strong>' + window.Util.fecha(p.vigenciaDesde) + '</strong> al ' +
            window.Util.fecha(p.vigenciaHasta) + '<div class="promo-horario">' + (p.horaInicio || '—') + ' a ' + (p.horaFin || '—') + '</div></div>';
        } },
        { titulo: 'Alcance', render: function (p) {
          if (p.categoria) {
            const categoria = window.Almacen.buscar('categorias', p.categoria);
            return '<span class="small">Categoría: ' + window.Util.esc(categoria ? categoria.nombre : '—') + '</span>';
          }
          return '<span class="small">' + (p.productos || []).length + ' producto(s)</span>';
        } },
        { titulo: 'Estado', render: function (p) {
          return window.Util.badge(p.activa === false ? 'inactiva' : 'activa') +
            (window.Promociones.vigente(p) && p.activa !== false ? ' <span class="badge badge-destacado">Vigente</span>' : '');
        } },
        { titulo: 'Acciones', render: function (p) {
          return '<div class="acciones-fila">' +
            '<button type="button" class="btn btn-sm btn-claro" data-editar="' + p.id + '">Editar</button>' +
            '<button type="button" class="btn btn-sm ' + (p.activa === false ? 'btn-teal' : 'btn-claro') + '" data-activar="' + p.id + '">' +
              (p.activa === false ? 'Activar' : 'Pausar') + '</button>' +
            '<button type="button" class="btn btn-sm btn-peligro" data-eliminar="' + p.id + '">Eliminar</button></div>';
        } }
      ]
    }) + '<div class="alerta mt-2"><span class="alerta-icono">💡</span><div><strong>Visibilidad inmediata</strong>' +
      'Las promociones activas aparecen en la página principal y sus precios se aplican automáticamente en el carrito.</div></div>';
  }

  function abrirFormulario(promocion) {
    const esNueva = !promocion;
    const datos = promocion || {
      titulo: '', descripcion: '', tipo: 'porcentaje', descuento: 10, precioCombo: '',
      productos: [], categoria: '', vigenciaDesde: window.Util.hoyISO(), vigenciaHasta: window.Util.inputFecha(30),
      horaInicio: '08:00', horaFin: '22:00', activa: true, destacada: false
    };
    const categorias = window.Almacen.listar('categorias');
    const productos = productosDisponibles();
    const seleccionados = datos.productos || [];

    const caja = window.Modal.abrir({
      titulo: esNueva ? 'Nueva promoción' : 'Editar promoción',
      subtitulo: 'Define el descuento, la vigencia y los productos incluidos',
      emoji: '🏷️',
      tamano: 'grande',
      cuerpo:
        '<div class="form-grid">' +
          '<div class="form-grid dos">' +
            '<div class="campo"><label for="pr-titulo">Título <span class="req">*</span></label>' +
              '<input id="pr-titulo" value="' + window.Util.esc(datos.titulo) + '" maxlength="60"></div>' +
            '<div class="campo"><label for="pr-tipo">Tipo de promoción</label>' +
              '<select id="pr-tipo"><option value="porcentaje"' + (datos.tipo === 'porcentaje' ? ' selected' : '') + '>Descuento porcentual</option>' +
              '<option value="combo"' + (datos.tipo === 'combo' ? ' selected' : '') + '>Combo con precio fijo</option></select></div>' +
          '</div>' +
          '<div class="campo"><label for="pr-descripcion">Descripción <span class="req">*</span></label>' +
            '<input id="pr-descripcion" value="' + window.Util.esc(datos.descripcion) + '" maxlength="150"></div>' +
          '<div class="form-grid tres">' +
            '<div class="campo"><label id="etiqueta-descuento">Descuento (%)</label>' +
              '<input type="number" id="pr-descuento" min="1" max="90" value="' + (datos.descuento || 10) + '"></div>' +
            '<div class="campo"><label>Precio del combo (S/)</label>' +
              '<input type="number" id="pr-combo" min="1" step="0.5" value="' + (datos.precioCombo || '') + '"></div>' +
            '<div class="campo"><label for="pr-categoria">Categoría objetivo</label>' +
              '<select id="pr-categoria">' + window.AdminUI.opciones(categorias, 'id', 'nombre', datos.categoria, 'Sin categoría específica') + '</select></div>' +
          '</div>' +
          '<div class="campo"><label>Productos incluidos</label>' +
            '<div class="promo-productos-lista">' +
              productos.map(function (p) {
                return '<label><input type="checkbox" data-prod value="' + p.id + '"' +
                  (seleccionados.indexOf(p.id) > -1 ? ' checked' : '') + '> ' + window.Util.esc(p.nombre) +
                  ' · <span class="muted">' + window.Util.soles(p.precio) + '</span></label>';
              }).join('') +
            '</div>' +
            '<span class="ayuda">Para un combo selecciona al menos dos productos. Para descuentos puedes elegir producto(s) o una categoría.</span></div>' +
          '<div class="form-grid tres">' +
            '<div class="campo"><label for="pr-desde">Vigencia desde</label><input type="date" id="pr-desde" value="' + datos.vigenciaDesde + '"></div>' +
            '<div class="campo"><label for="pr-hasta">Vigencia hasta</label><input type="date" id="pr-hasta" value="' + datos.vigenciaHasta + '"></div>' +
            '<div class="campo"><label>Horario</label><div class="flex gap-1"><input type="time" id="pr-hora-inicio" value="' + (datos.horaInicio || '08:00') + '">' +
              '<input type="time" id="pr-hora-fin" value="' + (datos.horaFin || '22:00') + '"></div></div>' +
          '</div>' +
          '<div class="flex-wrap">' +
            '<label class="check"><input type="checkbox" id="pr-activa"' + (datos.activa === false ? '' : ' checked') + '> Promoción activa</label>' +
            '<label class="check"><input type="checkbox" id="pr-destacada"' + (datos.destacada ? ' checked' : '') + '> Destacar en la página principal</label>' +
          '</div>' +
        '</div>',
      acciones: '<button class="btn btn-claro" type="button" data-cerrar>Cancelar</button>' +
        '<button class="btn btn-primario" type="button" id="pr-guardar">Guardar promoción</button>'
    });

    caja.querySelector('#pr-guardar').addEventListener('click', function () {
      const titulo = caja.querySelector('#pr-titulo').value.trim();
      const descripcion = caja.querySelector('#pr-descripcion').value.trim();
      const tipo = caja.querySelector('#pr-tipo').value;
      const categoria = caja.querySelector('#pr-categoria').value;
      const desde = caja.querySelector('#pr-desde').value;
      const hasta = caja.querySelector('#pr-hasta').value;
      const productosElegidos = Array.prototype.slice.call(caja.querySelectorAll('[data-prod]:checked')).map(function (i) { return i.value; });
      const descuento = Number(caja.querySelector('#pr-descuento').value);
      const precioCombo = Number(caja.querySelector('#pr-combo').value);

      if (titulo.length < 4) { window.Notificaciones.error('Título inválido', 'Ingresa un título de al menos 4 caracteres.'); return; }
      if (!desde || !hasta || desde > hasta) { window.Notificaciones.error('Vigencia inválida', 'Revisa las fechas de vigencia.'); return; }
      if (tipo === 'porcentaje' && (!descuento || descuento < 1 || descuento > 90)) {
        window.Notificaciones.error('Descuento inválido', 'El descuento debe estar entre 1% y 90%.');
        return;
      }
      if (tipo === 'combo' && (!precioCombo || precioCombo <= 0)) {
        window.Notificaciones.error('Precio del combo', 'Ingresa el precio especial del combo.'); return;
      }
      if (tipo === 'combo' && productosElegidos.length < 2) {
        window.Notificaciones.error('Combo incompleto', 'Selecciona al menos dos productos para el combo.'); return;
      }
      if (tipo === 'porcentaje' && !categoria && !productosElegidos.length) {
        window.Notificaciones.error('Alcance pendiente', 'Selecciona productos o una categoría objetivo.'); return;
      }

      const cambios = {
        titulo: titulo,
        descripcion: descripcion,
        tipo: tipo,
        descuento: tipo === 'porcentaje' ? descuento : Number((100 - (precioCombo / Math.max(1, productosElegidos.reduce(function (s, id) {
          const producto = window.Almacen.buscar('productos', id);
          return s + (producto ? producto.precio : 0);
        }, 0))) * 100).toFixed(0)),
        precioCombo: tipo === 'combo' ? precioCombo : null,
        productos: productosElegidos,
        categoria: categoria || null,
        vigenciaDesde: desde,
        vigenciaHasta: hasta,
        horaInicio: caja.querySelector('#pr-hora-inicio').value || '00:00',
        horaFin: caja.querySelector('#pr-hora-fin').value || '23:59',
        activa: caja.querySelector('#pr-activa').checked,
        destacada: caja.querySelector('#pr-destacada').checked
      };

      let guardada = promocion;
      if (esNueva) {
        guardada = window.Almacen.crear('promociones', cambios);
      } else {
        guardada = window.Almacen.actualizar('promociones', promocion.id, cambios);
      }

      if (tipo === 'combo') {
        const precios = productosElegidos.map(function (id) {
          const producto = window.Almacen.buscar('productos', id);
          return producto ? producto.precio : 0;
        });
        const suma = window.Util.redondear(precios.reduce(function (a, b) { return a + b; }, 0));
        const productoExistente = guardada.productoId ? window.Almacen.buscar('productos', guardada.productoId) : null;
        if (productoExistente) {
          window.Almacen.actualizar('productos', productoExistente.id, {
            nombre: titulo, descripcion: descripcion, precio: suma, precioPromo: precioCombo,
            disponible: true, destacado: true, imagen: productoExistente.imagen
          });
        } else {
          const nuevo = window.Almacen.crear('productos', {
            nombre: titulo,
            descripcion: descripcion,
            precio: suma,
            precioPromo: precioCombo,
            categoriaId: 'cat-combos',
            imagen: (window.Almacen.buscar('productos', productosElegidos[0]) || {}).imagen || '',
            emoji: '🎁',
            disponible: true,
            destacado: true,
            tags: ['promo', 'combo'],
            promoId: guardada.id
          });
          window.Almacen.actualizar('promociones', guardada.id, { productoId: nuevo.id });
        }
      } else if (guardada.productoId) {
        window.Almacen.actualizar('productos', guardada.productoId, { disponible: false });
      }

      window.Modal.cerrar();
      window.Notificaciones.exito(esNueva ? 'Promoción creada' : 'Promoción actualizada',
        'Visible en la página principal y en el menú según su vigencia.');
      renderTabla();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    contenido = window.AdminUI.montar({
      pagina: 'promociones',
      titulo: 'Promociones',
      subtitulo: 'Descuentos, combos y precios especiales'
    });
    if (!contenido) return;

    contenido.innerHTML =
      '<div class="card">' +
        '<div class="tabla-toolbar">' +
          '<div><h2 style="font-size:15px;margin:0">Promociones registradas</h2>' +
          '<p class="small muted" style="margin:2px 0 0">Los descuentos se aplican automáticamente en el carrito del cliente.</p></div>' +
          '<button type="button" class="btn btn-primario btn-sm" id="pr-nueva">+ Nueva promoción</button>' +
        '</div>' +
        '<div id="tabla-promociones"></div>' +
      '</div>';

    document.getElementById('pr-nueva').addEventListener('click', function () { abrirFormulario(null); });

    contenido.addEventListener('click', function (evento) {
      const editar = evento.target.closest('[data-editar]');
      if (editar) { abrirFormulario(window.Promociones.porId(editar.dataset.editar)); return; }
      const activar = evento.target.closest('[data-activar]');
      if (activar) {
        const promo = window.Promociones.porId(activar.dataset.activar);
        window.Almacen.actualizar('promociones', promo.id, { activa: promo.activa === false });
        window.Notificaciones.info('Estado actualizado', promo.titulo + ' quedó ' + (promo.activa === false ? 'activa' : 'pausada') + '.');
        renderTabla();
        return;
      }
      const eliminar = evento.target.closest('[data-eliminar]');
      if (eliminar) {
        const promo = window.Promociones.porId(eliminar.dataset.eliminar);
        window.Modal.confirmar({
          titulo: 'Eliminar promoción',
          mensaje: 'Se eliminará "' + promo.titulo + '". Si es un combo, también se quitará del menú.',
          peligro: true,
          textoOk: 'Sí, eliminar'
        }).then(function (confirmado) {
          if (!confirmado) return;
          if (promo.productoId) window.Almacen.eliminar('productos', promo.productoId);
          window.Almacen.eliminar('promociones', promo.id);
          window.Notificaciones.exito('Promoción eliminada', 'El menú y la página principal se actualizaron.');
          renderTabla();
        });
      }
    });

    renderTabla();
    window.Almacen.alCambiar(window.Util.debounce(renderTabla, 500));
  });
})();
