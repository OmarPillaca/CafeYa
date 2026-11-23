/* ============================================================
   CafeYa Ica - Utilidades compartidas del panel administrativo
   ============================================================ */
(function () {
  'use strict';

  function montar(opciones) {
    const o = opciones || {};
    const contenedor = window.Shell.admin({
      pagina: o.pagina,
      titulo: o.titulo,
      subtitulo: o.subtitulo
    });
    if (!contenedor) return null;
    if (o.html) contenedor.innerHTML = o.html;
    if (typeof o.alMontar === 'function') o.alMontar(contenedor);
    return contenedor;
  }

  function tabla(config) {
    const columnas = config.columnas || [];
    const datos = config.datos || [];
    if (!datos.length) {
      return '<div class="tabla-wrap"><div class="tabla-vacia">' + window.Util.svg('cafe') +
        '<h3 style="margin:10px 0 4px;font-size:15px">' + window.Util.esc(config.vacioTitulo || 'Sin registros') + '</h3>' +
        '<p class="small" style="margin:0">' + window.Util.esc(config.vacioTexto || 'Ajusta los filtros o registra nueva información.') + '</p></div></div>';
    }
    const cabecera = columnas.map(function (c) {
      return '<th' + (c.clase ? ' class="' + c.clase + '"' : '') + '>' + window.Util.esc(c.titulo) + '</th>';
    }).join('');
    const filas = datos.map(function (dato, indice) {
      return '<tr>' + columnas.map(function (c) {
        let valor;
        if (typeof c.render === 'function') valor = c.render(dato, indice);
        else if (c.campo) valor = window.Util.esc(dato[c.campo]);
        else valor = '';
        return '<td' + (c.clase ? ' class="' + c.clase + '"' : '') + '>' +
          (valor === undefined || valor === null || valor === '' ? '—' : valor) + '</td>';
      }).join('') + '</tr>';
    }).join('');
    return '<div class="tabla-wrap"><table class="tabla"><thead><tr>' + cabecera + '</tr></thead><tbody>' + filas + '</tbody></table>' +
      '<div class="tabla-pie"><span>Mostrando <strong>' + datos.length + '</strong> registro(s)</span>' +
      '<span>' + window.Util.esc(config.pieTexto || 'Datos del sistema en tiempo real') + '</span></div></div>';
  }

  function opciones(lista, campoValor, campoTexto, seleccionado, textoVacio) {
    const inicial = textoVacio ? '<option value="">' + window.Util.esc(textoVacio) + '</option>' : '';
    return inicial + (lista || []).map(function (item) {
      const valor = typeof campoValor === 'function' ? campoValor(item) : item[campoValor];
      const texto = typeof campoTexto === 'function' ? campoTexto(item) : item[campoTexto];
      const marcado = String(valor) === String(seleccionado) ? ' selected' : '';
      return '<option value="' + window.Util.esc(valor) + '"' + marcado + '>' + window.Util.esc(texto) + '</option>';
    }).join('');
  }

  function filtrar(datos, texto, campos) {
    const busqueda = String(texto || '').trim().toLowerCase();
    if (!busqueda) return datos;
    return (datos || []).filter(function (dato) {
      return (campos || []).some(function (campo) {
        return String(dato[campo] === undefined ? '' : dato[campo]).toLowerCase().indexOf(busqueda) > -1;
      });
    });
  }

  function confirmar(mensaje, titulo, textoOk) {
    return window.Modal.confirmar({
      titulo: titulo || 'Confirmar acción',
      mensaje: mensaje,
      peligro: true,
      textoOk: textoOk || 'Sí, continuar'
    });
  }

  function persona(nombre, detalle, clase) {
    return '<div class="celda-persona">' + window.Util.avatar(nombre, clase || '') +
      '<div><strong>' + window.Util.esc(nombre) + '</strong>' +
      (detalle ? '<small>' + window.Util.esc(detalle) + '</small>' : '') + '</div></div>';
  }

  function producto(productoObj) {
    return '<div class="celda-producto">' + window.Util.img(productoObj) +
      '<div><strong>' + window.Util.esc(productoObj.nombre) + '</strong>' +
      '<small>' + window.Util.esc(productoObj.categoriaId ? (window.Almacen.buscar('categorias', productoObj.categoriaId) || {}).nombre || '' : '') + '</small></div></div>';
  }

  function accion(texto, atributo, clase, icono) {
    return '<button type="button" class="btn btn-sm ' + (clase || 'btn-claro') + '" ' + atributo + '>' +
      (icono ? window.Util.svg(icono) : '') + texto + '</button>';
  }

  function stat(valor, etiqueta, icono, color) {
    return '<div class="stat ' + (color || '') + '"><div class="stat-icono">' + window.Util.svg(icono) + '</div>' +
      '<div class="stat-valor">' + valor + '</div><div class="stat-etiqueta">' + window.Util.esc(etiqueta) + '</div></div>';
  }

  window.AdminUI = {
    montar: montar,
    tabla: tabla,
    opciones: opciones,
    filtrar: filtrar,
    confirmar: confirmar,
    persona: persona,
    producto: producto,
    accion: accion,
    stat: stat
  };
})();
