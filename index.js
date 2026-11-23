/* ============================================================
   CafeYa Ica - Lógica de la página principal
   ============================================================ */
(function () {
  'use strict';

  const FOTO_HERO = 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=75';
  const FOTO_ESTUDIO = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=75';

  function prepararFotos() {
    const principal = document.getElementById('foto-principal');
    if (principal) {
      principal.src = FOTO_HERO;
      principal.onerror = function () {
        principal.onerror = null;
        principal.src = window.Util.placeholder('☕');
      };
    }
    const estudio = document.getElementById('foto-estudio');
    if (estudio) {
      estudio.src = FOTO_ESTUDIO;
      estudio.onerror = function () {
        estudio.onerror = null;
        estudio.src = window.Util.placeholder('💻');
      };
    }
  }

  function renderFranja() {
    const contenedor = document.getElementById('franja');
    if (!contenedor) return;
    const items = [
      ['reloj', 'Recojo programado', 'Elige la hora exacta de tu pedido'],
      ['tarjeta', 'Pago demostrativo', 'Yape, Plin y tarjeta simulados'],
      ['wifi', 'Wi-Fi y enchufes', 'Zona de estudio y terraza'],
      ['fidelizacion', 'Tarjeta de 5 compras', 'Bebida gratuita al completar']
    ];
    contenedor.innerHTML = items.map(function (item) {
      return '<div class="franja-item">' + window.Util.svg(item[0]) +
        '<div><strong>' + item[1] + '</strong><span>' + item[2] + '</span></div></div>';
    }).join('');
  }

  function renderPromociones() {
    const contenedor = document.getElementById('promociones-grid');
    if (!contenedor) return;
    const promos = window.Promociones.activas(true).slice(0, 3);
    if (!promos.length) {
      contenedor.innerHTML = window.Util.vacio('Sin promociones activas', 'Vuelve pronto para conocer nuevas ofertas.');
      return;
    }
    contenedor.innerHTML = promos.map(function (promo) {
      const etiqueta = promo.tipo === 'porcentaje' ? '-' + promo.descuento + '%' : 'S/ ' + Number(promo.precioCombo || 0).toFixed(2);
      return '<article class="promo-card">' +
        '<div class="promo-imagen">' +
          window.Util.img({ nombre: promo.titulo, imagen: promo.imagen, emoji: '🎁' }) +
          '<span class="promo-descuento">' + etiqueta + '</span>' +
        '</div>' +
        '<div class="promo-cuerpo">' +
          '<h3>' + window.Util.esc(promo.titulo) + '</h3>' +
          '<p>' + window.Util.esc(promo.descripcion) + '</p>' +
          '<div class="flex-between">' +
            '<span class="small muted">Vigente hasta el ' + window.Util.fecha(promo.vigenciaHasta) + '</span>' +
            '<a class="btn btn-sm btn-primario" href="cliente/menu.html">Aprovechar</a>' +
          '</div>' +
        '</div></article>';
    }).join('');
  }

  function tarjetaProducto(producto) {
    const categorias = window.Almacen.listar('categorias');
    const categoria = categorias.find(function (c) { return c.id === producto.categoriaId; });
    const info = window.Promociones.paraProducto(producto);
    const etiquetas = [];
    if (info.descuento > 0) etiquetas.push('<span class="producto-badge promo">Promo</span>');
    if (producto.destacado) etiquetas.push('<span class="producto-badge">Destacado</span>');
    if (!producto.disponible) etiquetas.push('<span class="producto-badge agotado">Agotado</span>');
    return '<article class="producto-card' + (producto.disponible ? '' : ' agotado') + '">' +
      '<div class="producto-imagen">' +
        window.Util.img(producto) +
        (etiquetas.length ? '<div class="producto-badges">' + etiquetas.join('') + '</div>' : '') +
      '</div>' +
      '<div class="producto-cuerpo">' +
        '<span class="producto-categoria">' + window.Util.esc(categoria ? categoria.nombre : 'CaféYa') + '</span>' +
        '<h3 class="producto-nombre">' + window.Util.esc(producto.nombre) + '</h3>' +
        '<p class="producto-desc">' + window.Util.esc(producto.descripcion) + '</p>' +
        '<div class="producto-pie">' +
          '<div class="producto-precio">' + window.Util.soles(info.precio) +
            (info.descuento > 0 ? '<small>' + window.Util.soles(info.antes) + '</small>' : '') +
          '</div>' +
          (producto.disponible
            ? '<button class="btn btn-primario btn-sm" type="button" data-agregar="' + producto.id + '">Agregar</button>'
            : '<button class="btn btn-sm" type="button" disabled>Agotado</button>') +
        '</div>' +
      '</div></article>';
  }

  function renderPopulares() {
    const contenedor = document.getElementById('populares-grid');
    if (!contenedor) return;
    const productos = window.Almacen.listar('productos')
      .filter(function (p) { return p.destacado && p.categoriaId !== 'cat-combos'; })
      .slice(0, 8);
    contenedor.innerHTML = productos.map(tarjetaProducto).join('');
  }

  function renderCombos() {
    const contenedor = document.getElementById('combos-grid');
    if (!contenedor) return;
    const combos = window.Almacen.listar('productos').filter(function (p) {
      return p.categoriaId === 'cat-combos' && p.disponible;
    });
    contenedor.innerHTML = combos.map(function (producto) {
      const info = window.Promociones.paraProducto(producto);
      return '<article class="combo-card">' +
        window.Util.img(producto) +
        '<div class="grow"><h3>' + window.Util.esc(producto.nombre) + '</h3>' +
        '<p>' + window.Util.esc(producto.descripcion) + '</p>' +
        '<div class="combo-precio"><strong>' + window.Util.soles(info.precio) + '</strong>' +
        (info.descuento > 0 ? '<small>' + window.Util.soles(info.antes) + '</small>' : '') +
        '<button class="btn btn-sm btn-outline" type="button" data-agregar="' + producto.id + '">Agregar</button></div>' +
        '</div></article>';
    }).join('');
  }

  function renderTarjetaDemo() {
    const contenedor = document.getElementById('tarjeta-slots');
    if (!contenedor) return;
    let html = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= 4) {
        html += '<div class="tarjeta-slot lleno' + (i === 5 ? ' estrella' : '') + '">☕</div>';
      } else {
        html += '<div class="tarjeta-slot">' + (i === 5 ? '★' : '') + '</div>';
      }
    }
    contenedor.innerHTML = html;
  }

  function manejarAgregados() {
    document.addEventListener('click', function (evento) {
      const boton = evento.target.closest('[data-agregar]');
      if (!boton) return;
      evento.preventDefault();
      const resultado = window.Carrito.agregar(boton.dataset.agregar, 1);
      if (!resultado.ok) {
        window.Notificaciones.error('No se pudo agregar', resultado.error);
        return;
      }
      window.Notificaciones.exito('Agregado al carrito', resultado.producto.nombre + ' · ' + window.Util.soles(resultado.producto.precio));
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    prepararFotos();
    window.Navbar.montar();
    window.Navbar.pie();
    renderFranja();
    renderPromociones();
    renderPopulares();
    renderCombos();
    renderTarjetaDemo();
    manejarAgregados();
  });
})();
