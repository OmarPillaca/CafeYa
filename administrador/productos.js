/* ============================================================
   CafeYa Ica - CRUD de productos
   ============================================================ */
(function () {
  'use strict';

  let contenido = null;
  const filtros = { busqueda: '', categoria: 'todas', estado: 'todos' };

  function categorias() {
    return window.Almacen.listar('categorias').slice().sort(function (a, b) { return (a.orden || 0) - (b.orden || 0); });
  }

  function listaFiltrada() {
    let lista = window.Almacen.listar('productos');
    if (filtros.categoria !== 'todas') lista = lista.filter(function (p) { return p.categoriaId === filtros.categoria; });
    if (filtros.estado === 'disponibles') lista = lista.filter(function (p) { return p.disponible; });
    if (filtros.estado === 'agotados') lista = lista.filter(function (p) { return !p.disponible; });
    if (filtros.estado === 'destacados') lista = lista.filter(function (p) { return p.destacado; });
    return window.AdminUI.filtrar(lista, filtros.busqueda, ['nombre', 'descripcion']);
  }

  function renderTabla() {
    const zona = document.getElementById('tabla-productos');
    if (!zona) return;
    const lista = listaFiltrada();
    const categoriasLista = categorias();
    zona.innerHTML = window.AdminUI.tabla({
      datos: lista,
      vacioTitulo: 'Sin productos',
      vacioTexto: 'Registra un producto nuevo para que aparezca en el menú del cliente.',
      columnas: [
        { titulo: 'Producto', render: function (p) { return window.AdminUI.producto(p); } },
        { titulo: 'Categoría', render: function (p) {
          const categoria = categoriasLista.find(function (c) { return c.id === p.categoriaId; });
          return window.Util.esc(categoria ? categoria.nombre : '—');
        } },
        { titulo: 'Precio', render: function (p) {
          const info = window.Promociones.paraProducto(p);
          return '<strong class="dato-destacado">' + window.Util.soles(info.precio) + '</strong>' +
            (info.descuento > 0 ? '<div class="precio-promo">antes ' + window.Util.soles(info.antes) + '</div>' : '');
        } },
        { titulo: 'Disponibilidad', render: function (p) {
          return '<button type="button" class="btn btn-sm ' + (p.disponible ? 'btn-teal' : 'btn-claro') + '" data-toggle="' + p.id + '">' +
            (p.disponible ? 'Disponible' : 'Agotado') + '</button>';
        } },
        { titulo: 'Destacado', render: function (p) {
          return '<button type="button" class="btn btn-sm ' + (p.destacado ? 'btn-primario' : 'btn-claro') + '" data-destacar="' + p.id + '">' +
            (p.destacado ? '★ Destacado' : '☆ Normal') + '</button>';
        } },
        { titulo: 'Acciones', render: function (p) {
          return '<div class="acciones-fila">' +
            '<button type="button" class="btn btn-sm btn-claro" data-editar="' + p.id + '">Editar</button>' +
            '<button type="button" class="btn btn-sm btn-peligro" data-eliminar="' + p.id + '">Eliminar</button></div>';
        } }
      ]
    });
  }

  function abrirFormulario(producto) {
    const esNuevo = !producto;
    const datos = producto || {
      nombre: '', descripcion: '', precio: '', categoriaId: '', imagen: '', emoji: '☕',
      disponible: true, destacado: false
    };
    let imagenTemporal = datos.imagen || '';

    const caja = window.Modal.abrir({
      titulo: esNuevo ? 'Nuevo producto' : 'Editar producto',
      subtitulo: esNuevo ? 'El producto aparecerá de inmediato en el menú del cliente' : datos.nombre,
      emoji: '🍰',
      tamano: 'mediano',
      cuerpo:
        '<div class="producto-form form-grid">' +
          '<div class="producto-preview" id="prod-preview">' +
            (imagenTemporal
              ? '<img src="' + window.Util.esc(imagenTemporal) + '" alt="Vista previa" onerror="this.style.display=\'none\'">'
              : '<span>' + window.Util.esc(datos.emoji || '☕') + '</span>') +
          '</div>' +
          '<div class="campo"><label for="pf-imagen-url">URL de fotografía (opcional)</label>' +
            '<div class="flex gap-1">' +
              '<input id="pf-imagen-url" value="' + window.Util.esc(datos.imagen && datos.imagen.indexOf('data:') !== 0 ? datos.imagen : '') + '" placeholder="https://...">' +
              '<label class="archivo-etiqueta" for="pf-archivo" style="flex:0 0 auto;padding:11px 14px">📁 Subir</label>' +
              '<input type="file" id="pf-archivo" accept="image/*">' +
            '</div>' +
            '<span class="ayuda">Puedes pegar una URL o subir una imagen local (máximo 700 KB).</span></div>' +
          '<div class="form-grid dos">' +
            '<div class="campo"><label for="pf-nombre">Nombre <span class="req">*</span></label>' +
              '<input id="pf-nombre" value="' + window.Util.esc(datos.nombre) + '" maxlength="70"></div>' +
            '<div class="campo"><label for="pf-precio">Precio (S/) <span class="req">*</span></label>' +
              '<input type="number" id="pf-precio" min="0.5" step="0.5" value="' + (datos.precio || '') + '"></div>' +
          '</div>' +
          '<div class="campo"><label for="pf-descripcion">Descripción <span class="req">*</span></label>' +
            '<textarea id="pf-descripcion" maxlength="180">' + window.Util.esc(datos.descripcion) + '</textarea></div>' +
          '<div class="form-grid dos">' +
            '<div class="campo"><label for="pf-categoria">Categoría <span class="req">*</span></label>' +
              '<select id="pf-categoria">' + window.AdminUI.opciones(categorias(), 'id', 'nombre', datos.categoriaId, 'Selecciona categoría') + '</select></div>' +
            '<div class="campo"><label for="pf-emoji">Emoji de respaldo</label>' +
              '<input id="pf-emoji" value="' + window.Util.esc(datos.emoji || '☕') + '" maxlength="4"></div>' +
          '</div>' +
          '<div>' +
            '<div class="switch-fila"><div><strong>Disponible en el menú</strong><small>Si se desactiva, se muestra como agotado</small></div>' +
              '<label class="switch"><input type="checkbox" id="pf-disponible"' + (datos.disponible ? ' checked' : '') + '><span></span></label></div>' +
            '<div class="switch-fila"><div><strong>Producto destacado</strong><small>Aparece en la sección de populares</small></div>' +
              '<label class="switch"><input type="checkbox" id="pf-destacado"' + (datos.destacado ? ' checked' : '') + '><span></span></label></div>' +
          '</div>' +
        '</div>',
      acciones: '<button class="btn btn-claro" type="button" data-cerrar>Cancelar</button>' +
        '<button class="btn btn-primario" type="button" id="pf-guardar">Guardar producto</button>'
    });

    const archivo = caja.querySelector('#pf-archivo');
    archivo.addEventListener('change', function () {
      const seleccionado = archivo.files[0];
      if (!seleccionado) return;
      if (seleccionado.size > 700 * 1024) {
        window.Notificaciones.error('Imagen muy grande', 'Usa una imagen menor a 700 KB.');
        archivo.value = '';
        return;
      }
      const lector = new FileReader();
      lector.onload = function () {
        imagenTemporal = lector.result;
        caja.querySelector('#prod-preview').innerHTML = '<img src="' + imagenTemporal + '" alt="Vista previa">';
      };
      lector.readAsDataURL(seleccionado);
    });

    caja.querySelector('#pf-guardar').addEventListener('click', function () {
      const nombre = caja.querySelector('#pf-nombre').value.trim();
      const descripcion = caja.querySelector('#pf-descripcion').value.trim();
      const precio = Number(caja.querySelector('#pf-precio').value);
      const categoriaId = caja.querySelector('#pf-categoria').value;
      const emoji = caja.querySelector('#pf-emoji').value.trim() || '☕';
      const url = caja.querySelector('#pf-imagen-url').value.trim();
      const disponible = caja.querySelector('#pf-disponible').checked;
      const destacado = caja.querySelector('#pf-destacado').checked;
      if (nombre.length < 3) { window.Notificaciones.error('Nombre inválido', 'Ingresa un nombre de al menos 3 caracteres.'); return; }
      if (!precio || precio <= 0) { window.Notificaciones.error('Precio inválido', 'Ingresa un precio mayor a cero.'); return; }
      if (!categoriaId) { window.Notificaciones.error('Categoría pendiente', 'Selecciona una categoría.'); return; }
      if (descripcion.length < 10) { window.Notificaciones.error('Descripción corta', 'Describe el producto con al menos 10 caracteres.'); return; }

      const cambios = {
        nombre: nombre,
        descripcion: descripcion,
        precio: precio,
        categoriaId: categoriaId,
        emoji: emoji,
        imagen: url || (imagenTemporal.indexOf('data:') === 0 ? imagenTemporal : datos.imagen || ''),
        disponible: disponible,
        destacado: destacado
      };
      if (esNuevo) {
        window.Almacen.crear('productos', Object.assign({ tags: [] }, cambios));
        window.Notificaciones.exito('Producto registrado', nombre + ' ya aparece en el menú del cliente.');
      } else {
        window.Almacen.actualizar('productos', datos.id, cambios);
        window.Notificaciones.exito('Producto actualizado', 'Los cambios se reflejan en el menú del cliente.');
      }
      window.Modal.cerrar();
      renderTabla();
      window.Shell.actualizarBadges();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    contenido = window.AdminUI.montar({
      pagina: 'productos',
      titulo: 'Productos',
      subtitulo: 'Catálogo que se muestra en el menú digital'
    });
    if (!contenido) return;

    contenido.innerHTML =
      '<div class="card">' +
        '<div class="panel-filtros">' +
          '<div class="buscador grow">' + window.Util.svg('buscar') +
            '<input id="pf-buscar" type="search" placeholder="Buscar producto..."></div>' +
          '<select id="pf-fcategoria"><option value="todas">Todas las categorías</option>' +
            categorias().map(function (c) { return '<option value="' + c.id + '">' + window.Util.esc(c.nombre) + '</option>'; }).join('') + '</select>' +
          '<select id="pf-festado"><option value="todos">Todos</option><option value="disponibles">Disponibles</option>' +
            '<option value="agotados">Agotados</option><option value="destacados">Destacados</option></select>' +
          '<button type="button" class="btn btn-primario btn-sm" id="pf-nuevo">+ Nuevo producto</button>' +
        '</div>' +
        '<div id="tabla-productos" class="tabla-productos"></div>' +
      '</div>';

    document.getElementById('pf-buscar').addEventListener('input', window.Util.debounce(function (e) {
      filtros.busqueda = e.target.value; renderTabla();
    }, 220));
    document.getElementById('pf-fcategoria').addEventListener('change', function (e) {
      filtros.categoria = e.target.value; renderTabla();
    });
    document.getElementById('pf-festado').addEventListener('change', function (e) {
      filtros.estado = e.target.value; renderTabla();
    });
    document.getElementById('pf-nuevo').addEventListener('click', function () { abrirFormulario(null); });

    contenido.addEventListener('click', function (evento) {
      const editar = evento.target.closest('[data-editar]');
      if (editar) { abrirFormulario(window.Almacen.buscar('productos', editar.dataset.editar)); return; }
      const toggle = evento.target.closest('[data-toggle]');
      if (toggle) {
        const producto = window.Almacen.buscar('productos', toggle.dataset.toggle);
        window.Almacen.actualizar('productos', producto.id, { disponible: !producto.disponible });
        window.Notificaciones.info('Disponibilidad actualizada', producto.nombre + ' ahora está ' + (!producto.disponible ? 'disponible' : 'agotado') + '.');
        renderTabla();
        return;
      }
      const destacar = evento.target.closest('[data-destacar]');
      if (destacar) {
        const producto = window.Almacen.buscar('productos', destacar.dataset.destacar);
        window.Almacen.actualizar('productos', producto.id, { destacado: !producto.destacado });
        renderTabla();
        return;
      }
      const eliminar = evento.target.closest('[data-eliminar]');
      if (eliminar) {
        const producto = window.Almacen.buscar('productos', eliminar.dataset.eliminar);
        window.Modal.confirmar({
          titulo: 'Eliminar producto',
          mensaje: 'Se eliminará "' + producto.nombre + '" del catálogo. Los pedidos anteriores conservan su información.',
          peligro: true,
          textoOk: 'Sí, eliminar'
        }).then(function (confirmado) {
          if (!confirmado) return;
          window.Almacen.eliminar('productos', producto.id);
          window.Notificaciones.exito('Producto eliminado', 'El catálogo se actualizó correctamente.');
          renderTabla();
          window.Shell.actualizarBadges();
        });
      }
    });

    renderTabla();
    window.Almacen.alCambiar(window.Util.debounce(renderTabla, 500));
  });
})();
