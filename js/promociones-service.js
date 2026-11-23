/* ============================================================
   CafeYa Ica - Servicio de promociones y precios
   ============================================================ */
(function () {
  'use strict';

  const C = window.Almacen.CLAVES;

  function todas() { return window.Almacen.listar(C.promociones); }

  function enHorario(promo) {
    if (!promo.horaInicio || !promo.horaFin) return true;
    const ahora = new Date();
    const minutos = ahora.getHours() * 60 + ahora.getMinutes();
    const inicio = promo.horaInicio.split(':');
    const fin = promo.horaFin.split(':');
    return minutos >= (parseInt(inicio[0], 10) * 60 + parseInt(inicio[1] || 0, 10)) &&
      minutos <= (parseInt(fin[0], 10) * 60 + parseInt(fin[1] || 0, 10));
  }

  function vigente(promo) {
    if (!promo || promo.activa === false) return false;
    const hoy = window.Util.hoyISO();
    if (promo.vigenciaDesde && promo.vigenciaDesde > hoy) return false;
    if (promo.vigenciaHasta && promo.vigenciaHasta < hoy) return false;
    return true;
  }

  function activas(ignorarHorario) {
    return todas().filter(function (promo) {
      return vigente(promo) && (ignorarHorario || enHorario(promo));
    });
  }

  function paraProducto(producto) {
    if (!producto) return { precio: 0, antes: 0, descuento: 0, promo: null, etiqueta: null };
    const base = Number(producto.precio) || 0;
    let mejor = { precio: base, promo: null };
    if (producto.precioPromo && Number(producto.precioPromo) < base) {
      mejor = {
        precio: Number(producto.precioPromo),
        promo: todas().find(function (p) { return p.id === producto.promoId; }) || null
      };
    }
    activas(true).forEach(function (promo) {
      if (promo.tipo !== 'porcentaje' || !promo.descuento) return;
      const aplica = (promo.productos || []).indexOf(producto.id) > -1 ||
        (promo.categoria && promo.categoria === producto.categoriaId);
      if (!aplica) return;
      if (!enHorario(promo)) return;
      const precio = Math.round(base * (1 - promo.descuento / 100) * 100) / 100;
      if (precio < mejor.precio) mejor = { precio: precio, promo: promo };
    });
    const descuento = Math.round((base - mejor.precio) * 100) / 100;
    return {
      precio: mejor.precio,
      antes: base,
      descuento: descuento > 0 ? descuento : 0,
      promo: mejor.promo,
      etiqueta: mejor.promo ? mejor.promo.titulo : null
    };
  }

  function porId(id) { return todas().find(function (p) { return p.id === id; }) || null; }

  function resumen() {
    return {
      total: todas().length,
      activas: activas(true).length,
      pausadas: todas().filter(function (p) { return p.activa === false; }).length
    };
  }

  window.Promociones = {
    todas: todas,
    activas: activas,
    vigente: vigente,
    enHorario: enHorario,
    paraProducto: paraProducto,
    porId: porId,
    resumen: resumen
  };
})();
