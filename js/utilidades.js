/* ============================================================
   CafeYa Ica - Utilidades generales e interfaz
   ============================================================ */
(function () {
  'use strict';

  const ICONOS = {
    inicio: '<path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
    cafe: '<path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 9h2a3 3 0 0 1 0 6h-2"/><path d="M4 22h14"/>',
    carrito: '<circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M2 3h3l2.6 12.4a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 7H6"/>',
    pedidos: '<path d="M9 3h6l1 3h4v15H4V6h4z"/><path d="M9 12h6M9 16h6"/>',
    reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    mesas: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/>',
    calendario: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/>',
    usuarios: '<circle cx="9" cy="8" r="3.4"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M17 11a3 3 0 1 0 0-6"/><path d="M18 20a5.5 5.5 0 0 0-3-4.9"/>',
    producto: '<path d="M3 7l9-4 9 4-9 4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/>',
    categoria: '<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/>',
    promocion: '<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    pagos: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    inventario: '<path d="M21 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h16v10H5a2 2 0 0 1 0-4"/>',
    sugerencias: '<path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    fidelizacion: '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"/>',
    reportes: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    configuracion: '<circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7.5 19l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.6 13H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 5 6.5l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 11 2.6V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1.3z"/>',
    cocina: '<path d="M4 21h16"/><path d="M6 21v-7h12v7"/><path d="M6 10a6 6 0 0 1 12 0"/><path d="M9 10V8M15 10V8"/>',
    salir: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
    buscar: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    campana: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
    mas: '<path d="M12 5v14M5 12h14"/>',
    editar: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    eliminar: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/><path d="M10 11v5M14 11v5"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    imagen: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
    wifi: '<path d="M5 12.5a10 10 0 0 1 14 0"/><path d="M8.5 16a5.5 5.5 0 0 1 7 0"/><circle cx="12" cy="19.5" r="1"/>',
    enchufe: '<path d="M9 2v6M15 2v6"/><path d="M6 8h12v3a6 6 0 0 1-12 0z"/><path d="M12 17v5"/>',
    ubicacion: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="2.8"/>',
    telefono: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z"/>',
    correo: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 6 10-6"/>',
    qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM20 14v3M17 20h4M14 20h1"/>',
    descargar: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/>',
    filtro: '<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>',
    tarjeta: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    estrella: '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"/>',
    compartir: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4"/>',
    alerta: '<path d="M12 3l9 17H3z"/><path d="M12 9v5M12 17h.01"/>',
    usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    candado: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    cerrar: '<path d="M18 6L6 18M6 6l12 12"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    velocidad: '<path d="M12 21a9 9 0 1 1 9-9"/><path d="M12 12l4-4"/><circle cx="12" cy="12" r="1.4"/>',
    grafico: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    fiesta: '<path d="M3 21l6-14 8 8z"/><path d="M14 4l1 3M18 6l2 2M20 11h3"/>'
  };

  function qs(selector, contexto) { return (contexto || document).querySelector(selector); }
  function qsa(selector, contexto) { return Array.prototype.slice.call((contexto || document).querySelectorAll(selector)); }

  function esc(texto) {
    return String(texto === null || texto === undefined ? '' : texto)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function id(prefijo) { return window.Almacen.generarId(prefijo); }

  function redondear(numero) { return Math.round((Number(numero) || 0) * 100) / 100; }

  function soles(numero) { return 'S/ ' + (Number(numero) || 0).toFixed(2); }

  function numero(valor) { return (Number(valor) || 0).toLocaleString('es-PE'); }

  function fecha(valor) {
    if (!valor) return '—';
    const d = new Date(valor);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function fechaLarga(valor) {
    if (!valor) return '—';
    const d = new Date(valor + (String(valor).length === 10 ? 'T12:00:00' : ''));
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function hora(valor) {
    if (!valor) return '—';
    const d = new Date(valor);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  function fechaHora(valor) { return fecha(valor) + ' · ' + hora(valor); }

  function isoDia(d) {
    const fechaObj = d ? new Date(d) : new Date();
    const ajuste = new Date(fechaObj.getTime() - fechaObj.getTimezoneOffset() * 60000);
    return ajuste.toISOString().slice(0, 10);
  }

  function hoyISO() { return isoDia(new Date()); }

  function sumarDias(fechaISO, dias) {
    const d = new Date(fechaISO + 'T12:00:00');
    d.setDate(d.getDate() + dias);
    return isoDia(d);
  }

  function inputFecha(dias) { return sumarDias(hoyISO(), dias || 0); }

  function codigo(prefijo) {
    const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let salida = '';
    for (let i = 0; i < 5; i++) salida += letras.charAt(Math.floor(Math.random() * letras.length));
    return (prefijo || 'CY') + '-' + salida;
  }

  function cap(texto) {
    const limpio = String(texto || '').replace(/-/g, ' ');
    return limpio.charAt(0).toUpperCase() + limpio.slice(1);
  }

  const ETIQUETAS = {
    recibido: 'Recibido', preparacion: 'En preparación', listo: 'Listo para recoger',
    entregado: 'Entregado', cancelado: 'Cancelado', pendiente: 'Pendiente',
    aprobado: 'Aprobado', rechazado: 'Rechazado', reembolsado: 'Reembolsado',
    confirmada: 'Confirmada', cancelada: 'Cancelada', finalizada: 'Finalizada',
    libre: 'Libre', ocupada: 'Ocupada', reservada: 'Reservada', fuera: 'Fuera de servicio',
    activa: 'Activa', inactiva: 'Inactiva', activo: 'Activo', inactivo: 'Inactivo',
    agotado: 'Agotado', disponible: 'Disponible', atendida: 'Atendida',
    abierta: 'Abierta', cerrada: 'Cerrada', pagado: 'Pagado', aprobada: 'Aprobada',
    yape: 'Yape', plin: 'Plin', tarjeta: 'Tarjeta', efectivo: 'Efectivo',
    recojo: 'Para recoger', mesa: 'Consumo en mesa', delivery: 'Delivery (no disponible)',
    compartida: 'Mesa compartida'
  };

  function etiqueta(estado) { return ETIQUETAS[estado] || cap(estado); }

  function badge(estado, texto) {
    return '<span class="badge badge-' + esc(estado) + '">' + esc(texto || etiqueta(estado)) + '</span>';
  }

  function estrella(calificacion) {
    const n = Math.max(0, Math.min(5, Number(calificacion) || 0));
    let html = '<span style="color:#F2A93B;letter-spacing:1px">';
    for (let i = 1; i <= 5; i++) html += i <= n ? '★' : '<span style="color:#DDE0EA">★</span>';
    return html + '</span>';
  }

  function svg(nombre, clase) {
    return '<svg class="' + (clase || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (ICONOS[nombre] || ICONOS.cafe) + '</svg>';
  }

  function iniciales(nombre) {
    return String(nombre || '?').trim().split(/\s+/).slice(0, 2).map(function (p) { return p.charAt(0); }).join('').toUpperCase();
  }

  function avatar(nombre, clase) {
    return '<div class="avatar ' + (clase || '') + '">' + esc(iniciales(nombre)) + '</div>';
  }

  function placeholder(emoji) {
    const svgTexto = '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#1F2461"/><stop offset="1" stop-color="#00808F"/></linearGradient></defs>' +
      '<rect width="600" height="420" fill="url(#g)"/>' +
      '<circle cx="520" cy="60" r="120" fill="#00A88F" opacity=".18"/>' +
      '<circle cx="80" cy="390" r="90" fill="#B5503C" opacity=".2"/>' +
      '<text x="300" y="255" font-size="150" text-anchor="middle">' + (emoji || '☕') + '</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgTexto);
  }

  function img(producto, clase) {
    const prod = typeof producto === 'string' ? { nombre: 'Producto', emoji: '☕', imagen: producto } : (producto || {});
    const respaldo = placeholder(prod.emoji || '☕');
    const fuente = prod.imagen || respaldo;
    return '<img class="' + (clase || '') + '" src="' + esc(fuente) + '" alt="' + esc(prod.nombre || 'Producto') +
      '" loading="lazy" data-respaldo="' + respaldo + '" onerror="this.onerror=null;this.src=this.dataset.respaldo">';
  }

  function sumar(lista, campo) {
    return (lista || []).reduce(function (total, item) {
      return total + (campo ? (Number(item[campo]) || 0) : (Number(item) || 0));
    }, 0);
  }

  function agrupar(lista, campo) {
    return (lista || []).reduce(function (grupos, item) {
      const clave = typeof campo === 'function' ? campo(item) : item[campo];
      if (!grupos[clave]) grupos[clave] = [];
      grupos[clave].push(item);
      return grupos;
    }, {});
  }

  function debounce(fn, espera) {
    let temporizador;
    return function () {
      const contexto = this;
      const args = arguments;
      clearTimeout(temporizador);
      temporizador = setTimeout(function () { fn.apply(contexto, args); }, espera || 250);
    };
  }

  function barras(datos, opciones) {
    const config = opciones || {};
    const lista = (datos || []).filter(function (d) { return d; });
    if (!lista.length) return vacio('Sin datos', 'Aún no hay información para graficar.');
    const maximo = Math.max.apply(null, lista.map(function (d) { return Number(d.valor) || 0; }).concat([1]));
    return '<div class="grafico" role="img" aria-label="Gráfico de barras">' + lista.map(function (d) {
      const alto = Math.max(3, Math.round(((Number(d.valor) || 0) / maximo) * 100));
      return '<div class="grafico-barra" title="' + esc(d.etiqueta) + ': ' + (config.moneda ? soles(d.valor) : numero(d.valor)) + '">' +
        '<span class="valor">' + (config.moneda ? soles(d.valor) : numero(d.valor)) + '</span>' +
        '<div class="barra" style="height:' + alto + '%"></div>' +
        '<span class="etiqueta">' + esc(d.etiqueta) + '</span></div>';
    }).join('') + '</div>';
  }

  function dona(datos, centro) {
    const lista = (datos || []).filter(function (d) { return Number(d.valor) > 0; });
    if (!lista.length) return vacio('Sin datos', 'Aún no hay información para graficar.');
    const total = sumar(lista, 'valor') || 1;
    let acumulado = 0;
    const segmentos = lista.map(function (d) {
      const inicio = (acumulado / total) * 100;
      acumulado += Number(d.valor) || 0;
      const fin = (acumulado / total) * 100;
      return (d.color || '#00808F') + ' ' + inicio.toFixed(2) + '% ' + fin.toFixed(2) + '%';
    }).join(', ');
    return '<div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap">' +
      '<div class="dona" style="background:conic-gradient(' + segmentos + ')">' +
      '<div class="dona-centro"><div><strong>' + (centro !== undefined ? centro : numero(total)) + '</strong>Total</div></div></div>' +
      '<div style="display:flex;flex-direction:column;gap:9px;font-size:12.5px;color:#555">' +
      lista.map(function (d) {
        const pct = Math.round(((Number(d.valor) || 0) / total) * 100);
        return '<div><i style="display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:8px;background:' +
          (d.color || '#00808F') + '"></i>' + esc(d.etiqueta) + ' <strong style="color:#1F2461">' + pct + '%</strong></div>';
      }).join('') + '</div></div>';
  }

  function vacio(titulo, texto, boton) {
    return '<div class="vacio"><div class="vacio-icono">' + svg('cafe') + '</div>' +
      '<h3>' + esc(titulo) + '</h3><p>' + esc(texto || '') + '</p>' + (boton || '') + '</div>';
  }

  function descargar(nombre, contenido, mime) {
    const blob = new Blob([contenido], { type: mime || 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombre;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  function csv(nombre, encabezados, filas) {
    function celda(valor) { return '"' + String(valor === null || valor === undefined ? '' : valor).replace(/"/g, '""') + '"'; }
    const lineas = [encabezados.map(celda).join(';')];
    (filas || []).forEach(function (fila) { lineas.push(fila.map(celda).join(';')); });
    const archivo = nombre.indexOf('.csv') > -1 ? nombre : nombre + '.csv';
    descargar(archivo, '\uFEFF' + lineas.join('\r\n'), 'text/csv;charset=utf-8;');
    if (window.Notificaciones) window.Notificaciones.exito('Exportación lista', 'Se descargó ' + archivo);
  }

  function slots(desde, hasta) {
    const inicio = desde || (window.Almacen.config().horario || {}).apertura || '08:00';
    const fin = hasta || (window.Almacen.config().horario || {}).cierre || '22:00';
    const h1 = parseInt(inicio.split(':')[0], 10);
    const h2 = parseInt(fin.split(':')[0], 10);
    const lista = [];
    for (let h = h1; h < h2; h++) lista.push((h < 10 ? '0' : '') + h + ':00');
    return lista;
  }

  function toast(titulo, mensaje, tipo) {
    if (window.Notificaciones) return window.Notificaciones.mostrar(titulo, mensaje, tipo);
    console.log('[CafeYa]', titulo, mensaje);
  }

  function confirmar(opciones) {
    if (window.Modal) return window.Modal.confirmar(opciones);
    return Promise.resolve(window.confirm((opciones && opciones.mensaje) || '¿Confirmar acción?'));
  }

  function metodoPago(nombre) {
    const mapa = { yape: 'Yape', plin: 'Plin', tarjeta: 'Tarjeta', efectivo: 'Efectivo' };
    return mapa[nombre] || cap(nombre);
  }

  function tiempoRelativo(valor) {
    if (!valor) return '—';
    const diferencia = Date.now() - new Date(valor).getTime();
    const minutos = Math.round(diferencia / 60000);
    if (minutos < 1) return 'hace un momento';
    if (minutos < 60) return 'hace ' + minutos + ' min';
    const horas = Math.round(minutos / 60);
    if (horas < 24) return 'hace ' + horas + ' h';
    return 'hace ' + Math.round(horas / 24) + ' días';
  }

  function hoyTexto() {
    return new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  function minutosEntre(inicio, fin) {
    if (!inicio || !fin) return 0;
    return Math.max(0, Math.round((new Date(fin).getTime() - new Date(inicio).getTime()) / 60000));
  }

  function horarioAbierto() {
    const config = window.Almacen.config();
    const horario = config.horario || { apertura: '08:00', cierre: '22:00' };
    const ahora = new Date();
    const minutos = ahora.getHours() * 60 + ahora.getMinutes();
    const partesA = horario.apertura.split(':');
    const partesC = horario.cierre.split(':');
    return minutos >= (parseInt(partesA[0], 10) * 60 + parseInt(partesA[1], 10)) &&
      minutos <= (parseInt(partesC[0], 10) * 60 + parseInt(partesC[1], 10));
  }

  window.Util = {
    qs: qs, qsa: qsa, esc: esc, id: id, redondear: redondear, soles: soles, numero: numero,
    fecha: fecha, fechaLarga: fechaLarga, hora: hora, fechaHora: fechaHora, isoDia: isoDia,
    hoyISO: hoyISO, sumarDias: sumarDias, inputFecha: inputFecha, codigo: codigo, cap: cap,
    etiqueta: etiqueta, badge: badge, estrella: estrella, svg: svg, avatar: avatar,
    iniciales: iniciales, placeholder: placeholder, img: img, sumar: sumar, agrupar: agrupar,
    debounce: debounce, barras: barras, dona: dona, vacio: vacio, descargar: descargar, csv: csv,
    slots: slots, toast: toast, confirmar: confirmar, metodoPago: metodoPago,
    tiempoRelativo: tiempoRelativo, hoyTexto: hoyTexto, minutosEntre: minutosEntre,
    horarioAbierto: horarioAbierto
  };
})();
