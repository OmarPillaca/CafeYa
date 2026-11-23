/* ============================================================
   CafeYa Ica - Servicio de fidelización (tarjeta de 5 compras)
   ============================================================ */
(function () {
  'use strict';

  const C = window.Almacen.CLAVES;
  const META = 5;

  function listar() {
    return window.Almacen.listar(C.fidelizacion).slice().sort(function (a, b) {
      return (b.compras || 0) - (a.compras || 0);
    });
  }

  function registroDe(usuarioId) {
    return listar().find(function (f) { return f.usuarioId === usuarioId; }) || {
      usuarioId: usuarioId, compras: 0, canjes: 0, pedidos: []
    };
  }

  function tarjeta(usuarioId) {
    const registro = registroDe(usuarioId);
    const compras = Number(registro.compras) || 0;
    const completadas = Math.floor(compras / META);
    let enTarjeta = compras % META;
    if (compras > 0 && enTarjeta === 0) enTarjeta = META;
    const beneficios = Math.max(0, completadas - (Number(registro.canjes) || 0));
    return {
      usuarioId: usuarioId,
      compras: compras,
      meta: META,
      enTarjeta: enTarjeta,
      pendientes: META - enTarjeta,
      progreso: Math.round((enTarjeta / META) * 100),
      completadas: completadas,
      beneficios: beneficios,
      beneficioDisponible: beneficios > 0,
      pedidos: registro.pedidos || []
    };
  }

  function sincronizar() {
    const pedidos = window.Almacen.listar(C.pedidos).filter(function (p) {
      return p.estado === 'entregado' && p.estadoPago === 'aprobado';
    });
    const usuarios = window.Almacen.listar(C.usuarios).filter(function (u) { return u.rol === 'cliente'; });
    const actuales = window.Almacen.listar(C.fidelizacion);
    const nueva = usuarios.map(function (usuario) {
      const previo = actuales.find(function (f) { return f.usuarioId === usuario.id; }) || {};
      const suyos = pedidos.filter(function (p) { return p.usuarioId === usuario.id; });
      return {
        id: previo.id || 'fid-' + usuario.id,
        usuarioId: usuario.id,
        cliente: usuario.nombre,
        compras: Math.max(suyos.length, Number(previo.compras) || 0),
        canjes: Number(previo.canjes) || 0,
        pedidos: suyos.map(function (p) { return p.id; }),
        actualizadoEn: new Date().toISOString()
      };
    });
    const antes = JSON.stringify(actuales.map(function (f) { return { u: f.usuarioId, c: f.compras }; }));
    const despues = JSON.stringify(nueva.map(function (f) { return { u: f.usuarioId, c: f.compras }; }));
    if (antes !== despues || actuales.length !== nueva.length) {
      window.Almacen.escribir(C.fidelizacion, nueva);
    }
  }

  function registrarCompra(usuarioId) {
    sincronizar();
    return tarjeta(usuarioId);
  }

  function resumen() {
    const registros = listar();
    return {
      clientes: registros.length,
      compras: window.Util.sumar(registros, 'compras'),
      tarjetasCompletas: registros.reduce(function (total, r) {
        return total + Math.floor((Number(r.compras) || 0) / META);
      }, 0),
      beneficiosDisponibles: registros.reduce(function (total, r) {
        const completadas = Math.floor((Number(r.compras) || 0) / META);
        return total + Math.max(0, completadas - (Number(r.canjes) || 0));
      }, 0)
    };
  }

  window.Fidelizacion = {
    META: META,
    listar: listar,
    registroDe: registroDe,
    tarjeta: tarjeta,
    sincronizar: sincronizar,
    registrarCompra: registrarCompra,
    resumen: resumen
  };
})();
