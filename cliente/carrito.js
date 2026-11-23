/* ============================================================
   CafeYa Ica - Carrito de compras del cliente
   ============================================================ */
(function () {
  'use strict';

  let contenido = null;

  function render() {
    const resumen = window.Carrito.detalle();

    if (!resumen.items.length) {
      contenido.innerHTML =
        '<div class="card carrito-vacio">' +
          window.Util.vacio('Tu carrito está vacío',
            'Agrega productos del menú para armar tu pedido. Tu carrito se conserva mientras navegas.',
            '<a class="btn btn-primario" href="menu.html">Explorar el menú</a>') +
        '</div>';
      return;
    }

    const lineas = resumen.items.map(function (item) {
      return '<div class="carrito-linea">' +
        '<div class="carrito-prod">' +
          window.Util.img({ nombre: item.nombre, imagen: item.imagen, emoji: item.emoji }) +
          '<div><strong>' + window.Util.esc(item.nombre) + '</strong>' +
            '<span>' + window.Util.soles(item.precioUnitario) + ' c/u</span>' +
            (item.promo ? '<span class="promo-chip">' + window.Util.esc(item.promo) + '</span>' : '') +
            (item.observacion ? '<em>“' + window.Util.esc(item.observacion) + '”</em>' : '') +
          '</div>' +
        '</div>' +
        '<div class="cantidad-control">' +
          '<button type="button" data-menos="' + item.linea + '" aria-label="Disminuir">−</button>' +
          '<input data-cantidad="' + item.linea + '" value="' + item.cantidad + '" inputmode="numeric" aria-label="Cantidad">' +
          '<button type="button" data-mas="' + item.linea + '" aria-label="Aumentar">+</button>' +
        '</div>' +
        '<div class="carrito-subtotal">' + window.Util.soles(item.subtotalFinal) +
          (item.descuentoUnitario > 0 ? '<small>' + window.Util.soles(item.subtotal) + '</small>' : '') +
        '</div>' +
        '<button type="button" class="btn btn-sm btn-peligro" data-quitar="' + item.linea + '" aria-label="Quitar">' +
          window.Util.svg('eliminar') + '</button>' +
      '</div>';
    }).join('');

    contenido.innerHTML =
      '<div class="carrito-grid">' +
        '<div class="card">' +
          '<div class="card-head"><div class="card-titulo"><div class="card-icono">' + window.Util.svg('carrito') + '</div>' +
            '<div><h2>Mi pedido</h2><p>' + resumen.cantidad + ' producto(s) seleccionado(s)</p></div></div>' +
            '<a class="btn btn-claro btn-sm" href="menu.html">Seguir comprando</a></div>' +
          lineas +
        '</div>' +
        '<aside class="card resumen-pago">' +
          '<h3>Resumen del pedido</h3>' +
          '<div class="resumen-linea"><span>Subtotal</span><strong>' + window.Util.soles(resumen.subtotal) + '</strong></div>' +
          '<div class="resumen-linea descuento"><span>Descuento por promociones</span><strong>− ' + window.Util.soles(resumen.descuento) + '</strong></div>' +
          '<div class="resumen-linea"><span>Método de pago</span><span>Se elige en el siguiente paso</span></div>' +
          '<div class="total-final"><span>Total</span><strong>' + window.Util.soles(resumen.total) + '</strong></div>' +
          '<a class="btn btn-primario btn-block btn-lg mt-2" href="pago.html">Continuar con el pedido</a>' +
          '<button class="btn btn-claro btn-block mt-1" type="button" id="btn-vaciar-carrito">Vaciar carrito</button>' +
          '<div class="pago-seguro">🔒 Pago demostrativo · No se realizan transacciones reales</div>' +
        '</aside>' +
      '</div>';

    const vaciar = document.getElementById('btn-vaciar-carrito');
    if (vaciar) {
      vaciar.addEventListener('click', function () {
        window.Modal.confirmar({
          titulo: 'Vaciar carrito',
          mensaje: 'Se eliminarán todos los productos seleccionados.',
          peligro: true,
          textoOk: 'Sí, vaciar'
        }).then(function (confirmado) {
          if (!confirmado) return;
          window.Carrito.vaciar();
          window.Shell.actualizarBadges();
          window.Notificaciones.info('Carrito vacío', 'Puedes volver a armar tu pedido desde el menú.');
        });
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    contenido = window.Shell.cliente({
      pagina: 'carrito',
      titulo: 'Mi carrito',
      subtitulo: 'Revisa tu pedido antes de pagar'
    });
    if (!contenido) return;

    render();

    contenido.addEventListener('click', function (evento) {
      const mas = evento.target.closest('[data-mas]');
      if (mas) {
        window.Carrito.cambiarCantidad(mas.dataset.mas, 1);
        return;
      }
      const menos = evento.target.closest('[data-menos]');
      if (menos) {
        window.Carrito.cambiarCantidad(menos.dataset.menos, -1);
        return;
      }
      const quitar = evento.target.closest('[data-quitar]');
      if (quitar) {
        window.Carrito.quitar(quitar.dataset.quitar);
        window.Notificaciones.info('Producto eliminado', 'Puedes volver a agregarlo desde el menú.');
      }
    });

    contenido.addEventListener('change', function (evento) {
      const campo = evento.target.closest('[data-cantidad]');
      if (!campo) return;
      window.Carrito.fijarCantidad(campo.dataset.cantidad, campo.value);
    });

    window.Almacen.alCambiar(window.Util.debounce(function () {
      window.Shell.actualizarBadges();
      render();
    }, 250));
  });
})();
