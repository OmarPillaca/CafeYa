/* ============================================================
   CafeYa Ica - Servicio del carrito de compras
   ============================================================ */
(function () {
  'use strict';

  const C = window.Almacen.CLAVES;

  function clave() {
    const usuario = window.Auth ? window.Auth.usuarioActual() : null;
    return usuario ? usuario.id : 'invitado';
  }

  function leerTodo() { return window.Almacen.leer(C.carritos, {}) || {}; }

  function items() {
    const carritos = leerTodo();
    const propios = carritos[clave()];
    return Array.isArray(propios) ? propios : [];
  }

  function guardar(lista) {
    const carritos = leerTodo();
    carritos[clave()] = lista;
    window.Almacen.escribir(C.carritos, carritos);
  }

  function agregar(productoId, cantidad, observacion) {
    const producto = window.Almacen.buscar(C.productos, productoId);
    if (!producto) return { ok: false, error: 'El producto no existe.' };
    if (!producto.disponible) return { ok: false, error: 'Ese producto está agotado por ahora.' };
    const cantidadFinal = Math.max(1, Number(cantidad) || 1);
    const lista = items();
    const nota = observacion || '';
    const repetido = lista.find(function (linea) {
      return linea.productoId === productoId && (linea.observacion || '') === nota;
    });
    if (repetido) {
      repetido.cantidad += cantidadFinal;
    } else {
      lista.push({
        linea: window.Util.id('ln'),
        productoId: productoId,
        cantidad: cantidadFinal,
        observacion: nota
      });
    }
    guardar(lista);
    return { ok: true, producto: producto, cantidad: cantidadFinal };
  }

  function cambiarCantidad(lineaId, delta) {
    const lista = items();
    const item = lista.find(function (l) { return l.linea === lineaId; });
    if (!item) return false;
    item.cantidad = Math.max(1, Math.min(30, item.cantidad + delta));
    guardar(lista);
    return true;
  }

  function fijarCantidad(lineaId, cantidad) {
    const lista = items();
    const item = lista.find(function (l) { return l.linea === lineaId; });
    if (!item) return false;
    item.cantidad = Math.max(1, Math.min(30, Number(cantidad) || 1));
    guardar(lista);
    return true;
  }

  function quitar(lineaId) {
    guardar(items().filter(function (l) { return l.linea !== lineaId; }));
  }

  function vaciar() { guardar([]); }

  function contar() {
    return items().reduce(function (total, item) { return total + (Number(item.cantidad) || 0); }, 0);
  }

  function detalle() {
    const productos = window.Almacen.listar(C.productos);
    const lineas = items().map(function (item) {
      const producto = productos.find(function (p) { return p.id === item.productoId; });
      if (!producto) return null;
      const info = window.Promociones
        ? window.Promociones.paraProducto(producto)
        : { precio: producto.precio, antes: producto.precio, descuento: 0, etiqueta: null };
      const cantidad = Number(item.cantidad) || 1;
      return {
        linea: item.linea,
        productoId: producto.id,
        nombre: producto.nombre,
        emoji: producto.emoji || '☕',
        imagen: producto.imagen,
        categoriaId: producto.categoriaId,
        observacion: item.observacion || '',
        cantidad: cantidad,
        precio: info.antes,
        precioUnitario: info.precio,
        descuentoUnitario: info.descuento,
        subtotal: window.Util.redondear(info.antes * cantidad),
        subtotalFinal: window.Util.redondear(info.precio * cantidad),
        promo: info.etiqueta,
        disponible: producto.disponible
      };
    }).filter(Boolean);

    const subtotal = window.Util.redondear(window.Util.sumar(lineas, 'subtotal'));
    const total = window.Util.redondear(window.Util.sumar(lineas, 'subtotalFinal'));
    return {
      items: lineas,
      cantidad: window.Util.sumar(lineas, 'cantidad'),
      subtotal: subtotal,
      descuento: window.Util.redondear(subtotal - total),
      total: total
    };
  }

  function pedidoRapido() {
    const resumen = detalle();
    if (!resumen.items.length) return null;
    return resumen.items.map(function (item) {
      return { nombre: item.nombre, cantidad: item.cantidad, precio: item.precioUnitario };
    });
  }

  window.Carrito = {
    clave: clave,
    items: items,
    guardar: guardar,
    agregar: agregar,
    cambiarCantidad: cambiarCantidad,
    fijarCantidad: fijarCantidad,
    quitar: quitar,
    vaciar: vaciar,
    contar: contar,
    detalle: detalle,
    pedidoRapido: pedidoRapido
  };
})();
