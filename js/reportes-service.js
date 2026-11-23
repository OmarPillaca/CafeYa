/* ============================================================
   CafeYa Ica - Servicio de reportes y estadísticas
   Todos los cálculos se generan con los registros reales guardados.
   ============================================================ */
(function () {
  'use strict';

  const C = window.Almacen.CLAVES;
  const COLORES = ['#1F2461', '#00808F', '#00A88F', '#B5503C', '#F2A93B', '#6B3FA0'];

  function todos() { return window.Almacen.listar(C.pedidos); }

  function validos() {
    return todos().filter(function (p) { return p.estado !== 'cancelado'; });
  }

  function pagados(lista) {
    return (lista || validos()).filter(function (p) { return p.estadoPago === 'aprobado'; });
  }

  function enFecha(iso, desde, hasta) {
    const dia = window.Util.isoDia(iso);
    return (!desde || dia >= desde) && (!hasta || dia <= hasta);
  }

  function enRango(desde, hasta) {
    return validos().filter(function (p) { return enFecha(p.creadoEn, desde, hasta); });
  }

  function resumen(desde, hasta) {
    const lista = enRango(desde, hasta);
    const aprobados = pagados(lista);
    const ventas = window.Util.redondear(window.Util.sumar(aprobados, 'total'));
    const productosVendidos = aprobados.reduce(function (total, pedido) {
      return total + (pedido.items || []).reduce(function (suma, item) { return suma + (Number(item.cantidad) || 0); }, 0);
    }, 0);
    const usuarios = window.Almacen.listar(C.usuarios).filter(function (u) { return u.rol === 'cliente'; });
    const reservas = window.Almacen.listar(C.reservas).filter(function (r) {
      return enFecha(r.creadoEn, desde, hasta);
    });
    const sugerencias = window.Almacen.listar(C.sugerencias).filter(function (s) {
      return enFecha(s.fecha, desde, hasta);
    });
    return {
      pedidos: lista.length,
      pedidosPagados: aprobados.length,
      ventas: ventas,
      ticket: aprobados.length ? window.Util.redondear(ventas / aprobados.length) : 0,
      productosVendidos: productosVendidos,
      clientes: usuarios.length,
      clientesNuevos: usuarios.filter(function (u) { return enFecha(u.creadoEn, desde, hasta); }).length,
      reservas: reservas.length,
      sugerencias: sugerencias.length
    };
  }

  function ventasPorDia(dias) {
    const total = dias || 7;
    const salida = [];
    for (let i = total - 1; i >= 0; i--) {
      const dia = window.Util.sumarDias(window.Util.hoyISO(), -i);
      const valor = pagados().filter(function (p) { return window.Util.isoDia(p.creadoEn) === dia; })
        .reduce(function (suma, p) { return suma + p.total; }, 0);
      salida.push({
        etiqueta: new Date(dia + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'short' }).replace('.', ''),
        valor: window.Util.redondear(valor),
        fecha: dia
      });
    }
    return salida;
  }

  function ventasPorMes(meses) {
    const total = meses || 6;
    const salida = [];
    const ahora = new Date();
    for (let i = total - 1; i >= 0; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const clave = fecha.getFullYear() + '-' + String(fecha.getMonth() + 1).padStart(2, '0');
      const valor = pagados().filter(function (p) {
        return String(p.creadoEn).slice(0, 7) === clave;
      }).reduce(function (suma, p) { return suma + p.total; }, 0);
      salida.push({
        etiqueta: fecha.toLocaleDateString('es-PE', { month: 'short' }).replace('.', ''),
        valor: window.Util.redondear(valor),
        clave: clave
      });
    }
    return salida;
  }

  function productosMasVendidos(desde, hasta, limite) {
    const mapa = {};
    pagados(enRango(desde, hasta)).forEach(function (pedido) {
      (pedido.items || []).forEach(function (item) {
        if (!mapa[item.productoId]) {
          mapa[item.productoId] = { etiqueta: item.nombre, valor: 0, total: 0, productoId: item.productoId };
        }
        mapa[item.productoId].valor += Number(item.cantidad) || 0;
        mapa[item.productoId].total += (Number(item.precio) || 0) * (Number(item.cantidad) || 0);
      });
    });
    return Object.keys(mapa).map(function (k) {
      mapa[k].total = window.Util.redondear(mapa[k].total);
      return mapa[k];
    }).sort(function (a, b) { return b.valor - a.valor; }).slice(0, limite || 8);
  }

  function pedidosPorEstado(desde, hasta) {
    const lista = todos().filter(function (p) { return enFecha(p.creadoEn, desde, hasta); });
    return window.Pedidos.ESTADOS.map(function (estado, indice) {
      return {
        etiqueta: window.Util.etiqueta(estado),
        valor: lista.filter(function (p) { return p.estado === estado; }).length,
        estado: estado,
        color: COLORES[indice % COLORES.length]
      };
    });
  }

  function metodosPago(desde, hasta) {
    const lista = pagados(enRango(desde, hasta));
    const metodos = ['yape', 'plin', 'tarjeta', 'efectivo'];
    return metodos.map(function (metodo, indice) {
      const filtrados = lista.filter(function (p) { return p.metodoPago === metodo; });
      return {
        etiqueta: window.Util.metodoPago(metodo),
        valor: filtrados.length,
        total: window.Util.redondear(window.Util.sumar(filtrados, 'total')),
        color: COLORES[indice % COLORES.length]
      };
    }).filter(function (d) { return d.valor > 0; });
  }

  function clientesFrecuentes(limite) {
    return window.Almacen.listar(C.fidelizacion)
      .slice()
      .sort(function (a, b) { return (b.compras || 0) - (a.compras || 0); })
      .slice(0, limite || 10)
      .map(function (registro) {
        const usuario = window.Almacen.buscar(C.usuarios, registro.usuarioId) || {};
        return {
          usuarioId: registro.usuarioId,
          cliente: registro.cliente || usuario.nombre || 'Cliente',
          correo: usuario.correo || '—',
          compras: Number(registro.compras) || 0,
          tarjetas: Math.floor((Number(registro.compras) || 0) / window.Fidelizacion.META),
          beneficios: Math.max(0, Math.floor((Number(registro.compras) || 0) / window.Fidelizacion.META) - (Number(registro.canjes) || 0))
        };
      });
  }

  function reservasPorEstado() {
    const reservas = window.Almacen.listar(C.reservas);
    return ['pendiente', 'confirmada', 'cancelada', 'finalizada'].map(function (estado, indice) {
      return {
        etiqueta: window.Util.etiqueta(estado),
        valor: reservas.filter(function (r) { return r.estado === estado; }).length,
        color: COLORES[indice % COLORES.length]
      };
    });
  }

  function sugerenciasResumen() {
    const sugerencias = window.Almacen.listar(C.sugerencias);
    const calificaciones = sugerencias.map(function (s) { return Number(s.calificacion) || 0; });
    const promedio = calificaciones.length
      ? Math.round((calificaciones.reduce(function (a, b) { return a + b; }, 0) / calificaciones.length) * 10) / 10
      : 0;
    const categorias = {};
    sugerencias.forEach(function (s) {
      const clave = s.categoria || 'General';
      categorias[clave] = (categorias[clave] || 0) + 1;
    });
    return {
      total: sugerencias.length,
      pendientes: sugerencias.filter(function (s) { return s.estado === 'pendiente'; }).length,
      atendidas: sugerencias.filter(function (s) { return s.estado === 'atendida'; }).length,
      promedio: promedio,
      categorias: Object.keys(categorias).map(function (clave) {
        return { etiqueta: clave, valor: categorias[clave] };
      }).sort(function (a, b) { return b.valor - a.valor; })
    };
  }

  function tiempoPreparacion() {
    const pedidos = validos().filter(function (p) { return p.estado === 'entregado'; });
    const tiempos = [];
    pedidos.forEach(function (pedido) {
      const historial = pedido.historial || [];
      const inicio = historial.find(function (h) { return h.estado === 'recibido'; });
      const listo = historial.find(function (h) { return h.estado === 'listo'; });
      if (inicio && listo) {
        const minutos = window.Util.minutosEntre(inicio.fecha, listo.fecha);
        if (minutos >= 0 && minutos <= 180) tiempos.push(minutos);
      }
    });
    const objetivo = window.Almacen.config().tiempoObjetivo || 8;
    const promedio = tiempos.length
      ? Math.round(tiempos.reduce(function (a, b) { return a + b; }, 0) / tiempos.length)
      : 0;
    const dentro = tiempos.filter(function (t) { return t <= objetivo; }).length;
    return {
      promedio: promedio,
      objetivo: objetivo,
      muestras: tiempos.length,
      cumplimiento: tiempos.length ? Math.round((dentro / tiempos.length) * 100) : 0
    };
  }

  function horasPico() {
    const conteo = {};
    validos().forEach(function (pedido) {
      const hora = new Date(pedido.creadoEn).getHours();
      conteo[hora] = (conteo[hora] || 0) + 1;
    });
    return Object.keys(conteo).map(Number).sort(function (a, b) { return a - b; }).map(function (hora) {
      return { etiqueta: String(hora).padStart(2, '0') + 'h', valor: conteo[hora] };
    });
  }

  function exportarPedidos(desde, hasta) {
    const lista = todos().filter(function (p) { return enFecha(p.creadoEn, desde, hasta); });
    window.Util.csv('cafeya-pedidos-' + window.Util.hoyISO(),
      ['Código', 'Cliente', 'Fecha', 'Hora recojo', 'Productos', 'Subtotal', 'Descuento', 'Total', 'Método', 'Estado pago', 'Estado pedido'],
      lista.map(function (p) {
        return [
          p.codigo, p.clienteNombre, window.Util.fechaHora(p.creadoEn),
          p.horaRecojoTexto || (p.horaRecojo ? window.Util.hora(p.horaRecojo) : '—'),
          (p.items || []).map(function (i) { return i.cantidad + 'x ' + i.nombre; }).join(' | '),
          p.subtotal, p.descuento, p.total, window.Util.metodoPago(p.metodoPago),
          window.Util.etiqueta(p.estadoPago), window.Util.etiqueta(p.estado)
        ];
      }));
    return lista.length;
  }

  function exportarProductos(desde, hasta) {
    const lista = productosMasVendidos(desde, hasta, 100);
    window.Util.csv('cafeya-productos-' + window.Util.hoyISO(),
      ['Producto', 'Unidades vendidas', 'Ingresos'],
      lista.map(function (p) { return [p.etiqueta, p.valor, p.total.toFixed(2)]; }));
    return lista.length;
  }

  function exportarClientes() {
    const lista = clientesFrecuentes(100);
    window.Util.csv('cafeya-clientes-frecuentes-' + window.Util.hoyISO(),
      ['Cliente', 'Correo', 'Compras', 'Tarjetas completadas', 'Beneficios disponibles'],
      lista.map(function (c) { return [c.cliente, c.correo, c.compras, c.tarjetas, c.beneficios]; }));
    return lista.length;
  }

  window.Reportes = {
    COLORES: COLORES,
    validos: validos,
    pagados: pagados,
    enRango: enRango,
    enFecha: enFecha,
    resumen: resumen,
    ventasPorDia: ventasPorDia,
    ventasPorMes: ventasPorMes,
    productosMasVendidos: productosMasVendidos,
    pedidosPorEstado: pedidosPorEstado,
    metodosPago: metodosPago,
    clientesFrecuentes: clientesFrecuentes,
    reservasPorEstado: reservasPorEstado,
    sugerenciasResumen: sugerenciasResumen,
    tiempoPreparacion: tiempoPreparacion,
    horasPico: horasPico,
    exportarPedidos: exportarPedidos,
    exportarProductos: exportarProductos,
    exportarClientes: exportarClientes
  };
})();
