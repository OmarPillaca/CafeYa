/* ============================================================
   CafeYa Ica - Servicio de pagos DEMOSTRATIVOS
   Ningún pago realizado aquí es real.
   ============================================================ */
(function () {
  'use strict';

  const C = window.Almacen.CLAVES;

  const METODOS = [
    { id: 'yape', nombre: 'Yape', icono: '📱', descripcion: 'Escanea el QR demostrativo y confirma el pago simulado.' },
    { id: 'plin', nombre: 'Plin', icono: '📲', descripcion: 'Escanea el QR demostrativo y confirma el pago simulado.' },
    { id: 'tarjeta', nombre: 'Tarjeta', icono: '💳', descripcion: 'Completa el formulario demostrativo. No uses datos reales.' },
    { id: 'efectivo', nombre: 'Efectivo', icono: '💵', descripcion: 'Paga al recoger el pedido en caja.' }
  ];

  function listar() {
    return window.Almacen.listar(C.pagos).slice().sort(function (a, b) {
      return new Date(b.fecha) - new Date(a.fecha);
    });
  }

  function porPedido(pedidoId) {
    return listar().find(function (pago) { return pago.pedidoId === pedidoId; }) || null;
  }

  function porUsuario(usuarioId) {
    return listar().filter(function (pago) { return pago.usuarioId === usuarioId; });
  }

  function crear(datos) {
    const pago = window.Almacen.crear(C.pagos, {
      pedidoId: datos.pedidoId || null,
      codigo: window.Util.codigo('PG'),
      codigoPedido: datos.codigoPedido || '',
      cliente: datos.cliente || 'Cliente',
      usuarioId: datos.usuarioId || null,
      metodo: datos.metodo || 'yape',
      importe: window.Util.redondear(datos.importe),
      moneda: 'PEN',
      estado: datos.estado || 'pendiente',
      tipo: datos.tipo || 'pedido',
      compartidaId: datos.compartidaId || null,
      integranteId: datos.integranteId || null,
      fecha: new Date().toISOString(),
      comprobante: 'DEMO-' + Math.floor(100000 + Math.random() * 900000),
      nota: datos.nota || 'Pago demostrativo, sin transacción real'
    });
    return pago;
  }

  function cambiarEstado(pagoId, estado, nota) {
    const pago = window.Almacen.buscar(C.pagos, pagoId);
    if (!pago) return { ok: false, error: 'Pago no encontrado.' };
    window.Almacen.actualizar(C.pagos, pagoId, {
      estado: estado,
      nota: nota || pago.nota,
      validadoEn: new Date().toISOString()
    });
    if (pago.pedidoId) {
      window.Almacen.actualizar(C.pedidos, pago.pedidoId, { estadoPago: estado });
    }
    if (window.Fidelizacion) window.Fidelizacion.sincronizar();
    return { ok: true, pago: window.Almacen.buscar(C.pagos, pagoId) };
  }

  function resumen() {
    const pagos = listar();
    const aprobados = pagos.filter(function (p) { return p.estado === 'aprobado'; });
    return {
      total: pagos.length,
      aprobados: aprobados.length,
      pendientes: pagos.filter(function (p) { return p.estado === 'pendiente'; }).length,
      rechazados: pagos.filter(function (p) { return p.estado === 'rechazado'; }).length,
      recaudado: window.Util.redondear(window.Util.sumar(aprobados.filter(function (p) { return p.tipo === 'pedido'; }), 'importe'))
    };
  }

  window.Pagos = {
    METODOS: METODOS,
    listar: listar,
    porPedido: porPedido,
    porUsuario: porUsuario,
    crear: crear,
    cambiarEstado: cambiarEstado,
    resumen: resumen
  };
})();
