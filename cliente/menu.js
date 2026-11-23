/* ============================================================
   CafeYa Ica - Menú digital con filtros y carrito
   ============================================================ */
(function () {
  'use strict';

  const estado = { busqueda: '', categoria: 'todas', promos: false, precio: 'todos', orden: 'destacados' };
  let contenedor = null;

  function categorias() {
    return window.Almacen.listar('categorias').filter(function (c) { return c.activa !== false; })
      .sort(function (a, b) { return (a.orden || 0) - (b.orden || 0); });
  }

  function productosFiltrados() {
    const categoriasValidas = categorias().map(function (c) { return c.id; });
    let lista = window.Almacen.listar('productos').filter(function (p) {
      return categoriasValidas.indexOf(p.categoriaId) > -1;
    });
    if (estado.categoria !== 'todas') {
      lista = lista.filter(function (p) { return p.categoriaId === estado.categoria; });
    }
    if (estado.promos) {
      lista = lista.filter(function (p) {
        return window.Promociones.paraProducto(p).descuento > 0 || p.categoriaId === 'cat-combos';
      });
    }
    if (estado.precio === '0-10') lista = lista.filter(function (p) { return p.precio <= 10; });
    if (estado.precio === '10-15') lista = lista.filter(function (p) { return p.precio > 10 && p.precio <= 15; });
    if (estado.precio === '15+') lista = lista.filter(function (p) { return p.precio > 15; });
    if (estado.busqueda) {
      const busqueda = estado.busqueda.toLowerCase();
      lista = lista.filter(function (p) {
        return (p.nombre + ' ' + p.descripcion + ' ' + (p.tags || []).join(' ')).toLowerCase().indexOf(busqueda) > -1;
      });
    }
    if (estado.orden === 'precio-asc') lista.sort(function (a, b) { return a.precio - b.precio; });
    else if (estado.orden === 'precio-desc') lista.sort(function (a, b) { return b.precio - a.precio; });
    else if (estado.orden === 'nombre') lista.sort(function (a, b) { return a.nombre.localeCompare(b.nombre); });
    else lista.sort(function (a, b) { return (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0); });
    return lista;
  }

  function tarjeta(producto) {
    const categoria = window.Almacen.buscar('categorias', producto.categoriaId) || {};
    const info = window.Promociones.paraProducto(producto);
    const etiquetas = [];
    if (info.descuento > 0) etiquetas.push('<span class="producto-badge promo">Promo</span>');
    if (producto.destacado) etiquetas.push('<span class="producto-badge">Destacado</span>');
    if (!producto.disponible) etiquetas.push('<span class="producto-badge agotado">Agotado</span>');
    return '<article class="producto-card' + (producto.disponible ? '' : ' agotado') + '">' +
      '<div class="producto-imagen" data-detalle="' + producto.id + '" style="cursor:pointer">' +
        window.Util.img(producto) +
        (etiquetas.length ? '<div class="producto-badges">' + etiquetas.join('') + '</div>' : '') +
      '</div>' +
      '<div class="producto-cuerpo">' +
        '<span class="producto-categoria">' + window.Util.esc(categoria.nombre || 'CaféYa') + '</span>' +
        '<h3 class="producto-nombre" data-detalle="' + producto.id + '" style="cursor:pointer">' + window.Util.esc(producto.nombre) + '</h3>' +
        '<p class="producto-desc">' + window.Util.esc(producto.descripcion) + '</p>' +
        '<div class="producto-pie">' +
          '<div class="producto-precio">' + window.Util.soles(info.precio) +
            (info.descuento > 0 ? '<small>' + window.Util.soles(info.antes) + '</small>' : '') + '</div>' +
          '<div class="producto-acciones">' +
            '<button class="btn btn-claro btn-sm" type="button" data-detalle="' + producto.id + '">Ver</button>' +
            (producto.disponible
              ? '<button class="btn btn-primario btn-sm" type="button" data-agregar="' + producto.id + '">Agregar</button>'
              : '<button class="btn btn-sm" type="button" disabled>Agotado</button>') +
          '</div>' +
        '</div>' +
      '</div></article>';
  }

  function renderChips() {
    const zona = document.getElementById('chips-categorias');
    if (!zona) return;
    const lista = [{ id: 'todas', nombre: 'Todos', icono: '🍽️' }].concat(categorias());
    zona.innerHTML = lista.map(function (c) {
      return '<button type="button" class="chip' + (estado.categoria === c.id ? ' activo' : '') + '" data-categoria="' + c.id + '">' +
        (c.icono ? c.icono + ' ' : '') + window.Util.esc(c.nombre) + '</button>';
    }).join('');
    Array.prototype.forEach.call(zona.querySelectorAll('[data-categoria]'), function (boton) {
      boton.addEventListener('click', function () {
        estado.categoria = boton.dataset.categoria;
        renderChips();
        renderGrid();
      });
    });
  }

  function renderGrid() {
    const grid = document.getElementById('grid-menu');
    if (!grid) return;
    const lista = productosFiltrados();
    const info = document.getElementById('resultado-info');
    if (info) {
      info.innerHTML = '<span>' + lista.length + ' producto(s) encontrados</span><span>' +
        (window.Auth.usuarioActual() ? 'Pedido para ' + window.Util.esc(window.Auth.usuarioActual().nombre.split(' ')[0]) : '<a href="login.html">Inicia sesión</a> para confirmar tu pedido') +
        '</span>';
    }
    grid.innerHTML = lista.length
      ? lista.map(tarjeta).join('')
      : window.Util.vacio('Sin resultados', 'Prueba con otra búsqueda o cambia los filtros.',
        '<button class="btn btn-primario btn-sm" type="button" id="limpiar-filtros">Limpiar filtros</button>');
    const limpiar = document.getElementById('limpiar-filtros');
    if (limpiar) {
      limpiar.addEventListener('click', function () {
        estado.busqueda = '';
        estado.categoria = 'todas';
        estado.promos = false;
        estado.precio = 'todos';
        document.getElementById('buscar').value = '';
        document.getElementById('filtro-precio').value = 'todos';
        document.getElementById('filtro-promos').checked = false;
        renderChips();
        renderGrid();
      });
    }
  }

  function renderBarra() {
    const barra = document.getElementById('barra-carrito');
    if (!barra) return;
    const resumen = window.Carrito.detalle();
    document.body.classList.toggle('con-barra', resumen.items.length > 0);
    if (!resumen.items.length) {
      barra.classList.add('oculto');
      barra.innerHTML = '';
      return;
    }
    barra.classList.remove('oculto');
    barra.innerHTML =
      '<div class="barra-carrito-info"><div class="barra-carrito-icono">' + window.Util.svg('carrito') + '</div>' +
        '<div><strong>' + resumen.cantidad + ' producto(s) en tu pedido</strong>' +
        '<span>Subtotal ' + window.Util.soles(resumen.subtotal) + ' · Descuento ' + window.Util.soles(resumen.descuento) + '</span></div></div>' +
      '<div class="barra-carrito-acciones">' +
        '<button class="btn btn-claro btn-sm" type="button" id="barra-vaciar">Vaciar</button>' +
        '<a class="btn btn-primario" href="carrito.html">Ver carrito · ' + window.Util.soles(resumen.total) + '</a>' +
      '</div>';
    document.getElementById('barra-vaciar').addEventListener('click', function () {
      window.Modal.confirmar({
        titulo: 'Vaciar el carrito',
        mensaje: 'Se quitarán todos los productos agregados. ¿Deseas continuar?',
        peligro: true,
        textoOk: 'Sí, vaciar'
      }).then(function (confirmado) {
        if (!confirmado) return;
        window.Carrito.vaciar();
        renderBarra();
        window.Shell.actualizarBadges();
        window.Notificaciones.info('Carrito vacío', 'Puedes seguir explorando el menú.');
      });
    });
  }

  function agregar(productoId, cantidad, observacion) {
    const resultado = window.Carrito.agregar(productoId, cantidad || 1, observacion || '');
    if (!resultado.ok) {
      window.Notificaciones.error('No se pudo agregar', resultado.error);
      return;
    }
    window.Notificaciones.exito('Agregado al carrito',
      resultado.cantidad + 'x ' + resultado.producto.nombre + ' · ' + window.Util.soles(resultado.producto.precio * resultado.cantidad));
    renderBarra();
    window.Shell.actualizarBadges();
  }

  function abrirProducto(productoId) {
    const producto = window.Almacen.buscar('productos', productoId);
    if (!producto) return;
    const info = window.Promociones.paraProducto(producto);
    const categoria = window.Almacen.buscar('categorias', producto.categoriaId) || {};
    const caja = window.Modal.abrir({
      titulo: producto.nombre,
      subtitulo: (categoria.nombre || '') + (producto.disponible ? '' : ' · Producto agotado'),
      emoji: producto.emoji || '☕',
      tamano: 'mediano',
      cuerpo:
        '<div class="producto-modal-img">' + window.Util.img(producto) + '</div>' +
        '<p class="muted small" style="font-size:13px;line-height:1.65">' + window.Util.esc(producto.descripcion) + '</p>' +
        (info.descuento > 0
          ? '<div class="promo-nota">🎁 ' + window.Util.esc(info.etiqueta || 'Promoción vigente') + ' · ahorras ' + window.Util.soles(info.descuento) + '</div>'
          : '') +
        '<div class="flex-between">' +
          '<div><div class="small muted">Precio</div><div class="producto-precio">' + window.Util.soles(info.precio) +
            (info.descuento > 0 ? '<small>' + window.Util.soles(info.antes) + '</small>' : '') + '</div></div>' +
          '<div class="cantidad-control">' +
            '<button type="button" data-paso="-1">−</button>' +
            '<input id="prod-cantidad" value="1" inputmode="numeric" aria-label="Cantidad">' +
            '<button type="button" data-paso="1">+</button>' +
          '</div>' +
        '</div>' +
        '<div class="campo mt-2"><label for="prod-observacion">Observación (opcional)</label>' +
          '<input id="prod-observacion" maxlength="120" placeholder="Ej. sin azúcar, leche deslactosada"></div>' +
        '<div class="flex-between mt-2"><span class="small muted">Total</span><strong id="prod-total">' + window.Util.soles(info.precio) + '</strong></div>',
      acciones: '<button class="btn btn-claro" type="button" data-cerrar>Seguir viendo</button>' +
        '<button class="btn btn-primario" type="button" id="prod-agregar"' + (producto.disponible ? '' : ' disabled') + '>' +
        (producto.disponible ? 'Agregar al carrito' : 'Producto agotado') + '</button>'
    });
    const cantidad = caja.querySelector('#prod-cantidad');
    const total = caja.querySelector('#prod-total');
    function actualizar() {
      const valor = Math.max(1, Math.min(20, parseInt(cantidad.value, 10) || 1));
      cantidad.value = valor;
      total.textContent = window.Util.soles(info.precio * valor);
    }
    cantidad.addEventListener('input', actualizar);
    Array.prototype.forEach.call(caja.querySelectorAll('[data-paso]'), function (boton) {
      boton.addEventListener('click', function () {
        cantidad.value = (parseInt(cantidad.value, 10) || 1) + parseInt(boton.dataset.paso, 10);
        actualizar();
      });
    });
    const agregarBtn = caja.querySelector('#prod-agregar');
    if (agregarBtn) {
      agregarBtn.addEventListener('click', function () {
        agregar(producto.id, parseInt(cantidad.value, 10) || 1, caja.querySelector('#prod-observacion').value.trim());
        window.Modal.cerrar();
      });
    }
  }

  function construirHTML() {
    const usuario = window.Auth.usuarioActual();
    return '<section class="menu-hero"><div>' +
        '<span class="panel-etiqueta">Menú digital</span>' +
        '<h2 class="display">Elige tu café, nosotros lo preparamos</h2>' +
        '<p>Productos de café de especialidad, bebidas frías, desayunos, postres y combos con precio promocional.</p>' +
      '</div><div class="menu-hero-dato"><strong>8 min</strong><span>objetivo de preparación</span></div></section>' +
      (usuario ? '' : '<div class="alerta aviso mb-2"><span class="alerta-icono">👋</span><div><strong>Estás navegando como invitado</strong>' +
        'Puedes agregar productos; para confirmar el pedido deberás <a href="login.html">iniciar sesión</a>.</div></div>') +
      '<div class="card menu-filtros">' +
        '<div class="buscador">' + window.Util.svg('buscar') +
          '<input type="search" id="buscar" placeholder="Buscar café, postre o combo..." aria-label="Buscar productos"></div>' +
        '<select id="filtro-precio" aria-label="Filtrar por precio">' +
          '<option value="todos">Todos los precios</option>' +
          '<option value="0-10">Hasta S/ 10</option>' +
          '<option value="10-15">S/ 10 a S/ 15</option>' +
          '<option value="15+">Más de S/ 15</option>' +
        '</select>' +
        '<select id="filtro-orden" aria-label="Ordenar productos">' +
          '<option value="destacados">Destacados primero</option>' +
          '<option value="precio-asc">Menor precio</option>' +
          '<option value="precio-desc">Mayor precio</option>' +
          '<option value="nombre">Nombre A-Z</option>' +
        '</select>' +
        '<label class="check"><input type="checkbox" id="filtro-promos"> Solo promociones</label>' +
      '</div>' +
      '<div class="chip-barra" id="chips-categorias"></div>' +
      '<div class="resultado-info" id="resultado-info"></div>' +
      '<div class="productos-grid" id="grid-menu"></div>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    contenedor = window.Shell.cliente({
      pagina: 'menu',
      titulo: 'Menú digital',
      subtitulo: 'Arma tu pedido y elige la hora de recojo',
      permitirInvitado: true
    });
    if (!contenedor) return;

    contenedor.innerHTML = construirHTML();

    const parametroMesa = new URLSearchParams(window.location.search).get('mesa');
    if (parametroMesa) {
      const numeroMesa = String(parametroMesa).trim().toUpperCase();
      const mesa = window.Almacen.listar('mesas').find(function (m) {
        return String(m.numero).toUpperCase() === numeroMesa;
      });
      if (mesa) {
        try { sessionStorage.setItem('cafeya_mesa_id', mesa.id); } catch (error) { /* sin sessionStorage */ }
        const banner = document.createElement('div');
        banner.className = 'alerta aviso mb-2';
        banner.innerHTML = '<span class="alerta-icono">📱</span><div><strong>Estás pidiendo desde la mesa ' +
          window.Util.esc(mesa.numero) + '</strong>Tu pedido se asociará a esta mesa (' + window.Util.esc(mesa.zona || 'Salón') +
          '). <button type="button" class="btn btn-sm btn-claro" id="quitar-mesa">Cambiar a recojo</button></div>';
        contenedor.insertBefore(banner, contenedor.firstChild);
        banner.querySelector('#quitar-mesa').addEventListener('click', function () {
          try { sessionStorage.removeItem('cafeya_mesa_id'); } catch (error) { /* sin sessionStorage */ }
          banner.remove();
        });
        window.Notificaciones.info('Mesa identificada', 'Pedido asociado a la mesa ' + mesa.numero + '.');
      } else {
        window.Notificaciones.aviso('Mesa no encontrada', 'El código QR no corresponde a una mesa registrada.');
      }
    }

    renderChips();
    renderGrid();
    renderBarra();

    document.getElementById('buscar').addEventListener('input', window.Util.debounce(function (evento) {
      estado.busqueda = evento.target.value;
      renderGrid();
    }, 220));
    document.getElementById('filtro-precio').addEventListener('change', function (evento) {
      estado.precio = evento.target.value;
      renderGrid();
    });
    document.getElementById('filtro-orden').addEventListener('change', function (evento) {
      estado.orden = evento.target.value;
      renderGrid();
    });
    document.getElementById('filtro-promos').addEventListener('change', function (evento) {
      estado.promos = evento.target.checked;
      renderGrid();
    });

    contenedor.addEventListener('click', function (evento) {
      const agregarBtn = evento.target.closest('[data-agregar]');
      if (agregarBtn) {
        evento.preventDefault();
        agregar(agregarBtn.dataset.agregar, 1, '');
        return;
      }
      const detalle = evento.target.closest('[data-detalle]');
      if (detalle) {
        evento.preventDefault();
        abrirProducto(detalle.dataset.detalle);
      }
    });

    window.Almacen.alCambiar(window.Util.debounce(renderBarra, 250));
  });
})();
