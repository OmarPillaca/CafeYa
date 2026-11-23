/* ============================================================
   CafeYa Ica - Checkout y pago demostrativo
   ============================================================ */
(function () {
  'use strict';

  const METODOS = [
    { id: 'yape', nombre: 'Yape', icono: '📱', nota: 'QR demostrativo' },
    { id: 'plin', nombre: 'Plin', icono: '📲', nota: 'QR demostrativo' },
    { id: 'tarjeta', nombre: 'Tarjeta', icono: '💳', nota: 'Formulario demo' },
    { id: 'efectivo', nombre: 'Efectivo', icono: '💵', nota: 'Pago en caja' }
  ];

  let contenido = null;
  let pedidoActual = null;
  let pagoActual = null;
  let metodoSeleccionado = 'yape';

  function slotsFuturos() {
    const ahora = new Date();
    const minutos = ahora.getHours() * 60 + ahora.getMinutes();
    return window.Util.slots().filter(function (hora) {
      const partes = hora.split(':');
      return (parseInt(partes[0], 10) * 60 + parseInt(partes[1], 10)) > minutos + 4;
    });
  }

  function urlQR(datos) {
    return 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=' + encodeURIComponent(datos);
  }

  function resumenHTML(resumen) {
    return resumen.items.map(function (item) {
      return '<div class="resumen-linea"><span>' + item.cantidad + 'x ' + window.Util.esc(item.nombre) + '</span>' +
        '<strong>' + window.Util.soles(item.subtotalFinal) + '</strong></div>';
    }).join('') +
      '<div class="resumen-linea descuento"><span>Descuento</span><strong>− ' + window.Util.soles(resumen.descuento) + '</strong></div>' +
      '<div class="total-final"><span>Total</span><strong>' + window.Util.soles(resumen.total) + '</strong></div>';
  }

  /* ---------- Paso 1: checkout ---------- */
  function renderCheckout() {
    const resumen = window.Carrito.detalle();
    if (!resumen.items.length) {
      contenido.innerHTML = '<div class="card">' + window.Util.vacio('No hay productos por pagar',
        'Agrega productos desde el menú para iniciar un pedido.',
        '<a class="btn btn-primario" href="menu.html">Ir al menú</a>') + '</div>';
      return;
    }
    const mesas = window.Almacen.listar('mesas').filter(function (m) { return m.estado !== 'fuera'; });
    let mesaGuardada = '';
    try { mesaGuardada = sessionStorage.getItem('cafeya_mesa_id') || ''; } catch (error) { mesaGuardada = ''; }
    const modalidadInicial = mesaGuardada ? 'mesa' : 'recojo';
    const horas = slotsFuturos();

    contenido.innerHTML =
      '<form id="form-checkout" novalidate>' +
        '<div class="pago-grid">' +
          '<div class="card">' +
            '<div class="card-head"><div class="card-titulo"><div class="card-icono">' + window.Util.svg('pagos') + '</div>' +
              '<div><h2>Confirma tu pedido</h2><p>Elige cómo recibirás tu pedido y cómo pagarás</p></div></div></div>' +

            '<div class="demo-aviso"><span>🧪</span><div><strong>Pago demostrativo</strong>' +
              'Esta es una simulación académica: no se realizarán cobros reales ni se solicitarán datos bancarios reales.</div></div>' +

            '<div class="campo mb-2"><label>Modalidad del pedido</label>' +
              '<div class="opciones-modalidad">' +
                '<label class="opcion-card' + (modalidadInicial === 'recojo' ? ' seleccionado' : '') + '" data-opcion="recojo">' +
                  '<input type="radio" name="modalidad" value="recojo"' + (modalidadInicial === 'recojo' ? ' checked' : '') + '>' +
                  '<span class="icono">🥡</span><div><strong>Para recoger</strong><small>Recojo en barra con código</small></div></label>' +
                '<label class="opcion-card' + (modalidadInicial === 'mesa' ? ' seleccionado' : '') + '" data-opcion="mesa">' +
                  '<input type="radio" name="modalidad" value="mesa"' + (modalidadInicial === 'mesa' ? ' checked' : '') + '>' +
                  '<span class="icono">🪑</span><div><strong>Consumo en mesa</strong><small>Pedido asociado a tu mesa</small></div></label>' +
              '</div>' +
            '</div>' +

            '<div class="form-grid dos">' +
              '<div class="campo" id="zona-hora"><label for="horaRecojo">Hora de recojo <span class="req">*</span></label>' +
                '<select id="horaRecojo" name="horaRecojo">' +
                  '<option value="">Selecciona una hora</option>' +
                  horas.map(function (hora) { return '<option value="' + hora + '">' + hora + '</option>'; }).join('') +
                '</select><span class="ayuda">Atendemos de ' + window.Util.esc((window.Almacen.config().horario || {}).apertura || '08:00') +
                ' a ' + window.Util.esc((window.Almacen.config().horario || {}).cierre || '22:00') + '</span><span class="error"></span></div>' +
              '<div class="campo oculto" id="zona-mesa"><label for="mesaId">Mesa <span class="req">*</span></label>' +
                '<select id="mesaId" name="mesaId">' +
                  '<option value="">Selecciona tu mesa</option>' +
                  mesas.map(function (mesa) {
                    return '<option value="' + mesa.id + '"' + (mesaGuardada === mesa.id ? ' selected' : '') + '>Mesa ' +
                      mesa.numero + ' · ' + mesa.zona + ' · ' + mesa.capacidad + ' personas</option>';
                  }).join('') +
                '</select><span class="error"></span></div>' +
            '</div>' +

            '<div class="campo mt-2"><label>Método de pago <span class="req">*</span></label>' +
              '<div class="metodos-pago">' + METODOS.map(function (metodo) {
                return '<label class="metodo-card seleccionado" data-metodo="' + metodo.id + '">' +
                  '<input type="radio" name="metodoPago" value="' + metodo.id + '"' + (metodo.id === 'yape' ? ' checked' : '') + '>' +
                  '<span class="icono">' + metodo.icono + '</span><strong>' + metodo.nombre + '</strong><small>' + metodo.nota + '</small></label>';
              }).join('') + '</div></div>' +

            '<div class="campo mt-2"><label for="observaciones">Observaciones del pedido (opcional)</label>' +
              '<textarea id="observaciones" name="observaciones" maxlength="180" placeholder="Ej. sin azúcar, servir en vaso para llevar..."></textarea></div>' +

            '<button class="btn btn-primario btn-block btn-lg mt-2" type="submit">Confirmar pedido · ' + window.Util.soles(resumen.total) + '</button>' +
            '<p class="small muted center mt-1">Al confirmar se generará un código único de recojo y un pago en estado pendiente.</p>' +
          '</div>' +

          '<aside class="card resumen-pago">' +
            '<h3>Resumen del pedido</h3>' + resumenHTML(resumen) +
            '<div class="alerta mt-2"><span class="alerta-icono">🧾</span><div><strong>' + resumen.cantidad + ' producto(s)</strong>' +
              'Los precios ya incluyen las promociones vigentes.</div></div>' +
            '<a class="btn btn-claro btn-block mt-1" href="carrito.html">Editar carrito</a>' +
          '</aside>' +
        '</div>' +
      '</form>';

    const form = document.getElementById('form-checkout');
    const zonaHora = document.getElementById('zona-hora');
    const zonaMesa = document.getElementById('zona-mesa');
    const hora = document.getElementById('horaRecojo');

    function actualizarModalidad(valor) {
      Array.prototype.forEach.call(form.querySelectorAll('[data-opcion]'), function (opcion) {
        opcion.classList.toggle('seleccionado', opcion.dataset.opcion === valor);
      });
      if (valor === 'mesa') {
        zonaMesa.classList.remove('oculto');
        zonaHora.classList.add('oculto');
        hora.value = '';
      } else {
        zonaHora.classList.remove('oculto');
        zonaMesa.classList.add('oculto');
        document.getElementById('mesaId').value = '';
      }
    }

    Array.prototype.forEach.call(form.querySelectorAll('input[name="modalidad"]'), function (radio) {
      radio.addEventListener('change', function () { actualizarModalidad(radio.value); });
    });
    Array.prototype.forEach.call(form.querySelectorAll('[data-metodo]'), function (tarjeta) {
      tarjeta.addEventListener('click', function () {
        Array.prototype.forEach.call(form.querySelectorAll('[data-metodo]'), function (otra) {
          otra.classList.remove('seleccionado');
        });
        tarjeta.classList.add('seleccionado');
      });
    });

    form.addEventListener('submit', function (evento) {
      evento.preventDefault();
      const modalidad = form.querySelector('input[name="modalidad"]:checked').value;
      const metodo = form.querySelector('input[name="metodoPago"]:checked').value;
      if (modalidad === 'recojo' && !hora.value) {
        window.Notificaciones.error('Hora pendiente', 'Selecciona la hora de recojo de tu pedido.');
        return;
      }
      if (modalidad === 'mesa' && !document.getElementById('mesaId').value) {
        window.Notificaciones.error('Mesa pendiente', 'Selecciona la mesa en la que te encuentras.');
        return;
      }
      const resultado = window.Pedidos.crear({
        modalidad: modalidad,
        horaRecojo: hora.value,
        metodoPago: metodo,
        mesaId: document.getElementById('mesaId').value,
        observaciones: form.elements.observaciones.value.trim()
      });
      if (!resultado.ok) {
        window.Notificaciones.error('No se pudo confirmar', resultado.error);
        return;
      }
      pedidoActual = resultado.pedido;
      pagoActual = resultado.pago;
      metodoSeleccionado = metodo;
      try { sessionStorage.removeItem('cafeya_mesa_id'); } catch (error) { /* sin mesa guardada */ }
      window.Shell.actualizarBadges();
      window.Notificaciones.exito('Pedido ' + pedidoActual.codigo + ' confirmado', 'Ahora completa el pago demostrativo.');
      renderPago();
    });

    actualizarModalidad(modalidadInicial);
  }

  /* ---------- Paso 2: pago ---------- */
  function renderPago() {
    if (!pedidoActual || !pagoActual) return;
    if (pedidoActual.estadoPago === 'aprobado') { mostrarResultado('aprobado'); return; }

    const items = (pedidoActual.items || []).map(function (item) {
      return '<div class="resumen-linea"><span>' + item.cantidad + 'x ' + window.Util.esc(item.nombre) + '</span>' +
        '<strong>' + window.Util.soles(item.precio * item.cantidad) + '</strong></div>';
    }).join('');

    contenido.innerHTML =
      '<div class="pago-grid">' +
        '<div class="card">' +
          '<div class="card-head"><div class="card-titulo"><div class="card-icono">' + window.Util.svg('tarjeta') + '</div>' +
            '<div><h2>Pago del pedido ' + window.Util.esc(pedidoActual.codigo) + '</h2>' +
            '<p>Importe exacto: <strong>' + window.Util.soles(pedidoActual.total) + '</strong></p></div></div>' +
            window.Util.badge(pedidoActual.estadoPago) + '</div>' +
          '<div class="demo-aviso"><span>🧪</span><div><strong>Pago demostrativo</strong>' +
            'No se realizará ningún cobro real. Puedes simular un pago aprobado o rechazado para mostrar el flujo completo.</div></div>' +
          '<div class="metodos-pago" id="selector-metodos">' + METODOS.map(function (metodo) {
            return '<button type="button" class="metodo-card' + (metodo.id === metodoSeleccionado ? ' seleccionado' : '') + '" data-metodo-pago="' + metodo.id + '">' +
              '<span class="icono">' + metodo.icono + '</span><strong>' + metodo.nombre + '</strong><small>' + metodo.nota + '</small></button>';
          }).join('') + '</div>' +
          '<div id="zona-pago"></div>' +
          '<div class="form-grid dos mt-2">' +
            '<div class="campo"><label for="resultado-simulacion">Resultado de la simulación</label>' +
              '<select id="resultado-simulacion"><option value="aprobado">Pago aprobado</option><option value="rechazado">Pago rechazado</option></select></div>' +
            '<div class="campo"><label>Referencia</label><input value="' + window.Util.esc(pagoActual.comprobante) + '" readonly></div>' +
          '</div>' +
          '<button class="btn btn-primario btn-block btn-lg mt-2" type="button" id="btn-confirmar-pago">' +
            'Confirmar pago de ' + window.Util.soles(pedidoActual.total) + '</button>' +
          '<p class="small muted center mt-1">Puedes consultar y modificar el estado de este pago desde el panel administrativo.</p>' +
        '</div>' +
        '<aside class="card resumen-pago">' +
          '<h3>Detalle del pedido</h3>' +
          '<div class="resumen-linea"><span>Código</span><strong>' + window.Util.esc(pedidoActual.codigo) + '</strong></div>' +
          '<div class="resumen-linea"><span>Modalidad</span><strong>' + (pedidoActual.modalidad === 'mesa' ? 'Consumo en mesa' : 'Para recoger') + '</strong></div>' +
          (pedidoActual.modalidad === 'recojo'
            ? '<div class="resumen-linea"><span>Hora de recojo</span><strong>' + (pedidoActual.horaRecojoTexto || '—') + '</strong></div>'
            : '<div class="resumen-linea"><span>Mesa</span><strong>' + window.Util.esc((window.Almacen.buscar('mesas', pedidoActual.mesaId) || {}).numero || '—') + '</strong></div>') +
          items +
          '<div class="resumen-linea descuento"><span>Descuento</span><strong>− ' + window.Util.soles(pedidoActual.descuento) + '</strong></div>' +
          '<div class="total-final"><span>Total a pagar</span><strong>' + window.Util.soles(pedidoActual.total) + '</strong></div>' +
          '<a class="btn btn-claro btn-block mt-1" href="seguimiento.html?codigo=' + encodeURIComponent(pedidoActual.codigo) + '">Ver seguimiento</a>' +
        '</aside>' +
      '</div>';

    Array.prototype.forEach.call(document.querySelectorAll('[data-metodo-pago]'), function (boton) {
      boton.addEventListener('click', function () {
        metodoSeleccionado = boton.dataset.metodoPago;
        Array.prototype.forEach.call(document.querySelectorAll('[data-metodo-pago]'), function (otro) {
          otro.classList.remove('seleccionado');
        });
        boton.classList.add('seleccionado');
        renderZonaPago();
      });
    });

    document.getElementById('btn-confirmar-pago').addEventListener('click', confirmarPago);
    renderZonaPago();
  }

  function renderZonaPago() {
    const zona = document.getElementById('zona-pago');
    if (!zona) return;
    const monto = window.Util.soles(pedidoActual.total);
    if (metodoSeleccionado === 'yape' || metodoSeleccionado === 'plin') {
      const nombre = metodoSeleccionado === 'yape' ? 'Yape' : 'Plin';
      const contenidoQR = 'CAFEYA-DEMO|PEDIDO:' + pedidoActual.codigo + '|MONTO:' + pedidoActual.total + '|METODO:' + metodoSeleccionado.toUpperCase();
      zona.innerHTML =
        '<div class="qr-simulado">' +
          '<div class="qr-titulo">QR demostrativo · ' + nombre + '</div>' +
          '<div class="qr-monto">' + monto + '</div>' +
          '<img src="' + urlQR(contenidoQR) + '" alt="QR demostrativo de ' + nombre + '" ' +
            'onerror="this.onerror=null;this.src=\'' + window.Util.placeholder('📱') + '\'">' +
          '<p>Escanearías este código con ' + nombre + ' y confirmarías el monto exacto.<br>' +
          'Código de referencia: <strong>' + window.Util.esc(pagoActual.codigo) + '</strong></p>' +
        '</div>' +
        '<div class="alerta aviso"><span class="alerta-icono">ℹ️</span><div><strong>Simulación</strong>' +
        'Al confirmar, el sistema registrará el pago como ' + (metodoSeleccionado === 'yape' ? 'Yape' : 'Plin') + ' según el resultado elegido.</div></div>';
    } else if (metodoSeleccionado === 'tarjeta') {
      zona.innerHTML =
        '<div class="tarjeta-demo-form form-grid dos">' +
          '<div class="campo" style="grid-column:1/-1"><label for="tarjeta-numero">Número de tarjeta (demostrativo)</label>' +
            '<input id="tarjeta-numero" inputmode="numeric" value="4111 1111 1111 1111"></div>' +
          '<div class="campo"><label for="tarjeta-nombre">Titular</label><input id="tarjeta-nombre" value="CLIENTE DEMOSTRACIÓN"></div>' +
          '<div class="campo"><label for="tarjeta-vencimiento">Vencimiento</label><input id="tarjeta-vencimiento" value="12/30"></div>' +
          '<div class="campo"><label for="tarjeta-cvv">CVV</label><input id="tarjeta-cvv" inputmode="numeric" value="123"></div>' +
          '<div class="campo"><label>Moneda</label><input value="Soles (PEN)" readonly></div>' +
          '<div class="alerta aviso" style="grid-column:1/-1;margin:0"><span class="alerta-icono">🔒</span><div>' +
            'Formulario demostrativo con datos de ejemplo. No utilices información bancaria real.</div></div>' +
        '</div>';
    } else {
      zona.innerHTML =
        '<div class="alerta exito"><span class="alerta-icono">💵</span><div><strong>Pago en efectivo</strong>' +
          'Acércate a caja al recoger tu pedido y presenta el código <strong>' + window.Util.esc(pedidoActual.codigo) +
          '</strong>. El pago quedará pendiente hasta que caja lo confirme.</div></div>';
    }
  }

  function confirmarPago() {
    if (metodoSeleccionado === 'tarjeta') {
      const numero = document.getElementById('tarjeta-numero').value.replace(/\s/g, '');
      const cvv = document.getElementById('tarjeta-cvv').value;
      if (numero.length < 15 || cvv.length < 3) {
        window.Notificaciones.error('Tarjeta incompleta', 'Completa los datos demostrativos de la tarjeta.');
        return;
      }
    }
    const resultado = document.getElementById('resultado-simulacion').value;
    if (metodoSeleccionado === 'efectivo') {
      window.Pagos.cambiarEstado(pagoActual.id, resultado === 'rechazado' ? 'rechazado' : 'pendiente',
        'Pago en efectivo al recoger el pedido');
      mostrarResultado(resultado === 'rechazado' ? 'rechazado' : 'pendiente');
      return;
    }
    const respuesta = window.Pagos.cambiarEstado(pagoActual.id, resultado,
      'Simulación de pago ' + resultado + ' con ' + window.Util.metodoPago(metodoSeleccionado));
    if (!respuesta.ok) {
      window.Notificaciones.error('No se pudo registrar el pago', respuesta.error);
      return;
    }
    pagoActual = respuesta.pago;
    mostrarResultado(resultado);
  }

  function mostrarResultado(estado) {
    const aprobado = estado === 'aprobado';
    const pendiente = estado === 'pendiente';
    const icono = aprobado ? '✅' : (pendiente ? '💵' : '⚠️');
    const titulo = aprobado ? '¡Pago aprobado!' : (pendiente ? 'Pago pendiente en caja' : 'Pago rechazado');
    const mensaje = aprobado
      ? 'Registramos tu pago demostrativo. Tu pedido ya se encuentra en la cola de preparación.'
      : (pendiente
        ? 'Tu pedido quedó registrado. El pago se confirmará al recogerlo en caja.'
        : 'La simulación devolvió un pago rechazado. Puedes intentarlo nuevamente o elegir otro método.');
    const metodos = window.Util.metodoPago(metodoSeleccionado);

    contenido.innerHTML =
      '<div class="card pago-resultado">' +
        '<div class="resultado-icono' + (aprobado || pendiente ? '' : ' error') + '">' + icono + '</div>' +
        '<h2 class="display">' + titulo + '</h2>' +
        '<p>' + mensaje + '</p>' +
        '<div class="comprobante">' +
          '<div class="fila"><span>Pedido</span><strong>' + window.Util.esc(pedidoActual.codigo) + '</strong></div>' +
          '<div class="fila"><span>Método</span><strong>' + metodos + '</strong></div>' +
          '<div class="fila"><span>Importe</span><strong>' + window.Util.soles(pedidoActual.total) + '</strong></div>' +
          '<div class="fila"><span>Estado del pago</span><strong>' + window.Util.etiqueta(estado) + '</strong></div>' +
          '<div class="fila"><span>Referencia</span><strong>' + window.Util.esc(pagoActual ? pagoActual.comprobante : '—') + '</strong></div>' +
          '<div class="fila"><span>Modalidad</span><strong>' + (pedidoActual.modalidad === 'mesa' ? 'Consumo en mesa' : 'Para recoger') + '</strong></div>' +
        '</div>' +
        '<div class="flex-wrap" style="justify-content:center">' +
          '<a class="btn btn-primario" href="seguimiento.html?codigo=' + encodeURIComponent(pedidoActual.codigo) + '">Ver seguimiento del pedido</a>' +
          (aprobado || pendiente ? '<button class="btn btn-claro" type="button" id="btn-comprobante">Descargar comprobante</button>' : '') +
          (aprobado ? '' : '<button class="btn btn-teal" type="button" id="btn-reintentar">Intentar nuevamente</button>') +
          '<a class="btn btn-claro" href="menu.html">Volver al menú</a>' +
        '</div>' +
        (aprobado
          ? '<div class="alerta mt-2" style="text-align:left"><span class="alerta-icono">⭐</span><div><strong>Fidelización</strong>' +
            'Cuando el pedido se marque como entregado, esta compra sumará un espacio en tu tarjeta de cliente frecuente.</div></div>'
          : '') +
      '</div>';

    const comprobante = document.getElementById('btn-comprobante');
    if (comprobante) comprobante.addEventListener('click', descargarComprobante);
    const reintentar = document.getElementById('btn-reintentar');
    if (reintentar) {
      reintentar.addEventListener('click', function () {
        if (!pagoActual) return;
        window.Pagos.cambiarEstado(pagoActual.id, 'pendiente', 'Reintento de pago');
        pagoActual = window.Almacen.buscar('pagos', pagoActual.id);
        pedidoActual = window.Almacen.buscar('pedidos', pedidoActual.id);
        renderPago();
      });
    }
    window.Shell.actualizarBadges();
  }

  function descargarComprobante() {
    const lineas = [
      'CAFÉYA ICA S.A.C.',
      'COMPROBANTE DEMOSTRATIVO - SIN VALOR TRIBUTARIO',
      '----------------------------------------',
      'Pedido: ' + pedidoActual.codigo,
      'Cliente: ' + pedidoActual.clienteNombre,
      'Fecha: ' + window.Util.fechaHora(pedidoActual.creadoEn),
      'Método: ' + window.Util.metodoPago(metodoSeleccionado),
      'Estado del pago: ' + window.Util.etiqueta(pedidoActual.estadoPago),
      '----------------------------------------'
    ];
    (pedidoActual.items || []).forEach(function (item) {
      lineas.push(item.cantidad + 'x ' + item.nombre + ' - ' + window.Util.soles(item.precio * item.cantidad));
    });
    lineas.push('----------------------------------------');
    lineas.push('Subtotal: ' + window.Util.soles(pedidoActual.subtotal));
    lineas.push('Descuento: ' + window.Util.soles(pedidoActual.descuento));
    lineas.push('TOTAL: ' + window.Util.soles(pedidoActual.total));
    lineas.push('');
    lineas.push('Documento generado para la presentación académica de CaféYa Ica.');
    window.Util.descargar('comprobante-' + pedidoActual.codigo + '.txt', lineas.join('\n'));
  }

  document.addEventListener('DOMContentLoaded', function () {
    contenido = window.Shell.cliente({
      pagina: 'carrito',
      titulo: 'Pago del pedido',
      subtitulo: 'Pago demostrativo · sin transacciones reales'
    });
    if (!contenido) return;

    const parametros = new URLSearchParams(location.search);
    const codigo = parametros.get('pedido');
    if (codigo) {
      const pedido = window.Pedidos.porCodigo(codigo);
      if (pedido) {
        pedidoActual = pedido;
        pagoActual = window.Pagos.porPedido(pedido.id);
        metodoSeleccionado = pedido.metodoPago || 'yape';
        if (pedido.estadoPago === 'aprobado') mostrarResultado('aprobado');
        else renderPago();
        return;
      }
    }
    renderCheckout();
  });
})();
