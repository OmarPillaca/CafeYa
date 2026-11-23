/* ============================================================
   CafeYa Ica - Servicio de pedidos
   ============================================================ */
(function () {
  'use strict';

  const C = window.Almacen.CLAVES;
  const ESTADOS = ['recibido', 'preparacion', 'listo', 'entregado', 'cancelado'];

  function listar() {
    return window.Almacen.listar(C.pedidos).slice().sort(function (a, b) {
      return new Date(b.creadoEn) - new Date(a.creadoEn);
    });
  }

  function porUsuario(usuarioId) {
    return listar().filter(function (p) { return p.usuarioId === usuarioId; });
  }

  function porCodigo(codigo) {
    return listar().find(function (p) {
      return String(p.codigo).toLowerCase() === String(codigo || '').trim().toLowerCase();
    }) || null;
  }

  function porId(id) { return window.Almacen.buscar(C.pedidos, id); }

  function delDia() {
    const hoy = window.Util.hoyISO();
    return listar().filter(function (p) { return window.Util.isoDia(p.creadoEn) === hoy; });
  }

  function activos() {
    return listar().filter(function (p) {
      return p.estado === 'recibido' || p.estado === 'preparacion' || p.estado === 'listo';
    });
  }

  function validarHoraRecojo(hora) {
    const config = window.Almacen.config();
    const horario = config.horario || { apertura: '08:00', cierre: '22:00' };
    if (!hora) return { ok: false, error: 'Selecciona una hora para recoger tu pedido.' };
    if (!/^\d{2}:\d{2}$/.test(hora)) return { ok: false, error: 'La hora de recojo no es válida.' };
    if (hora < horario.apertura || hora > horario.cierre) {
      return { ok: false, error: 'Atendemos de ' + horario.apertura + ' a ' + horario.cierre + '. Elige una hora dentro del horario.' };
    }
    const ahora = new Date();
    const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();
    const partes = hora.split(':');
    const minutosHora = parseInt(partes[0], 10) * 60 + parseInt(partes[1], 10);
    if (minutosHora < minutosAhora + 5) {
      return { ok: false, error: 'La hora de recojo debe ser posterior a la hora actual (mínimo 5 minutos).' };
    }
    return { ok: true };
  }

  function generarCodigo() {
    let codigo = window.Util.codigo('CY');
    while (porCodigo(codigo)) codigo = window.Util.codigo('CY');
    return codigo;
  }

  function crear(opciones) {
    const opcionesFinales = opciones || {};
    const resumen = window.Carrito.detalle();
    if (!resumen.items.length) return { ok: false, error: 'Tu carrito está vacío. Agrega productos del menú.' };
    const usuario = window.Auth.usuarioActual();
    if (!usuario) return { ok: false, error: 'Inicia sesión para confirmar tu pedido.' };
    const metodo = opcionesFinales.metodoPago;
    if (!metodo) return { ok: false, error: 'Selecciona un método de pago.' };
    const modalidad = opcionesFinales.modalidad || 'recojo';

    if (modalidad === 'recojo') {
      const revision = validarHoraRecojo(opcionesFinales.horaRecojo);
      if (!revision.ok) return revision;
    }
    if (modalidad === 'mesa' && !opcionesFinales.mesaId) {
      return { ok: false, error: 'Selecciona la mesa desde la que realizas el pedido.' };
    }

    const codigo = generarCodigo();
    const horaRecojo = opcionesFinales.horaRecojo
      ? new Date(window.Util.hoyISO() + 'T' + opcionesFinales.horaRecojo + ':00').toISOString()
      : null;

    const pedido = window.Almacen.crear(C.pedidos, {
      codigo: codigo,
      usuarioId: usuario.id,
      clienteNombre: usuario.nombre,
      clienteCorreo: usuario.correo,
      clienteCelular: usuario.celular,
      items: resumen.items.map(function (item) {
        return {
          productoId: item.productoId,
          nombre: item.nombre,
          precio: item.precioUnitario,
          cantidad: item.cantidad,
          observacion: item.observacion || ''
        };
      }),
      subtotal: resumen.subtotal,
      descuento: resumen.descuento,
      total: resumen.total,
      metodoPago: metodo,
      estadoPago: 'pendiente',
      estado: 'recibido',
      modalidad: modalidad,
      mesaId: opcionesFinales.mesaId || null,
      compartidaId: opcionesFinales.compartidaId || null,
      horaRecojo: horaRecojo,
      horaRecojoTexto: opcionesFinales.horaRecojo || null,
      observaciones: opcionesFinales.observaciones || '',
      origen: opcionesFinales.origen || 'cliente',
      historial: [{ estado: 'recibido', fecha: new Date().toISOString(), por: usuario.nombre }]
    });

    const pago = window.Pagos.crear({
      pedidoId: pedido.id,
      codigoPedido: pedido.codigo,
      cliente: usuario.nombre,
      usuarioId: usuario.id,
      metodo: metodo,
      importe: pedido.total,
      estado: 'pendiente',
      tipo: 'pedido'
    });

    window.Carrito.vaciar();

    if (window.Notificaciones) {
      window.Notificaciones.exito('Pedido ' + pedido.codigo + ' registrado',
        'Total ' + window.Util.soles(pedido.total) + '. Ya puedes seguir su preparación.');
    }
    return { ok: true, pedido: pedido, pago: pago };
  }

  function cambiarEstado(pedidoId, estado, nota) {
    if (ESTADOS.indexOf(estado) === -1) return { ok: false, error: 'Estado no válido.' };
    const pedido = porId(pedidoId);
    if (!pedido) return { ok: false, error: 'Pedido no encontrado.' };
    const usuario = window.Auth.usuarioActual();
    const historial = (pedido.historial || []).concat([{
      estado: estado,
      fecha: new Date().toISOString(),
      por: usuario ? usuario.nombre : 'Sistema',
      nota: nota || ''
    }]);
    const cambios = { estado: estado, historial: historial, actualizadoEn: new Date().toISOString() };
    if (estado === 'listo') cambios.listoEn = new Date().toISOString();
    if (estado === 'entregado') cambios.entregadoEn = new Date().toISOString();
    if (estado === 'cancelado') cambios.canceladoEn = new Date().toISOString();
    window.Almacen.actualizar(C.pedidos, pedidoId, cambios);

    if (estado === 'entregado' && pedido.estadoPago !== 'aprobado') {
      const pago = window.Pagos.porPedido(pedidoId);
      if (pago) window.Pagos.cambiarEstado(pago.id, 'aprobado', 'Pago aprobado al entregar el pedido');
    }
    if (estado === 'cancelado') {
      const pago = window.Pagos.porPedido(pedidoId);
      if (pago && pago.estado === 'pendiente') {
        window.Pagos.cambiarEstado(pago.id, 'rechazado', 'Pedido cancelado');
      }
    }
    if (window.Fidelizacion) window.Fidelizacion.sincronizar();
    if (window.Notificaciones) {
      window.Notificaciones.info('Pedido ' + pedido.codigo, 'Nuevo estado: ' + window.Util.etiqueta(estado));
    }
    return { ok: true, pedido: porId(pedidoId) };
  }

  function cancelar(pedidoId, motivo) {
    return cambiarEstado(pedidoId, 'cancelado', motivo || 'Cancelado por el cliente');
  }

  function siguienteEstado(estado) {
    const mapa = { recibido: 'preparacion', preparacion: 'listo', listo: 'entregado' };
    return mapa[estado] || null;
  }

  function estadisticas() {
    const pedidos = listar();
    const hoy = window.Util.hoyISO();
    const delDiaLista = pedidos.filter(function (p) { return window.Util.isoDia(p.creadoEn) === hoy; });
    const aprobados = pedidos.filter(function (p) { return p.estado !== 'cancelado' && p.estadoPago === 'aprobado'; });
    const ventasHoy = delDiaLista.filter(function (p) { return p.estado !== 'cancelado' && p.estadoPago === 'aprobado'; })
      .reduce(function (total, p) { return total + p.total; }, 0);
    const ventasTotales = aprobados.reduce(function (total, p) { return total + p.total; }, 0);
    return {
      total: pedidos.length,
      hoy: delDiaLista.length,
      recibidos: pedidos.filter(function (p) { return p.estado === 'recibido'; }).length,
      preparacion: pedidos.filter(function (p) { return p.estado === 'preparacion'; }).length,
      listos: pedidos.filter(function (p) { return p.estado === 'listo'; }).length,
      entregados: pedidos.filter(function (p) { return p.estado === 'entregado'; }).length,
      cancelados: pedidos.filter(function (p) { return p.estado === 'cancelado'; }).length,
      pendientes: pedidos.filter(function (p) { return p.estado === 'recibido' || p.estado === 'preparacion'; }).length,
      ventasHoy: window.Util.redondear(ventasHoy),
      ventasTotales: window.Util.redondear(ventasTotales),
      ticketPromedio: aprobados.length ? window.Util.redondear(ventasTotales / aprobados.length) : 0
    };
  }

  window.Pedidos = {
    ESTADOS: ESTADOS,
    listar: listar,
    porUsuario: porUsuario,
    porCodigo: porCodigo,
    porId: porId,
    delDia: delDia,
    activos: activos,
    crear: crear,
    validarHoraRecojo: validarHoraRecojo,
    cambiarEstado: cambiarEstado,
    cancelar: cancelar,
    siguienteEstado: siguienteEstado,
    estadisticas: estadisticas
  };
})();
