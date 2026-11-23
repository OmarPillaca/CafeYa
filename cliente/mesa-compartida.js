/* ============================================================
   CafeYa Ica - Mesa compartida y pago dividido
   ============================================================ */
(function () {
  'use strict';

  let contenido = null;
  let seleccionada = null;

  function compartida(id) { return window.Almacen.buscar('compartidas', id); }

  function totalIntegrante(integrante) {
    return window.Util.redondear((integrante.items || []).reduce(function (suma, item) {
      return suma + Number(item.precio) * Number(item.cantidad);
    }, 0));
  }

  function totalGeneral(c) {
    return window.Util.redondear((c.integrantes || []).reduce(function (suma, integrante) {
      return suma + totalIntegrante(integrante);
    }, 0));
  }

  function numeroMesa(mesaId) {
    const mesa = window.Almacen.buscar('mesas', mesaId);
    return mesa ? mesa.numero : '—';
  }

  function guardarIntegrantes(c, integrantes) {
    window.Almacen.actualizar('compartidas', c.id, { integrantes: integrantes });
  }

  function integranteHTML(integrante) {
    const total = totalIntegrante(integrante);
    const esMio = integrante.usuarioId === (window.Auth.usuarioActual() || {}).id;
    const items = (integrante.items || []).map(function (item) {
      return '<div class="linea"><span>' + item.cantidad + 'x ' + window.Util.esc(item.nombre) + '</span>' +
        '<strong>' + window.Util.soles(item.precio * item.cantidad) + '</strong></div>';
    }).join('');
    return '<div class="integrante-card ' + integrante.estado + '">' +
      '<div class="integrante-cabeza">' + window.Util.avatar(integrante.nombre, integrante.estado === 'pagado' ? '' : 'terracota') +
        '<div class="grow"><strong>' + window.Util.esc(integrante.nombre) + (esMio ? ' · Tú' : '') + '</strong>' +
        '<small>' + (integrante.estado === 'pagado' ? 'Pago completado' : 'Consumo pendiente de pago') + '</small></div>' +
        window.Util.badge(integrante.estado) +
      '</div>' +
      '<div class="integrante-items">' + (items || '<span class="sin-consumo">Sin consumo registrado</span>') + '</div>' +
      '<div class="integrante-pie"><span>Subtotal</span><strong>' + window.Util.soles(total) + '</strong></div>' +
      (integrante.estado === 'pagado'
        ? '<div class="pagado-nota">Pagado con ' + window.Util.metodoPago(integrante.metodoPago) + '</div>'
        : (total > 0
          ? '<button class="btn btn-primario btn-block btn-sm" type="button" data-pagar="' + integrante.id + '">Pagar mi parte</button>'
          : '<div class="alerta aviso" style="font-size:11px;padding:8px 10px"><span class="alerta-icono">🛒</span><div>Agrega productos para habilitar el pago.</div></div>')) +
      '<button class="btn btn-claro btn-block btn-sm" type="button" data-agregar-producto="' + integrante.id + '">+ Agregar productos</button>' +
    '</div>';
  }

  function detalleHTML(c) {
    const total = totalGeneral(c);
    const pagado = window.Util.redondear((c.integrantes || []).filter(function (i) {
      return i.estado === 'pagado';
    }).reduce(function (suma, i) { return suma + totalIntegrante(i); }, 0));
    const pendiente = window.Util.redondear(total - pagado);
    const porcentajePagado = total > 0 ? Math.round((pagado / total) * 100) : 0;
    const todosPagaron = total > 0 && pendiente <= 0;
    const mesa = window.Almacen.buscar('mesas', c.mesaId) || {};

    return '<div class="mc-grid">' +
      '<div class="card">' +
        '<div class="card-head">' +
          '<div class="card-titulo"><div class="card-icono">' + window.Util.svg('compartir') + '</div>' +
            '<div><h2>' + window.Util.esc(c.nombre) + '</h2>' +
            '<p>' + c.codigo + ' · Mesa ' + window.Util.esc(mesa.numero || '—') + ' · ' + c.integrantes.length + ' integrantes</p></div></div>' +
          '<div class="flex-wrap">' + window.Util.badge(c.estado) +
            '<button class="btn btn-claro btn-sm" type="button" id="btn-agregar-integrante">+ Integrante</button>' +
            (todosPagaron ? '<button class="btn btn-teal btn-sm" type="button" id="btn-cerrar-mesa">Cerrar mesa</button>' : '') +
          '</div>' +
        '</div>' +
        '<div class="mc-integrantes">' + c.integrantes.map(integranteHTML).join('') + '</div>' +
      '</div>' +
      '<aside class="card">' +
        '<h3 style="font-size:15px">Consumo general</h3>' +
        '<div class="mc-resumen-total"><span>Total de la mesa</span><strong>' + window.Util.soles(total) + '</strong></div>' +
        '<div class="mc-barra"><i style="width:' + porcentajePagado + '%;background:var(--menta)"></i>' +
          '<i style="width:' + (100 - porcentajePagado) + '%;background:var(--terracota);opacity:.35"></i></div>' +
        '<div class="mc-resumen-lineas">' +
          '<div><span>Pagado</span><strong style="color:var(--menta)">' + window.Util.soles(pagado) + '</strong></div>' +
          '<div><span>Pendiente</span><strong style="color:var(--terracota)">' + window.Util.soles(pendiente) + '</strong></div>' +
          '<div><span>Progreso</span><strong>' + porcentajePagado + '%</strong></div>' +
        '</div>' +
        (todosPagaron
          ? '<div class="alerta exito mt-2"><span class="alerta-icono">✅</span><div><strong>Todos pagaron</strong>Ya puedes cerrar la mesa.</div></div>'
          : '<div class="alerta aviso mt-2"><span class="alerta-icono">ℹ️</span><div><strong>Pago dividido</strong>' +
            'Cada integrante paga únicamente su consumo con Yape, Plin o tarjeta en modo demostrativo.</div></div>') +
        '<div class="small muted mt-2">Código de mesa: <strong>' + window.Util.esc(c.codigo) + '</strong></div>' +
      '</aside>' +
    '</div>';
  }

  function render() {
    const lista = window.Almacen.listar('compartidas');
    if (!seleccionada && lista.length) seleccionada = lista[0].id;
    const actual = seleccionada ? compartida(seleccionada) : null;

    contenido.innerHTML =
      '<div class="card-head" style="margin-bottom:14px">' +
        '<div><h2 style="font-size:16px;margin:0">Mesas compartidas activas</h2>' +
        '<p class="small muted" style="margin:2px 0 0">Crea una mesa, agrega integrantes y divide la cuenta</p></div>' +
        '<button class="btn btn-primario btn-sm" type="button" id="btn-nueva-compartida">+ Nueva mesa compartida</button>' +
      '</div>' +
      '<div class="mc-selector">' + (lista.length
        ? lista.map(function (c) {
            return '<button type="button" class="chip' + (c.id === seleccionada ? ' activo' : '') + '" data-seleccionar="' + c.id + '">' +
              window.Util.esc(c.codigo) + ' · Mesa ' + window.Util.esc(numeroMesa(c.mesaId)) +
              ' · ' + window.Util.esc(c.estado) + '</button>';
          }).join('')
        : '<span class="small muted">Aún no hay mesas compartidas. Crea la primera.</span>') +
      '</div>' +
      (actual ? detalleHTML(actual) : '<div class="card">' + window.Util.vacio('Sin mesa compartida',
        'Crea una mesa compartida para registrar el consumo de cada integrante y dividir el pago.',
        '<button class="btn btn-primario" type="button" id="btn-nueva-vacia">Crear mesa compartida</button>') + '</div>');

    conectar(actual);
  }

  function conectar(actual) {
    const nueva = document.getElementById('btn-nueva-compartida') || document.getElementById('btn-nueva-vacia');
    if (nueva) nueva.addEventListener('click', abrirNuevaMesa);

    Array.prototype.forEach.call(document.querySelectorAll('[data-seleccionar]'), function (boton) {
      boton.addEventListener('click', function () {
        seleccionada = boton.dataset.seleccionar;
        render();
      });
    });

    if (!actual) return;

    const agregarIntegrante = document.getElementById('btn-agregar-integrante');
    if (agregarIntegrante) agregarIntegrante.addEventListener('click', function () { abrirIntegrante(actual); });

    const cerrarMesa = document.getElementById('btn-cerrar-mesa');
    if (cerrarMesa) {
      cerrarMesa.addEventListener('click', function () {
        window.Modal.confirmar({
          titulo: 'Cerrar mesa compartida',
          mensaje: 'Todos los integrantes pagaron. La mesa quedará libre y la cuenta se cerrará.',
          textoOk: 'Cerrar mesa'
        }).then(function (confirmado) {
          if (!confirmado) return;
          window.Almacen.actualizar('compartidas', actual.id, { estado: 'cerrada', cerradaEn: new Date().toISOString() });
          const mesa = window.Almacen.buscar('mesas', actual.mesaId);
          if (mesa && mesa.estado === 'ocupada') window.Almacen.actualizar('mesas', mesa.id, { estado: 'libre' });
          seleccionada = null;
          window.Notificaciones.exito('Mesa cerrada', 'La cuenta de ' + actual.codigo + ' quedó cerrada.');
          render();
        });
      });
    }

    Array.prototype.forEach.call(document.querySelectorAll('[data-agregar-producto]'), function (boton) {
      boton.addEventListener('click', function () { abrirProducto(actual, boton.dataset.agregarProducto); });
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-pagar]'), function (boton) {
      boton.addEventListener('click', function () { abrirPago(actual, boton.dataset.pagar); });
    });
  }

  function abrirNuevaMesa() {
    const mesas = window.Almacen.listar('mesas').filter(function (m) { return m.estado !== 'fuera'; });
    const usuario = window.Auth.usuarioActual();
    const caja = window.Modal.abrir({
      titulo: 'Nueva mesa compartida',
      subtitulo: 'Registra a los integrantes que compartirán la cuenta',
      emoji: '🪑',
      tamano: 'mediano',
      cuerpo:
        '<div class="form-grid">' +
          '<div class="form-grid dos">' +
            '<div class="campo"><label for="mc-nombre">Nombre de la mesa</label>' +
              '<input id="mc-nombre" value="Mesa compartida" maxlength="40"></div>' +
            '<div class="campo"><label for="mc-mesa">Mesa del local</label>' +
              '<select id="mc-mesa">' + mesas.map(function (mesa) {
                return '<option value="' + mesa.id + '">Mesa ' + mesa.numero + ' · ' + mesa.zona + ' · ' + mesa.capacidad + ' pers.</option>';
              }).join('') + '</select></div>' +
          '</div>' +
          '<div class="campo"><label for="mc-integrantes">Integrantes separados por coma</label>' +
            '<input id="mc-integrantes" value="' + window.Util.esc(usuario.nombre.split(' ')[0] + ', ' + 'Carlos, Ana') + '">' +
            '<span class="ayuda">El primer integrante queda vinculado a tu cuenta.</span></div>' +
          '<div class="alerta"><span class="alerta-icono">👥</span><div>Podrás agregar productos al consumo de cada integrante y simular el pago individual.</div></div>' +
        '</div>',
      acciones: '<button class="btn btn-claro" type="button" data-cerrar>Cancelar</button>' +
        '<button class="btn btn-primario" type="button" id="mc-crear">Crear mesa compartida</button>'
    });
    caja.querySelector('#mc-crear').addEventListener('click', function () {
      const nombre = caja.querySelector('#mc-nombre').value.trim() || 'Mesa compartida';
      const mesaId = caja.querySelector('#mc-mesa').value;
      const nombres = caja.querySelector('#mc-integrantes').value.split(',').map(function (n) { return n.trim(); })
        .filter(function (n) { return n.length > 0; });
      if (!nombres.length) {
        window.Notificaciones.error('Integrantes requeridos', 'Escribe al menos un nombre.');
        return;
      }
      const nueva = window.Almacen.crear('compartidas', {
        codigo: 'MC-' + Math.floor(1000 + Math.random() * 9000),
        mesaId: mesaId,
        nombre: nombre,
        estado: 'abierta',
        integrantes: nombres.map(function (integranteNombre, indice) {
          return {
            id: window.Util.id('int'),
            nombre: integranteNombre,
            usuarioId: indice === 0 ? window.Auth.usuarioActual().id : null,
            estado: 'pendiente',
            metodoPago: null,
            items: []
          };
        })
      });
      const mesa = window.Almacen.buscar('mesas', mesaId);
      if (mesa && mesa.estado === 'libre') window.Almacen.actualizar('mesas', mesaId, { estado: 'ocupada' });
      seleccionada = nueva.id;
      window.Modal.cerrar();
      window.Notificaciones.exito('Mesa creada', nueva.codigo + ' · ' + nombres.length + ' integrantes');
      render();
    });
  }

  function abrirIntegrante(c) {
    const caja = window.Modal.abrir({
      titulo: 'Agregar integrante',
      subtitulo: c.nombre + ' · ' + c.codigo,
      emoji: '👥',
      cuerpo: '<div class="form-grid"><div class="campo"><label for="mc-nuevo-integrante">Nombre del integrante</label>' +
        '<input id="mc-nuevo-integrante" placeholder="Ej. Rosa Mendoza" maxlength="40"></div></div>',
      acciones: '<button class="btn btn-claro" type="button" data-cerrar>Cancelar</button>' +
        '<button class="btn btn-primario" type="button" id="mc-agregar">Agregar</button>'
    });
    caja.querySelector('#mc-agregar').addEventListener('click', function () {
      const nombre = caja.querySelector('#mc-nuevo-integrante').value.trim();
      if (nombre.length < 2) {
        window.Notificaciones.error('Nombre inválido', 'Ingresa el nombre del integrante.');
        return;
      }
      const integrantes = c.integrantes.concat([{
        id: window.Util.id('int'), nombre: nombre, usuarioId: null, estado: 'pendiente', metodoPago: null, items: []
      }]);
      guardarIntegrantes(c, integrantes);
      window.Modal.cerrar();
      window.Notificaciones.exito('Integrante agregado', nombre + ' ya puede registrar su consumo.');
      render();
    });
  }

  function abrirProducto(c, integranteId) {
    const integrante = c.integrantes.find(function (i) { return i.id === integranteId; });
    const productos = window.Almacen.listar('productos').filter(function (p) { return p.disponible; });
    const caja = window.Modal.abrir({
      titulo: 'Agregar productos',
      subtitulo: 'Consumo de ' + integrante.nombre,
      emoji: '🛒',
      tamano: 'mediano',
      cuerpo:
        '<div class="form-grid">' +
          '<div class="form-grid dos">' +
            '<div class="campo"><label for="mc-producto">Producto</label><select id="mc-producto">' +
              productos.map(function (p) {
                const info = window.Promociones.paraProducto(p);
                return '<option value="' + p.id + '">' + window.Util.esc(p.nombre) + ' · ' + window.Util.soles(info.precio) + '</option>';
              }).join('') + '</select></div>' +
            '<div class="campo"><label for="mc-cantidad">Cantidad</label>' +
              '<input type="number" id="mc-cantidad" min="1" max="10" value="1"></div>' +
          '</div>' +
          '<div class="alerta"><span class="alerta-icono">ℹ️</span><div>Los productos se descuentan con el precio promocional vigente.</div></div>' +
        '</div>',
      acciones: '<button class="btn btn-claro" type="button" data-cerrar>Cancelar</button>' +
        '<button class="btn btn-primario" type="button" id="mc-agregar-producto">Agregar al consumo</button>'
    });
    caja.querySelector('#mc-agregar-producto').addEventListener('click', function () {
      const producto = window.Almacen.buscar('productos', caja.querySelector('#mc-producto').value);
      const cantidad = Math.max(1, Number(caja.querySelector('#mc-cantidad').value) || 1);
      if (!producto) return;
      const info = window.Promociones.paraProducto(producto);
      const integrantes = c.integrantes.map(function (i) {
        if (i.id !== integranteId) return i;
        const items = (i.items || []).slice();
        const existente = items.find(function (it) { return it.productoId === producto.id; });
        if (existente) existente.cantidad += cantidad;
        else items.push({ productoId: producto.id, nombre: producto.nombre, precio: info.precio, cantidad: cantidad });
        return Object.assign({}, i, { items: items });
      });
      guardarIntegrantes(c, integrantes);
      window.Modal.cerrar();
      window.Notificaciones.exito('Producto agregado', cantidad + 'x ' + producto.nombre + ' para ' + integrante.nombre);
      render();
    });
  }

  function abrirPago(c, integranteId) {
    const integrante = c.integrantes.find(function (i) { return i.id === integranteId; });
    const total = totalIntegrante(integrante);
    let metodo = 'yape';
    const caja = window.Modal.abrir({
      titulo: 'Pagar mi parte',
      subtitulo: integrante.nombre + ' · ' + c.codigo,
      emoji: '💳',
      cuerpo:
        '<div class="pago-parte"><span>Importe individual</span><strong>' + window.Util.soles(total) + '</strong></div>' +
        '<div class="metodos-pago-mini">' +
          '<button type="button" class="metodo-mini activo" data-metodo="yape">📱 Yape</button>' +
          '<button type="button" class="metodo-mini" data-metodo="plin">📲 Plin</button>' +
          '<button type="button" class="metodo-mini" data-metodo="tarjeta">💳 Tarjeta</button>' +
        '</div>' +
        '<div class="campo mt-2"><label for="mc-resultado">Resultado de la simulación</label>' +
          '<select id="mc-resultado"><option value="aprobado">Pago aprobado</option><option value="rechazado">Pago rechazado</option></select></div>' +
        '<div class="alerta aviso mt-2"><span class="alerta-icono">🧪</span><div><strong>Pago demostrativo</strong>' +
          'Solo se actualizará el estado de ' + window.Util.esc(integrante.nombre) + '. No afecta a los demás integrantes.</div></div>',
      acciones: '<button class="btn btn-claro" type="button" data-cerrar>Cancelar</button>' +
        '<button class="btn btn-primario" type="button" id="mc-pagar">Confirmar pago</button>'
    });
    Array.prototype.forEach.call(caja.querySelectorAll('[data-metodo]'), function (boton) {
      boton.addEventListener('click', function () {
        metodo = boton.dataset.metodo;
        Array.prototype.forEach.call(caja.querySelectorAll('[data-metodo]'), function (otro) {
          otro.classList.remove('activo');
        });
        boton.classList.add('activo');
      });
    });
    caja.querySelector('#mc-pagar').addEventListener('click', function () {
      const resultadoSimulado = caja.querySelector('#mc-resultado').value;
      const pago = window.Pagos.crear({
        tipo: 'compartida',
        compartidaId: c.id,
        integranteId: integrante.id,
        cliente: integrante.nombre,
        usuarioId: integrante.usuarioId,
        metodo: metodo,
        importe: total,
        estado: resultadoSimulado,
        nota: 'Pago dividido demostrativo de ' + integrante.nombre
      });
      if (resultadoSimulado === 'rechazado') {
        window.Modal.cerrar();
        window.Notificaciones.error('Pago rechazado', 'El integrante ' + integrante.nombre + ' sigue con pago pendiente.');
        render();
        return;
      }
      const integrantes = c.integrantes.map(function (i) {
        if (i.id !== integrante.id) return i;
        return Object.assign({}, i, {
          estado: 'pagado', metodoPago: metodo, pagoId: pago.id, pagadoEn: new Date().toISOString()
        });
      });
      guardarIntegrantes(c, integrantes);
      window.Modal.cerrar();
      window.Notificaciones.exito('Pago registrado', integrante.nombre + ' pagó ' + window.Util.soles(total) + ' con ' + window.Util.metodoPago(metodo) + '.');
      const actualizada = compartida(c.id);
      const pendientes = actualizada.integrantes.filter(function (i) { return i.estado !== 'pagado'; });
      if (!pendientes.length) {
        window.Notificaciones.info('Cuenta completa', 'Todos pagaron. Ya puedes cerrar la mesa compartida.');
      }
      render();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    contenido = window.Shell.cliente({
      pagina: 'mesa-compartida',
      titulo: 'Mesa compartida',
      subtitulo: 'Divide la cuenta y paga tu parte'
    });
    if (!contenido) return;
    const parametros = new URLSearchParams(location.search);
    if (parametros.get('id')) seleccionada = parametros.get('id');
    render();
    window.Almacen.alCambiar(window.Util.debounce(render, 400));
  });
})();
